// Imports
import _ from 'lodash';
import axios from 'axios';
import Big from 'big.js';
import { ethers, Provider, TransactionRequest } from 'ethers';

// Local imports
import config from '#root/config';
import { createLogger } from '#root/lib/logging';
import ethToolset from '#root/src/eth-toolset';


// Controls
let logLevel = 'error';
logLevel = 'info';


// Logging
const { logger, log, lj, deb } = createLogger({ filePath: __filename, logLevel });


class MaticToolset {


  parent: any;


  constructor() {
    this.parent = null;
  }


  // Reuse methods from ethToolset where possible.
  getBlockNumberAsync = ethToolset.getBlockNumberAsync.bind(this);
  getBalanceWeiAsync = ethToolset.getBalanceWeiAsync.bind(this);


  async getBalanceMaticAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceMatic = ethers.formatEther(balanceWei);
    balanceMatic = new Big(balanceMatic).toFixed(config.constants.MATIC_DECIMAL_PLACES);
    return balanceMatic;
  }


  async getPriceMaticInUsdAsync() {
    try {
      const response = await axios.get(config.priceMaticInUsdUrl);
      const price = response.data.price;
      return price;
    } catch (error: any) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  }

  async getBalanceUsdAsync(address: string) {
    let balanceMatic = await this.getBalanceMaticAsync(address);
    let price = await this.getPriceMaticInUsdAsync();
    let balanceUsd = Big(balanceMatic).mul(Big(price)).toFixed(config.constants.USD_DECIMAL_PLACES);
    return balanceUsd;
  }


  async getGasPricesAsync() {
    let method = ethToolset.getGasPricesAsync.bind(this);
    let x: any = await method();
    let replacements = [
      ['baseFeePerGasEth', 'baseFeePerGasMatic'],
      ['gasPriceEth', 'gasPriceMatic'],
      ['averagePriorityFeePerGasEth', 'averagePriorityFeePerGasMatic'],
      ['basicPaymentCostEth', 'basicPaymentCostMatic'],
      ['usdcTransferCostEth', 'usdcTransferCostMatic'],
    ];
    for (let replacement of replacements) {
      let [key1, key2] = replacement;
      x[key2] = x[key1];
      delete x[key1];
    }
    return x;
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


}


// Exports
export default new MaticToolset();;
