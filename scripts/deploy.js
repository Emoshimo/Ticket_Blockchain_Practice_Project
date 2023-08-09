// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return hre.ethers.parseEther(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const NAME = "TokenMaster"
  const SYMBOL = "TM"

  // Deploy contract
  const tokenMaster = await hre.ethers.deployContract("TokenMaster", [NAME, SYMBOL])

  console.log(`Deployed TokenMaster Contract at: ${tokenMaster.address}\n`)
  
  const occasions = [
      {
        name: "UFC Miami",
        cost: tokens(3),
        tickets: 0,
        date: "May 31",
        time: "6:00PM EST",
        location: "Miami-Dade Arena - Miami, FL"
      },
      {
        name: "ETH Tokyo",
        cost: tokens(1),
        tickets: 125,
        date: "Jun 2",
        time: "1:00PM JST",
        location: "Tokyo, Japan"
      },
      {
        name: "ETH Privacy Hackathon",
        cost: tokens(0.25),
        tickets: 200,
        date: "Jun 9",
        time: "10:00AM TRT",
        location: "Turkey, Istanbul"
      },
      {
        name: "Dallas Mavericks vs. San Antonio Spurs",
        cost: tokens(5),
        tickets: 0,
        date: "Jun 11",
        time: "2:30PM CST",
        location: "American Airlines Center - Dallas, TX"
      },
      {
        name: "ETH Global Toronto",
        cost: tokens(1.5),
        tickets: 125,
        date: "Jun 23",
        time: "11:00AM EST",
        location: "Toronto, Canada"
      }
  ]

    for (var i = 0; i < 5; i++) {
    const transaction = await tokenMaster.connect(deployer).list(
      occasions[i].name,
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    )

    await transaction.wait()

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
