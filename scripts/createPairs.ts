import { ethers } from "hardhat";

async function main() {
  const miniAMMAddress = "0xCc2CD136685219b19D927e3459A455e644c5495f";
  const miniAMM = await ethers.getContractAt("MiniAMM", miniAMMAddress);

  const tokens = {
    RISE: "0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf",
    USDC: "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8",
    USDT: "0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849",
  };

  const pairs = [
    [tokens.RISE, tokens.USDC],
    [tokens.RISE, tokens.USDT],
    [tokens.USDC, tokens.USDT],
  ];

  for (const [tokenA, tokenB] of pairs) {
    console.log(`Creating pair ${tokenA} / ${tokenB}...`);
    const tx = await miniAMM.createPair(tokenA, tokenB);
    await tx.wait();
    console.log("Pair created");
  }
}

main().catch(console.error);