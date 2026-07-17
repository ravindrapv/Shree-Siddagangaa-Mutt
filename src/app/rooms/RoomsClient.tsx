"use client";

import { useState, useTransition } from "react";
import { BedDouble, Info, CheckCircle2, RefreshCw, Filter } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { updateRoomStatus } from "@/app/actions";

interface RoomsClientProps {
  initialRooms: any[];
}

export default function RoomsClient({ initialRooms }: RoomsClientProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [rooms, setRooms] = useState<any[]>(initialRooms);
  const [activeFloor, setActiveFloor] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection states
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status changes
  const handleStatusChange = async (newStatus: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => {
    if (!selectedRoom) return;

    startTransition(async () => {
      try {
        await updateRoomStatus(selectedRoom.id, newStatus);
        
        // Update local list
        setRooms(prev => 
          prev.map(r => r.id === selectedRoom.id ? { ...r, status: newStatus } : r)
        );

        toast.success(`Room ${selectedRoom.roomNumber} set to ${newStatus}`);
        setIsModalOpen(false);
        setSelectedRoom(null);
      } catch (err) {
        toast.error("Failed to update room status.");
      }
    });
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    const matchesFloor = activeFloor === "ALL" || r.floor === activeFloor;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesFloor && matchesStatus;
  });

  // KPI counters
  const total = rooms.length;
  const available = rooms.filter(r => r.status === "AVAILABLE").length;
  const occupied = rooms.filter(r => r.status === "OCCUPIED").length;
  const cleaning = rooms.filter(r => r.status === "CLEANING").length;
  const maintenance = rooms.filter(r => r.status === "MAINTENANCE").length;

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Premises Rooms Grid</h2>
          <p className="text-sm text-gray-500 font-medium">Configure room availability status, daily tariffs, and amenities.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Rooms", count: total, color: "border-l-4 border-gray-400" },
          { label: "Available Rooms", count: available, color: "border-l-4 border-emerald-500 text-emerald-700" },
          { label: "Occupied Rooms", count: occupied, color: "border-l-4 border-rose-500 text-rose-700" },
          { label: "Under Cleaning", count: cleaning, color: "border-l-4 border-amber-500 text-amber-700" },
          { label: "Maintenance", count: maintenance, color: "border-l-4 border-gray-500 text-gray-700" }
        ].map((item, idx) => (
          <Card key={idx} className={`${item.color} py-4 px-5`}>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
            <h4 className="text-xl font-black mt-1">{item.count}</h4>
          </Card>
        ))}
      </div>

      {/* Floor / Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex bg-gray-150 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {["ALL", "Ground Floor", "First Floor", "Second Floor"].map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFloor === floor
                  ? "bg-white text-brand-orange shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {floor === "ALL" ? "All Floors" : floor.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange font-bold text-dark-brown w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING">Cleaning</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid of rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRooms.map((room) => {
          const statusStyles = {
            AVAILABLE: "border-emerald-250 bg-emerald-50 hover:bg-emerald-100/60 text-emerald-800",
            OCCUPIED: "border-rose-250 bg-rose-50 text-rose-800 cursor-not-allowed",
            CLEANING: "border-amber-250 bg-amber-50 hover:bg-amber-100/60 text-amber-800 animate-soft-pulse",
            MAINTENANCE: "border-gray-250 bg-gray-50 hover:bg-gray-100 text-gray-600"
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
              onClick={() => {
                setSelectedRoom(room);
                setIsModalOpen(true);
              }}
              className={`group relative border rounded-xl p-4 text-left transition-all duration-200 flex flex-col justify-between h-[130px] shadow-sm hover:scale-[1.02] cursor-pointer overflow-hidden ${statusStyles[room.status as keyof typeof statusStyles]}`}
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
                <p className="text-[10px] text-gray-400 mt-1">{room.floor}</p>
                <div className="flex items-center justify-between text-[11px] font-semibold mt-1 opacity-75">
                  <span>Cap: {room.capacity}</span>
                  <span>₹{room.ratePerDay}/Day</span>
                </div>
              </div>
            </button>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 font-semibold border border-dashed border-gray-200 rounded-xl bg-white">
            No rooms matched the selected filter states.
          </div>
        )}
      </div>

      {/* Status Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Room State: Room ${selectedRoom?.roomNumber || ""}`}
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs font-semibold text-gray-600">
              <div className="flex justify-between"><span>Room Type:</span> <span className="text-dark-brown font-bold">Standard Room</span></div>
              <div className="flex justify-between"><span>Floor Location:</span> <span className="text-dark-brown font-bold">{selectedRoom.floor}</span></div>
              <div className="flex justify-between"><span>Daily Tariff:</span> <span className="text-dark-brown font-bold">₹{selectedRoom.ratePerDay} per Day</span></div>
              <div className="flex justify-between"><span>Facilities:</span> <span className="text-dark-brown">{selectedRoom.facilities?.join(", ") || "None"}</span></div>
            </div>

            {/* If OCCUPIED, display checkout helper */}
            {selectedRoom.status === "OCCUPIED" && (
              <div className="border border-red-100 bg-red-50/30 p-4 rounded-xl space-y-4">
                <div className="flex items-start gap-2.5 text-rose-850">
                  <Info size={18} className="mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-rose-900">Currently Occupied</h5>
                    {selectedRoom.occupiedDetails ? (
                      <div className="mt-2 space-y-1 text-xs text-rose-900/80 font-medium">
                        <p>Guest: <strong className="text-rose-950 font-bold">{selectedRoom.occupiedDetails.guestName}</strong></p>
                        <p>Check-out Scheduled: {new Date(selectedRoom.occupiedDetails.checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-900/60 mt-1">Room details are loaded. Please query Bookings ledger for full guest records.</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={selectedRoom.occupiedDetails?.receiptNo ? `/checkout?receipt=${selectedRoom.occupiedDetails.receiptNo}` : "/checkout"}
                    className="flex-1 text-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Proceed to Check-Out
                  </Link>
                </div>
              </div>
            )}

            {/* Status updates for AVAILABLE, CLEANING, MAINTENANCE */}
            {selectedRoom.status !== "OCCUPIED" && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Change Status</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={selectedRoom.status === "AVAILABLE" || isPending}
                    onClick={() => handleStatusChange("AVAILABLE")}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedRoom.status === "AVAILABLE"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-gray-200 hover:bg-emerald-50/30 hover:border-emerald-250 text-emerald-600"
                    } disabled:opacity-60`}
                  >
                    Set Available
                  </button>
                  <button
                    type="button"
                    disabled={selectedRoom.status === "CLEANING" || isPending}
                    onClick={() => handleStatusChange("CLEANING")}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedRoom.status === "CLEANING"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-white border-gray-200 hover:bg-amber-50/30 hover:border-amber-250 text-amber-600"
                    } disabled:opacity-60`}
                  >
                    Set Cleaning
                  </button>
                  <button
                    type="button"
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
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
