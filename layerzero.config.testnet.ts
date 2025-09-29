import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

/**
 *  WARNING: ONLY 1 ZkVerifyOFTAdapter should exist for a given global mesh.
 */
const zkVerifyTestnetContract: OmniPointHardhat = {
    eid: EndpointId.ZKVERIFY_V2_TESTNET,
    contractName: 'ZkVerifyOFTAdapter',
}

const baseTestnetContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'ZkVerifyToken',
}

const bscTestnetContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_TESTNET,
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
            zkVerifyTestnetContract,
            bscTestnetContract,
            [['Horizen'], [['LayerZero Labs'], 1]],
            [6, 3],
            [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [
            zkVerifyTestnetContract,
            baseTestnetContract,
            [['Horizen'], [['LayerZero Labs'], 1]],
            [6, 3],
            [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [
            baseTestnetContract,
            bscTestnetContract,
            [['Horizen'], [['LayerZero Labs'], 1]],
            [3, 3],
            [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
    ])

    return {
        contracts: [
            {
                contract: zkVerifyTestnetContract,
                config: {
                    delegate: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                    owner: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                },
            },
            {
                contract: baseTestnetContract,
                config: {
                    delegate: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                    owner: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                },
            },
            {
                contract: bscTestnetContract,
                config: {
                    delegate: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                    owner: '0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5',
                },
            },
        ],
        connections,
    }
}
