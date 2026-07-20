"use client";

import { useEffect, useState } from "react";
import { Printer, Bell, ChevronDown, User, ShieldAlert, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBookings } from "@/app/actions";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function Header() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [userDropdown, setUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeStaysEnding, setActiveStaysEnding] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState({
    name: "Reception Desk",
    role: "RECEPTION",
    building: "Kalyani Guest House",
    username: "kalyani_reception"
  });

  // Load user session from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : "";
    };
    
    const username = getCookie("guesthouse_username");
    const role = getCookie("guesthouse_role");
    const building = getCookie("guesthouse_building");
    const name = getCookie("guesthouse_name");
    
    if (username) {
      setActiveUser({
        name: name || (role === "ADMIN" ? "Office Administrator" : "Reception Desk"),
        role: role || "RECEPTION",
        building: building || "Kalyani Guest House",
        username: username
      });
    }
  }, []);

  // Fetch active stays ending soon
  useEffect(() => {
    async function loadNotifications() {
      try {
        const bookingsList = await getBookings();
        const now = new Date();
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const soon = bookingsList.filter((b: any) => {
          if (b.status !== "ACTIVE") return false;
          const checkoutTime = new Date(b.checkOutDate);
          
          const diffMs = checkoutTime.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          // Checkout is within 4 hours (including past due checkouts) OR checks out before end of today
          return diffHours <= 4 || checkoutTime <= endOfToday;
        });

        setActiveStaysEnding(soon);
      } catch (err) {
        console.error("Failed to load ending bookings for notifications:", err);
      }
    }

    loadNotifications();
    // Poll every 45 seconds to keep notification badge fresh
    const timer = setInterval(loadNotifications, 45000);
    return () => clearInterval(timer);
  }, []);

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      };
      setTime(now.toLocaleString("en-IN", options).replace(/,/g, " |"));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="bg-brand-orange text-white h-[70px] fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 shadow-md no-print">
      {/* Branding */}
      <div className="flex items-center gap-3">
        {/* Visual Logo (Sri Shivakumara Swamiji) */}
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-brand-orange-light shadow-inner overflow-hidden">
          <img 
            src="/swami-senior.jpg" 
            alt="Sri Shivakumara Swamiji" 
            className="w-full h-full object-cover object-top scale-110"
          />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide leading-none">{t("templeName")}</h1>
          <p className="text-xs text-orange-100 font-medium">
            {activeUser.building === "Yathri Nivasa"
              ? (language === "kn" ? "ಯಾತ್ರಿ ನಿವಾಸ" : "Yathri Nivasa")
              : t("guestHouseName")}
          </p>
        </div>
      </div>

      {/* Clock, Shortcuts & User Controls */}
      <div className="flex items-center gap-6">
        {/* Real-time Clock */}
        <div className="hidden md:block text-sm font-semibold tracking-wider text-orange-50 bg-brand-orange-hover/30 px-3 py-1.5 rounded-lg">
          {time || "Loading time..."}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} 
            title="Receipt Print Shortcut"
            className="p-2 hover:bg-brand-orange-hover rounded-lg transition-colors cursor-pointer"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={() => setShowNotifications(true)}
            title="Stays Ending Soon"
            className="p-2 hover:bg-brand-orange-hover rounded-lg transition-colors relative cursor-pointer"
          >
            <Bell size={20} />
            {activeStaysEnding.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center border border-brand-orange shadow-sm animate-pulse">
                {activeStaysEnding.length}
              </span>
            )}
          </button>
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2.5 bg-brand-orange-hover/40 px-3 py-1.5 rounded-xl hover:bg-brand-orange-hover transition-all border border-orange-400/20"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-brand-orange font-bold text-sm">
              R
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-none">{activeUser.name}</div>
              <div className="text-[10px] text-orange-200 uppercase font-semibold mt-0.5">{activeUser.role}</div>
            </div>
            <ChevronDown size={14} className="text-orange-200" />
          </button>

          {/* Dropdown Menu */}
          {userDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setUserDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold truncate">{activeUser.name}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveUser({
                      name: "Office Administrator",
                      role: "ADMIN",
                      building: activeUser.building,
                      username: "admin"
                    });
                    setUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                >
                  <User size={16} className="text-gray-400" />
                  Switch to Admin
                </button>
                <button
                  onClick={() => {
                    setActiveUser({
                      name: "Reception Desk",
                      role: "RECEPTION",
                      building: activeUser.building,
                      username: "reception"
                    });
                    setUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                >
                  <ShieldAlert size={16} className="text-gray-400" />
                  Switch to Reception
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setShowNotifications(false)}
          />
          {/* Side Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-white shadow-2xl z-50 text-gray-850 flex flex-col animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-dark-brown text-white">
              <div>
                <h3 className="font-extrabold text-xs tracking-wide uppercase flex items-center gap-1.5">
                  <Bell size={15} className="text-brand-orange animate-bounce" />
                  Stays Ending Soon
                </h3>
                <p className="text-[10px] text-gray-300 font-semibold mt-0.5">Due within 4 hours or by end of today</p>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeStaysEnding.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                  No active stays ending within 4 hours or today.
                </div>
              ) : (
                activeStaysEnding.map((b) => {
                  const checkoutTime = new Date(b.checkOutDate);
                  const diffHours = (checkoutTime.getTime() - Date.now()) / (1000 * 60 * 60);
                  const isOverdue = diffHours < 0;

                  return (
                    <div 
                      key={b.id} 
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-shadow hover:shadow-sm ${
                        isOverdue 
                          ? "bg-rose-50 border-rose-100 text-rose-950" 
                          : "bg-amber-50/50 border-amber-100 text-amber-950"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-xs text-dark-brown">{b.guest?.name || b.guestName || "Unknown Guest"}</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5">Room {b.room?.roomNumber || b.roomNumber} • Receipt: {b.receiptNo}</p>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isOverdue ? "bg-red-500 text-white animate-pulse" : "bg-amber-500 text-white"
                        }`}>
                          {isOverdue ? "Overdue" : `${Math.ceil(diffHours)}h left`}
                        </span>
                      </div>
                      <div className="text-[10px] flex justify-between text-gray-500 font-semibold border-t border-black/5 pt-1.5">
                        <span>Check-out due:</span>
                        <span className="font-bold text-dark-brown">
                          {checkoutTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-1 pt-1">
                        <Link
                          href={`/checkout?receipt=${b.receiptNo}`}
                          onClick={() => setShowNotifications(false)}
                          className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white text-center text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Checkout
                        </Link>
                        <Link
                          href={`/guests/${b.guestId || b.id}`}
                          onClick={() => setShowNotifications(false)}
                          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-center text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
