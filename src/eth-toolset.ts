// Imports
import _ from 'lodash';
import axios from 'axios';
import Big from 'big.js';
import crypto from 'crypto';
import { ethers, Provider, TransactionRequest, keccak256, toUtf8Bytes } from 'ethers';


// Local imports
import amounts from '#src/amounts';
import config from '#root/config';
import lib from '#root/lib';
import { createLogger } from '#root/lib/logging';
import security from '#src/security';


// Components
const { utils, validate } = lib;
const jd = utils.jd;


// Controls
let logLevel = 'error';
logLevel = 'info';


// Logging
const { logger, log, deb } = createLogger({ filePath: __filename, logLevel });


class EthToolset {


  parent: any


  constructor() {
    this.parent = null;
  }


  createPrivateKey() {
    const randomBytes = crypto.randomBytes(32);
    const privateKey = `0x` + randomBytes.toString('hex');
    return privateKey;
  }


  privateKeyIsValid({
    privateKey,
    name,
  }: {
    privateKey: string | undefined;
    name?: string;
  }): { valid: boolean; msg: string } {
    let nameSection = !_.isUndefined(name) ? `${name} ` : '';
    if (_.isUndefined(privateKey)) {
      let msg = `Private key ${nameSection}("${privateKey}") is undefined.`;
      return { valid: false, msg };
      throw new Error(msg);
    }
    if (! ethers.isHexString(privateKey)) {
      let msg = `Private key ${nameSection}("${privateKey}") is not a hex string.`;
      return { valid: false, msg };
    }
    if (! ethers.isHexString(privateKey, 32)) {
      let msg = `Private key ${nameSection}("${privateKey}") is a hex string that it is ${ethers.dataLength(
        privateKey,
      )} bytes long. But: It should be 32 bytes long.`;
      return { valid: false, msg };
    }
    return { valid: true, msg: '' };
  }


  validatePrivateKey({
    privateKey,
    name,
  }: {
    privateKey: string | undefined;
    name?: string;
  }) {
    let { valid, msg } = this.privateKeyIsValid({ privateKey, name });
    if (!valid) {
      throw new Error(msg);
    }
    return true;
  }


  validatePrivateKeys({
    privateKeys,
  }: {
    privateKeys: Record<string, string | undefined>;
  }) {
    if (! _.keys(privateKeys).length) {
      throw new Error(`Private keys "${privateKeys}" must not be empty.`);
    }
    for (const [name, privateKey] of _.entries(privateKeys)) {
      this.validatePrivateKey({ privateKey, name });
    }
    return true;
  }


  deriveAddress({ privateKey }: { privateKey: string }) {
    this.validatePrivateKey({ privateKey });
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;
    return address;
  }


  validateAddress({ address, name }: { address: string | undefined; name?: string }) {
    let nameSection = !_.isUndefined(name) ? `${name} ` : '';
    if (_.isUndefined(address)) {
      let msg = `Address ${nameSection}("${address}") is undefined.`;
      throw new Error(msg);
    }
    if (! ethers.isAddress(address)) {
      let msg = `Address ${nameSection}("${address}") is invalid.`;
      throw new Error(msg);
    }
    return true;
  }


  validateAddresses({ addresses }: { addresses: Record<string, string | undefined> }) {
    if (! _.keys(addresses).length) {
      throw new Error(`Addresses "${addresses}" must not be empty.`);
    }
    for (const [name, address] of _.entries(addresses)) {
      this.validateAddress({ address, name });
    }
    return true;
  }


  async getBlockNumberAsync() {
    const provider = this.parent.provider;
    return await provider.getBlockNumber();
  }


  async getBalanceWeiAsync(address: string) {
    let balanceWei = await this.parent.provider.getBalance(address);
    return balanceWei;
  }


