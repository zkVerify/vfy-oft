import { task } from 'hardhat/config'
import { ethers } from 'ethers'
import { HttpNetworkConfig } from 'hardhat/types'
import inquirer from 'inquirer'
import { Options } from '@layerzerolabs/lz-v2-utilities'

import { contracts } from '../generated/index'

task('bridge', 'Bridge tokens between chains')
    .addParam('from', 'Source chain name')
    .addParam('to', 'Destination chain name')
    .addParam('amount', 'Amount to bridge (human readable format)')
    .addOptionalParam('receiver', 'Receiver address (defaults to sender)')
    .setAction(async (taskArgs, hre) => {
        type SupportedChains = keyof (typeof contracts.VfyOFT.addresses &
            typeof contracts.VfyNativeOFTAdapter.addresses)
        const from = taskArgs.from as SupportedChains
        checkValidChain(from)
        const to = taskArgs.to as SupportedChains
        checkValidChain(to)
        const amount = ethers.utils.parseEther(taskArgs.amount)
        let receiver: string | undefined = taskArgs.receiver ? String(taskArgs.receiver) : undefined

        // Prompt user for wallet input method
        const { method } = await inquirer.prompt([
            {
                type: 'list',
                name: 'method',
                message: 'How would you like to provide credentials?',
                choices: ['Mnemonic', 'Private Key'],
            },
        ])

        // Prompt for sensitive value securely
        const { secret } = await inquirer.prompt([
            {
                type: 'password',
                name: 'secret',
                message: `Enter your ${method}:`,
                mask: '*',
            },
        ])

        let wallet
        if (method === 'Mnemonic') {
            wallet = ethers.Wallet.fromMnemonic(secret)
        } else {
            wallet = new ethers.Wallet(secret)
        }

        // Connect wallet to provider
        const config = hre.config.networks[from] as HttpNetworkConfig
        const provider = new ethers.providers.JsonRpcProvider(config.url)
        wallet = wallet.connect(provider)

        // Default receiver to sender if not provided
        receiver = receiver ?? wallet.address

        console.log('Bridging tokens...')
        console.log(`  From: ${from}`)
        console.log(`  To: ${to}`)
        console.log(`  Amount: ${ethers.utils.formatEther(amount)}`)
        console.log(`  Sender: ${wallet.address}`)
        console.log(`  Receiver: ${receiver}`)

        let contract
        if (from === 'zkverify-testnet') {
            const contractAddress = contracts.VfyNativeOFTAdapter.addresses['zkverify-testnet']
            const contractAbi = contracts.VfyNativeOFTAdapter.abis['zkverify-testnet']
            contract = new ethers.Contract(contractAddress, contractAbi, wallet)
        } else {
            const castFrom = from as keyof typeof contracts.VfyOFT.addresses
            const contractAddress = contracts.VfyOFT.addresses[castFrom]
            const contractAbi = contracts.VfyOFT.abis[castFrom]
            contract = new ethers.Contract(contractAddress, contractAbi, wallet)
        }

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
        const eid = hre.config.networks[to].eid
        const sendParam = [eid, ethers.utils.zeroPad(receiver, 32), amount, amount, options, '0x', '0x']

        // Fetching the native fee for the token send operation
        const [nativeFee] = await contract.quoteSend(sendParam, false)

        let msgValue = nativeFee
        if (from === 'zkverify-testnet') {
            msgValue = msgValue.add(amount)
        }

        // Submitting the send operation tx
        try {
            const tx = await contract.send(sendParam, [nativeFee, 0], wallet.address, {
                value: msgValue,
                gasLimit: 1000000,
            })
            const receipt = await tx.wait()
            console.log(`Transaction successfully submitted, tx hash: ${receipt.transactionHash}`)
        } catch (error) {
            console.error('Error sending transaction:', error)
        }
    })

function checkValidChain(chain) {
    if (!(chain in contracts.VfyOFT.addresses) && !(chain in contracts.VfyNativeOFTAdapter.addresses)) {
        console.error(`Invalid chain: ${chain}`)
        console.error(
            'Supported chains are:',
            Object.keys(contracts.VfyNativeOFTAdapter.addresses).concat(Object.keys(contracts.VfyOFT.addresses))
        )
        process.exit(1)
    }
}
