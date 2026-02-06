"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string | number | null;
}

interface MobileNavProps {
    navigation: NavItem[];
}

export default function MobileNav({ navigation }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 px-2 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
                        >
                            <div className="relative">
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-all duration-300",
                                        isActive ? "text-emerald-400 scale-110" : "text-white/40 group-active:scale-95"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-[#0A0A0A]">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[9px] mt-1.5 font-bold uppercase tracking-widest transition-colors duration-300",
                                    isActive ? "text-emerald-400" : "text-white/40"
                                )}
                            >
                                {item.name.split(' ')[0]}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 w-8 h-1 bg-emerald-500 rounded-t-full shadow-[0_-4px_10px_rgba(16,185,129,0.3)]"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
