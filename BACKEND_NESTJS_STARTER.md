# Dayle Backend - NestJS Starter Skeleton

This directory contains the complete NestJS backend implementation matching the frontend contract.

## Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── idempotency.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── domain/
│   │   ├── enums.ts
│   │   └── state-machine.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── signup.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── verify-email.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── onboarding/
│   │   ├── onboarding.module.ts
│   │   ├── onboarding.controller.ts
│   │   ├── onboarding.service.ts
│   │   └── dto/
│   │       ├── set-role.dto.ts
│   │       └── submit-kyc.dto.ts
│   ├── vaults/
│   │   ├── vaults.module.ts
│   │   ├── vaults.controller.ts
│   │   ├── vaults.service.ts
│   │   └── dto/
│   │       ├── create-vault.dto.ts
│   │       ├── fund-vault.dto.ts
│   │       └── release-milestone.dto.ts
│   ├── milestones/
│   │   ├── milestones.module.ts
│   │   ├── milestones.controller.ts
│   │   ├── milestones.service.ts
│   │   └── dto/
│   │       ├── submit-milestone.dto.ts
│   │       └── review-milestone.dto.ts
│   ├── invites/
│   │   ├── invites.module.ts
│   │   ├── invites.controller.ts
│   │   ├── invites.service.ts
│   │   └── dto/
│   │       ├── create-invite.dto.ts
│   │       └── respond-invite.dto.ts
│   ├── wallet/
│   │   ├── wallet.module.ts
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts
│   │   └── dto/
│   │       └── withdraw.dto.ts
│   ├── ledger/
│   │   ├── ledger.module.ts
│   │   ├── ledger.controller.ts
│   │   └── ledger.service.ts
│   ├── disputes/
│   │   ├── disputes.module.ts
│   │   ├── disputes.controller.ts
│   │   ├── disputes.service.ts
│   │   └── dto/
│   │       └── create-dispute.dto.ts
│   ├── uploads/
│   │   ├── uploads.module.ts
│   │   ├── uploads.controller.ts
│   │   ├── uploads.service.ts
│   │   └── dto/
│   │       └── get-presigned-url.dto.ts
│   └── verification/
│       ├── verification.module.ts
│       └── verification.service.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
└── tsconfig.json
```

## Installation

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dayle"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
AWS_S3_BUCKET="dayle-uploads"
AWS_REGION="us-east-1"
RAMP_API_KEY="your-ramp-key"
```

---

## Code Files

### src/main.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT || 4000);
  console.log(
    `🚀 Backend running on http://localhost:${process.env.PORT || 4000}`,
  );
}

bootstrap();
```

---

### src/app.module.ts

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { VaultsModule } from "./vaults/vaults.module";
import { MilestonesModule } from "./milestones/milestones.module";
import { InvitesModule } from "./invites/invites.module";
import { WalletModule } from "./wallet/wallet.module";
import { LedgerModule } from "./ledger/ledger.module";
import { DisputesModule } from "./disputes/disputes.module";
import { UploadsModule } from "./uploads/uploads.module";
import { VerificationModule } from "./verification/verification.module";
import { AuthGuard } from "./common/guards/auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OnboardingModule,
    VaultsModule,
    MilestonesModule,
    InvitesModule,
    WalletModule,
    LedgerModule,
    DisputesModule,
    UploadsModule,
    VerificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

---

### src/prisma/prisma.service.ts

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

### src/prisma/prisma.module.ts

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### src/domain/enums.ts

```typescript
// Canonical enums matching lib/domain/enums.js

export enum VaultStatus {
  DRAFT = "DRAFT",
  AWAITING_FUNDING = "AWAITING_FUNDING",
  INVITED = "INVITED",
  FUNDED_UNASSIGNED = "FUNDED_UNASSIGNED",
  FUNDED_ASSIGNED = "FUNDED_ASSIGNED",
  ACTIVE = "ACTIVE",
  IN_REVIEW = "IN_REVIEW",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED",
}

export enum MilestoneStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  VERIFIED = "VERIFIED",
  REVISION_REQUESTED = "REVISION_REQUESTED",
  REJECTED = "REJECTED",
  DISPUTED = "DISPUTED",
}

export enum VerificationResult {
  PASS = "PASS",
  FAIL = "FAIL",
  FLAGGED = "FLAGGED",
  HUMAN_REVIEW = "HUMAN_REVIEW",
}

export enum MilestoneReviewOutcome {
  APPROVE = "APPROVE",
  REQUEST_CHANGES = "REQUEST_CHANGES",
  REJECT = "REJECT",
}

