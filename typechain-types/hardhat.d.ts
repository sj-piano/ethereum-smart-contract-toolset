/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "OwnableUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OwnableUpgradeable__factory>;
    getContractFactory(
      name: "IERC1822ProxiableUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1822ProxiableUpgradeable__factory>;
    getContractFactory(
      name: "IERC1967Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1967Upgradeable__factory>;
    getContractFactory(
      name: "IBeaconUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBeaconUpgradeable__factory>;
    getContractFactory(
      name: "ERC1967UpgradeUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967UpgradeUpgradeable__factory>;
    getContractFactory(
      name: "Initializable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Initializable__factory>;
    getContractFactory(
      name: "UUPSUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UUPSUpgradeable__factory>;
    getContractFactory(
      name: "ERC20Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Upgradeable__factory>;
    getContractFactory(
      name: "IERC20MetadataUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20MetadataUpgradeable__factory>;
    getContractFactory(
      name: "IERC20Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Upgradeable__factory>;
    getContractFactory(
      name: "ContextUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ContextUpgradeable__factory>;
    getContractFactory(
      name: "IUniswapV3Pool",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3Pool__factory>;
    getContractFactory(
      name: "IUniswapV3PoolActions",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolActions__factory>;
    getContractFactory(
      name: "IUniswapV3PoolDerivedState",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolDerivedState__factory>;
    getContractFactory(
      name: "IUniswapV3PoolEvents",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolEvents__factory>;
    getContractFactory(
      name: "IUniswapV3PoolImmutables",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolImmutables__factory>;
    getContractFactory(
      name: "IUniswapV3PoolOwnerActions",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolOwnerActions__factory>;
    getContractFactory(
      name: "IUniswapV3PoolState",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolState__factory>;
    getContractFactory(
      name: "EquityToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.EquityToken__factory>;
    getContractFactory(
      name: "EquityTokenV2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.EquityTokenV2__factory>;
    getContractFactory(
      name: "HelloWorld",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HelloWorld__factory>;
    getContractFactory(
      name: "UpgradeableCounter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UpgradeableCounter__factory>;
    getContractFactory(
      name: "UpgradeableCounterV2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UpgradeableCounterV2__factory>;
    getContractFactory(
      name: "UpgradeableCounterV3",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UpgradeableCounterV3__factory>;

    getContractAt(
      name: "OwnableUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.OwnableUpgradeable>;
    getContractAt(
      name: "IERC1822ProxiableUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1822ProxiableUpgradeable>;
    getContractAt(
      name: "IERC1967Upgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1967Upgradeable>;
    getContractAt(
      name: "IBeaconUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IBeaconUpgradeable>;
    getContractAt(
      name: "ERC1967UpgradeUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967UpgradeUpgradeable>;
    getContractAt(
      name: "Initializable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Initializable>;
    getContractAt(
      name: "UUPSUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.UUPSUpgradeable>;
    getContractAt(
      name: "ERC20Upgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Upgradeable>;
    getContractAt(
      name: "IERC20MetadataUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20MetadataUpgradeable>;
    getContractAt(
      name: "IERC20Upgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Upgradeable>;
    getContractAt(
      name: "ContextUpgradeable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ContextUpgradeable>;
    getContractAt(
      name: "IUniswapV3Pool",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3Pool>;
    getContractAt(
      name: "IUniswapV3PoolActions",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolActions>;
    getContractAt(
      name: "IUniswapV3PoolDerivedState",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolDerivedState>;
    getContractAt(
      name: "IUniswapV3PoolEvents",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolEvents>;
    getContractAt(
      name: "IUniswapV3PoolImmutables",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolImmutables>;
    getContractAt(
      name: "IUniswapV3PoolOwnerActions",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolOwnerActions>;
    getContractAt(
      name: "IUniswapV3PoolState",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolState>;
    getContractAt(
      name: "EquityToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.EquityToken>;
    getContractAt(
      name: "EquityTokenV2",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.EquityTokenV2>;
    getContractAt(
      name: "HelloWorld",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.HelloWorld>;
    getContractAt(
      name: "UpgradeableCounter",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.UpgradeableCounter>;
    getContractAt(
      name: "UpgradeableCounterV2",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.UpgradeableCounterV2>;
    getContractAt(
      name: "UpgradeableCounterV3",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.UpgradeableCounterV3>;

    deployContract(
      name: "OwnableUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.OwnableUpgradeable>;
    deployContract(
      name: "IERC1822ProxiableUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1822ProxiableUpgradeable>;
    deployContract(
      name: "IERC1967Upgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1967Upgradeable>;
    deployContract(
      name: "IBeaconUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBeaconUpgradeable>;
    deployContract(
      name: "ERC1967UpgradeUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC1967UpgradeUpgradeable>;
    deployContract(
      name: "Initializable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Initializable>;
    deployContract(
      name: "UUPSUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UUPSUpgradeable>;
    deployContract(
      name: "ERC20Upgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20Upgradeable>;
    deployContract(
      name: "IERC20MetadataUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20MetadataUpgradeable>;
    deployContract(
      name: "IERC20Upgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Upgradeable>;
    deployContract(
      name: "ContextUpgradeable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ContextUpgradeable>;
    deployContract(
      name: "IUniswapV3Pool",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3Pool>;
    deployContract(
      name: "IUniswapV3PoolActions",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolActions>;
    deployContract(
      name: "IUniswapV3PoolDerivedState",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolDerivedState>;
    deployContract(
      name: "IUniswapV3PoolEvents",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolEvents>;
    deployContract(
      name: "IUniswapV3PoolImmutables",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolImmutables>;
    deployContract(
      name: "IUniswapV3PoolOwnerActions",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolOwnerActions>;
    deployContract(
      name: "IUniswapV3PoolState",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolState>;
    deployContract(
      name: "EquityToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.EquityToken>;
    deployContract(
      name: "EquityTokenV2",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.EquityTokenV2>;
    deployContract(
      name: "HelloWorld",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.HelloWorld>;
    deployContract(
      name: "UpgradeableCounter",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounter>;
    deployContract(
      name: "UpgradeableCounterV2",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounterV2>;
    deployContract(
      name: "UpgradeableCounterV3",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounterV3>;

    deployContract(
      name: "OwnableUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.OwnableUpgradeable>;
    deployContract(
      name: "IERC1822ProxiableUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1822ProxiableUpgradeable>;
    deployContract(
      name: "IERC1967Upgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1967Upgradeable>;
    deployContract(
      name: "IBeaconUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBeaconUpgradeable>;
    deployContract(
      name: "ERC1967UpgradeUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC1967UpgradeUpgradeable>;
    deployContract(
      name: "Initializable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Initializable>;
    deployContract(
      name: "UUPSUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UUPSUpgradeable>;
    deployContract(
      name: "ERC20Upgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20Upgradeable>;
    deployContract(
      name: "IERC20MetadataUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20MetadataUpgradeable>;
    deployContract(
      name: "IERC20Upgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Upgradeable>;
    deployContract(
      name: "ContextUpgradeable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ContextUpgradeable>;
    deployContract(
      name: "IUniswapV3Pool",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3Pool>;
    deployContract(
      name: "IUniswapV3PoolActions",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolActions>;
    deployContract(
      name: "IUniswapV3PoolDerivedState",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolDerivedState>;
    deployContract(
      name: "IUniswapV3PoolEvents",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolEvents>;
    deployContract(
      name: "IUniswapV3PoolImmutables",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolImmutables>;
    deployContract(
      name: "IUniswapV3PoolOwnerActions",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolOwnerActions>;
    deployContract(
      name: "IUniswapV3PoolState",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV3PoolState>;
    deployContract(
      name: "EquityToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.EquityToken>;
    deployContract(
      name: "EquityTokenV2",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.EquityTokenV2>;
    deployContract(
      name: "HelloWorld",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.HelloWorld>;
    deployContract(
      name: "UpgradeableCounter",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounter>;
    deployContract(
      name: "UpgradeableCounterV2",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounterV2>;
    deployContract(
      name: "UpgradeableCounterV3",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.UpgradeableCounterV3>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
