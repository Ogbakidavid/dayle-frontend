"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LayoutDashboard,
  Briefcase,
  PieChart,
  LogOut,
  Settings,
  CheckCircle,
  Gavel,
  Menu,
  Landmark,
} from "lucide-react";
import { useUser } from "@/lib/store/user-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import UserAvatar from "@/components/shared/UserAvatar";

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "tween",
      ease: "circOut",
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    } as any,
  },
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
    badge: null,
  },
  {
    name: "My Balance",
    href: "/freelancer/balance",
    icon: Landmark,
    badge: null,
  },
  { name: "Ledger", href: "/freelancer/ledger", icon: PieChart, badge: null },
  { name: "Disputes", href: "/freelancer/disputes", icon: Gavel, badge: null },
];

interface FreelancerLayoutProps {
  children: React.ReactNode;
}

export default function FreelancerLayout({ children }: FreelancerLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-white flex font-['Poppins',sans-serif]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Professional Dark Theme */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={cn(
          "w-[280px] border-r border-gray-900 bg-muted flex flex-col h-screen transition-all duration-300 ease-in-out shadow-2xl",
          "fixed lg:sticky top-0 z-50 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo & Brand */}
        <div className="p-6 pb-4">
          <Link href="/freelancer" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl text-white tracking-widest font-black uppercase italic">
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
                    "flex items-center justify-between px-3 py-3 rounded-xl text-xs transition-all group border border-transparent",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/5"
                      : "text-white/40 hover:bg-white/5 hover:text-white font-black uppercase tracking-[0.15em]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-all",
                        isActive
                          ? "text-emerald-400 scale-110"
                          : "text-white/20 group-hover:text-white/60",
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/40",
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
        <div className="px-6 py-4 mx-4 mb-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group hover:bg-emerald-500/10 transition-colors">
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            <CheckCircle className="w-3 h-3" /> Activated
          </div>
          <p className="text-[11px] text-white/80 font-bold uppercase tracking-wide leading-relaxed">
            Approved for Active Vault Access
          </p>
        </div>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
            <div className="relative group">
              <UserAvatar
                identifier={user?.id || user?.email || "guest"}
                src={user?.profileImage}
                size={36}
                className="font-bold uppercase text-sm border-2 border-white/10 group-hover:border-emerald-500/50 transition-colors"
              />
              {user?.kycStatus === "VERIFIED" && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-muted flex items-center justify-center shadow-lg">
                  <Shield className="w-2.5 h-2.5 text-black" strokeWidth={4} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-white truncate">
                {user?.name || "Freelancer"}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-tighter text-white/30 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href="/freelancer/settings" className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-full text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all"
              >
                <Settings className="w-3.5 h-3.5 mr-2 opacity-50" />
                Settings
              </Button>
              {(user?.kycStatus === "NONE" ||
                user?.kycStatus === "REJECTED") && (
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
              className="h-10 text-[10px] font-black uppercase tracking-widest border-red-500/10 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20 text-red-500 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-muted border-b border-white/5 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-black uppercase italic tracking-widest">
            Dayle
          </h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
