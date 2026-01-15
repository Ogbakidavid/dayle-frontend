'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    User, CreditCard, Lock, Bell,
    LogOut, Shield, Mail,
    ChevronLeft, Smartphone, Plus, Trash2, Key, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/store/user-context';

export default function FreelancerSettingsPage() {
    const { user, logout } = useUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [notifications, setNotifications] = useState({
        milestones: true,
        releases: true,
        logins: false,
        digest: true,
        marketing: false
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'payment', label: 'Payouts', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans selection:bg-emerald-500/30">
            {/* Minimalist Header */}
            <header className="border-b border-zinc-800/50 py-4 px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 w-full z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/freelancer" className="flex items-center gap-2 group transition-colors">
                        <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white">Freelancer Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Account Center</span>
                        <div className="h-4 w-[1px] bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-500 text-[10px] font-bold">{userInitials}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row gap-16">

                    {/* Sidebar: Clean & Floating */}
                    <aside className="md:w-64 flex-shrink-0">
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Settings</h1>
                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-2">Manage freelancer preferences</p>
                        </div>

                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-black uppercase tracking-widest relative group",
                                        activeTab === tab.id
                                            ? "text-emerald-400 bg-emerald-400/5"
                                            : "text-white/20 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />
                                    )}
                                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-emerald-400" : "text-white/20 group-hover:text-white/40")} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-3 py-2 text-xs font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors w-full"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content: Focused Cards */}
                    <section className="flex-1 max-w-2xl">

                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-end gap-6">
                                    <div className="relative group">
                                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                            <span className="text-2xl font-light text-zinc-400 group-hover:scale-110 transition-transform">{userInitials}</span>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-emerald-500 transition-colors shadow-xl">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="pb-1">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Freelancer Profile</h3>
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">PNG, JPG or GIF up to 10MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Public Name</Label>
                                        <Input defaultValue={user?.name || "Jane Smith"} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Email Address</Label>
                                        <Input defaultValue={user?.email || "jane@example.com"} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Professional Bio</Label>
                                        <Input defaultValue="Senior Fullstack Engineer specializing in fintech and secure settlement systems." className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-900 flex justify-end">
                                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-6 rounded-lg transition-all shadow-lg shadow-emerald-600/10">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Payouts Section */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Settlement Methods</h3>
                                    <Button variant="link" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest p-0 h-auto">View Statements</Button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { type: 'BANK', label: 'US BANKING •••• 1122', primary: true },
                                        { type: 'CRYP', label: 'WALLET •••• 7x92', primary: false }
                                    ].map((method, i) => (
                                        <div key={i} className="group flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-7 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                    {method.type}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{method.label}</p>
                                                        {method.primary && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Primary</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full py-6 bg-transparent border border-dashed border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white/20 hover:text-emerald-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest">
                                    <Plus className="w-4 h-4 mr-2" /> Add Settlement Method
                                </Button>
                            </div>
                        )}

                        {/* Security Section (Same as client pretty much, but keep emerald theme) */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Passcode Security</h3>
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Maintain bank-grade protection for your freelancer account</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Current Passcode</Label>
                                            <Input type="password" placeholder="••••••••" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Confirm New</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                            </div>
                                        </div>
                                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-6 rounded-lg">
                                            Update Password
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="flex items-start justify-between p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="flex gap-4">
                                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <Smartphone className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">2FA Protection</h4>
                                                <p className="text-xs font-bold text-white/40 leading-relaxed max-w-md uppercase tracking-widest">Secure your settlements with authenticator-based validation</p>
                                                <div className="pt-2">
                                                    <span className="text-[10px] px-2 py-1 bg-white/5 text-white/20 rounded-full font-black uppercase tracking-widest">Not Enabled</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-4 text-xs rounded-lg">
                                            Enable
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-red-400 mb-1">Deactivate Account</h4>
                                                <p className="text-xs text-zinc-400 mb-4">Closing your freelancer account will clear any pending applications.</p>
                                                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs">
                                                    Delete Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Alert Subscriptions</h3>
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Control how you stay updated on work progress</p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { id: 'milestones', label: 'Milestone Approvals', desc: 'Get notified when clients approve your milestones', checked: notifications.milestones },
                                        { id: 'releases', label: 'Capital Releases', desc: 'Alerts when funds reach your secured wallet', checked: notifications.releases },
                                        { id: 'logins', label: 'Security Alerts', desc: 'Notifications for account access and security events', checked: notifications.logins },
                                        { id: 'digest', label: 'Opportunity Digest', desc: 'Weekly summary of new work matching your profile', checked: notifications.digest }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</p>
                                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">{item.desc}</p>
                                            </div>
                                            <Switch
                                                checked={item.checked}
                                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-zinc-900">
                                    <div className="p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Verified Email</h4>
                                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-3">System messages sent to: <span className="text-emerald-500/80">{user?.email || "jane@example.com"}</span></p>
                                                <Button variant="link" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest p-0 h-auto">
                                                    Change Email
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
