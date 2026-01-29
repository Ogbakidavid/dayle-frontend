# Backend DTOs and Controllers - Part 2

## Auth Module DTOs

### src/auth/dto/signup.dto.ts

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from "class-validator";
import { UserRole } from "../../domain/enums";

export class SignupDto {
  @IsEmail()
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
  role?: UserRole;
}
```

### src/auth/dto/login.dto.ts

```typescript
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

---

## Auth Controller

### src/auth/auth.controller.ts

```typescript
import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../common/decorators/public.decorator";
import { User } from "../common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  async logout(@User("id") userId: string) {
    return this.authService.logout(userId);
  }

  @Get("me")
  async getCurrentUser(@User("id") userId: string) {
    return this.authService.getCurrentUser(userId);
  }
}
```

---

## Vault Module DTOs

### src/vaults/dto/create-vault.dto.ts

```typescript
import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RequirementItemDto {
  @IsUUID()
  reqId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  label: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  acceptance?: string;
}

export class CreateMilestoneDto {
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
  auditEnabled?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementItemDto)
  @IsOptional()
  requirementItemsJson?: RequirementItemDto[];
}

export class CreateVaultDto {
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
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  @ArrayMinSize(1)
  milestones: CreateMilestoneDto[];

  @IsUUID()
  @IsOptional()
  idempotencyKey?: string;
}
```

### src/vaults/dto/release-milestone.dto.ts

```typescript
import { IsUUID } from "class-validator";

export class ReleaseMilestoneDto {
  @IsUUID()
  milestoneId: string;

  @IsUUID()
  idempotencyKey: string;
}
```

---

## Vault Controller

### src/vaults/vaults.controller.ts

```typescript
import { Controller, Post, Get, Param, Body, Query } from "@nestjs/common";
import { VaultsService } from "./vaults.service";
import { CreateVaultDto } from "./dto/create-vault.dto";
import { ReleaseMilestoneDto } from "./dto/release-milestone.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { User } from "../common/decorators/user.decorator";
import { UserRole } from "../domain/enums";

@Controller("vaults")
export class VaultsController {
  constructor(private vaultsService: VaultsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  async create(@Body() dto: CreateVaultDto, @User("id") userId: string) {
    return this.vaultsService.create(dto, userId);
  }

  @Get()
  async list(@User("id") userId: string, @User("role") role: UserRole) {
    return this.vaultsService.list(userId, role);
  }

  @Get(":id")
  async getById(@Param("id") id: string, @User("id") userId: string) {
    return this.vaultsService.getById(id, userId);
  }

  @Post(":id/release-milestone")
  @Roles(UserRole.CLIENT)
  async releaseMilestone(
    @Param("id") vaultId: string,
    @Body() dto: ReleaseMilestoneDto,
    @User("id") userId: string,
  ) {
    return this.vaultsService.releaseMilestone(vaultId, dto, userId);
  }
}
```

---

## Vault Service

### src/vaults/vaults.service.ts

