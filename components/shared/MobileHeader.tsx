"use client";

import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { useUser } from "@/lib/store/user-context";
import Link from "next/link";

interface MobileHeaderProps {
    title?: string;
    settingsHref?: string;
}

export default function MobileHeader({ title = "Dayle", settingsHref = "/settings" }: MobileHeaderProps) {
    const { user, unreadCount } = useUser();

    return (
        <header className="lg:hidden sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center">
                    <Shield className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <h1 className="text-lg font-bold uppercase tracking-tight text-white">{title}</h1>
            </Link>

            <div className="flex items-center gap-2">
                <Link href={settingsHref} className="relative">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </Button>
                </Link>
                <Link href={settingsHref}>
                    <UserAvatar
                        identifier={user?.id || user?.email || "guest"}
                        src={user?.profileImage}
                        size={32}
                        className="border-white/10"
                    />
                </Link>
            </div>
        </header>
    );
}
