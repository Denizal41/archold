import { describe, expect, it } from "vitest";
import { ARC_CHAIN_ID, ARC_CONTRACT_VERSION, ARC_MULTICALL_ADDRESS, USDC_ADDRESS, arcTestnet } from "./arc";
import { parseWalletAccounts } from "./data/walletGateway";
import { getProofHref } from "./utils/proofLink";

describe("Arc Testnet configuration", () => {
  it("uses the official Arc Testnet chain id and USDC native currency", () => {
    expect(ARC_CHAIN_ID).toBe(5_042_002);
    expect(arcTestnet.nativeCurrency).toMatchObject({ symbol: "USDC", decimals: 18 });
  });

  it("uses the verified optional ERC-20 USDC interface", () => {
    expect(USDC_ADDRESS).toBe("0x3600000000000000000000000000000000000000");
  });

  it("configures Multicall3 and requires ArcHold V3", () => {
    expect(ARC_CONTRACT_VERSION).toBe(3n);
    expect(arcTestnet.contracts?.multicall3?.address).toBe(ARC_MULTICALL_ADDRESS);
  });

  it("rejects malformed wallet account payloads", () => {
    expect(() => parseWalletAccounts(["not-an-address"])).toThrow("invalid account address");
    expect(() => parseWalletAccounts("0x1234")).toThrow("invalid account list");
  });

  it("allows only credential-free HTTPS and IPFS proof links", () => {
    expect(getProofHref("https://github.com/example/proof")).toBe("https://github.com/example/proof");
    expect(getProofHref("ipfs://bafyProof123/file.json")).toBe("https://ipfs.io/ipfs/bafyProof123/file.json");
    expect(getProofHref("http://example.com/proof")).toBeUndefined();
    expect(getProofHref("https://user:secret@example.com/proof")).toBeUndefined();
  });
});
