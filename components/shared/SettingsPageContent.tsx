"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  CreditCard,
  Lock,
  Bell,
  LogOut,
  Shield,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  MessageSquare,
  Phone,
  Landmark,
  Building,
} from "lucide-react";
import { useUser } from "@/lib/store/user-context";
import { useLedger } from "@/lib/store/ledger-context";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/shared/UserAvatar";
import { api } from "@/lib/api-client";
import { useMfaEnrollment } from "@privy-io/react-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Zap } from "lucide-react";

export default function SettingsPageContent({ role = "client" }) {
  const router = useRouter();
  const { user, logout, refreshUser } = useUser();
  const { balance } = useLedger();
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAddingBillingMethod, setIsAddingBillingMethod] = useState(false);
  const [selectedBillingMethod, setSelectedBillingMethod] = useState<string | null>(null);
  const [billingStep, setBillingStep] = useState<"SELECTION" | "CARD" | "BANK">("SELECTION");
  const [billingSubStep, setBillingSubStep] = useState<"DETAILS" | "ADDRESS">("DETAILS");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Withdrawal Amount State
  const [showWithdrawAmountDialog, setShowWithdrawAmountDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Sync profile name when user context loads
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user]);

  // Notification center state
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await api.notifications.list();
      setNotificationList(data);
    };
    const fetchPaymentMethods = async () => {
      try {
        const data = await api.paymentMethods.list();
        setPaymentMethods(data);
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    fetchNotifications();
    fetchPaymentMethods();
  }, []);

  // Notification Preferences State
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSuccess, setPrefsSuccess] = useState("");

  // Telegram state
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  // WhatsApp state
  const [showWhatsAppFlow, setShowWhatsAppFlow] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [whatsappStep, setWhatsappStep] = useState(1); // 1: phone, 2: verify
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");

  // Billing Form States
  const [cardData, setCardData] = useState({ 
    number: "", 
    expiry: "", 
    cvv: "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria"
  });
  const [bankData, setBankData] = useState({ bankCode: "", accountNumber: "", accountName: "" });
  const [banksList, setBanksList] = useState<any[]>([]);
  const [resolvingBank, setResolvingBank] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [billingError, setBillingError] = useState("");
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  // Card brand detection helper
  const detectBrand = (number: string) => {
    const sanitized = number.replace(/\s+/g, "");
    if (/^4/.test(sanitized)) return "VISA";
    if (/^5[1-5]/.test(sanitized)) return "MASTERCARD";
    if (/^(506|507|650|501)/.test(sanitized)) return "VERVE";
    return null;
  };

  // Luhn algorithm for card validation
  const validateLuhn = (number: string) => {
    const sanitized = number.replace(/\s+/g, "");
    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  useEffect(() => {
    if (billingStep === "BANK" && banksList.length === 0) {
      api.paymentMethods.getBanks().then(setBanksList).catch(console.error);
    }
  }, [billingStep, banksList.length]);

  const handleResolveBank = async () => {
    if (bankData.accountNumber.length === 10 && bankData.bankCode) {
      setResolvingBank(true);
      try {
        const res = await api.paymentMethods.resolveBank(bankData.bankCode, bankData.accountNumber);
        if (res && res.account_name) {
          setBankData(prev => ({ ...prev, accountName: res.account_name }));
        }
      } catch (err: any) {
        setBillingError("Could not resolve bank account. Please check details.");
      } finally {
        setResolvingBank(false);
      }
    }
  };

  const handleSaveCard = async () => {
    // 1. Validate billing address fields
    if (!cardData.addressLine1.trim() || !cardData.city.trim() || !cardData.country.trim()) {
      setBillingError("Please fill in all required billing address fields.");
      return;
    }

    setBillingError("");
    setIsSavingBilling(true);
    
    try {
      const expiryParts = cardData.expiry.split("/");
      const month = parseInt(expiryParts[0]);
      const year = parseInt(expiryParts[1]);
      const bin = cardData.number.replace(/\s+/g, "").slice(0, 6);

      // Authenticity Verification Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (bin.startsWith("000") || cardData.number.includes("000000")) {
        throw new Error("Card authorization failed. This card appears to be invalid or blocked by the issuer.");
      }
      if (cardData.cvv === "000") {
        throw new Error("Security code verification failed. Please check your CVC.");
      }

      // Save to backend (only masked data)
      await api.paymentMethods.addCard({
        brand: cardBrand || "CARD",
        last4: cardData.number.replace(/\s+/g, "").slice(-4),
        expiryMonth: month,
        expiryYear: year,
        firstName: cardData.firstName,
        lastName: cardData.lastName,
        addressLine1: cardData.addressLine1,
        addressLine2: cardData.addressLine2,
        city: cardData.city,
        state: cardData.state,
        postalCode: cardData.postalCode,
        country: cardData.country,
        isDefault: true
      });
      
      setIsAddingBillingMethod(false);
      setBillingStep("SELECTION");
      setBillingSubStep("DETAILS");
      setSelectedBillingMethod(null);
      setCardData({ number: "", expiry: "", cvv: "", firstName: user?.name?.split(" ")[0] || "", lastName: user?.name?.split(" ").slice(1).join(" ") || "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "Nigeria" });
      setCardBrand(null);
      
      // Refresh local list
      const updated = await api.paymentMethods.list();
      setPaymentMethods(updated);
      setBillingError("");
    } catch (err: any) {
      setBillingError(err.message || "Failed to verify payment method. Please try another card.");
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankData.accountName) {
      setBillingError("Please resolve the bank account first.");
      return;
    }
    setIsSavingBilling(true);
    try {
      const selectedBank = banksList.find(b => b.code === bankData.bankCode);
      await api.paymentMethods.addBank({
        accountName: bankData.accountName,
        accountNumber: `••••${bankData.accountNumber.slice(-4)}`,
        bankName: selectedBank?.name || "Bank",
        bankCode: bankData.bankCode,
        isDefault: true
      });
      setIsAddingBillingMethod(false);
      setBillingStep("SELECTION");
      setSelectedBillingMethod(null);
      // Refresh local list
      const updated = await api.paymentMethods.list();
      setPaymentMethods(updated);
    } catch (err: any) {
      setBillingError(err.message || "Failed to save bank account.");
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await api.paymentMethods.remove(id);
      setPaymentMethods((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete payment method", err);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await api.paymentMethods.setDefault(id);
      setPaymentMethods((prev) =>
        prev.map((item) => ({ ...item, isDefault: String(item.id) === String(id) })),
      );
    } catch (err) {
      console.error("Failed to set default payment method", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string | null;
      try {
        // In a real app, you'd upload to S3/Cloudinary.
        // Here we use the mock API which perists to localStorage.
        if (base64String)
          await api.auth.updateProfile({ profileImage: base64String });
        await refreshUser();
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      await api.auth.updateProfile({ name: profileName });
      await refreshUser();
      setProfileSuccess("Profile updated successfully");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setProfileError(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const setPercentage = (percent: number) => {
    const available = Number(balance?.formattedAvailable) || 0;
    const amount = (available * percent).toFixed(2);
    setWithdrawAmount(amount);
    setWithdrawError("");
  };

  const handleProceedToWithdrawal = () => {
    const amountNum = parseFloat(withdrawAmount);
    const available = Number(balance?.formattedAvailable) || 0;

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Please enter a valid amount");
      return;
    }
    if (amountNum > available) {
      setWithdrawError("Amount exceeds available balance");
      return;
    }

    router.push(`/withdraw?amount=${withdrawAmount}`);
  };

  const isClient = role === "client";

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setLoadingPrefs(true);
      try {
        const prefs = await api.notifications.getPreferences();
        setNotificationPrefs(prefs);
      } catch (error: any) {
        console.error("Failed to load notification preferences:", error);
        setPrefsError(error.message || "Failed to load preferences");
      } finally {
        setLoadingPrefs(false);
      }
    };
    if (activeTab === "channels") {
      loadPreferences();
    }
  }, [activeTab]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const getRelativeTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "kyc":
        return "amber";
      case "vault":
        return "emerald";
      case "payment":
        return "blue";
      case "security":
        return "red";
      case "general":
        return "zinc";
      default:
        return "zinc";
    }
  };

  const markAllAsRead = async () => {
    await api.notifications.markAllAsRead();
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
    await refreshUser();
  };

  const markAsRead = async (id: number) => {
    await api.notifications.markAsRead(id);
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await refreshUser();
  };

  // Notification Preferences Handlers
  const handleEmailToggle = async (enabled: boolean) => {
    setSavingPrefs(true);
    setPrefsError("");
    try {
      const updated = await api.notifications.updatePreferences({
        emailEnabled: enabled,
      });
      setNotificationPrefs(updated);
      setPrefsSuccess(
        "Email notifications " + (enabled ? "enabled" : "disabled"),
      );
      setTimeout(() => setPrefsSuccess(""), 3000);
    } catch (error: any) {
      setPrefsError(error.message || "Failed to update email preference");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleTelegramConnect = async () => {
    setLoadingTelegram(true);
    setPrefsError("");
    try {
      const { linkToken } = await api.telegram.getLinkToken();
      window.open(`https://t.me/DayleAIBot?start=${linkToken}`, "_blank");

      setTimeout(async () => {
        try {
          const result = await api.telegram.simulateConnect(
            `@user_${Math.random().toString(36).substr(2, 6)}`,
          );
          setNotificationPrefs(result.preferences);
          setPrefsSuccess("Telegram connected successfully!");
          setTimeout(() => setPrefsSuccess(""), 3000);
        } catch (error: any) {
          setPrefsError(error.message || "Failed to connect Telegram");
        }
        setLoadingTelegram(false);
      }, 3000);
    } catch (error: any) {
      setPrefsError(error.message || "Failed to generate Telegram link");
      setLoadingTelegram(false);
    }
  };

  const handleTelegramDisconnect = async () => {
    setLoadingTelegram(true);
    setPrefsError("");
    try {
      const result = await api.telegram.disconnect();
      setNotificationPrefs(result.preferences);
      setPrefsSuccess("Telegram disconnected");
      setTimeout(() => setPrefsSuccess(""), 3000);
    } catch (error: any) {
      setPrefsError(error.message || "Failed to disconnect Telegram");
    } finally {
      setLoadingTelegram(false);
    }
  };

  const handleWhatsAppStartVerification = async () => {
    setLoadingWhatsApp(true);
    setWhatsappError("");
    try {
      await api.whatsapp.startVerification(whatsappPhone);
      setWhatsappStep(2);
      setPrefsSuccess("Verification code sent! (Use 123456 for demo)");
      setTimeout(() => setPrefsSuccess(""), 5000);
    } catch (error: any) {
      setWhatsappError(error.message || "Failed to send verification code");
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleWhatsAppConfirmVerification = async () => {
    setLoadingWhatsApp(true);
    setWhatsappError("");
    try {
      const result = await api.whatsapp.confirmVerification(
        whatsappCode,
        whatsappConsent,
      );
      setNotificationPrefs(result.preferences);
      closeWhatsAppFlow();
      setPrefsSuccess("WhatsApp verified and enabled!");
      setTimeout(() => setPrefsSuccess(""), 3000);
    } catch (error: any) {
      setWhatsappError(error.message || "Failed to verify WhatsApp");
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleWhatsAppDisable = async () => {
    setLoadingWhatsApp(true);
    setPrefsError("");
    try {
      const result = await api.whatsapp.disable();
      setNotificationPrefs(result.preferences);
      setPrefsSuccess("WhatsApp disabled");
      setTimeout(() => setPrefsSuccess(""), 3000);
    } catch (error: any) {
      setPrefsError(error.message || "Failed to disable WhatsApp");
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const closeWhatsAppFlow = () => {
    setShowWhatsAppFlow(false);
    setWhatsappStep(1);
    setWhatsappPhone("");
    setWhatsappCode("");
    setWhatsappConsent(false);
    setWhatsappError("");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    {
      id: "payment",
      label: isClient ? "Billing & Payments" : "Payouts",
      icon: CreditCard,
    },
    { id: "channels", label: "Channels", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const unreadCount = notificationList.filter((n) => !n.read).length;
  const totalPages = Math.ceil(notificationList.length / itemsPerPage);
  const paginatedNotifications = notificationList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-emerald-500/30">
      {/* Minimalist Header */}
      <header className="border-b border-slate-200 py-4 px-6 bg-white/80 backdrop-blur-xl sticky top-0 w-full z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={isClient ? "/client" : "/freelancer"}
            className="flex items-center gap-2 group transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-900 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold  text-slate-900 group-hover:text-emerald-600">
              {isClient ? "Dashboard" : "Freelancer dashboard"}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900 ">
              Account center
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="relative group">
                <UserAvatar
                  identifier={user?.id || user?.email || "guest"}
                  src={user?.profileImage}
                  size={24}
                  className="h-6 w-6 rounded bg-emerald-50 border border-emerald-100"
                />
                {user?.kycStatus === "VERIFIED" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
                    <CheckCircle2
                      className="w-1.5 h-1.5 text-white"
                      strokeWidth={4}
                    />
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tighter ">
                Settings
              </h1>
              <p className="text-sm font-bold text-slate-600  mt-2">
                {isClient
                  ? "Manage account preferences"
                  : "Manage freelancer preferences"}
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold  relative group",
                    activeTab === tab.id
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />
                  )}
                  <tab.icon
                    className={cn(
                      "w-4 h-4",
                      activeTab === tab.id
                        ? "text-emerald-600"
                        : "text-slate-600 group-hover:text-slate-600",
                    )}
                  />
                  {tab.label}
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 bg-emerald-100 text-emerald-700  font-bold rounded-full border border-emerald-200">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 text-sm font-bold  text-slate-600 hover:text-red-600 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>

          {/* Main Content: Focused Cards */}
          <section className="flex-1 max-w-2xl">
            {/* Profile Section */}
            {activeTab === "profile" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-end gap-6">
                  <div className="relative group">
                    <UserAvatar
                      identifier={user?.id || user?.email || "guest"}
                      src={user?.profileImage}
                      size={80}
                      className="h-20 w-20 rounded-2xl bg-white border border-slate-200 shadow-sm"
                    />
                    {user?.kycStatus === "VERIFIED" && (
                      <div className="absolute -top-2 -right-2 bg-emerald-50 border border-emerald-100 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600"
                          strokeWidth={3}
                        />
                        <span className=" font-bold tracking-tighter text-emerald-700">
                          Verified
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 transition-colors shadow-sm"
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
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight ">
                      {isClient ? "Profile picture" : "Freelancer profile"}
                    </h3>
                    <p className="text-sm font-bold text-slate-600  mt-1">
                      PNG, JPG or GIF up to 10MB
                    </p>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-sm text-emerald-700 font-bold ">
                      {profileSuccess}
                    </p>
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-700 font-bold ">
                      {profileError}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-900  ml-1">
                      {isClient ? "Full name" : "Public name"}
                    </Label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500/30 h-11 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-900  ml-1">
                      Email address
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      readOnly
                      className="bg-slate-50 border-slate-200 text-slate-600 focus:ring-1 focus:ring-emerald-500/30 h-11 cursor-not-allowed opacity-70 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-bold text-slate-900  ml-1">
                      {isClient ? "Company" : "Professional bio"}
                    </Label>
                    <Input
                      defaultValue={""}
                      className="bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500/30 h-11 shadow-sm"
                      placeholder={
                        isClient ? "Add your company name" : "Add a short bio"
                      }
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-lg transition-all shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed "
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {activeTab === "payment" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {isClient && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upwork-style Balance Card */}
                    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-600 tracking-widest uppercase">
                            Available items to withdraw
                          </h4>
                          <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">
                            ${(Number(balance?.formattedAvailable) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h2>
                        </div>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
                          disabled={!balance?.formattedAvailable || Number(balance.formattedAvailable) <= 0}
                          onClick={() => {
                            setWithdrawAmount("");
                            setWithdrawError("");
                            setShowWithdrawAmountDialog(true);
                          }}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-sm border-dashed flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-slate-600 mb-2">
                        Billing cycle
                      </h4>
                      <p className="text-sm font-bold text-slate-900">
                        Monthly billing
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                        Next invoice: April 1, 2026
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900  ">
                      {isAddingBillingMethod ? "Add a billing method" : (isClient ? "Billing methods" : "Settlement methods")}
                    </h3>
                    {!isAddingBillingMethod && (
                      <Button
                        variant="link"
                        className="text-emerald-600 text-sm font-bold  p-0 h-auto hover:text-emerald-700"
                      >
                        {isClient ? "View invoices" : "View statements"}
                      </Button>
                    )}
                    {isAddingBillingMethod && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingBillingMethod(false)}
                        className="h-8 px-4 border-slate-200 text-emerald-600 hover:text-emerald-700 font-bold rounded-lg"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  {isAddingBillingMethod ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {billingStep === "SELECTION" && (
                        <div className="space-y-4">
                          <div 
                            className={cn(
                              "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all group",
                              selectedBillingMethod === "card" ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 hover:border-emerald-500/30"
                            )}
                            onClick={() => setSelectedBillingMethod("card")}
                          >
                            <div className="relative flex items-center justify-center">
                               <div className={cn(
                                 "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                                 selectedBillingMethod === "card" ? "border-emerald-500" : "border-slate-300"
                               )}>
                                 {selectedBillingMethod === "card" && (
                                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                 )}
                               </div>
                            </div>
                            
                            <span className="text-sm font-bold text-slate-900 flex-1">
                              Debit or credit card
                            </span>

                            <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                              <Image src="/visa.svg" alt="Visa" width={40} height={12} className="h-3 w-auto object-contain" />
                              <Image src="/mastercard.svg" alt="Mastercard" width={32} height={20} className="h-5 w-auto object-contain" />
                              <Image src="/verve.svg" alt="Verve" width={32} height={20} className="h-5 w-auto object-contain" />
                            </div>
                          </div>

                          <div 
                            className={cn(
                              "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all group",
                              selectedBillingMethod === "bank" ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 hover:border-emerald-500/30"
                            )}
                            onClick={() => setSelectedBillingMethod("bank")}
                          >
                            <div className="relative flex items-center justify-center">
                               <div className={cn(
                                 "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                                 selectedBillingMethod === "bank" ? "border-emerald-500" : "border-slate-300"
                               )}>
                                 {selectedBillingMethod === "bank" && (
                                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                 )}
                               </div>
                            </div>
                            
                            <span className="text-sm font-bold text-slate-900 flex-1">
                              Bank Transfer
                            </span>

                            <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all text-slate-400">
                              <Building className="w-5 h-5" />
                              <Landmark className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                            <Button 
                              disabled={!selectedBillingMethod}
                              onClick={() => setBillingStep(selectedBillingMethod === "card" ? "CARD" : "BANK")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-11 rounded-xl shadow-lg shadow-emerald-600/10"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      )}

                      {billingStep === "CARD" && (
                        <div className="space-y-5">
                          {/* Header Bar */}
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (billingSubStep === "ADDRESS") {
                                  setBillingSubStep("DETAILS");
                                  setBillingError("");
                                } else {
                                  setBillingStep("SELECTION");
                                  setBillingSubStep("DETAILS");
                                  setBillingError("");
                                }
                              }}
                              className="p-0 h-auto hover:bg-transparent text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              {billingSubStep === "ADDRESS" ? "Card Details" : "Change Method"}
                            </Button>
                            <div className="flex items-center gap-2">
                              {/* Step Indicator */}
                              <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-6 rounded-full transition-colors ${billingSubStep === "DETAILS" ? "bg-emerald-500" : "bg-slate-200"}`} />
                                <div className={`h-1.5 w-6 rounded-full transition-colors ${billingSubStep === "ADDRESS" ? "bg-emerald-500" : "bg-slate-200"}`} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                PCI-DSS
                              </div>
                            </div>
                          </div>

                          <div className="max-w-md overflow-hidden">
                            {/* Supported Logos Row */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">We accept</span>
                              <Image src="/visa.svg" alt="Visa" width={40} height={14} className="h-3.5 w-auto opacity-80" />
                              <Image src="/mastercard.svg" alt="Mastercard" width={30} height={18} className="h-4.5 w-auto opacity-80" />
                              <Image src="/verve.svg" alt="Verve" width={30} height={18} className="h-4.5 w-auto opacity-80" />
                            </div>

                            {/* Two-step slider container */}
                            <div className="relative overflow-hidden">
                              <div
                                className="flex transition-transform duration-400 ease-in-out"
                                style={{ transform: billingSubStep === "ADDRESS" ? "translateX(-100%)" : "translateX(0%)" }}
                              >
                                {/* ── STEP 1: Card Details ── */}
                                <div className="w-full shrink-0 space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                                  {/* Name Row */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</Label>
                                      <Input
                                        placeholder="John"
                                        autoComplete="cc-given-name"
                                        value={cardData.firstName}
                                        onChange={(e) => setCardData({...cardData, firstName: e.target.value})}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</Label>
                                      <Input
                                        placeholder="Doe"
                                        autoComplete="cc-family-name"
                                        value={cardData.lastName}
                                        onChange={(e) => setCardData({...cardData, lastName: e.target.value})}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                                      />
                                    </div>
                                  </div>

                                  {/* Unified Card Input */}
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Details</Label>
                                    <div className="group relative">
                                      <div className="relative overflow-hidden bg-slate-50 border border-slate-200 group-within:border-emerald-500/50 group-within:ring-4 group-within:ring-emerald-500/5 rounded-2xl transition-all duration-300">
                                        <div className="relative">
                                          <Input
                                            placeholder="0000 0000 0000 0000"
                                            autoComplete="cc-number"
                                            inputMode="numeric"
                                            value={cardData.number}
                                            onChange={(e) => {
                                              const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                              setCardData({...cardData, number: val});
                                              setCardBrand(detectBrand(val));
                                            }}
                                            className="h-14 bg-transparent border-0 focus:ring-0 rounded-none font-mono text-xl tracking-wider placeholder:text-slate-300 pl-4"
                                          />
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {cardBrand === "VISA" && <Image src="/visa.svg" alt="Visa" width={48} height={16} className="h-4 w-auto drop-shadow-sm" />}
                                            {cardBrand === "MASTERCARD" && <Image src="/mastercard.svg" alt="Mastercard" width={40} height={24} className="h-6 w-auto drop-shadow-sm" />}
                                            {cardBrand === "VERVE" && <Image src="/verve.svg" alt="Verve" width={40} height={24} className="h-6 w-auto drop-shadow-sm" />}
                                            {!cardBrand && <CreditCard className="w-6 h-6 text-slate-300" />}
                                          </div>
                                        </div>
                                        <div className="flex border-t border-slate-200 group-within:border-emerald-500/30">
                                          <div className="flex-1 relative">
                                            <Input
                                              placeholder="MM/YY"
                                              autoComplete="cc-exp"
                                              inputMode="numeric"
                                              value={cardData.expiry}
                                              onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                                                setCardData({...cardData, expiry: val});
                                              }}
                                              maxLength={5}
                                              className="h-12 bg-transparent border-0 focus:ring-0 rounded-none text-center font-mono tracking-widest placeholder:text-slate-300"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">EXP</div>
                                          </div>
                                          <div className="w-px bg-slate-200 group-within:bg-emerald-500/30" />
                                          <div className="flex-1 relative">
                                            <Input
                                              placeholder="123"
                                              type="password"
                                              autoComplete="cc-csc"
                                              inputMode="numeric"
                                              value={cardData.cvv}
                                              onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0,3)})}
                                              maxLength={3}
                                              className="h-12 bg-transparent border-0 focus:ring-0 rounded-none text-center font-mono tracking-widest placeholder:text-slate-300"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">CVV</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => {
                                      // Validate step 1
                                      if (!cardData.firstName.trim() || !cardData.lastName.trim()) {
                                        setBillingError("Please enter your full name as it appears on the card.");
                                        return;
                                      }
                                      if (!validateLuhn(cardData.number)) {
                                        setBillingError("Invalid card number.");
                                        return;
                                      }
                                      if (cardData.expiry.length < 5) {
                                        setBillingError("Invalid expiry date (MM/YY).");
                                        return;
                                      }
                                      if (cardData.cvv.length < 3) {
                                        setBillingError("CVV must be 3 digits.");
                                        return;
                                      }
                                      setBillingError("");
                                      setBillingSubStep("ADDRESS");
                                    }}
                                    disabled={
                                      !cardData.firstName.trim() ||
                                      !cardData.lastName.trim() ||
                                      cardData.number.replace(/\s/g, "").length < 13 ||
                                      cardData.expiry.length < 5 ||
                                      cardData.cvv.length < 3
                                    }
                                    className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 group"
                                  >
                                    <div className="flex items-center gap-2">
                                      Continue to Billing Address
                                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </Button>

                                  {billingError && (
                                    <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                                      {billingError}
                                    </p>
                                  )}
                                </div>

                                {/* ── STEP 2: Billing Address ── */}
                                <div className="w-full shrink-0 space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 ml-4">
                                  <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Billing Address</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Required for card verification and fraud prevention.</p>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address Line 1 *</Label>
                                      <Input
                                        placeholder="123 Main Street"
                                        value={cardData.addressLine1}
                                        onChange={(e) => setCardData({...cardData, addressLine1: e.target.value})}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address Line 2 <span className="normal-case text-slate-300">(optional)</span></Label>
                                      <Input
                                        placeholder="Apt, Suite, etc."
                                        value={cardData.addressLine2}
                                        onChange={(e) => setCardData({...cardData, addressLine2: e.target.value})}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</Label>
                                        <Input
                                          placeholder="Lagos"
                                          value={cardData.city}
                                          onChange={(e) => setCardData({...cardData, city: e.target.value})}
                                          className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State / Province</Label>
                                        <Input
                                          placeholder="Lagos"
                                          value={cardData.state}
                                          onChange={(e) => setCardData({...cardData, state: e.target.value})}
                                          className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postal Code</Label>
                                        <Input
                                          placeholder="100001"
                                          value={cardData.postalCode}
                                          onChange={(e) => setCardData({...cardData, postalCode: e.target.value})}
                                          className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Country *</Label>
                                        <select
                                          value={cardData.country}
                                          onChange={(e) => setCardData({...cardData, country: e.target.value})}
                                          className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                                        >
                                          <option>Nigeria</option>
                                          <option>Ghana</option>
                                          <option>Kenya</option>
                                          <option>South Africa</option>
                                          <option>United States</option>
                                          <option>United Kingdom</option>
                                          <option>Canada</option>
                                          <option>Other</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  {billingError && (
                                    <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                                      {billingError}
                                    </p>
                                  )}

                                  <Button
                                    onClick={handleSaveCard}
                                    disabled={isSavingBilling || !cardData.addressLine1 || !cardData.city || !cardData.country}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/10 transition-all active:scale-95 disabled:opacity-50 group"
                                  >
                                    {isSavingBilling ? (
                                      <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Verifying & Saving...
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Save Payment Method
                                      </div>
                                    )}
                                  </Button>
                                  <p className="text-[11px] text-center text-slate-400 font-medium px-4">
                                    Your card and address are encrypted and securely stored.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {billingStep === "BANK" && (
                        <div className="space-y-6">
                           <div className="flex items-center gap-2 mb-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setBillingStep("SELECTION")}
                                className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-slate-700"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                              </Button>
                           </div>

                           <div className="space-y-4 max-w-md">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Select Bank</Label>
                                <select 
                                  value={bankData.bankCode}
                                  onChange={(e) => setBankData({...bankData, bankCode: e.target.value, accountName: ""})}
                                  className="w-full h-12 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 text-sm font-bold text-slate-900 appearance-none"
                                >
                                  <option value="">Select a bank</option>
                                  {banksList.map(bank => (
                                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Account Number</Label>
                                <div className="relative">
                                  <Input 
                                    placeholder="0123456789"
                                    value={bankData.accountNumber}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                      setBankData({...bankData, accountNumber: val, accountName: ""});
                                    }}
                                    onBlur={handleResolveBank}
                                    className="h-12 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-lg tracking-widest"
                                  />
                                  {resolvingBank && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {bankData.accountName && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                   <Label className="text-[10px] font-bold text-emerald-600 uppercase mb-1 block">Account Name</Label>
                                   <p className="text-sm font-bold text-slate-900">{bankData.accountName}</p>
                                </div>
                              )}

                              {billingError && (
                                <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 italic">
                                  {billingError}
                                </p>
                              )}

                              <Button 
                                onClick={handleSaveBank}
                                disabled={isSavingBilling || !bankData.accountName}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 mt-6"
                              >
                                {isSavingBilling ? "Saving..." : "Save Bank Account"}
                              </Button>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {paymentMethods.map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500/20 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-7 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                                {item.brand || (item.type === "BANK_TRANSFER" ? "BANK" : item.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900 tracking-tight ">
                                    {item.type === "CARD" 
                                      ? `•••• ${item.last4}` 
                                      : `${item.bankName} (${item.accountNumber})`}
                                  </p>
                                  {item.isDefault && (
                                    <span className="text-sm px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-bold tracking-tight">
                                      Default
                                    </span>
                                  )}
                                </div>
                                {item.type === "CARD" && (
                                  <p className="text-[11px] font-bold text-slate-600  mt-0.5">
                                    Expires {item.expiryMonth}/{item.expiryYear}
                                  </p>
                                )}
                                {item.type === "BANK_TRANSFER" && (
                                  <p className="text-[11px] font-bold text-slate-600 mt-0.5 uppercase">
                                    {item.accountName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!item.isDefault && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleSetDefaultPaymentMethod(item.id)}
                                  className="text-slate-400 hover:text-emerald-600 text-[11px] font-bold"
                                >
                                  Set primary
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePaymentMethod(item.id)}
                                className="text-slate-300 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => setIsAddingBillingMethod(true)}
                        className="w-full py-7 bg-white border border-dashed border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all rounded-xl font-bold  text-sm shadow-sm group mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />{" "}
                        {isClient ? "Add a billing method" : "Add settlement method"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Channels Section */}
            {activeTab === "channels" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Header */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900  mb-1 ">
                    Notification channels
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Choose how you want to receive alerts
                  </p>
                </div>

                {/* Success/Error Messages */}
                {prefsSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-sm text-emerald-700 font-bold ">
                      {prefsSuccess}
                    </p>
                  </div>
                )}
                {prefsError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-700 font-bold ">
                      {prefsError}
                    </p>
                  </div>
                )}

                {loadingPrefs ? (
                  <div className="p-8 text-center text-slate-300">
                    <p className="text-sm">Loading preferences...</p>
                  </div>
                ) : (
                  notificationPrefs && (
                    <div className="space-y-4">
                      {/* In-App (Always On) */}
                      <div className="flex items-start justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex gap-4">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <Bell className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight ">
                              In-app notifications
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                              Receive notifications within the platform
                            </p>
                            <span className="inline-block text-sm px-2 py-1 rounded-full font-bold  bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Always enabled
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500/20 transition-all shadow-sm">
                        <div className="flex gap-4">
                          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight ">
                              Email notifications
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                              Get important updates via email
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="email-notifications"
                            checked={!!notificationPrefs.emailEnabled}
                            onCheckedChange={handleEmailToggle}
                            disabled={savingPrefs}
                            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-200"
                          />
                        </div>
                      </div>

                      {/* MFA Section */}
                      <div className="flex items-start justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-purple-500/20 transition-all shadow-sm">
                        <div className="flex gap-4">
                          <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight ">
                              Transaction security (MFA)
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                              Require verification for high-value transactions
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => showMfaEnrollmentModal()}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 text-sm rounded-lg shadow-md shadow-purple-600/10 "
                        >
                          Manage MFA
                        </Button>
                      </div>

                      {/* Telegram */}
                      <div className="flex items-start justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/20 transition-all shadow-sm">
                        <div className="flex gap-4 flex-1">
                          <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-sky-600" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight ">
                              Telegram
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                              Instant alerts via Telegram bot
                            </p>
                            {notificationPrefs.telegram.connected && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm px-2 py-1 rounded-full font-bold  bg-emerald-50 text-emerald-700 border border-emerald-100 ">
                                  Connected
                                </span>
                                <span className="text-sm text-slate-600 font-bold ">
                                  {notificationPrefs.telegram.username}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          {!notificationPrefs.telegram.connected ? (
                            <Button
                              onClick={handleTelegramConnect}
                              disabled={loadingTelegram}
                              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 text-sm rounded-lg shadow-md shadow-sky-600/10 "
                            >
                              {loadingTelegram ? "Connecting..." : "Connect"}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleTelegramDisconnect}
                              disabled={loadingTelegram}
                              variant="outline"
                              className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold px-4 text-sm "
                            >
                              {loadingTelegram
                                ? "Disconnecting..."
                                : "Disconnect"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="p-5 bg-white border border-slate-200 rounded-xl hover:border-green-500/20 transition-all shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4 flex-1">
                            <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 tracking-tight ">
                                WhatsApp
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                Receive alerts via WhatsApp messages
                              </p>
                              {notificationPrefs.whatsapp.phoneVerified && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm px-2 py-1 rounded-full font-bold  bg-emerald-50 text-emerald-700 border border-emerald-100 ">
                                    Verified
                                  </span>
                                  <span className="text-sm text-slate-600 font-bold ">
                                    {notificationPrefs.whatsapp.phoneE164}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {!notificationPrefs.whatsapp.phoneVerified ? (
                              <Button
                                onClick={() => setShowWhatsAppFlow(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 text-sm rounded-lg shadow-md shadow-green-600/10 "
                              >
                                {loadingWhatsApp ? "Verifying..." : "Verify"}
                              </Button>
                            ) : (
                              <Button
                                onClick={handleWhatsAppDisable}
                                disabled={loadingWhatsApp}
                                variant="outline"
                                className="border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 font-bold px-4 text-sm "
                              >
                                {loadingWhatsApp ? "Disabling..." : "Disable"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quiet Hours Info */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 mb-1 ">
                              Quiet Hours
                            </h5>
                            <p className="text-sm text-slate-600 leading-relaxed font-bold">
                              Customize notification schedules and quiet hours.{" "}
                              <span className="text-amber-600 font-bold ">
                                Coming in v2
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-slate-900  ">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full border border-emerald-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1 font-bold">
                      {isClient
                        ? "Stay updated on your account activity"
                        : "Stay updated on your work progress"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      onClick={markAllAsRead}
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold  text-sm "
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
                          "group p-4 border rounded-xl transition-all cursor-pointer shadow-sm",
                          notification.read
                            ? "bg-white border-slate-100 hover:border-slate-200"
                            : "bg-white border-emerald-100 hover:border-emerald-200 ring-1 ring-emerald-50",
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
                          <div
                            className={cn(
                              "p-2 rounded-lg shrink-0",
                              color === "amber" &&
                                "bg-amber-50 border border-amber-100",
                              color === "emerald" &&
                                "bg-emerald-50 border border-emerald-100",
                              color === "blue" &&
                                "bg-blue-50 border border-blue-100",
                              color === "red" &&
                                "bg-red-50 border border-red-100",
                              color === "zinc" &&
                                "bg-slate-50 border border-slate-100",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4",
                                color === "amber" && "text-amber-600",
                                color === "emerald" && "text-emerald-600",
                                color === "blue" && "text-blue-600",
                                color === "red" && "text-red-600",
                                color === "zinc" && "text-slate-600",
                              )}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={cn(
                                      "text-sm font-bold tracking-tight ",
                                      notification.read
                                        ? "text-slate-600"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-sm shadow-emerald-500/50"></span>
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-sm mt-1 font-bold",
                                    notification.read
                                      ? "text-slate-600"
                                      : "text-slate-600",
                                  )}
                                >
                                  {notification.message}
                                </p>
                                <p className=" text-slate-600 mt-2 font-bold  ">
                                  {getRelativeTime(notification.timestamp)}
                                </p>
                              </div>
                              {notification.action && !notification.read && (
                                <Link
                                  href={notification.action}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    size="sm"
                                    className={cn(
                                      "font-bold   h-7 px-3 shrink-0 ",
                                      color === "amber" &&
                                        "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-sm",
                                    )}
                                  >
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
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 font-bold  ">
                      Showing {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(
                        currentPage * itemsPerPage,
                        notificationList.length,
                      )}{" "}
                      of {notificationList.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  disabled:opacity-30 shadow-sm "
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                              currentPage === page
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:bg-slate-100",
                            )}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  disabled:opacity-30 shadow-sm "
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

      {/* WhatsApp Setup Modal */}
      {showWhatsAppFlow && !notificationPrefs?.whatsapp?.phoneVerified && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={closeWhatsAppFlow}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-600 hover:text-slate-900" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6 ">
              Add WhatsApp number
            </h2>

            <div className="space-y-6">
              {whatsappStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-900  ml-1">
                      Phone number (E.164 format)
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-green-500/30 h-11 shadow-sm"
                    />
                    <p className="text-sm text-slate-600  font-bold ">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>

                  {whatsappError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{whatsappError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={closeWhatsAppFlow}
                      variant="outline"
                      className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold  "
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWhatsAppStartVerification}
                      disabled={loadingWhatsApp || !whatsappPhone}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold  shadow-md shadow-green-600/10 "
                    >
                      {loadingWhatsApp ? "Sending..." : "Send code"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-900  ml-1">
                        Verification code
                      </Label>
                      <Input
                        type="text"
                        placeholder="123456"
                        value={whatsappCode}
                        onChange={(e) =>
                          setWhatsappCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        className="bg-white border-slate-200 text-slate-900 text-center text-2xl  tracking-[0.5em] h-14 shadow-sm"
                        maxLength={6}
                      />
                      <p className="text-sm text-slate-600 text-center  font-bold ">
                        Enter the 6-digit code sent to your phone
                      </p>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          id="whatsapp-consent-modal"
                          checked={whatsappConsent}
                          onChange={(e) => setWhatsappConsent(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 bg-white text-green-600 focus:ring-green-500 focus:ring-offset-0 transition-colors"
                        />
                      </div>
                      <label
                        htmlFor="whatsapp-consent-modal"
                        className="text-sm text-slate-600 leading-relaxed font-bold tracking-tight "
                      >
                        I agree to receive WhatsApp alerts for vault activity.
                        Reply STOP to opt out.
                      </label>
                    </div>
                  </div>

                  {whatsappError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{whatsappError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setWhatsappStep(1);
                        setWhatsappCode("");
                        setWhatsappConsent(false);
                        setWhatsappError("");
                      }}
                      variant="outline"
                      className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold  "
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleWhatsAppConfirmVerification}
                      disabled={
                        loadingWhatsApp ||
                        whatsappCode.length !== 6 ||
                        !whatsappConsent
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold  shadow-md shadow-green-600/10 "
                    >
                      {loadingWhatsApp ? "Verifying..." : "Verify & enable"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Amount Selection Dialog */}
      <Dialog open={showWithdrawAmountDialog} onOpenChange={setShowWithdrawAmountDialog}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
          
          <DialogHeader className="relative z-10 space-y-3">
            <div className="space-y-1.5 mb-6 text-center">
              <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tighter">
                Withdrawal amount
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                Specify how much you want to transfer
              </p>
            </div>
          </DialogHeader>

          <div className="mt-8 space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                    Available Balance
                  </label>
                  <p className="text-2xl font-bold text-slate-900">
                    ${(Number(balance?.formattedAvailable) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setWithdrawError("");
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-full h-14 bg-white border rounded-xl pl-10 pr-4 text-lg font-bold tabular-nums text-slate-900 outline-none transition-all placeholder:text-slate-300",
                      withdrawError ? "border-red-500/50 bg-red-50" : "border-slate-200 focus:border-emerald-500/30 focus:bg-white focus:shadow-sm"
                    )}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-bold text-slate-500">
                  AVAILABLE LIMIT: <span className="text-emerald-600 ml-1">${(Number(balance?.formattedAvailable) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </p>
                {withdrawError && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                    {withdrawError}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Select percentage chips */}
            <div className="flex gap-2">
              {[0.25, 0.5, 1.0].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setPercentage(percent)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95"
                >
                  {percent === 1.0 ? "MAX" : `${percent * 100}%`}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-10 sm:justify-start gap-3 relative z-10">
            <Button
              onClick={() => setShowWithdrawAmountDialog(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToWithdrawal}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > Number(balance?.formattedAvailable)}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
            >
              Proceed to Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
