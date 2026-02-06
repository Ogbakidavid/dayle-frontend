"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LayoutDashboard,
  Briefcase,
  Landmark,
  LogOut,
  Settings,
  PieChart,
  CheckCircle,
  Gavel,
} from "lucide-react";
import { useUser } from "@/lib/store/user-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import UserAvatar from "@/components/shared/UserAvatar";
import MobileNav from "@/components/shared/MobileNav";
import MobileHeader from "@/components/shared/MobileHeader";

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "tween" as const,
      ease: "circOut" as const,
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const navigation = [
  { name: "Overview", href: "/freelancer", icon: LayoutDashboard, badge: null },
  {
    name: "Active Work",
    href: "/freelancer/active-work",
    icon: Briefcase,
    badge: "2",
  },
  { name: "Financials", href: "/freelancer/wallet", icon: Landmark, badge: null },
  { name: "Ledger", href: "/freelancer/ledger", icon: PieChart, badge: null },
  { name: "Disputes", href: "/freelancer/disputes", icon: Gavel, badge: null },
];

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, unreadCount } = useUser();


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">

      {/* Left Sidebar - Professional Dark Theme */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={cn(
          "w-[280px] border-r border-gray-900 bg-[#111111] hidden lg:flex flex-col h-screen",
          "lg:sticky top-0 lg:z-auto"
        )}>
        {/* Logo & Brand */}
        <div className="p-6 pb-4">
          <Link href="/freelancer" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl text-white tracking-tight font-bold uppercase">
                Dayle
              </h1>
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
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-colors font-bold uppercase",
                        isActive
                          ? "text-emerald-400"
                          : "text-white group-hover:text-white/80 font-bold uppercase"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-sm px-2 py-0.5 rounded-full font-medium",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 font-bold uppercase"
                          : "bg-white/5 text-white font-bold uppercase"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator (Activated) */}
        <div className="px-6 py-4 mx-4 mb-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-500 text-sm font-black uppercase tracking-wide mb-1">
            <CheckCircle className="w-3 h-3" /> Activated
          </div>
          <p className="text-sm text-white font-bold uppercase tracking-wide">
            Approved for Active Vault Access
          </p>
        </div>

        <div className="p-4 border-t border-gray-900 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg">
            <div className="relative group">
              <UserAvatar
                identifier={user?.id || user?.email || "guest"}
                src={user?.profileImage}
                size={36}
                className="font-bold uppercase text-sm border border-gray-700"
              />
              {user?.kycStatus === 'VERIFIED' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-muted flex items-center justify-center">
                  <Shield className="w-2 h-2 text-black" strokeWidth={4} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white">
                {user?.name || "Jane Smith"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href="/freelancer/settings" className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full text-sm font-bold uppercase tracking-wide border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 text-white/80"
              >
                <Settings className="w-3.5 h-3.5 mr-2" />
                Settings
              </Button>
              {(user?.kycStatus !== 'VERIFIED' || unreadCount > 0) && (
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
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader settingsHref="/freelancer/settings" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] pb-24 lg:pb-0">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>

        <MobileNav navigation={navigation} />
      </div>
    </div>
  );
}
