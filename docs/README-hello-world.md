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
    <img src="../images/glider_600x480.png" alt="Logo" width="300" height="240">
  </a>
  <h3 align="center">Ethereum smart contract toolset</h3>
  <h3>Hello World</h3>
  <p align="center">
    A basic storage contract
    <br/>
  </p>
</div>




<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#project-summary">Project Summary</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#walkthrough-local">Walkthrough - Local Network</a></li>
    <li><a href="#walkthrough-testnet">Walkthrough - Sepolia Testnet</a></li>
    <li><a href="#walkthrough-mainnet">Walkthrough - Ethereum Mainnet</a></li>
    <li><a href="#contract-publication">Contract Publication</a></li>
  </ol>
</details>




<!-- PROJECT SUMMARY -->
## Project Summary

**Description:**

This a basic storage smart contract. It stores a message, which can be updated.

**If you would like to:**
* ask a question
* report a bug
* ask for an addition to the README
* request a feature
* get a private commercial software license
* make a complaint
* hire me

Then [please contact me on Tela](https://www.tela.app/stjohn_piano/a852c8). Thank you.

[![Tela][tela-shield]][tela-url]

If you would like to add me as a professional contact, you can [send me a connection request on LinkedIn](https://www.linkedin.com/in/stjohnpiano):

[![LinkedIn][linkedin-shield]][linkedin-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Getting Started

Please proceed through the [main README's Getting Started section](../README.md#getting-started). When you are ready, return here.

This document contains walkthroughs with example output for several blockchain networks: A local Hardhat blockchain instance, the Sepolia testnet, and the Ethereum mainnet.




### Walkthrough - Local Network


We deploy the HelloWorld contract to the local Hardhat blockchain.

See the balance of the address that will deploy the contract:  
`pnpm ts-node scripts/get-balance.ts --address-file user-data/local-hardhat-address.txt`

See fee estimations for the different contract operations, including deployment:  
`pnpm ts-node scripts/HelloWorld/estimate-fees.ts`

Deploy the HelloWorld contract:  
`pnpm ts-node scripts/HelloWorld/deploy.ts --log-level info`

This will output an address. Copy this address into the `user-config.env` file as `HELLO_WORLD_LOCAL_ADDRESS`.

Confirm deployment:  
`pnpm ts-node scripts/check-contract-exists --debug --address-name='HELLO_WORLD_LOCAL_ADDRESS'`

Print the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts --debug`

Create a new input file:  
`cp user-data/HelloWorld/example-update-message.json user-data/HelloWorld/update-message-local.json`

Open it and specify a new message e.g. `Hello Mars ! (local)`.

Update the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/update-message.ts --input-file-json user-data/HelloWorld/update-message-local.json --log-level info`

Print the new message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts`

Example output:

```bash
stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/get-balance.ts --address-file user-data/local-hardhat-address.txt
10000.0 ETH (18741900.00 USD)
stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/HelloWorld/estimate-fees.ts

Contract deployment - estimated fee:
- feeEth: 0.0013185389375
- feeUsd: 2.47

Contract method call: 'update' - estimated fee:
- feeEth: 0.0000502390625
- feeUsd: 0.09

stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/HelloWorld/deploy.ts --log-level info
info:   Connecting to local network at http://localhost:8545...
info:   Estimated fee: 0.0013185389375 ETH (2.47 USD)
info:   Signer balance: 10000.0 ETH (18742000.00 USD)
info:   Final fee: 0.0012472665625 ETH (2.34 USD)
info:   Contract deployed to address:
0x5FbDB2315678afecb367f032d93F642f64180aa3

stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/check-contract-exists --debug --address-name='HELLO_WORLD_LOCAL_ADDRESS'
{
  logLevel: 'error',
  network: 'local',
  debug: true,
  address-name: 'HELLO_WORLD_LOCAL_ADDRESS'
}
debug:  Address found in .env file: 0x5FbDB2315678afecb367f032d93F642f64180aa3
info:   Connecting to local network at http://localhost:8545...
debug:  Current block number: 1
Contract found at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/HelloWorld/get-message.ts --debug
{ logLevel: 'error', network: 'local', debug: true }
info:   Connecting to local network at http://localhost:8545...
debug:  Current block number: 1
info:   Contract found at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
info:   Message stored in HelloWorld contract:
Hello World!

stjohn@judgement:~/work/contract-toolset$ cp user-data/HelloWorld/example-update-message.json user-data/HelloWorld/update-message-local.json

stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/HelloWorld/update-message.ts --input-file-json user-data/HelloWorld/update-message-local.json --log-level info
info:   Connecting to local network at http://localhost:8545...
info:   Contract found at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
info:   Message stored in HelloWorld contract: Hello World!
info:   Estimated fee: 0.000081108653195388 ETH (0.15 USD)
info:   Signer balance: 9999.9987527334375 ETH (18732097.66 USD)
info:   Updating the message...
info:   Final fee: 0.00007725958865898 ETH (0.14 USD)
The new message is:
Hello Mars ! (local)

stjohn@judgement:~/work/contract-toolset$ pnpm ts-node scripts/HelloWorld/get-message.ts
Hello Mars ! (local)
```




<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Walkthrough - Sepolia Testnet


See the balance of the address that will deploy the contract:  
`pnpm ts-node scripts/get-balance.ts --address-file user-data/sepolia-testnet-address.txt`

See fee estimations for the different contract operations, including deployment:  
`pnpm ts-node scripts/HelloWorld/estimate-fees.ts --network=testnet`

Deploy the contract to the Sepolia testnet:  
`pnpm ts-node scripts/HelloWorld/deploy.ts --network=testnet`

This will output an address. Copy this address into the `user-config.env` file as `HELLO_WORLD_TESTNET_ADDRESS`.

Confirm deployment:  
`pnpm ts-node scripts/check-contract-exists --network=testnet --address-name='HELLO_WORLD_TESTNET_ADDRESS'`

Print the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts --network=testnet`

Create a new input file:  
`cp user-data/HelloWorld/example-update-message.json user-data/HelloWorld/update-message-testnet.json`

Open it and specify a new message e.g. `Hello Mars ! (testnet)`.

Update the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/update-message.ts --network=testnet --input-file-json user-data/HelloWorld/update-message-testnet.json`

Print the new message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts --network=testnet`

Example output:

```bash
stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/get-balance.ts --network=testnet --address-file user-data/sepolia-testnet-address.txt
0.409023392670777583 ETH (780.81 USD)

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/estimate-fees.ts --network=testnet

Contract deployment - estimated fee:
- feeEth: 0.000000001001234324
- feeUsd: 0.00

Contract method call: 'update' - estimated fee:
- feeEth: 0.000000000038147344
- feeUsd: 0.00

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/deploy.ts --network=testnet
0x02bCCb6Fa3e24b14566e571656EE53A7723884f7

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/check-contract-exists --network=testnet --address-name='HELLO_WORLD_TESTNET_ADDRESS'
Contract found at address: 0x02bCCb6Fa3e24b14566e571656EE53A7723884f7

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/get-message.ts --network=testnet
Hello World!

stjohn@judgement:~/work/contract-template$ cp user-data/HelloWorld/example-update-message.json user-data/HelloWorld/update-message-testnet.json

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/update-message.ts --network=testnet --input-file-json user-data/HelloWorld/update-message-testnet.json
The new message is:
Hello Mars ! (testnet)

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/get-message.ts --network=testnet
Hello Mars ! (testnet)
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### Walkthrough - Ethereum Mainnet


See the balance of the address that will deploy the contract:  
`pnpm ts-node scripts/get-balance.ts --address-file user-data/ethereum-mainnet-address.txt`

See fee estimations for the different contract operations, including deployment:  
`pnpm ts-node scripts/HelloWorld/estimate-fees.ts --network=mainnet`

If a fee limit is exceeded, and you are willing to spend the money, increase the `MAX_FEE_PER_TRANSACTION_USD` value in `user-config.env`. Re-run the `hello-world/estimate-fees.ts` command above to confirm that no fee limit will be exceeded.

Deploy the contract to the Ethereum mainnet:  
`pnpm ts-node scripts/HelloWorld/deploy.ts --network=mainnet --log-level info`

This will output an address. Copy this address into the `user-config.env` file as `HELLO_WORLD_MAINNET_ADDRESS`.

Confirm deployment:  
`pnpm ts-node scripts/check-contract-exists --network=mainnet --address-name='HELLO_WORLD_MAINNET_ADDRESS' --log-level info`

Print the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts --network=mainnet --log-level info`

Create a new input file:  
`cp user-data/HelloWorld/example-update-message.json user-data/HelloWorld/update-message-mainnet.json`

Open it and specify a new message e.g. `Hello Mars ! (mainnet)`.

Update the message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/update-message.ts --network=mainnet --log-level info --input-file-json user-data/HelloWorld/update-message-mainnet.json`

Print the new message stored in the contract:  
`pnpm ts-node scripts/HelloWorld/get-message.ts --network=mainnet --log-level info`

Example output:

```bash
stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/get-balance.ts --network=mainnet --log-level info --address-file user-data/ethereum-mainnet-address.txt
info:   Connecting to Ethereum mainnet...
info:   Getting balance for address 0x4A846013314b892Be429F8626487109DD7b494a0...
0.042281201108669793 ETH (80.73 USD)

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/estimate-fees.ts --network=mainnet

Contract deployment - estimated fee:
- baseFeeUsd limit exceeded: Base fee (17.47 USD) exceeds limit specified in config (5.00 USD). Current base fee is 9149184.714182905 gwei (9149184714182905 wei, 0.009149184714182905 ETH). Current ETH-USD exchange rate is 1909.52 USD.

Contract method call: 'update' - estimated fee:
- feeEth: 0.00035021612752418
- feeUsd: 0.67

# Here, after seeing the estimated fees, I set the MAX_FEE_PER_TRANSACTION_USD value in user-config.env to "20.00".

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/estimate-fees.ts --network=mainnet

Contract deployment - estimated fee:
- feeEth: 0.009101423868100018
- feeUsd: 17.39

Contract method call: 'update' - estimated fee:
- feeEth: 0.000346767124202408
- feeUsd: 0.66

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/deploy.ts --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Estimated fee: 0.009271102473677687 ETH (17.71 USD)
info:   Signer balance: 0.042281201108669793 ETH (80.77 USD)
info:   Final fee: 0.009006010206038837 ETH (17.21 USD)
info:   Contract deployed to address:
0xc2963E4f4C8456b21734c7c4811327A94324851E

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/check-contract-exists --network=mainnet --address-name='HELLO_WORLD_MAINNET_ADDRESS' --log-level info
info:   Connecting to Ethereum mainnet...
Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/get-message.ts --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract:
Hello World!

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/update-message.ts --network=mainnet --log-level info --input-file-json user-data/HelloWorld/update-message-mainnet.json
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract: Hello World!
info:   Estimated fee: 0.000573907171238688 ETH (1.10 USD)
info:   Signer balance: 0.033275190902630956 ETH (63.53 USD)
info:   Updating the message...
info:   Final fee: 0.000581844011532384 ETH (1.11 USD)
The new message is:
Hello Mars ! (mainnet)

stjohn@judgement:~/work/contract-template$ pnpm ts-node scripts/HelloWorld/get-message.ts --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract:
Hello Mars ! (mainnet)
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Contract Publication


#### We publish the contract that we deployed on Sepolia Testnet

```bash
HELLO_WORLD_TESTNET_ADDRESS="0x0FdEe0538a2092937c68A4954e3f5adDb7532fC1"
npx hardhat verify --network sepolia $HELLO_WORLD_TESTNET_ADDRESS "Hello World!"
```

Example output:

```bash
stjohn@judgement:~/work/contract-template$ HELLO_WORLD_TESTNET_ADDRESS="0x02bCCb6Fa3e24b14566e571656EE53A7723884f7"

stjohn@judgement:~/work/contract-template$ npx hardhat verify --network sepolia $HELLO_WORLD_TESTNET_ADDRESS "Hello World!"
Successfully submitted source code for contract
contracts/HelloWorld.sol:HelloWorld at 0x02bCCb6Fa3e24b14566e571656EE53A7723884f7
for verification on the block explorer. Waiting for verification result...

Successfully verified contract HelloWorld on the block explorer.
https://sepolia.etherscan.io/address/0x02bCCb6Fa3e24b14566e571656EE53A7723884f7#code
```

Summary:

The contract has been deployed to the Sepolia Testnet at this address:  
`0x02bCCb6Fa3e24b14566e571656EE53A7723884f7`

The contract is published here:  
[sepolia.etherscan.io/address/0x02bCCb6Fa3e24b14566e571656EE53A7723884f7#code](https://sepolia.etherscan.io/address/0x02bCCb6Fa3e24b14566e571656EE53A7723884f7#code)

You can read the contract's stored data at:  
[sepolia.etherscan.io/address/0x02bCCb6Fa3e24b14566e571656EE53A7723884f7#readContract](https://sepolia.etherscan.io/address/0x02bCCb6Fa3e24b14566e571656EE53A7723884f7#readContract)


#### We publish the contract that we deployed on Ethereum Mainnet

```bash
HELLO_WORLD_MAINNET_ADDRESS="0xc2963E4f4C8456b21734c7c4811327A94324851E"
npx hardhat verify --network mainnet $HELLO_WORLD_MAINNET_ADDRESS "Hello World!"
```

Example output:

```bash
stjohn@judgement:~/work/contract-template$ HELLO_WORLD_MAINNET_ADDRESS="0xc2963E4f4C8456b21734c7c4811327A94324851E"

stjohn@judgement:~/work/contract-template$ npx hardhat verify --network mainnet $HELLO_WORLD_MAINNET_ADDRESS "Hello World!"
Successfully submitted source code for contract
contracts/HelloWorld.sol:HelloWorld at 0xc2963E4f4C8456b21734c7c4811327A94324851E
for verification on the block explorer. Waiting for verification result...

Successfully verified contract HelloWorld on the block explorer.
https://etherscan.io/address/0xc2963E4f4C8456b21734c7c4811327A94324851E#code
```

Summary:

The contract has been deployed to the Ethereum Mainnet at this address:  
`0xc2963E4f4C8456b21734c7c4811327A94324851E`

The contract is published here:  
[etherscan.io/address/0xc2963E4f4C8456b21734c7c4811327A94324851E#code](https://etherscan.io/address/0xc2963E4f4C8456b21734c7c4811327A94324851E#code)

You can read the contract's stored data at:  
[etherscan.io/address/0xc2963E4f4C8456b21734c7c4811327A94324851E#readContract](https://etherscan.io/address/0xc2963E4f4C8456b21734c7c4811327A94324851E#readContract)



<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/sj-piano/ethereum-smart-contract-project-template-typescript?style=for-the-badge&color=32cb56
[license-url]: https://github.com/sj-piano/ethereum-smart-contract-project-template-typescript/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-StJohn_Piano-blue.svg?style=for-the-badge&logo=linkedin
[linkedin-url]: https://linkedin.com/in/stjohnpiano
[tela-shield]: https://img.shields.io/badge/Tela-StJohn_Piano-blue?style=for-the-badge
[tela-url]: https://www.tela.app/stjohn_piano/a852c8
