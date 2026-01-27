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
    ChevronLeft, Smartphone, Plus, Trash2, Key, AlertTriangle, CheckCircle2
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

    // Notification center state
    const [notificationList, setNotificationList] = useState([
        { id: 1, type: 'kyc', title: 'Identity Verification Required', message: 'Complete your KYC verification to unlock full platform access and payments', timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, action: '/onboarding/kyc?role=freelancer' },
        { id: 2, type: 'milestone', title: 'Milestone Approved', message: 'Client approved milestone "Phase 1 Development" - $2,500 released to escrow', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
        { id: 3, type: 'payment', title: 'Payment Received', message: '$2,500 has been deposited to your wallet', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
        { id: 4, type: 'security', title: 'New Login Detected', message: 'Login from Chrome on MacBook Pro in New York, US', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
        { id: 5, type: 'milestone', title: 'Milestone Submitted', message: 'Your submission for "API Integration" is under review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), read: true },
        { id: 6, type: 'payment', title: 'Payment Received', message: '$1,800 has been deposited to your wallet', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true },
        { id: 7, type: 'security', title: 'Password Changed', message: 'Your account password was successfully updated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), read: true },
        { id: 8, type: 'milestone', title: 'Milestone Approved', message: 'Client approved milestone "Database Setup" - $1,200 released', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), read: true },
        { id: 9, type: 'general', title: 'Welcome to Dayle', message: 'Complete your profile to start receiving work opportunities', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), read: true },
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const getRelativeTime = (timestamp) => {
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return `${Math.floor(seconds / 604800)}w ago`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'kyc': return Shield;
            case 'milestone': return CheckCircle2;
            case 'payment': return CreditCard;
            case 'security': return Lock;
            case 'general': return Bell;
            default: return Bell;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'kyc': return 'amber';
            case 'milestone': return 'emerald';
            case 'payment': return 'blue';
            case 'security': return 'red';
            case 'general': return 'zinc';
            default: return 'zinc';
        }
    };

    const markAllAsRead = () => {
        setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id) => {
        setNotificationList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notificationList.filter(n => !n.read).length;
    const totalPages = Math.ceil(notificationList.length / itemsPerPage);
    const paginatedNotifications = notificationList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


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
                        <ChevronLeft className="w-4 h-4 text-white group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-black uppercase tracking-wide text-white group-hover:text-white">Freelancer Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white uppercase tracking-wide">Account Center</span>
                        <div className="h-4 w-[1px] bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-500 text-sm font-bold">{userInitials}</span>
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
                            <p className="text-sm font-bold text-white uppercase tracking-wide mt-2">Manage freelancer preferences</p>
                        </div>

                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-black uppercase tracking-wide relative group",
                                        activeTab === tab.id
                                            ? "text-emerald-400 bg-emerald-400/5"
                                            : "text-white hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />
                                    )}
                                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-emerald-400" : "text-white group-hover:text-white")} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-black uppercase tracking-wide text-white hover:text-red-400 transition-colors w-full"
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
                                        <p className="text-sm font-bold text-white uppercase tracking-wide mt-1">PNG, JPG or GIF up to 10MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Public Name</Label>
                                        <Input defaultValue={user?.name || "Jane Smith"} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Email Address</Label>
                                        <Input defaultValue={user?.email || "jane@example.com"} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Professional Bio</Label>
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
                                    <h3 className="text-sm font-black text-white uppercase tracking-wide">Settlement Methods</h3>
                                    <Button variant="link" className="text-emerald-500 text-sm font-black uppercase tracking-wide p-0 h-auto">View Statements</Button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { type: 'BANK', label: 'US BANKING •••• 1122', primary: true },
                                        { type: 'CRYP', label: 'WALLET •••• 7x92', primary: false }
                                    ].map((method, i) => (
                                        <div key={i} className="group flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-7 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-sm font-bold text-zinc-400">
                                                    {method.type}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{method.label}</p>
                                                        {method.primary && <span className="text-sm px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Primary</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full py-6 bg-transparent border border-dashed border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white hover:text-emerald-500 transition-all rounded-xl font-black uppercase text-sm tracking-wide">
                                    <Plus className="w-4 h-4 mr-2" /> Add Settlement Method
                                </Button>
                            </div>
                        )}

                        {/* Security Section (Same as client pretty much, but keep emerald theme) */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">Passcode Security</h3>
                                        <p className="text-sm font-bold text-white uppercase tracking-wide">Maintain bank-grade protection for your freelancer account</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Current Passcode</Label>
                                            <Input type="password" placeholder="••••••••" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Confirm New</Label>
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
                                                <p className="text-sm font-bold text-white leading-relaxed max-w-md uppercase tracking-wide">Secure your settlements with authenticator-based validation</p>
                                                <div className="pt-2">
                                                    <span className="text-sm px-2 py-1 bg-white/5 text-white rounded-full font-black uppercase tracking-wide">Not Enabled</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-4 text-sm rounded-lg">
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
                                                <p className="text-sm text-zinc-400 mb-4">Closing your freelancer account will clear any pending applications.</p>
                                                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm">
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* State and helper functions moved out of IIFE */}
                                {(() => { /* This IIFE is now empty, but the content below is the target */ })()}
                                {/* The content of the IIFE starts here */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wide">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed mt-1">Stay updated on your work progress</p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <Button
                                            onClick={markAllAsRead}
                                            variant="ghost"
                                            size="sm"
                                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold uppercase tracking-wide text-xs"
                                        >
                                            Mark all read
                                        </Button>
                                    )}
                                </div>

                                {/* Notification List */}
                                <div className="space-y-2">
                                    {paginatedNotifications.map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);
                                        const color = getNotificationColor(notification.type);

                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "group p-4 border rounded-xl transition-all cursor-pointer",
                                                    notification.read
                                                        ? "bg-zinc-900/20 border-zinc-800/30 hover:border-zinc-700"
                                                        : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                                                )}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "p-2 rounded-lg shrink-0",
                                                        color === 'amber' && "bg-amber-500/10",
                                                        color === 'emerald' && "bg-emerald-500/10",
                                                        color === 'blue' && "bg-blue-500/10",
                                                        color === 'red' && "bg-red-500/10",
                                                        color === 'zinc' && "bg-zinc-500/10"
                                                    )}>
                                                        <Icon className={cn(
                                                            "w-4 h-4",
                                                            color === 'amber' && "text-amber-500",
                                                            color === 'emerald' && "text-emerald-500",
                                                            color === 'blue' && "text-blue-500",
                                                            color === 'red' && "text-red-500",
                                                            color === 'zinc' && "text-zinc-500"
                                                        )} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={cn(
                                                                        "text-sm font-bold uppercase tracking-tight",
                                                                        notification.read ? "text-white/70" : "text-white"
                                                                    )}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.read && (
                                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
                                                                    )}
                                                                </div>
                                                                <p className={cn(
                                                                    "text-xs mt-1",
                                                                    notification.read ? "text-white/40" : "text-white/60"
                                                                )}>
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-white/30 mt-2">
                                                                    {getRelativeTime(notification.timestamp)}
                                                                </p>
                                                            </div>
                                                            {notification.action && !notification.read && (
                                                                <Link href={notification.action} onClick={(e) => e.stopPropagation()}>
                                                                    <Button size="sm" className={cn(
                                                                        "font-bold uppercase tracking-wide text-xs h-8 px-3 shrink-0",
                                                                        color === 'amber' && "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                                    )}>
                                                                        Action
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                        <p className="text-xs text-white/40">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, notificationList.length)} of {notificationList.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-xs font-bold uppercase tracking-wide disabled:opacity-30"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                            currentPage === page
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                                                : "text-white/40 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-xs font-bold uppercase tracking-wide disabled:opacity-30"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