export enum DisputeStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  NEEDS_INFO = "NEEDS_INFO",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
}

export enum UserRole {
  NONE = "NONE",
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
  ADMIN = "ADMIN",
}

export enum KycStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

export enum LedgerEntryType {
  DEPOSIT = "DEPOSIT",
  LOCK = "LOCK",
  RELEASE = "RELEASE",
  REFUND = "REFUND",
  WITHDRAW = "WITHDRAW",
  FEE = "FEE",
}

export enum DisputeType {
  VERIFICATION_ERROR = "VERIFICATION_ERROR",
  REQUIREMENT_MISMATCH = "REQUIREMENT_MISMATCH",
  SCOPE_CHANGE = "SCOPE_CHANGE",
  BAD_FAITH = "BAD_FAITH",
  FRAUD = "FRAUD",
  PROCESS_BREACH = "PROCESS_BREACH",
  SECURITY = "SECURITY",
}
```

---

### src/domain/state-machine.ts

```typescript
import { BadRequestException } from "@nestjs/common";
import {
  MilestoneStatus,
  MilestoneReviewOutcome,
  VerificationResult,
} from "./enums";

export class StateMachine {
  /**
   * Validate milestone submit transition
   */
  static canSubmitMilestone(currentStatus: MilestoneStatus): boolean {
    const allowedStatuses = [
      MilestoneStatus.PENDING,
      MilestoneStatus.REVISION_REQUESTED,
      MilestoneStatus.REJECTED,
    ];
    return allowedStatuses.includes(currentStatus);
  }

  /**
   * Validate milestone verify transition
   */
  static canVerifyMilestone(currentStatus: MilestoneStatus): boolean {
    return currentStatus === MilestoneStatus.SUBMITTED;
  }

  /**
   * Validate milestone review transition
   */
  static canReviewMilestone(currentStatus: MilestoneStatus): boolean {
    return currentStatus === MilestoneStatus.AWAITING_APPROVAL;
  }

  /**
   * Validate milestone release transition
   * CRITICAL: This enforces the release safety conditions
   */
  static canReleaseMilestone(
    currentStatus: MilestoneStatus,
    auditEnabled: boolean,
    verification: { result: VerificationResult } | null,
  ): { allowed: boolean; reason?: string } {
    // Must be in AWAITING_APPROVAL
    if (currentStatus !== MilestoneStatus.AWAITING_APPROVAL) {
      return {
        allowed: false,
        reason: `Milestone must be in AWAITING_APPROVAL status, currently ${currentStatus}`,
      };
    }

    // If audit enabled, verification must exist and not be FAIL
    if (auditEnabled !== false) {
      if (!verification) {
        return {
          allowed: false,
          reason: "Verification required when audit is enabled",
        };
      }

      if (verification.result === VerificationResult.FAIL) {
        return {
          allowed: false,
          reason: "Cannot release milestone with FAIL verification result",
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Map review outcome to milestone status
   */
  static mapOutcomeToStatus(outcome: MilestoneReviewOutcome): MilestoneStatus {
    const mapping = {
      [MilestoneReviewOutcome.APPROVE]: MilestoneStatus.VERIFIED,
      [MilestoneReviewOutcome.REQUEST_CHANGES]:
        MilestoneStatus.REVISION_REQUESTED,
      [MilestoneReviewOutcome.REJECT]: MilestoneStatus.REJECTED,
    };

    return mapping[outcome];
  }

  /**
   * Throw error if transition not allowed
   */
  static assertTransition(allowed: boolean, message: string): void {
    if (!allowed) {
      throw new BadRequestException({
        code: "INVALID_STATE_TRANSITION",
        message,
      });
    }
  }
}
```

---

### src/common/filters/http-exception.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        code = resp.code || resp.error || "ERROR";
        message = resp.message || exception.message;
        details = resp.details;
      } else {
        message = exceptionResponse as string;
      }
    }

    response.status(status).json({
      code,
      message,
      details,
      statusCode: status,
    });
  }
}
```

---

### src/common/guards/auth.guard.ts

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "No authentication token provided",
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
```

---

### src/common/guards/roles.guard.ts

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../domain/enums";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "User not authenticated",
      });
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: `This action requires one of the following roles: ${requiredRoles.join(", ")}`,
      });
    }

    return true;
  }
}
```

---

### src/common/decorators/public.decorator.ts

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### src/common/decorators/roles.decorator.ts

```typescript
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../domain/enums";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

---

**Continue to Part 2 for DTOs and Controllers...**
