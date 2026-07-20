"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  CalendarDays, 
  Users, 
  Bed, 
  IndianRupee, 
  LogOut, 
  FileBarChart2, 
  Search, 
  Settings, 
  UserCog, 
  Database,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { getDashboardStats } from "@/app/actions";
import { useLanguage } from "@/hooks/useLanguage";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    total: 24650,
    cash: 14300,
    upi: 10350
  });

  // Load stats once on mount — no polling to prevent memory leaks.
  // Stats refresh naturally on full page navigation (server-side revalidation).
  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        if (!cancelled) {
          setStats({
            total: data.stats.todayCollection,
            cash: data.stats.cashCollection,
            upi: data.stats.upiCollection
          });
        }
      } catch {
        // Fallback to default values already in state
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, [pathname]); // Refresh stats on every pathname change

  // Mobile viewport detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", translationKey: "dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Booking", translationKey: "newBooking", href: "/bookings/new", icon: PlusCircle },
    { name: "Active Stays", translationKey: "bookings", href: "/bookings", icon: CalendarDays },
    { name: "Guest Directory", translationKey: "guests", href: "/guests", icon: Users },
    { name: "Rooms List", translationKey: "rooms", href: "/rooms", icon: Bed },
    { name: "Payment Logs", translationKey: "payments", href: "/payments", icon: IndianRupee },
    { name: "Check Out", translationKey: "checkout", href: "/checkout", icon: LogOut },
    { name: "Reports", translationKey: "reports", href: "/reports", icon: FileBarChart2 },
    { name: "Search", translationKey: "searchPlaceholder", href: "/search", icon: Search },
    { name: "Settings", translationKey: "settings", href: "/settings", icon: Settings },
    { name: "Users", translationKey: "users", href: "/users", icon: UserCog },
    { name: "Backup", translationKey: "backup", href: "/backup", icon: Database },
  ];

  return (
    // overflow-visible so the toggle button circle isn't clipped by the sidebar boundary
    <aside 
      className="bg-dark-brown text-white h-screen flex flex-col justify-between z-30 fixed left-0 top-0 pt-[70px] border-r border-dark-brown-light no-print overflow-visible"
      style={{
        width: isMobile ? (collapsed ? "0px" : "240px") : (collapsed ? "70px" : "240px"),
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Sidebar Collapse Toggle — always fully visible, sits outside clip region */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[85px] -right-[14px] bg-brand-orange text-white rounded-full p-1.5 border-2 border-white hover:bg-brand-orange-hover shadow-lg transition-colors cursor-pointer z-50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Navigation Links — own scrollable region */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (isMobile) setCollapsed(true); // auto close on click on mobile
              }}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" 
                  : "text-gray-300 hover:bg-dark-brown-light hover:text-white"
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
              {(!collapsed || (isMobile && !collapsed)) && <span className="truncate">{t(item.translationKey)}</span>}
            </Link>
          );
        })}
      </div>

      {/* Today's Collection Widget */}
      {(!collapsed || (isMobile && !collapsed)) && (
        <div className="p-4 mx-3 mb-6 bg-dark-brown-light rounded-xl border border-gray-800 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-green-400 font-semibold mb-1">
            <span>{t("todaysCollection")}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          </div>
          <div className="text-xl font-bold text-white mb-3">
            ₹ {stats.total.toLocaleString("en-IN")}
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Cash:</span>
              <span className="text-white font-medium">₹ {stats.cash.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>UPI:</span>
              <span className="text-white font-medium">₹ {stats.upi.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
