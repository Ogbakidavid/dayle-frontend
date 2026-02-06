'use client';

import { UserProvider } from '@/lib/store/user-context';
import { WalletProvider } from '@/lib/store/wallet-context';
import { VaultProvider } from '@/lib/store/vault-context';
import { KYCGate } from '@/components/shared/KYCGate';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <UserProvider>
            <WalletProvider>
                <VaultProvider>
                    {children}
                </VaultProvider>
            </WalletProvider>
        </UserProvider>
    );
}

