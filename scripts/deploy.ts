import { network } from "hardhat";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const { viem, networkName } = await network.create();
const publicClient = await viem.getPublicClient();

console.log(`Deploying ArcHoldEscrow to ${networkName}...`);
console.log(`USDC interface: ${USDC_ADDRESS}`);

const escrow = await viem.deployContract("ArcHoldEscrow", [USDC_ADDRESS]);
const transaction = await publicClient.getTransaction({ hash: escrow.deploymentTransactionHash });

console.log(`Contract address: ${escrow.address}`);
console.log(`Deployment transaction: ${transaction.hash}`);
console.log(`Explorer: https://testnet.arcscan.app/address/${escrow.address}`);
