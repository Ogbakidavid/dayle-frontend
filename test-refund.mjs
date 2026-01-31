
const { api, VaultStatus, MilestoneStatus, UserRole } = require('./lib/mock-api.js');

async function testRefundLogic() {
  console.log("--- Starting Refund Logic Test ---");

  // 1. Setup: Create a Client Session
  console.log("Logging in as Client...");
  const client = await api.auth.login("client@test.com", "password");
  console.log("Logged in:", client.id);

  // 2. Create a Vault
  console.log("Creating Vault...");
  const vault = await api.vaults.create({
    title: "Refund Test Vault",
    totalAmount: 1000,
    milestones: [
        {
            id: "m_test_1",
            title: "Test Milestone",
            amount: 500,
            status: MilestoneStatus.AWAITING_APPROVAL // Initial state for testing
        }
    ]
  });
  console.log("Vault Created:", vault.id);

  // 3. Try to Refund immediately (Should Fail - Invalid State)
  console.log("Test: refunding AWAITING_APPROVAL milestone (Expect Failure)...");
  try {
      await api.vaults.refund(vault.id, "m_test_1", { idempotencyKey: "key-1" });
      console.error("FAIL: Refund succeeded but should have failed.");
  } catch (err) {
      console.log("PASS: Refund failed as expected:", err.code || err.message);
  }

  // 4. Reject the Milestone
  console.log("Rejecting Milestone...");
  await api.milestones.review("m_test_1", {
      outcome: "REJECT",
      reasonCodes: ["QUALITY_ISSUES"],
      notes: "Not good enough"
  });
  
  // Verify Status is REJECTED
  const updatedVault = await api.vaults.getById(vault.id);
  const milestone = updatedVault.milestones.find(m => m.id === "m_test_1");
  console.log("Milestone Status:", milestone.status); // Should be REJECTED

  // 5. Refund the Rejected Milestone (Should Succeed)
  console.log("Test: refunding REJECTED milestone (Expect Success)...");
  try {
      const result = await api.vaults.refund(vault.id, "m_test_1", { idempotencyKey: "key-2" });
      console.log("PASS: Refund success:", result);
      console.log("Ledger Entry Status:", result.status);
  } catch (err) {
      console.error("FAIL: Refund failed:", err);
  }

  console.log("--- Test Complete ---");
}

// Mock browser environment for localstorage if needed by mock-api (it creates a mock if window is undefined)
// The mock-api uses 'import' which requires module support, or we can just view the file logic.
// Since we can't easily run a node script with ES imports without setup, 
// I will rely on the code review and user manual verification.
// Wait, I can try to run it if I rename it to .mjs?
// Let's just create the file and try to run it with node.
testRefundLogic();
