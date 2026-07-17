import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Guest Checkout & Settlement - Siddaganga Mata",
  description: "Checkout guest stays and settle payments.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-white p-6 rounded-card h-[400px] flex items-center justify-center text-sm text-gray-400 font-semibold border border-gray-100">Loading Checkout Settlement...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
