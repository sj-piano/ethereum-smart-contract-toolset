// Imports
import _ from "lodash";
import hardhat, { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// Local imports
import { createLogger } from "#root/lib/logging";
import utils from "#lib/utils";

// Contract types
//import { UpgradeableCounter } from "#typechain-types/contracts/UpgradeableCounter.sol";

// Logging
const { logger, log, deb } = createLogger();

// Tests

describe("UpgradeableContract", () => {
  it("should deploy", async () => {
    const CounterFactory = await ethers.getContractFactory(
      "UpgradeableCounter",
    );
    const instance = await upgrades.deployProxy(CounterFactory);
    await instance.waitForDeployment();
    expect(await instance.value()).to.equal(0);
    const publicAddress = await instance.getAddress();
    log(`publicAddress: ${publicAddress}`);
    const implementationAddress =
      await upgrades.erc1967.getImplementationAddress(publicAddress);
    log(`implementationAddress: ${implementationAddress}`);
    const adminAddress = await upgrades.erc1967.getAdminAddress(publicAddress);
    log(`adminAddress: ${adminAddress}`);
  });
  it("should upgrade", async () => {
    const CounterFactory = await ethers.getContractFactory(
      "UpgradeableCounter",
    );
    const instance = await upgrades.deployProxy(CounterFactory);
    await instance.waitForDeployment();
    let address = await instance.getAddress();
    const CounterV2Factory = await ethers.getContractFactory(
      "UpgradeableCounterV2",
    );
    const upgraded = await upgrades.upgradeProxy(address, CounterV2Factory);
    expect(await upgraded.value()).to.equal(0);
    await upgraded.increment();
    expect(await upgraded.value()).to.equal(1);
  });
});