  async getBalanceEthAsync(address: string) {
    let balanceWei = await this.getBalanceWeiAsync(address);
    let balanceEth = ethers.formatEther(balanceWei);
    balanceEth = new Big(balanceEth).toFixed(config.constants.ETH_DECIMAL_PLACES);
    return balanceEth;
  }


  async getPriceEthInUsdAsync() {
    try {
      const response = await axios.get(config.priceEthInUsdUrl);
      let price = response.data.price;
      return Big(price).toFixed(config.constants.USD_DECIMAL_PLACES);
    } catch (error: any) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  }


  async getBalanceUsdAsync(address: string) {
    let balanceEth = await this.getBalanceEthAsync(address);
    let price = await this.getPriceEthInUsdAsync();
    let balanceUsd = Big(balanceEth).mul(Big(price)).toFixed(config.constants.USD_DECIMAL_PLACES);
    return balanceUsd;
  }


  async getBytecodeAsync(address: string) {
    if (!ethers.isAddress(address)) {
      throw new Error(`Address "${address}" is invalid.`);
    }
    const result = await this.parent.provider.getCode(address);
    return result;
  }


  async contractExistsAtAsync(address: string) {
    const result = await this.getBytecodeAsync(address);
    if (result == '0x') return false;
    return true;
  }


