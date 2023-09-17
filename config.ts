// Package configuration values, stored in a class.

// Imports
import _ from "lodash";
import { ethers } from "ethers";

// Local imports
import validate from "#root/lib/validate";

/* Notes:
- The main application or script will load the config, apply changes from cmdline arguments and environment variables if required, and pass it to the other modules or functions as an object.
- When we create a transaction, we find the current averagePriorityFeePerGas, and multiply it by averagePriorityFeeMultiplier to get our transaction-specific value for maxPriorityFeePerGas. However, we don't permit it to be greater than maxPriorityFeePerGasGwei.
*/

class Config {
  maxFeePerTransactionUsd: string;
  _maxFeePerGasGwei: string;
  _maxPriorityFeePerGasGwei: string;
  gasLimitMultiplier: string;
  averagePriorityFeeMultiplier: string;
  eth_usd_price_url: string;
  maxFeePerGasWei: string;
  maxPriorityFeePerGasWei: string;
  networkLabelList: string[];
  mapNetworkLabelToNetwork: { [key: string]: string };
  logLevelList: string[];
  WEI_DP: number;
  GWEI_DP: number;
  ETH_DP: number;
  USD_DP: number;
  dummyAddress: string;
  envFileName: string;

  constructor() {
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
    this.mapNetworkLabelToNetwork = {
      local: "http://localhost:8545",
      testnet: "sepolia",
      mainnet: "mainnet",
    };
    this.logLevelList = "debug info warn error".split(" ");
    // DP = Decimal Places
    this.WEI_DP = 0;
    this.GWEI_DP = 9;
    this.ETH_DP = 18;
    this.USD_DP = 2;
    this.dummyAddress = "0x000000000000000000000000000000000000dEaD";
    this.envFileName = "user-config.env";
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

let config = new Config();
export { Config, config };
