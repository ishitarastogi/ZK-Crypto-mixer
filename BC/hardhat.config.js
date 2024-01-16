// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io/" || "",
      chainId: 534351,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    base: {
      url: "https://base-goerli.public.blastapi.io",
      chainId: 84531,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    celo: {
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    Mantle: {
      url: "https://rpc.testnet.mantle.xyz",
      chainId: 5001,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    Okx: {
      url: "https://testrpc.x1.tech/",
      chainId: 195,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    polygonzkevm: {
      url: "https://rpc.public.zkevm-test.net",
      chainId: 1442,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
    local: {
      url: "http://localhost:24012/rpc",
    },
  },
  etherscan: {
    apiKey: process.env.MANTLE_ETHERSCAN,
  },
};
