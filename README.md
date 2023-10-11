<a name="readme-top"></a>




<!-- PROJECT SHIELDS -->
<!--
*** We use markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Tela][tela-shield]][tela-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![AGPL V3 License][license-shield]][license-url]




<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/sj-piano/ethereum-smart-contract-project-template-typescript">
    <img src="images/glider_600x480.png" alt="Logo" width="300" height="240">
  </a>
  <h3 align="center">Ethereum smart contract toolset</h3>
</div>




<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#project-summary">Project Summary</a>
      <ul>
        <li><a href="#toolset">Toolset</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#initial-setup">Initial Setup</a></li>
        <li><a href="#managing-money">Managing Money</a></li>
        <li><a href="#choose-tool">Choose Tool</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#notes">Notes</a></li>
        <li><a href="#fee-limit-protections">Fee Limit Protections</a></li>
        <li><a href="#contract-publication">Contract Publication</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>




<!-- PROJECT SUMMARY -->
## Project Summary

**Description:**

A collection of useful smart contracts, components, and management tools, written in Solidity and Typescript.

**Features:**
* Can estimate all fees in ETH and USD before any actual transactions are sent
* Includes Hardhat test suites
* Can deploy to a local Hardhat blockchain instance, Sepolia testnet, and Ethereum mainnet

**Licensing:**
* AGPL v3 software license
* Licensed for personal use
* Licensed for commercial use, if and only if all derivative source code is made public
* A private commercial software license is available for purchase - this removes the obligation for your company to publish any derived source code

**If you would like to:**
* ask a question
* report a bug
* ask for an addition to the README
* request a feature
* get a private commercial software license
* make a complaint
* hire me

