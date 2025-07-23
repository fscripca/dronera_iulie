const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("DRNToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("DRNToken deployed at:", token.address);

  const Sale = await hre.ethers.getContractFactory("DRNTokenSale");
  const sale = await Sale.deploy(token.address, hre.ethers.utils.parseEther("0.001"));
  await sale.deployed();
  console.log("DRNTokenSale deployed at:", sale.address);

  await token.transfer(sale.address, hre.ethers.utils.parseEther("85000000"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
