// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";

import { IXCMTeleport } from "./interfaces/IXCMTeleport.sol";

/**
 * @notice The message expected by the Composer.
 */
struct ComposerMessage {
    bytes32 receiver;
    uint256 deliveryFeeLimit;
}

/**
 * @title XCMTeleportComposer
 * @notice Demonstrates the minimum `IOAppComposer` interface necessary to receive composed messages via LayerZero.
 * @dev Implements the `lzCompose` function to process incoming composed messages.
 */
contract XCMTeleportComposer is IOAppComposer {
    /**
     * @notice Address of the LayerZero Endpoint.
     */
    address public immutable endpoint;

    /**
     * @notice Address of the OFT contract that is sending the composed message.
     */
    address public immutable oft;

    /**
     * @notice Address of the XCM teleport precompile.
     */
    IXCMTeleport public immutable xcmTeleportPrecompile;

    /**
     * @notice Constructs the contract and initializes state variables.
     * @dev Stores the LayerZero Endpoint and OApp addresses.
     *
     * @param _endpoint The address of the LayerZero Endpoint.
     * @param _oft The address of the OFT contract that is sending composed messages.
     * @param _xcmTeleportPrecompile The address of the XCM teleport precompile contract.
     */
    constructor(address _endpoint, address _oft, address _xcmTeleportPrecompile) {
        endpoint = _endpoint;
        oft = _oft;
        xcmTeleportPrecompile = IXCMTeleport(_xcmTeleportPrecompile);
    }

    receive() external payable {
        require(msg.sender == oft, "XCMTeleportComposer: Does not accept ether");
    }

    /**
     * @notice Handles incoming composed messages from LayerZero.
     * @dev Ensures the message comes from the correct OApp and is sent through the authorized endpoint.
     *
     * @param _oft The address of the OFT contract that is sending the composed message.
     */
    function lzCompose(
        address _oft,
        bytes32, //_guid
        bytes calldata _message,
        address, //_executor
        bytes calldata //_extraData
    ) external payable override {
        // Ensure the composed message comes from the correct OApp.
        require(_oft == oft, "XCMTeleportComposer: Invalid OApp");
        require(msg.sender == endpoint, "XCMTeleportComposer: Unauthorized sender");

        // Decode the amount in local decimals being transferred.
        uint256 _amountLD = OFTComposeMsgCodec.amountLD(_message);

        // Decode the actual `composeMsg` payload.
        bytes memory _actualComposeMsg = OFTComposeMsgCodec.composeMsg(_message);
        ComposerMessage memory _composerMessage = abi.decode(_actualComposeMsg, (ComposerMessage));
        bytes32 _receiver = _composerMessage.receiver;
        uint256 _deliveryFeeLimit = _composerMessage.deliveryFeeLimit;

        // Call the XCM precompile to get the XCM delivery fee.
        uint256 _deliveryFee = xcmTeleportPrecompile.deliveryFee(_receiver, _amountLD + msg.value);
        require(_deliveryFee <= _deliveryFeeLimit + msg.value, "XCMTeleportComposer: XCM fee limit exceeded");

        // Call the XCM precompile to execute the teleport.
        xcmTeleportPrecompile.teleportToRelayChain(_receiver, _amountLD + msg.value - _deliveryFee);
    }
}
