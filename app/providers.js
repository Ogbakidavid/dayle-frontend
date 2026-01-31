'use client';

import { UserProvider } from '@/lib/store/user-context';
import { LedgerProvider } from '@/lib/store/ledger-context';
import { VaultProvider } from '@/lib/store/vault-context';
import { KYCGate } from '@/components/shared/KYCGate';

export function Providers({ children }) {
    return (
        <UserProvider>
            <LedgerProvider>
                <VaultProvider>
                    {children}
                </VaultProvider>
            </LedgerProvider>
        </UserProvider>
    );
}
