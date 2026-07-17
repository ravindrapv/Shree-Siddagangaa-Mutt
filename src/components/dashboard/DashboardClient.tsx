"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  CalendarDays, 
  BedDouble, 
  CheckCircle, 
  IndianRupee, 
  Wallet, 
  CreditCard,
  PlusCircle,
  FolderSync,
  Search,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Info
} from "lucide-react";
import Card, { CardTitle } from "../ui/Card";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import DashboardCharts from "../charts/DashboardCharts";
import { updateRoomStatus, searchGuest } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface DashboardClientProps {
  initialStats: any;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [statsData, setStatsData] = useState(initialStats);
  
  // Tab states
  const [activeFloor, setActiveFloor] = useState<"Ground" | "First" | "Second">("Ground");

  // Modal states
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { stats, recentCheckins, recentPayments, upcomingCheckouts, floorStatus } = statsData;

  // Handle room card click
  const handleRoomClick = (room: any) => {
    // Find active booking for room if occupied
    let activeBooking: any = null;
    if (room.status === "OCCUPIED") {
      // Find inside recentCheckins or search bookings (for demo we look up in statistics)
      const matchingCheckin = recentCheckins.find((c: any) => c.roomNumber === room.roomNumber && c.status === "ACTIVE");
      if (matchingCheckin) {
        activeBooking = matchingCheckin;
      }
    }
    
    setSelectedRoom({ ...room, activeBooking });
    setIsRoomModalOpen(true);
  };

  // Change room status (Cleaning, Maintenance, Available)
  const handleStatusChange = async (newStatus: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => {
    if (!selectedRoom) return;
    
    startTransition(async () => {
      try {
        await updateRoomStatus(selectedRoom.id, newStatus);
        
        // Update local state instantly
        const updatedFloors = { ...floorStatus };
        const floorName = selectedRoom.floor.split(" ")[0]; // "Ground", "First", "Second"
        const floorRooms = updatedFloors[floorName] || [];
        const idx = floorRooms.findIndex((r: any) => r.id === selectedRoom.id);
        if (idx !== -1) {
          floorRooms[idx].status = newStatus;
        }

        // Adjust stats counter
        const oldStatus = selectedRoom.status;
        const newStats = { ...stats };
        
        if (oldStatus === "AVAILABLE") newStats.availableCount--;
        if (oldStatus === "CLEANING") newStats.cleaningCount--;
        if (oldStatus === "MAINTENANCE") newStats.maintenanceCount--;

        if (newStatus === "AVAILABLE") newStats.availableCount++;
        if (newStatus === "CLEANING") newStats.cleaningCount++;
        if (newStatus === "MAINTENANCE") newStats.maintenanceCount++;

        setStatsData({
          ...statsData,
          stats: newStats,
          floorStatus: updatedFloors
        });

        toast.success(`Room ${selectedRoom.roomNumber} set to ${newStatus}`);
        setIsRoomModalOpen(false);
      } catch (err) {
        toast.error("Failed to update room status");
      }
    });
  };

  // Handle guest search in modal
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchGuest(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No guests found matching search query");
      }
    } catch (err) {
      toast.error("Error searching guests");
    } finally {
      setIsSearching(false);
    }
  };

  const kpis = [
    { title: "Today's Check-ins", value: stats.todayCheckinsCount, icon: Users, color: "border-l-4 border-blue-500", desc: "Devotees arrived today" },
    { title: "Today's Check-outs", value: stats.todayCheckoutsCount, icon: CalendarDays, color: "border-l-4 border-amber-500", desc: "Rooms vacated today" },
    { title: "Rooms Occupied", value: stats.occupiedCount, icon: BedDouble, color: "border-l-4 border-rose-500", desc: `${Math.round((stats.occupiedCount / (stats.occupiedCount + stats.availableCount + stats.cleaningCount + stats.maintenanceCount)) * 100) || 0}% occupancy rate` },
    { title: "Rooms Available", value: stats.availableCount, icon: CheckCircle, color: "border-l-4 border-emerald-500", desc: "Ready for check-in" },
    { title: "Today's Collection", value: `₹${(stats.todayCollection || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "border-l-4 border-brand-orange text-brand-orange", desc: "Stay charges finalized today" },
    { title: "Last 7 Days Collection", value: `₹${(stats.last7DaysCollection || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "border-l-4 border-teal-500 text-teal-650", desc: "Finalized collections last 7 days" },
    { title: "Last Month's Collection", value: `₹${(stats.lastMonthCollection || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "border-l-4 border-indigo-500 text-indigo-650", desc: "Finalized collections last 30 days" },
    { title: "Year's Collection", value: `₹${(stats.yearCollection || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "border-l-4 border-purple-500 text-purple-650", desc: "Finalized collections last 365 days" },
    { title: "Total Collection", value: `₹${(stats.totalCollection || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "border-l-4 border-emerald-600 text-emerald-750", desc: "All-time finalized stay revenue" }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 font-medium">Welcome to the Kalyani Guest House Stay portal.</p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <Link
            href="/bookings/new"
            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            New Booking
          </Link>
          <Link
            href="/checkout"
            className="flex items-center gap-2 bg-dark-brown hover:bg-dark-brown-light text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FolderSync size={16} />
            Vacate/Checkout
          </Link>
          <button 
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Search size={16} />
            Search Guest
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className={`${kpi.color} overflow-hidden`} hoverEffect>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{kpi.title}</p>
                  <h4 className="text-2xl font-extrabold text-dark-brown leading-none">{kpi.value}</h4>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-3 border-t border-gray-50 pt-2">{kpi.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Recharts Analytics graphs */}
      <DashboardCharts cash={stats.cashCollection} upi={stats.upiCollection} card={stats.cardCollection} />

      {/* Main Floor-wise Plan and Lists panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Floor-wise room occupancy layout */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <CardTitle>Floor-wise Room Grid Plan</CardTitle>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(["Ground", "First", "Second"] as const).map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setActiveFloor(floor)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeFloor === floor
                        ? "bg-white text-brand-orange shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {floor} Floor
                  </button>
                ))}
              </div>
            </div>

            {/* Room cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(floorStatus[activeFloor] || []).map((room: any) => {
                const statusStyles = {
                  AVAILABLE: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60 text-emerald-800",
                  OCCUPIED: "border-rose-200 bg-rose-50 hover:bg-rose-100/60 text-rose-800",
                  CLEANING: "border-amber-200 bg-amber-50 hover:bg-amber-100/60 text-amber-800 animate-soft-pulse",
                  MAINTENANCE: "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
                };
                
                const statusText = {
                  AVAILABLE: "Available",
                  OCCUPIED: "Occupied",
                  CLEANING: "Cleaning",
                  MAINTENANCE: "Maintenance"
                };

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`group relative border rounded-xl p-4 text-left transition-all duration-200 flex flex-col justify-between h-[120px] shadow-sm hover:scale-[1.02] cursor-pointer overflow-hidden ${statusStyles[room.status as keyof typeof statusStyles]}`}
                  >
                    {room.status === "OCCUPIED" && room.occupiedDetails && (
                      <div className="absolute inset-0 bg-rose-950/95 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between z-10 text-xs">
                        <div>
                          <p className="text-[9px] text-rose-300 font-bold uppercase tracking-wider">Occupied By</p>
                          <p className="font-extrabold text-xs mt-0.5 truncate">{room.occupiedDetails.guestName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-rose-300 font-bold uppercase">Scheduled Out</p>
                          <p className="font-semibold text-[10px] mt-0.5">
                            {new Date(room.occupiedDetails.checkOutDate).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between w-full">
                      <span className="text-lg font-black">{room.roomNumber}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-black/5">
                        {statusText[room.status as keyof typeof statusText]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate opacity-85">Standard Room</p>
                      <div className="flex items-center justify-between text-[11px] font-semibold mt-2 opacity-75">
                        <span>Cap: {room.capacity}</span>
                        <span>₹{room.ratePerDay}/Day</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Room color legends */}
            <div className="flex flex-wrap gap-4 items-center justify-center border-t border-gray-100 pt-6 mt-6 text-xs font-bold text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-400"></span>
                <span>Maintenance</span>
              </div>
            </div>
          </Card>

          {/* Recent Check-ins Table */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <CardTitle>Recent Check-ins & Bookings</CardTitle>
              <Link href="/bookings" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-xs uppercase">
                    <th className="pb-3">Receipt No</th>
                    <th className="pb-3">Guest Name</th>
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Check-in Date</th>
                    <th className="pb-3">Balance</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                  {recentCheckins.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-brand-orange">
                        <Link href={`/bookings?receipt=${item.receiptNo}`}>
                          {item.receiptNo}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-semibold text-dark-brown">{item.guestName}</p>
                          <p className="text-xs text-gray-400">{item.phone}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-bold">Room {item.roomNumber}</p>
                          <p className="text-xs text-gray-400">{item.roomType}</p>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {new Date(item.checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3">
                        <span className={item.balanceAmount > 0 ? "text-rose-600 font-bold" : "text-gray-500"}>
                          ₹{item.balanceAmount}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={item.status === "ACTIVE" ? "active" : item.status === "CHECKED_OUT" ? "checked_out" : "cancelled"}>
                          {item.status === "ACTIVE" ? "Active" : item.status === "CHECKED_OUT" ? "Checked Out" : "Cancelled"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {recentCheckins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400 text-xs">No recent check-ins recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar panels on dashboard */}
        <div className="space-y-6">
          
          {/* Shree Siddaganga Mutt Swamijis Card */}
          <Card className="border-t-4 border-brand-orange">
            <CardTitle className="mb-4 text-brand-orange flex items-center gap-1.5">
              <span>🕉️ Swamijis of Shree Siddaganga Mutt</span>
            </CardTitle>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-orange-100 flex-shrink-0">
                  <img src="/swami-senior.jpg" className="w-full h-full object-cover object-top scale-110" alt="Dr. Sri Sri Sri Shivakumara Swamiji" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-dark-brown truncate">Dr. Sri Sri Sri Shivakumara Swamiji</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-tight">Founder & Late Senior Swamiji</p>
                  <p className="text-[9px] text-brand-orange italic font-bold">"Trividha Dasoha" (Food, Shelter, Edu)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-orange-100 flex-shrink-0">
                  <img src="/swami-current.jpg" className="w-full h-full object-cover object-top scale-110" alt="Sri Sri Sri Siddalinga Swamiji" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-dark-brown truncate">Sri Sri Sri Siddalinga Swamiji</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-tight">Current President of the Mutt Trust</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Guiding Education & Social Services</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-orange-100 flex-shrink-0">
                  <img src="/swami-assistant.jpg" className="w-full h-full object-cover object-top scale-110" alt="Mutt Trustee Swamiji" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-dark-brown truncate">Sri Swamiji of the Mutt Trust</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-tight">Senior Administrator & Trustee</p>
                  <p className="text-[9px] text-gray-400 font-medium">Shree Siddaganga Mutt, Tumkur</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions List */}
          <Card>
            <CardTitle className="mb-4">Quick Administrative Operations</CardTitle>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/bookings/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 text-brand-orange transition-all font-bold text-sm cursor-pointer"
              >
                <PlusCircle size={18} />
                New Guest Check-in
              </Link>
              <Link
                href="/checkout"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm cursor-pointer"
              >
                <FolderSync size={18} />
                Process Guest Check-out
              </Link>
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm text-left cursor-pointer"
              >
                <Printer size={18} />
                Print Cash Daily Summary
              </button>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm text-left cursor-pointer"
              >
                <Search size={18} />
                Find Guest Register Profile
              </button>
              <Link
                href="/reports"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm cursor-pointer"
              >
                <FileSpreadsheet size={18} />
                Generate Revenue Report
              </Link>
            </div>
          </Card>

          {/* Upcoming checkout notifications */}
          <Card>
            <CardTitle className="mb-4">Upcoming Check-outs Today</CardTitle>
            <div className="space-y-4">
              {upcomingCheckouts.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <h5 className="text-sm font-bold text-dark-brown">{item.guestName}</h5>
                    <p className="text-xs text-gray-400">
                      Room <strong className="text-gray-600 font-semibold">{item.roomNumber}</strong> • Vacating: {new Date(item.checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-rose-600">Bal: ₹{item.balanceAmount}</span>
                    <Link
                      href={`/checkout?receipt=${item.receiptNo}`}
                      className="inline-block text-[10px] font-bold text-brand-orange hover:underline mt-1"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              ))}
              {upcomingCheckouts.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400 font-medium">No check-outs scheduled for today.</div>
              )}
            </div>
          </Card>

          {/* Recent Collection feed */}
          <Card>
            <CardTitle className="mb-4">Recent Receipts Collected</CardTitle>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {recentPayments.map((item: any, idx: number) => {
                const methodColors = {
                  CASH: "bg-emerald-100 text-emerald-800",
                  UPI: "bg-sky-100 text-sky-800",
                  CARD: "bg-indigo-100 text-indigo-800",
                  MIXED: "bg-purple-100 text-purple-800"
                };

                return (
                  <div key={item.id || idx} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                    <div className="p-2 bg-orange-50 rounded-xl text-brand-orange flex-shrink-0 font-black text-xs">
                      ₹
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-dark-brown truncate">{item.guestName}</span>
                        <span className="text-sm font-extrabold text-dark-brown">₹{item.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mt-1">
                        <span>{item.receiptNo}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${methodColors[item.method as keyof typeof methodColors]}`}>
                          {item.method}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentPayments.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400 font-medium">No transactions recorded yet today.</div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* ROOM INTERACTIVE OPTION MODAL */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={`Room Status Controls: Room ${selectedRoom?.roomNumber || ""}`}
      >
        {selectedRoom && (
          <div className="space-y-6">
            {/* Info details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Room Type:</span>
                <span className="text-dark-brown font-bold">Standard Room</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Floor Location:</span>
                <span className="text-dark-brown font-bold">{selectedRoom.floor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Base tariff:</span>
                <span className="text-dark-brown font-bold">₹{selectedRoom.ratePerDay} per Day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Capacity:</span>
                <span className="text-dark-brown font-bold">{selectedRoom.capacity} Persons</span>
              </div>
              {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Amenities:</span>
                  <span className="text-dark-brown font-semibold">{selectedRoom.facilities.join(", ")}</span>
                </div>
              )}
            </div>

            {/* If OCCUPIED, display booking preview */}
            {selectedRoom.status === "OCCUPIED" && (
              <div className="border border-red-100 bg-red-50/30 p-4 rounded-xl space-y-4">
                <div className="flex items-start gap-2.5 text-rose-800">
                  <Info size={18} className="mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Currently Occupied</h5>
                    {selectedRoom.activeBooking ? (
                      <div className="mt-2 space-y-1 text-xs text-rose-900/80 font-medium">
                        <p>Guest: <strong className="text-rose-950 font-bold">{selectedRoom.activeBooking.guestName}</strong></p>
                        <p>Phone: {selectedRoom.activeBooking.phone}</p>
                        <p>Check-out Scheduled: {new Date(selectedRoom.activeBooking.checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        <p>Unpaid Balance: <strong className="text-rose-900 font-bold">₹{selectedRoom.activeBooking.balanceAmount}</strong></p>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-900/60 mt-1">Room details are loaded. Please query Bookings ledger for full guest records.</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={selectedRoom.activeBooking ? `/checkout?receipt=${selectedRoom.activeBooking.receiptNo}` : "/checkout"}
                    className="flex-1 text-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Proceed to Check-Out
                  </Link>
                  <Link
                    href="/bookings"
                    className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    View All Active stays
                  </Link>
                </div>
              </div>
            )}

            {/* Status updates for AVAILABLE, CLEANING, MAINTENANCE */}
            {selectedRoom.status !== "OCCUPIED" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Modify Room State</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    disabled={selectedRoom.status === "AVAILABLE" || isPending}
                    onClick={() => handleStatusChange("AVAILABLE")}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedRoom.status === "AVAILABLE"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-gray-200 hover:bg-emerald-50/30 hover:border-emerald-200 text-emerald-600"
                    } disabled:opacity-60`}
                  >
                    Set Available
                  </button>
                  <button
                    disabled={selectedRoom.status === "CLEANING" || isPending}
                    onClick={() => handleStatusChange("CLEANING")}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedRoom.status === "CLEANING"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-white border-gray-200 hover:bg-amber-50/30 hover:border-amber-200 text-amber-600"
                    } disabled:opacity-60`}
                  >
                    Set Cleaning
                  </button>
                  <button
                    disabled={selectedRoom.status === "MAINTENANCE" || isPending}
                    onClick={() => handleStatusChange("MAINTENANCE")}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedRoom.status === "MAINTENANCE"
                        ? "bg-gray-100 border-gray-300 text-gray-700"
                        : "bg-white border-gray-200 hover:bg-gray-100/50 hover:border-gray-300 text-gray-600"
                    } disabled:opacity-60`}
                  >
                    Set Maintenance
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsRoomModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QUICK GUEST SEARCH MODAL */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        title="Find Guest Register Profile"
      >
        <div className="space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Search by Name, Phone, Aadhaar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Results grid */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {searchResults.map((guest: any) => (
              <div 
                key={guest.id} 
                className="p-4 border border-gray-100 hover:border-orange-100 rounded-xl bg-gray-50/50 hover:bg-orange-50/10 transition-all flex items-center justify-between"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-dark-brown">{guest.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Phone: {guest.phone} | ID: {guest.idType} ({guest.idNumber})</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{guest.address}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <Link
                    href={`/bookings/new?phone=${guest.phone}`}
                    onClick={() => setIsSearchModalOpen(false)}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Book Stay Again
                  </Link>
                  <Link
                    href={`/guests?phone=${guest.phone}`}
                    onClick={() => setIsSearchModalOpen(false)}
                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View History
                  </Link>
                </div>
              </div>
            ))}
            
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-8 text-xs text-gray-400 font-semibold border border-dashed border-gray-100 rounded-xl">
                No matching profiles found. Try checking the inputs.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
