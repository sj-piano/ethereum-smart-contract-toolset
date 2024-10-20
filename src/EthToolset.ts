// Imports
import _ from 'lodash';
import axios from 'axios';
import Big from 'big.js';
import { ethers } from 'ethers';


// Internal imports
import config from '#root/config';


// Local imports
import { IToolset, ToolsetBase } from './ToolsetBase';




export class EthToolset extends ToolsetBase implements IToolset {


  symbol = 'ETH';





  async getPriceEthInUsdAsync() {
    try {
      const response = await axios.get(config.priceEthInUsdUrl);
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
    const priceEthInUsd = await this.getPriceEthInUsdAsync();
    const baseFeePerGasUsd = Big(gasPrices.baseFeePerGasEth)
      .mul(Big(priceEthInUsd))
      .toFixed(config.constants.ETH_DECIMAL_PLACES);
    const gasPriceUsd = Big(gasPrices.gasPriceEth).mul(Big(priceEthInUsd)).toFixed(config.constants.ETH_DECIMAL_PLACES);
    const averagePriorityFeePerGasUsd = Big(gasPrices.averagePriorityFeePerGasEth)
      .mul(Big(priceEthInUsd))
      .toFixed(config.constants.ETH_DECIMAL_PLACES);
    const basicPaymentCostUsd = Big(gasPrices.basicPaymentCostEth)
      .mul(Big(priceEthInUsd))
      .toFixed(config.constants.USD_DECIMAL_PLACES);
      const usdcTransferCostUsd = Big(gasPrices.usdcTransferCostEth)
      .mul(Big(priceEthInUsd))
      .toFixed(config.constants.USD_DECIMAL_PLACES);
    return {
      ...gasPrices,
      priceEthInUsd,
      baseFeePerGasUsd,
      gasPriceUsd,
      averagePriorityFeePerGasUsd,
      basicPaymentCostUsd,
      usdcTransferCostUsd,
    };
  }


  async getBalanceEthAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceEth = ethers.formatEther(balanceWei);
    return balanceEth;
  }


  async getBalanceInfoAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceEth = await this.getBalanceEthAsync(address);
    let balanceUsd = Big(balanceEth).mul(Big(await this.getPriceEthInUsdAsync())).toFixed(config.constants.USD_DECIMAL_PLACES);
    return {
      balanceWei,
      balance: balanceEth,
      symbol: this.symbol,
      balanceUsd,
    };
  }


}


export default EthToolset;