  async getGasPricesAsync() {
    const provider = this.parent.provider;
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
    // Convert values to Gwei and Ether.
    const baseFeePerGasGwei = ethers.formatUnits(baseFeePerGasWei, 'gwei');
    const baseFeePerGasEth = ethers.formatUnits(baseFeePerGasWei, 'ether');
    const gasPriceGwei = ethers.formatUnits(gasPriceWei, 'gwei');
    const gasPriceEth = ethers.formatUnits(gasPriceWei, 'ether');
    const averagePriorityFeePerGasGwei = ethers.formatUnits(averagePriorityFeePerGasWei, 'gwei');
    const averagePriorityFeePerGasEth = ethers.formatUnits(averagePriorityFeePerGasWei, 'ether');
    const basicPaymentCostEth = ethers.formatUnits(
      (BigInt(gasPriceWei) + BigInt(averagePriorityFeePerGasWei)) * 21000n,
      'ether',
    );
    const usdcTransferCostEth = ethers.formatUnits(
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
      baseFeePerGasEth,
      gasPriceGwei,
      gasPriceEth,
      averagePriorityFeePerGasGwei,
      averagePriorityFeePerGasEth,
      basicPaymentCostEth,
      usdcTransferCostEth,
    };
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


  getFeeLimitChecksObj(): { [key: string]: any } {
    let feeLimitKeys = 'baseFeePerGasWei baseFeeUsd maxFeeUsd'.split(' ');
    let feeLimitChecks: { [key: string]: any } = {};
    feeLimitKeys.forEach((key) => {
      feeLimitChecks[key] = { exceeded: false, msg: '' };
    });
    feeLimitChecks.limitExceededKeys = [];
    feeLimitChecks.anyLimitExceeded = false;
    return feeLimitChecks;
  }


  // Note: This only works for a single transaction.
  // It's difficult to estimate fees for a series of transactions...
  async estimateFeesForTxAsync(txRequest: TransactionRequest) {
    // We examine a specific transaction request and estimate its fees, taking into account the limits specified in config.
    const estimatedGasBigInt = await this.parent.provider.estimateGas(txRequest);
    const estimatedGas = estimatedGasBigInt.toString();
    deb(`estimatedGas: ${estimatedGas}`);
    return this.estimateFeesFromGasAsync(estimatedGas);
  }


  async estimateFeesFromGasAsync({
    provider,
    estimatedGas,
  }: {
    provider: Provider;
    estimatedGas: string | bigint;
  }) {
    estimatedGas = estimatedGas.toString();
    let feeLimitChecks = this.getFeeLimitChecksObj();
    const gasLimit = Big(estimatedGas).mul(Big(config.gasLimitMultiplier)).toFixed(0);
    deb(`gasLimit: ${gasLimit}`);
    const gasPrices = await this.getGasPricesWithFiatAsync();
    const { baseFeePerGasWei, baseFeePerGasGwei, averagePriorityFeePerGasWei, priceEthInUsd } = gasPrices;
    // Check if the base-fee-per-gas is greater than our Wei limit.
    if (Big(baseFeePerGasWei).gt(Big(config.maxFeePerGasWei))) {
      let msg = `Current base fee per gas (${baseFeePerGasGwei} gwei, ${baseFeePerGasWei} wei) exceeds limit specified in config (${config.maxFeePerGasGwei} gwei, ${config.maxFeePerGasWei} wei).`;
      feeLimitChecks.baseFeePerGasWei = { exceeded: true, msg };
    }
    // Check if the base fee is greater than our USD limit.
    const baseFeeWei = Big(estimatedGas).mul(Big(baseFeePerGasWei)).toFixed(config.constants.WEI_DECIMAL_PLACES);
    deb(`baseFeeWei: ${baseFeeWei} wei`);
    const baseFeeGwei = ethers.formatUnits(baseFeeWei, 'gwei');
    const baseFeeEth = ethers.formatEther(baseFeeWei).toString();
    const baseFeeUsd = Big(baseFeeEth).mul(Big(priceEthInUsd)).toFixed(config.constants.USD_DECIMAL_PLACES);
    deb(`baseFeeUsd: ${baseFeeUsd} USD`);
    if (Big(baseFeeUsd).gt(Big(config.maxFeePerTransactionUsd))) {
      let msg = `Base fee (${baseFeeUsd} USD) exceeds limit specified in config (${config.maxFeePerTransactionUsd} USD).`;
      msg += ` Current base fee is ${baseFeeGwei} gwei (${baseFeeWei} wei, ${baseFeeEth} ETH). Current ETH-USD exchange rate is ${priceEthInUsd} USD.`;
      feeLimitChecks.baseFeeUsd = { exceeded: true, msg };
    }
    // Calculate a maxFeePerGasWei for this transaction, based on the current ETH-USD price.
    // - Using this limit will prevent the later addition of a priority fee from exceeding our USD limit.
    const feeLimitEth = Big(config.maxFeePerTransactionUsd).div(Big(priceEthInUsd)).toFixed(config.constants.ETH_DECIMAL_PLACES);
    deb(`feeLimitEth: ${feeLimitEth} ETH`);
    const feeLimitWei = ethers.parseEther(feeLimitEth).toString();
    deb(`feeLimitWei: ${feeLimitWei} wei`);
    const maxFeePerGasWei = Big(feeLimitWei).div(Big(estimatedGas)).toFixed(config.constants.WEI_DECIMAL_PLACES);
    deb(`maxFeePerGasWei: ${maxFeePerGasWei} wei`);
    // Calculate a max-priority-fee-per-gas for this transaction.
    // - We choose a max priority fee that is a multiple of the average priority fee.
    // - If it exceeds our max-priority-fee-per-gas limit (set in config), reduce it to the limit.
    let maxPriorityFeePerGasWei = Big(averagePriorityFeePerGasWei)
      .mul(Big(config.averagePriorityFeeMultiplier))
      .toFixed(config.constants.WEI_DECIMAL_PLACES);
    if (Big(maxPriorityFeePerGasWei).gt(Big(config.maxPriorityFeePerGasWei))) {
      let msg = `Max priority fee per gas (${maxPriorityFeePerGasWei} wei) exceeds limit specified in config (${config.maxPriorityFeePerGasWei} wei).`;
      msg += ` Using config limit instead.`;
      let comparatorWord = Big(averagePriorityFeePerGasWei).gt(Big(config.maxPriorityFeePerGasWei))
        ? 'greater'
        : 'less';
      msg += ` Note: averagePriorityFeePerGasWei = ${averagePriorityFeePerGasWei} wei, which is ${comparatorWord} than config limit.`;
      deb(msg);
      maxPriorityFeePerGasWei = config.maxPriorityFeePerGasWei;
    }
    deb(`maxPriorityFeePerGasWei: ${maxPriorityFeePerGasWei} wei`);
    // Calculate the max possible fee.
    const maxPriorityFeeWei = Big(estimatedGas)
      .mul(Big(maxPriorityFeePerGasWei))
      .toFixed(config.constants.WEI_DECIMAL_PLACES);
    deb(`maxPriorityFeeWei: ${maxPriorityFeeWei} wei`);
    const maxPriorityFeeGwei = ethers.formatUnits(maxPriorityFeeWei, 'gwei');
    const maxPriorityFeeEth = ethers.formatEther(maxPriorityFeeWei).toString();
    const maxPriorityFeeUsd = Big(maxPriorityFeeEth).mul(Big(priceEthInUsd)).toFixed(config.constants.USD_DECIMAL_PLACES);
    const maxFeeWei = Big(baseFeeWei).plus(Big(maxPriorityFeeWei)).toFixed(config.constants.WEI_DECIMAL_PLACES);
    deb(`maxFeeWei: ${maxFeeWei} wei`);
    const maxFeeGwei = ethers.formatUnits(maxFeeWei, 'gwei');
    const maxFeeEth = ethers.formatEther(maxFeeWei).toString();
    const maxFeeUsd = Big(maxFeeEth).mul(Big(priceEthInUsd)).toFixed(config.constants.USD_DECIMAL_PLACES);
    deb(`maxFeeUsd: ${maxFeeUsd} USD`);
    // Handle the situation where the base fee is below the limit, but the max fee is above it.
    if (
      !feeLimitChecks.baseFeeUsd.exceeded &&
      Big(maxFeeUsd).gt(Big(config.maxFeePerTransactionUsd))
    ) {
      let msg = `Max fee (${maxFeeUsd} USD) exceeds limit specified in config (${config.maxFeePerTransactionUsd} USD).`;
      let unusablePriorityFeeUsd = Big(maxFeeUsd)
        .minus(Big(config.maxFeePerTransactionUsd))
        .toFixed(config.constants.USD_DECIMAL_PLACES);
      let unusablePriorityFeeEth = Big(unusablePriorityFeeUsd)
        .div(Big(priceEthInUsd))
        .toFixed(config.constants.ETH_DECIMAL_PLACES);
      let unusablePriorityFeeWei = ethers.parseEther(unusablePriorityFeeEth).toString();
      let unusablePriorityFeeGwei = ethers.formatUnits(unusablePriorityFeeWei, 'gwei');
      let msg2 = ` The transaction won't be able to use its entire priority fee. Unusable amount = (${unusablePriorityFeeGwei} Gwei, ${unusablePriorityFeeUsd} USD), out of total available = (${maxPriorityFeeGwei} gwei, ${maxPriorityFeeUsd} USD).`;
      msg += msg2;
      deb(msg);
      feeLimitChecks.maxFeeUsd = { exceeded: true, msg };
    }
    // Note: We assume here that the fee will use the entire available priority fee, but it might not.
    let feeWei = maxFeeWei;
    let feeGwei = maxFeeGwei;
    let feeEth = maxFeeEth;
    let feeUsd = maxFeeUsd;
    // If we've passed a USD feeLimit, we re-calculate the final fee estimates backwards from maxFeePerTransactionUsd.
    if (feeLimitChecks.baseFeeUsd.exceeded || feeLimitChecks.maxFeeUsd.exceeded) {
      feeUsd = config.maxFeePerTransactionUsd;
      feeEth = Big(feeUsd).div(Big(priceEthInUsd)).toFixed(config.constants.ETH_DECIMAL_PLACES);
      feeWei = ethers.parseEther(feeEth).toString();
      feeGwei = ethers.formatUnits(feeWei, 'gwei');
    }
    // Set the anyLimitExceeded flag.
    feeLimitChecks.limitExceededKeys = Object.keys(feeLimitChecks).filter(
      (key) => feeLimitChecks[key].exceeded,
    );
    feeLimitChecks.anyLimitExceeded = feeLimitChecks.limitExceededKeys.length > 0;
    return {
      gasPrices,
      estimatedGas,
      gasLimit,
      maxFeePerGasWei,
      maxPriorityFeePerGasWei,
      baseFeeWei,
      baseFeeGwei,
      baseFeeEth,
      baseFeeUsd,
      maxPriorityFeeWei,
      maxPriorityFeeGwei,
      maxPriorityFeeEth,
      maxPriorityFeeUsd,
      feeWei,
      feeGwei,
      feeEth,
      feeUsd,
      feeLimitChecks,
    };
  }


  async sendEth({
    networkLabel,
    provider,
    senderAddress,
    receiverAddress,
    amountEth,
  }: {
    networkLabel: string;
    provider: Provider;
    senderAddress: string;
    receiverAddress: string;
    amountEth: string;
  }) {
    let amountWei = amounts.ethToWei({ amountEth });
    let nonce = await provider.getTransactionCount(senderAddress);
    let chainId = await provider.getNetwork().then((network) => network.chainId);
    deb(
      `Sending ${amountEth} ETH from ${senderAddress} to ${receiverAddress} on network=${networkLabel} (chainId=${chainId})...`,
    );
    let basicPaymentGasLimit = '21000';
    let txRequest = {
      type: 2,
      chainId,
      from: senderAddress,
      nonce,
      gasLimit: BigInt(basicPaymentGasLimit),
      to: receiverAddress,
      value: BigInt(amountWei),
    };
    let estimatedFees = await this.estimateFeesForTxAsync(txRequest);
    //deb(estimatedFees)
    const { maxFeePerGasWei, maxPriorityFeePerGasWei, feeEth, feeUsd, feeLimitChecks } =
      estimatedFees;
    if (feeLimitChecks.anyLimitExceeded) {
      for (let key of feeLimitChecks.limitExceededKeys) {
        let check = feeLimitChecks[key];
        throw new Error(`${key}: ${check.msg}`);
      }
    }
    const gasPrices = estimatedFees.gasPrices;
    const { priceEthInUsd } = gasPrices;
    _.assign(txRequest, {
      maxFeePerGas: BigInt(maxFeePerGasWei),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGasWei),
    });
    let txResponse = await this.signAndSendTransactionAsync({
      networkLabel,
      provider,
      senderAddress,
      txRequest,
    });
    return txResponse;
  }


