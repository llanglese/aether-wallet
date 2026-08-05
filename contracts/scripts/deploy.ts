import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const initialSupply = ethers.parseEther("1000000");
  const token = await ethers.deployContract("AetherToken", [
    deployer.address,
    initialSupply,
  ]);
  await token.waitForDeployment();
  console.log("AetherToken:", await token.getAddress());

  const guestbook = await ethers.deployContract("Guestbook");
  await guestbook.waitForDeployment();
  console.log("Guestbook:", await guestbook.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
