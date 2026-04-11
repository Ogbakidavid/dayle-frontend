import * as React from 'react';
import PublicGuard from "@/components/shared/PublicGuard";

export interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        /* <PublicGuard> */
            <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        /* </PublicGuard> */
    );
}
