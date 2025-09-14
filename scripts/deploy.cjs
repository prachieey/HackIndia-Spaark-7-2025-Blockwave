const hre = require("hardhat");

async function main() {
  const EventTicket = await hre.ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy();
  await eventTicket.deployed();
  console.log("EventTicket deployed to:", eventTicket.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
