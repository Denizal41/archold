import { defineChain } from "viem";

export const ARC_CHAIN_ID = 5_042_002;
export const ARC_CHAIN_HEX = "0x4cef52";
export const ARC_CONTRACT_VERSION = 3n;
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
export const ARC_MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as const;
export const ARC_EXPLORER = "https://testnet.arcscan.app";
export const ARC_FAUCET = "https://faucet.circle.com";
export const ARC_RPC_URLS = [
  "https://rpc.testnet.arc.network",
  "https://rpc.drpc.testnet.arc.network",
  "https://rpc.blockdaemon.testnet.arc.network",
  "https://rpc.quicknode.testnet.arc.network",
] as const;

export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [...ARC_RPC_URLS] } },
  blockExplorers: { default: { name: "ArcScan", url: ARC_EXPLORER } },
  contracts: { multicall3: { address: ARC_MULTICALL_ADDRESS } },
  testnet: true,
});

export const escrowAbi = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [{ name: "usdcAddress", type: "address" }],
  },
  {
    type: "function",
    name: "createEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "payee", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "description", type: "string" },
    ],
    outputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getEscrowIds",
    stateMutability: "view",
    inputs: [{ name: "party", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getEscrowCount",
    stateMutability: "view",
    inputs: [{ name: "party", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getEscrowIdsPage",
    stateMutability: "view",
    inputs: [
      { name: "party", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "activeValueByParty",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "contractVersion",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "escrows",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "payer", type: "address" },
      { name: "payee", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "status", type: "uint8" },
      { name: "description", type: "string" },
    ],
  },
  {
    type: "function",
    name: "release",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitDelivery",
    stateMutability: "nonpayable",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "proofUri", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deliveries",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "submittedAt", type: "uint64" },
      { name: "claimableAt", type: "uint64" },
      { name: "proofUri", type: "string" },
    ],
  },
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const usdcAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