Then [please contact me on Tela](https://www.tela.app/magic/stjohn_piano/ea344e). Thank you.

[![Tela][tela-shield]][tela-url]

If you would like to add me as a professional contact, you can [send me a connection request on LinkedIn](https://www.linkedin.com/in/stjohnpiano):

[![LinkedIn][linkedin-shield]][linkedin-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Toolset


*Important*: Please proceed through the <a href="#getting-started">Getting Started</a> section before trying to use a tool. When you are ready, return here to choose a tool and switch to its README.


List of tools:


* **Hello World** - [Open README](docs/hello-world/README.md)

A basic storage contract, which stores a message. The message can be updated.


* **Upgradeable Smart Contract** (UUPS Pattern) - [Open README](docs/upgradeable-uups-README.md)

This is a contract whose code can be upgraded. It uses the Universal Upgradeable Proxy Standard (UUPS) pattern, published in [ERC-1822](https://eips.ethereum.org/EIPS/eip-1822).




<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Built With


**Platforms & languages:**
- [Ethereum](https://ethereum.org/en) & [Solidity](https://soliditylang.org)
- [NodeJS](https://nodejs.org/en) & [Typescript](https://www.typescriptlang.org)

**Technologies & libraries:**
- Task management: [`task`](https://taskfile.dev/)
- NodeJS manager: [`nvm`](https://github.com/nvm-sh/nvm)
- Ethereum library: [`ethers`](https://docs.ethers.org/v6)
- Ethereum development environment: [`hardhat`](https://hardhat.org)
- Decimal arithmetic: [`big.ts`](https://mikemcl.github.io/big.ts)
- Test assertion: [`chai`](https://www.chaijs.com)
- Typescript formatter: [`prettier`](https://prettier.io)
- Typescript linter: [`eslint`](https://eslint.org)
- CLI interface: [`commander`](https://github.com/tj/commander.ts)
- Logging: [`winston`](https://github.com/winstonjs/winston)
- Data validation: [`joi`](https://github.com/hapijs/joi)
- JSON validation: [`ajv`](https://ajv.ts.org)

**Plugins:**
- [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier): Turns off all ESLint rules that have the potential to interfere with Prettier rules.
- [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier): Turns Prettier rules into ESLint rules.

Private keys are stored in a `user-config.env` file.


<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- GETTING STARTED -->
## Getting Started


Follow these steps to set up a local instance of the toolset. Afterwards, you can browse to the README for a specific tool.


### Prerequisites

Please create accounts and API keys at:
* [Etherscan](https://etherscan.io)
* [Infura](https://www.infura.io)

Please install:

* task: [guide](https://taskfile.dev/installation)
* nvm (Node Version Manager): [guide](https://github.com/nvm-sh/nvm#install--update-script)
* npm & NodeJS: [nvm-based guide](https://github.com/nvm-sh/nvm#usage)
* Metamask wallet (browser extension): [metamask.io](https://metamask.io)

Tested with these versions:
* task: 3.28.0
* nvm: 0.39.5
* npm: 9.5.1
* NodeJS: 18.16.0

Notes:
* Use `nvm` to install `npm` and NodeJS.
* The Etherscan API key is used if you want to upload a contract to Etherscan when using [Hardhat verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify). Hardhat verify is included in Hardhat toolbox (a dependency of this project).


### Installation

Clone the repo:

```sh
git clone https://github.com/sj-piano/ethereum-smart-contract-toolset

mv ethereum-smart-contract-toolset contract-toolset
```

Install NPM packages:

```sh
cd contract-toolset && npm install
```

Copy the file `user-config.env.example` to `user-config.env` and fill it in with the relevant values.

```sh
cp user-config.env.example user-config.env
```

**IMPORTANT: Pay particular attention to the settings in the top section: `FINANCIAL CONTROLS`**

Make sure that you are happy with these settings. If nothing else, be careful to at least double-check the `MAX_FEE_PER_TRANSACTION_USD` setting. This will govern how much you could potentially spend when you send a transaction to the Ethereum mainnet.

*Also important*: You need to supply the Infura API key *name*, not the secret.

Notes:

* When you run a local hardhat node, it will have some built-in private keys and addresses that hold some test Ethereum. In `user-config.env.example`, the `LOCAL_HARDHAT_PRIVATE_KEY` and `LOCAL_HARDHAT_ADDRESS` values hold the first of these keypairs.


### Initial Setup


See available commands:

```sh
task --list

# You can also use: task -l
```

Run some initial tasks to check that everything is set up correctly.

```sh
task hello

task check-network-connections
```

Note: You should see this error `Could not connect to local network`, because we haven't started a Hardhat local network yet.

If `task check-network-connections` produces errors for connecting to testnet or mainnet, you can run the underlying script with the `--debug` flag:  
`npm exec -- ts-node scripts/check-network-connections.ts --debug`

Compile the contracts and run the tests.

```sh
task compile-contracts

task test

# Run a single test:
task test -- --grep "should deploy" --debug
```

Hardhat runs the tests on a temporary local blockchain.

We will use Hardhat to start a more persistent local blockchain instance. We can then deploy a smart contract on this local blockchain and interact with it.

Open another terminal and run:  
`task start-local-node`

Leave the node running in this additional terminal. Log output will be displayed (the initial set of pre-loaded keypairs will be shown). Press Ctrl-C to stop the local node. Switch back to the original terminal and continue.

Check the fees on the various networks.

```sh
npm exec -- ts-node scripts/get-network-fees.ts --network=local

# Note: The network is always "local" by default, so you can also run this command:
npm exec -- ts-node scripts/get-network-fees.ts

npm exec -- ts-node scripts/get-network-fees.ts --network=testnet

npm exec -- ts-node scripts/get-network-fees.ts --network=mainnet
```


### Managing Money

You'll need some SepoliaETH to use on the Sepolia Testnet. In your Metamask wallet, create a dedicated "Test" account. Switch to "Sepolia test network". Copy the address. Go to a Sepolia testnet faucet (e.g. this [PoW faucet](https://sepolia-faucet.pk910.de)) and get some SepoliaETH. Set the destination address to be your Metamask test address.

Create a new private key and store it in the `my-data` directory:  
`npm exec -- ts-node scripts/create-private-key.ts > my-data/sepolia-testnet-private-key.txt`

Display the private key:  
`cat my-data/sepolia-testnet-private-key.txt`

Store it in the `user-config.env` file as `SEPOLIA_TESTNET_PRIVATE_KEY`.

Derive an Ethereum address from the private key and store it in the `my-data` directory:  
`cat my-data/sepolia-testnet-private-key.txt | npm exec -- ts-node scripts/derive-address.ts > my-data/sepolia-testnet-address.txt`

Display the address:  
`cat my-data/sepolia-testnet-address.txt`

Store it in the `user-config.env` file as `SEPOLIA_TESTNET_ADDRESS`.

In Metamask, transfer a reasonable amount of SepoliaETH to this new address.

See the balance of the address:  
`npm exec -- ts-node scripts/get-balance.ts --network=testnet --address-file my-data/sepolia-testnet-address.txt`

If you wish to retrieve your SepoliaETH from the address created in a Sepolia testnet walkthrough (e.g. you want to transfer it back to your Metamask test account), you'll need to use a tool that can make the transfer (create, sign, broadcast, and track the transaction). Such a tool is not provided in this project.

Note that SepoliaETH is not worth anything, and it is reasonably straightforward to obtain more from a faucet.

However, actual Ethereum (ETH), used on the Ethereum mainnet, does have monetary value. Therefore, we recommend creating a new Metamask account (explicitly for test operations) and exporting its private key for use in the tool walkthroughs. This means that afterwards there will be no need to make a retrieval transaction.

Note: If you know what you're doing, and you already have a capable transaction tool, you can create a new keypair, transfer some ETH to it, perform a tool walkthrough on the mainnet, and transfer any remaining ETH back to your original address.

In your Metamask wallet, create a dedicated "Test" account. Switch to "Ethereum Mainnet". We assume that you already have some Ethereum in Metamask or in another wallet tool. Transfer some ETH to this address. Copy the address.

Store it in the `user-config.env` file as `ETHEREUM_MAINNET_ADDRESS`.

Store it in the `my-data` directory in a new file called `ethereum-mainnet-address.txt`.

Now, export the corresponding private key from Metamask, using the following guide:

Metamask: [How to export an account's private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key)

Store it in the `user-config.env` file as `ETHEREUM_MAINNET_PRIVATE_KEY`.

Store it in the `my-data` directory in a new file called `ethereum-mainnet-private-key.txt`.

See the balance of the address:  
`npm exec -- ts-node scripts/get-balance.ts --network=mainnet --log-level info --address-file my-data/ethereum-mainnet-address.txt`

The result should match the balance shown in Metamask for your "Test" account.

Recommended: Read the [Fee Limit Protections](#fee-limit-protections)</a> section before proceeding further.




### Choose Tool

Now, please browse to the [Toolset section](#toolset), choose a tool, and open its README file in another tab. Its README will walk you through the processing of deploying it and interacting with it on the various networks.


<p align="right">(<a href="#readme-top">back to top</a>)</p>




## Usage




### Notes

`config.ts` stores the configuration used within the entire package. You probably won't need to look at it. Settings in the `user-config.env` file override it.

Most scripts accept a `network` argument, which specifies whether the script should connect to the local development blockchain (`local`), the Sepolia testnet (`testnet`), or the Ethereum mainnet (`mainnet`). It is `local` by default.

Most scripts have `--help` functionality. E.g. you can run:  
`npm exec --silent -- ts-node scripts/get-network-fees.ts --help`

Most scripts can log at different levels of output. You can use `--log-level info` or `--debug` arguments.

See a list of examples that demonstrate how to use the various scripts:  
`task show-example-script-commands`


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Fee Limit Protections

The settings in the `user-config.env` file under the top section `FINANCIAL CONTROLS` impose strict limits on the maximum cost of a transaction.

Scripts that change data on the blockchain, e.g. `hello-world/deploy.ts` and `hello-world/update-message.ts`, will refuse to broadcast a transaction if these limits are exceeded. Additionally, fee estimation scripts e.g. `hello-world/estimate-fees.ts` script will report that these limits will be exceeded.

You can of course change the limits in the `user-config.env` file if you wish, allowing a script to spend more money in order to broadcast the transaction.

Example output, after setting `MAX_FEE_PER_TRANSACTION_USD = "0.01"`:

```bash
stjohn@judgement:~/work/contract-template$ npm exec -- ts-node scripts/HelloWorld/estimate-fees.ts

Contract deployment - estimated fee:
- baseFeeUsd limit exceeded: Base fee (1.07 USD) exceeds limit specified in config (0.01 USD). Current base fee is 570179.0 gwei (570179000000000 wei, 0.000570179 ETH). Current ETH-USD exchange rate is 1873.22 USD.

Contract method call: 'update' - estimated fee:
- baseFeeUsd limit exceeded: Base fee (0.04 USD) exceeds limit specified in config (0.01 USD). Current base fee is 21725.0 gwei (21725000000000 wei, 0.000021725 ETH). Current ETH-USD exchange rate is 1873.22 USD.

stjohn@judgement:~/work/contract-template$ npm exec -- ts-node scripts/get-balance.ts --address-file my-data/local-hardhat-address.txt
10000.0 ETH (18732700.00 USD)

stjohn@judgement:~/work/contract-template$ npm exec -- ts-node scripts/HelloWorld/deploy.ts --log-level info
info:   Connecting to local network at http://localhost:8545...
info:   Estimated fee: 0.000005338173277105 ETH (0.01 USD)
- baseFeeUsd: Base fee (1.07 USD) exceeds limit specified in config (0.01 USD). Current base fee is 570179.0 gwei (570179000000000 wei, 0.000570179 ETH). Current ETH-USD exchange rate is 1873.3 USD.

stjohn@judgement:~/work/contract-toolset$ npm exec -- ts-node scripts/HelloWorld/update-message.ts --input-file-json my-data/hello-world/update-message-local-network.json
- baseFeeUsd: Base fee (0.06 USD) exceeds limit specified in config (0.01 USD). Current base fee is 31925.25 gwei (31925250000000 wei, 0.00003192525 ETH). Current ETH-USD exchange rate is 1873.39 USD.
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Contract Publication


We use [Hardhat verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify) to publish the smart contracts to Etherscan.

The basic command is:  
`npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"`

This will upload the contract to the testnet explorer at [sepolia.etherscan.io](https://sepolia.etherscan.io).

To upload to the mainnet explorer at [etherscan.io](https://etherscan.io), use `--network mainnet`.




## Roadmap


(Blank)


<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- CONTRIBUTING -->
## Contributing


If you like this project or found it helpful, please give it a star!


Feel free to fork the project and use it for development. Please add an acknowledgement to this project in your README file.


Please note: Github issues & pull requests will not be read unless you contact me about them in Tela.

[![Tela][tela-shield]][tela-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- LICENSE -->
## License

Distributed under the GNU Affero General Public License (AGPL). See [LICENSE.txt](LICENSE.txt) for more information.


<p align="right">(<a href="#readme-top">back to top</a>)</p>




## Contact


**If you would like to:**
* ask a question
* report a bug
* ask for an addition to the README
* request a feature
* get a private commercial software license
* make a complaint
* hire me

Then [please contact me on Tela](https://www.tela.app/magic/stjohn_piano/ea344e). Thank you.

[![Tela][tela-shield]][tela-url]

If you would like to add me as a professional contact, you can [send me a connection request on LinkedIn](https://www.linkedin.com/in/stjohnpiano):

[![LinkedIn][linkedin-shield]][linkedin-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>




## Acknowledgments

A list of helpful resources:

* Choose an Open Source License: [choosealicense.com](https://choosealicense.com)

* Badges: [shields.io](https://shields.io)

* [Hardhat configuration](https://hardhat.org/hardhat-runner/docs/config)

* How Hardhat runs a local Ethereum blockchain for testing and development: [Hardhat Network](https://hardhat.org/hardhat-network/docs/overview)

* README template by Othneil Drew: [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

* Sepolia testnet PoW faucet: https://sepolia-faucet.pk910.de

* Metamask: [How to export an account's private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key)

* Publish and verify smart contracts: [Hardhat verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)

* Sepolia Testnet block explorer: [sepolia.etherscan.io](https://sepolia.etherscan.io)

* Ethereum Mainnet block explorer: [etherscan.io](https://etherscan.io)

* Typescript Linting advice from Khalil Stemmler:  
    * [How to use ESLint with TypeScript](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript)


<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/sj-piano/ethereum-smart-contract-project-template-typescript?style=for-the-badge&color=32cb56
[license-url]: https://github.com/sj-piano/ethereum-smart-contract-project-template-typescript/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-StJohn_Piano-blue.svg?style=for-the-badge&logo=linkedin
[linkedin-url]: https://linkedin.com/in/stjohnpiano
[tela-shield]: https://img.shields.io/badge/Tela-StJohn_Piano-blue?style=for-the-badge
[tela-url]: https://www.tela.app/magic/stjohn_piano/a852c8
