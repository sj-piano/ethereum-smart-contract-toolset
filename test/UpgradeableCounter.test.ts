// Imports
import _ from 'lodash';
import { assert, expect } from 'chai';
import hardhat, { ethers, upgrades } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';


// Local imports
import amounts from '#src/amounts';
import config from '#root/config';
import { createLogger } from '#lib/logging';
import utils, { jd } from '#lib/utils';
import ethereum from '#root/src/eth-toolset';


// Types from typechain
import { UpgradeableCounter, UpgradeableCounterV2 } from '../typechain-types';


// Logging
const { logger, log, deb } = createLogger({ filePath: __filename });


// Setup
let provider = hardhat.ethers.provider;


// Tests

describe('UpgradeableContract with deployment fixture', () => {

  before(async function () {
    this.timeout(8000);
    await hardhat.network.provider.send('hardhat_reset');
  });

  it.skip('foo', async () => {
    log('foo');
  });

  async function deployUpgradeableCounterFixture() {
    const [admin, acc1, acc2] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory('UpgradeableCounter');
    const Counter = (await upgrades.deployProxy(CounterFactory, [], {
      initializer: 'initialize',
      kind: 'uups',
    })) as unknown as UpgradeableCounter;
    await Counter.waitForDeployment();
    const counterAddress = await Counter.getAddress();
    return { Counter, counterAddress, admin, acc1, acc2 };
  }

  it('should deploy', async () => {
    const { Counter, counterAddress } = await loadFixture(deployUpgradeableCounterFixture);
    expect(await Counter.version()).to.equal(1);
    log(`counterAddress: ${counterAddress}`);
  });

  it('should upgrade', async () => {
    const { Counter, counterAddress } = await loadFixture(deployUpgradeableCounterFixture);
    let version = await Counter.version();
    expect(version).to.equal(1);
    //log(`Version: ${version}`);
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2');
    const CounterV2 = await upgrades.upgradeProxy(counterAddress, CounterV2Factory);
    expect(await CounterV2.version()).to.equal(1);
    const newVersion = 2;
    await CounterV2.setVersion(newVersion);
    expect(await CounterV2.version()).to.equal(newVersion);
  });

  it('should confirm that upgrading only changes the implementationAddress', async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const adminAddress = await Counter.getAdminAddress();
    expect(adminAddress).to.equal(admin.address);
    const implementationAddress = await Counter.getImplementationAddress();
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2');
    const CounterV2 = await upgrades.upgradeProxy(counterAddress, CounterV2Factory);
    const counterAddress2 = await Counter.getAddress();
    expect(counterAddress2).to.equal(counterAddress);
    const adminAddress2 = await Counter.owner();
    expect(adminAddress2).to.equal(admin.address);
    const implementationAddress2 = await Counter.connect(acc1).getImplementationAddress();
    expect(implementationAddress2).to.not.equal(implementationAddress);
  });

  it('should prevent a non-admin from upgrading', async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2', acc1);
    await expect(upgrades.upgradeProxy(counterAddress, CounterV2Factory)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
    // We can also do this more manually:
    const constructorArgs: any[] = [];
    const CounterV2 = (await ethers.deployContract(
      'UpgradeableCounterV2',
      constructorArgs,
      acc1,
    )) as unknown as UpgradeableCounterV2;
    const newImplementationAddress = await CounterV2.getAddress();
    await expect(Counter.connect(acc1).upgradeTo(newImplementationAddress)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('should confirm that data added in V2 is available in V3', async () => {
    const { Counter, counterAddress } = await loadFixture(deployUpgradeableCounterFixture);
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2');
    const CounterV2 = await upgrades.upgradeProxy(counterAddress, CounterV2Factory);
    const CounterV3Factory = await ethers.getContractFactory('UpgradeableCounterV3');
    const CounterV3 = await upgrades.upgradeProxy(counterAddress, CounterV3Factory);
    const newVersion = 3;
    await CounterV3.setVersion(newVersion);
    expect(await CounterV3.version()).to.equal(3);
    expect(await CounterV3.value()).to.equal(0);
    await CounterV3.increment();
    expect(await CounterV3.value()).to.equal(1);
    await CounterV3.decrement();
    expect(await CounterV3.value()).to.equal(0);
  });

  it('should confirm that after an upgrade, non-admins cannot upgrade', async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2');
    const CounterV2 = await upgrades.upgradeProxy(counterAddress, CounterV2Factory);
    const CounterV3Factory = await ethers.getContractFactory('UpgradeableCounterV3', acc1);
    await expect(upgrades.upgradeProxy(counterAddress, CounterV3Factory)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('should detect Upgraded events', async () => {
    const { Counter, counterAddress, admin, acc1 } = await loadFixture(
      deployUpgradeableCounterFixture,
    );
    const CounterV2Factory = await ethers.getContractFactory('UpgradeableCounterV2');
    //log(`blockNumber: ${await provider.getBlockNumber()}`);
    const CounterV2 = await upgrades.upgradeProxy(counterAddress, CounterV2Factory);
    const blockNumber2 = await provider.getBlockNumber();
    const UpgradedEventFilter = CounterV2.filters.Upgraded();
    const fromBlock = blockNumber2 + 1;
    const events = await CounterV2.queryFilter(UpgradedEventFilter, fromBlock);
    // Parse and log the event information in a readable format
    const abi = CounterV2.interface; // Get the ABI of the contract
    let newImplementationAddress;
    events.forEach((event) => {
      //log(event);
      const logData: { topics: string[]; data: string } = {
        topics: [...event.topics],
        data: event.data,
      };
      const parsedEvent = abi.parseLog(logData)!;
      log('----------------------');
      log(`Event Name: ${parsedEvent.name}`);
      log(`Event Arguments: ${parsedEvent.args}`);
      log(`Block Number: ${event.blockNumber}`);
      log('----------------------');
      newImplementationAddress = parsedEvent.args.implementation;
      //Could also have used: parsedEvent.args[0]
    });
    const newImplementationAddress2 = await CounterV2.getImplementationAddress();
    expect(newImplementationAddress2).to.equal(newImplementationAddress);
  });

});


describe('UpgradeableContract with manual deployment', () => {

  beforeEach(async function () {
    this.timeout(8000);
    await hardhat.network.provider.send('hardhat_reset');
  });

  it('should get the total gasUsed and ethSpent for the proxy deployment', async () => {
    let logTest = true;
    let provider = ethers.provider;
    const blockNumber1 = await provider.getBlockNumber();
    //log("Current block number: " + blockNumber1);
    const [admin, acc1, acc2] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory('UpgradeableCounter');
    const balance1 = await ethereum.getBalanceEth({
      provider,
      address: admin.address,
    });
    if (logTest) log(`balance1: ${balance1}`);
    const Counter = (await upgrades.deployProxy(CounterFactory, [], {
      initializer: 'initialize',
      kind: 'uups',
    })) as unknown as UpgradeableCounter;
    //log(_.keys(upgrades));
    await Counter.waitForDeployment();
    const counterAddress = await Counter.getAddress();
    //log("Counter address: " + counterAddress);
    const blockNumber2 = await ethers.provider.getBlockNumber();
    //log("Current block number: " + blockNumber2);
    assert(blockNumber2 === blockNumber1 + 2)
    const balance2 = await ethereum.getBalanceEth({
      provider,
      address: admin.address,
    });
    if (logTest) log(`balance2: ${balance2}`);
    const diff = amounts.subtractAmountsEth([balance1, balance2]);
    const spentEthTotal1 = diff;
    if (logTest) log(`spentEthTotal1: ${spentEthTotal1}`);
    let block1 = await provider.getBlock(1);
    block1 = block1!;
    let block2 = await provider.getBlock(2);
    block2 = block2!;
    //log(`block1: ${jd(block1)}`);
    //log(`block2: ${jd(block2)}`);
    assert(block1.transactions.length === 1);
    assert(block2.transactions.length === 1);
    let txResponse1 = await provider.getTransaction(block1.transactions[0]);
    //log(`txResponse1: ${jd(txResponse1)}`);
    let txReceipt1 = await provider.getTransactionReceipt(block1.transactions[0]);
    txReceipt1 = txReceipt1!;
    //log(`txReceipt1: ${jd(txReceipt1)}`);
    let gasUsed1 = txReceipt1.gasUsed;
    if (logTest) log(`gasUsed1: ${gasUsed1}`);
    let gasPriceWei1 = txReceipt1.gasPrice.toString();
    if (logTest) log(`gasPriceWei1: ${gasPriceWei1}`);
    let spentWei1 = amounts.multiplyAmountWei({ amountWei: gasPriceWei1, multiplier: gasUsed1 });
    let spentEth1 = amounts.weiToEth({ amountWei: spentWei1 });
    if (logTest) log(`spentEth1: ${spentEth1}`);
    // This first contract is the implementation.
    let contractAddress1 = txReceipt1.contractAddress!;
    //log(`contractAddress1: ${contractAddress1}`);
    let bytecode1 = await ethereum.getBytecode({
      provider,
      address: contractAddress1,
    });
    //log(`bytecode1: ${bytecode1}`);
    let txReceipt2 = await provider.getTransactionReceipt(block2.transactions[0]);
    txReceipt2 = txReceipt2!;
    //log(`txReceipt2: ${jd(txReceipt2)}`);
    let gasUsed2 = txReceipt2.gasUsed;
    if (logTest) log(`gasUsed2: ${gasUsed2}`);
    let gasPriceWei2 = txReceipt2.gasPrice.toString();
    if (logTest) log(`gasPriceWei2: ${gasPriceWei2}`);
    let spentWei2 = amounts.multiplyAmountWei({ amountWei: gasPriceWei2, multiplier: gasUsed2 });
    let spentEth2 = amounts.weiToEth({ amountWei: spentWei2 });
    if (logTest) log(`spentEth2: ${spentEth2}`);
    // Add spentEth from both transactions.
    let spentEthTotal2 = amounts.addAmountsEth([spentEth1, spentEth2]);
    if (logTest) log(`spentEthTotal2: ${spentEthTotal2}`);
    if (logTest) log(`spentEthTotal1: ${spentEthTotal1}`);
    assert(spentEthTotal1 === spentEthTotal2);
    // The second contract is the proxy.
    let contractAddress2 = txReceipt2.contractAddress!;
    //log(`contractAddress2: ${contractAddress2}`);
    let bytecode2 = await ethereum.getBytecode({
      provider,
      address: contractAddress2,
    });
    //log(`bytecode2: ${bytecode2}`);
    const implAddress = await Counter.getImplementationAddress();
    //log(`implAddress: ${implAddress}`);
    // Confirm the resulting contract addresses.
    assert(contractAddress1 === implAddress);
    assert(contractAddress2 === counterAddress);
  });
});
