export const seedInvites = [
    {
        token: "invite_valid_123",
        vaultId: "v_invite_test",
        email: "freelancer@demo.com",
        status: "PENDING",
        invitedAt: "2026-01-20T10:00:00Z",
        expiresAt: "2026-01-23T10:00:00Z", // 72 hours later
    },
    {
        token: "invite_expired_456",
        vaultId: "v_invite_test",
        email: "expired@example.com",
        status: "PENDING",
        invitedAt: "2026-01-10T10:00:00Z",
        expiresAt: "2026-01-13T10:00:00Z", // Expired
    },
    {
        token: "invite_conflict_789",
        vaultId: "v_1", // Already active/assigned
        email: "alex@devstudio.com",
        status: "PENDING",
        invitedAt: "2026-01-20T12:00:00Z",
        expiresAt: "2026-01-23T12:00:00Z",
    },
    {
        token: "invite_declined_111",
        vaultId: "v_invite_test",
        email: "nope@freelancer.com",
        status: "DECLINED",
        invitedAt: "2026-01-19T10:00:00Z",
        respondedAt: "2026-01-19T14:00:00Z",
        expiresAt: "2026-01-22T10:00:00Z",
        declineReason: "RATE_TOO_LOW",
    },
];
