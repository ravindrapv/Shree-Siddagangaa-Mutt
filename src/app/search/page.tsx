"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, User, Bed, CreditCard, FolderSync } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { searchGuest, getBookings } from "../actions";
import { useToast } from "@/hooks/use-toast";

export default function GlobalSearchPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    guests: any[];
    bookings: any[];
  }>({ guests: [], bookings: [] });

  // Debounced search for suggestions list
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const matches = await searchGuest(query);
        setSuggestions(matches.slice(0, 6));
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery !== undefined ? customQuery : query;
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSuggestions([]);
    try {
      const guestResults = await searchGuest(searchQuery);
      
      const allBookings = await getBookings();
      const cleanQuery = searchQuery.toLowerCase().trim();
      const bookingsResults = allBookings.filter((b: any) => 
        b.receiptNo.toLowerCase().includes(cleanQuery) ||
        (b.room?.roomNumber && b.room.roomNumber.toLowerCase().includes(cleanQuery)) ||
        (b.guest?.name && b.guest.name.toLowerCase().includes(cleanQuery)) ||
        (b.guest?.phone && b.guest.phone.includes(cleanQuery))
      );

      // Filter out guest cards if they already have an active booking displayed in results to avoid duplicates
      const finalGuests = guestResults.filter(g => 
        !bookingsResults.some(b => b.guestId === g.id && b.status === "ACTIVE")
      );

      setResults({
        guests: finalGuests,
        bookings: bookingsResults
      });

      if (guestResults.length === 0 && bookingsResults.length === 0) {
        toast.info("No matching records found.");
      } else {
        toast.success(`Found ${guestResults.length + bookingsResults.length} matching entries.`);
      }
    } catch (err) {
      toast.error("Failed to execute global search query");
    } finally {
      setIsSearching(false);
    }
  };

  const totalResults = results.guests.length + results.bookings.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Global Search Register</h2>
          <p className="text-sm text-gray-500 font-medium">Lookup guest profiles, receipt numbers, and stays instantly.</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={(e) => handleSearch(e)} className="flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              required
              placeholder="Type Guest Name, Phone, Aadhaar, Receipt ID (e.g. Ramesh, 98865, RCP1248)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold shadow-sm"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-50">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setQuery(s.name);
                      setSuggestions([]);
                      handleSearch(undefined, s.name);
                    }}
                    className="w-full text-left px-4 py-3 text-xs text-dark-brown font-semibold hover:bg-orange-50/50 flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-extrabold text-dark-brown">{s.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold ml-2">({s.phone})</span>
                    </div>
                    <span className="text-[9px] text-brand-orange bg-orange-50/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {s.district}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            <Search size={16} />
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
      </Card>

      {/* Results */}
      {totalResults > 0 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Guest Results */}
          {results.guests.length > 0 && (
            <Card>
              <CardTitle className="mb-4 flex items-center gap-2">
                <User size={18} className="text-brand-orange" />
                Matching Guest Profiles ({results.guests.length})
              </CardTitle>
              <div className="divide-y divide-gray-50">
                {results.guests.map((g) => (
                  <div key={g.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-dark-brown">{g.name}</h4>
                      <p className="text-xs text-gray-450 mt-1">Phone: {g.phone} | ID: {g.idType} ({g.idNumber})</p>
                      <p className="text-xs text-gray-400 mt-0.5">District: {g.district} | State: {g.state}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {!g.hasActiveStay ? (
                        <Link
                          href={`/bookings/new?phone=${g.phone}`}
                          className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Quick Check-in
                        </Link>
                      ) : (
                        <Link
                          href={`/checkout?receipt=${g.activeReceiptNo || ""}`}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Checkout
                        </Link>
                      )}
                      <Link
                        href={`/guests/${g.id}`}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Booking Results */}
          {results.bookings.length > 0 && (
            <Card>
              <CardTitle className="mb-4 flex items-center gap-2">
                <Bed size={18} className="text-brand-orange" />
                Matching Stay Bookings ({results.bookings.length})
              </CardTitle>
              <div className="divide-y divide-gray-50">
                {results.bookings.map((b) => (
                  <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-orange">{b.receiptNo}</span>
                        <Badge variant={b.status === "ACTIVE" ? "active" : b.status === "CHECKED_OUT" ? "checked_out" : "cancelled"}>
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-450 mt-1.5">
                        Guest: <strong className="text-gray-700">{b.guest?.name}</strong> • Phone: {b.guest?.phone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Room {b.room?.roomNumber} • Check-in: {new Date(b.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/guests/${b.guestId}`}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        View Profile
                      </Link>
                      {b.status === "ACTIVE" && (
                        <Link
                          href={`/checkout?receipt=${b.receiptNo}`}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Checkout
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}

      {/* Empty State */}
      {totalResults === 0 && query && !isSearching && (
        <Card className="py-12 text-center text-gray-400 font-semibold border border-dashed border-gray-150">
          <ShieldAlert size={40} className="mx-auto text-gray-300 mb-3" />
          No results match the query. Check spelling or try telephone values.
        </Card>
      )}
    </div>
  );
}
