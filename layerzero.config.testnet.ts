import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

/**
 *  WARNING: ONLY 1 VfyNativeOFTAdapter should exist for a given global mesh.
 */
const zkVerifyTestnetContract: OmniPointHardhat = {
    eid: EndpointId.ZKVERIFY_V2_TESTNET,
    contractName: 'VfyNativeOFTAdapter',
}

const baseTestnetContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'VfyOFT',
}

const bscTestnetContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_TESTNET,
    contractName: 'VfyOFT',
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
            { contract: zkVerifyTestnetContract },
            { contract: baseTestnetContract },
            { contract: bscTestnetContract },
        ],
        connections,
    }
}
