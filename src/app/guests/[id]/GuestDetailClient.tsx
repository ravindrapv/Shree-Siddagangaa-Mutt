"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Users,
  History,
  PlusCircle,
  Printer,
  CalendarDays,
  BedDouble,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface GuestDetailClientProps {
  guest: any;
  bookings: any[];
}

export default function GuestDetailClient({ guest, bookings }: GuestDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const family = Array.isArray(guest.familyMembers) ? guest.familyMembers : [];
  const totalStays = bookings.length;
  const activeStay = bookings.find((b) => b.status === "ACTIVE");
  const completedStays = bookings.filter((b) => b.status === "CHECKED_OUT").length;
  const totalSpent = bookings
    .filter((b) => b.status === "CHECKED_OUT")
    .reduce((acc: number, b: any) => acc + (b.totalAmount || 0), 0);
  const lastStay = bookings.find((b) => b.status === "CHECKED_OUT");

  const statusIcon = {
    ACTIVE: <Clock size={14} className="text-emerald-500" />,
    CHECKED_OUT: <CheckCircle2 size={14} className="text-blue-500" />,
    CANCELLED: <XCircle size={14} className="text-rose-500" />,
  };

  const statusLabel = {
    ACTIVE: "Active Stay",
    CHECKED_OUT: "Checked Out",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <Link
          href="/guests"
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft size={16} />
          Guest Directory
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-dark-brown truncate">{guest.name}</span>
      </div>

      {/* Hero Profile Header */}
      <div className="bg-gradient-to-r from-dark-brown to-dark-brown-medium rounded-2xl p-6 text-white shadow-premium-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
            {guest.name.charAt(0).toUpperCase()}
          </div>

          {/* Name + Tags */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black tracking-tight">{guest.name}</h1>
              {activeStay && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Currently Staying
                </span>
              )}
            </div>
            <p className="text-orange-200 text-sm font-semibold">
              {guest.gender} • Age {guest.age} • {guest.occupation || "Devotee"}
            </p>
            <p className="text-orange-300 text-xs mt-1 font-medium">
              {guest.district}, {guest.state} — {guest.idType}: {guest.idNumber}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!activeStay ? (
              <Link
                href={`/bookings/new?phone=${guest.phone}`}
                className="flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md"
              >
                <PlusCircle size={15} />
                New Booking
              </Link>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-500/30">
                Currently Checked In
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
            >
              <Printer size={15} />
              Print
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          {[
            { label: "Total Stays", value: totalStays, icon: CalendarDays },
            { label: "Completed", value: completedStays, icon: CheckCircle2 },
            { label: "Active Now", value: activeStay ? 1 : 0, icon: BedDouble },
            { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: IndianRupee },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-orange-300 mb-1">
                  <Icon size={13} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">{kpi.label}</span>
                </div>
                <p className="text-xl font-black">{kpi.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit no-print">
        {(["overview", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? "bg-white text-dark-brown shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "overview" ? "Profile Overview" : "Stay History"}
          </button>
        ))}
      </div>

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeStay && (
            <Card className="md:col-span-2 border-l-4 border-l-emerald-500 bg-emerald-50/10">
              <CardTitle className="text-emerald-800 flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
                <BedDouble size={16} className="text-emerald-500 animate-pulse" />
                Current Active Stay Details
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-500">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Room Number</p>
                  <p className="text-sm font-black text-dark-brown mt-1">Room {activeStay.room?.roomNumber}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Standard Room</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Check-in Time</p>
                  <p className="text-sm font-black text-dark-brown mt-1">
                    {new Date(activeStay.checkInDate || activeStay.createdAt).toLocaleDateString("en-IN")} {new Date(activeStay.checkInDate || activeStay.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">Receipt: {activeStay.receiptNo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Checkout Scheduled</p>
                  <p className="text-sm font-black text-dark-brown mt-1">
                    {new Date(activeStay.checkOutDate).toLocaleDateString("en-IN")} {new Date(activeStay.checkOutDate).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">{activeStay.noOfDays} Days stays</p>
                </div>
              </div>
            </Card>
          )}
          {/* Personal Details */}
          <Card>
            <CardTitle className="flex items-center gap-2 mb-4">
              <User size={16} className="text-brand-orange" />
              Personal Information
            </CardTitle>
            <dl className="space-y-3">
              {[
                { label: "Full Name", value: guest.name },
                { label: "Gender", value: guest.gender },
                { label: "Age", value: `${guest.age} years` },
                { label: "Occupation", value: guest.occupation || "Devotee" },
                { label: "Phone", value: guest.phone, icon: Phone },
                { label: "Emergency Contact", value: guest.emergencyContact || "Not provided" },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-xs text-gray-400 font-bold uppercase tracking-wider">{row.label}</dt>
                  <dd className="text-sm font-bold text-dark-brown text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Address & ID */}
          <Card>
            <CardTitle className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-brand-orange" />
              Address & Identity
            </CardTitle>
            <dl className="space-y-3">
              {[
                { label: "Full Address", value: guest.address },
                { label: "District", value: guest.district },
                { label: "State", value: guest.state },
                { label: "PIN Code", value: guest.pin },
                { label: "ID Type", value: guest.idType },
                { label: "ID Number", value: guest.idNumber },
              ].map((row, idx) => (
                <div key={idx} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 gap-2">
                  <dt className="text-xs text-gray-400 font-bold uppercase tracking-wider flex-shrink-0">{row.label}</dt>
                  <dd className="text-sm font-bold text-dark-brown text-right break-words max-w-[200px]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Accompanying Family */}
          <Card className="md:col-span-2">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-brand-orange" />
              Accompanying Family Members
              <span className="ml-auto bg-orange-50 text-brand-orange text-xs font-bold px-2.5 py-0.5 rounded-full">
                {family.length} member{family.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>

            {family.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm font-semibold border border-dashed border-gray-200 rounded-xl">
                No accompanying family members registered.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {family.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-sm flex-shrink-0">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark-brown text-sm truncate">{member.name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">
                        {member.relation} • Age {member.age}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Registration meta */}
          <Card className="md:col-span-2 bg-orange-50/30 border border-orange-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <History size={14} className="text-brand-orange" />
                <span>
                  Profile registered on{" "}
                  <strong className="text-dark-brown">
                    {new Date(guest.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-brand-orange bg-orange-100 px-3 py-1.5 rounded-full text-xs font-bold">
                <Sparkles size={12} />
                Devotee Stay Profile — Siddaganga Mata Tumkur
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* --- TAB: STAY HISTORY --- */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
              <CalendarDays size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-semibold text-sm">No stay records found for this guest.</p>
              <Link
                href={`/bookings/new?phone=${guest.phone}`}
                className="inline-flex items-center gap-1.5 mt-4 bg-brand-orange text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-orange-hover transition-all"
              >
                <PlusCircle size={14} />
                Register First Booking
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-premium-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Status icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        booking.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-600"
                          : booking.status === "CHECKED_OUT"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {booking.status === "ACTIVE" ? (
                        <BedDouble size={18} />
                      ) : booking.status === "CHECKED_OUT" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-brand-orange text-sm">{booking.receiptNo}</span>
                        <Badge
                          variant={
                            booking.status === "ACTIVE"
                              ? "active"
                              : booking.status === "CHECKED_OUT"
                              ? "checked_out"
                              : "cancelled"
                          }
                        >
                          {statusLabel[booking.status as keyof typeof statusLabel] || booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-dark-brown">
                        Room {booking.room?.roomNumber} — {booking.noOfDays} day{booking.noOfDays !== 1 ? "s" : ""} stay
                      </p>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        Check-in: <span className="text-dark-brown font-bold">{new Date(booking.checkInDate || booking.createdAt).toLocaleDateString("en-IN")} {new Date(booking.checkInDate || booking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        <span className="mx-2">|</span>
                        Check-out: <span className="text-dark-brown font-bold">
                          {booking.status === "ACTIVE" 
                            ? "Active (In Room)" 
                            : `${new Date(booking.checkOutDate || booking.updatedAt).toLocaleDateString("en-IN")} ${new Date(booking.checkOutDate || booking.updatedAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}`
                          }
                        </span>
                      </p>
                    </div>

                    {/* Amount info */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-dark-brown">₹{booking.totalAmount?.toLocaleString("en-IN")}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">Total Charges</p>
                      {booking.balanceAmount > 0 && (
                        <p className="text-[11px] text-rose-500 font-bold mt-0.5">
                          ₹{booking.balanceAmount} pending
                        </p>
                      )}
                      {booking.balanceAmount < 0 && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          ₹{Math.abs(booking.balanceAmount)} refund
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking meta footer */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap items-center gap-4 text-[11px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <IndianRupee size={11} />
                      Advance: ₹{booking.advancePaid}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={11} />
                      Method: {booking.paymentMethod}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {booking.noOfPersons} Person{booking.noOfPersons !== 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto text-gray-300">
                      Booked {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
