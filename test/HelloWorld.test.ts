// Imports
import hardhat, { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// Contract types
import { HelloWorld } from "#typechain-types/contracts/HelloWorld";

// Tests

describe("HelloWorld contract", function () {
  before(async function () {
    await hardhat.network.provider.send("hardhat_reset");
  });

  // We use `loadFixture` to share common setups (or fixtures) between tests.
  // Using this simplifies your tests and makes them run faster, by taking
  // advantage of Hardhat Network's snapshot functionality.
  async function deployHelloWorldFixture() {
    let contractHelloWorld: HelloWorld;
    const [owner, addr1, addr2] = await ethers.getSigners();
    const initialMessage = "Hello World!";
    const constructorArgs = [initialMessage];
    contractHelloWorld = (await ethers.deployContract(
      "HelloWorld",
      constructorArgs,
    )) as unknown as HelloWorld;
    return { contractHelloWorld, initialMessage, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the initial message supplied to the constructor", async function () {
      const { contractHelloWorld, initialMessage } = await loadFixture(
        deployHelloWorldFixture,
      );
      const message = await contractHelloWorld.message();
      expect(message).to.equal(initialMessage);
    });
  });

  describe("Update", function () {
    it("Should update the message", async function () {
      const { contractHelloWorld, initialMessage } = await loadFixture(
        deployHelloWorldFixture,
      );
      const newMessage = "New message.";
      await contractHelloWorld.update(newMessage);
      const message = await contractHelloWorld.message();
      expect(message).to.equal(newMessage);
    });
  });
});
