require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

// Task to add sample events to the contract
task("add-events", "Adds sample events to the EventTicket contract")
  .addParam("contract", "The contract address")
  .setAction(async (taskArgs) => {
    const { ethers } = require("hardhat");
    const EventTicket = await ethers.getContractFactory("EventTicket");
    const eventTicket = await EventTicket.attach(taskArgs.contract);

    // Real upcoming events data
    const events = [
      {
        name: "Ethereum DevCon 2025",
        location: "Bangkok, Thailand",
        date: Math.floor(new Date("2025-11-15T09:00:00").getTime() / 1000),
        price: ethers.utils.parseEther("0.1"),
        ticketsAvailable: 1000,
        description: "The largest Ethereum developer conference featuring workshops, talks, and networking opportunities with top blockchain developers worldwide."
      },
      {
        name: "Web3 Summit 2025",
        location: "Berlin, Germany",
        date: Math.floor(new Date("2025-09-30T10:00:00").getTime() / 1000),
        price: ethers.utils.parseEther("0.05"),
        ticketsAvailable: 500,
        description: "Annual gathering of Web3 builders and enthusiasts discussing the future of decentralized technologies."
      },
      {
        name: "NFT.NYC 2025",
        location: "New York, USA",
        date: Math.floor(new Date("2025-10-20T09:30:00").getTime() / 1000),
        price: ethers.utils.parseEther("0.2"),
        ticketsAvailable: 2000,
        description: "The premier event for NFT creators, collectors, and traders to explore the latest in digital art and collectibles."
      }
    ];

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
      await tx.wait();
      console.log(`✅ Added: ${event.name}`);
    }
    console.log("🎉 All events added successfully!");
  });

// Helper function to get accounts from mnemonic or private key
const getAccounts = () => {
  if (process.env.PRIVATE_KEY) {
    return [process.env.PRIVATE_KEY];
  }
  if (process.env.MNEMONIC) {
    return {
      mnemonic: process.env.MNEMONIC,
    };
  }
  // Default to the first 10 accounts from hardhat
  return [];
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development network using Hardhat's built-in network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Hardhat Network (default for testing)
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 5000
      },
      accounts: getAccounts(),
    },
    // Example configuration for testnets (uncomment and fill in .env)
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: getAccounts(),
    //   chainId: 5,
    //   gasPrice: 20000000000, // 20 gwei
    // },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: getAccounts(),
    //   chainId: 1,
    //   gasPrice: 50000000000, // 50 gwei
    // },
  },
  // Optional: Configure gas reporter
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
};
