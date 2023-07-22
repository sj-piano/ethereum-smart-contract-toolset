// Imports
import { expect } from "chai";
import { program } from "commander";
import hardhat, { ethers, upgrades } from "hardhat";
import Joi from "joi";
import _ from "lodash";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// Local imports
import { config } from "#root/config";
import { createLogger } from "#root/lib/logging";
import utils, { jd } from "#lib/utils";
import validate from "#lib/validate";

// Types from typechain
import { UpgradeableCounter, UpgradeableCounterV2 } from "../typechain-types";

// Logging
const { logger, log, deb } = createLogger();

// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .allowUnknownOption();
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel } = options;

// Validate arguments
validate.logLevel({ logLevel });

// Setup
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });
let provider = hardhat.ethers.provider;

// Tests

describe("UpgradeableContract", () => {
  before(async function () {
    this.timeout(8000);
    await hardhat.network.provider.send("hardhat_reset");
  });

  it.skip("foo", async () => {
    log("foo");
  });

  async function deployUpgradeableCounterFixture() {
    const [admin, acc1, acc2] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory(
      "UpgradeableCounter",
    );
    const Counter = (await upgrades.deployProxy(CounterFactory, [], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as UpgradeableCounter;
    await Counter.waitForDeployment();
    const counterAddress = await Counter.getAddress();
    return { Counter, counterAddress, admin, acc1, acc2 };
  }

  it("should deploy", async () => {
    const { Counter, counterAddress } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    expect(await Counter.version()).to.equal(1);
    log(`counterAddress: ${counterAddress}`);
  });

  it("should upgrade", async () => {
    const { Counter, counterAddress } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    let version = await Counter.version();
    expect(version).to.equal(1);
    //log(`Version: ${version}`);
    const CounterV2Factory = await ethers.getContractFactory(
      "UpgradeableCounterV2",
    );
    const CounterV2 = await upgrades.upgradeProxy(
      counterAddress,
      CounterV2Factory,
    );
    const newVersion = 2;
    await CounterV2.setVersion(newVersion);
    expect(await CounterV2.version()).to.equal(2);
  });

  it("should confirm that upgrading only changes the implementationAddress", async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const adminAddress = await Counter.getAdminAddress();
    expect(adminAddress).to.equal(admin.address);
    const implementationAddress = await Counter.getImplementationAddress();
    const CounterV2Factory = await ethers.getContractFactory(
      "UpgradeableCounterV2",
    );
    const CounterV2 = await upgrades.upgradeProxy(
      counterAddress,
      CounterV2Factory,
    );
    const counterAddress2 = await Counter.getAddress();
    expect(counterAddress2).to.equal(counterAddress);
    const adminAddress2 = await Counter.owner();
    expect(adminAddress2).to.equal(admin.address);
    const implementationAddress2 = await Counter.connect(
      acc1,
    ).getImplementationAddress();
    expect(implementationAddress2).to.not.equal(implementationAddress);
  });

  it("should prevent a non-admin from upgrading", async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const CounterV2Factory = await ethers.getContractFactory(
      "UpgradeableCounterV2",
      acc1,
    );
    await expect(
      upgrades.upgradeProxy(counterAddress, CounterV2Factory),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // We can also do this more manually:
    const constructorArgs: any[] = [];
    const CounterV2 = (await ethers.deployContract(
      "UpgradeableCounterV2",
      constructorArgs,
      acc1,
    )) as unknown as UpgradeableCounterV2;
    const newImplementationAddress = await CounterV2.getAddress();
    await expect(
      Counter.connect(acc1).upgradeTo(newImplementationAddress),
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should confirm that data added in V2 is available in V3", async () => {
    const { Counter, counterAddress } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const CounterV2Factory = await ethers.getContractFactory(
      "UpgradeableCounterV2",
    );
    const CounterV2 = await upgrades.upgradeProxy(
      counterAddress,
      CounterV2Factory,
    );
    const CounterV3Factory = await ethers.getContractFactory(
      "UpgradeableCounterV3",
    );
    const CounterV3 = await upgrades.upgradeProxy(
      counterAddress,
      CounterV3Factory,
    );
    const newVersion = 3;
    await CounterV3.setVersion(newVersion);
    expect(await CounterV3.version()).to.equal(3);
    expect(await CounterV3.value()).to.equal(0);
    await CounterV3.increment();
    expect(await CounterV3.value()).to.equal(1);
    await CounterV3.decrement();
    expect(await CounterV3.value()).to.equal(0);
  });
});
