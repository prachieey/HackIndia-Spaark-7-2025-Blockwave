const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");
  
  // Get the contract factory
  const EventTicket = await hre.ethers.getContractFactory("EventTicket");
  
  // Deploy the contract
  console.log("Deploying EventTicket contract...");
  const eventTicket = await EventTicket.deploy();
  
  // Wait for deployment to complete
  await eventTicket.deployed();
  
  console.log(`✅ EventTicket deployed to: ${eventTicket.address}`);
  
  // Export the contract address for easy access
  console.log("\n📋 Export the following to your .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${eventTicket.address}\n`);
  
  return eventTicket.address;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
