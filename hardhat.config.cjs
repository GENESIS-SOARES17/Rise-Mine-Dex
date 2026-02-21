require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    riseTestnet: {
      url: "https://testnet.riselabs.xyz",
      chainId: 11155931,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      riseTestnet: "empty",
    },
    customChains: [
      {
        network: "riseTestnet",
        chainId: 11155931,
        urls: {
          apiURL: "https://explorer.testnet.riselabs.xyz/api",
          browserURL: "https://explorer.testnet.riselabs.xyz",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};