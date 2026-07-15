import { createPublicClient, fallback, http } from "viem";
import { ARC_RPC_URLS, arcTestnet } from "../arc";

const RPC_TIMEOUT_MS = 10_000;
const RPC_RETRY_COUNT = 2;
const RPC_RETRY_DELAY_MS = 250;

export const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: fallback(ARC_RPC_URLS.map((url) => http(url, {
    retryCount: RPC_RETRY_COUNT, retryDelay: RPC_RETRY_DELAY_MS, timeout: RPC_TIMEOUT_MS,
  }))),
});
