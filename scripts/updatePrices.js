import hre from "hardhat";

async function main() {
  const predictionAddress = "0x48eCef05a0439468576A2db561A07173677ab55c";
  const prediction = await hre.ethers.getContractAt("PredictionMarket", predictionAddress);

  const tokens = {
    RISE: "0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf",
    USDC: "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8",
    USDT: "0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849"
  };

  const prices = {
    RISE: hre.ethers.parseUnits("2.45", 18),
    USDC: hre.ethers.parseUnits("1.00", 18),
    USDT: hre.ethers.parseUnits("1.00", 18)
  };

  console.log("Verificando e adicionando tokens permitidos...");
  for (const [symbol, address] of Object.entries(tokens)) {
    try {
      // Verificar se o token já está permitido (opcional, pois a função addAllowedToken reverte se já adicionado)
      // Vamos tentar adicionar; se já estiver, a transação irá reverter com "Token already added"
      // Para evitar erro, podemos verificar antes, mas é mais simples tentar e capturar o erro.
      await prediction.addAllowedToken(address);
      console.log(`Token ${symbol} adicionado com sucesso.`);
    } catch (err) {
      if (err.message.includes("Token already added")) {
        console.log(`Token ${symbol} já estava permitido.`);
      } else {
        throw err;
      }
    }
  }

  console.log("Atualizando preços...");
  await prediction.updatePrice(tokens.RISE, prices.RISE);
  console.log("Preço RISE atualizado");
  await prediction.updatePrice(tokens.USDC, prices.USDC);
  console.log("Preço USDC atualizado");
  await prediction.updatePrice(tokens.USDT, prices.USDT);
  console.log("Preço USDT atualizado");

  // Verificação
  const priceRISE = (await prediction.getPrice(tokens.RISE))[0];
  const priceUSDC = (await prediction.getPrice(tokens.USDC))[0];
  const priceUSDT = (await prediction.getPrice(tokens.USDT))[0];
  console.log("Preços atuais:");
  console.log(`RISE: ${hre.ethers.formatUnits(priceRISE, 18)}`);
  console.log(`USDC: ${hre.ethers.formatUnits(priceUSDC, 18)}`);
  console.log(`USDT: ${hre.ethers.formatUnits(priceUSDT, 18)}`);
}

main().catch(console.error);