import { expect } from "chai";
import { ethers } from "hardhat";

describe("AetherToken", () => {
  it("mints initial supply to owner and transfers", async () => {
    const [owner, alice] = await ethers.getSigners();
    const token = await ethers.deployContract("AetherToken", [
      owner.address,
      ethers.parseEther("1000"),
    ]);
    expect(await token.balanceOf(owner.address)).to.equal(
      ethers.parseEther("1000"),
    );

    await token.transfer(alice.address, ethers.parseEther("10"));
    expect(await token.balanceOf(alice.address)).to.equal(
      ethers.parseEther("10"),
    );
  });
});

describe("Guestbook", () => {
  it("stores the latest message", async () => {
    const [author] = await ethers.getSigners();
    const book = await ethers.deployContract("Guestbook");
    await book.postMessage("hello aether");
    expect(await book.latestMessage()).to.equal("hello aether");
    expect(await book.latestAuthor()).to.equal(author.address);
    expect(await book.messageCount()).to.equal(1n);
  });
});
