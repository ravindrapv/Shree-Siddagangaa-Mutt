"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/hooks/use-toast";
import { LanguageProvider } from "@/hooks/useLanguage";
import Shell from "./Shell";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <LanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <ToastProvider>
        <Shell>{children}</Shell>
      </ToastProvider>
    </LanguageProvider>
  );
}
