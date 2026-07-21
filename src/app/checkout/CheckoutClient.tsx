"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  IndianRupee,
  CheckCircle,
  Printer,
  Home,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Loader2
} from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { getBookingByReceipt, checkoutBooking } from "@/app/actions";
import Link from "next/link";
import PrintPortal from "@/components/ui/PrintPortal";
import Modal from "@/components/ui/Modal";
import { renderA4Receipt } from "../bookings/BookingsClient";

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const lastSearchedRef = useRef<string | null>(null);

  // Booking states
  const [activeBooking, setActiveBooking] = useState<any>(null);

  // Billing details
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [chargeNotes, setChargeNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "MIXED">("CASH");
  const [paymentNote, setPaymentNote] = useState("Settled final balance at checkout.");

  // Checkout successful confirmed state
  const [checkoutReceipt, setCheckoutReceipt] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Handle Search for Active Bookings — defined before useEffect to avoid stale closure
  const handleSearch = useCallback(async (queryToSearch: string) => {
    if (!queryToSearch || !queryToSearch.trim()) {
      toast.error("Please enter a Receipt Number or Room Number");
      return;
    }

    setIsSearching(true);
    try {
      const b = await getBookingByReceipt(queryToSearch.trim());
      if (b) {
        if (b.status === "CHECKED_OUT") {
          toast.info("This stay is already checked out.");
        } else if (b.status === "CANCELLED") {
          toast.info("This booking has been cancelled.");
        }
        setActiveBooking(b);
        setCheckoutReceipt(null);
      } else {
        toast.error("No active stay found with receipt or room number: " + queryToSearch);
        setActiveBooking(null);
      }
    } catch (err) {
      toast.error("Search failed. Verify receipt or room number format.");
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Auto-search from URL params — placed after handleSearch to avoid temporal dead zone
  useEffect(() => {
    const receiptParam = searchParams.get("receipt");
    if (receiptParam && lastSearchedRef.current !== receiptParam) {
      lastSearchedRef.current = receiptParam;
      setSearchQuery(receiptParam);
      handleSearch(receiptParam);
    }
  }, [searchParams, handleSearch]);

  // Perform Settle Checkout
  const handleSettle = () => {
    if (!activeBooking) return;

    startTransition(async () => {
      try {
        const finalBalance = activeBooking.balanceAmount + Number(additionalCharges);
        const payload = {
          balanceAmount: finalBalance,
          paymentMethod,
          paymentNote: paymentNote + (chargeNotes ? ` Extra Charges Note: ${chargeNotes}` : "")
        };

        const result = await checkoutBooking(activeBooking.id, payload);
        setCheckoutReceipt(result);
        toast.success(`Booking ${activeBooking.receiptNo} settled successfully!`);
      } catch (err) {
        toast.error("Failed to process checkout settlement.");
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const resetCheckout = () => {
    setActiveBooking(null);
    setCheckoutReceipt(null);
    setSearchQuery("");
    setAdditionalCharges(0);
    setChargeNotes("");
    setPaymentNote("Settled final balance at checkout.");
    lastSearchedRef.current = null;
  };

  // Billing math
  const originalBalance = activeBooking ? activeBooking.balanceAmount : 0;
  const finalBalanceDue = originalBalance + Number(additionalCharges);

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Guest Checkout & Settle</h2>
          <p className="text-sm text-gray-500 font-medium">Verify outstanding stay details and settle bills.</p>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start flex-1">

        {/* Left Side: Search & Details */}
        <div className="xl:col-span-2 space-y-6 no-print">

          {/* Query search form */}
          <Card>
            <CardTitle className="mb-4">Search Active Booking</CardTitle>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchQuery);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                required
                placeholder="Enter Receipt Number (e.g. RCP1248)... or Room Number (e.g. 30)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                <Search size={16} />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </Card>

          {/* If booking found, show stay details */}
          {activeBooking && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">

              {/* Stay summaries */}
              <Card>
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-dark-brown">Stay Summary: {activeBooking.guest?.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Phone: {activeBooking.guest?.phone} | ID: {activeBooking.guest?.idType} ({activeBooking.guest?.idNumber})</p>
                  </div>
                  <Badge variant={activeBooking.status === "ACTIVE" ? "active" : activeBooking.status === "CHECKED_OUT" ? "checked_out" : "cancelled"}>
                    {activeBooking.status === "ACTIVE" ? "Active" : activeBooking.status === "CHECKED_OUT" ? "Checked Out" : "Cancelled"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                  <div className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between"><span>Room Number:</span> <span className="text-dark-brown font-bold">Room {activeBooking.room?.roomNumber}</span></div>
                    <div className="flex justify-between"><span>Check-in Date:</span> <span className="text-dark-brown">{new Date(activeBooking.checkInDate).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Check-out Date:</span> <span className="text-dark-brown">{new Date(activeBooking.checkOutDate).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Stay Duration:</span> <span className="text-dark-brown font-bold">{activeBooking.noOfDays} Days</span></div>
                  </div>

                  <div className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between"><span>Base Tariff (Daily):</span> <span className="text-dark-brown">₹{activeBooking.room?.ratePerDay}</span></div>
                    <div className="flex justify-between"><span>Accommodation Cost:</span> <span className="text-dark-brown font-bold">₹{activeBooking.totalAmount}</span></div>
                    <div className="flex justify-between"><span>Advance paid:</span> <span className="text-emerald-600">- ₹{activeBooking.advancePaid}</span></div>
                  </div>
                </div>
              </Card>

              {/* Billing settlements & Additional adjustments */}
              {activeBooking.status === "ACTIVE" && !checkoutReceipt && (
                <Card>
                  <CardTitle className="mb-4">Settlement & Additional Charges</CardTitle>
                  <div className="space-y-6">

                    {/* Add extra inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Additional Charges (₹)</label>
                        <input
                          type="number"
                          value={additionalCharges}
                          onChange={(e) => setAdditionalCharges(Number(e.target.value) || 0)}
                          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Additional Charge Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. extra bedding, laundry..."
                          value={chargeNotes}
                          onChange={(e) => setChargeNotes(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                        />
                      </div>
                    </div>

                    {/* Choose balance channels */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase">Settlement Payment Method</label>
                      <div className="grid grid-cols-4 gap-3">
                        {(["CASH", "UPI", "CARD", "MIXED"] as const).map((method) => {
                          const isDisabled = method !== "CASH";
                          return (
                            <button
                              type="button"
                              key={method}
                              disabled={isDisabled}
                              onClick={() => setPaymentMethod(method)}
                              className={`py-3 rounded-xl text-xs font-bold text-center border transition-all ${paymentMethod === method
                                  ? "bg-brand-orange border-brand-orange text-white shadow-md"
                                  : isDisabled
                                    ? "bg-gray-100 border-gray-150 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                                }`}
                            >
                              {method} {isDisabled && " (Disabled)"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Settlement Reference/Notes</label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                      />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-6 mt-6">
                      <button
                        type="button"
                        onClick={handleSettle}
                        disabled={isPending}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Settling Stay & Checking Out...
                          </>
                        ) : (
                          "Settle Balance & Vacate Room"
                        )}
                      </button>
                    </div>

                  </div>
                </Card>
              )}

              {/* Checkout Settle success panel */}
              {checkoutReceipt && (
                <Card className="text-center py-6 border border-emerald-100 bg-emerald-50/10">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 animate-in zoom-in-75 duration-300">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-black text-dark-brown">Check-out Succeeded & Room Vacated!</h3>
                  <p className="text-sm text-gray-500 font-semibold mt-1">Room {activeBooking.room?.roomNumber} has been marked as <strong>CLEANING</strong>.</p>

                  <div className="flex justify-center flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Search size={18} />
                      Preview Receipt
                    </button>
                    <button
                      onClick={handlePrint}
                      className="bg-white border border-orange-200 text-brand-orange hover:bg-orange-50/50 text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Printer size={18} />
                      Print Receipt
                    </button>
                    <button
                      onClick={resetCheckout}
                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Search Another Checkout
                    </button>
                    <Link
                      href="/"
                      className="bg-dark-brown hover:bg-dark-brown-light text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Home size={18} />
                      Go Dashboard
                    </Link>
                  </div>

                  {/* Checkout Receipt Preview Modal */}
                  <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Checkout Bill Receipt Preview" size="lg">
                    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center gap-4 no-print overflow-y-auto max-h-[70vh]">
                      <div className="scale-90 origin-top shadow-lg bg-white rounded-md border border-gray-300">
                        {renderA4Receipt({
                          ...activeBooking,
                          status: "CHECKED_OUT",
                          checkOutDate: new Date().toISOString()
                        }, "devotee", Number(additionalCharges), chargeNotes)}
                      </div>
                      <div className="w-[194mm] border-t border-dashed border-gray-400 text-center py-2 text-xs font-bold text-gray-500">
                        ✂ ಕತ್ತರಿಸುವ ಗೆರೆ (Cut Here) ✂
                      </div>
                      <div className="scale-90 origin-top shadow-lg bg-white rounded-md border border-gray-300">
                        {renderA4Receipt({
                          ...activeBooking,
                          status: "CHECKED_OUT",
                          checkOutDate: new Date().toISOString()
                        }, "office", Number(additionalCharges), chargeNotes)}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 no-print">
                      <button
                        onClick={() => {
                          setIsPreviewOpen(false);
                          handlePrint();
                        }}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Printer size={14} /> Print A4 Receipt (2 Copies)
                      </button>
                      <button
                        onClick={() => setIsPreviewOpen(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </Modal>
                </Card>
              )}

            </div>
          )}

          {/* Empty search state */}
          {!activeBooking && (
            <Card className="py-12 text-center text-gray-400 font-semibold border border-dashed border-gray-150">
              <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
              Search for an active devotee receipt above to begin checkout processing.
            </Card>
          )}

        </div>

        {/* Right Side: Billing summary ledger (Sidebar) */}
        {activeBooking && (
          <div className="xl:col-span-1 space-y-6 no-print">
            <Card className="border border-blue-50 bg-blue-50/10">
              <CardTitle className="border-b border-gray-100 pb-3 mb-4 text-blue-900 flex items-center gap-2">
                <IndianRupee size={16} className="text-blue-500" />
                Checkout Invoice Summary
              </CardTitle>

              <div className="space-y-4 text-xs text-gray-600 font-semibold">
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Daily Room Tariff:</span> <span className="text-dark-brown font-bold">₹{activeBooking.room?.ratePerDay}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Accommodation Cost:</span> <span className="text-dark-brown font-bold">₹{activeBooking.totalAmount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Advance Paid:</span> <span className="text-emerald-600 font-bold">- ₹{activeBooking.advancePaid}</span></div>
                </div>

                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">
                      {originalBalance < 0 ? "Refund Outstanding:" : "Outstanding Balance:"}
                    </span>
                    <span className={originalBalance < 0 ? "text-emerald-600 font-bold" : "text-dark-brown font-bold"}>
                      ₹{Math.abs(originalBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Additional Charges:</span> <span className="text-rose-500 font-bold">+ ₹{additionalCharges}</span></div>
                  {chargeNotes && <p className="text-[10px] text-gray-400 italic">Notes: {chargeNotes}</p>}
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-150 flex justify-between font-black text-sm text-dark-brown">
                  <span>{finalBalanceDue < 0 ? "Refund (Give Back) to Devotee:" : "Final Settle Balance:"}</span>
                  <span className={finalBalanceDue > 0 ? "text-rose-600 font-black text-base animate-pulse" : "text-emerald-600 font-black text-base"}>
                    ₹ {Math.abs(finalBalanceDue)}
                  </span>
                </div>

                {finalBalanceDue < 0 ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[11px] text-emerald-800">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="font-medium">
                      Ensure refund of <strong>₹{Math.abs(finalBalanceDue)}</strong> is returned in cash to the devotee.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5 text-[11px] text-amber-800">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="font-medium">
                      Ensure payment of <strong>₹{finalBalanceDue}</strong> is collected via {paymentMethod} before confirming check-out.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          PRINTABLE A4 CHECK-OUT FINAL BILL RECEIPT (2 COPIES)
          Rendered ONLY when executing a print job
          ------------------------------------------------------------- */}
      {activeBooking && (
        <PrintPortal>
          <div className="print-only a4-print-wrapper">
            {renderA4Receipt({
              ...activeBooking,
              status: "CHECKED_OUT",
              checkOutDate: new Date().toISOString()
            }, "devotee", Number(additionalCharges), chargeNotes)}
            <div className="a4-divider"></div>
            {renderA4Receipt({
              ...activeBooking,
              status: "CHECKED_OUT",
              checkOutDate: new Date().toISOString()
            }, "office", Number(additionalCharges), chargeNotes)}
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
