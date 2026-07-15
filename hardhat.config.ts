import { configVariable, defineConfig } from "hardhat/config";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatViem from "@nomicfoundation/hardhat-viem";

export default defineConfig({
  plugins: [hardhatViem, hardhatNetworkHelpers, hardhatNodeTestRunner],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 1_000 }, viaIR: true },
      },
    },
  },
  networks: {
    arcTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 5_042_002,
      url: "https://rpc.testnet.arc.network",
      accounts: [configVariable("ARC_TESTNET_PRIVATE_KEY")],
    },
  },
});
