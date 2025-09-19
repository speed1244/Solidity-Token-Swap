
const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const TimToken = await hre.ethers.getContractFactory("Token");
  const timToken = await TimToken.deploy("100");

  const AliceToken = await hre.ethers.getContractFactory("AliceCoin");
  const aliceToken = await AliceToken.deploy("200");

  const DEX = await hre.ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(timToken.address, 100);

  await timToken.deployed();
  await aliceToken.deployed();
  await dex.deployed();
  console.log("Tim Token deployed to:", timToken.address);
  console.log("Ali Token deployed to:", aliceToken.address);
  console.log("DEX deployed to:", dex.address);

  await writeDeploymentInfo(timToken, "tokenTim.json");
  await writeDeploymentInfo(aliceToken, "tokenAli.json");
  await writeDeploymentInfo(dex, "dex.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const data = {
    network: hre.network.name,
    contract: {
      address: contract.address,
      signerAddress: contract.signer.address,
      abi: contract.interface.format(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
