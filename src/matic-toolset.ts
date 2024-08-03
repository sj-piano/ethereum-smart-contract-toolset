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


// Functions


async function getGasPrices({ provider }: { provider: Provider }) {
  const block = await provider.getBlock('latest');
  const blockNumber = block?.number.toString() ?? null;
  const baseFeePerGasWei = block?.baseFeePerGas?.toString() ?? null;
  const feeData = await provider.getFeeData();
  const { gasPrice } = feeData;
  const gasPriceWei = gasPrice?.toString() ?? null;
  if (_.isNull(baseFeePerGasWei) || _.isNull(gasPriceWei)) {
    throw new Error('Error fetching gas prices.');
  }
  const averagePriorityFeePerGasWei = (BigInt(gasPriceWei) - BigInt(baseFeePerGasWei)).toString();
  // Convert values to Gwei and Matic.
  const baseFeePerGasGwei = ethers.formatUnits(baseFeePerGasWei, 'gwei');
  const baseFeePerGasMatic = ethers.formatUnits(baseFeePerGasWei, 'ether');
  const gasPriceGwei = ethers.formatUnits(gasPriceWei, 'gwei');
  const gasPriceMatic = ethers.formatUnits(gasPriceWei, 'ether');
  const averagePriorityFeePerGasGwei = ethers.formatUnits(averagePriorityFeePerGasWei, 'gwei');
  const averagePriorityFeePerGasMatic = ethers.formatUnits(averagePriorityFeePerGasWei, 'ether');
  const basicPaymentCostMatic = ethers.formatUnits(
    (BigInt(gasPriceWei) + BigInt(averagePriorityFeePerGasWei)) * 21000n,
    'ether',
  );
  const usdcTransferCostMatic = ethers.formatUnits(
    (BigInt(gasPriceWei) + BigInt(averagePriorityFeePerGasWei)) * 50000n,
    'ether',
  );
  return {
    blockNumber,
    baseFeePerGasWei,
    gasPriceWei,
    averagePriorityFeePerGasWei,
    // Gwei and Ether values:
    baseFeePerGasGwei,
    baseFeePerGasMatic,
    gasPriceGwei,
    gasPriceMatic,
    averagePriorityFeePerGasGwei,
    averagePriorityFeePerGasMatic,
    basicPaymentCostMatic,
    usdcTransferCostMatic,
  };
}


async function getMaticPriceInUsd() {
  try {
    const response = await axios.get(config.maticUsdPriceUrl);
    const price = response.data.price;
    return price;
  } catch (error: any) {
    console.error('Error fetching price:', error.message);
    throw error;
  }
}


async function getGasPricesWithFiat({ provider }: { provider: Provider }) {
  // Include fiat values for gas prices.
  const gasPrices = await getGasPrices({ provider });
  const maticToUsd = await getMaticPriceInUsd();
  const baseFeePerGasUsd = Big(gasPrices.baseFeePerGasMatic)
    .mul(Big(maticToUsd))
    .toFixed(config.constants.ETH_DECIMAL_PLACES);
  const gasPriceUsd = Big(gasPrices.gasPriceMatic).mul(Big(maticToUsd)).toFixed(config.constants.ETH_DECIMAL_PLACES);
  const averagePriorityFeePerGasUsd = Big(gasPrices.averagePriorityFeePerGasMatic)
    .mul(Big(maticToUsd))
    .toFixed(config.constants.ETH_DECIMAL_PLACES);
  const basicPaymentCostUsd = Big(gasPrices.basicPaymentCostMatic)
    .mul(Big(maticToUsd))
    .toFixed(config.constants.USD_DECIMAL_PLACES);
  const usdcTransferCostUsd = Big(gasPrices.usdcTransferCostMatic)
    .mul(Big(maticToUsd))
    .toFixed(config.constants.USD_DECIMAL_PLACES);
  return {
    ...gasPrices,
    maticToUsd,
    baseFeePerGasUsd,
    gasPriceUsd,
    averagePriorityFeePerGasUsd,
    basicPaymentCostUsd,
    usdcTransferCostUsd,
  };
}




const maticToolset = {
  ...ethToolset, // Copy all functions from ethToolset
  // Override specific methods
  getGasPrices,
  getMaticPriceInUsd,
  getGasPricesWithFiat,
};


if ('getEthereumPriceInUsd' in maticToolset) {
  delete (maticToolset as any).getEthereumPriceInUsd;
}


// Exports
export default maticToolset;
