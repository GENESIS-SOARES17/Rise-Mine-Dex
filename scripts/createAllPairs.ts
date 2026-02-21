const hre = require("hardhat");

async function main() {
  // Endereço do contrato MiniAMM implantado
  const miniAMMAddress = "0xCc2CD136685219b19D927e3459A455e644c5495f";

  // Conectar ao contrato
  const miniAMM = await hre.ethers.getContractAt("MiniAMM", miniAMMAddress);

  // Endereços dos tokens (corrigidos conforme imagem)
  const tokens = {
    RISE: "0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf",
    USDC: "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8",
    USDT: "0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849",
  };

  // Todas as combinações possíveis (3 pares)
  const pairs = [
    [tokens.RISE, tokens.USDC],
    [tokens.RISE, tokens.USDT],
    [tokens.USDC, tokens.USDT],
  ];

  console.log("🔍 Verificando pares existentes...");
  const existingPairs = await miniAMM.getAllPairs();
  console.log(`Pares existentes: ${existingPairs.length}`);

  for (const [tokenA, tokenB] of pairs) {
    try {
      console.log(`Criando par ${tokenA} / ${tokenB}...`);
      const tx = await miniAMM.createPair(tokenA, tokenB);
      await tx.wait();
      console.log("✅ Par criado com sucesso!");
    } catch (err) {
      if (err.message.includes("Pair exists")) {
        console.log(`ℹ️ Par ${tokenA} / ${tokenB} já existe.`);
      } else {
        console.error(`❌ Erro ao criar par ${tokenA} / ${tokenB}:`, err.message);
      }
    }
  }

  console.log("🎉 Processo concluído.");
}

main().catch(console.error);