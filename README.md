<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="width: 400px" src="https://docs.layerzero.network/img/LayerZero_Logo_White.svg"/>
  </a>
</p>

<p align="center">
  <a href="https://layerzero.network" style="color: #a77dff">Homepage</a> | <a href="https://docs.layerzero.network/" style="color: #a77dff">Docs</a> | <a href="https://layerzero.network/developers" style="color: #a77dff">Developers</a>
</p>

<h1 align="center">NativeOFTAdapter Example</h1>

<p align="center">
  <a href="https://docs.layerzero.network/v2/developers/evm/oft/adapter" style="color: #a77dff">Quickstart</a> | <a href="https://docs.layerzero.network/contracts/oapp-configuration" style="color: #a77dff">Configuration</a> | <a href="https://docs.layerzero.network/contracts/options" style="color: #a77dff">Message Execution Options</a> | <a href="https://docs.layerzero.network/contracts/endpoint-addresses" style="color: #a77dff">Endpoint Addresses</a>
</p>

<p align="center">Template project for getting started with LayerZero's <code>NativeOFTAdapter</code> contract development.</p>

## 0) Note

The following instruction are the ones included in the ofiicial `NativeOFTAdapter` example. For more complete instructions on configuring the chains, and deploying and wiring the contracts, please refer to the more complete [`OFTAdapter` example](https://github.com/LayerZero-Labs/devtools/blob/main/examples/oft-adapter/README.md).

## 1) Developing Contracts

#### Installing dependencies

We recommend using `pnpm` as a package manager (but you can of course use a package manager of your choice):

```bash
pnpm install
```

#### Compiling your contracts

This project supports both `hardhat` and `forge` compilation. By default, the `compile` command will execute both:

```bash
pnpm compile
```

If you prefer one over the other, you can use the tooling-specific commands:

```bash
pnpm compile:forge
pnpm compile:hardhat
```

Or adjust the `package.json` to for example remove `forge` build:

```diff
- "compile": "$npm_execpath run compile:forge && $npm_execpath run compile:hardhat",
- "compile:forge": "forge build",
- "compile:hardhat": "hardhat compile",
+ "compile": "hardhat compile"
```

#### Running tests

Similarly to the contract compilation, we support both `hardhat` and `forge` tests. By default, the `test` command will execute both:

```bash
pnpm test
```

If you prefer one over the other, you can use the tooling-specific commands:

```bash
pnpm test:forge
pnpm test:hardhat
```

Or adjust the `package.json` to for example remove `hardhat` tests:

```diff
- "test": "$npm_execpath test:forge && $npm_execpath test:hardhat",
- "test:forge": "forge test",
- "test:hardhat": "$npm_execpath hardhat test"
+ "test": "forge test"
```

## 2) Deploying Contracts

Set up deployer wallet/account:

- Rename `.env.example` -> `.env`
- Choose your preferred means of setting up your deployer wallet/account:

```
MNEMONIC="test test test test test test test test test test test junk"
or...
PRIVATE_KEY="0xabc...def"
```

- Fund this address with the corresponding chain's native tokens you want to deploy to.

To deploy your contracts to your desired blockchains, run the following command in your project's folder:

```bash
npx hardhat lz:deploy
```

More information about available CLI arguments can be found using the `--help` flag:

```bash
npx hardhat lz:deploy --help
```

## 3) Wire

```bash
npx hardhat lz:oapp:wire --oapp-config <LZOAPP_CONFIG_FILE>
```

where `LZOAPP_CONFIG_FILE` is `layerzero.config.testnet.ts` or `layerzero.config.mainnet.ts`, respectively for testnet or mainnet.

## 4) Send

```bash
npx hardhat lz:oft:send --oapp-config <LZOAPP_CONFIG_FILE> --amount <HR_AMOUNT> --src-eid <SRC_EID> --to <EVM_RECIPIENT> --dst-eid <DST_EID>
```

where:

- `LZOAPP_CONFIG_FILE` is `layerzero.config.testnet.ts` or `layerzero.config.mainnet.ts`, respectively for testnet or mainnet.
- `HR_AMOUNT` is the amount to be sent, in human readable format (e.g. `1.75`)

Upon a successful send, the script will provide you with the link to the message on LayerZero Scan.

Once the message is delivered, you will be able to click on the destination transaction hash to verify that the OFT was sent.

## Contract Verification

You can verify EVM chain contracts using the LayerZero helper package:

```bash
pnpm dlx @layerzerolabs/verify-contract -n <NETWORK_NAME> -u <API_URL> -k <API_KEY> --contracts <CONTRACT_NAME>
```
