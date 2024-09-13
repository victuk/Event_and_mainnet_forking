const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { describe } = require("mocha");
const {ethers} = require("hardhat");

describe("Test to deploy an ERC721 contract and event.", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployTokenContract() {
    const [owner] = await ethers.getSigners();
    const Erc20 = await ethers.getContractFactory("MyToken");
    const token = await Erc20.deploy();

    return {
      token
    }
  }

  async function deployEventContract() {

    const {token} = await loadFixture(deployTokenContract);



    const [contractDeployer, account1, account2, account3, account4] = await ethers.getSigners();
    const EventContract = await ethers.getContractFactory("EventContract");
    const eventContract = await EventContract.deploy(2, [account1, account2, account3, account4]);

    const amount = ethers.parseUnits("10000", 18);

    await token.transfer(eventContract, amount);

    console.log(await token.balanceOf(eventContract));

    return {
      token,
      eventContract,
      contractDeployer,
      account1,
      account2,
      account3,
      account4
    }
  }
  
  describe("Test the events function", () => {

    it("Create a new event", async function() {
      const {eventContract} = await loadFixture(deployEventContract);
      await eventContract.createEvent("Event 1", "Somewhere", "4PM, 5th December, 2024");
      expect(tx.isCompleted).to.equal(false);
      expect(tx.transactionSigners.length).to.equal(1);
    });
  
    it("Approve quorum", async function() {
      const {multiSig,account1} = await loadFixture(deployEventContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      const tx = await multiSig.getQuorumTransaction(1);
  
      expect(tx.transactionSigners.length).to.equal(2);
  
    });

    it("More approvals to make the transaction request to be accpeted", async () => {

      const {multiSig, account1, account2} = await loadFixture(deployEventContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      
      const tx = await multiSig.getQuorumTransaction(1);
      
      expect(tx.isCompleted).to.equal(true);

      const newQuorumNumber = await multiSig.quorum();
      
      expect(newQuorumNumber).to.equal(4);
      
      

    });


    it("Should fail if you try to approve an already completed transaction", async () => {

      const {multiSig, account1, account2} = await loadFixture(deployEventContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      
      const tx = await multiSig.getQuorumTransaction(1);
      
      expect(tx.isCompleted).to.equal(true);
      
      expect(multiSig.connect(account2).approveQuorumChange(1)).to.be.revertedWith('transaction already completed');
      

    });

    it("Should fail if we try to get an invalid transaction ID", async () => {
      const {multiSig, account2} = await loadFixture(deployEventContract);
      await expect(multiSig.connect(account2).approveQuorumChange(20)).to.be.revertedWith("invalid tx id");
    });

    it("Should fail because the signer is not a valid signer", async () => {
      const {multiSig, account5} = await loadFixture(deployEventContract);
      await multiSig.updateQuorum(4);
      await expect(multiSig.connect(account5).approveQuorumChange(1)).to.be.revertedWith("not a valid signer");
    });

  });

  describe("Transfer", () => {
    it("Should be able to create the transfer", async () => {
      const {multiSig, contractDeployer, token} = await loadFixture(deployEventContract);
      await multiSig.transfer(1000, contractDeployer, token);
      const txCount = await multiSig.txCount();
      expect(txCount).to.equal(1);
    });
  });


});
