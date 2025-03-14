const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory for DAOPlatform
  const DAOPlatform = await ethers.getContractFactory("DAOPlatform");
  
  // Deploy the contract
  const daoPlatform = await DAOPlatform.deploy();  
  await daoPlatform.deployed();  // Wait for the deployment to be mined

  // Output the deployed contract address
  console.log(`DAOPlatform deployed to: ${daoPlatform.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
