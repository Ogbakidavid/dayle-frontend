'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, LayoutDashboard, Plus, Wallet, LogOut, Settings, Bell, Search, ChevronDown, PieChart, FileText, Users, CreditCard, Lock, HelpCircle } from 'lucide-react';
import { useUser } from '@/lib/store/user-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
    { name: 'Overview', href: '/client', icon: LayoutDashboard, badge: null },
    { name: 'Vaults', href: '/client/vaults', icon: Lock, badge: '3' },
    { name: 'Create Vault', href: '/client/create-vault', icon: Plus, badge: null },
    { name: 'Transactions', href: '/client/transactions', icon: CreditCard, badge: null },
    // { name: 'Team', href: '/client/team', icon: Users, badge: null },
    // { name: 'Documents', href: '/client/documents', icon: FileText, badge: null },
];

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useUser();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex">
            {/* Left Sidebar - Professional Dark Theme */}
            <aside className="w-[280px] border-r border-gray-900 bg-[#111111] flex flex-col sticky top-0 h-screen">
                {/* Logo & Brand */}
                <div className="p-6 pb-4">
                    <Link href="/client" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-500/20">
                            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl text-white tracking-tight">Cleard</h1>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-colors",
                                            isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/80"
                                        )} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={cn(
                                            "text-sm px-2 py-0.5 rounded-full font-medium",
                                            isActive
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-white/5 text-white/40"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-900 mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-lg">
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-medium text-sm border border-gray-700">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user?.name || 'Alex Johnson'}</p>
                            <p className="text-sm text-white/40 font-bold uppercase tracking-wider">Administrator</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Link href="/settings">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-full text-sm border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 text-white/80"
                            >
                                <Settings className="w-3.5 h-3.5 mr-2" />
                                Settings
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="h-9 text-sm border-white/10 bg-black/30 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}