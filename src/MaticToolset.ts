// Imports
import _ from 'lodash';
import axios from 'axios';
import Big from 'big.js';
import { ethers } from 'ethers';


// Internal imports
import config from '#root/config';


// Local imports
import { IToolset, ToolsetBase } from './ToolsetBase';


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logger
import { createLogger } from '#root/utils/logging';
const { logger, log, deb, lj, dj } = createLogger();



export class MaticToolset extends ToolsetBase implements IToolset {


  symbol = 'MATIC';


  // Override the getGasPricesAsync method from the base class
  async getGasPricesAsync(): Promise<Record<string, string>> {
    // Call the base method
    let gasPrices = await super.getGasPricesAsync();
    // Map the Ethereum-related keys to Matic-related keys
    const replacements: Record<string, string> = {
      baseFeePerGasEth: 'baseFeePerGasMatic',
      gasPriceEth: 'gasPriceMatic',
      averagePriorityFeePerGasEth: 'averagePriorityFeePerGasMatic',
      basicPaymentCostEth: 'basicPaymentCostMatic',
      usdcTransferCostEth: 'usdcTransferCostMatic',
    };
    // Replace the keys in the gasPrices object
    for (const [oldKey, newKey] of Object.entries(replacements)) {
      if (gasPrices[oldKey]) {
        gasPrices[newKey] = gasPrices[oldKey];
        delete gasPrices[oldKey];
      }
    }
    return gasPrices;
  }


  async getPriceMaticInUsdAsync() {
    try {
      const response = await axios.get(config.priceMaticInUsdUrl);
      const priceEthInUSD = response.data.data.amount;
      return Big(priceEthInUSD).toFixed(config.constants.USD_DECIMAL_PLACES);
    } catch (error: any) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  }


  async getGasPricesWithFiatAsync() {
    // Include fiat values for gas prices.
    const gasPrices = await this.getGasPricesAsync();
    const priceMaticInUsd = await this.getPriceMaticInUsdAsync();
    const baseFeePerGasUsd = Big(gasPrices.baseFeePerGasMatic)
      .mul(Big(priceMaticInUsd))
      .toFixed(config.constants.MATIC_DECIMAL_PLACES);
    const gasPriceUsd = Big(gasPrices.gasPriceMatic).mul(Big(priceMaticInUsd)).toFixed(config.constants.MATIC_DECIMAL_PLACES);
    const averagePriorityFeePerGasUsd = Big(gasPrices.averagePriorityFeePerGasMatic)
      .mul(Big(priceMaticInUsd))
      .toFixed(config.constants.MATIC_DECIMAL_PLACES);
    const basicPaymentCostUsd = Big(gasPrices.basicPaymentCostMatic)
      .mul(Big(priceMaticInUsd))
      .toFixed(config.constants.USD_DECIMAL_PLACES);
    const usdcTransferCostUsd = Big(gasPrices.usdcTransferCostMatic)
      .mul(Big(priceMaticInUsd))
      .toFixed(config.constants.USD_DECIMAL_PLACES);
    return {
      ...gasPrices,
      priceMaticInUsd,
      baseFeePerGasUsd,
      gasPriceUsd,
      averagePriorityFeePerGasUsd,
      basicPaymentCostUsd,
      usdcTransferCostUsd,
    };
  }


  async getBalanceMaticAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceMatic = ethers.formatEther(balanceWei);
    return balanceMatic;
  }


  async getBalanceInfoAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceEth = await this.getBalanceMaticAsync(address);
    let balanceUsd = Big(balanceEth).mul(Big(await this.getPriceMaticInUsdAsync())).toFixed(config.constants.USD_DECIMAL_PLACES);
    return {
      balanceWei,
      balance: balanceEth,
      symbol: this.symbol,
      balanceUsd,
    };
  }


}


export default MaticToolset;