  async signAndSendTransactionAsync({
    networkLabel,
    senderAddress,
    txRequest,
  }: {
    networkLabel: string;
    provider: Provider;
    senderAddress: string;
    txRequest: TransactionRequest;
  }) {
    let provider = this.parent.provider;
    let txSigned = await security.signTransaction({
      networkLabel,
      provider,
      senderAddress,
      txRequest,
    });
    //log(`txSigned: ${txSigned}`)
    let txResponse = await provider.broadcastTransaction(txSigned);
    let { hash } = txResponse;
    deb(`Transaction broadcast to network. Hash: ${hash}`);
    return txResponse;
  }


  async getTxConfirmsAsync(txHash: string) {
    let provider = this.parent.provider;
    let blockNumber = await provider.getBlockNumber();
    //deb(`blockNumber=${blockNumber}`)
    let txReceipt = await provider.getTransactionReceipt(txHash);
    if (txReceipt == null) {
      //deb(`Transaction ${txHash} not found.`)
      return 0;
    }
    //deb(`txReceipt.blockNumber=${txReceipt.blockNumber}`)
    let confirmations = blockNumber - txReceipt.blockNumber + 1;
    return confirmations;
  }


  async getTxFeesAsync(txHash: string) {
    // We assume that the transaction is type 2 (EIP-1559).
    let txReceipt = await this.parent.provider.getTransactionReceipt(txHash);
    if (txReceipt == null) {
      //deb(`Transaction ${txHash} not found.`)
      return {};
    }
    //let { gasUsed, gasPrice: effectiveGasPrice} = txReceipt;
    let txFeeWei = txReceipt.fee.toString();
    let txFeeEth = amounts.weiToEth({ amountWei: txFeeWei });
    return {
      txFeeWei,
      txFeeEth,
    };
  }


