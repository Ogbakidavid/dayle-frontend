import * as React from "react";
import { UserProvider } from "@/lib/store/user-context";
import { LedgerProvider } from "@/lib/store/ledger-context";
import { VaultProvider } from "@/lib/store/vault-context";

export interface ProvidersProps {
  children: React.ReactNode;
}

import PrivyProviderWrapper from "@/components/providers/privyProvider";

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProviderWrapper>
      <UserProvider>
        <LedgerProvider>
          <VaultProvider>{children}</VaultProvider>
        </LedgerProvider>
      </UserProvider>
    </PrivyProviderWrapper>
  );
}
