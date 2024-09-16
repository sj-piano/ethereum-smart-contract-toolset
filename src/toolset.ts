// Imports
import _ from 'lodash';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import maticToolset from '#root/src/matic-toolset';
import uniswapToolset from '#root/src/uniswap-toolset';


// Controls
let logLevel = 'error';


// Logging
const { logger, log, deb } = createLogger({ filePath: __filename, logLevel });


class Toolset {


  provider: ethers.Provider | null;
  uniswapToolset = uniswapToolset;
  addresses: {
    USDC_CONTRACT_ADDRESS: string;
    WETH_CONTRACT_ADDRESS: string;
  }


  constructor() {
    this.provider = null;
    this.addresses = {
      USDC_CONTRACT_ADDRESS: '',
      WETH_CONTRACT_ADDRESS: '',
    };
  }


  async setupAsync ({ networkLabel, logLevel }: { networkLabel: string, logLevel: string }) {
    logger.setLevel({ logLevel });
    config.logger.setLevel({ logLevel });
    config.networkLabel = networkLabel;
    const network = config.networkLabelToNetwork(networkLabel);
    config.network = network;
    const provider = await this.getProviderAsync({ networkLabel, network });
    this.provider = provider;
    ethToolset.parent = this;
    maticToolset.parent = this;
    uniswapToolset.parent = this;
    this.addresses = {
      USDC_CONTRACT_ADDRESS: this.getUsdcContractAddress(),
      WETH_CONTRACT_ADDRESS: this.getWethContractAddress(),
    };
    return provider;
  }


  async getProviderAsync({ networkLabel, network }: { networkLabel: string, network: string }) {
    var msg: string;
    let provider: ethers.Provider;
    if (networkLabel == 'local') {
      msg = `Connecting to local network at ${network}...`;
      deb(msg);
      provider = new ethers.JsonRpcProvider(network);
    } else if (networkLabel === 'testnet') {
      msg = `Connecting to Sepolia testnet...`;
      deb(msg);
      provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
    } else if (networkLabel === 'mainnet') {
      msg = `Connecting to Ethereum mainnet...`;
      deb(msg);
      provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
    } else if (networkLabel === 'testnetPolygon') {
      msg = `Connecting to Polygon testnet...`;
      deb(msg);
      provider = new ethers.JsonRpcProvider(
      `${config.alchemyAPIPolygonTestnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
      );
    } else if (networkLabel === 'mainnetPolygon') {
      msg = `Connecting to Polygon mainnet...`;
      deb(msg);
      //this.provider = new ethers.AlchemyProvider(network, config.env.ALCHEMY_API_KEY_POLYGON_POS);
      provider = new ethers.JsonRpcProvider(
      `${config.alchemyAPIPolygonMainnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
      );
    } else {
      throw new Error(`Unsupported networkLabel: '${networkLabel}'`);
    }
    await this.checkConnectionAsync({ provider });
    return provider;
  }


  async checkConnectionAsync({ provider }: { provider: ethers.Provider }) {
    try {
      let blockNumber = await provider.getBlockNumber();
      let msg = `Connected to network. Block number: ${blockNumber}`;
      deb(msg);
    } catch (error) {
      provider.destroy();
      let msg = `Error connecting to network: ${error}`;
      logger.error(msg);
      throw error;
    }
  }


  validateKeyPairsInConfigEnv() {
    ethToolset.validatePrivateKeys({
      privateKeys: {
        LOCAL_HARDHAT_PRIVATE_KEY: config.env.LOCAL_HARDHAT_PRIVATE_KEY,
        SEPOLIA_TESTNET_PRIVATE_KEY: config.env.SEPOLIA_TESTNET_PRIVATE_KEY,
        ETHEREUM_MAINNET_PRIVATE_KEY: config.env.ETHEREUM_MAINNET_PRIVATE_KEY,
      },
    });
    ethToolset.validateAddresses({
      addresses: {
        LOCAL_HARDHAT_ADDRESS: config.env.LOCAL_HARDHAT_ADDRESS,
        SEPOLIA_TESTNET_ADDRESS: config.env.SEPOLIA_TESTNET_ADDRESS,
        ETHEREUM_MAINNET_ADDRESS: config.env.ETHEREUM_MAINNET_ADDRESS,
      },
    });
  }


  getUsdcContractAddress() {
    if (config.networkLabel === 'mainnet') {
      return config.constants.USDC_CONTRACT_ADDRESS_MAINNET;
    } else if (config.networkLabel === 'mainnetPolygon') {
      return config.constants.USDC_CONTRACT_ADDRESS_MAINNET_POLYGON;
    } else {
      let msg = `No USDC contract address in config for network '${config.networkLabel}'`;
      logger.warn(msg);
      return '';
    }
  }


  getWethContractAddress() {
    if (config.networkLabel === 'mainnet') {
      return config.constants.WETH_CONTRACT_ADDRESS_MAINNET;
    } else if (config.networkLabel === 'mainnetPolygon') {
      return config.constants.WETH_CONTRACT_ADDRESS_MAINNET_POLYGON;
    } else {
      let msg = `No WETH contract address in config for network '${config.networkLabel}'`;
      logger.warn(msg);
      return '';
    }
  }


}


// Future: Move this to errors.ts
class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintain proper prototype chain.
    Object.setPrototypeOf(this, NotImplementedError.prototype);
    // Optional: Capture stack trace (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


// Create a proxy for the Toolset class
const toolsetHandler = {
  get: function(target: any, prop: string, receiver: any) {
    if (prop in target) {
      return target[prop];
    }
    if (config.ethereumNetworkLabels.includes(config.networkLabel)) {
      if (typeof ethToolset[prop] === 'function') {
        return ethToolset[prop].bind(ethToolset);
      }
    }
    if (config.polygonNetworkLabels.includes(config.networkLabel)) {
      if (typeof maticToolset[prop] === 'function') {
        return maticToolset[prop].bind(maticToolset);
      }
    }
    // Some methods are local and do not require a network connection.
    // Example: createPrivateKeySync
    // These methods exist in ethToolset by default.
    if (typeof ethToolset[prop] === 'function') {
      return ethToolset[prop].bind(ethToolset);
    }
    throw new NotImplementedError(`Method '${prop}' is not implemented in toolset for network='${config.networkLabel}'.`);
  }
};


const toolsetProxy = new Proxy(new Toolset(), toolsetHandler);


export default toolsetProxy;
