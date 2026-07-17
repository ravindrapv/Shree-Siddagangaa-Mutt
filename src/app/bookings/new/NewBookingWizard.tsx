"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, 
  CalendarDays, 
  IndianRupee, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  Home,
  PlusCircle
} from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PrintPortal from "@/components/ui/PrintPortal";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/use-toast";
import { getRooms, searchGuest, createGuest, createBooking } from "@/app/actions";
import Link from "next/link";

interface FamilyMember {
  name: string;
  age: number;
  relation: string;
}

export default function NewBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Wizard Step State
  const [step, setStep] = useState(1);

  // Database Rooms State
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeFloor, setActiveFloor] = useState<string>("Ground Floor");

  // Step 1: Guest Information State
  const [phoneSearch, setPhoneSearch] = useState("");
  const [guestId, setGuestId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("30");
  const [occupation, setOccupation] = useState("Business");
  const [district, setDistrict] = useState("Tumkur");
  const [state, setState] = useState("Karnataka");
  const [pin, setPin] = useState("572101");
  const [idType, setIdType] = useState("Aadhaar Card");
  const [idNumber, setIdNumber] = useState("");
  const [noOfPersons, setNoOfPersons] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Add Family Member form state
  const [famName, setFamName] = useState("");
  const [famAge, setFamAge] = useState("");
  const [famRelation, setFamRelation] = useState("Spouse");

  // Step 2: Booking details state
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [noOfDays, setNoOfDays] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(500);
  const [totalAmount, setTotalAmount] = useState(300);
  
  // Step 3: Payment details state
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "MIXED">("CASH");
  const [paymentNote, setPaymentNote] = useState("Advance payment received.");
  const [paymentReceived, setPaymentReceived] = useState(500);

  // Step 4: Finished Booking State
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pull rooms on load
  useEffect(() => {
    async function loadRooms() {
      const data = await getRooms();
      setRooms(data);
    }
    loadRooms();

    // Check if phone was passed in query params (e.g. from guest search)
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhoneSearch(phoneParam);
      handleGuestLookup(phoneParam);
    }
  }, [searchParams]);

  // Recalculate number of stay days when dates adjust
  useEffect(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNoOfDays(diffDays > 0 ? diffDays : 1);
  }, [checkInDate, checkOutDate]);

  // Sync totalAmount with room tariff and stay days
  useEffect(() => {
    const roomTariff = selectedRooms.length > 0 
      ? selectedRooms.reduce((acc, r) => acc + r.ratePerDay, 0)
      : 300;
    setTotalAmount(roomTariff * noOfDays);
  }, [selectedRooms, noOfDays]);

  // Sync payment received with advance paid
  useEffect(() => {
    setPaymentReceived(advancePaid);
  }, [advancePaid]);

  // Look up guest by phone
  const handleGuestLookup = async (phoneToSearch = phoneSearch) => {
    const cleanPhone = phoneToSearch.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number to search");
      return;
    }

    try {
      const results = await searchGuest(phoneToSearch);
      if (results && results.length > 0) {
        const guest = results[0];
        setGuestId(guest.id);
        setGuestName(guest.name);
        setGuestPhone(guest.phone);
        setAddress(guest.address);
        setGender(guest.gender);
        setAge(guest.age.toString());
        setOccupation(guest.occupation || "");
        setDistrict(guest.district);
        setState(guest.state);
        setPin(guest.pin);
        setIdType(guest.idType);
        setIdNumber(guest.idNumber);
        
        const fam = guest.familyMembers;
        setFamilyMembers(Array.isArray(fam) ? fam : []);
        setNoOfPersons(1 + (Array.isArray(fam) ? fam.length : 0));
        
        toast.success("Guest profile loaded from register!");
      } else {
        // Clear except searched phone to register new guest
        setGuestId("");
        setGuestName("");
        setGuestPhone(phoneToSearch);
        setAddress("");
        setGender("Male");
        setAge("30");
        setOccupation("Business");
        setDistrict("Tumkur");
        setPin("572101");
        setIdType("Aadhaar Card");
        setIdNumber("");
        setFamilyMembers([]);
        setNoOfPersons(1);
        toast.info("Phone not registered. Please fill out details below.");
      }
    } catch (err) {
      toast.error("Failed to query guest records");
    }
  };

  // Add family member
  const handleAddFamilyMember = () => {
    if (!famName.trim()) {
      toast.error("Name is required");
      return;
    }
    const ageNum = parseInt(famAge);
    if (isNaN(ageNum) || ageNum <= 0) {
      toast.error("Valid age is required");
      return;
    }

    const newMember = { name: famName, age: ageNum, relation: famRelation };
    const updatedFam = [...familyMembers, newMember];
    setFamilyMembers(updatedFam);
    setNoOfPersons(1 + updatedFam.length);
    
    // Clear inputs
    setFamName("");
    setFamAge("");
    toast.success("Family member added");
  };

  // Remove family member
  const handleRemoveFamily = (idx: number) => {
    const updated = familyMembers.filter((_, i) => i !== idx);
    setFamilyMembers(updated);
    setNoOfPersons(1 + updated.length);
  };

  // Calculate pricing numbers
  const roomTariff = selectedRooms.length > 0 ? selectedRooms.reduce((acc, r) => acc + r.ratePerDay, 0) : 300;
  const balanceAmount = totalAmount - discount - advancePaid;

  // Complete Step 1: Save Guest & Next
  const handleStep1Next = async () => {
    if (!guestName.trim() || !guestPhone.trim() || !idNumber.trim()) {
      toast.error("Guest Name, Phone, and ID Number are required fields");
      return;
    }

    const cleanPhone = guestPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (idType === "Aadhaar Card") {
      const cleanAadhaar = idNumber.replace(/\D/g, "");
      if (cleanAadhaar.length !== 12) {
        toast.error("Aadhaar Card number must be exactly 12 digits");
        return;
      }
    }

    startTransition(async () => {
      try {
        const guestData = {
          name: guestName,
          phone: guestPhone,
          address,
          gender,
          age: parseInt(age) || 30,
          occupation,
          district,
          state,
          pin,
          idType,
          idNumber,
          familyMembers: familyMembers
        };
        const savedGuest = await createGuest(guestData);
        setGuestId(savedGuest.id);
        setStep(2);
      } catch (err) {
        toast.error("Failed to save guest records");
      }
    });
  };

  const handleRoomToggle = (room: any) => {
    setSelectedRooms(prev => {
      const exists = prev.find(r => r.id === room.id);
      if (exists) {
        return prev.filter(r => r.id !== room.id);
      }
      return [...prev, room];
    });
  };

  // Complete Step 2: Validate Room Selection & Next
  const handleStep2Next = () => {
    if (selectedRooms.length === 0) {
      toast.error("Please click and select at least one available room from floor layout");
      return;
    }
    setStep(3);
  };

  // Complete Step 3: Settle Payments & Create Booking
  const handleStep3Submit = () => {

    startTransition(async () => {
      try {
        const bookingPayload = {
          guestId,
          roomId: selectedRooms[0].id,
          roomIds: selectedRooms.map(r => r.id),
          checkInDate: new Date(checkInDate).toISOString(),
          checkOutDate: new Date(checkOutDate).toISOString(),
          noOfDays,
          noOfPersons,
          discount: Number(discount),
          advancePaid: Number(advancePaid),
          totalAmount,
          balanceAmount,
          paymentMethod,
          paymentNote
        };

        const booking = await createBooking(bookingPayload);
        setConfirmedBooking(booking);
        setStep(4);
        toast.success("Stay booked successfully!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Booking failed. Please try again.");
      }
    });
  };

  // Trigger Print Receipt
  const handlePrint = () => {
    window.print();
  };

  const resetWizard = () => {
    setStep(1);
    setGuestId("");
    setGuestName("");
    setGuestPhone("");
    setPhoneSearch("");
    setAddress("");
    setIdNumber("");
    setFamilyMembers([]);
    setNoOfPersons(1);
    setSelectedRooms([]);
    setDiscount(0);
    setAdvancePaid(200);
    setPaymentNote("Advance payment received.");
    setConfirmedBooking(null);
  };

  // Render step indicators
  const stepIndicators = [
    { num: 1, label: "Guest Details" },
    { num: 2, label: "Booking Details" },
    { num: 3, label: "Payment" },
    { num: 4, label: "Confirmation" }
  ];

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">New Booking / Check-in</h2>
          <p className="text-sm text-gray-500 font-medium">Register a new devotee stay on-premises.</p>
        </div>
      </div>

      {/* Step Indicator Header */}
      <div className="flex items-center justify-center max-w-4xl mx-auto w-full py-4 no-print">
        {stepIndicators.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  step === s.num
                    ? "bg-brand-orange border-brand-orange text-white ring-4 ring-orange-100"
                    : step > s.num
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-xs font-bold mt-2 ${step === s.num ? "text-brand-orange" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < stepIndicators.length - 1 && (
              <div 
                className={`h-0.5 w-16 sm:w-28 mx-2 -mt-6 transition-all ${
                  step > s.num ? "bg-emerald-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Main Form Split Container */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 items-start">
        
        {/* Step-by-Step Forms */}
        <div className="xl:col-span-3 space-y-6 no-print">
          
          {/* STEP 1: GUEST REGISTRATION FORM */}
          {step === 1 && (
            <Card>
              <CardTitle className="mb-4">Guest Information Lookup & Entry</CardTitle>
              <div className="space-y-6">
                
                {/* Search Header */}
                <div className="flex gap-2 p-4 bg-orange-50/40 rounded-xl border border-orange-100/50">
                  <input
                    type="text"
                    placeholder="Enter Phone Number..."
                    value={phoneSearch}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) {
                        setPhoneSearch(val);
                      }
                    }}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange font-semibold text-dark-brown"
                  />
                  <button
                    type="button"
                    onClick={() => handleGuestLookup()}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Search size={16} />
                    Search
                  </button>
                </div>

                {/* Main Fields Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Guest Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) {
                          setGuestPhone(val);
                        }
                      }}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">ID Proof Type *</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    >
                      <option>Aadhaar Card</option>
                      <option>Voter ID</option>
                      <option>PAN Card</option>
                      <option>Passport</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">ID Proof Number *</label>
                    <input
                      type="text"
                      required
                      placeholder={idType === "Aadhaar Card" ? "e.g. 123456789012" : "e.g. ID proof number"}
                      value={idNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (idType === "Aadhaar Card") {
                          const cleaned = val.replace(/\D/g, "").slice(0, 12);
                          setIdNumber(cleaned);
                        } else {
                          setIdNumber(val);
                        }
                      }}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Address *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">District *</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                </div>

                {/* Family member registration */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-sm font-bold text-dark-brown mb-3">Family Members staying along (if any)</h4>
                  
                  {/* Family items list */}
                  {familyMembers.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {familyMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-150 text-sm font-medium">
                          <span className="text-dark-brown font-semibold">{member.name} ({member.relation}, Age: {member.age})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFamily(idx)}
                            className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase">Family Member Name</label>
                      <input
                        type="text"
                        value={famName}
                        onChange={(e) => setFamName(e.target.value)}
                        placeholder="Name"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase">Age</label>
                      <input
                        type="number"
                        value={famAge}
                        onChange={(e) => setFamAge(e.target.value)}
                        placeholder="Age"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Relation</label>
                        <select
                          value={famRelation}
                          onChange={(e) => setFamRelation(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                        >
                          <option>Spouse</option>
                          <option>Child</option>
                          <option>Parent</option>
                          <option>Sibling</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFamilyMember}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step Actions */}
                <div className="flex justify-end gap-2 border-t border-gray-100 pt-6 mt-6">
                  <button
                    type="button"
                    onClick={handleStep1Next}
                    disabled={isPending}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    Next: Stay Details
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </Card>
          )}

          {/* STEP 2: STAY & ROOM DETAILS FORM */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardTitle className="mb-4">Dates & Occupancy Parameters</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Check-in Date *</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Check-out Date *</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">No. of Days</label>
                    <input
                      type="number"
                      readOnly
                      value={noOfDays}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-bold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">No. of Persons</label>
                    <input
                      type="number"
                      value={noOfPersons}
                      onChange={(e) => setNoOfPersons(parseInt(e.target.value) || 1)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Special Requests (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., ground floor room, hot water"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                </div>
              </Card>

              {/* Interactive Floor-wise Grid */}
              <Card>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <CardTitle>Interactive Floor Map (Click to Select Room)</CardTitle>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {["Ground Floor", "First Floor", "Second Floor"].map((floor) => (
                      <button
                        type="button"
                        key={floor}
                        onClick={() => setActiveFloor(floor)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeFloor === floor
                            ? "bg-white text-brand-orange shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {floor.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rooms
                    .filter((r) => r.floor === activeFloor)
                    .map((room) => {
                      const isOccupied = room.status === "OCCUPIED";
                      const isCleaning = room.status === "CLEANING";
                      const isMaint = room.status === "MAINTENANCE";
                      const isSelected = selectedRooms.some(r => r.id === room.id);

                      let btnStyle = "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-800";
                      
                      if (isOccupied) btnStyle = "border-rose-100 bg-rose-50/50 text-rose-400 cursor-not-allowed";
                      else if (isCleaning) btnStyle = "border-amber-100 bg-amber-50/50 text-amber-500 cursor-not-allowed";
                      else if (isMaint) btnStyle = "border-gray-100 bg-gray-100/50 text-gray-400 cursor-not-allowed";
                      
                      if (isSelected) {
                        btnStyle = "border-brand-orange bg-orange-50 text-brand-orange ring-2 ring-brand-orange/20 shadow-md";
                      }

                      return (
                        <button
                          type="button"
                          key={room.id}
                          disabled={isOccupied || isCleaning || isMaint}
                          onClick={() => handleRoomToggle(room)}
                          className={`border rounded-xl p-4 text-left transition-all duration-200 flex flex-col justify-between h-[120px] cursor-pointer shadow-sm ${btnStyle}`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="text-lg font-black">{room.roomNumber}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange text-white">
                                Selected
                              </span>
                            )}
                            {!isSelected && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                room.status === "AVAILABLE"
                                  ? "bg-emerald-200 text-emerald-850"
                                  : "bg-white/70 border border-black/5"
                              }`}>
                                {room.status}
                              </span>
                            )}
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

              {/* Step Navigation Actions */}
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Next: Settle Payment
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT SCREEN */}
          {step === 3 && (
            <Card>
              <CardTitle className="mb-4">Billing & Advance Payment Settle</CardTitle>
              <div className="space-y-6">
                
                {/* Financial Summary */}
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 font-bold text-sm text-gray-700">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase">Total Charges (₹) [Editable]</label>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-brand-orange font-bold text-dark-brown"
                    />
                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Default: ₹ {roomTariff} x {noOfDays} Days</span>
                  </div>
                  <div className="hidden">
                    {/* Discount removed */}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase">Advance Paid (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={advancePaid}
                        onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-1 text-sm focus:outline-none focus:border-brand-orange font-bold text-emerald-600 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setAdvancePaid(500)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          advancePaid === 500
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        500
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvancePaid(200)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          advancePaid === 200
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        200
                      </button>
                    </div>
                  </div>
                </div>

                {/* Settle Balance math */}
                <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 text-sm font-bold text-gray-700">
                  <span>Balance Outstanding at Check-out:</span>
                  <span className={`text-lg font-black ${balanceAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ₹ {balanceAmount}
                  </span>
                </div>

                {/* Payment Option toggles */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase block">Payment Channel</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(["CASH", "UPI", "CARD", "MIXED"] as const).map((method) => {
                      const isDisabled = method !== "CASH";
                      return (
                        <button
                          type="button"
                          key={method}
                          disabled={isDisabled}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            paymentMethod === method
                              ? "bg-brand-orange border-brand-orange text-white shadow-md shadow-brand-orange/15"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Received Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentReceived}
                      onChange={(e) => setPaymentReceived(Number(e.target.value) || 0)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Payment Reference/Notes</label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-2 border-t border-gray-100 pt-6 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3Submit}
                    disabled={isPending}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    Save Booking & Print Receipt
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </Card>
          )}

          {/* STEP 4: STAY BOOKING CONFIRMATION & MOCK THERMAL */}
          {step === 4 && confirmedBooking && (
            <Card>
              <div className="text-center py-6 border-b border-gray-100 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-black text-dark-brown">Check-in Registered Successfully!</h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">Receipt No: {confirmedBooking.receiptNo} generated.</p>
              </div>

              <div className="flex justify-center flex-wrap gap-3">
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
                  onClick={resetWizard}
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  New Booking
                </button>
                <Link
                  href="/"
                  className="bg-dark-brown hover:bg-dark-brown-light text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Home size={18} />
                  Go Dashboard
                </Link>
              </div>

              {/* Receipt Preview Modal */}
              <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Check-in Receipt Preview" size="sm">
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
                      <div className="flex justify-between"><span>Receipt No:</span><span className="font-bold">{confirmedBooking.receiptNo}</span></div>
                      <div className="flex justify-between"><span>Date:</span><span>{new Date(confirmedBooking.createdAt).toLocaleString("en-IN")}</span></div>
                    </div>

                    <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                      <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Guest Details</p>
                      <div className="flex justify-between"><span>Name:</span><span className="font-bold">{guestName}</span></div>
                      <div className="flex justify-between"><span>Phone:</span><span>{guestPhone}</span></div>
                      <div className="flex justify-between"><span>ID Card:</span><span>{idType} ({idNumber})</span></div>
                      <div className="flex justify-between"><span>No. of Persons:</span><span>{noOfPersons}</span></div>
                    </div>

                    <div className="space-y-1 text-[10px] border-b border-dashed border-gray-200 pb-3">
                      <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Room Details</p>
                      <div className="flex justify-between"><span>Room Number:</span><span className="font-bold">Room {confirmedBooking.roomNumbers || selectedRooms.map(r => r.roomNumber).join(", ")}</span></div>
                      <div className="flex justify-between"><span>Duration:</span><span>{noOfDays} Days</span></div>
                      <div className="flex justify-between"><span>Check-in Time:</span><span>{new Date(confirmedBooking.checkInDate || confirmedBooking.createdAt).toLocaleDateString("en-IN")} {new Date(confirmedBooking.checkInDate || confirmedBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                      <div className="flex justify-between"><span>Checkout Scheduled:</span><span>{new Date(confirmedBooking.checkOutDate).toLocaleDateString("en-IN")} {new Date(confirmedBooking.checkOutDate).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                      <div className="flex justify-between"><span>Tariff (Per Day):</span><span>₹{roomTariff}</span></div>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      <p className="font-bold uppercase tracking-wide text-brand-orange text-[9px]">Ledger Summary</p>
                      <div className="flex justify-between"><span>Total Room Tariff:</span><span>₹{totalAmount}.00</span></div>
                      <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-150 mt-1">
                        <span>Advance Paid ({paymentMethod}):</span>
                        <span>₹{advancePaid}.00</span>
                      </div>
                      {balanceAmount < 0 ? (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Refund Due at Checkout:</span>
                          <span>₹{Math.abs(balanceAmount)}.00</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>Remaining Balance:</span>
                          <span>₹{balanceAmount}.00</span>
                        </div>
                      )}
                    </div>

                    {/* Verification QR Code */}
                    <div className="flex flex-col items-center justify-center pt-2 border-t border-dashed border-gray-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          `Kalyani Guest House Check-In\nReceipt No: ${confirmedBooking.receiptNo}\nGuest Name: ${guestName}\nRoom Number: ${confirmedBooking.roomNumbers || selectedRooms.map(r => r.roomNumber).join(", ")}\nAdvance Paid: Rs. ${advancePaid}`
                        )}`} 
                        alt="Receipt QR Code"
                        className="w-24 h-24 border border-gray-150 p-1 bg-white"
                      />
                      <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
                    </div>

                    <div className="text-center pt-3 border-t border-dashed border-gray-200 text-[9px] text-gray-500 font-semibold italic">
                      Have a Safe & Blessed Stay!
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

        {/* Right side summary ledger (Sidebar) */}
        <div className="xl:col-span-1 space-y-6 no-print">
          
          <Card className="border border-blue-50 bg-blue-50/10">
            <CardTitle className="border-b border-gray-100 pb-3 mb-4 text-blue-900 flex items-center gap-2">
              <PlusCircle size={16} className="text-blue-500" />
              Booking Summary
            </CardTitle>

            <div className="space-y-5 text-xs text-gray-600 font-semibold">
              {/* Guest Details */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Guest Details</p>
                <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Name:</span> <span className="text-dark-brown font-bold">{guestName || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Phone:</span> <span className="text-dark-brown font-bold">{guestPhone || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">No. Persons:</span> <span className="text-dark-brown font-bold">{noOfPersons} Devotees</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ID Proof:</span> <span className="text-dark-brown font-bold">{idNumber ? `${idType} (${idNumber.substring(0, 4)}...)` : "—"}</span></div>
                </div>
              </div>

              {/* Stay Details */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Stay Details</p>
                <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Check-in:</span>
                    <span className="text-dark-brown font-bold">{new Date(checkInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Check-out:</span>
                    <span className="text-dark-brown font-bold">{new Date(checkOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Duration:</span> <span className="text-dark-brown font-bold">{noOfDays} Days</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Rooms Assigned:</span>
                    <span className="text-dark-brown font-bold">
                      {selectedRooms.length > 0 ? `Rooms ${selectedRooms.map(r => r.roomNumber).join(", ")}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial calculations */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Financial Breakdown</p>
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Daily Room Tariff:</span> <span className="text-dark-brown font-bold">₹{roomTariff}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Accommodation cost:</span> <span className="text-dark-brown font-bold">₹{totalAmount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">Advance Amount Paid:</span> <span className="text-emerald-600 font-bold">- ₹{advancePaid}</span></div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-sm text-dark-brown">
                    <span>{balanceAmount < 0 ? "Refund Due:" : "Balance Due:"}</span>
                    <span className={balanceAmount > 0 ? "text-rose-600 font-black" : "text-emerald-600 font-black"}>₹{Math.abs(balanceAmount)}</span>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* -------------------------------------------------------------
          PRINTABLE THERMAL RECEIPT LAYOUT 
          Rendered ONLY when executing a print job
          ------------------------------------------------------------- */}
      {confirmedBooking && (
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
                <span className="font-bold">{confirmedBooking.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(confirmedBooking.createdAt).toLocaleString("en-IN", { hour12: true })}</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt Type:</span>
                <span className="font-bold">GUEST CHECK-IN</span>
              </div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Guest Details</p>
              <div className="flex justify-between"><span>Guest Name:</span> <span className="font-bold">{guestName}</span></div>
              <div className="flex justify-between"><span>Phone Number:</span> <span>{guestPhone}</span></div>
              <div className="flex justify-between"><span>ID Card:</span> <span>{idType} ({idNumber})</span></div>
              <div className="flex justify-between"><span>No. of Persons:</span> <span>{noOfPersons}</span></div>
              <p className="text-[10px] truncate max-w-[280px]">Address: {address}</p>
            </div>

            <div className="space-y-1 py-2.5 my-1.5 border-t border-b border-dashed border-black text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Room Details</p>
              <div className="flex justify-between"><span>Room Number:</span> <span className="font-bold">Room {confirmedBooking.roomNumbers || selectedRooms.map(r => r.roomNumber).join(", ")}</span></div>
              <div className="flex justify-between"><span>Check-in:</span> <span>{new Date(confirmedBooking.checkInDate || confirmedBooking.createdAt).toLocaleDateString("en-IN")} {new Date(confirmedBooking.checkInDate || confirmedBooking.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Check-out:</span> <span>{new Date(confirmedBooking.checkOutDate).toLocaleDateString("en-IN")} {new Date(confirmedBooking.checkOutDate).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
              <div className="flex justify-between"><span>Stay Duration:</span> <span>{noOfDays} Days</span></div>
              <div className="flex justify-between"><span>Tariff (Per Day):</span> <span>₹{roomTariff}</span></div>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <p className="text-[10px] font-bold border-b border-black pb-0.5 uppercase tracking-wide">Payment Details</p>
              <div className="flex justify-between"><span>Total Accom. cost:</span> <span>₹ {totalAmount}.00</span></div>
              <div className="flex justify-between"><span>Advance Amount Paid:</span> <span className="font-bold">₹ {advancePaid}.00</span></div>
              {balanceAmount < 0 ? (
                <div className="flex justify-between font-bold border-t border-dashed border-black pt-1">
                  <span>Refund Due at Checkout:</span>
                  <span>₹ {Math.abs(balanceAmount)}.00</span>
                </div>
              ) : (
                <div className="flex justify-between font-bold border-t border-dashed border-black pt-1">
                  <span>Balance Amount Due:</span>
                  <span>₹ {balanceAmount}.00</span>
                </div>
              )}
            </div>

            <div className="space-y-1 py-2.5 my-2 border-t border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between"><span>Payment Mode:</span> <span className="font-bold">{paymentMethod}</span></div>
              <div className="flex justify-between"><span>Received Amount:</span> <span className="font-bold">₹ {paymentReceived}.00</span></div>
              {paymentNote && <p className="text-[9px] italic">Note: {paymentNote}</p>}
            </div>

            {/* Verification QR Code in Print */}
            <div className="flex flex-col items-center justify-center py-2 border-t border-dashed border-black">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `Kalyani Guest House Check-In\nReceipt No: ${confirmedBooking.receiptNo}\nGuest Name: ${guestName}\nRoom Number: ${confirmedBooking.roomNumbers || selectedRooms.map(r => r.roomNumber).join(", ")}\nAdvance Paid: Rs. ${advancePaid}`
                )}`} 
                alt="Receipt QR Code"
                className="w-24 h-24 border border-black p-1 bg-white"
              />
              <p className="text-[8px] mt-1 uppercase tracking-wider font-bold">Scan to Verify Stay</p>
            </div>

            <div className="text-center py-4 space-y-2 border-t border-black pt-4">
              <p className="text-xs font-bold leading-tight">Thank You!</p>
              <p className="text-[9px] font-semibold italic leading-tight">Have a Safe & Blessed Stay</p>
              <div className="w-48 h-8 mx-auto bg-black flex items-center justify-center text-white text-[9px] font-bold mt-4 tracking-[6px] border border-black">
                |||RCP{confirmedBooking.receiptNo.substring(3)}|||
              </div>
              <p className="text-[8px] text-gray-500 font-semibold mt-1">RCP{confirmedBooking.receiptNo.substring(3)}</p>
              <p className="text-[7px] text-gray-500 leading-tight border-t border-dashed border-gray-400 pt-2">This is a computer generated receipt.<br />No signature required.</p>
            </div>
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
