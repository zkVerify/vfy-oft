// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { VfyNativeOFTAdapter } from "../VfyNativeOFTAdapter.sol";

// @dev WARNING: This is for testing purposes only
contract VfyNativeOFTAdapterMock is VfyNativeOFTAdapter {
    constructor(
        uint8 _localDecimals,
        address _lzEndpoint,
        address _delegate
    ) VfyNativeOFTAdapter(_localDecimals, _lzEndpoint, _delegate) {}

    function removeDust(uint256 _amountLD) public view returns (uint256 amountLD) {
        return _removeDust(_amountLD);
    }
}
