'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, LayoutDashboard, Briefcase, Wallet, LogOut } from 'lucide-react';
import { useUser } from '@/lib/store/user-context';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/freelancer', icon: LayoutDashboard },
    { name: 'Active Work', href: '/freelancer/active-work', icon: Briefcase },
    { name: 'Wallet', href: '/freelancer/wallet', icon: Wallet },
];

export default function FreelancerLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useUser();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/freelancer" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Shield className="w-6 h-6" />
                        <span>Cleard</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{user?.name}</span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-500">Freelancer</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="space-y-1 sticky top-24">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            )}>
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
