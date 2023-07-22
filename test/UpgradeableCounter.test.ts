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

// Process and validate arguments
const logLevelSchema = Joi.string().valid(...config.logLevelList);
let logLevelResult = logLevelSchema.validate(logLevel);
if (logLevelResult.error) {
  var msg = `Invalid log level "${logLevel}". Valid options are: [${config.logLevelList.join(
    ", ",
  )}]`;
  console.error(msg);
  process.exit(1);
}
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });

// Tests

describe("UpgradeableContract", () => {
  before(async function () {
    await hardhat.network.provider.send("hardhat_reset");
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
    expect(await Counter.version()).to.equal(0);
    log(`counterAddress: ${counterAddress}`);
  });

  it("should upgrade", async () => {
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
    expect(await CounterV2.version()).to.equal(0);
    const newVersion = 1;
    await expect(CounterV2.setVersion(newVersion))
      .to.emit(CounterV2, "VersionChanged")
      .withArgs(newVersion);
    expect(await CounterV2.version()).to.equal(1);
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
});
