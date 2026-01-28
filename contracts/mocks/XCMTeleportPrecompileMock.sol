// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IXCMTeleport } from "../interfaces/IXCMTeleport.sol";

// @dev WARNING: This is for testing purposes only
contract XCMTeleportPrecompileMock is IXCMTeleport {
    bytes32 public receiver;
    uint256 public amountLD;
    uint256 public currentDeliveryFee;

    function teleportToRelayChain(bytes32 _receiver, uint256 _amountLD) external override {
        receiver = _receiver;
        amountLD = _amountLD;
    }

    function deliveryFee(bytes32 _receiver, uint256 _amountLD) external override returns (uint256) {
        receiver = _receiver;
        amountLD = _amountLD;
        return currentDeliveryFee;
    }

    function setDeliveryFee(uint256 _deliveryFee) external {
        currentDeliveryFee = _deliveryFee;
    }
}
