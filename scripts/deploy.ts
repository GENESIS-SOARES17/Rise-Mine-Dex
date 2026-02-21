import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to Rise Testnet...");

  const FeePool = await ethers.getContractFactory("FeePool");
  const feePool = await FeePool.deploy();
  await feePool.waitForDeployment();
  const feePoolAddress = await feePool.getAddress();
  console.log("FeePool deployed to:", feePoolAddress);

  const MiniAMM = await ethers.getContractFactory("MiniAMM");
  const miniAMM = await MiniAMM.deploy(feePoolAddress);
  await miniAMM.waitForDeployment();
  const miniAMMAddress = await miniAMM.getAddress();
  console.log("MiniAMM deployed to:", miniAMMAddress);

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(feePoolAddress);
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", predictionMarketAddress);

  // Configurar permissões
  await feePool.setAMMContract(miniAMMAddress);
  console.log("FeePool: AMM contract set");
  await feePool.setPredictionContract(predictionMarketAddress);
  console.log("FeePool: Prediction contract set");

  console.log("Deploy completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});