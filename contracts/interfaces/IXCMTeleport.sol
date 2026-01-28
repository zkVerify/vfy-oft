// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IXCMTeleport {
    function teleportToRelayChain(bytes32 _receiver, uint256 _amountLD) external;
    function deliveryFee(bytes32 _receiver, uint256 _amountLD) external returns (uint256);
}