  getCanonicalSignature(signature: string): string {
    // Match the function name and parameters
    const match = signature.match(/(\w+)\((.*)\)/);
    if (!match) {
        throw new Error('Invalid function signature');
    }

    // Extract the function name and parameters string
    const functionName: string = match[1];
    const parameters: string = match[2];

    // Split parameters into an array, remove names and 'indexed' keyword, keeping only the types
    const canonicalParams: string = parameters.split(',').map(param => {
        // Extract only the type (first word)
        const type: string = param.trim().split(/\s+/)[0];
        return type;
    }).join(',');

    // Reconstruct the canonical function signature
    return `${functionName}(${canonicalParams})`;
  }




  /* ERC20 functions */


  async getERC20TransfersFromTransactionsAsync(contractAddress: string, blockNumber: number): Promise<Array<Transfer>> {
    /* Notes
    - This function analyzes the transactions in a block to find ERC20 Transfers for the specified contract address.
    - However, it cannot detect transfers that were made within a smart contract.
    -- For these transfers, we need to look at the event history instead.
    */
    const logHere = false;
    const log3 = (msg: string) => { if (logHere) { log(msg) } }
    let provider = this.parent.provider;
    const block = await provider.getBlock(blockNumber, true);
    if (! block) {
      throw new Error(`Block ${blockNumber} not found.`);
    }
    //log3(`- Block ${blockNumber}: hash = ${block.hash}`)
    const nTransactions = block.length;
    log3(`Block ${blockNumber} has ${nTransactions} transactions`);
    let transfers: Transfer[] = [];
    for (const [i, txHash] of block.transactions.entries()) {
      const tx = await provider.getTransaction(txHash);
      if (! tx) {
        throw new Error(`Transaction ${i} not found.`);
      }
      //log(`Transaction ${i}: hash = ${txHash}`);
      if (tx.to && tx.to.toLowerCase() === contractAddress.toLowerCase()) {
        const txReceipt = await provider.getTransactionReceipt(txHash);
        if (! txReceipt) {
          throw new Error(`Transaction receipt not found for transaction ${i} (txHash = ${txHash})`);
        }
        const logs = txReceipt.logs;
        for (const [j, log_] of logs.entries()) {
          // Confirm ERC20 Transfer event by analyzing the signature.
          const signature = 'Transfer(address indexed _from, address indexed _to, uint256 _value)'
          let canonicalSig = this.getCanonicalSignature(signature)
          let hashSig = keccak256(toUtf8Bytes(canonicalSig))
          let logSig = log_.topics[0];
          let isTransferEvent = logSig.toLowerCase() === hashSig.toLowerCase();
          let arg1 = log_.topics[1];
          let arg2 = log_.topics[2];
          let from = ethers.getAddress(arg1.substring(26));
          let to = ethers.getAddress(arg2.substring(26));
          let data = log_.data;
          const dataLength = log_.data.length;
          const dataItems = (dataLength - 2) / 64;
          log3(`Transaction ${i} (txHash = ${txHash}):\n-- Log ${j} of ${logs.length}: Transfer event detected.\n-- From: ${arg1}, To: ${arg2}, Value: ${data}`);
          if (isTransferEvent) {
            if (dataItems !== 1) {
              let msg = `Unexpected number of data items: ${dataItems}`;
              msg += `\n - from: ${from}`;
              msg += `\n - to: ${to}`;
              msg += `\n - data: ${data}`;
              throw new Error(msg);
            }
            const value = BigInt(parseInt(data, 16));
            //log3(`- Transaction ${i} (txHash = ${txHash}): Log ${j} of ${logs.length}: Transfer event detected. From: ${arg1}, To: ${arg2}, Value: ${value}`);
            transfers.push({ blockNumber, txHash, from, to, value });
          }
        }
      }
    }
    return this.sortTransfers(transfers);
  }


