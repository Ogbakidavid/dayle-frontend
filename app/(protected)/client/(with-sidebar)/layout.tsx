"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LayoutDashboard,
  Plus,
  LogOut,
  Settings,
  PieChart,
  Lock,
  Gavel,
  Menu,
} from "lucide-react";
import { useUser } from "@/lib/store/user-context";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import UserAvatar from "@/components/shared/UserAvatar";

const sidebarVariants: Variants = {
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
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge: string | null;
}

const navigation: NavItem[] = [
  { name: "Overview", href: "/client", icon: LayoutDashboard, badge: null },
  { name: "Projects", href: "/client/vaults", icon: Lock, badge: null },
  {
    name: "New Project",
    href: "/client/create-vault",
    icon: Plus,
    badge: null,
  },
  {
    name: "Transaction History",
    href: "/client/ledger",
    icon: PieChart,
    badge: null,
  },
  { name: "Disputes", href: "/client/disputes", icon: Gavel, badge: null },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Professional Dark Theme */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={cn(
          "w-[280px] border-r border-slate-200 bg-slate-50 flex flex-col h-screen transition-transform duration-300 ease-in-out",
          "fixed lg:sticky top-0 z-50 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo & Brand */}
        <div className="p-6 pb-4">
          <Link
            href="/client"
            className="flex items-center gap-3 group font-['Poppins',sans-serif]"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl text-slate-900 tracking-tight font-bold">
                Dayle
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 font-['Poppins',sans-serif]">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  variants={itemVariants}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold tracking-wide"
                      : "text-slate-900 hover:bg-slate-100 hover:text-slate-900 font-bold tracking-wide",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-colors font-bold",
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-900 group-hover:text-slate-900 font-bold",
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-sm px-2 py-0.5 rounded-full font-medium",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-700 font-bold"
                          : "bg-slate-100 text-slate-600 font-bold",
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

        <div className="p-4 border-t border-slate-200 mt-auto font-['Poppins',sans-serif]">
          <div className="flex items-center gap-3 p-3 rounded-lg">
            <div className="relative group">
              <UserAvatar
                identifier={user?.id || user?.email || "guest"}
                src={user?.profileImage}
                size={36}
                className="font-medium text-sm border border-slate-200"
              />
              {user?.kycStatus === "VERIFIED" && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-muted flex items-center justify-center">
                  <Shield className="w-2 h-2 text-black" strokeWidth={4} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-slate-900">
                {user?.name}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href="/client/settings" className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full text-sm font-bold tracking-wide border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all font-['Poppins',sans-serif] shadow-sm"
              >
                <Settings className="w-3.5 h-3.5 mr-2" />
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
              className="h-9 text-sm font-bold tracking-wide border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all font-['Poppins',sans-serif] shadow-sm"
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
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-900 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold font-['Poppins',sans-serif]">
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
