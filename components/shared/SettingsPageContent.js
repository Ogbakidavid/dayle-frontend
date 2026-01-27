'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    User, CreditCard, Lock, Bell,
    LogOut, Shield, Mail,
    ChevronLeft, Smartphone, Plus, Trash2, Key, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useUser } from '@/lib/store/user-context';
import { cn } from "@/lib/utils";
import UserAvatar from '@/components/shared/UserAvatar';

export default function SettingsPageContent({ role = 'client' }) {
    const router = useRouter();
    const { user, logout, refreshUser } = useUser();
    const [activeTab, setActiveTab] = useState('profile');
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                // In a real app, you'd upload to S3/Cloudinary.
                // Here we use the mock API which perists to localStorage.
                await api.auth.updateProfile({ profileImage: base64String });
                await refreshUser();
            } catch (error) {
                console.error('Failed to upload image:', error);
            }
        };
        reader.readAsDataURL(file);
    };

    const isClient = role === 'client';

    // Notification center state
    const [notificationList, setNotificationList] = useState(
        isClient ? [
            { id: 1, type: 'kyc', title: 'Identity Verification Required', message: 'Complete your KYC verification to unlock full platform access and vault creation', timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, action: '/onboarding/kyc?role=client' },
            { id: 2, type: 'milestone', title: 'Milestone Completed', message: 'Freelancer completed milestone "Phase 1 Development" - ready for review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
            { id: 3, type: 'payment', title: 'Payment Processed', message: '$2,500 has been transferred to escrow for "API Integration"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
            { id: 4, type: 'security', title: 'New Login Detected', message: 'Login from Chrome on MacBook Pro in New York, US', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
            { id: 5, type: 'milestone', title: 'Milestone Approved', message: 'You approved milestone "Database Setup" - $1,200 released to freelancer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), read: true },
            { id: 6, type: 'payment', title: 'Vault Created', message: 'New vault "Mobile App Development" created with $10,000 budget', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true },
            { id: 7, type: 'security', title: 'Password Changed', message: 'Your account password was successfully updated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), read: true },
            { id: 8, type: 'milestone', title: 'Milestone Submitted', message: 'Freelancer submitted milestone "UI Design" for review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), read: true },
            { id: 9, type: 'general', title: 'Welcome to Dayle', message: 'Start creating vaults and hiring freelancers securely', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), read: true },
        ] : [
            { id: 1, type: 'kyc', title: 'Identity Verification Required', message: 'Complete your KYC verification to unlock full platform access and payments', timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, action: '/onboarding/kyc?role=freelancer' },
            { id: 2, type: 'milestone', title: 'Milestone Approved', message: 'Client approved milestone "Phase 1 Development" - $2,500 released to escrow', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
            { id: 3, type: 'payment', title: 'Payment Received', message: '$2,500 has been settled in your account', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
            { id: 4, type: 'security', title: 'New Login Detected', message: 'Login from Chrome on MacBook Pro in New York, US', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
            { id: 5, type: 'milestone', title: 'Milestone Submitted', message: 'Your submission for "API Integration" is under review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), read: true },
            { id: 6, type: 'payment', title: 'Payment Received', message: '$1,800 has been settled in your account', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true },
            { id: 7, type: 'security', title: 'Password Changed', message: 'Your account password was successfully updated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), read: true },
            { id: 8, type: 'milestone', title: 'Milestone Approved', message: 'Client approved milestone "Database Setup" - $1,200 released', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), read: true },
            { id: 9, type: 'general', title: 'Welcome to Dayle', message: 'Complete your profile to start receiving work opportunities', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), read: true },
        ]
    );

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
        { id: 'payment', label: isClient ? 'Billing' : 'Payouts', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans selection:bg-emerald-500/30">
            {/* Minimalist Header */}
            <header className="border-b border-zinc-800/50 py-4 px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 w-full z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href={isClient ? "/client" : "/freelancer"} className="flex items-center gap-2 group transition-colors">
                        <ChevronLeft className="w-4 h-4 text-white group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-black uppercase tracking-wide text-white group-hover:text-white">
                            {isClient ? "Dashboard" : "Freelancer Dashboard"}
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white uppercase tracking-wide">Account Center</span>
                        <div className="h-4 w-px bg-white/5" />
                        <div className="flex items-center gap-2">
                                <div className="relative group">
                                    <UserAvatar 
                                        identifier={user?.id || user?.email || "guest"} 
                                        src={user?.profileImage}
                                        size={24} 
                                        className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20"
                                    />
                                    {user?.kycStatus === 'VERIFIED' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#050505] flex items-center justify-center">
                                        <CheckCircle2 className="w-1.5 h-1.5 text-black" strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row gap-16">

                    {/* Sidebar: Clean & Floating */}
                    <aside className="md:w-64 shrink-0">
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Settings</h1>
                            <p className="text-sm font-bold text-white uppercase tracking-wide mt-2">
                                {isClient ? "Manage account preferences" : "Manage freelancer preferences"}
                            </p>
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
                                    {tab.id === 'notifications' && unreadCount > 0 && (
                                        <span className='ml-auto px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20'>
                                            {unreadCount}
                                        </span>
                                    )}
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
                                        <UserAvatar 
                                            identifier={user?.id || user?.email || "guest"} 
                                            src={user?.profileImage}
                                            size={80} 
                                            className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800"
                                        />
                                        {user?.kycStatus === 'VERIFIED' && (
                                            <div className="absolute -top-2 -right-2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500">Verified</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-emerald-500 transition-colors shadow-xl"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            accept="image/*" 
                                        />
                                    </div>
                                    <div className="pb-1">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                            {isClient ? "Profile Picture" : "Freelancer Profile"}
                                        </h3>
                                        <p className="text-sm font-bold text-white uppercase tracking-wide mt-1">PNG, JPG or GIF up to 10MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">
                                            {isClient ? "Full Name" : "Public Name"}
                                        </Label>
                                        <Input defaultValue={user?.name || (isClient ? "John Doe" : "Jane Smith")} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">Email Address</Label>
                                        <Input defaultValue={user?.email || (isClient ? "john@example.com" : "jane@example.com")} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">
                                            {isClient ? "Company" : "Professional Bio"}
                                        </Label>
                                        <Input defaultValue={isClient ? "Acme Global Holdings" : "Senior Fullstack Engineer specializing in fintech and secure settlement systems."} className="bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 h-11" />
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
                                    <h3 className="text-sm font-black text-white uppercase tracking-wide">
                                        {isClient ? "Cards on file" : "Settlement Methods"}
                                    </h3>
                                    <Button variant="link" className="text-emerald-500 text-sm font-black uppercase tracking-wide p-0 h-auto">
                                        {isClient ? "View Invoices" : "View Statements"}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {(isClient ? [
                                        { type: 'VISA', last4: '4242', exp: '12/28', primary: true },
                                        { type: 'MAST', last4: '8833', exp: '09/26', primary: false }
                                    ] : [
                                        { type: 'BANK', label: 'US BANKING •••• 1122', primary: true },
                                        { type: 'CRYP', label: 'ACCOUNT •••• 7x92', primary: false }
                                    ]).map((item, i) => (
                                        <div key={i} className="group flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-7 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-sm font-bold text-zinc-400">
                                                    {item.type}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                                                            {isClient ? `•••• ${item.last4}` : item.label}
                                                        </p>
                                                        {item.primary && <span className="text-sm px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Primary</span>}
                                                    </div>
                                                    {isClient && <p className="text-[11px] font-bold text-white uppercase tracking-wide">Expires {item.exp}</p>}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full py-6 bg-transparent border border-dashed border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white hover:text-emerald-500 transition-all rounded-xl font-black uppercase text-sm tracking-wide">
                                    <Plus className="w-4 h-4 mr-2" /> {isClient ? "Add Payment Method" : "Add Settlement Method"}
                                </Button>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Password Change */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">
                                            {isClient ? "Change Password" : "Passcode Security"}
                                        </h3>
                                        <p className="text-sm font-bold text-white uppercase tracking-wide">
                                            {isClient ? "Update your password to keep your account secure" : "Maintain bank-grade protection for your freelancer account"}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-black text-white uppercase tracking-wide ml-1">
                                                {isClient ? "Current Password" : "Current Passcode"}
                                            </Label>
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

                                {/* Two-Factor Authentication */}
                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="flex items-start justify-between p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="flex gap-4">
                                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <Smartphone className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                                    {isClient ? "Two-Factor Authentication" : "2FA Protection"}
                                                </h4>
                                                <p className="text-sm font-bold text-white leading-relaxed max-w-md uppercase tracking-wide">
                                                    {isClient ? "Add an extra layer of security to your account with authenticator app verification" : "Secure your settlements with authenticator-based validation"}
                                                </p>
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

                                {/* Active Sessions (Client only UI slightly different but let's keep it similar for now, maybe only show for client if needed) */}
                                {isClient && (
                                    <div className="pt-8 border-t border-zinc-900 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wide">Active Sessions</h3>
                                            <Button variant="link" className="text-red-400 text-sm font-black uppercase tracking-wide p-0 h-auto hover:text-red-300">Revoke All</Button>
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
                                                                {session.current && <span className="text-sm px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black uppercase tracking-tighter">Current</span>}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-white uppercase tracking-wide">{session.location} • {session.time}</p>
                                                        </div>
                                                    </div>
                                                    {!session.current && (
                                                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 text-sm">
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                <div className="pt-8 border-t border-zinc-900">
                                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-red-400 mb-1">
                                                    {isClient ? "Danger Zone" : "Deactivate Account"}
                                                </h4>
                                                <p className="text-sm text-zinc-400 mb-4">
                                                    {isClient ? "Once you delete your account, there is no going back. Please be certain." : "Closing your freelancer account will clear any pending applications."}
                                                </p>
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
                                {/* Header */}
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
                                        <p className="text-sm text-white/60 leading-relaxed mt-1">
                                            {isClient ? "Stay updated on your account activity" : "Stay updated on your work progress"}
                                        </p>
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
                                                onClick={() => {
                                                    markAsRead(notification.id);
                                                    if (notification.action) {
                                                        router.push(notification.action);
                                                    }
                                                }}
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
