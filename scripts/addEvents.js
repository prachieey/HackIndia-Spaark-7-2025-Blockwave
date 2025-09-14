const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const EventTicket = await ethers.getContractFactory("EventTicket");
  
  // Connect to the deployed contract (replace with your contract address)
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const eventTicket = await EventTicket.attach(contractAddress);

  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Adding events with the account:", deployer.address);

  // Real upcoming events data
  const events = [
    {
      name: "Ethereum DevCon 2025",
      location: "Bangkok, Thailand",
      date: Math.floor(new Date("2025-11-15T09:00:00").getTime() / 1000), // Convert to Unix timestamp
      price: ethers.utils.parseEther("0.1"), // 0.1 ETH
      ticketsAvailable: 1000,
      description: "The largest Ethereum developer conference featuring workshops, talks, and networking opportunities with top blockchain developers worldwide."
    },
    {
      name: "Web3 Summit 2025",
      location: "Berlin, Germany",
      date: Math.floor(new Date("2025-09-30T10:00:00").getTime() / 1000),
      price: ethers.utils.parseEther("0.05"), // 0.05 ETH
      ticketsAvailable: 500,
      description: "Annual gathering of Web3 builders and enthusiasts discussing the future of decentralized technologies."
    },
    {
      name: "NFT.NYC 2025",
      location: "New York, USA",
      date: Math.floor(new Date("2025-10-20T09:30:00").getTime() / 1000),
      price: ethers.utils.parseEther("0.2"), // 0.2 ETH
      ticketsAvailable: 2000,
      description: "The premier event for NFT creators, collectors, and traders to explore the latest in digital art and collectibles."
    }
  ];

  // Add events to the contract
  for (const event of events) {
    console.log(`Adding event: ${event.name}`);
    const tx = await eventTicket.createEvent(
      event.name,
      event.location,
      event.date,
      event.price,
      event.ticketsAvailable,
      event.description
    );
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Event "${event.name}" added! Transaction hash: ${receipt.transactionHash}`);
  }

  console.log("All events added successfully!");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
