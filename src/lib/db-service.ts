import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

// Types matching Prisma models
export interface Guest {
  id: string;
  name: string;
  phone: string;
  address: string;
  gender: string;
  age: number;
  occupation?: string | null;
  district: string;
  state: string;
  pin: string;
  idType: string;
  idNumber: string;
  emergencyContact?: string | null;
  photoUrl?: string | null;
  familyMembers?: any; // JSON array of family members
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: string;
  type: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
  capacity: number;
  ratePerDay: number;
  facilities: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Booking {
  id: string;
  receiptNo: string;
  guestId: string;
  roomId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  noOfDays: number;
  noOfPersons: number;
  discount: number;
  advancePaid: number;
  totalAmount: number;
  balanceAmount: number;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'CANCELLED';
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'MIXED';
  paymentNote?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relations
  guest?: Guest;
  room?: Room;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD' | 'MIXED';
  receiptNo: string;
  date: Date | string;
  notes?: string | null;
  createdAt: Date | string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date | string;
  username?: string; // Resolved for UI ease
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}

// -------------------------------------------------------------
// LOCAL JSON FILE MOCK DATABASE IMPLEMENTATION
// -------------------------------------------------------------
const MOCK_DB_FILE = path.join(process.cwd(), "prisma", "mock-db.json");

interface MockDBData {
  guests: Guest[];
  rooms: Room[];
  bookings: Booking[];
  payments: Payment[];
  auditLogs: AuditLog[];
  settings: Setting[];
}

// Check if we are running in DEMO_MODE
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
};

