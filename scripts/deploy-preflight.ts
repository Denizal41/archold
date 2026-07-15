import { network } from "hardhat";
import { erc20Abi, formatUnits } from "viem";

const EXPECTED_CHAIN_ID = 5_042_002;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const { viem, networkName } = await network.create();
const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

if (!walletClient?.account) throw new Error("No Arc Testnet deployer account is configured.");

const deployer = walletClient.account.address;
const [chainId, nativeBalance, tokenBalance] = await Promise.all([
  publicClient.getChainId(),
  publicClient.getBalance({ address: deployer }),
  publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [deployer],
  }),
]);

if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Unexpected chain ID: ${chainId}`);

console.log(`Network: ${networkName}`);
console.log(`Chain ID: ${chainId}`);
console.log(`Deployer: ${deployer}`);
console.log(`Native gas USDC: ${formatUnits(nativeBalance, 18)}`);
console.log(`ERC-20 USDC interface: ${formatUnits(tokenBalance, 6)}`);
console.log("Contract: ArcHoldEscrow V3");
console.log(`Constructor USDC: ${USDC_ADDRESS}`);
console.log("Preflight only: no transaction was sent.");
