# Dayle Backend API Contract

**Version**: 1.0.0  
**Generated**: 2026-01-29  
**Framework**: NestJS + Prisma + PostgreSQL  
**Purpose**: Implementation-ready backend specification matching frontend expectations

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Canonical Domain Enums](#canonical-domain-enums)
3. [Auth Module](#auth-module)
4. [Onboarding Module](#onboarding-module)
5. [Vault Module](#vault-module)
6. [Milestone Module](#milestone-module)
7. [Invite Module](#invite-module)
8. [Wallet Module](#wallet-module)
9. [Ledger Module](#ledger-module)
10. [Dispute Module](#dispute-module)
11. [Evidence Module](#evidence-module)
12. [Upload Module](#upload-module)
13. [Error Codes](#error-codes)
14. [Idempotency](#idempotency)
15. [Wallet & Provider Integration](#wallet--provider-integration)

---

## Authentication & Authorization

### Session Management

**Token Format**: JWT with payload:

```typescript
{
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

**Headers Required**:

- `Authorization: Bearer <token>` (all protected endpoints)
- `X-Idempotency-Key: <uuid>` (money operations only)

### Role Guards

- `@Public()` - No authentication required
- `@Roles(UserRole.CLIENT)` - Client only
- `@Roles(UserRole.FREELANCER)` - Freelancer only
- `@Roles(UserRole.CLIENT, UserRole.FREELANCER)` - Either role
- `@Roles(UserRole.ADMIN)` - Admin only

---

## Canonical Domain Enums

These enums are the single source of truth for state values across the system. All API responses must use these uppercase literals.

### VaultStatus

| Value               | Description                                                     |
| :------------------ | :-------------------------------------------------------------- |
| `DRAFT`             | Initial creation state                                          |
| `AWAITING_FUNDING`  | Created but not yet funded by client                            |
| `INVITED`           | Freelancer has been invited to the vault                        |
| `FUNDED_UNASSIGNED` | Vault is funded but no freelancer is assigned                   |
| `FUNDED_ASSIGNED`   | Vault is funded and has an assigned freelancer (pre-activation) |
| `ACTIVE`            | Work is in progress                                             |
| `IN_REVIEW`         | One or more milestones are under review                         |
| `COMPLETED`         | All milestones have been verified and released                  |
| `CANCELLED`         | Vault has been cancelled                                        |
| `DISPUTED`          | Vault is under dispute resolution                               |
| `PAUSED`            | Vault is temporarily paused                                     |

### MilestoneStatus

| Value                | Description                                                                   |
| :------------------- | :---------------------------------------------------------------------------- |
| `PENDING`            | Not yet started                                                               |
| `SUBMITTED`          | Freelancer has submitted work                                                 |
| `AWAITING_APPROVAL`  | Waiting for client review/payout decision                                     |
| `VERIFIED`           | Approved by client; eligible for explicit release                             |
| `payoutStatus`       | _Internal Signal_: Read from `TransactionStatus` to confirm actual money move |
| `REVISION_REQUESTED` | Client requested changes                                                      |
| `REJECTED`           | Client rejected the submission                                                |
| `DISPUTED`           | Under dispute resolution                                                      |

### UserRole

| Value        | Description                    |
| :----------- | :----------------------------- |
| `NONE`       | Unauthenticated or placeholder |
| `CLIENT`     | Service buyer                  |
| `FREELANCER` | Service provider               |
| `ADMIN`      | Platform administrator         |

---

## 3. Auth Module

### POST /api/auth/signup

**Access**: Public  
**Purpose**: Create new user account

**Request DTO**:

```typescript
class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and number",
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // CLIENT | FREELANCER (not ADMIN or NONE)
}
```

**Response**:

```typescript
{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: KycStatus;
  profileImage: string | null;
  emailVerified: boolean;
  createdAt: string; // ISO 8601
}
```

**Errors**:

- `EMAIL_EXISTS` (409): Email already registered
- `INVALID_EMAIL` (400): Invalid email format
- `WEAK_PASSWORD` (400): Password doesn't meet requirements
- `INVALID_ROLE` (400): Role must be CLIENT or FREELANCER

---

### POST /api/auth/login

**Access**: Public  
**Purpose**: Authenticate user

**Request DTO**:

```typescript
class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

**Response**:

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    kycStatus: KycStatus;
    profileImage: string | null;
    emailVerified: boolean;
  }
  accessToken: string;
  refreshToken: string;
}
```

**Errors**:

- `INVALID_CREDENTIALS` (401): Email or password incorrect
- `ACCOUNT_SUSPENDED` (403): Account suspended
- `EMAIL_NOT_VERIFIED` (403): Email verification required

---

### POST /api/auth/logout

**Access**: Authenticated  
**Purpose**: Invalidate session

**Request**: None

**Response**:

```typescript
{
  success: boolean;
}
```

---

### GET /api/auth/me

**Access**: Authenticated  
**Purpose**: Get current user

**Request**: None (uses JWT)

**Response**:

```typescript
{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: KycStatus;
  profileImage: string | null;
  emailVerified: boolean;
  createdAt: string;
}
```

**Errors**:

- `UNAUTHORIZED` (401): Invalid or expired token

---

### POST /api/auth/verify-email

**Access**: Public  
**Purpose**: Verify email with token

**Request DTO**:

```typescript
class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  user: User;
}
```

**Errors**:

- `INVALID_TOKEN` (400): Token invalid or expired
- `ALREADY_VERIFIED` (400): Email already verified

---

### PATCH /api/auth/profile

**Access**: Authenticated  
**Purpose**: Update user profile

**Request DTO**:

```typescript
class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  profileImage?: string;
}
```

**Response**:

```typescript
User;
```

---

### POST /api/auth/wallet

**Access**: Authenticated
**Purpose**: Link non-custodial wallet from provider (Privy/Web3Auth)

**Request DTO**:

```typescript
class LinkWalletDto {
  @IsEnum(["PRIVY", "WEB3AUTH"])
  provider: "PRIVY" | "WEB3AUTH";

  @IsString()
  providerUserId: string;

  @IsString()
  address: string;

  @IsNumber()
  @IsOptional()
  chainId?: number;
}
```

**Response**:

```typescript
{
  id: string;
  address: string;
  provider: string;
  status: "ACTIVE";
}
```

**Errors**:

- `WALLET_ALREADY_LINKED` (400): User already has a wallet
- `ADDRESS_TAKEN` (409): Wallet address already associated with another user

---

## 4. Onboarding Module

### PATCH /api/onboarding/role

**Access**: Authenticated  
**Purpose**: Set user role (one-time only)

**Request DTO**:

```typescript
class SetRoleDto {
  @IsEnum(UserRole)
  @IsIn([UserRole.CLIENT, UserRole.FREELANCER])
  role: UserRole;
}
```

**Response**:

```typescript
User;
```

**Business Rules**:

- Can only be called once
- Cannot change role after KYC submission
- Role must be CLIENT or FREELANCER

**Errors**:

- `ROLE_ALREADY_SET` (400): Role already set
- `INVALID_ROLE` (400): Invalid role value
- `KYC_SUBMITTED` (400): Cannot change role after KYC

---

### POST /api/onboarding/kyc

**Access**: Authenticated  
**Purpose**: Submit KYC information

**Request DTO**:

```typescript
class SubmitKycDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  fullName: string;

  @IsDateString()
  dateOfBirth: string; // ISO 8601

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @IsString()
  @IsNotEmpty()
  idDocumentUrl: string; // S3 URL from upload endpoint

  @IsString()
  @IsOptional()
  proofOfAddressUrl?: string;
}
```

**Response**:

```typescript
User; // with kycStatus = PENDING
```

**Business Rules**:

- Role must be set first
- Can only submit once (unless rejected)
- Sets kycStatus to PENDING

**Errors**:

- `ROLE_NOT_SET` (400): Must set role first
- `KYC_ALREADY_VERIFIED` (400): KYC already verified
- `INVALID_DOCUMENT_URL` (400): Document URL not from our upload service

---

### GET /api/onboarding/status

**Access**: Authenticated  
**Purpose**: Get onboarding completion status

**Request**: None

**Response**:

```typescript
{
  roleSet: boolean;
  kycVerified: boolean;
  emailVerified: boolean;
}
```

---

## 5. Vault Module

### POST /api/vaults

**Access**: Authenticated (CLIENT only)  
**Purpose**: Create new vault  
**Idempotent**: Yes

**Request DTO**:

```typescript
class CreateVaultDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @IsEnum(["development", "design", "content_ai", "consulting"])
  type: string;

  @IsNumber()
  @Min(1)
  totalAmount: number; // USD

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  @ArrayMinSize(1)
  milestones: CreateMilestoneDto[];

  @IsUUID()
  @IsOptional()
  idempotencyKey?: string;
}

class CreateMilestoneDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  deliverableTypeId?: string;

  @IsEnum(["LINK", "FILE"])
  @IsOptional()
  deliverableMode?: "LINK" | "FILE";

  @IsBoolean()
  @IsOptional()
  auditEnabled?: boolean; // default true

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementItemDto)
  @IsOptional()
  requirementItemsJson?: RequirementItemDto[];
}

class RequirementItemDto {
  @IsUUID()
  reqId: string; // Generated client-side with crypto.randomUUID()

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  label: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean; // default true

  @IsString()
  @MaxLength(500)
  @IsOptional()
  acceptance?: string;
}
```

**Response**:

```typescript
{
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: VaultStatus; // DRAFT
  totalAmount: number;
  clientId: string;
  clientName: string;
  freelancerId: string | null;
  freelancerName: string | null;
  escrowRef: string | null; // Hidden from UI
  createdAt: string;
  milestones: Milestone[];
}
```

**Business Rules**:

- `totalAmount` must equal sum of milestone amounts
- At least 1 milestone required
- Each milestone amount > 0
- RequirementItem.reqId must be unique within milestone
- Vault starts in DRAFT status

**Errors**:

- `AMOUNT_MISMATCH` (400): Total doesn't match milestone sum
- `NO_MILESTONES` (400): At least 1 milestone required
- `DUPLICATE_REQUEST` (409): Idempotency key already used
- `UNAUTHORIZED` (403): Only clients can create vaults

---

### GET /api/vaults

**Access**: Authenticated  
**Purpose**: List user's vaults

**Query Params**:

```typescript
class ListVaultsQuery {
  @IsEnum(VaultStatus)
  @IsOptional()
  status?: VaultStatus;

  @IsString()
  @IsOptional()
  search?: string; // Search title/description

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number; // default 50

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number; // default 0
}
```

**Response**:

```typescript
{
  vaults: Vault[];
  total: number;
  limit: number;
  offset: number;
}
```

**Filtering**:

- Client: Returns vaults where `clientId === user.id`
- Freelancer: Returns vaults where `freelancerId === user.id`

---

### GET /api/vaults/:id

**Access**: Authenticated  
**Purpose**: Get vault details

**Response**:

```typescript
Vault; // with embedded milestones
```

**Errors**:

- `VAULT_NOT_FOUND` (404): Vault doesn't exist
- `UNAUTHORIZED` (403): User not authorized to view vault

---

### POST /api/vaults/:id/fund

**Access**: Authenticated (CLIENT only)  
**Purpose**: Fund vault (escrow lock)  
**Idempotent**: Yes

**Request DTO**:

```typescript
class FundVaultDto {
  @IsEnum(["card", "bank"])
  paymentMethod: "card" | "bank";

  @IsObject()
  paymentDetails: any; // Payment provider specific

  @IsUUID()
  idempotencyKey: string; // REQUIRED
}
```

**Response**:

```typescript
{
  vault: Vault;
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    chainId: number;
  };
  checkoutUrl?: string; // For fiat ramp deposits
}
```

**State Transition**:

- `AWAITING_FUNDING` → `FUNDED_UNASSIGNED` (if no freelancer assigned)
- `AWAITING_FUNDING` → `ACTIVE` (if freelancer already accepted/assigned)

**Business Rules**:

- Only vault client can fund
- Vault must be in DRAFT status
- Creates LOCK ledger entry
- Moves status to FUNDED (if unassigned) or ACTIVE (if assigned)

**Errors**:

- `PAYMENT_FAILED` (402): Payment processing failed
- `INVALID_STATE` (400): Vault not in DRAFT status
- `VALIDATION_ERROR` (400): `idempotencyKey` is missing or invalid
- `DUPLICATE_FUNDING` (409): Idempotency key already used
- `UNAUTHORIZED` (403): Only vault client can fund

---

### POST /api/vaults/:id/release-milestone

**Access**: Authenticated (CLIENT only)  
**Purpose**: Release milestone payment  
**Idempotent**: Yes

**Request DTO**:

```typescript
class ReleaseMilestoneDto {
  @IsUUID()
  milestoneId: string;

  @IsUUID()
  idempotencyKey: string; // REQUIRED
}
```

**Response**:

```typescript
{
  milestone: Milestone;
  ledgerEntry: LedgerEntry;
  transactionHash?: string; // If auto-released via Paymaster
  userOperation?: any; // For client-side signing if needed
}
```

**State Guards** (CRITICAL):

1. Milestone status must be `AWAITING_APPROVAL`
2. If `auditEnabled !== false`:
   - `milestone.verification` must exist
   - `milestone.auditStatus` is advisory only (does not block)
3. Caller must be vault client
4. If `milestone.auditStatus === 'FAIL'`:
   - Client must acknowledge warning via `acknowledgeAuditWarning: true`
   - Log warning: "Client approved milestone despite AI FAIL"

**State Transition**:

- Milestone: `AWAITING_APPROVAL` → `VERIFIED`
- Creates `RELEASE` ledger entry
- Updates freelancer wallet balance

**Errors**:

- `INVALID_STATE_TRANSITION` (400): Milestone not in AWAITING_APPROVAL
- `VERIFICATION_REQUIRED` (400): Verification missing when audit enabled
- `AUDIT_WARNING_NOT_ACKNOWLEDGED` (400): Client must acknowledge AI warning when auditStatus = FAIL
- `UNAUTHORIZED` (403): Caller is not vault client
- `DUPLICATE_RELEASE` (409): Idempotency key already used

---

### PATCH /api/vaults/:id/status

**Access**: Authenticated (CLIENT only)  
**Purpose**: Update vault status (cancel/pause)

**Request DTO**:

```typescript
class UpdateVaultStatusDto {
  @IsEnum([VaultStatus.CANCELLED, VaultStatus.PAUSED])
  status: VaultStatus;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}
```

**Response**:

```typescript
Vault;
```

**Business Rules**:

- Only CANCELLED and PAUSED allowed via this endpoint
- Cannot cancel vault with VERIFIED milestones (refund required)

**Errors**:

- `INVALID_STATUS` (400): Invalid status value
- `HAS_VERIFIED_MILESTONES` (400): Cannot cancel vault with verified milestones
- `UNAUTHORIZED` (403): Only vault client can update status

---

## 6. Milestone Module

### POST /api/milestones/:id/submit

**Access**: Authenticated (FREELANCER only)  
**Purpose**: Submit deliverable

**Request DTO**:

```typescript
class SubmitMilestoneDto {
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  @IsOptional()
  filesJson?: SubmissionFileDto[];

  @IsUrl()
  @IsOptional()
  url?: string; // If deliverableMode === "LINK"

  @IsUrl()
  @IsOptional()
  fileUrl?: string; // If deliverableMode === "FILE"
}

class SubmissionFileDto {
  @IsString()
  name: string;

  @IsString()
  size: string; // e.g., "2.4 MB"

  @IsString()
  @IsOptional()
  tag?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}
```

**Response**:

```typescript
Milestone; // with submission embedded
```

**State Guards**:

- Milestone status must be `PENDING`, `REVISION_REQUESTED`, or `REJECTED`
- Caller must be vault freelancer

**State Transition**:

- `PENDING` | `REVISION_REQUESTED` | `REJECTED` → `SUBMITTED`
- Triggers AI verification (async job)

**Errors**:

- `INVALID_STATE_TRANSITION` (400): Cannot submit from current status
- `UNAUTHORIZED` (403): Caller is not vault freelancer
- `MISSING_DELIVERABLE` (400): No files or URL provided

---

### POST /api/milestones/:id/verify

**Access**: System only (internal)  
**Purpose**: Run AI verification

**Request**: None (triggered by submit)

**Response**:

```typescript
Milestone; // with verification embedded
```

**State Transition**:

- `SUBMITTED` → `AWAITING_APPROVAL`
- Creates `verification` object with result

**AI Verification Logic**:

1. Run objective checks (file presence, format validation, etc.)
2. Set `result`: `PASS` | `FAIL` | `FLAGGED` | `HUMAN_REVIEW`
3. Generate `ruleResultsJson` with check details
4. Never automatically release funds

---

### POST /api/milestones/:id/review

**Access**: Authenticated (CLIENT only)  
**Purpose**: Client review decision

**Request DTO**:

```typescript
class ReviewMilestoneDto {
  @IsEnum(MilestoneReviewOutcome)
  outcome: MilestoneReviewOutcome; // APPROVE | REQUEST_CHANGES | REJECT

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reasonCodes?: string[]; // From APPROVAL_REJECTION_CODES

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  acknowledgeAuditWarning?: boolean; // Required if auditStatus = FAIL and outcome = APPROVE
}
```

**Response**:

```typescript
Milestone; // with status VERIFIED, payoutStatus: null | "NONE"
```

**State Guards**:

- Milestone status must be `AWAITING_APPROVAL`
- Caller must be vault client
- If outcome = APPROVE and auditStatus = FAIL:
  - `acknowledgeAuditWarning` must be true
  - Log warning: "Client approved milestone {id} despite AI FAIL"

**Outcome → Status Mapping** (CRITICAL):

- `APPROVE` → `VERIFIED` (but does NOT release funds)
- `REQUEST_CHANGES` → `REVISION_REQUESTED`
- `REJECT` → `REJECTED`

**State Transition**:

- `AWAITING_APPROVAL` → `VERIFIED` | `REVISION_REQUESTED` | `REJECTED`

**Errors**:

- `INVALID_STATE_TRANSITION` (400): Milestone not in AWAITING_APPROVAL
- `AUDIT_WARNING_NOT_ACKNOWLEDGED` (400): Must acknowledge AI warning when approving despite FAIL
- `INVALID_REVIEW_OUTCOME` (400): Invalid outcome value
- `UNAUTHORIZED` (403): Caller is not vault client

---

### GET /api/milestones/:id/evidence

**Access**: Authenticated  
**Purpose**: Get evidence for milestone

**Response**:

```typescript
Evidence[]
```

**Evidence Types**:

- `SUBMISSION_CREATED`
- `VERIFICATION_COMPLETED`
- `REVIEW_SUBMITTED`
- `MESSAGE_SENT`
- `MESSAGE_EDITED`
- `FILE_COMMENT`
- `DISPUTE_OPENED`
- `DISPUTE_EVIDENCE`
- `DISPUTE_DECISION`

---

## 7. Invite Module

### POST /api/invites

**Access**: Authenticated (CLIENT only)  
**Purpose**: Create invitation

**Request DTO**:

```typescript
class CreateInviteDto {
  @IsUUID()
  vaultId: string;

  @IsEmail()
  email: string; // Freelancer email

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  expiresInDays?: number; // default 7
}
```

**Response**:

```typescript
{
  id: string;
  token: string; // Unique invite token
  vaultId: string;
  email: string;
  status: InviteStatus; // PENDING
  invitedAt: string;
  expiresAt: string;
}
```

**Business Rules**:

- Only vault client can invite
- Vault must not already have freelancer assigned
- Token is UUID v4

**Errors**:

- `VAULT_NOT_FOUND` (404): Vault doesn't exist
- `UNAUTHORIZED` (403): Caller is not vault client
- `ALREADY_ASSIGNED` (400): Vault already has freelancer

---

### GET /api/invites/token/:token

**Access**: Public  
**Purpose**: Get invite by token

**Response**:

```typescript
{
  invite: Invite;
  vault: {
    id: string;
    title: string;
    clientName: string;
    totalAmount: number;
    milestoneCount: number;
    status: VaultStatus;
    isFunded: boolean;
  }
}
```

**Errors**:

- `INVITE_NOT_FOUND` (404): Invalid token
- `INVITE_EXPIRED` (410): Invitation expired

---

### POST /api/invites/:token/respond

**Access**: Authenticated (FREELANCER only)  
**Purpose**: Accept/decline invitation

**Request DTO**:

```typescript
class RespondInviteDto {
  @IsEnum(["accept", "decline"])
  action: "accept" | "decline";

  @IsString()
  @MaxLength(500)
  @IsOptional()
  declineReason?: string; // Required if action === "decline"
}
```

**Response**:

```typescript
{
  invite: Invite;
  vault?: Vault; // Included if accepted
}
```

**State Transition** (if accepted):

- Invite: `PENDING` → `ACCEPTED`
- Vault: `INVITED` | `FUNDED_ASSIGNED` → `ACTIVE`

**Business Rules**:

- User email must match invite email
- Invite must not be expired
- Invite must be PENDING

**Errors**:

- `INVITE_EXPIRED` (410): Invitation expired
- `INVITE_ALREADY_RESPONDED` (400): Already accepted/declined
- `UNAUTHORIZED` (403): User email doesn't match invite
- `EMAIL_MISMATCH` (403): Logged in email doesn't match invitation

---

## 8. Wallet Module

### GET /api/wallet/balance

**Access**: Authenticated  
**Purpose**: Get wallet balance

**Response**:

```typescript
{
  available: number; // USD available for withdrawal
  pending: number; // USD pending confirmation
  total: number; // available + pending
}
```

**Calculation**:

- Available: Sum of CONFIRMED RELEASE entries - Sum of CONFIRMED WITHDRAW entries
- Pending: Sum of PENDING RELEASE/WITHDRAW entries

---

### GET /api/wallet/transactions

**Access**: Authenticated  
**Purpose**: Get transaction history

**Query Params**:

```typescript
class ListTransactionsQuery {
  @IsEnum(LedgerEntryType)
  @IsOptional()
  type?: LedgerEntryType;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number; // default 50

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number; // default 0
}
```

**Response**:

```typescript
{
  transactions: LedgerEntry[];
  total: number;
  limit: number;
  offset: number;
}
```

---

### POST /api/wallet/withdraw

**Access**: Authenticated (FREELANCER only)  
**Purpose**: Withdraw funds  
**Idempotent**: Yes

**Request DTO**:

```typescript
class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number; // USD

  @IsObject()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails: BankDetailsDto;

  @IsUUID()
  idempotencyKey: string; // REQUIRED
}

class BankDetailsDto {
  @IsString()
  @MinLength(8)
  @MaxLength(17)
  accountNumber: string;

  @IsString()
  @MinLength(9)
  @MaxLength(9)
  routingNumber: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  accountName: string;
}
```

**Response**:

```typescript
{
  id: string;
  createdAt: string;
  type: "WITHDRAW";
  amount: number; // negative
  currency: "USD";
  status: TransactionStatus; // PENDING
}
```

**Reconciliation Model**:

1. Initiation: Create WITHDRAW ledger entry with status PENDING
2. Confirmation (async): Update status to CONFIRMED after ramp webhook

**Business Rules**:

- Amount must not exceed available balance
- KYC must be VERIFIED (configurable)
- Creates WITHDRAW ledger entry

**Errors**:

- `INSUFFICIENT_FUNDS` (400): Amount exceeds available balance
- `INVALID_AMOUNT` (400): Amount <= 0
- `VALIDATION_ERROR` (400): `idempotencyKey` is missing or invalid
- `DUPLICATE_WITHDRAWAL` (409): Idempotency key already used
- `KYC_REQUIRED` (403): KYC verification required

---

## 9. Ledger Module

### GET /api/ledger

**Access**: Authenticated  
**Purpose**: Get ledger entries

**Query Params**:

```typescript
class ListLedgerQuery {
  @IsUUID()
  @IsOptional()
  vaultId?: string;

  @IsEnum(LedgerEntryType)
  @IsOptional()
  type?: LedgerEntryType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number; // default 50

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number; // default 0
}
```

**Response**:

```typescript
{
  entries: LedgerEntry[];
  total: number;
  limit: number;
  offset: number;
}
```

**Filtering**:

- Client: DEPOSIT, LOCK, REFUND entries
- Freelancer: RELEASE, WITHDRAW entries

---

## 10. Dispute Module

### POST /api/disputes

**Access**: Authenticated  
**Purpose**: Create dispute  
**Idempotent**: No (disputes are unique by nature)

**Request DTO**:

```typescript
class CreateDisputeDto {
  @IsUUID()
  vaultId: string;

  @IsUUID()
  milestoneId: string;

  @IsUUID()
  @IsOptional()
  requirementRef?: string; // reqId if requirement-specific

  @IsEnum(DisputeType)
  disputeType: DisputeType;

  @IsString()
  reasonCode: string; // From DISPUTE_REASON_CODES

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;
}
```

**Response**:

```typescript
{
  id: string;
  vaultId: string;
  milestoneId: string;
  requirementRef: string | null;
  disputeType: DisputeType;
  reasonCode: string;
  openedByUserId: string;
  openedByRole: UserRole;
  status: DisputeStatus; // OPEN
  description: string;
  createdAt: string;
  events: DisputeEvent[];
}
```

**State Transition**:

- Vault: `ACTIVE` → `DISPUTED`
- Dispute: `OPEN`

**Validation**:

- `disputeType` must be valid DisputeType
- `reasonCode` must match dispute eligibility rules
- If `requiresRequirementRef`, `requirementRef` must be provided

**Errors**:

- `INVALID_DISPUTE_TYPE` (400): Invalid dispute type
- `INELIGIBLE_DISPUTE` (400): Dispute not allowed for current milestone state
- `MISSING_REQUIREMENT_REF` (400): requirementRef required but not provided
- `UNAUTHORIZED` (403): User not involved in vault

---

### GET /api/disputes

**Access**: Authenticated  
**Purpose**: List disputes

**Query Params**:

```typescript
class ListDisputesQuery {
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @IsUUID()
  @IsOptional()
  vaultId?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number; // default 50

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number; // default 0
}
```

**Response**:

```typescript
{
  disputes: Dispute[];
  total: number;
  limit: number;
  offset: number;
}
```

**Filtering**:

- Returns disputes where user is involved (client or freelancer of vault)

---

### GET /api/disputes/:id

**Access**: Authenticated  
**Purpose**: Get dispute details

**Response**:

```typescript
Dispute; // with events embedded
```

**Errors**:

- `DISPUTE_NOT_FOUND` (404): Dispute doesn't exist
- `UNAUTHORIZED` (403): User not authorized to view dispute

---

## 11. Evidence Module

### GET /api/evidence

**Access**: Authenticated  
**Purpose**: List evidence events / messages for a vault or milestone

**Query Params**:

```typescript
class ListEvidenceQuery {
  @IsUUID()
  vaultId: string;

  @IsUUID()
  @IsOptional()
  milestoneId?: string;

  @IsEnum(EvidenceType)
  @IsOptional()
  type?: EvidenceType;
}
```

**Response**:

```typescript
Evidence[]
```

**Business Rules**:

- Returns only events for vaults the user is a party to.
- If `milestoneId` is provided, filters for that milestone specifically.

---

### POST /api/evidence

**Access**: Authenticated  
**Purpose**: Post a new message or evidence event (Append-only)

**Request DTO**:

```typescript
class CreateEvidenceDto {
  @IsUUID()
  vaultId: string;

  @IsUUID()
  @IsOptional()
  milestoneId?: string;

  @IsEnum(EvidenceType)
  type: EvidenceType; // Usually MESSAGE_SENT for general chat

  @IsObject()
  payload: {
    content: string;
    filesJson?: string;
    supersedesEventId?: string; // If this appends an "edit"
  };
}
```

**Response**:

```typescript
Evidence;
```

**Business Rules**:

- Create an immutable record in the Evidence log.
- Generate `contentHash` of the payload.
- If `supersedesEventId` is provided, the referenced event is marked as superseded in the view layer.
- Trigger notifications to other parties in the vault.

---

## 12. Upload Module

### POST /api/uploads/presigned-url

**Access**: Authenticated  
**Purpose**: Get presigned URL for file upload

**Request DTO**:

```typescript
class GetPresignedUrlDto {
  @IsString()
  fileName: string;

  @IsString()
  fileType: string; // MIME type

  @IsInt()
  @Min(1)
  @Max(104857600) // 100MB
  fileSize: number; // bytes

  @IsEnum(["kyc", "deliverable", "evidence"])
  purpose: "kyc" | "deliverable" | "evidence";
}
```

**Response**:

```typescript
{
  uploadUrl: string; // Presigned S3 URL
  fileUrl: string; // Final URL after upload
  expiresIn: number; // seconds (300)
}
```

**Business Rules**:

- Max file size: 100MB
- Allowed types: PDF, ZIP, PNG, JPG, CSV, XLSX, etc.
- Files are virus-scanned after upload (async)

**Errors**:

- `FILE_TOO_LARGE` (400): File exceeds max size
- `INVALID_FILE_TYPE` (400): File type not allowed

---

## 13. Error Codes

All errors follow this structure:

```typescript
{
  code: string; // Error code (e.g., "VAULT_NOT_FOUND")
  message: string; // Human-readable message
  details?: any; // Additional context
  statusCode: number; // HTTP status code
}
```

### Common Error Codes

**Authentication (401)**:

- `UNAUTHORIZED`: Invalid or expired token
- `INVALID_CREDENTIALS`: Email or password incorrect

**Authorization (403)**:

- `FORBIDDEN`: User not authorized for this action
- `ACCOUNT_SUSPENDED`: Account suspended
- `EMAIL_NOT_VERIFIED`: Email verification required
- `KYC_REQUIRED`: KYC verification required

**Validation (400)**:

- `VALIDATION_ERROR`: Request validation failed
- `INVALID_STATE_TRANSITION`: Invalid state transition
- `AMOUNT_MISMATCH`: Total doesn't match milestone sum
- `MISSING_DELIVERABLE`: No files or URL provided

**Not Found (404)**:

- `VAULT_NOT_FOUND`: Vault doesn't exist
- `MILESTONE_NOT_FOUND`: Milestone doesn't exist
- `DISPUTE_NOT_FOUND`: Dispute doesn't exist
- `INVITE_NOT_FOUND`: Invite doesn't exist

**Conflict (409)**:

- `EMAIL_EXISTS`: Email already registered
- `DUPLICATE_REQUEST`: Idempotency key already used
- `ALREADY_ASSIGNED`: Vault already has freelancer

**Payment (402)**:

- `PAYMENT_FAILED`: Payment processing failed
- `INSUFFICIENT_FUNDS`: Amount exceeds available balance

**Gone (410)**:

- `INVITE_EXPIRED`: Invitation expired

---

## 14. Idempotency

### Money Operations (REQUIRED)

All money-moving operations REQUIRE an `idempotencyKey` field in the JSON request body. The key MUST be a valid UUID v4.

If the key is missing, the server MUST return:

- **Status**: `400 Bad Request`
- **Body**: `{ "code": "VALIDATION_ERROR", "message": "idempotencyKey is required for money operations", "field": "idempotencyKey" }`

**Endpoints requiring idempotency**:

- `POST /api/vaults/:id/fund`
- `POST /api/vaults/:id/release-milestone`
- `POST /api/wallet/withdraw`

### Idempotency Record

```typescript
{
  id: string;
  key: string; // UUID from client
  userId: string;
  endpoint: string; // e.g., "/api/vaults/:id/release-milestone"
  requestHash: string; // SHA-256 of request body
  responseBody: any; // Stored response
  statusCode: number;
  createdAt: string;
  expiresAt: string; // 24 hours
}
```

### Behavior

1. Check if `idempotencyKey` exists in `IdempotencyRecord`
2. If exists:
   - If `requestHash` matches: Return stored response (replay)
   - If `requestHash` differs: Return `DUPLICATE_REQUEST` error
3. If not exists:
   - Process request
   - Store response in `IdempotencyRecord`
   - Return response

### Expiration

- Idempotency records expire after 24 hours
- Cleanup job runs daily to remove expired records

---

## 15. Wallet & Provider Integration

### Non-Custodial Workflow

1. **Frontend**: User authenticates with Privy/Web3Auth.
2. **Frontend**: Retrieves `accessToken`, `providerUserId`, and `address`.
3. **Frontend**: Calls `POST /api/auth/wallet` to link address to Dayle account.
4. **Backend**: Verifies provider token (if applicable) and stores wallet metadata.

### Money Actions (AA)

- **Initiation**: Backend returns `transactionRequest` or `userOperation`.
- **Execution**: Frontend signs/submits via Provider SDK.
- **Confirmation**: Backend listens for Provider Webhooks or Chain Events.

### Webhook Verification

- All incoming webhooks from Privy/Web3Auth MUST be signature-verified using the provider's public key or shared secret.
- Webhook events are stored in `WebhookEvent` table before processing for replay protection.

**End of Backend API Contract**
