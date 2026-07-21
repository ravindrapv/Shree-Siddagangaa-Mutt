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
  cancelBooking,
  getBookingsPaged
} from "@/app/actions";
import Link from "next/link";

// Helper to render a highly polished A4 receipt copy (Devotee or Office copy)
export const renderA4Receipt = (booking: any, copyType: "devotee" | "office", additionalCharges: number = 0, chargeNotes: string = "") => {
  if (!booking) return null;
  
  // Resolve active guesthouse name dynamically
  const isYathri = booking.guestHouseId === "b2d9a726-6f71-55af-c9e5-649d3cc1f5d0" || 
                   booking.guestHouseId === "guesthouse_yathrinivasa" ||
                   booking.building === "Yathri Nivasa" || 
                   booking.guestHouse?.code === "YATHRI";
  const guestHouseKannada = booking.guestHouse?.nameKn || (isYathri ? "ಯಾತ್ರಿ ನಿವಾಸ" : "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ");
  const guestHouseEnglish = booking.guestHouse?.name || (isYathri ? "Yathri Nivasa" : "Kalyani Guest House");
  
  const formattedCheckIn = booking.checkInDate 
    ? new Date(booking.checkInDate).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) 
    : new Date(booking.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
    
  const formattedCheckOut = booking.checkOutDate 
    ? new Date(booking.checkOutDate).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
    : booking.status === "CHECKED_OUT" 
      ? new Date(booking.updatedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
      : "ವಾಸ್ತವ್ಯದಲ್ಲಿದ್ದಾರೆ (Stay Active)";

  const totalSettled = booking.totalAmount + additionalCharges;

  return (
    <div className="a4-receipt-card text-black font-sans relative border-2 border-black p-5 rounded-md flex flex-col justify-between" style={{ height: "124mm", boxSizing: "border-box" }}>
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-black pb-2.5">
        {/* Three Swamiji Photos */}
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-black bg-white">
            <img src="/swami-senior.jpg" className="w-full h-full object-cover object-top scale-110" alt="Dr. S. Swamiji" />
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-black bg-white">
            <img src="/swami-current.jpg" className="w-full h-full object-cover object-top scale-110" alt="Sri S. Swamiji" />
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-black bg-white">
            <img src="/swami-assistant.jpg" className="w-full h-full object-cover object-top scale-110" alt="Sri Swamiji" />
          </div>
        </div>
        
        {/* Center Title */}
        <div className="text-center flex-1 mx-4">
          <h2 className="text-[15px] font-black tracking-wide leading-tight text-black font-bold">ಶ್ರೀ ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು</h2>
          <h3 className="text-[13px] font-extrabold text-orange-600 leading-tight mt-0.5">{guestHouseKannada} ({guestHouseEnglish})</h3>
          <p className="text-[8px] text-gray-500 font-semibold leading-tight mt-0.5">ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ. (KYATSANDRA, Siddaganga Math, Tumkur District.)</p>
        </div>

        {/* Right Info (QR & Copy Label) */}
        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-[8px] font-black px-2 py-0.5 border border-black bg-gray-50 rounded uppercase tracking-wider text-black font-bold">
            {copyType === "devotee" ? "ಭಕ್ತರ ಪ್ರತಿ / DEVOTEE COPY" : "ಕಚೇರಿ ಪ್ರತಿ / OFFICE COPY"}
          </div>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              `${guestHouseEnglish} - ${copyType === "devotee" ? "Devotee Copy" : "Office Copy"}\nReceipt No: ${booking.receiptNo}\nGuest Name: ${booking.guest?.name}\nRoom: Room ${booking.room?.roomNumber || "N/A"}\nAmount: Rs. ${totalSettled}`
            )}`} 
            alt="QR Code" 
            className="w-12 h-12 border border-black p-0.5 bg-white"
          />
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-2 text-[10.5px] border-b border-black">
        {/* Left Side Details */}
        <div className="space-y-1.5 border-r border-dashed border-gray-300 pr-4">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ರಶೀದಿ ಸಂಖ್ಯೆ (Receipt No):</span>
            <span className="font-bold">{booking.receiptNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ದಿನಾಂಕ (Receipt Date):</span>
            <span>{new Date(booking.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-600 font-medium">ಭಕ್ತರ ಹೆಸರು (Guest Name):</span>
            <span className="font-bold uppercase text-black">{booking.guest?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone):</span>
            <span>{booking.guest?.phone}</span>
          </div>
          <div className="flex justify-between items-start gap-2">
            <span className="text-gray-600 font-medium flex-shrink-0">ವಿಳಾಸ (Address):</span>
            <span className="font-semibold text-right text-black leading-tight break-words max-w-[170px]">
              {booking.guest?.address || "Bangalore"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಗುರುತಿನ chiiTi (ID):</span>
            <span className="truncate max-w-[110px]">{booking.guest?.idType} ({booking.guest?.idNumber})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಜನರ ಸಂಖ್ಯೆ (No. of Persons):</span>
            <span className="font-semibold">{booking.noOfPersons || 1}</span>
          </div>
        </div>

        {/* Right Side Details */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಸ್ಥಿತಿ (Status):</span>
            <span className="font-bold uppercase text-orange-600">{booking.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಕೋಣೆ ಸಂಖ್ಯೆ (Room No):</span>
            <span className="font-bold">Room {booking.room?.roomNumber || "N/A"}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-600 font-medium">ಪ್ರವೇಶ ದಿನಾಂಕ (Check-in):</span>
            <span>{formattedCheckIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಬಿಡುಗಡೆ ದಿನಾಂಕ (Check-out):</span>
            <span>{formattedCheckOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ವಾಸ್ತವ್ಯದ ಅವಧಿ (Stay Days):</span>
            <span className="font-semibold">{booking.noOfDays} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">ಕೋಣೆ ಬಾಡಿಗೆ (Room Tariff):</span>
            <span>₹ {booking.room?.ratePerDay || 300}.00 / day</span>
          </div>
        </div>
      </div>

      {/* Financial ledger section */}
      {(() => {
        const netBalance = booking.totalAmount + additionalCharges - booking.advancePaid;
        const isRefund = netBalance < 0;
        const refundAmount = Math.abs(netBalance);
        return (
          <div className="py-2.5 text-[10.5px]">
            <div className="bg-gray-50 border border-black rounded p-2 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Accommodation Cost</p>
                <p className="font-bold text-xs text-black">₹ {booking.totalAmount}.00</p>
              </div>
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Advance Paid</p>
                <p className="font-bold text-xs text-black">₹ {booking.advancePaid}.00</p>
              </div>
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Extra / Additional</p>
                <p className="font-bold text-xs text-black">₹ {additionalCharges}.00</p>
              </div>
              <div className="border-l border-black pl-2">
                <p className="text-[8px] text-brand-orange font-bold uppercase">
                  {isRefund ? "Refund Amount" : "Grand Total"}
                </p>
                <p className={`font-black text-xs ${isRefund ? "text-green-600 font-black animate-pulse" : "text-brand-orange"}`}>
                  ₹ {isRefund ? refundAmount : totalSettled}.00
                </p>
              </div>
            </div>
            {chargeNotes && <p className="text-[8px] italic text-gray-600 mt-1 ml-1">Note: {chargeNotes}</p>}
          </div>
        );
      })()}

      {/* Footer message and Signature */}
      <div className="flex justify-between items-end border-t border-black pt-2 text-[9px]">
        <div className="space-y-0.5">
          <p className="font-bold text-dark-brown">
            {booking.status === "CHECKED_OUT" 
              ? "ಧನ್ಯವಾದಗಳು - ನಿಮ್ಮ ಪ್ರಯಾಣ ಸುಖಕರವಾಗಿರಲಿ (Thank you - Have a safe journey)" 
              : "ಸುಸ್ವಾಗತ - ಶ್ರೀ ಸಿದ್ದಗಂಗಾ ಮಠಕ್ಕೆ ತಮಗೆ ಆದರದ ಸುಸ್ವಾಗತ (Welcome to Shree Siddaganga Mutt)"}
          </p>
          <p className="text-[7.5px] text-gray-500 italic">This is an authenticated print copy receipt generated by stay registry system.</p>
        </div>
        
        {copyType === "office" ? (
          <div className="flex gap-4">
            <div className="text-center w-24 border-t border-black pt-1 mt-4">
              <p className="font-bold text-[8px] uppercase tracking-wider text-black font-sans">Devotee Signature</p>
            </div>
            <div className="text-center w-24 border-t border-black pt-1 mt-4">
              <p className="font-bold text-[8px] uppercase tracking-wider text-black font-sans">Authorized Signature</p>
            </div>
          </div>
        ) : (
          <div className="text-center w-36 border-t border-black pt-1 mt-4">
            <p className="font-bold text-[8px] uppercase tracking-wider text-black font-sans">Authorized Signature</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface BookingsClientProps {
  initialBookings: any[];
  initialTotalCount: number;
}

export default function BookingsClient({ initialBookings, initialTotalCount }: BookingsClientProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Data states
  const [bookings, setBookings] = useState(initialBookings);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [rooms, setRooms] = useState<any[]>([]);

  // Search/Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

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

  // Fetch data from server when search, statusFilter, or page changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getBookingsPaged(search, statusFilter, page, PAGE_SIZE);
        setBookings(res.bookings);
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    if (page === 1 && search === "" && statusFilter === "ALL") {
      setBookings(initialBookings);
      setTotalCount(initialTotalCount);
      return;
    }

    const delayDebounce = setTimeout(() => {
      loadData();
    }, search ? 300 : 0);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, page]);

  // Reset page when search or status filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const pagedBookings = bookings;

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
            total={totalCount}
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
          PRINT ONLY A4 RECEIPT CONTAINER (2 COPIES)
          ------------------------------------------------------------- */}
      {activePrintBooking && (
        <PrintPortal>
          <div className="print-only a4-print-wrapper">
            {renderA4Receipt(activePrintBooking, "devotee")}
            <div className="a4-divider"></div>
            {renderA4Receipt(activePrintBooking, "office")}
          </div>
        </PrintPortal>
      )}

      {/* Duplicate Receipt Preview Modal */}
      {activePrintBooking && (
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Receipt Preview (A4 Size - Duplicate Copy)" size="lg">
          <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center gap-4 no-print overflow-y-auto max-h-[70vh]">
            <div className="scale-90 origin-top shadow-lg bg-white rounded-md border border-gray-300">
              {renderA4Receipt(activePrintBooking, "devotee")}
            </div>
            <div className="w-[194mm] border-t border-dashed border-gray-400 text-center py-2 text-xs font-bold text-gray-500">
              ✂ ಕತ್ತರಿಸುವ ಗೆರೆ (Cut Here) ✂
            </div>
            <div className="scale-90 origin-top shadow-lg bg-white rounded-md border border-gray-300">
              {renderA4Receipt(activePrintBooking, "office")}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 no-print">
            <button
              onClick={handleModalPrint}
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
      )}
    </div>
  );
}
