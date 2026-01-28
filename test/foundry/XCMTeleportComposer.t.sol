// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

// Mock imports
import { ZkVerifyOFTAdapterMock } from "../../contracts/mocks/ZkVerifyOFTAdapterMock.sol";
import { ZkVerifyTokenMock } from "../../contracts/mocks/ZkVerifyTokenMock.sol";
import { XCMTeleportPrecompileMock } from "../../contracts/mocks/XCMTeleportPrecompileMock.sol";

// Contract imports
import { XCMTeleportComposer } from "../../contracts/XCMTeleportComposer.sol";

// OApp imports
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

// OFT imports
import { SendParam, OFTReceipt } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { MessagingFee, MessagingReceipt } from "@layerzerolabs/oft-evm/contracts/OFTCore.sol";
import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";

// Forge imports
import "forge-std/console.sol";

// DevTools imports
import { TestHelperOz5 } from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";

contract XCMTeleportComposerTest is TestHelperOz5 {
    using OptionsBuilder for bytes;

    ZkVerifyOFTAdapterMock private nativeOFTAdapter;
    ZkVerifyTokenMock private extOFT;
    XCMTeleportPrecompileMock private xcmTeleportPrecompileMock;
    XCMTeleportComposer private xcmTeleportComposer;

    uint32 private constant vflowEid = 1;
    uint32 private constant extEid = 2;
    address private constant userA = address(0x1);
    address private constant userB = address(0x2);
    uint256 private constant initialNativeBalance = 1000 ether;

    function setUp() public virtual override {
        vm.deal(userA, initialNativeBalance);
        vm.deal(userB, initialNativeBalance);

        super.setUp();
        setUpEndpoints(2, LibraryType.UltraLightNode);

        nativeOFTAdapter = ZkVerifyOFTAdapterMock(
            _deployOApp(
                type(ZkVerifyOFTAdapterMock).creationCode,
                abi.encode(18, address(endpoints[vflowEid]), address(this))
            )
        );

        extOFT = ZkVerifyTokenMock(
            _deployOApp(
                type(ZkVerifyTokenMock).creationCode,
                abi.encode("Token", "TKN", address(endpoints[extEid]), address(this))
            )
        );

        xcmTeleportPrecompileMock = new XCMTeleportPrecompileMock();

        xcmTeleportComposer = new XCMTeleportComposer(
            address(endpoints[vflowEid]),
            address(nativeOFTAdapter),
            address(xcmTeleportPrecompileMock)
        );

        // config and wire
        address[] memory ofts = new address[](2);
        ofts[0] = address(nativeOFTAdapter);
        ofts[1] = address(extOFT);
        this.wireOApps(ofts);

        bridge_from_vflow_to_ext(userA, userB, 100 ether);
    }

    function bridge_from_vflow_to_ext(address from, address to, uint256 tokensToSend) public {
        bytes memory options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(200000, 0);
        SendParam memory sendParam = SendParam(
            extEid,
            addressToBytes32(to),
            tokensToSend,
            tokensToSend,
            options,
            "",
            ""
        );
        MessagingFee memory fee = nativeOFTAdapter.quoteSend(sendParam, false);

        vm.prank(from);
        nativeOFTAdapter.send{ value: fee.nativeFee + tokensToSend }(sendParam, fee, payable(address(this)));
        verifyPackets(extEid, addressToBytes32(address(extOFT)));
    }

    function test_send_native_oft_adapter_compose_msg() public {
        bytes memory options = OptionsBuilder
            .newOptions()
            .addExecutorLzReceiveOption(100_000, 0)
            .addExecutorLzComposeOption(0, 100_000, 0);
        bytes32 receiver = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        uint256 maxFee = 1 ether;
        bytes memory composeMsg = abi.encode(receiver, maxFee);
        SendParam memory sendParam = SendParam(
            vflowEid,
            addressToBytes32(address(xcmTeleportComposer)),
            1 ether,
            1 ether,
            options,
            composeMsg,
            ""
        );
        MessagingFee memory fee = extOFT.quoteSend(sendParam, false);

        assertEq(userB.balance, initialNativeBalance);
        assertEq(extOFT.balanceOf(userB), 100 ether);
        assertEq(address(xcmTeleportComposer).balance, 0 ether);

        vm.prank(userB);
        (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt) = extOFT.send{ value: fee.nativeFee }(
            sendParam,
            fee,
            payable(address(this))
        );
        verifyPackets(vflowEid, addressToBytes32(address(nativeOFTAdapter)));

        // lzCompose params
        bytes memory composerMsg_ = OFTComposeMsgCodec.encode(
            msgReceipt.nonce,
            extEid,
            oftReceipt.amountReceivedLD,
            abi.encodePacked(addressToBytes32(userB), composeMsg)
        );
        this.lzCompose(
            vflowEid,
            address(nativeOFTAdapter),
            options,
            msgReceipt.guid,
            address(xcmTeleportComposer),
            composerMsg_
        );

        assertEq(userB.balance, initialNativeBalance - fee.nativeFee);
        assertEq(extOFT.balanceOf(userB), 99 ether);
        assertEq(address(xcmTeleportComposer).balance, 1 ether);
        assertEq(xcmTeleportPrecompileMock.receiver(), receiver);
        assertEq(xcmTeleportPrecompileMock.amountLD(), 1 ether);
    }
}
