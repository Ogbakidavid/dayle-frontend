'use client';

import { VaultCard } from '@/components/shared/VaultCard';
import { useVault } from '@/lib/store/vault-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ActiveWorkPage() {
    const { vaults, loading } = useVault();
    // Filter for MVP demo
    const myVaults = vaults;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Link href="/freelancer" className="hover:text-slate-900 cursor-pointer">Dashboard</Link>
                <span>/</span>
                <span>Active Work</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Active Assignments</h1>

            {loading ? (
                <div>Loading...</div>
            ) : myVaults.length === 0 ? (
                <p>No active work.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myVaults.map(vault => (
                        <VaultCard key={vault.id} vault={vault} isClient={false} />
                    ))}
                </div>
            )}
        </div>
    );
}
