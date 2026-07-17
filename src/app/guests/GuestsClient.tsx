"use client";

import { useState, useEffect } from "react";
import { Search, Phone, User, Users, MapPin, History, PlusCircle, CreditCard, Sparkles, Eye } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

interface GuestsClientProps {
  initialGuests: any[];
}

export default function GuestsClient({ initialGuests }: GuestsClientProps) {
  const [guests, setGuests] = useState<any[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuests = guests.filter((g) => {
    const cleanSearch = searchQuery.toLowerCase().trim();
    if (!cleanSearch) return true;

    return (
      g.name.toLowerCase().includes(cleanSearch) ||
      g.phone.includes(cleanSearch) ||
      g.idNumber.toLowerCase().includes(cleanSearch) ||
      g.district.toLowerCase().includes(cleanSearch)
    );
  });

  // Pagination
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const pagedGuests = filteredGuests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Guest Directory Register</h2>
          <p className="text-sm text-gray-500 font-medium font-semibold">Inspect returning visitor history profiles and family member associations.</p>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Search by Name, Phone, Aadhaar, District..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange font-semibold text-dark-brown"
        />
        <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
      </div>

      {/* Guest profiles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pagedGuests.map((guest) => {
          const family = Array.isArray(guest.familyMembers) ? guest.familyMembers : [];

          return (
            <Card key={guest.id} className="flex flex-col justify-between hover:shadow-premium-lg transition-shadow">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start justify-between border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-dark-brown flex items-center gap-1.5">
                      <User className="text-brand-orange" size={18} />
                      {guest.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{guest.gender}, Age: {guest.age} • {guest.occupation || "Devotee"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/guests/${guest.id}`}
                      className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      View Profile
                    </Link>
                     {!guest.hasActiveStay ? (
                      <Link
                        href={`/bookings/new?phone=${guest.phone}`}
                        className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-brand-orange text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <PlusCircle size={13} />
                        Re-book
                      </Link>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-150 animate-pulse">
                        Staying (Room {guest.activeRoomNumbers || "—"})
                      </span>
                    )}
                  </div>
                </div>

                {/* Info rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{guest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]" title={guest.address}>
                        {guest.district}, {guest.state}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{guest.idType}: {guest.idNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{family.length > 0 ? `${family.length} accompanying members` : "No accompanying family"}</span>
                    </div>
                  </div>
                </div>

                {/* Family members display if any */}
                {family.length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Accompanying Members</p>
                    <div className="flex flex-wrap gap-1.5">
                      {family.map((f: any, idx: number) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-gray-150 text-[10px] font-semibold text-gray-500">
                          {f.name} ({f.relation}, {f.age})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer notes */}
              <div className="border-t border-gray-50 pt-3.5 mt-4 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                <span className="flex items-center gap-1 text-gray-400">
                  <History size={14} />
                  Registered: {new Date(guest.createdAt).toLocaleDateString("en-IN")}
                </span>
                <span className="flex items-center gap-1 text-brand-orange bg-orange-50/50 px-2 py-0.5 rounded-full font-bold">
                  <Sparkles size={12} />
                  Frequent Devotee Stay Profile
                </span>
              </div>
            </Card>
          );
        })}

        {pagedGuests.length === 0 && (
          <div className="col-span-2 py-16 text-center text-gray-400 font-semibold border border-dashed border-gray-200 rounded-xl bg-white">
            No guest profiles matched the search criteria. Try a different lookup.
          </div>
        )}
      </div>

      <Pagination
        total={filteredGuests.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
