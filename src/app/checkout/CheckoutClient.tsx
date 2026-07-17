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
  FolderOpen
} from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { getBookingByReceipt, checkoutBooking } from "@/app/actions";
import Link from "next/link";
import PrintPortal from "@/components/ui/PrintPortal";
import Modal from "@/components/ui/Modal";

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
                        Settle Balance & Vacate Room
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
                  <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Checkout Bill Receipt Preview" size="sm">
                    <div className="bg-gray-100 p-4 rounded-xl flex justify-center no-print">
                      <div className="bg-white border border-gray-200 shadow-md p-6 max-w-sm w-full font-mono text-[11px] text-black space-y-4 rounded-sm relative leading-relaxed">
                        {/* Ticket Notches */}
                        <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-gray-100 rounded-full border-r border-gray-200"></div>
                        <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-gray-100 rounded-full border-l border-gray-200"></div>

                        <div className="text-center mb-4 flex flex-col items-center border-b border-dashed border-gray-200 pb-3">
                          {/* Three Swamiji Photos */}
                          <div className="flex justify-center gap-3 mb-2">
                            <div className="flex flex-col items-center">
                              <img src="/swami-senior.jpg" className="w-9 h-9 rounded-full object-cover object-top border border-brand-orange/30" alt="Dr. S. Swamiji" />
                              <span className="text-[6px] font-bold mt-0.5 whitespace-nowrap leading-none">Dr. Sri S. Swamiji</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <img src="/swami-current.jpg" className="w-9 h-9 rounded-full object-cover object-top border border-brand-orange/30" alt="Sri S. Swamiji" />
                              <span className="text-[6px] font-bold mt-0.5 whitespace-nowrap leading-none">Sri Sri S. Swamiji</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <img src="/swami-assistant.jpg" className="w-9 h-9 rounded-full object-cover object-top border border-brand-orange/30" alt="Sri Swamiji" />
                              <span className="text-[6px] font-bold mt-0.5 whitespace-nowrap leading-none">Sri Swamiji</span>
                            </div>
                          </div>
                          <h2 className="text-xs font-extrabold uppercase tracking-wide">Sri Siddaganga Mutt</h2>
                          <p className="text-[9px] text-brand-orange font-bold uppercase leading-tight">Kalyani Guest House</p>
                          <p className="text-[8px] text-gray-400">Mutt Road, Tumkur, Karnataka - 572104</p>
                        </div>

                        <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                          <div className="flex justify-between"><span>Receipt No:</span><span className="font-bold">{activeBooking.receiptNo}</span></div>
                          <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between"><span>Status:</span><span className="font-bold text-red-600">CHECKED OUT</span></div>
                        </div>

                        <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                          <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Devotee Details</p>
                          <div className="flex justify-between"><span>Name:</span><span className="font-bold">{activeBooking.guest?.name}</span></div>
                          <div className="flex justify-between"><span>Phone:</span><span>{activeBooking.guest?.phone}</span></div>
                          <div className="flex justify-between"><span>ID Card:</span><span>{activeBooking.guest?.idType} ({activeBooking.guest?.idNumber})</span></div>
                        </div>

                        <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                          <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Room Details</p>
                          <div className="flex justify-between"><span>Room Number:</span><span className="font-bold">Room {activeBooking.room?.roomNumber}</span></div>
                          <div className="flex justify-between"><span>Duration:</span><span>{activeBooking.noOfDays} Days</span></div>
                          <div className="flex justify-between"><span>Check-in Time:</span><span>{new Date(activeBooking.checkInDate || activeBooking.createdAt).toLocaleDateString("en-IN")} {new Date(activeBooking.checkInDate || activeBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                          <div className="flex justify-between"><span>Check-out Time:</span><span>{new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                        </div>

                        <div className="space-y-1 text-[10px]">
                          <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Settle Summary</p>
                          <div className="flex justify-between"><span>Accom. charges:</span><span>₹{activeBooking.totalAmount}.00</span></div>
                          <div className="flex justify-between"><span>Advance Paid:</span><span>- ₹{activeBooking.advancePaid}.00</span></div>
                          <div className="flex justify-between"><span>Additional Fees:</span><span>+ ₹{additionalCharges}.00</span></div>
                          {chargeNotes && <p className="text-[9px] italic text-gray-400">({chargeNotes})</p>}
                          {finalBalanceDue < 0 ? (
                            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-150 mt-1 text-emerald-600">
                              <span>Refund Given (Cash):</span>
                              <span>₹{Math.abs(finalBalanceDue)}.00</span>
                            </div>
                          ) : (
                            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-150 mt-1">
                              <span>Settle Amount ({paymentMethod}):</span>
                              <span>₹{finalBalanceDue}.00</span>
                            </div>
                          )}
                        </div>

                        {/* Verification QR Code */}
                        <div className="flex flex-col items-center justify-center pt-2 border-t border-dashed border-gray-200">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                              `Kalyani Guest House Check-Out\nReceipt No: ${activeBooking.receiptNo}\nGuest Name: ${activeBooking.guest?.name}\nRoom Number: ${activeBooking.room?.roomNumber}\nSettle Amount: Rs. ${finalBalanceDue}`
                            )}`}
                            alt="Receipt QR Code"
                            className="w-24 h-24 border border-gray-150 p-1 bg-white"
                          />
                          <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
                        </div>

                        <div className="text-center pt-3 border-t border-dashed border-gray-200 text-[9px] text-gray-500 font-semibold italic">
                          Have a Blessed & Safe Journey!
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsPreviewOpen(false);
                          handlePrint();
                        }}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer size={14} /> Print Receipt
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
          PRINTABLE THERMAL CHECK-OUT FINAL BILL RECEIPT
          Rendered ONLY when executing a print job
          ------------------------------------------------------------- */}
      {activeBooking && (
        <PrintPortal>
          <div className="print-only thermal-receipt text-black font-mono">
            <div className="text-center mb-3 flex flex-col items-center">
              {/* Three Swamiji Photos */}
              <div className="flex justify-center gap-3 mb-2.5">
                <div className="flex flex-col items-center">
                  <img src="/swami-senior.jpg" className="w-8 h-8 rounded-full object-cover object-top border border-black" alt="Dr. S. Swamiji" />
                  <span className="text-[5.5px] font-bold mt-0.5 whitespace-nowrap leading-none">Dr. Sri S. Swamiji</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/swami-current.jpg" className="w-8 h-8 rounded-full object-cover object-top border border-black" alt="Sri S. Swamiji" />
                  <span className="text-[5.5px] font-bold mt-0.5 whitespace-nowrap leading-none">Sri Sri S. Swamiji</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/swami-assistant.jpg" className="w-8 h-8 rounded-full object-cover object-top border border-black" alt="Sri Swamiji" />
                  <span className="text-[5.5px] font-bold mt-0.5 whitespace-nowrap leading-none">Sri Swamiji</span>
                </div>
              </div>

              <h2 className="text-[11px] font-black tracking-wider uppercase leading-tight">Sri Siddaganga Mutt</h2>
              <p className="text-[9px] font-extrabold text-brand-orange uppercase leading-tight">Kalyani Guest House</p>
              <p className="text-[7.5px] text-gray-600 font-semibold leading-tight">Mutt Road, Tumkur, Karnataka - 572104</p>
            </div>

            <div className="border-t border-b border-dashed border-black py-2.5 my-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold">{activeBooking.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleString("en-IN", { hour12: true })}</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt Type:</span>
                <span className="font-bold">FINAL BILL & CHECK-OUT</span>
              </div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Guest Details</p>
              <div className="flex justify-between"><span>Guest Name:</span> <span className="font-bold">{activeBooking.guest?.name}</span></div>
              <div className="flex justify-between"><span>Phone Number:</span> <span>{activeBooking.guest?.phone}</span></div>
              <div className="flex justify-between"><span>ID Card:</span> <span>{activeBooking.guest?.idType} ({activeBooking.guest?.idNumber})</span></div>
              <div className="flex justify-between"><span>No. of Persons:</span> <span>{activeBooking.noOfPersons}</span></div>
              <p className="text-[10px] truncate max-w-[280px]">Address: {activeBooking.guest?.address}</p>
            </div>

            <div className="space-y-1 py-2.5 my-1.5 border-t border-b border-dashed border-black text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Room Details</p>
              <div className="flex justify-between"><span>Room Number:</span> <span className="font-bold">Room {activeBooking.room?.roomNumber}</span></div>
              <div className="flex justify-between"><span>Check-in:</span> <span>{new Date(activeBooking.checkInDate || activeBooking.createdAt).toLocaleDateString("en-IN")} {new Date(activeBooking.checkInDate || activeBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Check-out:</span> <span>{new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Stay Duration:</span> <span>{activeBooking.noOfDays} Days</span></div>
              <div className="flex justify-between"><span>Tariff (Per Day):</span> <span>₹{activeBooking.room?.ratePerDay}</span></div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Financial Ledger</p>
              <div className="flex justify-between"><span>Total Accom. cost:</span> <span>₹ {activeBooking.totalAmount}.00</span></div>
              <div className="flex justify-between"><span>Advance Paid:</span> <span>₹ {activeBooking.advancePaid}.00</span></div>
              <div className="flex justify-between"><span>Additional Charges:</span> <span>₹ {additionalCharges}.00</span></div>
              {chargeNotes && <p className="text-[9px] italic ml-2">Extra charges note: {chargeNotes}</p>}
              <div className="flex justify-between font-bold border-t border-dashed border-black pt-1">
                <span>Grand Total Settled:</span>
                <span>₹ {activeBooking.totalAmount + Number(additionalCharges)}.00</span>
              </div>
            </div>

            {finalBalanceDue < 0 ? (
              <div className="space-y-1 py-2.5 my-2 border-t border-b border-dashed border-black text-[11px]">
                <div className="flex justify-between"><span>Balance Settlement Mode:</span> <span className="font-bold">CASH REFUND</span></div>
                <div className="flex justify-between"><span>Amount Returned:</span> <span className="font-bold">₹ {Math.abs(finalBalanceDue)}.00</span></div>
                {paymentNote && <p className="text-[9px] italic">Note: {paymentNote}</p>}
              </div>
            ) : (
              <div className="space-y-1 py-2.5 my-2 border-t border-b border-dashed border-black text-[11px]">
                <div className="flex justify-between"><span>Balance Settlement Mode:</span> <span className="font-bold">{paymentMethod}</span></div>
                <div className="flex justify-between"><span>Amount Received:</span> <span className="font-bold">₹ {finalBalanceDue}.00</span></div>
                {paymentNote && <p className="text-[9px] italic">Note: {paymentNote}</p>}
              </div>
            )}

            {/* Verification QR Code in Print */}
            <div className="flex flex-col items-center justify-center py-2 border-t border-dashed border-black">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `Kalyani Guest House Check-Out\nReceipt No: ${activeBooking.receiptNo}\nGuest Name: ${activeBooking.guest?.name}\nRoom Number: ${activeBooking.room?.roomNumber}\nSettle Amount: Rs. ${finalBalanceDue}`
                )}`}
                alt="Receipt QR Code"
                className="w-24 h-24 border border-black p-1 bg-white"
              />
              <p className="text-[8px] mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
            </div>

            <div className="text-center py-4 space-y-2 border-t border-black pt-4">
              <p className="text-xs font-bold leading-tight">Thank You!</p>
              <p className="text-[9px] font-semibold italic leading-tight">Have a Safe & Blessed Journey. Visit Again.</p>
              <div className="w-48 h-8 mx-auto bg-black flex items-center justify-center text-white text-[9px] font-bold mt-4 tracking-[6px] border border-black">
                |||RCP{activeBooking.receiptNo.substring(3)}|||
              </div>
              <p className="text-[8px] text-gray-500 font-semibold mt-1">RCP{activeBooking.receiptNo.substring(3)}</p>
              <p className="text-[7px] text-gray-500 leading-tight border-t border-dashed border-gray-400 pt-2">This is a computer generated receipt.<br />No signature required.</p>
            </div>
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
