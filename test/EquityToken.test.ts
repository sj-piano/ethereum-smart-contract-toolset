// Imports
import _ from "lodash";
import { assert, expect } from "chai";
//import { program } from "commander";
import hardhat, { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";


// Local imports
//import { createLogger } from "#root/lib/logging";
import { log } from "#test/cli-for-tests.test";


// Types
import { EquityToken, EquityTokenV2 } from "../typechain-types";


// Logging
//const { logger, log, deb } = createLogger({filePath: __filename});


// Variables
let initialSupply = 10**6;
let decimals = 6;
let initialSupplyInteger = BigInt(initialSupply * 10**decimals);
let initialPrice = 1500;
let initialPriceInteger = BigInt(initialPrice * 10**decimals);
let admin, acc1, acc2;


describe('EquityToken walkthrough', function () {

  let equityToken: EquityToken;
  let equityTokenV2: EquityTokenV2;

  before(async function () {
    await hardhat.network.provider.send("hardhat_reset");
    [admin, acc1, acc2] = await ethers.getSigners();
  });

  it('deploys', async function () {
    const EquityTokenFactory = await ethers.getContractFactory('EquityToken');
    equityToken = (await upgrades.deployProxy(EquityTokenFactory, [
      "EquityToken",
      "ETK",
      initialSupply,
      initialPrice,
    ], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as EquityToken;
  });

  it('has 6 decimal places', async function () {
    const decimals = await equityToken.decimals();
    expect(decimals).to.equal(6);
  });

  it('has the expected initial supply', async function () {
    const supply = await equityToken.totalSupply();
    //log(`supply: ${supply}`);
    expect(supply).to.equal(initialSupplyInteger);
  });

  it('can mint', async function () {
    const amount = 1000;
    await equityToken.mint(acc1.address, amount);
    const balance = await equityToken.balanceOf(acc1.address);
    expect(balance).to.equal(amount);
  });

  it('can transfer', async function () {
    const amount = 1000;
    await equityToken.transfer(acc2.address, amount);
    const balance = await equityToken.balanceOf(acc2.address);
    expect(balance).to.equal(amount);
    //log(`balance: ${balance}`);
  });

  it('can transfer from one account to another', async function () {
    const amount = 1000n;
    const balance1a = await equityToken.balanceOf(acc1.address);
    const balance2a = await equityToken.balanceOf(acc2.address);
    await equityToken.mint(acc1.address, amount);
    await equityToken.connect(acc1).transfer(acc2.address, amount);
    const balance1b = await equityToken.balanceOf(acc1.address);
    const balance2b = await equityToken.balanceOf(acc2.address);
    expect(balance1b).to.equal(balance1a);
    expect(balance2b).to.equal(balance2a + amount);
  });

  it('cannot re-initialize', async function () {
    await expect(
      equityToken.initialize(
        "EquityToken",
        "ETK",
        initialSupply,
        initialPrice,
      )
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it('rejects Eth payments made directly to the contract address', async function () {
    let equityTokenAddress = await equityToken.getAddress();
    await expect(
      acc1.sendTransaction({
        to: equityTokenAddress,
        value: ethers.parseEther("1.0"),
      })
    ).to.be.reverted;
  });

  it('allows a user to buy tokens', async function () {
    const amountEth = 1;
    const amountWei = ethers.parseEther(amountEth.toString());
    const quantity = initialPrice / amountEth;
    const balance1 = await equityToken.balanceOf(acc1.address);
    await equityToken.connect(acc1).buyEquityTokens(quantity, {
      value: amountWei,
    });
    const balance2 = await equityToken.balanceOf(acc1.address);
    const balanceChange = balance2 - balance1;
    //log(`balanceChange: ${balanceChange}`);
    expect(balanceChange).to.equal(quantity);
  });

});


describe('EquityToken - upgrade', function () {

  let equityToken: EquityToken;
  let equityTokenV2: EquityTokenV2;

  before(async function () {
    await hardhat.network.provider.send("hardhat_reset");
    [admin, acc1, acc2] = await ethers.getSigners();
  });

  async function deployEquityTokenFixture() {
    const [admin, acc1, acc2] = await ethers.getSigners();
    const EquityTokenFactory = await ethers.getContractFactory('EquityToken');
    equityToken = (await upgrades.deployProxy(EquityTokenFactory, [
      "EquityToken",
      "ETK",
      initialSupply
    ], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as EquityToken;
    const equityTokenAddress = await equityToken.getAddress();
    return { equityToken, equityTokenAddress, admin, acc1, acc2 };
  }

  async function deployEquityTokenV2Fixture() {
    const [admin, acc1, acc2] = await ethers.getSigners();
    const EquityTokenFactory = await ethers.getContractFactory('EquityToken');
    equityToken = (await upgrades.deployProxy(EquityTokenFactory, [
      "EquityToken",
      "ETK",
      initialSupply
    ], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as EquityToken;
    const equityTokenAddress = await equityToken.getAddress();
    const equityTokenV2Factory = await ethers.getContractFactory("EquityTokenV2");
    equityTokenV2 = await upgrades.upgradeProxy(equityTokenAddress, equityTokenV2Factory) as unknown as EquityTokenV2;
    return { equityToken, equityTokenV2, equityTokenAddress, admin, acc1, acc2 };
  }

  it('has expected properties after upgrade', async function () {
    const { equityToken, equityTokenV2 } = await loadFixture(deployEquityTokenV2Fixture);
    const decimals = await equityToken.decimals();
    expect(decimals).to.equal(6);
    const decimals2 = await equityTokenV2.decimals();
    expect(decimals2).to.equal(6);
  });

  it('should have an unchanged supply after upgrade', async function () {
    const { equityToken, equityTokenAddress } = await loadFixture(deployEquityTokenFixture);
    const supply = await equityToken.totalSupply();
    //log(`supply: ${supply}`);
    const amount = 1000;
    await equityToken.mint(acc1.address, amount);
    const supply2 = await equityToken.totalSupply();
    //log(`supply2: ${supply2}`);
    const equityTokenV2Factory = await ethers.getContractFactory("EquityTokenV2");
    equityTokenV2 = await upgrades.upgradeProxy(equityTokenAddress, equityTokenV2Factory) as unknown as EquityTokenV2;
    const supply3 = await equityTokenV2.totalSupply();
    //log(`supply3: ${supply3}`);
    expect(supply3).to.equal(supply2);
  });

  it('cannot re-initialize after upgrade', async function () {
    const { equityToken, equityTokenV2 } = await loadFixture(deployEquityTokenV2Fixture);
    await expect(
      equityTokenV2.initialize(
        "EquityToken",
        "ETK",
        initialSupply,
        initialPrice,
      )
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

});
