"use client";

import { useState, useEffect, useTransition } from "react";
import Pagination from "@/components/ui/Pagination";
import { 
  Search, 
  Filter, 
  Printer, 
  CalendarPlus, 
  ChevronRight, 
  MoveRight, 
  XSquare,
  IndianRupee,
  BedDouble
} from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/use-toast";
import PrintPortal from "@/components/ui/PrintPortal";
import { 
  getRooms, 
  transferRoom, 
  extendStay, 
  cancelBooking 
} from "@/app/actions";
import Link from "next/link";

interface BookingsClientProps {
  initialBookings: any[];
}

export default function BookingsClient({ initialBookings }: BookingsClientProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Data states
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState<any[]>([]);

  // Search/Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Selection states
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Transfer room modal state
  const [transferSelectedRoomId, setTransferSelectedRoomId] = useState("");

  // Stay extension state
  const [extendDays, setExtendDays] = useState(1);

  // Print template selection
  const [activePrintBooking, setActivePrintBooking] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load rooms for transfers
  useEffect(() => {
    async function loadRooms() {
      const data = await getRooms();
      setRooms(data);
    }
    loadRooms();
  }, []);

  // Filter logic — reset to page 1 whenever search/filter changes
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      b.guest?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.guest?.phone.includes(search) ||
      b.room?.roomNumber.includes(search);

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated slice
  const pagedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter/search changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Action: Transfer Room
  const handleTransferSubmit = () => {
    if (!selectedBooking || !transferSelectedRoomId) return;

    startTransition(async () => {
      try {
        const updated = await transferRoom(selectedBooking.id, transferSelectedRoomId);
        
        // Update local list state
        setBookings(prev => 
          prev.map(b => b.id === selectedBooking.id ? { ...b, roomId: transferSelectedRoomId, room: rooms.find(r => r.id === transferSelectedRoomId) } : b)
        );

        toast.success(`Transferred stay to Room ${rooms.find(r => r.id === transferSelectedRoomId)?.roomNumber}`);
        setIsTransferModalOpen(false);
        setSelectedBooking(null);
      } catch (err) {
        toast.error("Transfer failed. Ensure room is available.");
      }
    });
  };

  // Action: Extend Stay
  const handleExtendSubmit = () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      try {
        const extraCost = (selectedBooking.room?.ratePerDay || 300) * extendDays;
        await extendStay(selectedBooking.id, extendDays, extraCost);
        
        // Update local state — no need to refetch everything
        setBookings(prev =>
          prev.map(b => b.id === selectedBooking.id
            ? {
                ...b,
                noOfDays: (b.noOfDays || 0) + extendDays,
                totalAmount: (b.totalAmount || 0) + extraCost,
                balanceAmount: (b.balanceAmount || 0) + extraCost
              }
            : b
          )
        );

        toast.success(`Extended stay by ${extendDays} Days. Additional amount: ₹${extraCost}`);
        setIsExtendModalOpen(false);
        setSelectedBooking(null);
      } catch (err) {
        toast.error("Failed to extend stay.");
      }
    });
  };

  // Action: Cancel Booking
  const handleCancelSubmit = () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      try {
        await cancelBooking(selectedBooking.id);
        
        // Update local state
        setBookings(prev => 
          prev.map(b => b.id === selectedBooking.id ? { ...b, status: "CANCELLED" } : b)
        );

        toast.success("Stay booking cancelled.");
        setIsCancelModalOpen(false);
        setSelectedBooking(null);
      } catch (err) {
        toast.error("Failed to cancel booking.");
      }
    });
  };

  const handlePrintTrigger = (booking: any) => {
    setActivePrintBooking(booking);
    setIsPreviewOpen(true);
  };

  const handleModalPrint = () => {
    setIsPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Booking Register Management</h2>
          <p className="text-sm text-gray-500 font-medium">Verify active stays, transfer rooms, and process stay extensions.</p>
        </div>
        <Link
          href="/bookings/new"
          className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          Check-in New Guest
        </Link>
      </div>

      {/* Query Search / Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, phone, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-orange font-semibold text-dark-brown"
          />
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange font-bold text-dark-brown w-full sm:w-auto"
          >
            <option value="ALL">All Bookings</option>
            <option value="ACTIVE">Active Stays</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table list */}
      <Card className="no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400 font-bold text-xs uppercase">
                <th className="pb-3">Receipt No</th>
                <th className="pb-3">Guest Profile</th>
                <th className="pb-3">Room Stay</th>
                <th className="pb-3">Period & Days</th>
                <th className="pb-3">Balance</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {pagedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 font-bold text-brand-orange">{b.receiptNo}</td>
                  <td className="py-3.5">
                    <div>
                      <p className="font-bold text-dark-brown text-sm">{b.guest?.name}</p>
                      <p className="text-xs text-gray-400">Ph: {b.guest?.phone} | ID: {b.guest?.idNumber}</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div>
                      <p className="font-bold text-dark-brown">Room {b.room?.roomNumber}</p>
                      <p className="text-xs text-gray-400">Standard Room</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(b.checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {new Date(b.checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{b.noOfDays} Days stays</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={b.balanceAmount > 0 ? "text-rose-600 font-bold text-sm" : "text-gray-500"}>
                      ₹{b.balanceAmount}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={b.status === "ACTIVE" ? "active" : b.status === "CHECKED_OUT" ? "checked_out" : "cancelled"}>
                      {b.status === "ACTIVE" ? "Active" : b.status === "CHECKED_OUT" ? "Checked Out" : "Cancelled"}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right space-x-1">
                    <button
                      onClick={() => handlePrintTrigger(b)}
                      title="Print receipt"
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer inline-block"
                    >
                      <Printer size={16} />
                    </button>
                    {b.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setTransferSelectedRoomId(b.roomId);
                            setIsTransferModalOpen(true);
                          }}
                          title="Transfer Room"
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors cursor-pointer inline-block"
                        >
                          <BedDouble size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setExtendDays(1);
                            setIsExtendModalOpen(true);
                          }}
                          title="Extend Stay"
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors cursor-pointer inline-block"
                        >
                          <CalendarPlus size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsCancelModalOpen(true);
                          }}
                          title="Cancel Stay"
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors cursor-pointer inline-block"
                        >
                          <XSquare size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {pagedBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No stays matching filter criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-2 pb-1">
          <Pagination
            total={filteredBookings.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* MODAL 1: ROOM TRANSFER */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Room (Move Guest)"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Current Room</p>
                <p className="font-bold text-dark-brown text-base mt-1">Room {selectedBooking.room?.roomNumber}</p>
                <p className="text-xs text-gray-500">Standard Room</p>
              </div>
              <MoveRight className="text-gray-400" size={24} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Destination Room</p>
                <select
                  value={transferSelectedRoomId}
                  onChange={(e) => setTransferSelectedRoomId(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-brand-orange mt-1.5"
                >
                  <option value="">-- Select Available Room --</option>
                  {rooms
                    .filter(r => r.status === "AVAILABLE" && r.id !== selectedBooking.roomId)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (₹{r.ratePerDay}/Day)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransferSubmit}
                disabled={isPending || !transferSelectedRoomId}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition-all cursor-pointer disabled:opacity-60"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: EXTEND STAY */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Devotee Stay"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs font-semibold text-gray-600">
              <div className="flex justify-between"><span>Current Scheduled Checkout:</span> <span className="text-dark-brown font-bold">{new Date(selectedBooking.checkOutDate).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Room Tariff (Daily):</span> <span className="text-dark-brown font-bold">₹{selectedBooking.room?.ratePerDay}</span></div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Extend Stay By (Days)</label>
              <input
                type="number"
                min={1}
                value={extendDays}
                onChange={(e) => setExtendDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-bold"
              />
            </div>

            <div className="flex items-center justify-between text-sm font-bold border-t border-b border-gray-100 py-3 text-gray-700">
              <span>Additional Accommodation Tariff Due:</span>
              <span className="text-brand-orange font-black">
                ₹ {(selectedBooking.room?.ratePerDay || 0) * extendDays}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsExtendModalOpen(false)}
                className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendSubmit}
                disabled={isPending}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition-all cursor-pointer disabled:opacity-60"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: CANCEL STAY */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Confirm Stay Cancellation"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 font-semibold leading-relaxed">
              Are you sure you want to cancel the stay booking for <strong className="text-dark-brown font-extrabold">{selectedBooking.guest?.name}</strong> in <strong className="text-dark-brown font-extrabold">Room {selectedBooking.room?.roomNumber}</strong>?
            </p>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs font-semibold text-rose-800">
              Note: This action frees the room immediately and marks the booking state as CANCELLED. Any advances collected must be managed manually in cash registers.
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition-all cursor-pointer disabled:opacity-60"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* -------------------------------------------------------------
          PRINT ONLY THERMAL RECEIPT CONTAINER (TRIGGERED BY ICON)
          ------------------------------------------------------------- */}
      {activePrintBooking && (
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
              <div className="flex justify-between"><span>Receipt No:</span><span className="font-bold">{activePrintBooking.receiptNo}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{new Date(activePrintBooking.createdAt).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Status:</span><span className="font-bold">{activePrintBooking.status}</span></div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Guest Details</p>
              <div className="flex justify-between"><span>Name:</span><span className="font-bold">{activePrintBooking.guest?.name}</span></div>
              <div className="flex justify-between"><span>Phone:</span><span>{activePrintBooking.guest?.phone}</span></div>
              <div className="flex justify-between"><span>ID Card:</span><span>{activePrintBooking.guest?.idType} ({activePrintBooking.guest?.idNumber})</span></div>
            </div>

            <div className="space-y-1 py-2.5 my-1.5 border-t border-b border-dashed border-black text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Room Details</p>
              <div className="flex justify-between"><span>Room No:</span><span className="font-bold">Room {activePrintBooking.room?.roomNumber}</span></div>
              <div className="flex justify-between"><span>Check-in:</span><span>{new Date(activePrintBooking.checkInDate || activePrintBooking.createdAt).toLocaleDateString("en-IN")} {new Date(activePrintBooking.checkInDate || activePrintBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Check-out:</span><span>{new Date(activePrintBooking.checkOutDate || activePrintBooking.updatedAt).toLocaleDateString("en-IN")} {new Date(activePrintBooking.checkOutDate || activePrintBooking.updatedAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Days:</span><span>{activePrintBooking.noOfDays} Days</span></div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Financial Ledger</p>
              <div className="flex justify-between"><span>Accommodation Tariff:</span><span>₹ {activePrintBooking.totalAmount}.00</span></div>
              <div className="flex justify-between"><span>Advance Amount Paid:</span><span>₹ {activePrintBooking.advancePaid}.00</span></div>
              {activePrintBooking.balanceAmount < 0 ? (
                <div className="flex justify-between font-bold border-t border-dashed border-black pt-1 text-emerald-600">
                  <span>Refund Due at Checkout:</span>
                  <span>₹ {Math.abs(activePrintBooking.balanceAmount)}.00</span>
                </div>
              ) : (
                <div className="flex justify-between font-bold border-t border-dashed border-black pt-1">
                  <span>Balance Amount Due:</span>
                  <span>₹ {activePrintBooking.balanceAmount}.00</span>
                </div>
              )}
            </div>

            {/* Verification QR Code in Duplicate Print */}
            <div className="flex flex-col items-center justify-center py-2 border-t border-dashed border-black">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `Kalyani Guest House Copy\nReceipt No: ${activePrintBooking.receiptNo}\nGuest Name: ${activePrintBooking.guest?.name}\nRoom Number: ${activePrintBooking.room?.roomNumber}\nBalance Due: Rs. ${activePrintBooking.balanceAmount}`
                )}`} 
                alt="Receipt QR Code"
                className="w-24 h-24 border border-black p-1 bg-white"
              />
              <p className="text-[8px] mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
            </div>

            <div className="text-center py-4 space-y-2 border-t border-black pt-4">
              <p className="text-xs font-bold leading-tight">Thank You!</p>
              <p className="text-[9px] font-semibold italic leading-tight">Have a Safe & Blessed Journey</p>
              <p className="text-[7px] text-gray-500 leading-tight">This is a duplicate printed copy receipt.</p>
            </div>
          </div>
        </PrintPortal>
      )}

      {/* Duplicate Receipt Preview Modal */}
      {activePrintBooking && (
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Duplicate Receipt Preview" size="sm">
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
                <div className="flex justify-between"><span>Receipt No:</span><span className="font-bold">{activePrintBooking.receiptNo}</span></div>
                <div className="flex justify-between"><span>Date:</span><span>{new Date(activePrintBooking.createdAt).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Status:</span><span className="font-bold text-orange-600">{activePrintBooking.status}</span></div>
              </div>

              <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Guest Details</p>
                <div className="flex justify-between"><span>Name:</span><span className="font-bold">{activePrintBooking.guest?.name}</span></div>
                <div className="flex justify-between"><span>Phone:</span><span>{activePrintBooking.guest?.phone}</span></div>
                <div className="flex justify-between"><span>ID Card:</span><span>{activePrintBooking.guest?.idType} ({activePrintBooking.guest?.idNumber})</span></div>
              </div>

              <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Room Details</p>
                <div className="flex justify-between"><span>Room Number:</span><span className="font-bold">Room {activePrintBooking.room?.roomNumber}</span></div>
                <div className="flex justify-between"><span>Duration:</span><span>{activePrintBooking.noOfDays} Days</span></div>
                <div className="flex justify-between"><span>Check-in Time:</span><span>{new Date(activePrintBooking.checkInDate || activePrintBooking.createdAt).toLocaleDateString("en-IN")} {new Date(activePrintBooking.checkInDate || activePrintBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                <div className="flex justify-between"><span>Check-out Time:</span><span>{new Date(activePrintBooking.checkOutDate || activePrintBooking.updatedAt).toLocaleDateString("en-IN")} {new Date(activePrintBooking.checkOutDate || activePrintBooking.updatedAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              </div>

              <div className="space-y-1 text-[10px]">
                <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Ledger Details</p>
                <div className="flex justify-between"><span>Accommodation Cost:</span><span>₹{activePrintBooking.totalAmount}.00</span></div>
                <div className="flex justify-between"><span>Advance Paid:</span><span>- ₹{activePrintBooking.advancePaid}.00</span></div>
                {activePrintBooking.balanceAmount < 0 ? (
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-150 mt-1 text-emerald-600">
                    <span>Refund Due at Checkout:</span>
                    <span>₹{Math.abs(activePrintBooking.balanceAmount)}.00</span>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-150 mt-1">
                    <span>Balance Amount Due:</span>
                    <span className="text-rose-600">Rs. {activePrintBooking.balanceAmount}.00</span>
                  </div>
                )}
              </div>

              {/* Verification QR Code in Duplicate Print */}
              <div className="flex flex-col items-center justify-center py-2 border-t border-dashed border-gray-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `Kalyani Guest House Copy\nReceipt No: ${activePrintBooking.receiptNo}\nGuest Name: ${activePrintBooking.guest?.name}\nRoom Number: ${activePrintBooking.room?.roomNumber}\nBalance Due: Rs. ${activePrintBooking.balanceAmount}`
                  )}`} 
                  alt="Receipt QR Code"
                  className="w-24 h-24 border border-gray-200 p-1 bg-white"
                />
                <p className="text-[8px] mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-gray-200 text-[9px] text-gray-500 font-semibold italic">
                Have a Safe & Blessed Journey!
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleModalPrint}
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
      )}
    </div>
  );
}
