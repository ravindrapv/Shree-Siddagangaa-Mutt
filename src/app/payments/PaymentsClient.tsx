"use client";

import { useState, useEffect } from "react";
import { Search, IndianRupee, Wallet, CreditCard, Filter, ArrowDownLeft } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";

interface PaymentsClientProps {
  initialBookings: any[];
}

export default function PaymentsClient({ initialBookings }: PaymentsClientProps) {
  // Map only checked out stays to payments list (showing final charge amount only)
  const checkedOutBookings = initialBookings.filter(b => b.status === "CHECKED_OUT");

  const payments = checkedOutBookings.map((b) => ({
    id: b.id,
    date: b.updatedAt || b.checkOutDate,
    receiptNo: b.receiptNo,
    amount: b.totalAmount, 
    method: b.paymentMethod || "CASH",
    notes: `Checked out stay — Room ${b.room?.roomNumber || "N/A"} (${b.noOfDays} Days)`
  }));

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  // Pagination
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [search, methodFilter]);

  // Filter calculations
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === "ALL" || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const pagedPayments = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Calculate totals
  const total = payments.reduce((acc, p) => acc + p.amount, 0);
  const cash = payments.filter(p => p.method === "CASH").reduce((acc, p) => acc + p.amount, 0);
  const upi = payments.filter(p => p.method === "UPI").reduce((acc, p) => acc + p.amount, 0);
  const card = payments.filter(p => p.method === "CARD" || p.method === "MIXED").reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Financial Collection Ledger</h2>
          <p className="text-sm text-gray-500 font-medium">Verify cash, card, and UPI payment entries registered today.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", val: total, icon: IndianRupee, color: "border-l-4 border-brand-orange text-brand-orange bg-orange-50/10" },
          { label: "Cash Drawer", val: cash, icon: Wallet, color: "border-l-4 border-emerald-500 text-emerald-700 bg-emerald-50/10" },
          { label: "UPI (Google Pay / PhonePe)", val: upi, icon: CreditCard, color: "border-l-4 border-sky-500 text-sky-700 bg-sky-50/10" },
          { label: "Card / Mixed Ledger", val: card, icon: IndianRupee, color: "border-l-4 border-purple-500 text-purple-700 bg-purple-50/10" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className={`${item.color} py-4 px-5`}>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
              <div className="flex items-center justify-between mt-1">
                <h4 className="text-xl font-black">₹{item.val.toLocaleString("en-IN")}</h4>
                <div className="p-1 rounded-lg bg-white/80 border border-black/5 opacity-70">
                  <Icon size={14} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by receipt no, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange font-semibold text-dark-brown"
          />
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange font-bold text-dark-brown w-full sm:w-auto"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
      </div>

      {/* Payments List table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400 font-bold text-xs uppercase">
                <th className="pb-3">Transaction Date</th>
                <th className="pb-3">Receipt No</th>
                <th className="pb-3">Paid Amount</th>
                <th className="pb-3">Payment Channel</th>
                <th className="pb-3">Description/Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {pagedPayments.map((p) => {
                const methodBadges = {
                  CASH: "bg-emerald-50 text-emerald-700 border-emerald-250",
                  UPI: "bg-sky-50 text-sky-700 border-sky-250",
                  CARD: "bg-indigo-50 text-indigo-700 border-indigo-250",
                  MIXED: "bg-purple-50 text-purple-700 border-purple-250"
                };

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 text-xs text-gray-500">
                      {new Date(p.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 font-bold text-brand-orange">{p.receiptNo}</td>
                    <td className="py-3.5">
                      <span className="text-dark-brown font-extrabold text-sm flex items-center gap-1">
                        <ArrowDownLeft size={14} className="text-emerald-500" />
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${methodBadges[p.method as keyof typeof methodBadges]}`}>
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-gray-500 truncate max-w-[200px]" title={p.notes || "Stay Payment"}>
                      {p.notes || "Stay Advance / Settlement Payment"}
                    </td>
                  </tr>
                );
              })}
              {pagedPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">No payment entries registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-2 pb-1">
          <Pagination
            total={filteredPayments.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
