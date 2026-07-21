"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error("Global crash intercepted:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-4">
      <div className="bg-red-50/50 border border-red-150 p-8 rounded-2xl max-w-md w-full text-center shadow-lg animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-650 mx-auto flex items-center justify-center mb-5">
          <AlertCircle size={38} />
        </div>
        
        <h2 className="text-xl font-black text-dark-brown">Console Connection Interrupted</h2>
        
        <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-2">
          {error.message || "An unexpected error occurred while communicating with the database. Please verify your connection and try again."}
        </p>

        {error.digest && (
          <div className="bg-white/60 border border-gray-100 rounded-lg p-2 mt-4 text-[10px] text-gray-400 font-mono select-all">
            Digest Code: {error.digest}
          </div>
        )}

        <div className="flex gap-2.5 mt-6 justify-center">
          <button
            onClick={() => reset()}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          
          <Link
            href="/"
            onClick={() => {
              // Use direct window location assignment to force a full re-fetch of server data
              window.location.href = "/";
            }}
            className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
