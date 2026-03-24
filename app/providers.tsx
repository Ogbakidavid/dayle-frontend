import * as React from "react";
import { UserProvider } from "@/lib/store/user-context";
import { LedgerProvider } from "@/lib/store/ledger-context";
import { VaultProvider } from "@/lib/store/vault-context";

export interface ProvidersProps {
  children: React.ReactNode;
}

import PrivyProviderWrapper from "@/components/providers/privyProvider";

import { SocketProvider } from "@/lib/contexts/socket-context";
import { RealTimeNotificationListener } from "@/components/shared/RealTimeNotificationListener";
import { NotificationProvider } from "@/lib/store/notification-context";
import { RatesProvider } from "@/lib/store/rates-context";

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProviderWrapper>
      <UserProvider>
        <RatesProvider>
          <NotificationProvider>
            <SocketProvider>
              <RealTimeNotificationListener />
              <LedgerProvider>
                <VaultProvider>{children}</VaultProvider>
              </LedgerProvider>
            </SocketProvider>
          </NotificationProvider>
        </RatesProvider>
      </UserProvider>
    </PrivyProviderWrapper>
  );
}
