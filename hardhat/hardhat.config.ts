import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const COINMARKETCAP_KEY = process.env.COINMARKETCAP_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: { optimizer: { enabled: true, runs: 1000 } },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [WALLET_PRIVATE_KEY as string],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_KEY,
    token: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  etherscan: { apiKey: ETHERSCAN_KEY },
};

task("transfer", "Transfer ETH and Tokens")
  .addParam("amount", "Amount of ETH and tokens")
  .addParam("to", "Receiving address")
  .addParam("token", "Token address")
  .setAction(async ({ amount, to, token }, hre) => {
    const [owner] = await hre.ethers.getSigners();
    const value = hre.ethers.utils.parseEther(amount);
    await owner.sendTransaction({ to, value });

    (await hre.ethers.getContractAt("TestToken", token)).mint(
      to,
      hre.ethers.utils.parseEther(String(amount * 1_000))
    );
  });

task("docgen", "Generate NatSpec", async (taskArgs, hre) => {
  // @ts-ignore
  const config = hre.config.docgen || {
    // Ignore these contracts
    ignore: ["console", "@openzeppelin", "TestToken", "IEscrow"],
    // Save to this path (make sure the folder exists)
    path: ["..", "escrow-web", "contracts"],
  };
  // Get all contracts used
  const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
  await Promise.all(
    contractNames
      .filter(
        (contractName) =>
          // Skip contracts in the ignore list
          !(config.ignore || []).some((name: string) =>
            contractName.includes(name)
          )
      )
      .map(async (contractName) => {
        const [source, name] = contractName.split(":");
        // @ts-ignore
        const { metadata } = (await hre.artifacts.getBuildInfo(contractName))
          .output.contracts[source][name];
        // Get the relevant data
        const { abi, devdoc, userdoc } = JSON.parse(metadata).output;
        // Save the file
        fs.writeFileSync(
          path.resolve(__dirname, ...config.path, `${name}.json`),
          JSON.stringify({ name, abi, devdoc, userdoc }, null, 2)
        );
      })
  );
});

export default config;
