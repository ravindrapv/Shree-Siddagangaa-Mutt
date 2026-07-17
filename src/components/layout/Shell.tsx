"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Layout detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true); // default to closed on mobile
      } else {
        setCollapsed(false); // default to open on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 no-print">
      {/* Top Header */}
      <Header />

      <div className="flex flex-1 pt-[70px]">
        {/* Collapsible Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobile && !collapsed && (
          <div 
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-20 no-print"
          />
        )}

        {/* Main Content Area */}
        <main 
          className="flex-1 flex flex-col min-h-[calc(100vh-70px)] p-4 sm:p-6 md:p-8 no-print"
          style={{
            paddingLeft: isMobile ? "16px" : collapsed ? "102px" : "272px",
            paddingRight: isMobile ? "16px" : "32px",
            transition: "padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* Print layout placeholder */}
      <div className="print-only hidden"></div>
    </div>
  );
}