```typescript
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVaultDto } from "./dto/create-vault.dto";
import { ReleaseMilestoneDto } from "./dto/release-milestone.dto";
import {
  VaultStatus,
  MilestoneStatus,
  UserRole,
  LedgerEntryType,
  TransactionStatus,
} from "../domain/enums";
import { StateMachine } from "../domain/state-machine";

@Injectable()
export class VaultsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVaultDto, userId: string) {
    // Validate total amount matches milestone sum
    const milestoneSum = dto.milestones.reduce((sum, m) => sum + m.amount, 0);
    if (Math.abs(dto.totalAmount - milestoneSum) > 0.01) {
      throw new BadRequestException({
        code: "AMOUNT_MISMATCH",
        message: `Total amount (${dto.totalAmount}) must equal sum of milestone amounts (${milestoneSum})`,
      });
    }

    // Check idempotency
    if (dto.idempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: { key: dto.idempotencyKey },
      });

      if (existing) {
        return existing.responseBody;
      }
    }

    // Create vault with milestones
    const vault = await this.prisma.vault.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        totalAmount: dto.totalAmount,
        clientId: userId,
        status: VaultStatus.DRAFT,
        milestones: {
          create: dto.milestones.map((m) => ({
            title: m.title,
            amount: m.amount,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            deliverableTypeId: m.deliverableTypeId,
            deliverableMode: m.deliverableMode,
            auditEnabled: m.auditEnabled ?? true,
            requirementItemsJson: m.requirementItemsJson || [],
            status: MilestoneStatus.PENDING,
          })),
        },
      },
      include: {
        milestones: true,
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Store idempotency record
    if (dto.idempotencyKey) {
      await this.prisma.idempotencyRecord.create({
        data: {
          key: dto.idempotencyKey,
          userId,
          endpoint: "/api/vaults",
          requestHash: this.hashRequest(dto),
          responseBody: vault,
          statusCode: 201,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    }

    return this.formatVault(vault);
  }

  async list(userId: string, role: UserRole) {
    const where =
      role === UserRole.CLIENT
        ? { clientId: userId }
        : { freelancerId: userId };

    const vaults = await this.prisma.vault.findMany({
      where,
      include: {
        milestones: true,
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      vaults: vaults.map((v) => this.formatVault(v)),
      total: vaults.length,
    };
  }

  async getById(id: string, userId: string) {
    const vault = await this.prisma.vault.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            submission: true,
            verification: true,
            review: true,
          },
        },
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!vault) {
      throw new NotFoundException({
        code: "VAULT_NOT_FOUND",
        message: "Vault not found",
      });
    }

    // Check authorization
    if (vault.clientId !== userId && vault.freelancerId !== userId) {
      throw new ForbiddenException({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this vault",
      });
    }

    return this.formatVault(vault);
  }

  async releaseMilestone(
    vaultId: string,
    dto: ReleaseMilestoneDto,
    userId: string,
  ) {
    // Check idempotency
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key: dto.idempotencyKey },
    });

    if (existing) {
      return existing.responseBody;
    }

    // Get vault and milestone
    const vault = await this.prisma.vault.findUnique({
      where: { id: vaultId },
      include: {
        milestones: {
          where: { id: dto.milestoneId },
          include: { verification: true },
        },
      },
    });

    if (!vault) {
      throw new NotFoundException({
        code: "VAULT_NOT_FOUND",
        message: "Vault not found",
      });
    }

    if (vault.clientId !== userId) {
      throw new ForbiddenException({
        code: "UNAUTHORIZED",
        message: "Only vault client can release milestones",
      });
    }

    const milestone = vault.milestones[0];
    if (!milestone) {
      throw new NotFoundException({
        code: "MILESTONE_NOT_FOUND",
        message: "Milestone not found",
      });
    }

    // State machine validation
    const canRelease = StateMachine.canReleaseMilestone(
      milestone.status as MilestoneStatus,
      milestone.auditEnabled,
      milestone.verification,
    );

    if (!canRelease.allowed) {
      throw new BadRequestException({
        code: "INVALID_STATE_TRANSITION",
        message: canRelease.reason,
      });
    }

    // Execute release in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update milestone status
      const updatedMilestone = await tx.milestone.update({
        where: { id: dto.milestoneId },
        data: { status: MilestoneStatus.VERIFIED },
        include: { verification: true, review: true, submission: true },
      });

      // Create RELEASE ledger entry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          userId: vault.freelancerId!,
          vaultId: vault.id,
          milestoneId: milestone.id,
          type: LedgerEntryType.RELEASE,
          amount: milestone.amount,
          currency: "USD",
          status: TransactionStatus.CONFIRMED,
          description: `Release for milestone: ${milestone.title}`,
          completedAt: new Date(),
        },
      });

      return { milestone: updatedMilestone, ledgerEntry };
    });

    // Store idempotency record
    await this.prisma.idempotencyRecord.create({
      data: {
        key: dto.idempotencyKey,
        userId,
        endpoint: `/api/vaults/${vaultId}/release-milestone`,
        requestHash: this.hashRequest(dto),
        responseBody: result,
        statusCode: 200,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return result;
  }

  private formatVault(vault: any) {
    return {
      id: vault.id,
      title: vault.title,
      description: vault.description,
      type: vault.type,
      status: vault.status,
      totalAmount: vault.totalAmount,
      clientId: vault.clientId,
      clientName: vault.client?.name,
      freelancerId: vault.freelancerId,
      freelancerName: vault.freelancer?.name,
      escrowRef: vault.escrowRef, // Hidden from UI
      createdAt: vault.createdAt.toISOString(),
      milestones:
        vault.milestones?.map((m: any) => this.formatMilestone(m)) || [],
    };
  }

  private formatMilestone(milestone: any) {
    return {
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      amount: milestone.amount,
      dueDate: milestone.dueDate?.toISOString(),
      deliverableTypeId: milestone.deliverableTypeId,
      deliverableMode: milestone.deliverableMode,
      auditEnabled: milestone.auditEnabled,
      requirementItemsJson: milestone.requirementItemsJson,
      submission: milestone.submission,
      verification: milestone.verification,
      review: milestone.review,
    };
  }

  private hashRequest(data: any): string {
    const crypto = require("crypto");
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }
}
```

---

## Milestone Module DTOs

### src/milestones/dto/submit-milestone.dto.ts

```typescript
import {
  IsString,
  IsArray,
  IsUrl,
  IsOptional,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SubmissionFileDto {
  @IsString()
  name: string;

  @IsString()
  size: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}

export class SubmitMilestoneDto {
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
  url?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;
}
```

### src/milestones/dto/review-milestone.dto.ts

