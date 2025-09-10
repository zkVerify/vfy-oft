import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

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

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: zkVerifyTestnetContract,
        },
        {
            contract: baseTestnetContract,
        },
    ],
    connections: [
        {
            from: zkVerifyTestnetContract,
            to: baseTestnetContract,
        },
        {
            from: baseTestnetContract,
            to: zkVerifyTestnetContract,
        },
    ],
}

export default config
