<a name="readme-top"></a>




<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#walkthrough-local">Walkthrough - Local Network</a></li>
    <li><a href="#walkthrough-testnet">Walkthrough - Sepolia Testnet</a></li>
    <li><a href="#walkthrough-mainnet">Walkthrough - Ethereum Mainnet</a></li>
    <li><a href="#contract-publication">Contract Publication</a></li>
  </ol>
</details>




## <a id="walkthrough-local" />Walkthrough - Local Network


We deploy the HelloWorld contract to the local Hardhat blockchain.

See the balance of the address that will deploy the contract:  
`npm run --silent ts-node scripts/get-balance.ts -- --address-file input-data/local-hardhat-address.txt`

See fee estimations for the different contract operations, including deployment:  
`npm run --silent ts-node scripts/hello-world-estimate-fees.ts`

Deploy the HelloWorld contract:  
`npm run --silent ts-node scripts/hello-world-deploy.ts -- --log-level info`

This will output an address. Copy this address into the `user-config.env` file as `LOCAL_HARDHAT_DEPLOYED_CONTRACT_ADDRESS`.

Confirm deployment:  
`npm run --silent ts-node scripts/check-contract-exists -- --debug`

Print the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts -- --debug`

Create a new input file:  
`cp input-data/example-update-message.json input-data/update-message-local-network.json`

Open it and specify a new message e.g. `Hello Mars ! (local)`.

Update the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-update-message.ts -- --input-file-json input-data/update-message-local-network.json --log-level info`

Print the new message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts`

Example output:

![](images/walkthrough_local_network.png)


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### <a id="walkthrough-testnet" />Walkthrough - Sepolia Testnet


Create a new private key and store it in the `input-data` directory:  
`npm run --silent ts-node scripts/create-private-key.ts > input-data/sepolia-testnet-private-key.txt`

Display the private key:  
`cat input-data/sepolia-testnet-private-key.txt`

Store it in the `user-config.env` file as `SEPOLIA_TESTNET_PRIVATE_KEY`.

Derive an Ethereum address from the private key and store it in the `input-data` directory:  
`cat input-data/sepolia-testnet-private-key.txt | npm run --silent ts-node scripts/derive-address.ts > input-data/sepolia-testnet-address.txt`

Display the address:  
`cat input-data/sepolia-testnet-address.txt`

Store it in the `user-config.env` file as `SEPOLIA_TESTNET_ADDRESS`.

In Metamask, transfer a reasonable amount of SepoliaETH to this new address.

See the balance of the address that will deploy the contract:  
`npm run --silent ts-node scripts/get-balance.ts -- --network=testnet --address-file input-data/sepolia-testnet-address.txt`

See fee estimations for the different contract operations, including deployment:  
`npm run --silent ts-node scripts/hello-world-estimate-fees.ts -- --network=testnet`

Deploy the contract to the Sepolia testnet:  
`npm run --silent ts-node scripts/hello-world-deploy.ts -- --network=testnet`

This will output an address. Copy this address into the `user-config.env` file as `SEPOLIA_TESTNET_DEPLOYED_CONTRACT_ADDRESS`.

Confirm deployment:  
`npm run --silent ts-node scripts/check-contract-exists -- --network=testnet`

Print the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=testnet`

Create a new input file:
`cp input-data/example-update-message.json input-data/update-message-sepolia-testnet.json`

Open it and specify a new message e.g. `Hello Mars ! (testnet)`.

Update the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-update-message.ts -- --network=testnet --input-file-json input-data/update-message-sepolia-testnet.json`

Print the new message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=testnet`

Example output:

```bash
stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/get-balance.ts -- --network=testnet --address-file input-data/sepolia-testnet-address.txt
0.409023392670777583 ETH (780.81 USD)

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-estimate-fees.ts -- --network=testnet

Contract deployment - estimated fee:
- feeEth: 0.000000001001234324
- feeUsd: 0.00

No contract found at address 0x0000000000000000000000000000000000000000.

Contract method call: 'update' - estimated fee:
- feeEth: 0.000000000038147344
- feeUsd: 0.00

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-deploy.ts -- --network=testnet
0x02bCCb6Fa3e24b14566e571656EE53A7723884f7

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/check-contract-exists -- --network=testnet
Contract found at address: 0x02bCCb6Fa3e24b14566e571656EE53A7723884f7

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=testnet
Hello World!

stjohn@judgement:~/work/contract-template$ cp input-data/example-update-message.json input-data/update-message-sepolia-testnet.json

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-update-message.ts -- --network=testnet --input-file-json input-data/update-message-sepolia-testnet.json
The new message is:
Hello Mars ! (testnet)

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=testnet
Hello Mars ! (testnet)
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>




### <a id="walkthrough-mainnet" />Walkthrough - Ethereum Mainnet


See fee estimations for the different contract operations, including deployment:  
`npm run --silent ts-node scripts/hello-world-estimate-fees.ts -- --network=mainnet`

If a fee limit is exceeded, and you are willing to spend the money, increase the `MAX_FEE_PER_TRANSACTION_USD` value in `user-config.env`. Re-run the `hello-world-estimate-fees.ts` command above to confirm that no fee limit will be exceeded.

Deploy the contract to the Ethereum mainnet:  
`npm run --silent ts-node scripts/hello-world-deploy.ts -- --network=mainnet --log-level info`

This will output an address. Copy this address into the `user-config.env` file as `ETHEREUM_MAINNET_DEPLOYED_CONTRACT_ADDRESS`.

Confirm deployment:  
`npm run --silent ts-node scripts/check-contract-exists -- --network=mainnet --log-level info`

Print the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=mainnet --log-level info`

