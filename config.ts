// Package configuration values, stored in a class.

// Imports
import _ from "lodash";
import Big from "big.js";
import dotenv from "dotenv";
import { ethers } from "ethers";
import path from "path";

// Local imports
import constants from "#lib/constants";
import { createLogger } from "#lib/logging";
import { getEnvVars } from '#lib/env-vars';
import validate from "#root/lib/validate";

// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();

// Language adjustments


BigInt.prototype["toJSON"] = function () {
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
  eth_usd_price_url: string;
  gasLimitMultiplier: string;
  infuraApiMainnetUrlBase: string = 'https://mainnet.infura.io/v3';
  _maxFeePerGasGwei: string;
  _maxPriorityFeePerGasGwei: string;
  maxFeePerGasWei: string;
  maxFeePerTransactionUsd: string;
  maxPriorityFeePerGasWei: string;
  networkLabelList: string[];
  networkLabelToNetwork: { [key: string]: string };
  logLevelList: string[];
  dummyAddress: string;

  constructor() {
    this.envFileName = "user-config.env";
    // Note: maxFeePerTransactionUsd overrides the other fee limits.
    this.maxFeePerTransactionUsd = "0";
    this._maxFeePerGasGwei = "0";
    this._maxPriorityFeePerGasGwei = "0";
    this.gasLimitMultiplier = "1.0";
    this.averagePriorityFeeMultiplier = "1.0";
    this.eth_usd_price_url = "https://api.pro.coinbase.com/products/ETH-USD/ticker";
    this.maxFeePerGasWei = "0";
    this.maxPriorityFeePerGasWei = "0";
    this.networkLabelList = "local testnet mainnet".split(" ");
    this.networkLabelToNetwork = {
      local: "http://localhost:8545",
      testnet: "sepolia",
      mainnet: "mainnet",
    };
    this.logLevelList = "debug info warn error".split(" ");
    this.dummyAddress = "0x000000000000000000000000000000000000dEaD";
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
      'INFURA_API_KEY',
      'ETHERSCAN_API_KEY',
      'LOCAL_HARDHAT_MNEMONIC_PHRASE',
      'LOCAL_HARDHAT_PRIVATE_KEY',
      'LOCAL_HARDHAT_ADDRESS',
      'ETHEREUM_MAINNET_PRIVATE_KEY',
      'ETHEREUM_MAINNET_ADDRESS',
    ], this.envFileName);
    // Derive additional env vars from existing ones.
    this.env.INFURA_API_MAINNET_URL = this.infuraApiMainnetUrlBase + '/' + this.env.INFURA_API_KEY;
    this.env.MAX_FEE_PER_GAS_WEI = Big(this.env.MAX_FEE_PER_GAS_GWEI).mul(10**9).toFixed(0);
    this.env.MAX_PRIORITY_FEE_PER_GAS_WEI = Big(this.env.MAX_PRIORITY_FEE_PER_GAS_GWEI).mul(10**9).toFixed(0);
  }

  // Setters

  set maxFeePerGasGwei(newValue: string) {
    this._maxFeePerGasGwei = newValue;
    this.maxFeePerGasWei = ethers.parseUnits(newValue, "gwei").toString();
  }

  get maxFeePerGasGwei(): string {
    return this._maxFeePerGasGwei;
  }

  set maxPriorityFeePerGasGwei(newValue: string) {
    this._maxPriorityFeePerGasGwei = newValue;
    this.maxPriorityFeePerGasWei = ethers.parseUnits(newValue, "gwei").toString();
  }

  // Methods

  update({
    MAX_FEE_PER_TRANSACTION_USD,
    MAX_FEE_PER_GAS_GWEI,
    MAX_PRIORITY_FEE_PER_GAS_GWEI,
  }: {
    MAX_FEE_PER_TRANSACTION_USD: string | undefined;
    MAX_FEE_PER_GAS_GWEI: string | undefined;
    MAX_PRIORITY_FEE_PER_GAS_GWEI: string | undefined;
  }): void {
    if (!_.isNil(MAX_FEE_PER_GAS_GWEI)) {
      this.maxFeePerTransactionUsd = validate.numericString({
        name: "MAX_FEE_PER_TRANSACTION_USD",
        value: String(MAX_FEE_PER_TRANSACTION_USD),
      });
    }
    if (!_.isNil(MAX_FEE_PER_GAS_GWEI)) {
      this.maxFeePerGasGwei = validate.numericString({
        name: "MAX_FEE_PER_GAS_GWEI",
        value: String(MAX_FEE_PER_GAS_GWEI),
      });
    }
    if (!_.isNil(MAX_PRIORITY_FEE_PER_GAS_GWEI)) {
      this.maxPriorityFeePerGasGwei = validate.numericString({
        name: "MAX_PRIORITY_FEE_PER_GAS_GWEI",
        value: String(MAX_PRIORITY_FEE_PER_GAS_GWEI),
      });
    }
  }
}


// Export singleton instance of config


let config = new Config();
config.loadEnvVarsSync();

export default config;
