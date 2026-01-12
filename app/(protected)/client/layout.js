'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, LayoutDashboard, Plus, Wallet, LogOut, Settings, Bell } from 'lucide-react';
import { useUser } from '@/lib/store/user-context';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'Create Vault', href: '/client/create-vault', icon: Plus },
    { name: 'Wallet', href: '/client/wallet', icon: Wallet },
    { name: 'Settings', href: '/client/settings', icon: Settings },
];

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useUser();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-['Poppins',_sans-serif] flex">

            {/* Sidebar Navigation */}
            <aside className="w-72 border-r border-white/5 bg-[#080808] hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <Link href="/client" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
                            <Shield className="w-6 h-6 text-black stroke-[3px]" />
                        </div>
                        <span className="font-black tracking-tighter text-white text-xl uppercase">SKENTRAL</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <div className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Protocol Menu</div>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all group",
                                    isActive
                                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                                        : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}>
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-emerald-500")} />
                                    <span>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="w-full justify-start gap-4 px-4 py-6 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm font-bold uppercase tracking-widest"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile/Top Header */}
                <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="lg:hidden flex items-center gap-3">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        <span className="font-black text-white text-lg uppercase tracking-tighter">SKENTRAL</span>
                    </div>

                    <div className="hidden lg:block text-sm font-medium text-slate-500 uppercase tracking-widest">
                        System Status: <span className="text-emerald-500">Secure Mode</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]"></span>
                        </Button>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{user?.name || 'Authorized User'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Client Node</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-black font-black">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}