```typescript
import {
  IsEnum,
  IsArray,
  IsString,
  IsOptional,
  MaxLength,
} from "class-validator";
import { MilestoneReviewOutcome } from "../../domain/enums";

export class ReviewMilestoneDto {
  @IsEnum(MilestoneReviewOutcome)
  outcome: MilestoneReviewOutcome;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reasonCodes?: string[];

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}
```

---

## Milestone Controller

### src/milestones/milestones.controller.ts

```typescript
import { Controller, Post, Param, Body } from "@nestjs/common";
import { MilestonesService } from "./milestones.service";
import { SubmitMilestoneDto } from "./dto/submit-milestone.dto";
import { ReviewMilestoneDto } from "./dto/review-milestone.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { User } from "../common/decorators/user.decorator";
import { UserRole } from "../domain/enums";

@Controller("milestones")
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Post(":id/submit")
  @Roles(UserRole.FREELANCER)
  async submit(
    @Param("id") id: string,
    @Body() dto: SubmitMilestoneDto,
    @User("id") userId: string,
  ) {
    return this.milestonesService.submit(id, dto, userId);
  }

  @Post(":id/review")
  @Roles(UserRole.CLIENT)
  async review(
    @Param("id") id: string,
    @Body() dto: ReviewMilestoneDto,
    @User("id") userId: string,
  ) {
    return this.milestonesService.review(id, dto, userId);
  }
}
```

---

## Milestone Service

### src/milestones/milestones.service.ts

```typescript
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubmitMilestoneDto } from "./dto/submit-milestone.dto";
import { ReviewMilestoneDto } from "./dto/review-milestone.dto";
import { MilestoneStatus } from "../domain/enums";
import { StateMachine } from "../domain/state-machine";
import { VerificationService } from "../verification/verification.service";

@Injectable()
export class MilestonesService {
  constructor(
    private prisma: PrismaService,
    private verificationService: VerificationService,
  ) {}

  async submit(id: string, dto: SubmitMilestoneDto, userId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { vault: true },
    });

    if (!milestone) {
      throw new NotFoundException({
        code: "MILESTONE_NOT_FOUND",
        message: "Milestone not found",
      });
    }

    if (milestone.vault.freelancerId !== userId) {
      throw new ForbiddenException({
        code: "UNAUTHORIZED",
        message: "Only vault freelancer can submit milestones",
      });
    }

    // State machine validation
    const canSubmit = StateMachine.canSubmitMilestone(
      milestone.status as MilestoneStatus,
    );
    StateMachine.assertTransition(
      canSubmit,
      `Cannot submit milestone from status ${milestone.status}`,
    );

    // Create submission
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id },
      data: {
        status: MilestoneStatus.SUBMITTED,
        submission: {
          create: {
            submittedBy: userId,
            notes: dto.notes,
            filesJson: dto.filesJson || [],
            url: dto.url,
            fileUrl: dto.fileUrl,
          },
        },
      },
      include: { submission: true },
    });

    // Trigger AI verification (async)
    if (milestone.auditEnabled !== false) {
      this.verificationService.verify(id).catch((err) => {
        console.error("Verification failed:", err);
      });
    }

    return updatedMilestone;
  }

  async review(id: string, dto: ReviewMilestoneDto, userId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { vault: true },
    });

    if (!milestone) {
      throw new NotFoundException({
        code: "MILESTONE_NOT_FOUND",
        message: "Milestone not found",
      });
    }

    if (milestone.vault.clientId !== userId) {
      throw new ForbiddenException({
        code: "UNAUTHORIZED",
        message: "Only vault client can review milestones",
      });
    }

    // State machine validation
    const canReview = StateMachine.canReviewMilestone(
      milestone.status as MilestoneStatus,
    );
    StateMachine.assertTransition(
      canReview,
      `Cannot review milestone from status ${milestone.status}`,
    );

    // Map outcome to status
    const newStatus = StateMachine.mapOutcomeToStatus(dto.outcome);

    // Update milestone
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id },
      data: {
        status: newStatus,
        review: {
          create: {
            reviewerId: userId,
            outcome: dto.outcome,
            reasonCodes: dto.reasonCodes || [],
            notes: dto.notes,
          },
        },
      },
      include: { review: true, submission: true, verification: true },
    });

    return updatedMilestone;
  }
}
```

---

## Wallet Module DTOs

### src/wallet/dto/withdraw.dto.ts

```typescript
import {
  IsNumber,
  IsObject,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BankDetailsDto } from "./bank-details.dto";

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails: BankDetailsDto;

  @IsUUID()
  idempotencyKey: string;
}
```

### src/wallet/dto/bank-details.dto.ts

```typescript
import { IsString, MinLength, MaxLength } from "class-validator";

export class BankDetailsDto {
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

---

**Continue to Part 3 for Sample Flows...**
