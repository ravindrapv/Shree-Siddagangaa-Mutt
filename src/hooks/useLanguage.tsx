"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "kn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translationDict: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    newBooking: "New Booking",
    bookings: "Active Stays",
    guests: "Guest Directory",
    rooms: "Rooms List",
    payments: "Payment Logs",
    reports: "Financial Reports",
    settings: "System Settings",
    users: "System Users",
    logout: "Logout",

    // Dashboard Stats
    todaysCollection: "Today's Total Collection",
    occupiedRooms: "Occupied Rooms",
    availableRooms: "Available Rooms",
    cleaningMaintenance: "Cleaning / Maintenance",
    activeStays: "Active Devotee Stays",
    roomGrid: "Premises Room Grid Map",
    quickActions: "Quick Operations",
    newGuestCheckin: "New Guest Check-in",
    searchStays: "Search Devotee Stays",
    printCashSummary: "Print Cash Summary",
    todayCheckins: "Today's Check-ins",
    todayCheckouts: "Today's Check-outs",
    roomsOccupied: "Rooms Occupied",
    roomsAvailable: "Rooms Available",
    todayCollection: "Today's Collection",
    last7DaysCollection: "Last 7 Days Collection",
    lastMonthCollection: "Last Month's Collection",
    yearCollection: "Year's Collection",
    totalCollection: "Total Collection",
    dashboardOverview: "Dashboard Overview",
    welcomePortal: "Welcome to the Kalyani Guest House Stay portal.",

    // Table Headers
    receiptNo: "Receipt No",
    guestName: "Guest Name",
    roomNo: "Room No",
    checkIn: "Check-in Date & Time",
    checkOut: "Check-out Due Time",
    days: "Days",
    amount: "Amount",
    status: "Status",
    phone: "Phone",
    idCard: "ID Card",
    noOfPersons: "Persons",
    actions: "Actions",

    // Common Buttons / Actions
    viewProfile: "View Profile",
    checkout: "Check-out",
    rebook: "Re-book",
    searchPlaceholder: "Search...",
    print: "Print",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    reset: "Reset",
    templeName: "Shree Siddaganga Mutt, Tumkur",

    // Settings
    langSettings: "System Language Settings",
    langSelectDesc: "Choose the default display language for the Kalyani Guest House staying console.",
    selectLang: "Select Language",
  },
  kn: {
    // Navigation
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    newBooking: "ಹೊಸ ಬುಕಿಂಗ್",
    bookings: "ಸಕ್ರಿಯ ವಾಸ್ತವ್ಯಗಳು",
    guests: "ಅತಿಥಿ ಡೈರೆಕ್ಟರಿ",
    rooms: "ಕೋಣೆಗಳ ಪಟ್ಟಿ",
    payments: "ಪಾವತಿ ದಾಖಲೆಗಳು",
    reports: "ಹಣಕಾಸು ವರದಿಗಳು",
    settings: "ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    users: "ಬಳಕೆದಾರರು",
    logout: "ಲಾಗಿನ್ ನಿರ್ಗಮನ",

    // Dashboard Stats
    todaysCollection: "ಇಂದಿನ ಒಟ್ಟು ಸಂಗ್ರಹ",
    occupiedRooms: "ಭರ್ತಿಯಾದ ಕೋಣೆಗಳು",
    availableRooms: "ಲಭ್ಯವಿರುವ ಕೋಣೆಗಳು",
    cleaningMaintenance: "ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ / ನಿರ್ವಹಣೆ",
    activeStays: "ಪ್ರಸ್ತುತ ಇರುವ ಅತಿಥಿಗಳು",
    roomGrid: "ಕೋಣೆಗಳ ಲಭ್ಯತೆಯ ಗ್ರಿಡ್",
    quickActions: "ತ್ವರಿತ ಆಡಳಿತಾತ್ಮಕ ಕಾರ್ಯಗಳು",
    newGuestCheckin: "ಹೊಸ ಅತಿಥಿ ಚೆಕ್-ಇನ್",
    searchStays: "ಅತಿಥಿ ಹುಡುಕಾಟ",
    printCashSummary: "ದೈನಂದಿನ ನಗದು ವರದಿ ಪ್ರಿಂಟ್",
    todayCheckins: "ಇಂದಿನ ದಾಖಲಾತಿಗಳು",
    todayCheckouts: "ಇಂದಿನ ನಿರ್ಗಮನಗಳು",
    roomsOccupied: "ಭರ್ತಿಯಾದ ಕೋಣೆಗಳು",
    roomsAvailable: "ಲಭ್ಯವಿರುವ ಕೋಣೆಗಳು",
    todayCollection: "ಇಂದಿನ ಸಂಗ್ರಹ",
    last7DaysCollection: "ಕಳೆದ ೭ ದಿನಗಳ ಸಂಗ್ರಹ",
    lastMonthCollection: "ಕಳೆದ ತಿಂಗಳ ಸಂಗ್ರಹ",
    yearCollection: "ಈ ವರ್ಷದ ಸಂಗ್ರಹ",
    totalCollection: "ಒಟ್ಟು ಸಂಗ್ರಹ",
    dashboardOverview: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ",
    welcomePortal: "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹಕ್ಕೆ ತಮಗೆ ಆದರದ ಸುಸ್ವಾಗತ.",

    // Table Headers
    receiptNo: "ರಸೀದಿ ಸಂಖ್ಯೆ",
    guestName: "ಅತಿಥಿಯ ಹೆಸರು",
    roomNo: "ಕೋಣೆ ಸಂಖ್ಯೆ",
    checkIn: "ದಾಖಲಾತಿ ಸಮಯ",
    checkOut: "ನಿರ್ಗಮನ ಸಮಯ",
    days: "ದಿನಗಳು",
    amount: "ಒಟ್ಟು ಮೊತ್ತ",
    status: "ಸ್ಥಿತಿ",
    phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    idCard: "ಗುರುತಿನ ಚೀಟಿ",
    noOfPersons: "ಜನರ ಸಂಖ್ಯೆ",
    actions: "ಕ್ರಮಗಳು",

    // Common Buttons / Actions
    viewProfile: "ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ",
    checkout: "ಚೆಕ್-ಔಟ್",
    rebook: "ಮತ್ತೆ ಬುಕಿಂಗ್",
    searchPlaceholder: "ಹುಡುಕಿ...",
    print: "ಪ್ರಿಂಟ್",
    cancel: "ರದ್ದುಮಾಡು",
    confirm: "ದೃಢೀಕರಿಸಿ",
    save: "ಉಳಿಸಿ",
    reset: "ಮರುಹೊಂದಿಸಿ",
    templeName: "ಶ್ರೀ ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು",

    // Settings
    langSettings: "ಸಿಸ್ಟಮ್ ಭಾಷಾ ಆಯ್ಕೆಗಳು (Language Settings)",
    langSelectDesc: "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ ನಿರ್ವಹಣಾ ಸಿಸ್ಟಮ್‌ನ ಡಿಸ್ಪ್ಲೇ ಭಾಷೆಯನ್ನು ಇಲ್ಲಿ ಬದಲಾಯಿಸಿ.",
    selectLang: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kalyani_lang") as Language;
    if (saved === "en" || saved === "kn") {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kalyani_lang", lang);
  };

  const t = (key: string): string => {
    const lang = mounted ? language : "en";
    return translationDict[lang][key] || translationDict["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