  sortTransfers(transfers: Transfer[]): Transfer[] {
    return transfers.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
            return a.blockNumber - b.blockNumber;
        }
        if (a.txHash !== b.txHash) {
            return a.txHash.localeCompare(b.txHash);
        }
        if (a.from !== b.from) {
            return a.from.localeCompare(b.from);
        }
        if (a.to !== b.to) {
            return a.to.localeCompare(b.to);
        }
        return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
    });
  }


  validateTransferListsAreEqual(list1: Transfer[], list2: Transfer[]): void {
    // Helper function to find different items in two lists of Transfers.
    const difference = (a: Transfer[], b: Transfer[]) => {
      return a.filter(itemA =>
        !b.some(itemB =>
          itemA.blockNumber === itemB.blockNumber &&
          itemA.txHash === itemB.txHash &&
          itemA.from === itemB.from &&
          itemA.to === itemB.to &&
          itemA.value === itemB.value
        )
      );
    };
    // Find items in list1 that are not in list2
    const notInList2 = difference(list1, list2);
    if (notInList2.length > 0) {
      throw new Error(`The following items are in list1 but not in list2:\n${jd(notInList2)}`);
    }
    // Find items in list2 that are not in list1
    const notInList1 = difference(list2, list1);
    if (notInList1.length > 0) {
      throw new Error(`The following items are in list2 but not in list1:\n${jd(notInList1)}`);
    }
    log("Both lists contain matching items.");
  }


  logTransferList(transfers: Transfer[], title: string): void {
    let msg = `\nTransfer List: ${title}:`
    if (transfers.length === 0) {
      msg += ' No transfers found.';
    } else {
      transfers.forEach((transfer, index) => {
        msg += `\n- Transfer ${index + 1}:`;
        msg += `\n    Block Number: ${transfer.blockNumber}`;
        msg += `\n    Transaction Hash: ${transfer.txHash}`;
        msg += `\n    From: ${transfer.from}`;
        msg += `\n    To: ${transfer.to}`;
        msg += `\n    Value: ${transfer.value.toString()} wei`;
      });
    }
    log(msg);
  }


  async getERC20TransfersFromEventsAsync(blockNumber: number, contract: ethers.Contract): Promise<Array<Transfer>> {
    const eventName = 'Transfer';
    const transfers = await this.getEventsAsync(contract, eventName, blockNumber);
    return transfers;
  }


  async getEventsAsync(
    contract: ethers.Contract,
    eventName: string,
    blockNumber: number,
  ): Promise<Array<Transfer>> {
    const endBlockNumber = blockNumber;
    const events = await contract.queryFilter(eventName, blockNumber, endBlockNumber);
    let transfers: Transfer[] = [];
    for (const event_ of events) {
      // event_: ethers.EventLog | ethers.Log
      if (! this.isEventLog(event_)) {
        const logData = JSON.stringify(event_);
        const errorMessage = `Unexpected log type encountered. Log data: ${logData}`;
        throw new Error(errorMessage);
      }
      const { from, to, value } = event_.args;
      const transfer: Transfer = { blockNumber, txHash: event_.transactionHash, from, to, value };
      transfers.push(transfer);
    }
    return this.sortTransfers(transfers);
  }


  isEventLog(pet: ethers.EventLog | ethers.Log): pet is ethers.EventLog {
    return (pet as ethers.EventLog).args !== undefined;
  }


}



// Exports
export {
  EthToolset,
}
export default new EthToolset();
