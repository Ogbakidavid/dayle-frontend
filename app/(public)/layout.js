import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import LandingPageNavigationInterceptor from '@/components/shared/LandingPageNavigationInterceptor';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {children}
            </main>
            <LandingPageNavigationInterceptor />
        </div>
    );
}
