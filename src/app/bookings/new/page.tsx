import { Suspense } from "react";
import NewBookingWizard from "./NewBookingWizard";

export const metadata = {
  title: "New Stay Check-in - Siddaganga Mata",
  description: "Wizard to register new guest and book room stays.",
};

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-white p-6 rounded-card h-[400px] flex items-center justify-center text-sm text-gray-400 font-semibold border border-gray-100">Loading Check-in Wizard...</div>}>
      <NewBookingWizard />
    </Suspense>
  );
}
