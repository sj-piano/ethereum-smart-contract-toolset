// Imports
import _ from 'lodash';
import { assert, expect } from 'chai';
import hardhat, { ethers } from 'hardhat';
//import helpers from "@nomicfoundation/hardhat-network-helpers"; // This doesn't work.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helpers = require('@nomicfoundation/hardhat-network-helpers');


// Local imports
import amounts from '#src/amounts';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';


// Controls
let logLevel = 'error';
logLevel = 'info';
//logLevel = "debug";


// Logging
const { logger, log, deb } = createLogger({ filePath: __filename, logLevel });


// Test data
const exampleAddress1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';


// Setup
let hre = hardhat;
let provider = hre.ethers.provider;
let network = hre.network;
const networkLabel = 'local';


// Tests

describe('Ethereum private key', function () {


  describe('Create random key', function () {


    it('Should be a hex string', function () {
      const privateKey = ethToolset.createPrivateKeySync();
      const check = ethers.isHexString(privateKey);
      expect(check).to.equal(true);
    });


    it('Should be 32 bytes long', function () {
      const privateKey = ethToolset.createPrivateKeySync();
      const check = ethers.isHexString(privateKey, 32);
      expect(check).to.equal(true);
    });


  });


  describe('Test validatePrivateKeySync', function () {


    it('Should validate a new private key', function () {
      const privateKey = ethToolset.createPrivateKeySync();
      const check = ethToolset.validatePrivateKeySync({ privateKey });
      expect(check).to.equal(true);
    });


    it('Should throw an error if the private key is not a hex string', function () {
      const privateKey = '0x1234567890abcdef' + 'zzzz';
      assert.throws(() => ethToolset.validatePrivateKeySync({ privateKey }), Error);
    });


    it('Should throw an error if the private key is less than 32 bytes long', function () {
      const privateKey = '0x1234567890abcdef';
      assert.throws(() => ethToolset.validatePrivateKeySync({ privateKey }), Error);
    });


    it('Should throw an error if the private key is more than 32 bytes long', function () {
      const privateKey = '0x' + '1234567890abcdef'.repeat(4) + '1234';
      assert.throws(() => ethToolset.validatePrivateKeySync({ privateKey }), Error);
    });


  });


  describe('Test deriveAddressSync', function () {

    it('Should derive the correct address from a private key', function () {
      const privateKey = '0x' + '00'.repeat(31) + '01';
      const address = ethToolset.deriveAddressSync({ privateKey });
      expect(address).to.equal(exampleAddress1);
    });
  });


  describe('Test validateAddressSync', function () {


    it('Should validate a valid address', function () {
      const address = exampleAddress1;
      const check = ethToolset.validateAddressSync({ address });
      expect(check).to.equal(true);
    });


  });


  describe('Test basic transactions', function () {


    beforeEach(async function () {
      await hre.network.provider.send('hardhat_reset');
    });


    it('Should transfer 0 wei', async function () {
      const [addr1, addr2] = await ethers.getSigners();
      let addr1Balance = await ethToolset.getBalanceEth({
        provider,
        address: addr1.address,
      });
      let addr2Balance = await ethToolset.getBalanceEth({
        provider,
        address: addr2.address,
      });
      let amountWei = '0';
      let amountEth = amounts.weiToEth({ amountWei });
      let txResponse = await ethToolset.sendEth({
        networkLabel,
        provider,
        senderAddress: addr1.address,
        receiverAddress: addr2.address,
        amountEth,
      });
      //log(txResponse)
      let txHash = txResponse.hash;
      let txReceipt = await provider.getTransactionReceipt(txHash);
      let block = await provider.getBlock('latest');
      expect(block!.number).to.equal(1);
      let addr1Balance2 = await ethToolset.getBalanceEth({
        provider,
        address: addr1.address,
      });
      let addr2Balance2 = await ethToolset.getBalanceEth({
        provider,
        address: addr2.address,
      });
      let differenceWei = ethers.parseEther(addr2Balance2) - ethers.parseEther(addr2Balance);
      expect(differenceWei).to.equal(0);
    });

    it('Should transfer 1 wei', async function () {
      let result = await provider.send('hardhat_getAutomine');
      deb(`result: ${result}`);

      await provider.send('evm_setAutomine', [false]);

      let automineOn = await provider.send('hardhat_getAutomine');
      deb(`automineOn=${automineOn}`);

      let block = await provider.getBlock('latest');
      deb(`Current block number: ${block!.number}`);

      const [addr1, addr2] = await ethers.getSigners();

      let addr1Balance = await ethToolset.getBalanceEth({
        provider,
        address: addr1.address,
      });
      //log("addr1Balance", addr1Balance);
      let addr2Balance = await ethToolset.getBalanceEth({
        provider,
        address: addr2.address,
      });
      //log("addr2Balance", addr2Balance);

      let amountWei = '1';
      let amountEth = amounts.weiToEth({ amountWei });

      let txResponse = await ethToolset.sendEth({
        networkLabel,
        provider,
        senderAddress: addr1.address,
        receiverAddress: addr2.address,
        amountEth,
      });
      //log(txResponse)

      let txHash = txResponse.hash;
      let requiredConfirms = 12;
      let confirms;

      //confirms = await ethToolset.getTxConfirms({ provider, txHash });
      //log("Tx confirms", confirms);

      await helpers.mine(10);

      //confirms = await ethToolset.getTxConfirms({ provider, txHash });
      //log("Tx confirms", confirms);

      await helpers.mine(2);

      confirms = await ethToolset.getTxConfirms({ provider, txHash });
      //log("Tx confirms", confirms);

      expect(confirms).to.equal(requiredConfirms);

      //log("addr1.address", addr1.address);
      //log("addr2.address", addr2.address);

      let addr1Balance2 = await ethToolset.getBalanceEth({
        provider,
        address: addr1.address,
      });
      //log("addr1Balance2", addr1Balance2);

      let addr2Balance2 = await ethToolset.getBalanceEth({
        provider,
        address: addr2.address,
      });
      //log("addr2Balance2", addr2Balance2);

      let differenceWei = ethers.parseEther(addr2Balance2) - ethers.parseEther(addr2Balance);
      expect(differenceWei).to.equal(1);

      let { txFeeWei, txFeeEth } = await ethToolset.getTxFees({
        provider,
        txHash,
      });

      let calculatedSpend = Number(amountWei) + Number(txFeeWei);
      let spent = ethers.parseEther(addr1Balance) - ethers.parseEther(addr1Balance2);
      expect(spent).to.equal(calculatedSpend);
    });


  });


  describe('Test getCanonicalSignature', function () {


    it('Should correctly convert a complex signature to a canonical form', function () {
        const signature = 'Transfer(address indexed _from, address indexed _to, uint256 _value)';
        const expectedCanonical = 'Transfer(address,address,uint256)';
        const result = ethToolset.getCanonicalSignature(signature);
        expect(result).to.equal(expectedCanonical);
    });


    it('Should throw an error for an invalid function signature', function () {
        const badSignature = 'InvalidFunction';
        expect(() => ethToolset.getCanonicalSignature(badSignature)).to.throw(Error, 'Invalid function signature');
    });

});


});
