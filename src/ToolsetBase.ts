// Imports
import _ from 'lodash';
import axios from 'axios';
import Big from 'big.js';
import crypto from 'crypto';
import { ethers } from 'ethers';


// Internal imports
import config from '#root/config';


// Logger
import { createLogger } from '#root/utils/logging';
const { logger, log, deb, lj, dj } = createLogger({ filePath: __filename });




// Interfaces


export interface IToolset {
  provider: ethers.Provider | null;
  addresses: {
    USDC_CONTRACT_ADDRESS?: string;
    WETH_CONTRACT_ADDRESS?: string;
  };

  setupAsync(args: { networkLabel: string; logLevel: string });
  getProviderAsync(args: { networkLabel: string; network: string }): Promise<ethers.Provider>;
  checkConnectionAsync(args: { provider: ethers.Provider }): Promise<void>;
  createPrivateKey(): string;
  validatePrivateKey(args: { privateKey: string; name?: string }): boolean;
  deriveAddress(args: { privateKey: string }): string;
  validateAddress(args: { address: string; name?: string }): boolean;
  validateBlockchainDataInConfig(): void;
  getUsdcContractAddress(): string;
  getWethContractAddress(): string;
  getBlockNumberAsync(): Promise<number>;
  getGasPricesAsync(): Promise<Record<string, string>>;
  getGasPricesWithFiatAsync(): Promise<Record<string, string>>;
  contractExistsAtAsync(address: string): Promise<boolean>;
  getBalanceInfoAsync(address: string): Promise<Record<string, string>>;
}




// Types


export type SetupParams = { networkLabel: string; logLevel: string, connectToNetwork?: boolean };





// Classes


export abstract class ToolsetBase implements IToolset {


  symbol = '';
  provider: ethers.Provider | null = null;
  addresses = {
      USDC_CONTRACT_ADDRESS: '',
      WETH_CONTRACT_ADDRESS: '',
  };


  async setupAsync({ networkLabel, logLevel, connectToNetwork }: SetupParams) {
    logger.setLevel({ logLevel });
    config.logger.setLevel({ logLevel });
    config.networkLabel = networkLabel;
    const network = config.networkLabelToNetwork(networkLabel);
    config.network = network;

    this.validateBlockchainDataInConfig();

    if (connectToNetwork) {
      const provider = await this.getProviderAsync({ networkLabel, network });
      this.provider = provider;
    }

    this.addresses = {
      USDC_CONTRACT_ADDRESS: this.getUsdcContractAddress(),
      WETH_CONTRACT_ADDRESS: this.getWethContractAddress(),
    };
  }


  async getProviderAsync({ networkLabel, network }: { networkLabel: string; network: string }): Promise<ethers.Provider> {
    let provider: ethers.Provider;
    let msg: string;

    switch (networkLabel) {
      case 'local':
        msg = `Connecting to local network at ${network}...`;
        deb(msg);
        provider = new ethers.JsonRpcProvider(network);
        break;
      case 'testnet':
        msg = `Connecting to Sepolia testnet...`;
        deb(msg);
        provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
        break;
      case 'mainnet':
        msg = `Connecting to Ethereum mainnet...`;
        deb(msg);
        provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
        break;
      case 'testnetPolygon':
        msg = `Connecting to Polygon testnet...`;
        deb(msg);
        provider = new ethers.JsonRpcProvider(
          `${config.alchemyAPIPolygonTestnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
        );
        break;
      case 'mainnetPolygon':
        msg = `Connecting to Polygon mainnet...`;
        deb(msg);
        provider = new ethers.JsonRpcProvider(
          `${config.alchemyAPIPolygonMainnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
        );
        break;
      default:
        throw new Error(`Unsupported networkLabel: '${networkLabel}'`);
    }

    await this.checkConnectionAsync({ provider });
    return provider;
  }


  async checkConnectionAsync({ provider }: { provider: ethers.Provider }): Promise<void> {
    try {
      const blockNumber = await provider.getBlockNumber();
      const msg = `Connected to network. Block number: ${blockNumber}`;
      deb(msg);
    } catch (error) {
      provider.destroy();
      const msg = `Error connecting to network: ${error}`;
      logger.error(msg);
      throw error;
    }
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
      let msg = `Private key ${nameSection}('${privateKey}') is undefined.`;
      return { valid: false, msg };
      throw new Error(msg);
    }
    if (! ethers.isHexString(privateKey)) {
      let msg = `Private key ${nameSection}('${privateKey}') is not a hex string.`;
      return { valid: false, msg };
    }
    if (! ethers.isHexString(privateKey, 32)) {
      let msg = `Private key ${nameSection}('${privateKey}') is a hex string that it is ${ethers.dataLength(
        privateKey,
      )} bytes long. But: It should be 32 bytes long.`;
      return { valid: false, msg };
    }
    return { valid: true, msg: '' };
  }


  createPrivateKey() {
    const randomBytes = crypto.randomBytes(32);
    const privateKey = `0x` + randomBytes.toString('hex');
    return privateKey;
  }


