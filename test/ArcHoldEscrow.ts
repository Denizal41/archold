import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.create();
const ONE_USDC = 1_000_000n;

async function deployFixture() {
  const [payer, payee, stranger] = await viem.getWalletClients();
  const usdc = await viem.deployContract("MockUSDC");
  const escrow = await viem.deployContract("ArcHoldEscrow", [usdc.address]);
  const publicClient = await viem.getPublicClient();
  const block = await publicClient.getBlock();
  const deadline = block.timestamp + 86_400n;

  await usdc.write.mint([payer.account.address, 1_000n * ONE_USDC]);
  await usdc.write.approve([escrow.address, 500n * ONE_USDC]);

  return { payer, payee, stranger, usdc, escrow, deadline };
}

async function createFundedEscrow() {
  const setup = await deployFixture();
  await setup.escrow.write.createEscrow([
    setup.payee.account.address,
    100n * ONE_USDC,
    setup.deadline,
    "Landing page delivery",
  ]);
  return setup;
}

async function createDeliveredEscrow() {
  const setup = await createFundedEscrow();
  await setup.escrow.write.submitDelivery([0n, "https://example.com/delivery/0"], {
    account: setup.payee.account,
  });
  return setup;
}

describe("ArcHoldEscrow", () => {
  it("locks USDC and stores a discoverable milestone", async () => {
    const { payer, payee, usdc, escrow, deadline } = await networkHelpers.loadFixture(createFundedEscrow);
    const record = await escrow.read.escrows([0n]);
    const payerIds = await escrow.read.getEscrowIds([payer.account.address]);
    const payeeIds = await escrow.read.getEscrowIds([payee.account.address]);

    assert.equal(record[0].toLowerCase(), payer.account.address.toLowerCase());
    assert.equal(record[1].toLowerCase(), payee.account.address.toLowerCase());
    assert.equal(record[2], 100n * ONE_USDC);
    assert.equal(record[3], deadline);
    assert.equal(record[4], 0);
    assert.equal(record[5], "Landing page delivery");
    assert.deepEqual(payerIds, [0n]);
    assert.deepEqual(payeeIds, [0n]);
    assert.equal(await usdc.read.balanceOf([escrow.address]), 100n * ONE_USDC);
    assert.equal(await escrow.read.activeValueByParty([payer.account.address]), 100n * ONE_USDC);
    assert.equal(await escrow.read.activeValueByParty([payee.account.address]), 100n * ONE_USDC);
    assert.equal(await escrow.read.contractVersion(), 3n);
  });

  it("releases funds only when the payer approves delivery", async () => {
    const { payee, stranger, usdc, escrow } = await networkHelpers.loadFixture(createDeliveredEscrow);

    await assert.rejects(escrow.write.release([0n], { account: stranger.account }));
    await escrow.write.release([0n]);

    assert.equal(await usdc.read.balanceOf([payee.account.address]), 100n * ONE_USDC);
    assert.equal((await escrow.read.escrows([0n]))[4], 2);
    assert.equal(await escrow.read.activeValueByParty([payee.account.address]), 0n);
    await assert.rejects(escrow.write.release([0n]));
  });

  it("records contractor delivery proof before release", async () => {
    const { payee, stranger, escrow } = await networkHelpers.loadFixture(createFundedEscrow);

    await assert.rejects(escrow.write.release([0n]));
    await assert.rejects(escrow.write.submitDelivery([0n, "https://example.com/fake"], { account: stranger.account }));
    await assert.rejects(escrow.write.submitDelivery([0n, ""], { account: payee.account }));

    await escrow.write.submitDelivery([0n, "ipfs://bafybeig-delivery"], { account: payee.account });
    const delivery = await escrow.read.deliveries([0n]);

    assert.ok(delivery[0] > 0n);
    assert.ok(delivery[1] > delivery[0]);
    assert.equal(delivery[2], "ipfs://bafybeig-delivery");
    assert.equal((await escrow.read.escrows([0n]))[4], 1);
    await assert.rejects(escrow.write.submitDelivery([0n, "https://example.com/replaced"], { account: payee.account }));
  });

  it("blocks early payer refunds but lets the payee return funds", async () => {
    const { payer, payee, usdc, escrow } = await networkHelpers.loadFixture(createFundedEscrow);

    await assert.rejects(escrow.write.refund([0n]));
    await escrow.write.refund([0n], { account: payee.account });

    assert.equal(await usdc.read.balanceOf([payer.account.address]), 1_000n * ONE_USDC);
    assert.equal((await escrow.read.escrows([0n]))[4], 3);
    assert.equal(await escrow.read.activeValueByParty([payer.account.address]), 0n);
  });

  it("protects delivered work and lets the contractor claim after review", async () => {
    const { payee, escrow } = await networkHelpers.loadFixture(createDeliveredEscrow);
    const delivery = await escrow.read.deliveries([0n]);

    await assert.rejects(escrow.write.refund([0n]));
    await assert.rejects(escrow.write.claim([0n], { account: payee.account }));
    await networkHelpers.time.increaseTo(delivery[1]);
    await escrow.write.claim([0n], { account: payee.account });

    assert.equal((await escrow.read.escrows([0n]))[4], 2);
    assert.equal(await escrow.read.activeValueByParty([payee.account.address]), 0n);
  });

  it("rejects late delivery and permits payer refund after expiry", async () => {
    const { payee, escrow, deadline } = await networkHelpers.loadFixture(createFundedEscrow);

    await networkHelpers.time.increaseTo(deadline + 1n);
    await assert.rejects(escrow.write.submitDelivery([0n, "https://example.com/late"], { account: payee.account }));
    await escrow.write.refund([0n]);

    assert.equal((await escrow.read.escrows([0n]))[4], 3);
    assert.equal(await escrow.read.activeValueByParty([payee.account.address]), 0n);
  });

  it("pages escrow discovery with a bounded result size", async () => {
    const { payer, payee, escrow, deadline } = await networkHelpers.loadFixture(createFundedEscrow);
    await escrow.write.createEscrow([payee.account.address, ONE_USDC, deadline, "Second milestone"]);
    await escrow.write.createEscrow([payee.account.address, ONE_USDC, deadline, "Third milestone"]);

    assert.equal(await escrow.read.getEscrowCount([payer.account.address]), 3n);
    assert.deepEqual(await escrow.read.getEscrowIdsPage([payer.account.address, 1n, 2n]), [1n, 2n]);
    await assert.rejects(escrow.read.getEscrowIdsPage([payer.account.address, 0n, 51n]));
  });

  it("rejects invalid milestones", async () => {
    const { payer, deadline, escrow } = await networkHelpers.loadFixture(deployFixture);

    await assert.rejects(escrow.write.createEscrow([payer.account.address, ONE_USDC, deadline, "Self payment"]));
    await assert.rejects(escrow.write.createEscrow(["0x0000000000000000000000000000000000000000", ONE_USDC, deadline, "No payee"]));
    await assert.rejects(escrow.write.createEscrow([payer.account.address, 0n, deadline, "No value"]));
  });
});