// Seed initial mock data for the JSON database
const getInitialMockData = (): MockDBData => {
  const rooms: Room[] = [
    // Ground Floor
    { id: "r101", roomNumber: "101", floor: "Ground Floor", type: "Room", status: "AVAILABLE", capacity: 2, ratePerDay: 300, facilities: ["Hot Water", "TV"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r102", roomNumber: "102", floor: "Ground Floor", type: "Room", status: "OCCUPIED", capacity: 2, ratePerDay: 300, facilities: ["Hot Water"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r103", roomNumber: "103", floor: "Ground Floor", type: "Room", status: "AVAILABLE", capacity: 3, ratePerDay: 300, facilities: ["Hot Water", "TV"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r104", roomNumber: "104", floor: "Ground Floor", type: "Room", status: "CLEANING", capacity: 2, ratePerDay: 300, facilities: ["Hot Water"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r105", roomNumber: "105", floor: "Ground Floor", type: "Room", status: "MAINTENANCE", capacity: 2, ratePerDay: 300, facilities: [], createdAt: new Date(), updatedAt: new Date() },
    { id: "r106", roomNumber: "106", floor: "Ground Floor", type: "Room", status: "AVAILABLE", capacity: 5, ratePerDay: 300, facilities: ["Hot Water", "TV", "Extra Beds"], createdAt: new Date(), updatedAt: new Date() },
    // First Floor
    { id: "r201", roomNumber: "201", floor: "First Floor", type: "Room", status: "AVAILABLE", capacity: 2, ratePerDay: 300, facilities: ["TV", "Geyser", "WiFi"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r202", roomNumber: "202", floor: "First Floor", type: "Room", status: "OCCUPIED", capacity: 2, ratePerDay: 300, facilities: ["TV", "Geyser", "WiFi"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r203", roomNumber: "203", floor: "First Floor", type: "Room", status: "AVAILABLE", capacity: 2, ratePerDay: 300, facilities: ["TV", "Geyser"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r204", roomNumber: "204", floor: "First Floor", type: "Room", status: "AVAILABLE", capacity: 2, ratePerDay: 300, facilities: ["TV"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r205", roomNumber: "205", floor: "First Floor", type: "Room", status: "AVAILABLE", capacity: 4, ratePerDay: 300, facilities: ["TV", "Geyser", "WiFi", "Balcony"], createdAt: new Date(), updatedAt: new Date() },
    // Second Floor
    { id: "r301", roomNumber: "301", floor: "Second Floor", type: "Room", status: "OCCUPIED", capacity: 2, ratePerDay: 300, facilities: ["Hot Water"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r302", roomNumber: "302", floor: "Second Floor", type: "Room", status: "AVAILABLE", capacity: 2, ratePerDay: 300, facilities: ["Hot Water"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r303", roomNumber: "303", floor: "Second Floor", type: "Room", status: "OCCUPIED", capacity: 2, ratePerDay: 300, facilities: ["Hot Water", "TV"], createdAt: new Date(), updatedAt: new Date() },
    { id: "r304", roomNumber: "304", floor: "Second Floor", type: "Room", status: "CLEANING", capacity: 2, ratePerDay: 300, facilities: [], createdAt: new Date(), updatedAt: new Date() },
    { id: "r305", roomNumber: "305", floor: "Second Floor", type: "Room", status: "AVAILABLE", capacity: 6, ratePerDay: 300, facilities: ["Hot Water", "TV", "Attached Bath"], createdAt: new Date(), updatedAt: new Date() }
  ];

  const guests: Guest[] = [
    {
      id: "g1",
      name: "Ramesh H",
      phone: "9886543210",
      address: "#123, 2nd Cross, Gandhi Nagar, Tumkur - 572101",
      gender: "Male",
      age: 42,
      occupation: "Business",
      district: "Tumkur",
      state: "Karnataka",
      pin: "572101",
      idType: "Aadhaar Card",
      idNumber: "1234 5678 9012",
      emergencyContact: "9886543211",
      familyMembers: [{ name: "Sita H", age: 38, relation: "Wife" }, { name: "Kiran H", age: 12, relation: "Son" }],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: "g2",
      name: "Sharanappa Gowda",
      phone: "9900887766",
      address: "Saraswathipuram, Mysore - 570009",
      gender: "Male",
      age: 55,
      occupation: "Farmer",
      district: "Mysore",
      state: "Karnataka",
      pin: "570009",
      idType: "Voter ID",
      idNumber: "ABC9876543",
      emergencyContact: "9900887760",
      familyMembers: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: "g3",
      name: "Manjula Devi",
      phone: "9448012345",
      address: "Malleshwaram, Bangalore - 560003",
      gender: "Female",
      age: 48,
      occupation: "Homemaker",
      district: "Bangalore",
      state: "Karnataka",
      pin: "560003",
      idType: "Aadhaar Card",
      idNumber: "8888 7777 6666",
      emergencyContact: "9448012346",
      familyMembers: [{ name: "Prashanth", age: 22, relation: "Son" }],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  // Map room occupancy
  const bookings: Booking[] = [
    {
      id: "b1",
      receiptNo: "RCP1248",
      guestId: "g1",
      roomId: "r102",
      checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      noOfDays: 2,
      noOfPersons: 3,
      discount: 0,
      advancePaid: 200,
      totalAmount: 400,
      balanceAmount: 200,
      status: "ACTIVE",
      paymentMethod: "CASH",
      paymentNote: "Advance payment of 200 received.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: "b2",
      receiptNo: "RCP1249",
      guestId: "g2",
      roomId: "r202",
      checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      noOfDays: 3,
      noOfPersons: 1,
      discount: 0,
      advancePaid: 400,
      totalAmount: 1200,
      balanceAmount: 800,
      status: "ACTIVE",
      paymentMethod: "UPI",
      paymentNote: "Paid ₹400 advance via UPI GPay",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "b3",
      receiptNo: "RCP1245",
      guestId: "g3",
      roomId: "r301",
      checkInDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      noOfDays: 2,
      noOfPersons: 2,
      discount: 0,
      advancePaid: 400,
      totalAmount: 400,
      balanceAmount: 0,
      status: "CHECKED_OUT",
      paymentMethod: "CASH",
      paymentNote: "Full payment received.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "b4",
      receiptNo: "RCP1246",
      guestId: "g1",
      roomId: "r303",
      checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      noOfDays: 3,
      noOfPersons: 2,
      discount: 50,
      advancePaid: 300,
      totalAmount: 600,
      balanceAmount: 250,
      status: "ACTIVE",
      paymentMethod: "MIXED",
      paymentNote: "Cash ₹200 + UPI ₹100",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const payments: Payment[] = [
    { id: "p1", bookingId: "b1", amount: 200, method: "CASH", receiptNo: "RCP1248", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: "Booking Advance", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: "p2", bookingId: "b2", amount: 400, method: "UPI", receiptNo: "RCP1249", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: "Booking Advance", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: "p3", bookingId: "b3", amount: 400, method: "CASH", receiptNo: "RCP1245", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), notes: "Booking Advance", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { id: "p4", bookingId: "b4", amount: 300, method: "MIXED", receiptNo: "RCP1246", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: "Booking Advance", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
  ];

  const auditLogs: AuditLog[] = [
    { id: "l1", userId: "admin-id", action: "ROOM_STATUS_CHANGE", details: "Room 104 status set to CLEANING by Admin", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: "l2", userId: "admin-id", action: "ROOM_STATUS_CHANGE", details: "Room 105 status set to MAINTENANCE by Admin", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { id: "l3", userId: "admin-id", action: "BOOKING_CREATE", details: "Booking RCP1249 created for Sharanappa Gowda (Room 202)", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  ];

  const settings: Setting[] = [
    { id: "s1", key: "templeName", value: "Siddaganga Mata Tumkur" },
    { id: "s2", key: "templeAddress", value: "Siddaganga Mutt Road, Tumkur, Karnataka, India - 572104" },
    { id: "s3", key: "contactNumber", value: "+91 816 2282247" },
    { id: "s4", key: "receiptFooter", value: "This is a computer-generated receipt. Thank you for your support. Have a safe & blessed stay." }
  ];

  return { guests, rooms, bookings, payments, auditLogs, settings };
};

// Reading data from file helper
const readMockDB = (): MockDBData => {
  try {
    if (!fs.existsSync(MOCK_DB_FILE)) {
      const dir = path.dirname(MOCK_DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initial = getInitialMockData();
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(MOCK_DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading JSON mock db:", error);
    return getInitialMockData();
  }
};

// Writing data to file helper
const writeMockDB = (data: MockDBData) => {
  try {
    const dir = path.dirname(MOCK_DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing JSON mock db:", error);
  }
};

// -------------------------------------------------------------
// CORE DB SERVICE IMPLEMENTATION
// -------------------------------------------------------------
export const dbService = {
  // --- GUESTS ---
  async getGuests(): Promise<Guest[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests.map(g => {
        const hasActive = db.bookings.some(b => b.guestId === g.id && b.status === "ACTIVE");
        return { ...g, hasActiveStay: hasActive } as any;
      });
    }
    const raw = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" }
    });
    const activeBookings = await prisma.booking.findMany({
      where: { status: "ACTIVE" }
    });
    return raw.map((g: any) => ({
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : [],
      hasActiveStay: activeBookings.some((b: any) => b.guestId === g.id)
    })) as unknown as Guest[];
  },

  async getGuest(id: string): Promise<Guest | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests.find(g => g.id === id) || null;
    }
    const g = await prisma.guest.findUnique({ where: { id } });
    if (!g) return null;
    return {
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
    } as unknown as Guest;
  },

  async getGuestByPhone(phone: string): Promise<Guest | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests.find(g => g.phone === phone) || null;
    }
    const g = await prisma.guest.findUnique({ where: { phone } });
    if (!g) return null;
    return {
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
    } as unknown as Guest;
  },

  async searchGuest(query: string): Promise<Guest[]> {
    const db = readMockDB();
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    if (isDemoMode()) {
      const filtered = db.guests.filter(
        g =>
          g.name.toLowerCase().includes(cleanQuery) ||
          g.phone.includes(cleanQuery) ||
          g.idNumber.toLowerCase().includes(cleanQuery)
      );
      return filtered.map(g => {
        const activeBooking = db.bookings.find(b => b.guestId === g.id && b.status === "ACTIVE");
        return {
          ...g,
          hasActiveStay: !!activeBooking,
          activeReceiptNo: activeBooking?.receiptNo || null
        } as any;
      });
    }

    const raw = await prisma.guest.findMany({
      where: {
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { phone: { contains: cleanQuery } },
          { idNumber: { contains: cleanQuery, mode: "insensitive" } }
        ]
      }
    });
    const activeBookings = await prisma.booking.findMany({
      where: { status: "ACTIVE" }
    });
    return raw.map((g: any) => {
      const activeBooking = activeBookings.find((b: any) => b.guestId === g.id);
      return {
        ...g,
        familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : [],
        hasActiveStay: !!activeBooking,
        activeReceiptNo: activeBooking?.receiptNo || null
      };
    }) as unknown as Guest[];
  },

  async createGuest(data: Omit<Guest, "id" | "createdAt" | "updatedAt">): Promise<Guest> {
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      throw new Error("Phone number must be exactly 10 digits");
    }
    const sanitizedData = { ...data, phone: cleanPhone };

    if (isDemoMode()) {
      const db = readMockDB();
      // Check unique constraints
      const existing = db.guests.find(g => g.phone === sanitizedData.phone || g.idNumber === sanitizedData.idNumber);
      if (existing) {
        return existing; // Return existing guest for smooth booking
      }
      const newGuest: Guest = {
        ...sanitizedData,
        id: "g_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.guests.push(newGuest);
      writeMockDB(db);
      return newGuest;
    }

    const g = await prisma.guest.upsert({
      where: { phone: sanitizedData.phone },
      update: {
        ...sanitizedData,
        familyMembers: sanitizedData.familyMembers ? JSON.parse(JSON.stringify(sanitizedData.familyMembers)) : undefined
      },
      create: {
        ...sanitizedData,
        familyMembers: sanitizedData.familyMembers ? JSON.parse(JSON.stringify(sanitizedData.familyMembers)) : undefined
      }
    });
    return {
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
    } as unknown as Guest;
  },

  // --- ROOMS ---
  async getRooms(): Promise<Room[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.rooms.map(r => {
        if (r.status !== "OCCUPIED") return r;
        const activeBooking = db.bookings.find(b => b.roomId === r.id && b.status === "ACTIVE");
        if (!activeBooking) return r;
        const guest = db.guests.find(g => g.id === activeBooking.guestId);
        return {
          ...r,
          occupiedDetails: {
            guestName: guest?.name || "Unknown Guest",
            checkOutDate: activeBooking.checkOutDate,
            receiptNo: activeBooking.receiptNo
          }
        } as any;
      });
    }
    const rooms = await prisma.room.findMany({
      orderBy: { roomNumber: "asc" }
    });
    const bookings = await prisma.booking.findMany({
      where: { status: "ACTIVE" },
      include: { guest: true }
    });
    return rooms.map(r => {
      if (r.status !== "OCCUPIED") return r;
      const b = bookings.find(x => x.roomId === r.id);
      if (!b) return r;
      return {
        ...r,
        occupiedDetails: {
          guestName: b.guest?.name || "Unknown Guest",
          checkOutDate: b.checkOutDate,
          receiptNo: b.receiptNo
        }
      };
    }) as unknown as Room[];
  },

  async updateRoomStatus(id: string, status: Room['status']): Promise<Room> {
    if (isDemoMode()) {
      const db = readMockDB();
      const rIdx = db.rooms.findIndex(r => r.id === id);
      if (rIdx === -1) throw new Error("Room not found");
      db.rooms[rIdx].status = status;
      db.rooms[rIdx].updatedAt = new Date().toISOString();
      writeMockDB(db);
      return db.rooms[rIdx];
    }
    return await prisma.room.update({
      where: { id },
      data: { status }
    }) as unknown as Room;
  },

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.bookings.map((b: any) => ({
        ...b,
        guest: db.guests.find(g => g.id === b.guestId),
        room: db.rooms.find(r => r.id === b.roomId),
        payments: db.payments.filter(p => p.bookingId === b.id)
      }));
    }
    return await prisma.booking.findMany({
      include: { guest: true, room: true, payments: true },
      orderBy: { createdAt: "desc" }
    }) as unknown as Booking[];
  },

  async getBooking(id: string): Promise<Booking | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      const b = db.bookings.find(x => x.id === id);
      if (!b) return null;
      return {
        ...b,
        guest: db.guests.find(g => g.id === b.guestId),
        room: db.rooms.find(r => r.id === b.roomId),
        payments: db.payments.filter(p => p.bookingId === b.id)
      };
    }
    return await prisma.booking.findUnique({
      where: { id },
      include: { guest: true, room: true, payments: true }
    }) as unknown as Booking;
  },

  async getBookingByReceipt(receiptNo: string): Promise<Booking | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      const b = db.bookings.find(x => 
        x.receiptNo.toLowerCase() === receiptNo.toLowerCase().trim() ||
        (x.status === "ACTIVE" && db.rooms.find(r => r.id === x.roomId)?.roomNumber === receiptNo.trim())
      );
      if (!b) return null;
      return {
        ...b,
        guest: db.guests.find(g => g.id === b.guestId),
        room: db.rooms.find(r => r.id === b.roomId),
        payments: db.payments.filter(p => p.bookingId === b.id)
      };
    }
    // Try by receipt number first (unique/index match)
    const byReceipt = await prisma.booking.findUnique({
      where: { receiptNo },
      include: { guest: true, room: true, payments: true }
    });
    if (byReceipt) return byReceipt as unknown as Booking;

    // Try by active room number
    const byRoom = await prisma.booking.findFirst({
      where: {
        status: "ACTIVE",
        room: { roomNumber: receiptNo }
      },
      include: { guest: true, room: true, payments: true }
    });
    return byRoom as unknown as Booking;
  },

  async createBooking(data: {
    guestId: string;
    roomId: string;
    checkInDate: Date | string;
    checkOutDate: Date | string;
    noOfDays: number;
    noOfPersons: number;
    discount: number;
    advancePaid: number;
    totalAmount: number;
    balanceAmount: number;
    paymentMethod: Booking['paymentMethod'];
    paymentNote?: string;
  }): Promise<Booking> {
    const receiptNo = "RCP" + Math.floor(1000 + Math.random() * 9000);
    const bookingId = "b_" + Math.random().toString(36).substr(2, 9);
    
    if (isDemoMode()) {
      const db = readMockDB();
      
      const newBooking: Booking = {
        id: bookingId,
        receiptNo,
        guestId: data.guestId,
        roomId: data.roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        noOfDays: data.noOfDays,
        noOfPersons: data.noOfPersons,
        discount: data.discount,
        advancePaid: data.advancePaid,
        totalAmount: data.totalAmount,
        balanceAmount: data.balanceAmount,
        status: "ACTIVE",
        paymentMethod: data.paymentMethod,
        paymentNote: data.paymentNote || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Push to bookings
      db.bookings.push(newBooking);

      // Create initial payment if advance paid is > 0
      if (data.advancePaid > 0) {
        db.payments.push({
          id: "p_" + Math.random().toString(36).substr(2, 9),
          bookingId: bookingId,
          amount: data.advancePaid,
          method: data.paymentMethod,
          receiptNo,
          date: new Date().toISOString(),
          notes: "Advance Booking Payment",
          createdAt: new Date().toISOString()
        });
      }

      // Update room status
      const roomIdx = db.rooms.findIndex(r => r.id === data.roomId);
      if (roomIdx !== -1) {
        db.rooms[roomIdx].status = "OCCUPIED";
        db.rooms[roomIdx].updatedAt = new Date().toISOString();
      }

      // Log Audit Log
      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId: "system-user",
        action: "BOOKING_CREATE",
        details: `Booking ${receiptNo} created (Room ${db.rooms[roomIdx]?.roomNumber || data.roomId})`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return {
        ...newBooking,
        guest: db.guests.find(g => g.id === data.guestId),
        room: db.rooms.find(r => r.id === data.roomId),
        payments: db.payments.filter(p => p.bookingId === bookingId)
      };
    }

    // Prisma Execution
    const result = await prisma.$transaction(async (tx: any) => {
      // Create booking
      const b = await tx.booking.create({
        data: {
          receiptNo,
          guestId: data.guestId,
          roomId: data.roomId,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          noOfDays: data.noOfDays,
          noOfPersons: data.noOfPersons,
          discount: data.discount,
          advancePaid: data.advancePaid,
          totalAmount: data.totalAmount,
          balanceAmount: data.balanceAmount,
          status: "ACTIVE",
          paymentMethod: data.paymentMethod,
          paymentNote: data.paymentNote
        }
      });

      // Update room
      await tx.room.update({
        where: { id: data.roomId },
        data: { status: "OCCUPIED" }
      });

      // Add payment
      if (data.advancePaid > 0) {
        await tx.payment.create({
          data: {
            bookingId: b.id,
            amount: data.advancePaid,
            method: data.paymentMethod,
            receiptNo,
            notes: "Advance Booking Payment"
          }
        });
      }

      return b;
    });

    return await this.getBooking(result.id) as Booking;
  },

  async checkoutBooking(id: string, paymentDetails: {
    balanceAmount: number;
    paymentMethod: Booking['paymentMethod'];
    paymentNote?: string;
  }): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === id);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      booking.status = "CHECKED_OUT";
      
      // Add additional charges (the settlement paid at checkout if any) to totalAmount
      const additionalCharges = paymentDetails.balanceAmount - booking.balanceAmount;
      if (additionalCharges > 0) {
        booking.totalAmount = (booking.totalAmount || 0) + additionalCharges;
      }
      
      booking.balanceAmount = 0;
      booking.updatedAt = new Date().toISOString();

      // Create payment for settlement if amount > 0
      if (paymentDetails.balanceAmount > 0) {
        db.payments.push({
          id: "p_" + Math.random().toString(36).substr(2, 9),
          bookingId: id,
          amount: paymentDetails.balanceAmount,
          method: paymentDetails.paymentMethod,
          receiptNo: booking.receiptNo,
          date: new Date().toISOString(),
          notes: paymentDetails.paymentNote || "Settlement Payment",
          createdAt: new Date().toISOString()
        });
      }

      // Update room to CLEANING automatically on checkout
      const rIdx = db.rooms.findIndex(r => r.id === booking.roomId);
      if (rIdx !== -1) {
        db.rooms[rIdx].status = "CLEANING";
        db.rooms[rIdx].updatedAt = new Date().toISOString();
      }

      // Add audit log
      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId: "system-user",
        action: "CHECKOUT",
        details: `Booking ${booking.receiptNo} checked out. Room ${db.rooms[rIdx]?.roomNumber || booking.roomId} set to CLEANING.`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return {
        ...booking,
        guest: db.guests.find(g => g.id === booking.guestId),
        room: db.rooms.find(r => r.id === booking.roomId),
        payments: db.payments.filter(p => p.bookingId === id)
      };
    }

    // Prisma Transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const currentBooking = await tx.booking.findUniqueOrThrow({ where: { id } });
      const additionalCharges = paymentDetails.balanceAmount - currentBooking.balanceAmount;
      const updatedTotalAmount = currentBooking.totalAmount + (additionalCharges > 0 ? additionalCharges : 0);

      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: "CHECKED_OUT",
          totalAmount: updatedTotalAmount,
          balanceAmount: 0
        }
      });

      // Update room to CLEANING
      await tx.room.update({
        where: { id: currentBooking.roomId },
        data: { status: "CLEANING" }
      });

      // Add payment for settlement
      if (paymentDetails.balanceAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: id,
            amount: paymentDetails.balanceAmount,
            method: paymentDetails.paymentMethod,
            receiptNo: currentBooking.receiptNo,
            notes: paymentDetails.paymentNote || "Final Settlement Payment"
          }
        });
      }

      return updated;
    });

    return await this.getBooking(result.id) as Booking;
  },

  async transferRoom(bookingId: string, newRoomId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      const oldRoomId = booking.roomId;

      // Update booking roomId
      booking.roomId = newRoomId;
      booking.updatedAt = new Date().toISOString();

      // Free old room
      const oldRoomIdx = db.rooms.findIndex(r => r.id === oldRoomId);
      if (oldRoomIdx !== -1) db.rooms[oldRoomIdx].status = "CLEANING";

      // Occupy new room
      const newRoomIdx = db.rooms.findIndex(r => r.id === newRoomId);
      if (newRoomIdx !== -1) db.rooms[newRoomIdx].status = "OCCUPIED";

      // Log action
      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId: "system-user",
        action: "ROOM_TRANSFER",
        details: `Booking ${booking.receiptNo} transferred from Room ${db.rooms[oldRoomIdx]?.roomNumber || oldRoomId} to Room ${db.rooms[newRoomIdx]?.roomNumber || newRoomId}`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return booking;
    }

    // Prisma Transaction
    await prisma.$transaction(async (tx: any) => {
      const b = await tx.booking.findUniqueOrThrow({ where: { id: bookingId } });
      await tx.booking.update({
        where: { id: bookingId },
        data: { roomId: newRoomId }
      });
      await tx.room.update({
        where: { id: b.roomId },
        data: { status: "CLEANING" }
      });
      await tx.room.update({
        where: { id: newRoomId },
        data: { status: "OCCUPIED" }
      });
    });

    return await this.getBooking(bookingId) as Booking;
  },

  async extendStay(bookingId: string, additionalDays: number, additionalCost: number): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      booking.noOfDays += additionalDays;
      
      const newCheckOut = new Date(booking.checkOutDate);
      newCheckOut.setDate(newCheckOut.getDate() + additionalDays);
      booking.checkOutDate = newCheckOut.toISOString();

      booking.totalAmount += additionalCost;
      booking.balanceAmount += additionalCost;
      booking.updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId: "system-user",
        action: "STAY_EXTENSION",
        details: `Booking ${booking.receiptNo} extended by ${additionalDays} days. Additional cost: ₹${additionalCost}`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return booking;
    }

    const b = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const currentOut = new Date(b.checkOutDate);
    currentOut.setDate(currentOut.getDate() + additionalDays);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        noOfDays: b.noOfDays + additionalDays,
        checkOutDate: currentOut,
        totalAmount: b.totalAmount + additionalCost,
        balanceAmount: b.balanceAmount + additionalCost
      }
    });

    return await this.getBooking(updated.id) as Booking;
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      booking.status = "CANCELLED";
      booking.updatedAt = new Date().toISOString();

      // Free room
      const rIdx = db.rooms.findIndex(r => r.id === booking.roomId);
      if (rIdx !== -1) db.rooms[rIdx].status = "AVAILABLE";

      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId: "system-user",
        action: "BOOKING_CANCEL",
        details: `Booking ${booking.receiptNo} cancelled. Room ${db.rooms[rIdx]?.roomNumber || booking.roomId} set to AVAILABLE.`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return booking;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      });
      await tx.room.update({
        where: { id: b.roomId },
        data: { status: "AVAILABLE" }
      });
      return b;
    });

    return await this.getBooking(result.id) as Booking;
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<Payment[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.payments;
    }
    return await prisma.payment.findMany({
      orderBy: { date: "desc" }
    }) as unknown as Payment[];
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    const db = readMockDB();
    if (isDemoMode()) {
      return db.auditLogs.map((l: any) => ({
        ...l,
        username: l.userId === "admin-id" ? "Admin" : "Reception"
      }));
    }
    const raw = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { timestamp: "desc" },
      take: 50
    });
    return raw.map((l: any) => ({
      id: l.id,
      userId: l.userId,
      action: l.action,
      details: l.details,
      timestamp: l.timestamp,
      username: l.user.name
    }));
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Setting[]> {
    if (isDemoMode()) {
      return readMockDB().settings;
    }
    return await prisma.setting.findMany();
  },

  async updateSetting(key: string, value: string): Promise<Setting> {
    if (isDemoMode()) {
      const db = readMockDB();
      const sIdx = db.settings.findIndex(s => s.key === key);
      if (sIdx !== -1) {
        db.settings[sIdx].value = value;
      } else {
        db.settings.push({ id: "s_" + Math.random().toString(36).substr(2, 9), key, value });
      }
      writeMockDB(db);
      return db.settings.find(s => s.key === key)!;
    }
    return await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  },

  async clearAllData(): Promise<void> {
    if (isDemoMode()) {
      const db = readMockDB();
      db.guests = [];
      db.bookings = [];
      db.payments = [];
      db.auditLogs = [];
      db.rooms.forEach(r => {
        r.status = "AVAILABLE";
        r.updatedAt = new Date().toISOString();
      });
      writeMockDB(db);
      return;
    }

    const prismaClient = prisma as any;
    await prismaClient.$transaction([
      prismaClient.payment.deleteMany(),
      prismaClient.booking.deleteMany(),
      prismaClient.guest.deleteMany(),
      prismaClient.auditLog.deleteMany(),
      prismaClient.room.updateMany({
        data: { status: "AVAILABLE" }
      })
    ]);
  },

  // --- DASHBOARD & ANALYTICS STATS ---
  async getDashboardStats() {
    const db = readMockDB();
    
    let rooms: Room[] = [];
    let bookings: Booking[] = [];
    let payments: Payment[] = [];
    
    if (isDemoMode()) {
      rooms = db.rooms;
      bookings = db.bookings;
      payments = db.payments;
    } else {
      rooms = await prisma.room.findMany() as unknown as Room[];
      bookings = await prisma.booking.findMany({ include: { guest: true, room: true } }) as unknown as Booking[];
      payments = await prisma.payment.findMany() as unknown as Payment[];
    }

    const todayStr = new Date().toDateString();

    // Today's Checkins
    const todayCheckins = bookings.filter(b => {
      const checkinStr = new Date(b.checkInDate).toDateString();
      return checkinStr === todayStr && b.status === "ACTIVE";
    });

    // Today's Checkouts
    const todayCheckouts = bookings.filter(b => {
      const checkoutStr = new Date(b.checkOutDate).toDateString();
      return checkoutStr === todayStr && b.status === "CHECKED_OUT";
    });

    // Room Occupancy Breakdown
    const occupiedCount = rooms.filter(r => r.status === "OCCUPIED").length;
    const availableCount = rooms.filter(r => r.status === "AVAILABLE").length;
    const cleaningCount = rooms.filter(r => r.status === "CLEANING").length;
    const maintenanceCount = rooms.filter(r => r.status === "MAINTENANCE").length;

    // Stays collections based strictly on Checked-out bookings (rooms vacated)
    const checkedOutBookings = bookings.filter(b => b.status === "CHECKED_OUT");
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCollection = checkedOutBookings
      .filter(b => {
        const checkoutStr = new Date(b.updatedAt || b.checkOutDate).toDateString();
        return checkoutStr === todayStr;
      })
      .reduce((acc, b) => acc + b.totalAmount, 0);

    const getCollectionForDays = (days: number) => {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return checkedOutBookings
        .filter(b => new Date(b.updatedAt || b.checkOutDate).getTime() >= cutoff)
        .reduce((acc, b) => acc + b.totalAmount, 0);
    };

    const last7DaysCollection = getCollectionForDays(7);
    const lastMonthCollection = getCollectionForDays(30);
    const yearCollection = getCollectionForDays(365);
    const totalCollection = checkedOutBookings.reduce((acc, b) => acc + b.totalAmount, 0);

    // Pending Payments
    const pendingAmount = bookings
      .filter(b => b.status === "ACTIVE")
      .reduce((acc, b) => acc + b.balanceAmount, 0);

    // Recent Bookings (limit 5)
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentCheckins = sortedBookings.slice(0, 5).map((b: any) => {
      // Find guest and room relations if mock
      const guest = b.guest || db.guests.find(g => g.id === b.guestId);
      const room = b.room || db.rooms.find(r => r.id === b.roomId);
      return {
        id: b.id,
        receiptNo: b.receiptNo,
        guestName: guest?.name || "Unknown Guest",
        phone: guest?.phone || "N/A",
        roomNumber: room?.roomNumber || "N/A",
        roomType: room?.type || "N/A",
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        totalAmount: b.totalAmount,
        advancePaid: b.advancePaid,
        balanceAmount: b.balanceAmount,
        status: b.status
      };
    });

    // Recent Payments
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentPayments = sortedPayments.slice(0, 5).map((p: any) => {
      const booking = bookings.find(b => b.id === p.bookingId);
      const guest = booking ? (booking.guest || db.guests.find(g => g.id === booking.guestId)) : null;
      return {
        id: p.id,
        receiptNo: p.receiptNo,
        guestName: guest?.name || "N/A",
        amount: p.amount,
        method: p.method,
        date: p.date,
        notes: p.notes
      };
    });

    // Upcoming Checkouts (active bookings checking out soon)
    const upcomingCheckouts = bookings
      .filter(b => b.status === "ACTIVE")
      .sort((a, b) => new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime())
      .slice(0, 5)
      .map((b: any) => {
        const guest = b.guest || db.guests.find(g => g.id === b.guestId);
        const room = b.room || db.rooms.find(r => r.id === b.roomId);
        return {
          id: b.id,
          receiptNo: b.receiptNo,
          guestName: guest?.name || "N/A",
          roomNumber: room?.roomNumber || "N/A",
          checkOutDate: b.checkOutDate,
          balanceAmount: b.balanceAmount
        };
      });

    const getOccupiedDetails = (roomId: string) => {
      const activeBooking = bookings.find(b => b.roomId === roomId && b.status === "ACTIVE");
      if (!activeBooking) return undefined;
      const guest = activeBooking.guest || (isDemoMode() ? db.guests.find(g => g.id === activeBooking.guestId) : null);
      return {
        guestName: guest?.name || "Unknown Guest",
        checkOutDate: activeBooking.checkOutDate
      };
    };

    return {
      stats: {
        todayCheckinsCount: todayCheckins.length,
        todayCheckoutsCount: todayCheckouts.length,
        occupiedCount,
        availableCount,
        cleaningCount,
        maintenanceCount,
        todayCollection,
        cashCollection: todayCollection,
        upiCollection: 0,
        cardCollection: 0,
        last7DaysCollection,
        lastMonthCollection,
        yearCollection,
        totalCollection,
        pendingAmount
      },
      recentCheckins,
      recentPayments,
      upcomingCheckouts,
      floorStatus: {
        Ground: rooms.filter(r => r.floor.includes("Ground")).map(r => r.status === "OCCUPIED" ? { ...r, occupiedDetails: getOccupiedDetails(r.id) } : r),
        First: rooms.filter(r => r.floor.includes("First")).map(r => r.status === "OCCUPIED" ? { ...r, occupiedDetails: getOccupiedDetails(r.id) } : r),
        Second: rooms.filter(r => r.floor.includes("Second")).map(r => r.status === "OCCUPIED" ? { ...r, occupiedDetails: getOccupiedDetails(r.id) } : r)
      }
    };
  }
};
