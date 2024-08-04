// Package configuration values, stored in a class.


// Imports
import _ from 'lodash';
import Big from 'big.js';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';


// Local imports
import constants from '#lib/constants';
import { createLogger } from '#lib/logging';
import { getEnvVars } from '#lib/env-vars';
import validate from '#lib/validate';


// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();


// Language adjustments


BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

declare global {
  interface String {
    count(char: string): number;
    toBigInt(): bigint;
  }
  interface Object {
    getAllMethods2(): string[];
  }
}

String.prototype.count = function(char: string): number {
  let count = 0;
  for (let i = 0; i < this.length; i++) {
    if (this[i] === char) {
      count++;
    }
  }
  return count;
};

String.prototype.toBigInt = function(): bigint {
  if (this.count('.') === 1) {
    return BigInt(this.split('.')[0]);
  } else if (this.count('.') > 1) {
    throw new Error(`String (${this}) has more than one decimal point.`);
  }
  return BigInt(this.toString());
}


/* Notes:
- The main application or script will load the config, apply changes from cmdline arguments and environment variables if required, and pass it to the other modules or functions as an object.
- When we create a transaction, we find the current averagePriorityFeePerGas, and multiply it by averagePriorityFeeMultiplier to get our transaction-specific value for maxPriorityFeePerGas. However, we don't permit it to be greater than maxPriorityFeePerGasGwei.
*/


class Config {
  averagePriorityFeeMultiplier: string;
  constants: typeof constants = constants;
  env: { [key: string]: string } = {};
  envFileName: string;
  ethNetworkLabels: string[] = 'local testnet mainnet'.split(' ');
  ethUsdPriceUrl: string = 'https://api.pro.coinbase.com/products/ETH-USD/ticker';
  gasLimitMultiplier: string;
  infuraApiMainnetUrlBase: string = 'https://mainnet.infura.io/v3';
  alchemyAPIMainnetPolygonUrlBase: string = 'https://polygon-mainnet.g.alchemy.com/v2';
  maticNetworkLabels: string[] = 'polygonMainnet'.split(' ');
  maticUsdPriceUrl: string = 'https://api.pro.coinbase.com/products/MATIC-USD/ticker';
  _maxFeePerGasGwei: string;
  _maxPriorityFeePerGasGwei: string;
  maxFeePerGasWei: string;
  maxFeePerTransactionUsd: string;
  maxPriorityFeePerGasWei: string;
  networkLabel: string;
  networkLabelList: string[];
  networkLabelToNetwork: { [key: string]: string };
  network: string;
  logLevelList: string[];
  dummyAddress: string;

  constructor() {
    this.envFileName = 'user-config.env';
    // Note: maxFeePerTransactionUsd overrides the other fee limits.
    this.maxFeePerTransactionUsd = '0';
    this._maxFeePerGasGwei = '0';
    this._maxPriorityFeePerGasGwei = '0';
    this.gasLimitMultiplier = '1.0';
    this.averagePriorityFeeMultiplier = '1.0';
    this.maxFeePerGasWei = '0';
    this.maxPriorityFeePerGasWei = '0';
    this.networkLabel = '';
    this.networkLabelList = 'local testnet mainnet polygonMainnet'.split(' ');
    this.networkLabelToNetwork = {
      local: 'http://127.0.0.1:8545',
      testnet: 'sepolia',
      mainnet: 'mainnet',
      polygonMainnet: 'matic',
    };
    this.network = '';
    this.logLevelList = 'debug info warn error'.split(' ');
    this.dummyAddress = '0x000000000000000000000000000000000000dEaD';
  }

  getEnvFilePathSync() {
    return path.join(__dirname, this.envFileName);
  }

  loadEnvVarsSync() {
    dotenv.config({ path: this.getEnvFilePathSync() });
    // Load env vars and throw an error if any are missing.
    this.env = getEnvVars([
      'MAX_FEE_PER_TRANSACTION_USD',
      'MAX_FEE_PER_GAS_GWEI',
      'MAX_PRIORITY_FEE_PER_GAS_GWEI',
      'ALCHEMY_API_KEY_POLYGON_POS',
      'ETHERSCAN_API_KEY',
      'INFURA_API_KEY',
      'LOCAL_HARDHAT_MNEMONIC_PHRASE',
      'LOCAL_HARDHAT_PRIVATE_KEY',
      'LOCAL_HARDHAT_ADDRESS',
      'SEPOLIA_TESTNET_PRIVATE_KEY',
      'SEPOLIA_TESTNET_ADDRESS',
      'ETHEREUM_MAINNET_PRIVATE_KEY',
      'ETHEREUM_MAINNET_ADDRESS',
      'HELLO_WORLD_LOCAL_ADDRESS',
      'HELLO_WORLD_TESTNET_ADDRESS',
      'HELLO_WORLD_MAINNET_ADDRESS',
      'UPGRADEABLE_CONTRACT_LOCAL_ADDRESS',
      'UPGRADEABLE_CONTRACT_TESTNET_ADDRESS',
      'UPGRADEABLE_CONTRACT_MAINNET_ADDRESS',
    ], this.envFileName);
    // Validate the numeric env vars.
    validate.numericString({ name: 'MAX_FEE_PER_TRANSACTION_USD', value: this.env.MAX_FEE_PER_TRANSACTION_USD });
    validate.numericString({ name: 'MAX_FEE_PER_GAS_GWEI', value: this.env.MAX_FEE_PER_GAS_GWEI });
    validate.numericString({ name: 'MAX_PRIORITY_FEE_PER_GAS_GWEI', value: this.env.MAX_PRIORITY_FEE_PER_GAS_GWEI });
    // Derive additional env vars from existing ones.
    this.env.MAX_FEE_PER_GAS_WEI = Big(this.env.MAX_FEE_PER_GAS_GWEI).mul(10**9).toFixed(0);
    this.env.MAX_PRIORITY_FEE_PER_GAS_WEI = Big(this.env.MAX_PRIORITY_FEE_PER_GAS_GWEI).mul(10**9).toFixed(0);
    // Update some class attributes, using the env vars.
    let {
      MAX_FEE_PER_TRANSACTION_USD,
      MAX_FEE_PER_GAS_GWEI,
      MAX_PRIORITY_FEE_PER_GAS_GWEI,
    } = this.env;
    this.maxFeePerTransactionUsd = MAX_FEE_PER_TRANSACTION_USD;
    this.maxFeePerGasGwei = MAX_FEE_PER_GAS_GWEI;
    this.maxPriorityFeePerGasGwei = MAX_PRIORITY_FEE_PER_GAS_GWEI;
  }

  // Setters

  set maxFeePerGasGwei(newValue: string) {
    this._maxFeePerGasGwei = newValue;
    this.maxFeePerGasWei = ethers.parseUnits(newValue, 'gwei').toString();
  }

  get maxFeePerGasGwei(): string {
    return this._maxFeePerGasGwei;
  }

  set maxPriorityFeePerGasGwei(newValue: string) {
    this._maxPriorityFeePerGasGwei = newValue;
    this.maxPriorityFeePerGasWei = ethers.parseUnits(newValue, 'gwei').toString();
  }

}


// Export singleton instance of config

let config = new Config();
config.loadEnvVarsSync();

export default config;
