// Imports
import _ from 'lodash';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import maticToolset from '#root/src/matic-toolset';


// Controls
let logLevel = 'error';
logLevel = 'info';


// Logging
const { logger, log, deb } = createLogger({ filePath: __filename, logLevel });


class Toolset {

  provider: ethers.Provider | null;

  constructor() {
    this.provider = null;
  }

  validateKeyPairsInConfigEnv() {
    ethToolset.validatePrivateKeysSync({
      privateKeys: {
        LOCAL_HARDHAT_PRIVATE_KEY: config.env.LOCAL_HARDHAT_PRIVATE_KEY,
        SEPOLIA_TESTNET_PRIVATE_KEY: config.env.SEPOLIA_TESTNET_PRIVATE_KEY,
        ETHEREUM_MAINNET_PRIVATE_KEY: config.env.ETHEREUM_MAINNET_PRIVATE_KEY,
      },
    });
    ethToolset.validateAddressesSync({
      addresses: {
        LOCAL_HARDHAT_ADDRESS: config.env.LOCAL_HARDHAT_ADDRESS,
        SEPOLIA_TESTNET_ADDRESS: config.env.SEPOLIA_TESTNET_ADDRESS,
        ETHEREUM_MAINNET_ADDRESS: config.env.ETHEREUM_MAINNET_ADDRESS,
      },
    });
  }

  getProvider({ networkLabel }: { networkLabel: string }) {
    config.networkLabel = networkLabel;
    config.network = config.networkLabelToNetwork[networkLabel];
    const network = config.network;
    var msg: string;
    if (networkLabel == 'local') {
      msg = `Connecting to local network at ${network}...`;
      this.provider = new ethers.JsonRpcProvider(network);
    } else if (networkLabel == 'testnet') {
      msg = `Connecting to Sepolia testnet...`;
      this.provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
    } else if (networkLabel == 'mainnet') {
      msg = `Connecting to Ethereum mainnet...`;
      this.provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
    } else if (networkLabel == 'mainnetPolygon') {
      msg = `Connecting to Polygon mainnet...`;
      //this.provider = new ethers.AlchemyProvider(network, config.env.ALCHEMY_API_KEY_POLYGON_POS);
      this.provider = new ethers.JsonRpcProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
      );
    } else {
      throw new Error(`Unsupported networkLabel: ${networkLabel}`);
    }
    deb(msg);
    return this.provider;
    }

    getUsdcContractAddress() {
    if (config.networkLabel === 'mainnet') {
      return config.constants.USDC_CONTRACT_ADDRESS_MAINNET;
    } else if (config.networkLabel === 'mainnetPolygon') {
      return config.constants.USDC_CONTRACT_ADDRESS_MAINNET_POLYGON;
    } else {
      throw new Error(`Unsupported networkLabel: ${config.networkLabel}`);
    }
    }

}


// Future: Move to errors.ts
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
    if (config.ethNetworkLabels.includes(config.networkLabel)) {
      if (typeof ethToolset[prop] === 'function') {
        return ethToolset[prop].bind(ethToolset);
      }
    }
    if (config.maticNetworkLabels.includes(config.networkLabel)) {
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
