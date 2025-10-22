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
      },
      // Add more events as needed
    ];

    for (const event of events) {
      console.log(`Adding event: ${event.name}`);
      const tx = await eventTicket.createEvent(
        event.name,
        event.location,
        event.date,
        event.price,
        event.ticketsAvailable
      );
      await tx.wait();
      console.log(`Event added: ${event.name}`);
    }
  });

// Configuration
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
