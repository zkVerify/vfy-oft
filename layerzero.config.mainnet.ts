import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

/**
 *  WARNING: ONLY 1 ZkVerifyOFTAdapter should exist for a given global mesh.
 */
const zkVerifyContract: OmniPointHardhat = {
    eid: EndpointId.ZKVERIFY_V2_MAINNET,
    contractName: 'ZkVerifyOFTAdapter',
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: 'ZkVerifyToken',
}

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 110_000,
        value: 0,
    },
    {
        msgType: 2,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 110_000,
        value: 0,
    },
    {
        msgType: 2,
        optionType: ExecutorOptionType.COMPOSE,
        index: 0,
        gas: 110_000,
        value: 0,
    },
]

export default async function () {
    const connections = await generateConnectionsConfig([
        [
            zkVerifyContract,
            baseContract,
            [['Horizen'], [['LayerZero Labs'], 1]],
            [6, 3],
            [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
    ])

    return {
        contracts: [
            {
                contract: zkVerifyContract,
                config: {
                    delegate: '0xF7Db1A1Dfb47796F9FD0DB13Ada743054c7B02B4',
                    owner: '0xF7Db1A1Dfb47796F9FD0DB13Ada743054c7B02B4',
                },
            },
            {
                contract: baseContract,
                config: {
                    delegate: '0x4599ECB720dAfa588825084EC9F5c1D699Ccc57f',
                    owner: '0x4599ECB720dAfa588825084EC9F5c1D699Ccc57f',
                },
            },
        ],
        connections,
    }
}
