/**
 * LocalStorage Migration Utility
 * Normalizes legacy lowercase status enums to canonical uppercase
 */

const VAULT_STATUS_MIGRATION = {
  pending: "DRAFT",
  invited: "INVITED",
  funded_unassigned: "FUNDED_UNASSIGNED",
  funded_assigned: "FUNDED_ASSIGNED",
  active: "ACTIVE",
  review: "IN_REVIEW",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

const MILESTONE_STATUS_MIGRATION = {
  pending: "PENDING",
  submitted: "SUBMITTED",
  awaiting_approval: "AWAITING_APPROVAL",
  verified: "VERIFIED",
  approved: "VERIFIED",
  passed: "VERIFIED",
  rejected: "REJECTED",
  failed: "REJECTED",
  revision_requested: "REVISION_REQUESTED",
  in_progress: "PENDING",
};

const KYC_STATUS_MIGRATION = {
  pending: "PENDING",
  verified: "VERIFIED",
  rejected: "REJECTED",
  none: "NONE",
};

/**
 * Migrate a vault object to canonical schema
 */
export function migrateVault(vault) {
  if (!vault) return vault;

  const migrated = { ...vault };

  // Migrate vault status
  if (migrated.status && typeof migrated.status === "string") {
    const lowercase = migrated.status.toLowerCase();
    if (VAULT_STATUS_MIGRATION[lowercase]) {
      migrated.status = VAULT_STATUS_MIGRATION[lowercase];
    } else if (migrated.status !== migrated.status.toUpperCase()) {
      // If it's not already uppercase, convert it
      migrated.status = migrated.status.toUpperCase();
    }
  }

  // Migrate milestones
  if (migrated.milestones && Array.isArray(migrated.milestones)) {
    migrated.milestones = migrated.milestones.map((m) => {
      const migratedMilestone = { ...m };
      if (migratedMilestone.status && typeof migratedMilestone.status === "string") {
        const lowercase = migratedMilestone.status.toLowerCase();
        if (MILESTONE_STATUS_MIGRATION[lowercase]) {
          migratedMilestone.status = MILESTONE_STATUS_MIGRATION[lowercase];
        } else if (migratedMilestone.status !== migratedMilestone.status.toUpperCase()) {
          migratedMilestone.status = migratedMilestone.status.toUpperCase();
        }
      }
      return migratedMilestone;
    });
  }

  return migrated;
}

/**
 * Migrate user object to canonical schema
 */
export function migrateUser(user) {
  if (!user) return user;

  const migrated = { ...user };

  // Migrate KYC status
  if (migrated.kycStatus && typeof migrated.kycStatus === "string") {
    const lowercase = migrated.kycStatus.toLowerCase();
    if (KYC_STATUS_MIGRATION[lowercase]) {
      migrated.kycStatus = KYC_STATUS_MIGRATION[lowercase];
    } else if (migrated.kycStatus !== migrated.kycStatus.toUpperCase()) {
      migrated.kycStatus = migrated.kycStatus.toUpperCase();
    }
  }

  return migrated;
}

/**
 * Clear legacy cached data (DEV mode only)
 */
export function clearLegacyCache() {
  if (typeof window === "undefined") return;

  try {
    const sessionData = localStorage.getItem("mock_user_session");
    if (sessionData) {
      const user = JSON.parse(sessionData);
      const migrated = migrateUser(user);
      localStorage.setItem("mock_user_session", JSON.stringify(migrated));
      console.log("[Migration] Migrated user session to canonical schema");
    }
  } catch (e) {
    console.error("[Migration] Failed to migrate session:", e);
  }
}

// Auto-run migration on import in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  clearLegacyCache();
}
