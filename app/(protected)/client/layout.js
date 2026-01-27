'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, LayoutDashboard, Plus, Landmark, LogOut, Settings, Bell, Search, ChevronDown, PieChart, FileText, Users, CreditCard, Lock, HelpCircle, Gavel, Menu, X } from 'lucide-react';
import { useUser } from '@/lib/store/user-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/shared/UserAvatar';

const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            // Using a standard tween for smoother, less "bouncy" feel
            type: "tween",
            ease: "circOut",
            duration: 0.4,
            staggerChildren: 0.05,
            delayChildren: 0.05 // Drastically reduced from 0.2 to prevent "hanging"
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const navigation = [
    { name: 'Overview', href: '/client', icon: LayoutDashboard, badge: null },
    { name: 'Vaults', href: '/client/vaults', icon: Lock, badge: '3' },
    { name: 'Create Vault', href: '/client/create-vault', icon: Plus, badge: null },
    { name: 'Ledger', href: '/client/ledger', icon: PieChart, badge: null },
    { name: 'Disputes', href: '/client/disputes', icon: Gavel, badge: null },
    { name: 'Transactions', href: '/client/transactions', icon: CreditCard, badge: null },
];

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useUser();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar - Professional Dark Theme */}
            <motion.aside
                initial="hidden"
                animate="visible"
                variants={sidebarVariants}
                className={cn(
                    "w-[280px] border-r border-gray-900 bg-muted flex flex-col h-screen transition-transform duration-300 ease-in-out",
                    "fixed lg:sticky top-0 z-50 lg:z-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                {/* Logo & Brand */}
                <div className="p-6 pb-4">
                    <Link href="/client" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-500/20">
                            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl text-white tracking-tight font-bold uppercase">Dayle</h1>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <motion.div
                                    variants={itemVariants}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wide"
                                            : "text-white/60 hover:bg-white/5 hover:text-white font-bold uppercase tracking-wide"
                                    )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-colors font-bold uppercase",
                                            isActive ? "text-emerald-400" : "text-white group-hover:text-white/80 font-bold uppercase"
                                        )} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={cn(
                                            "text-sm px-2 py-0.5 rounded-full font-medium",
                                            isActive
                                                ? "bg-emerald-500/20 text-emerald-400 font-bold uppercase"
                                                : "bg-white/5 text-white font-bold uppercase"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-900 mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-lg">
                        <div className="relative group">
                            <UserAvatar 
                                identifier={user?.id || user?.email || "guest"} 
                                src={user?.profileImage}
                                size={36} 
                                className="font-medium text-sm border border-gray-700"
                            />
                            {user?.kycStatus === 'VERIFIED' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-muted flex items-center justify-center">
                                    <Shield className="w-2 h-2 text-black" strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-white">{user?.name || 'Alex Johnson'}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Link href="/client/settings" className="relative group">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-full text-sm font-bold uppercase tracking-wide border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 text-white/80"
                            >
                                <Settings className="w-3.5 h-3.5 mr-2" />
                                Settings
                            </Button>
                            {user?.kycStatus !== 'approved' && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-muted"></span>
                                </span>
                            )}
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="h-9 text-sm font-bold uppercase tracking-wide border-white/10 bg-black/30 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            < div className="flex-1 flex flex-col min-w-0" >
                {/* Mobile Header */}
                < div className="lg:hidden sticky top-0 z-30 bg-muted border-b border-gray-900 p-4 flex items-center justify-between" >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="text-white hover:bg-white/10"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-bold uppercase">Dayle</h1>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div >

                {/* Content Area */}
                < main className="flex-1 overflow-y-auto bg-background" >
                    <div className="p-4 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
}