  validatePrivateKey({
    privateKey,
    name,
  }: {
    privateKey: string;
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
    privateKeys: Record<string, string>;
  }) {
    if (! _.keys(privateKeys).length) {
      throw new Error(`Private keys '${privateKeys}' must not be empty.`);
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


  validateAddress({ address, name }: { address: string; name?: string }) {
    let nameSection = !_.isUndefined(name) ? `${name} ` : '';
    if (! ethers.isAddress(address)) {
      let msg = `Address ${nameSection}('${address}') is invalid.`;
      throw new Error(msg);
    }
    return true;
  }


  validateAddresses({ addresses }: { addresses: Record<string, string> }) {
    if (! _.keys(addresses).length) {
      throw new Error(`Addresses '${addresses}' must not be empty.`);
    }
    for (const [name, address] of _.entries(addresses)) {
      this.validateAddress({ address, name });
    }
    return true;
  }


  validateBlockchainDataInConfig(): void {
    this.validatePrivateKeys({
      privateKeys: {
        LOCAL_HARDHAT_PRIVATE_KEY: config.env.LOCAL_HARDHAT_PRIVATE_KEY,
        SEPOLIA_TESTNET_PRIVATE_KEY: config.env.SEPOLIA_TESTNET_PRIVATE_KEY,
        ETHEREUM_MAINNET_PRIVATE_KEY: config.env.ETHEREUM_MAINNET_PRIVATE_KEY,
      },
    });
    this.validateAddresses({
      addresses: {
        LOCAL_HARDHAT_ADDRESS: config.env.LOCAL_HARDHAT_ADDRESS,
        SEPOLIA_TESTNET_ADDRESS: config.env.SEPOLIA_TESTNET_ADDRESS,
        ETHEREUM_MAINNET_ADDRESS: config.env.ETHEREUM_MAINNET_ADDRESS,
      },
    });
  }


  getUsdcContractAddress(): string {
    if (config.networkLabel in config.constants.USDC_CONTRACT_ADDRESS) {
      return config.constants.USDC_CONTRACT_ADDRESS[config.networkLabel];
    } else {
      const msg = `USDC contract address not found in config for network '${config.networkLabel}'`;
      logger.warn(msg);
      return 'notFoundInConfig';
    }
  }


  getWethContractAddress(): string {
    if (config.networkLabel in config.constants.WETH_CONTRACT_ADDRESS) {
      return config.constants.WETH_CONTRACT_ADDRESS[config.networkLabel];
    } else {
      const msg = `WETH contract address not found in config for network '${config.networkLabel}'`;
      logger.warn(msg);
      return 'notFoundInConfig';
    }
  }


  // This assures the compiler that provider is not null.
  confirmProvider(provider: ethers.Provider | null): asserts provider is ethers.Provider {
    if (! provider) {
      throw new Error('Provider is not initialized. Please call setupAsync first.');
    }
  }


  async getBlockNumberAsync() {
    this.confirmProvider(this.provider);
    const provider = this.provider;
    return await provider.getBlockNumber();
  }


  async getGasPricesAsync(): Promise<Record<string, string>> {
    this.confirmProvider(this.provider);
    const provider = this.provider;
    const block = await provider.getBlock('latest');
    const blockNumber = block?.number.toString() ?? 'null';
    // baseFeePerGasWei is the _actual_ average base fee per gas that was paid in the last block.
    const baseFeePerGasWei = block?.baseFeePerGas?.toString() ?? 'null';
    const feeData = await provider.getFeeData();
    // gasPrice is the _recommended_ gas price for the next block.
    const { gasPrice } = feeData;
    const gasPriceWei = gasPrice?.toString() ?? 'null';
    if (_.isNull(baseFeePerGasWei) || _.isNull(gasPriceWei)) {
      throw new Error('Error fetching gas prices.');
    }
    // We reason that the averagePriorityFeePerGasWei in the next block will be the recommended gas price minus the actual base fee.
    let averagePriorityFeePerGasWei = (BigInt(gasPriceWei) - BigInt(baseFeePerGasWei)).toString();
    if (BigInt(averagePriorityFeePerGasWei) < 0n) {
      averagePriorityFeePerGasWei = '0';
    }
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


  abstract getGasPricesWithFiatAsync(): Promise<Record<string, string>>


  async getBytecodeAsync(address: string) {
    this.confirmProvider(this.provider);
    if (! ethers.isAddress(address)) {
      throw new Error(`Address '${address}' is invalid.`);
    }
    const result = await this.provider.getCode(address);
    return result;
  }


  async contractExistsAtAsync(address: string) {
    const result = await this.getBytecodeAsync(address);
    if (result == '0x') return false;
    return true;
  }


  async getBalanceWeiAsync(address: string): Promise<string> {
    this.confirmProvider(this.provider);
    let balanceWei = await this.provider.getBalance(address);
    let balanceWeiStr = balanceWei.toString();
    return balanceWeiStr;
  }


  abstract getBalanceInfoAsync(address: string): Promise<Record<string, string>>


}

