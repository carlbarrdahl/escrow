import { expect } from "chai";
import { ethers } from "hardhat";

const AMOUNT = ethers.utils.parseEther("1");
const RESOLVER_SHARE = AMOUNT.div(10_000).mul(1500);
const PROVIDER_SHARE = AMOUNT.sub(RESOLVER_SHARE);

async function deploy() {
  const Escrow = await ethers.getContractFactory("Escrow");
  const Token = await ethers.getContractFactory("TestToken");
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");

  const token = await Token.deploy();
  const escrow = await Escrow.deploy();
  const factory = await EscrowFactory.deploy(escrow.address);

  return { escrow, token, factory, Escrow };
}

const { getBalance } = ethers.provider;

describe("EscrowFactory", function () {
  describe("Create", () => {
    it("should deploy Escrow contract", async () => {
      const { factory } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();

      await expect(
        factory
          .connect(client)
          .create(client.address, talent.address, resolver.address, 1000)
      ).to.emit(factory, "EscrowCreated");
    });
  });
});
describe("Escrow", function () {
  describe("Deployment", () => {
    it("should set the variables", async () => {
      const { escrow } = await deploy();
      const [owner, client, talent, resolver] = await ethers.getSigners();

      await escrow.init(client.address, talent.address, resolver.address, 1000);

      expect(await escrow.talent()).to.eq(talent.address);
      expect(await escrow.client()).to.eq(client.address);
      expect(await escrow.resolver()).to.eq(resolver.address);
      expect(await escrow.fee()).to.eq(1000);
    });
  });

  describe("Deposit", () => {
    it("should deposit ERC20 tokens", async () => {
      const { escrow, token } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();
      await token.mint(client.address, AMOUNT);
      await token.connect(client).approve(escrow.address, AMOUNT);
      await escrow.init(client.address, talent.address, resolver.address, 1500);
      await expect(
        escrow.connect(client).deposit(token.address, AMOUNT, 0, "note")
      )
        .to.emit(escrow, "Deposit")
        .withArgs(
          client.address,
          talent.address,
          token.address,
          AMOUNT,
          "note"
        );

      expect(await token.balanceOf(escrow.address)).to.eq(AMOUNT);
    });
    it("should deposit ERC20 tokens and release immediately", async () => {
      const { escrow, token } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();
      await token.mint(client.address, AMOUNT);
      await token.connect(client).approve(escrow.address, AMOUNT);
      await escrow.init(client.address, talent.address, resolver.address, 1500);
      await expect(
        escrow.connect(client).deposit(token.address, AMOUNT, AMOUNT, "note")
      )
        .to.emit(escrow, "Deposit")
        .withArgs(
          client.address,
          talent.address,
          token.address,
          AMOUNT,
          "note"
        );

      expect(await token.balanceOf(escrow.address)).to.eq(0);
      expect(await token.balanceOf(talent.address)).to.eq(PROVIDER_SHARE);
      expect(await token.balanceOf(resolver.address)).to.eq(RESOLVER_SHARE);
    });
  });

  describe("Release", () => {
    it("must be sent by a party address", async () => {
      const { escrow, token } = await deploy();
      const [owner, client, talent, resolver] = await ethers.getSigners();
      await escrow.init(client.address, talent.address, resolver.address, 1500);
      await expect(
        escrow.release(token.address, AMOUNT, "note")
      ).to.revertedWith("Sender not part of party");
    });

    it("requires two votes to release funds", async () => {
      const { escrow, token } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();
      await escrow.init(client.address, talent.address, resolver.address, 1500);

      await token.mint(owner.address, AMOUNT);
      await token.transfer(escrow.address, AMOUNT);

      await expect(
        escrow.connect(talent).release(token.address, AMOUNT, "note")
      )
        .to.emit(escrow, "Confirmed")
        .withArgs(talent.address, token.address, AMOUNT, 1);

      await expect(
        escrow.connect(resolver).release(token.address, AMOUNT, "note")
      )
        .to.emit(escrow, "Released")
        .withArgs(
          resolver.address,
          talent.address,
          token.address,
          AMOUNT,
          "note"
        );

      expect(await token.balanceOf(resolver.address)).to.eq(RESOLVER_SHARE);
      expect(await token.balanceOf(talent.address)).to.eq(PROVIDER_SHARE);
    });
    it("client can release funds immediately", async () => {
      const { escrow, token } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();
      await escrow.init(client.address, talent.address, resolver.address, 1500);

      await token.mint(owner.address, AMOUNT);
      await token.transfer(escrow.address, AMOUNT);

      await expect(
        escrow.connect(client).release(token.address, AMOUNT, "note")
      )[]
        .to.emit(escrow, "Released")
        .withArgs(
          client.address,
          talent.address,
          token.address,
          AMOUNT,
          "note"
        );

      expect(await token.balanceOf(resolver.address)).to.eq(RESOLVER_SHARE);
      expect(await token.balanceOf(talent.address)).to.eq(PROVIDER_SHARE);
    });
    it("votes must agree on token and amount", async () => {
      const { escrow, token } = await deploy();

      const [owner, client, talent, resolver] = await ethers.getSigners();
      await escrow.init(client.address, talent.address, resolver.address, 1500);

      await token.mint(owner.address, AMOUNT);
      await token.transfer(escrow.address, AMOUNT);

      await escrow.connect(talent).release(token.address, AMOUNT, "note");
      await escrow
        .connect(resolver)
        .release(token.address, AMOUNT.div(2), "note");

      // Funds still in contract
      expect(await token.balanceOf(escrow.address)).to.eq(AMOUNT);
    });
  });
});