Create a new input file:  
`cp input-data/example-update-message.json input-data/update-message-ethereum-mainnet.json`

Open it and specify a new message e.g. `Hello Mars ! (mainnet)`.

Update the message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-update-message.ts -- --network=mainnet --log-level info --input-file-json input-data/update-message-ethereum-mainnet.json`

Print the new message stored in the contract:  
`npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=mainnet --log-level info`

Example output:

```bash
stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/get-balance.ts -- --network=mainnet --log-level info --address-file input-data/ethereum-mainnet-address.txt
info:   Connecting to Ethereum mainnet...
info:   Getting balance for address 0x4A846013314b892Be429F8626487109DD7b494a0...
0.042281201108669793 ETH (80.73 USD)

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-estimate-fees.ts -- --network=mainnet

Contract deployment - estimated fee:
- baseFeeUsd limit exceeded: Base fee (17.47 USD) exceeds limit specified in config (5.00 USD). Current base fee is 9149184.714182905 gwei (9149184714182905 wei, 0.009149184714182905 ETH). Current ETH-USD exchange rate is 1909.52 USD.

No contract found at address 0x0000000000000000000000000000000000000000.

Contract method call: 'update' - estimated fee:
- feeEth: 0.00035021612752418
- feeUsd: 0.67

# Here, after seeing the estimated fees, I set the MAX_FEE_PER_TRANSACTION_USD value in user-config.env to "20.00".

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-estimate-fees.ts -- --network=mainnet

Contract deployment - estimated fee:
- feeEth: 0.009101423868100018
- feeUsd: 17.39

No contract found at address 0x0000000000000000000000000000000000000000.

Contract method call: 'update' - estimated fee:
- feeEth: 0.000346767124202408
- feeUsd: 0.66

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-deploy.ts -- --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Estimated fee: 0.009271102473677687 ETH (17.71 USD)
info:   Signer balance: 0.042281201108669793 ETH (80.77 USD)
info:   Final fee: 0.009006010206038837 ETH (17.21 USD)
info:   Contract deployed to address:
0xc2963E4f4C8456b21734c7c4811327A94324851E

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/check-contract-exists -- --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract:
Hello World!

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-update-message.ts -- --network=mainnet --log-level info --input-file-json input-data/update-message-ethereum-mainnet.json
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract: Hello World!
info:   Estimated fee: 0.000573907171238688 ETH (1.10 USD)
info:   Signer balance: 0.033275190902630956 ETH (63.53 USD)
info:   Updating the message...
info:   Final fee: 0.000581844011532384 ETH (1.11 USD)
The new message is:
Hello Mars ! (mainnet)

stjohn@judgement:~/work/contract-template$ npm run --silent ts-node scripts/hello-world-get-message.ts -- --network=mainnet --log-level info
info:   Connecting to Ethereum mainnet...
info:   Contract found at address: 0xc2963E4f4C8456b21734c7c4811327A94324851E
info:   Message stored in HelloWorld contract:
Hello Mars ! (mainnet)
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Contract Publication


#### We publish the contract that we deployed on Sepolia Testnet

```bash
SEPOLIA_TESTNET_DEPLOYED_CONTRACT_ADDRESS="0x0FdEe0538a2092937c68A4954e3f5adDb7532fC1"
npx hardhat verify --network sepolia $SEPOLIA_TESTNET_DEPLOYED_CONTRACT_ADDRESS "Hello World!"
```

Example output:

```bash
stjohn@judgement:~/work/contract-template$ SEPOLIA_TESTNET_DEPLOYED_CONTRACT_ADDRESS="0x02bCCb6Fa3e24b14566e571656EE53A7723884f7"

stjohn@judgement:~/work/contract-template$ npx hardhat verify --network sepolia $SEPOLIA_TESTNET_DEPLOYED_CONTRACT_ADDRESS "Hello World!"
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
ETHEREUM_MAIN_DEPLOYED_CONTRACT_ADDRESS="0xc2963E4f4C8456b21734c7c4811327A94324851E"
npx hardhat verify --network mainnet $ETHEREUM_MAIN_DEPLOYED_CONTRACT_ADDRESS "Hello World!"
```

Example output:

```bash
stjohn@judgement:~/work/contract-template$ ETHEREUM_MAIN_DEPLOYED_CONTRACT_ADDRESS="0xc2963E4f4C8456b21734c7c4811327A94324851E"

stjohn@judgement:~/work/contract-template$ npx hardhat verify --network mainnet $ETHEREUM_MAIN_DEPLOYED_CONTRACT_ADDRESS "Hello World!"
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

