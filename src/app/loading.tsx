"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
      {/* Premium pulsing brand spinner */}
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-brand-orange animate-spin"></div>
        <div className="absolute w-6 h-6 rounded-full bg-brand-orange/10 animate-ping"></div>
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold text-dark-brown uppercase tracking-wider animate-pulse">Loading Stay Console...</h3>
        <p className="text-xs text-gray-400 font-medium mt-1">Please wait while we retrieve database records</p>
      </div>
    </div>
  );
}
