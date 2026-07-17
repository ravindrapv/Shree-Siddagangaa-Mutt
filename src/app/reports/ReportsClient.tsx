"use client";

import { useState, useEffect } from "react";
import { Calendar, FileSpreadsheet, Printer, TrendingUp, IndianRupee, PieChart, Info } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import PrintPortal from "@/components/ui/PrintPortal";
import Pagination from "@/components/ui/Pagination";

interface ReportsClientProps {
  initialPayments: any[];
  initialBookings: any[];
}

export default function ReportsClient({ initialPayments, initialBookings }: ReportsClientProps) {
  const toast = useToast();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateInput: Date | string) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Filter stays that checked out within this period
  const checkedOutBookings = initialBookings.filter((b) => {
    if (b.status !== "CHECKED_OUT") return false;
    const checkoutDate = new Date(b.updatedAt || b.checkOutDate).toISOString().split("T")[0];
    return checkoutDate >= startDate && checkoutDate <= endDate;
  });

  // Map checked out stays to report items (showing only final stayed charges amount)
  const reportCollections = checkedOutBookings.map((b) => ({
    id: b.id,
    date: b.updatedAt || b.checkOutDate,
    receiptNo: b.receiptNo,
    amount: b.totalAmount, 
    method: b.paymentMethod || "CASH",
    notes: `Checked out stay — Room ${b.room?.roomNumber || "N/A"} (${b.noOfDays} Days)`
  }));

  const filteredBookings = initialBookings.filter((b) => {
    const bDate = new Date(b.createdAt).toISOString().split("T")[0];
    return bDate >= startDate && bDate <= endDate;
  });

  // Math totals based on completed stay payments
  const totalCollected = reportCollections.reduce((acc, p) => acc + p.amount, 0);
  const cash = reportCollections.filter(p => p.method === "CASH").reduce((acc, p) => acc + p.amount, 0);
  const upi = reportCollections.filter(p => p.method === "UPI").reduce((acc, p) => acc + p.amount, 0);
  const activeCheckins = filteredBookings.filter(b => b.status === "ACTIVE").length;
  const activeCheckouts = checkedOutBookings.length;

  // Pagination for the on-screen table
  const REPORT_PAGE_SIZE = 15;
  const [reportPage, setReportPage] = useState(1);
  // Reset page when date range changes
  useEffect(() => { setReportPage(1); }, [startDate, endDate]);
  const pagedPayments = reportCollections.slice((reportPage - 1) * REPORT_PAGE_SIZE, reportPage * REPORT_PAGE_SIZE);

  // CSV Export utility
  const handleCSVExport = () => {
    if (reportCollections.length === 0) {
      toast.info("No collections to export for this date range");
      return;
    }

    try {
      const headers = ["Date", "Receipt No", "Amount (₹)", "Method", "Notes"];
      const rows = reportCollections.map((p) => [
        new Date(p.date).toLocaleString("en-IN"),
        p.receiptNo,
        p.amount.toString(),
        p.method,
        p.notes || "Stay Payment"
      ]);

      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Siddaganga_Stay_Report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file downloaded successfully");
    } catch (err) {
      toast.error("Failed to generate CSV export file");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Revenue & Stay Audit Reports</h2>
          <p className="text-sm text-gray-500 font-medium">Export CSV registers, audit daily collections, and trace room occupancy.</p>
        </div>
      </div>

      {/* Date Range selectors */}
      <Card className="no-print">
        <CardTitle className="mb-4">Select Audit Period</CardTitle>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Calendar size={14} /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold w-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Calendar size={14} /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCSVExport}
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={16} />
              Print PDF
            </button>
          </div>
        </div>
      </Card>

      {/* Stats summaries for report */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collection totals */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-500" />
              Financial Collection (Period)
            </CardTitle>
            <h3 className="text-3xl font-black text-dark-brown">₹{totalCollected.toLocaleString("en-IN")}</h3>
            <div className="space-y-1 text-xs text-gray-500 font-bold mt-4">
              <div className="flex justify-between"><span>Cash Drawer:</span> <span>₹{cash.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>UPI Online:</span> <span>₹{upi.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-6 border-t border-gray-50 pt-2 font-medium" suppressHydrationWarning>Audited from {formatDate(startDate)} to {formatDate(endDate)}</p>
        </Card>

        {/* Occupancy counts */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
              <PieChart size={16} className="text-blue-500" />
              Accommodations Registered
            </CardTitle>
            <h3 className="text-3xl font-black text-dark-brown">{filteredBookings.length} stays</h3>
            <div className="space-y-1 text-xs text-gray-500 font-bold mt-4">
              <div className="flex justify-between"><span>Active stays registered:</span> <span>{activeCheckins}</span></div>
              <div className="flex justify-between"><span>Checked out stay:</span> <span>{activeCheckouts}</span></div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-6 border-t border-gray-50 pt-2 font-medium">Calculated based on booking timestamps.</p>
        </Card>

        {/* Audit status checks */}
        <Card className="bg-orange-50/10 border border-orange-100 flex flex-col justify-between">
          <div>
            <CardTitle className="text-orange-950 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
              <Info size={16} className="text-brand-orange" />
              General Audit Remarks
            </CardTitle>
            <p className="text-xs text-orange-900/80 font-medium leading-relaxed">
              Verify if the cash register totals match the Cash Drawer summary. Online UPI collections should be reconciled with bank statements daily before closing registers.
            </p>
          </div>
          <div className="border-t border-orange-100/50 pt-3 mt-4 text-[10px] text-orange-400 font-bold uppercase">
            RECEPTION OPERATOR AUDIT REPORT
          </div>
        </Card>
      </div>

      {/* Detailed Register list */}
      <Card>
        <CardTitle className="mb-4">Stay Collection Details</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400 font-bold text-xs uppercase">
                <th className="pb-3">Transaction Date</th>
                <th className="pb-3">Receipt No</th>
                <th className="pb-3">Amount Paid</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {pagedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 text-xs text-gray-500" suppressHydrationWarning>
                    {formatDateTime(p.date)}
                  </td>
                  <td className="py-3.5 font-bold text-brand-orange">{p.receiptNo}</td>
                  <td className="py-3.5 text-dark-brown font-extrabold text-sm">₹{p.amount}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded border border-gray-150 text-xs font-bold">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-400 font-medium truncate max-w-[200px]" title={p.notes || ""}>
                    {p.notes || "Stay Advance / Check-out payment"}
                  </td>
                </tr>
              ))}
              {pagedPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">No transaction entries found for the selected date range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-2 pb-1">
          <Pagination
            total={reportCollections.length}
            page={reportPage}
            pageSize={REPORT_PAGE_SIZE}
            onPageChange={setReportPage}
          />
        </div>
      </Card>

      {/* -------------------------------------------------------------
          PRINT ONLY A4 AUDIT REPORT LAYOUT
          Triggered when browser prints this page
          ------------------------------------------------------------- */}
      <PrintPortal>
        <div className="print-only a4-receipt text-black font-serif bg-white p-8">
          <div className="text-center pb-6 border-b-2 border-black">
            <h1 className="text-2xl font-black uppercase">Siddaganga Mata Tumkur</h1>
            <p className="text-sm font-semibold tracking-wider">REVENUE & COLLECTION AUDIT SUMMARY</p>
            <p className="text-xs text-gray-600 mt-1" suppressHydrationWarning>Audit Period: {formatDate(startDate)} to {formatDate(endDate)}</p>
          </div>

          <div className="my-8 grid grid-cols-2 gap-6 text-sm font-semibold">
            <div className="space-y-1">
              <p suppressHydrationWarning>Report Date: {new Date().toLocaleDateString("en-IN")}</p>
              <p>Generated by: System Receptionist</p>
            </div>
            <div className="text-right space-y-1">
              <p>Total Stay Registrations: {filteredBookings.length}</p>
              <p className="text-base font-black">Total Collection: ₹ {totalCollected}.00</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-sm my-6 text-left">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-2 border-r border-black font-bold">Date</th>
                <th className="p-2 border-r border-black font-bold">Receipt No</th>
                <th className="p-2 border-r border-black font-bold">Amount</th>
                <th className="p-2 border-r border-black font-bold">Method</th>
                <th className="p-2 font-bold">Details</th>
              </tr>
            </thead>
            <tbody>
              {reportCollections.map((p) => (
                <tr key={p.id} className="border-b border-black">
                  <td className="p-2 border-r border-black text-xs" suppressHydrationWarning>{formatDateTime(p.date)}</td>
                  <td className="p-2 border-r border-black font-bold">{p.receiptNo}</td>
                  <td className="p-2 border-r border-black font-bold">₹ {p.amount}</td>
                  <td className="p-2 border-r border-black">{p.method}</td>
                  <td className="p-2 text-xs">{p.notes || "Stay stay transaction"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-16 flex justify-between text-xs font-bold pt-16">
            <div className="border-t border-black w-48 text-center pt-2">
              Accounts In-charge Signature
            </div>
            <div className="border-t border-black w-48 text-center pt-2">
              Administrator Signature
            </div>
          </div>
        </div>
      </PrintPortal>
    </div>
  );
}
