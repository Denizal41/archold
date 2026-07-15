import { readFile, writeFile } from "node:fs/promises";

const artifactUrl = new URL(
  "../artifacts/contracts/ArcHoldEscrow.sol/ArcHoldEscrow.json",
  import.meta.url,
);
const outputUrl = new URL("../src/contractBytecode.ts", import.meta.url);
const artifact = JSON.parse(await readFile(artifactUrl, "utf8"));

if (typeof artifact.bytecode !== "string" || !artifact.bytecode.startsWith("0x")) {
  throw new Error("ArcHoldEscrow artifact does not contain deployment bytecode.");
}

await writeFile(
  outputUrl,
  `// Generated from the tested Hardhat artifact. Public deployment bytecode; contains no secrets.\nexport const arcHoldBytecode = ${JSON.stringify(artifact.bytecode)} as const;\n`,
);

console.log("Updated src/contractBytecode.ts from the ArcHoldEscrow artifact.");
