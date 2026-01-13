'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, CreditCard, Lock, Bell,
    LogOut, CheckCircle, Shield, Mail,
    ChevronRight, Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <header className="border-b border-white/5 py-4 px-6 md:px-12 bg-[#050505]/50 backdrop-blur-md sticky top-0 w-full z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/client" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-sm flex items-center justify-center shadow-emerald-500/20">
                            <span className="text-black font-bold text-xs">S</span>
                        </div>
                        <span className="text-white font-semibold">Settings</span>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

                {/* Page Title */}
                <div className="pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage your personal information and security</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-3 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all text-sm font-medium",
                                    activeTab === tab.id
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-9 space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-[#0D0D0E] border border-white/5 p-8 rounded-2xl space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-900/20">
                                            JD
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">John Doe</h3>
                                            <p className="text-slate-500 text-sm">Client Account</p>
                                            <Button variant="outline" size="sm" className="mt-3 border-white/10 hover:bg-white/5 text-white">
                                                Change Avatar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Full Name</Label>
                                            <Input
                                                defaultValue="John Doe"
                                                className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Email Address</Label>
                                            <Input
                                                defaultValue="john@example.com"
                                                className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Company Name</Label>
                                            <Input
                                                defaultValue="Acme Corp"
                                                className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Role</Label>
                                            <Input
                                                defaultValue="Administrator"
                                                disabled
                                                className="bg-white/5 border-transparent text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flexjustify-end">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-[#0D0D0E] border border-white/5 p-8 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-6">Saved Payment Methods</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">VISA</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Visa ending in 4242</p>
                                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                                                Remove
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">MAST</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Mastercard ending in 8833</p>
                                                    <p className="text-xs text-slate-500">Expires 09/26</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    <Button className="mt-6 w-full py-6 border border-dashed border-white/20 bg-transparent hover:bg-white/5 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                                        + Add New Card
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-[#0D0D0E] border border-white/5 p-8 rounded-sm space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Password & Authentication</h3>
                                        <p className="text-sm text-slate-500 mt-1">Manage your access credentials securely</p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Current Password</Label>
                                            <Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-400">New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400">Confirm Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white focus:border-emerald-500/50" />
                                            </div>
                                        </div>
                                        <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10">Update Password</Button>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-sm text-emerald-500">
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                                                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">Enable 2FA</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-[#0D0D0E] border border-white/5 p-8 rounded-sm">
                                    <h3 className="text-lg font-bold text-white mb-6">Notification Preferences</h3>
                                    <div className="space-y-4">
                                        {[
                                            "Email me when a vault milestone is completed",
                                            "Email me when funds are released",
                                            "Notify me about new login attempts",
                                            "Send weekly activity digest"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-sm text-slate-300">{item}</span>
                                                <div className="w-10 h-6 bg-emerald-600 rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
