"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/hooks/use-toast";
import Shell from "./Shell";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Shell>{children}</Shell>
    </ToastProvider>
  );
}
