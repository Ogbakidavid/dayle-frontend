"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/contexts/socket-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, CreditCard, Shield, Lock } from "lucide-react";
import React from "react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "kyc":
      return Shield;
    case "vault":
      return CheckCircle2;
    case "payment":
      return CreditCard;
    case "security":
      return Lock;
    case "general":
      return Bell;
    default:
      return Bell;
  }
};

import { useNotifications } from "@/lib/store/notification-context";

export function RealTimeNotificationListener() {
  const { socket } = useSocket();
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data: any) => {
      const Icon = getNotificationIcon(data.type);
      
      toast(data.title, {
        description: data.message,
        icon: <Icon className="w-4 h-4" />,
        action: data.action ? {
          label: "View",
          onClick: () => router.push(data.action)
        } : undefined,
      });

      // Update local state in store
      addNotification(data);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket, router]);

  return null;
}
