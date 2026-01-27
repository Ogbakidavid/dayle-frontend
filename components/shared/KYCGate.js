'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/store/user-context';

const ALLOWED_PATHS_WITHOUT_KYC = [
    '/login',
    '/signup',
    '/onboarding/role',
    '/onboarding/kyc',
];

export function KYCGate({ children }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // Not logged in - allow public paths
        if (!user) {
            if (!pathname?.startsWith('/login') && !pathname?.startsWith('/signup') && pathname !== '/') {
                router.push('/login');
            }
            return;
        }

        // Check if path is allowed without KYC
        const isAllowedPath = ALLOWED_PATHS_WITHOUT_KYC.some(path => pathname?.startsWith(path));
        if (isAllowedPath) return;

        // Enforce role selection
        if (!user.role) {
            router.push('/onboarding/role');
            return;
        }

        // Enforce KYC completion - REMOVED to allow dashboard access with alert
        // if (user.kycStatus !== 'approved') {
        //     router.push('/onboarding/kyc');
        //     return;
        // }

        // User is fully onboarded - allow access
    }, [user, loading, pathname, router]);

    // Show loading state while checking
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
