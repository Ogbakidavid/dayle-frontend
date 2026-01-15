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

export default function SettingsPage() {
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
        { id: 'payment', label: 'Billing', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans selection:bg-emerald-500/30">
            {/* Minimalist Header */}
            <header className="border-b border-zinc-800/50 py-4 px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 w-full z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/client" className="flex items-center gap-2 group transition-colors">
                        <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white">Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Account Center</span>
                        <div className="h-4 w-[1px] bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-500 text-[10px] font-bold">JD</span>
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
                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-2">Manage account preferences</p>
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
                            <button className="flex items-center gap-3 px-3 py-2 text-xs font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors w-full">
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
                                            <span className="text-2xl font-light text-zinc-400 group-hover:scale-110 transition-transform">JD</span>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-emerald-500 transition-colors shadow-xl">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="pb-1">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Profile Picture</h3>
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">PNG, JPG or GIF up to 10MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Full Name</Label>
                                        <Input defaultValue="John Doe" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Email Address</Label>
                                        <Input defaultValue="john@example.com" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Company</Label>
                                        <Input defaultValue="Acme Global Holdings" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-900 flex justify-end">
                                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-6 rounded-lg transition-all shadow-lg shadow-emerald-600/10">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Payment Section */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Cards on file</h3>
                                    <Button variant="link" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest p-0 h-auto">View Invoices</Button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { type: 'VISA', last4: '4242', exp: '12/28', primary: true },
                                        { type: 'MAST', last4: '8833', exp: '09/26', primary: false }
                                    ].map((card, i) => (
                                        <div key={i} className="group flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-7 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                    {card.type}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white">•••• {card.last4}</p>
                                                        {card.primary && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Primary</span>}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest">Expires {card.exp}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full py-6 bg-transparent border border-dashed border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white/20 hover:text-emerald-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest">
                                    <Plus className="w-4 h-4 mr-2" /> Add Payment Method
                                </Button>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Password Change */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Change Password</h3>
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Update your password to keep your account secure</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-1">Current Password</Label>
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

                                {/* Two-Factor Authentication */}
                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="flex items-start justify-between p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="flex gap-4">
                                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <Smartphone className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">Two-Factor Authentication</h4>
                                                <p className="text-xs font-bold text-white/40 leading-relaxed max-w-md uppercase tracking-widest">Add an extra layer of security to your account with authenticator app verification</p>
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

                                {/* Active Sessions */}
                                <div className="pt-8 border-t border-zinc-900 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Sessions</h3>
                                        <Button variant="link" className="text-red-400 text-[10px] font-black uppercase tracking-widest p-0 h-auto hover:text-red-300">Revoke All</Button>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { device: 'Chrome on MacBook Pro', location: 'New York, US', current: true, time: 'Active now' },
                                            { device: 'Safari on iPhone 15', location: 'New York, US', current: false, time: '2 hours ago' }
                                        ].map((session, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                                        <Key className="w-4 h-4 text-zinc-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{session.device}</p>
                                                            {session.current && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Current</span>}
                                                        </div>
                                                        <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest">{session.location} • {session.time}</p>
                                                    </div>
                                                </div>
                                                {!session.current && (
                                                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 text-xs">
                                                        Revoke
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h4>
                                                <p className="text-xs text-zinc-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
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
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Notification Preferences</h3>
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Manage how you receive updates about your account</p>
                                </div>

                                {/* Email Notifications */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email Notifications</h4>

                                    {[
                                        { id: 'milestones', label: 'Milestone Completions', desc: 'Get notified when vault milestones are completed', checked: notifications.milestones },
                                        { id: 'releases', label: 'Fund Releases', desc: 'Receive alerts when funds are released from escrow', checked: notifications.releases },
                                        { id: 'logins', label: 'Login Attempts', desc: 'Security alerts for new login attempts', checked: notifications.logins },
                                        { id: 'digest', label: 'Weekly Digest', desc: 'Summary of your account activity every week', checked: notifications.digest }
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

                                {/* Marketing */}
                                <div className="pt-6 border-t border-zinc-900 space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Marketing</h4>

                                    <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Product Updates & News</p>
                                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">Occasional emails about new features and improvements</p>
                                        </div>
                                        <Switch
                                            checked={notifications.marketing}
                                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                                        />
                                    </div>
                                </div>

                                {/* Email Preferences */}
                                <div className="pt-6 border-t border-zinc-900">
                                    <div className="p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Email Address</h4>
                                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-3">Notifications will be sent to: <span className="text-emerald-500/80">john@example.com</span></p>
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