import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

// Types matching Prisma models
export interface Guest {
  id: string;
  guestHouseId: string;
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
  idCardPhotoUrl?: string | null;
  familyMembers?: any; // JSON array of family members
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Room {
  id: string;
  guestHouseId: string;
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
  guestHouseId: string;
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
  guestHouseId: string;
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
  guestHouseId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date | string;
  username?: string; // Resolved for UI ease
}

export interface Setting {
  id: string;
  guestHouseId: string;
  key: string;
  value: string;
}

// Static tenant constants matching seeder
export const KALYANI_ID = "a1c8f615-5e60-449e-b8d4-539c2bb0e4cf";
export const YATHRI_ID = "b2d9a726-6f71-55af-c9e5-649d3cc1f5d0";

interface MockDBData {
  guests: Guest[];
  rooms: Room[];
  bookings: Booking[];
  payments: Payment[];
  auditLogs: AuditLog[];
  settings: Setting[];
}

const MOCK_DB_FILE = path.join(process.cwd(), "prisma", "mock-db.json");

// Check if we are running in DEMO_MODE
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
};

// Seed initial mock data for the JSON database
const getInitialMockData = (): MockDBData => {
  const rooms: Room[] = [];
  
  // Kalyani rooms (KALYANI_ID)
  const kalyaniRoomNumbers = [
    ...[1, 2, 3, 4, 5, 6, 19, 20, 21, 22, 23, 24].map(n => ({ num: `${n}`, floor: "Ground Floor" })),
    ...[7, 8, 9, 10, 11, 12, 25, 26, 27, 28, 29, 30].map(n => ({ num: `${n}`, floor: "First Floor" })),
    ...[13, 14, 15, 16, 17, 18, 31, 32, 33, 34, 35, 36].map(n => ({ num: `${n}`, floor: "Second Floor" })),
  ];
  kalyaniRoomNumbers.forEach((r, idx) => {
    const val = parseInt(r.num);
    const capacity = val % 3 === 0 ? 3 : val % 5 === 0 ? 4 : 2;
    const facilities = ["Hot Water"];
    if (val % 2 === 0) facilities.push("TV");
    if (val % 4 === 0) facilities.push("WiFi");
    rooms.push({
      id: `r_k_${idx}`,
      guestHouseId: KALYANI_ID,
      roomNumber: r.num,
      floor: r.floor,
      type: "Standard Room",
      status: "AVAILABLE",
      capacity,
      ratePerDay: 300,
      facilities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Yathri rooms (YATHRI_ID)
  const yathriRoomNumbers = [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(n => ({ num: n < 10 ? `0${n}` : `${n}`, floor: "Ground Floor" })),
    ...[14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].map(n => ({ num: `${n}`, floor: "First Floor" })),
    ...[28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41].map(n => ({ num: `${n}`, floor: "Second Floor" })),
  ];
  yathriRoomNumbers.forEach((r, idx) => {
    const val = parseInt(r.num);
    const capacity = val % 3 === 0 ? 3 : val % 5 === 0 ? 4 : 2;
    const facilities = ["Hot Water"];
    if (val % 2 === 0) facilities.push("TV");
    if (val % 4 === 0) facilities.push("WiFi");
    rooms.push({
      id: `r_y_${idx}`,
      guestHouseId: YATHRI_ID,
      roomNumber: r.num,
      floor: r.floor,
      type: "Standard Room",
      status: "AVAILABLE",
      capacity,
      ratePerDay: 300,
      facilities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const guests: Guest[] = [
    {
      id: "g1",
      guestHouseId: KALYANI_ID,
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
      idNumber: "123456789012",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const bookings: Booking[] = [];
  const payments: Payment[] = [];
  const auditLogs: AuditLog[] = [];
  
  const settings: Setting[] = [
    { id: "s1", guestHouseId: KALYANI_ID, key: "templeName", value: "Kalyani Guest House - Siddaganga Mutt" },
    { id: "s2", guestHouseId: KALYANI_ID, key: "templeAddress", value: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ. (KYATSANDRA, Siddaganga Math, Tumkur District.)" },
    { id: "s3", guestHouseId: KALYANI_ID, key: "contactNumber", value: "+91 816 2282247" },
    { id: "s4", guestHouseId: KALYANI_ID, key: "receiptFooter", value: "ಈ ರಶೀದಿಯು ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತದೆ. ತಮಗೆ ಸುಖಕರ ವಾಸ್ತವ್ಯವನ್ನು ಹಾರೈಸುತ್ತೇವೆ." },

    { id: "s5", guestHouseId: YATHRI_ID, key: "templeName", value: "Yathri Nivasa - Siddaganga Mutt" },
    { id: "s6", guestHouseId: YATHRI_ID, key: "templeAddress", value: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ. (KYATSANDRA, Siddaganga Math, Tumkur District.)" },
    { id: "s7", guestHouseId: YATHRI_ID, key: "contactNumber", value: "+91 816 2282247" },
    { id: "s8", guestHouseId: YATHRI_ID, key: "receiptFooter", value: "ಈ ರಶೀದಿಯು ಯಾತ್ರಿ ನಿವಾಸಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತದೆ. ನಿಮ್ಮ ಯಾತ್ರೆ ಶುಭದಾಯಕವಾಗಿರಲಿ." },
  ];

  return { guests, rooms, bookings, payments, auditLogs, settings };
};

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
    const parsed = JSON.parse(raw);
    
    // Auto-migrate old mock files to hold KALYANI_ID if missing guestHouseId
    let migrated = false;
    if (Array.isArray(parsed.rooms)) {
      parsed.rooms.forEach((r: any) => {
        if (!r.guestHouseId) {
          r.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }
    if (Array.isArray(parsed.guests)) {
      parsed.guests.forEach((g: any) => {
        if (!g.guestHouseId) {
          g.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }
    if (Array.isArray(parsed.bookings)) {
      parsed.bookings.forEach((b: any) => {
        if (!b.guestHouseId) {
          b.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }
    if (Array.isArray(parsed.payments)) {
      parsed.payments.forEach((p: any) => {
        if (!p.guestHouseId) {
          p.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }
    if (Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs.forEach((l: any) => {
        if (!l.guestHouseId) {
          l.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }
    if (Array.isArray(parsed.settings)) {
      parsed.settings.forEach((s: any) => {
        if (!s.guestHouseId) {
          s.guestHouseId = KALYANI_ID;
          migrated = true;
        }
      });
    }

    if (migrated) {
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (error) {
    console.error("Error reading JSON mock db:", error);
    return getInitialMockData();
  }
};

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
  async getGuests(guestHouseId: string): Promise<Guest[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests
        .filter(g => g.guestHouseId === guestHouseId)
        .map(g => {
          const activeStays = db.bookings.filter(b => b.guestHouseId === guestHouseId && b.guestId === g.id && b.status === "ACTIVE");
          const rooms = activeStays.map(b => db.rooms.find(r => r.id === b.roomId)?.roomNumber).filter(Boolean);
          return { 
            ...g, 
            hasActiveStay: activeStays.length > 0,
            activeRoomNumbers: rooms.join(", ") 
          } as any;
        });
    }
    const [raw, activeBookings] = await Promise.all([
      prisma.guest.findMany({
        where: { guestHouseId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.booking.findMany({
        where: { guestHouseId, status: "ACTIVE" },
        select: {
          guestId: true,
          room: {
            select: {
              roomNumber: true
            }
          }
        }
      })
    ]);

    const activeRoomsMap = new Map<string, string[]>();
    activeBookings.forEach((b: any) => {
      const roomNum = b.room?.roomNumber;
      if (roomNum) {
        const existing = activeRoomsMap.get(b.guestId) || [];
        existing.push(roomNum);
        activeRoomsMap.set(b.guestId, existing);
      }
    });

    return raw.map((g: any) => {
      const activeRooms = activeRoomsMap.get(g.id) || [];
      return {
        ...g,
        familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : [],
        hasActiveStay: activeRooms.length > 0,
        activeRoomNumbers: activeRooms.join(", ")
      };
    }) as unknown as Guest[];
  },

  async getGuestsPaged(
    guestHouseId: string,
    search: string,
    page: number,
    pageSize: number = 12
  ): Promise<{ guests: Guest[]; totalCount: number }> {
    const skip = (page - 1) * pageSize;

    if (isDemoMode()) {
      const db = readMockDB();
      const all = db.guests
        .filter(g => g.guestHouseId === guestHouseId)
        .map(g => {
          const activeStays = db.bookings.filter(b => b.guestHouseId === guestHouseId && b.guestId === g.id && b.status === "ACTIVE");
          const rooms = activeStays.map(b => db.rooms.find(r => r.id === b.roomId)?.roomNumber).filter(Boolean);
          return {
            ...g,
            hasActiveStay: activeStays.length > 0,
            activeRoomNumbers: rooms.join(", "),
            familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
          };
        });

      const filtered = all.filter(g => {
        const cleanSearch = search.trim().toLowerCase();
        if (cleanSearch === "") return true;
        return (
          g.name.toLowerCase().includes(cleanSearch) ||
          g.phone.includes(cleanSearch) ||
          g.idNumber.toLowerCase().includes(cleanSearch) ||
          g.district.toLowerCase().includes(cleanSearch)
        );
      });

      return {
        guests: filtered.slice(skip, skip + pageSize) as unknown as Guest[],
        totalCount: filtered.length
      };
    }

    const whereClause: any = {
      guestHouseId,
    };

    if (search.trim() !== "") {
      const cleanSearch = search.trim();
      whereClause.OR = [
        { name: { contains: cleanSearch, mode: "insensitive" } },
        { phone: { contains: cleanSearch } },
        { idNumber: { contains: cleanSearch, mode: "insensitive" } },
        { district: { contains: cleanSearch, mode: "insensitive" } }
      ];
    }

    const [totalCount, raw] = await Promise.all([
      prisma.guest.count({ where: whereClause }),
      prisma.guest.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      })
    ]);

    const activeBookings = await prisma.booking.findMany({
      where: {
        guestHouseId,
        status: "ACTIVE",
        guestId: { in: raw.map(g => g.id) }
      },
      select: {
        guestId: true,
        room: {
          select: {
            roomNumber: true
          }
        }
      }
    });

    const activeRoomsMap = new Map<string, string[]>();
    activeBookings.forEach((b: any) => {
      const roomNum = b.room?.roomNumber;
      if (roomNum) {
        const existing = activeRoomsMap.get(b.guestId) || [];
        existing.push(roomNum);
        activeRoomsMap.set(b.guestId, existing);
      }
    });

    const guests = raw.map((g: any) => {
      const activeRooms = activeRoomsMap.get(g.id) || [];
      return {
        ...g,
        familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : [],
        hasActiveStay: activeRooms.length > 0,
        activeRoomNumbers: activeRooms.join(", ")
      };
    });

    return {
      guests: guests as unknown as Guest[],
      totalCount
    };
  },

  async getGuest(id: string, guestHouseId: string): Promise<Guest | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests.find(g => g.id === id && g.guestHouseId === guestHouseId) || null;
    }
    const g = await prisma.guest.findFirst({
      where: { id, guestHouseId }
    });
    if (!g) return null;
    return {
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
    } as unknown as Guest;
  },

  async getGuestByPhone(phone: string, guestHouseId: string): Promise<Guest | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.guests.find(g => g.phone === phone && g.guestHouseId === guestHouseId) || null;
    }
    const g = await prisma.guest.findFirst({
      where: { phone, guestHouseId }
    });
    if (!g) return null;
    return {
      ...g,
      familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : []
    } as unknown as Guest;
  },

  async searchGuest(query: string, guestHouseId: string): Promise<Guest[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    if (isDemoMode()) {
      const db = readMockDB();
      const filtered = db.guests.filter(
        g =>
          g.guestHouseId === guestHouseId &&
          (g.name.toLowerCase().includes(cleanQuery) ||
           g.phone.includes(cleanQuery) ||
           g.idNumber.toLowerCase().includes(cleanQuery))
      );
      return filtered.map(g => {
        const activeBooking = db.bookings.find(b => b.guestHouseId === guestHouseId && b.guestId === g.id && b.status === "ACTIVE");
        return {
          ...g,
          hasActiveStay: !!activeBooking,
          activeReceiptNo: activeBooking?.receiptNo || null
        } as any;
      });
    }

    const raw = await prisma.guest.findMany({
      where: {
        guestHouseId,
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { phone: { contains: cleanQuery } },
          { idNumber: { contains: cleanQuery, mode: "insensitive" } }
        ]
      }
    });
    const activeBookings = await prisma.booking.findMany({
      where: { guestHouseId, status: "ACTIVE" }
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

  async createGuest(data: Omit<Guest, "id" | "guestHouseId" | "createdAt" | "updatedAt">, guestHouseId: string): Promise<Guest> {
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    if (data.idType === "Aadhaar Card") {
      const cleanAadhaar = data.idNumber.replace(/\D/g, "");
      if (cleanAadhaar.length !== 12) {
        throw new Error("Aadhaar Card number must be exactly 12 digits");
      }
      data.idNumber = cleanAadhaar;
    }

    const sanitizedData = { ...data, phone: cleanPhone, guestHouseId };

    if (isDemoMode()) {
      const db = readMockDB();
      
      const duplicate = db.guests.find(g => g.phone === cleanPhone && g.guestHouseId === guestHouseId);
      if (duplicate) {
        throw new Error("A guest with this phone number already exists in this Guest House");
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

    // Check PostgreSQL unique constraint
    const duplicate = await prisma.guest.findUnique({
      where: {
        guestHouseId_phone: { guestHouseId, phone: cleanPhone }
      }
    });
    if (duplicate) {
      throw new Error("A guest with this phone number already exists in this Guest House");
    }

    const created = await prisma.guest.create({
      data: {
        guestHouseId,
        name: data.name,
        phone: cleanPhone,
        address: data.address,
        gender: data.gender,
        age: data.age,
        occupation: data.occupation,
        district: data.district,
        state: data.state,
        pin: data.pin,
        idType: data.idType,
        idNumber: data.idNumber,
        emergencyContact: data.emergencyContact,
        photoUrl: data.photoUrl,
        idCardPhotoUrl: data.idCardPhotoUrl,
        familyMembers: data.familyMembers ? JSON.parse(JSON.stringify(data.familyMembers)) : []
      }
    });
    return created as unknown as Guest;
  },

  async updateGuestPhoto(guestId: string, photoUrl: string, guestHouseId: string): Promise<Guest> {
    if (isDemoMode()) {
      const db = readMockDB();
      const idx = db.guests.findIndex(g => g.id === guestId && g.guestHouseId === guestHouseId);
      if (idx === -1) throw new Error("Guest profile not found");
      db.guests[idx].photoUrl = photoUrl;
      db.guests[idx].updatedAt = new Date().toISOString();
      writeMockDB(db);
      return db.guests[idx];
    }
    const g = await prisma.guest.update({
      where: { id: guestId },
      data: { photoUrl }
    });
    return g as unknown as Guest;
  },

  async updateGuestIdCardPhoto(guestId: string, idCardPhotoUrl: string, guestHouseId: string): Promise<Guest> {
    if (isDemoMode()) {
      const db = readMockDB();
      const idx = db.guests.findIndex(g => g.id === guestId && g.guestHouseId === guestHouseId);
      if (idx === -1) throw new Error("Guest profile not found");
      db.guests[idx].idCardPhotoUrl = idCardPhotoUrl;
      db.guests[idx].updatedAt = new Date().toISOString();
      writeMockDB(db);
      return db.guests[idx];
    }
    const g = await prisma.guest.update({
      where: { id: guestId },
      data: { idCardPhotoUrl }
    });
    return g as unknown as Guest;
  },

  // --- ROOMS ---
  async getRooms(guestHouseId: string): Promise<Room[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      const rooms = db.rooms.filter(r => r.guestHouseId === guestHouseId);
      return rooms.map(r => {
        const activeBooking = db.bookings.find(b => b.guestHouseId === guestHouseId && b.roomId === r.id && b.status === "ACTIVE");
        if (activeBooking && r.status === "OCCUPIED") {
          const guest = db.guests.find(g => g.id === activeBooking.guestId);
          return {
            ...r,
            occupiedDetails: {
              guestName: guest?.name || "Unknown Guest",
              checkOutDate: activeBooking.checkOutDate,
              receiptNo: activeBooking.receiptNo
            }
          } as any;
        }
        return r;
      });
    }

    const [rooms, activeBookings] = await Promise.all([
      prisma.room.findMany({
        where: { guestHouseId },
        orderBy: { roomNumber: "asc" }
      }),
      prisma.booking.findMany({
        where: { guestHouseId, status: "ACTIVE" },
        select: {
          roomId: true,
          receiptNo: true,
          checkOutDate: true,
          guest: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return rooms.map((r: any) => {
      const activeBooking = activeBookings.find((b: any) => b.roomId === r.id);
      if (activeBooking && r.status === "OCCUPIED") {
        return {
          ...r,
          occupiedDetails: {
            guestName: activeBooking.guest?.name || "Unknown Guest",
            checkOutDate: activeBooking.checkOutDate.toISOString(),
            receiptNo: activeBooking.receiptNo
          }
        };
      }
      return r;
    }) as unknown as Room[];
  },

  async updateRoomStatus(id: string, status: Room['status'], guestHouseId: string): Promise<Room> {
    if (isDemoMode()) {
      const db = readMockDB();
      const idx = db.rooms.findIndex(r => r.id === id && r.guestHouseId === guestHouseId);
      if (idx === -1) throw new Error("Room not found");
      db.rooms[idx].status = status;
      db.rooms[idx].updatedAt = new Date().toISOString();
      writeMockDB(db);
      return db.rooms[idx];
    }
    return await prisma.room.update({
      where: { id },
      data: { status }
    }) as unknown as Room;
  },

  // --- BOOKINGS ---
  async getBookings(guestHouseId: string): Promise<Booking[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.bookings
        .filter(b => b.guestHouseId === guestHouseId)
        .map(b => ({
          ...b,
          guest: db.guests.find(g => g.id === b.guestId),
          room: db.rooms.find(r => r.id === b.roomId),
          payments: db.payments.filter(p => p.bookingId === b.id),
          guestHouse: {
            name: b.guestHouseId === YATHRI_ID ? "Yathri Nivasa" : "Kalyani Guest House",
            nameKn: b.guestHouseId === YATHRI_ID ? "ಯಾತ್ರಿ ನಿವಾಸ" : "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ"
          }
        })) as unknown as Booking[];
    }
    return await prisma.booking.findMany({
      where: { guestHouseId },
      include: { guest: true, room: true, payments: true, guestHouse: true },
      orderBy: { createdAt: "desc" }
    }) as unknown as Booking[];
  },

  async getBookingsPaged(
    guestHouseId: string,
    search: string,
    status: string,
    page: number,
    pageSize: number = 10
  ): Promise<{ bookings: Booking[]; totalCount: number }> {
    const skip = (page - 1) * pageSize;

    if (isDemoMode()) {
      const db = readMockDB();
      const all = db.bookings
        .filter(b => b.guestHouseId === guestHouseId)
        .map(b => ({
          ...b,
          guest: db.guests.find(g => g.id === b.guestId),
          room: db.rooms.find(r => r.id === b.roomId),
          payments: db.payments.filter(p => p.bookingId === b.id),
          guestHouse: {
            name: b.guestHouseId === YATHRI_ID ? "Yathri Nivasa" : "Kalyani Guest House",
            nameKn: b.guestHouseId === YATHRI_ID ? "ಯಾತ್ರಿ ನಿವಾಸ" : "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ"
          }
        }));

      const filtered = all.filter(b => {
        const matchesSearch =
          b.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
          b.guest?.name.toLowerCase().includes(search.toLowerCase()) ||
          b.guest?.phone.includes(search) ||
          b.room?.roomNumber.includes(search);

        const matchesStatus = status === "ALL" || b.status === status;
        return matchesSearch && matchesStatus;
      });

      const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        bookings: sorted.slice(skip, skip + pageSize) as unknown as Booking[],
        totalCount: filtered.length
      };
    }

    const whereClause: any = {
      guestHouseId,
    };

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (search.trim() !== "") {
      const cleanSearch = search.trim();
      whereClause.OR = [
        { receiptNo: { contains: cleanSearch, mode: "insensitive" } },
        {
          guest: {
            OR: [
              { name: { contains: cleanSearch, mode: "insensitive" } },
              { phone: { contains: cleanSearch } }
            ]
          }
        },
        {
          room: {
            roomNumber: { contains: cleanSearch }
          }
        }
      ];
    }

    const [totalCount, bookings] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              idType: true,
              idNumber: true
            }
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              type: true,
              ratePerDay: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              receiptNo: true,
              date: true
            }
          },
          guestHouse: {
            select: {
              id: true,
              code: true,
              name: true,
              nameKn: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      })
    ]);

    return {
      bookings: bookings as unknown as Booking[],
      totalCount
    };
  },

  async getBooking(id: string, guestHouseId: string): Promise<Booking | null> {
    if (isDemoMode()) {
      const db = readMockDB();
      const b = db.bookings.find(x => x.id === id && x.guestHouseId === guestHouseId);
      if (!b) return null;
      return {
        ...b,
        guest: db.guests.find(g => g.id === b.guestId),
        room: db.rooms.find(r => r.id === b.roomId),
        payments: db.payments.filter(p => p.bookingId === b.id),
        guestHouse: {
          name: b.guestHouseId === YATHRI_ID ? "Yathri Nivasa" : "Kalyani Guest House",
          nameKn: b.guestHouseId === YATHRI_ID ? "ಯಾತ್ರಿ ನಿವಾಸ" : "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ"
        }
      } as unknown as Booking;
    }
    return await prisma.booking.findFirst({
      where: { id, guestHouseId },
      include: { guest: true, room: true, payments: true, guestHouse: true }
    }) as unknown as Booking;
  },

  async getBookingByReceipt(receiptNo: string, guestHouseId: string): Promise<any> {
    if (isDemoMode()) {
      const db = readMockDB();
      const baseReceipt = receiptNo.split("/")[0];
      const matchingBooking = db.bookings.find(b => b.guestHouseId === guestHouseId && b.receiptNo === baseReceipt);
      if (!matchingBooking) return null;

      const relatedBookings = db.bookings.filter(b => 
        b.guestHouseId === guestHouseId &&
        (b.receiptNo === baseReceipt || b.receiptNo.startsWith(baseReceipt + "/"))
      );

      const totalAmount = relatedBookings.reduce((sum, x) => sum + x.totalAmount, 0);
      const advancePaid = relatedBookings.reduce((sum, x) => sum + x.advancePaid, 0);
      const balanceAmount = relatedBookings.reduce((sum, x) => sum + x.balanceAmount, 0);

      const rooms = relatedBookings.map(b => db.rooms.find(r => r.id === b.roomId)).filter(Boolean);
      const allPayments = db.payments.filter(p => relatedBookings.some(b => b.id === p.bookingId));

      return {
        ...matchingBooking,
        totalAmount,
        balanceAmount,
        advancePaid,
        guest: db.guests.find(g => g.id === matchingBooking.guestId),
        room: db.rooms.find(r => r.id === matchingBooking.roomId),
        payments: allPayments,
        roomNumbers: rooms.map((r: any) => r.roomNumber).join(", ")
      } as any;
    }

    const baseReceipt = receiptNo.split("/")[0];
    const matchingBooking = await prisma.booking.findFirst({
      where: { guestHouseId, receiptNo: baseReceipt },
      include: { guest: true, room: true, payments: true, guestHouse: true }
    });
    if (!matchingBooking) return null;

    const relatedBookings = await prisma.booking.findMany({
      where: {
        guestHouseId,
        OR: [
          { receiptNo: baseReceipt },
          { receiptNo: { startsWith: baseReceipt + "/" } }
        ]
      },
      include: { room: true, payments: true, guestHouse: true }
    });

    const totalAmount = relatedBookings.reduce((sum: number, x: any) => sum + x.totalAmount, 0);
    const advancePaid = relatedBookings.reduce((sum: number, x: any) => sum + x.advancePaid, 0);
    const balanceAmount = relatedBookings.reduce((sum: number, x: any) => sum + x.balanceAmount, 0);

    const rooms = relatedBookings.map((b: any) => b.room).filter(Boolean);
    const allPayments = relatedBookings.flatMap((b: any) => b.payments);

    return {
      ...matchingBooking,
      totalAmount,
      balanceAmount,
      advancePaid,
      payments: allPayments,
      roomNumbers: rooms.map((r: any) => r.roomNumber).join(", ")
    } as any;
  },

  async createBooking(data: {
    guestId: string;
    roomId?: string;
    roomIds?: string[];
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
  }, guestHouseId: string): Promise<any> {
    const roomIdsList = data.roomIds && data.roomIds.length > 0 ? data.roomIds : [data.roomId!];
    const baseReceiptNo = "RCP" + Math.floor(1000 + Math.random() * 9000);
    
    if (isDemoMode()) {
      const db = readMockDB();
      let mainBooking: Booking | null = null;

      for (let index = 0; index < roomIdsList.length; index++) {
        const rId = roomIdsList[index];
        const currentRoom = db.rooms.find(r => r.id === rId && r.guestHouseId === guestHouseId);
        const roomRate = currentRoom ? currentRoom.ratePerDay : 300;
        
        const receiptNo = index === 0 ? baseReceiptNo : `${baseReceiptNo}/${index}`;
        const bookingId = "b_" + Math.random().toString(36).substr(2, 9);

        const roomTotal = roomRate * data.noOfDays;
        const roomAdvance = index === 0 ? data.advancePaid : 0;
        const roomBalance = roomTotal - roomAdvance;

        const newBooking: Booking = {
          id: bookingId,
          guestHouseId,
          receiptNo,
          guestId: data.guestId,
          roomId: rId,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          noOfDays: data.noOfDays,
          noOfPersons: data.noOfPersons,
          discount: index === 0 ? data.discount : 0,
          advancePaid: roomAdvance,
          totalAmount: roomTotal,
          balanceAmount: roomBalance,
          status: "ACTIVE",
          paymentMethod: data.paymentMethod,
          paymentNote: data.paymentNote || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.bookings.push(newBooking);

        if (roomAdvance > 0) {
          db.payments.push({
            id: "p_" + Math.random().toString(36).substr(2, 9),
            guestHouseId,
            bookingId: bookingId,
            amount: roomAdvance,
            method: data.paymentMethod,
            receiptNo,
            date: new Date().toISOString(),
            notes: "Advance Booking Payment",
            createdAt: new Date().toISOString()
          });
        }

        const roomIdx = db.rooms.findIndex(r => r.id === rId && r.guestHouseId === guestHouseId);
        if (roomIdx !== -1) {
          db.rooms[roomIdx].status = "OCCUPIED";
          db.rooms[roomIdx].updatedAt = new Date().toISOString();
        }

        db.auditLogs.unshift({
          id: "log_" + Math.random().toString(36).substr(2, 9),
          guestHouseId,
          userId: "system-user",
          action: "BOOKING_CREATE",
          details: `Booking ${receiptNo} created (Room ${currentRoom?.roomNumber || rId})`,
          timestamp: new Date().toISOString()
        });

        if (index === 0) {
          mainBooking = newBooking;
        }
      }

      writeMockDB(db);
      const rooms = roomIdsList.map(rId => db.rooms.find(r => r.id === rId && r.guestHouseId === guestHouseId)).filter(Boolean);
      return {
        ...mainBooking!,
        guest: db.guests.find(g => g.id === data.guestId && g.guestHouseId === guestHouseId),
        room: db.rooms.find(r => r.id === mainBooking!.roomId && r.guestHouseId === guestHouseId),
        payments: db.payments.filter(p => p.bookingId === mainBooking!.id),
        roomNumbers: rooms.map((r: any) => r.roomNumber).join(", ")
      };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      let firstBooking: any = null;

      for (let index = 0; index < roomIdsList.length; index++) {
        const rId = roomIdsList[index];
        const currentRoom = await tx.room.findFirstOrThrow({ where: { id: rId, guestHouseId } });
        const roomRate = currentRoom ? currentRoom.ratePerDay : 300;

        const receiptNo = index === 0 ? baseReceiptNo : `${baseReceiptNo}/${index}`;
        const roomTotal = roomRate * data.noOfDays;
        const roomAdvance = index === 0 ? data.advancePaid : 0;
        const roomBalance = roomTotal - roomAdvance;

        const b = await tx.booking.create({
          data: {
            guestHouseId,
            receiptNo,
            guestId: data.guestId,
            roomId: rId,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            noOfDays: data.noOfDays,
            noOfPersons: data.noOfPersons,
            discount: index === 0 ? data.discount : 0,
            advancePaid: roomAdvance,
            totalAmount: roomTotal,
            balanceAmount: roomBalance,
            status: "ACTIVE",
            paymentMethod: data.paymentMethod,
            paymentNote: data.paymentNote
          }
        });

        await tx.room.update({
          where: { id: rId },
          data: { status: "OCCUPIED" }
        });

        if (roomAdvance > 0) {
          await tx.payment.create({
            data: {
              guestHouseId,
              bookingId: b.id,
              amount: roomAdvance,
              method: data.paymentMethod,
              receiptNo,
              notes: "Advance Booking Payment"
            }
          });
        }

        if (index === 0) {
          firstBooking = b;
        }
      }

      return firstBooking;
    });

    const rooms = await prisma.room.findMany({
      where: { id: { in: roomIdsList }, guestHouseId }
    });
    const mainB = await this.getBooking(result.id, guestHouseId);
    return {
      ...mainB,
      roomNumbers: rooms.map((r: any) => r.roomNumber).join(", ")
    } as any;
  },

  async checkoutBooking(id: string, paymentDetails: {
    balanceAmount: number;
    paymentMethod: Booking['paymentMethod'];
    paymentNote?: string;
  }, guestHouseId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === id && b.guestHouseId === guestHouseId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      const baseReceipt = booking.receiptNo.split("/")[0];
      const relatedBookings = db.bookings.filter(b => 
        b.guestHouseId === guestHouseId &&
        b.status === "ACTIVE" && 
        (b.receiptNo === baseReceipt || b.receiptNo.startsWith(baseReceipt + "/"))
      );

      const aggregatedBalance = relatedBookings.reduce((sum, x) => sum + x.balanceAmount, 0);
      const additionalCharges = paymentDetails.balanceAmount - aggregatedBalance;

      relatedBookings.forEach(b => {
        const idx = db.bookings.findIndex(x => x.id === b.id && x.guestHouseId === guestHouseId);
        if (idx !== -1) {
          db.bookings[idx].status = "CHECKED_OUT";
          db.bookings[idx].updatedAt = new Date().toISOString();
          
          if (b.id === id) {
            if (additionalCharges > 0) {
              db.bookings[idx].totalAmount = (db.bookings[idx].totalAmount || 0) + additionalCharges;
            }
            db.bookings[idx].balanceAmount = 0;

            if (paymentDetails.balanceAmount > 0) {
              db.payments.push({
                id: "p_" + Math.random().toString(36).substr(2, 9),
                guestHouseId,
                bookingId: id,
                amount: paymentDetails.balanceAmount,
                method: paymentDetails.paymentMethod,
                receiptNo: b.receiptNo,
                date: new Date().toISOString(),
                notes: paymentDetails.paymentNote || "Settlement Payment",
                createdAt: new Date().toISOString()
              });
            }
          } else {
            db.bookings[idx].balanceAmount = 0;
          }

          const rIdx = db.rooms.findIndex(r => r.id === b.roomId && r.guestHouseId === guestHouseId);
          if (rIdx !== -1) {
            db.rooms[rIdx].status = "AVAILABLE";
            db.rooms[rIdx].updatedAt = new Date().toISOString();
          }

          db.auditLogs.unshift({
            id: "log_" + Math.random().toString(36).substr(2, 9),
            guestHouseId,
            userId: "system-user",
            action: "CHECKOUT",
            details: `Booking ${b.receiptNo} checked out. Room ${db.rooms[rIdx]?.roomNumber || b.roomId} set to AVAILABLE.`,
            timestamp: new Date().toISOString()
          });
        }
      });

      writeMockDB(db);
      return {
        ...booking,
        guest: db.guests.find(g => g.id === booking.guestId && g.guestHouseId === guestHouseId),
        room: db.rooms.find(r => r.id === booking.roomId && r.guestHouseId === guestHouseId),
        payments: db.payments.filter(p => p.bookingId === id)
      };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const currentBooking = await tx.booking.findFirstOrThrow({ where: { id, guestHouseId } });
      const baseReceipt = currentBooking.receiptNo.split("/")[0];
      const relatedBookings = await tx.booking.findMany({
        where: {
          guestHouseId,
          status: "ACTIVE",
          OR: [
            { receiptNo: baseReceipt },
            { receiptNo: { startsWith: baseReceipt + "/" } }
          ]
        }
      });

      const aggregatedBalance = relatedBookings.reduce((sum: number, x: any) => sum + x.balanceAmount, 0);
      const additionalCharges = paymentDetails.balanceAmount - aggregatedBalance;

      for (const b of relatedBookings) {
        if (b.id === id) {
          const updatedTotalAmount = b.totalAmount + (additionalCharges > 0 ? additionalCharges : 0);
          await tx.booking.update({
            where: { id: b.id },
            data: {
              status: "CHECKED_OUT",
              totalAmount: updatedTotalAmount,
              balanceAmount: 0
            }
          });

          if (paymentDetails.balanceAmount > 0) {
            await tx.payment.create({
              data: {
                guestHouseId,
                bookingId: id,
                amount: paymentDetails.balanceAmount,
                method: paymentDetails.paymentMethod,
                receiptNo: b.receiptNo,
                notes: paymentDetails.paymentNote || "Final Settlement Payment"
              }
            });
          }
        } else {
          await tx.booking.update({
            where: { id: b.id },
            data: {
              status: "CHECKED_OUT",
              balanceAmount: 0
            }
          });
        }

        await tx.room.update({
          where: { id: b.roomId },
          data: { status: "AVAILABLE" }
        });
      }

      return currentBooking;
    });

    return await this.getBooking(result.id, guestHouseId) as Booking;
  },

  async transferRoom(bookingId: string, newRoomId: string, guestHouseId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId && b.guestHouseId === guestHouseId);
      if (bIdx === -1) throw new Error("Booking not found");

      const oldRoomId = db.bookings[bIdx].roomId;
      
      // Update room statuses
      const oldRoomIdx = db.rooms.findIndex(r => r.id === oldRoomId && r.guestHouseId === guestHouseId);
      if (oldRoomIdx !== -1) db.rooms[oldRoomIdx].status = "AVAILABLE";

      const newRoomIdx = db.rooms.findIndex(r => r.id === newRoomId && r.guestHouseId === guestHouseId);
      if (newRoomIdx !== -1) db.rooms[newRoomIdx].status = "OCCUPIED";

      db.bookings[bIdx].roomId = newRoomId;
      db.bookings[bIdx].updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        guestHouseId,
        userId: "system-user",
        action: "ROOM_TRANSFER",
        details: `Booking ${db.bookings[bIdx].receiptNo} transferred from Room ${db.rooms[oldRoomIdx]?.roomNumber} to ${db.rooms[newRoomIdx]?.roomNumber}`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return db.bookings[bIdx];
    }

    const b = await prisma.booking.findFirstOrThrow({ where: { id: bookingId, guestHouseId } });
    const oldRoomId = b.roomId;

    await prisma.$transaction([
      prisma.room.update({
        where: { id: oldRoomId },
        data: { status: "AVAILABLE" }
      }),
      prisma.room.update({
        where: { id: newRoomId },
        data: { status: "OCCUPIED" }
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { roomId: newRoomId }
      })
    ]);

    return await this.getBooking(bookingId, guestHouseId) as Booking;
  },

  async extendStay(bookingId: string, additionalDays: number, additionalCost: number, guestHouseId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId && b.guestHouseId === guestHouseId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      const oldCheckOut = new Date(booking.checkOutDate);
      const newCheckOut = new Date(oldCheckOut.getTime() + additionalDays * 24 * 60 * 60 * 1000);

      db.bookings[bIdx].checkOutDate = newCheckOut.toISOString();
      db.bookings[bIdx].noOfDays += additionalDays;
      db.bookings[bIdx].totalAmount += additionalCost;
      db.bookings[bIdx].balanceAmount += additionalCost;
      db.bookings[bIdx].updatedAt = new Date().toISOString();

      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        guestHouseId,
        userId: "system-user",
        action: "STAY_EXTENSION",
        details: `Booking ${booking.receiptNo} extended by ${additionalDays} days. New checkout: ${newCheckOut.toLocaleDateString("en-IN")}`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return db.bookings[bIdx];
    }

    const b = await prisma.booking.findFirstOrThrow({ where: { id: bookingId, guestHouseId } });
    const newCheckOut = new Date(new Date(b.checkOutDate).getTime() + additionalDays * 24 * 60 * 60 * 1000);

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkOutDate: newCheckOut,
        noOfDays: { increment: additionalDays },
        totalAmount: { increment: additionalCost },
        balanceAmount: { increment: additionalCost }
      }
    });

    return await this.getBooking(bookingId, guestHouseId) as Booking;
  },

  async cancelBooking(bookingId: string, guestHouseId: string): Promise<Booking> {
    if (isDemoMode()) {
      const db = readMockDB();
      const bIdx = db.bookings.findIndex(b => b.id === bookingId && b.guestHouseId === guestHouseId);
      if (bIdx === -1) throw new Error("Booking not found");

      const booking = db.bookings[bIdx];
      db.bookings[bIdx].status = "CANCELLED";
      db.bookings[bIdx].balanceAmount = 0;
      db.bookings[bIdx].updatedAt = new Date().toISOString();

      const rIdx = db.rooms.findIndex(r => r.id === booking.roomId && r.guestHouseId === guestHouseId);
      if (rIdx !== -1) {
        db.rooms[rIdx].status = "AVAILABLE";
        db.rooms[rIdx].updatedAt = new Date().toISOString();
      }

      db.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        guestHouseId,
        userId: "system-user",
        action: "BOOKING_CANCEL",
        details: `Booking ${booking.receiptNo} cancelled. Room ${db.rooms[rIdx]?.roomNumber} set to AVAILABLE.`,
        timestamp: new Date().toISOString()
      });

      writeMockDB(db);
      return db.bookings[bIdx];
    }

    const b = await prisma.booking.findFirstOrThrow({ where: { id: bookingId, guestHouseId } });
    
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", balanceAmount: 0 }
      }),
      prisma.room.update({
        where: { id: b.roomId },
        data: { status: "AVAILABLE" }
      })
    ]);

    return await this.getBooking(bookingId, guestHouseId) as Booking;
  },

  // --- PAYMENTS ---
  async getPayments(guestHouseId: string): Promise<Payment[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.payments.filter(p => p.guestHouseId === guestHouseId);
    }
    return await prisma.payment.findMany({
      where: { guestHouseId },
      orderBy: { date: "desc" }
    }) as unknown as Payment[];
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(guestHouseId: string): Promise<AuditLog[]> {
    if (isDemoMode()) {
      const db = readMockDB();
      return db.auditLogs
        .filter(l => l.guestHouseId === guestHouseId)
        .map((l: any) => ({
          ...l,
          username: l.userId === "kalyani-admin-id" || l.userId === "yathri-admin-id" ? "Admin" : "Reception"
        }));
    }
    const raw = await prisma.auditLog.findMany({
      where: { guestHouseId },
      include: { user: true },
      orderBy: { timestamp: "desc" },
      take: 50
    });
    return raw.map((l: any) => ({
      id: l.id,
      guestHouseId: l.guestHouseId,
      userId: l.userId,
      action: l.action,
      details: l.details,
      timestamp: l.timestamp,
      username: l.user?.name || "System"
    }));
  },

  // --- SETTINGS ---
  async getSettings(guestHouseId: string): Promise<Setting[]> {
    if (isDemoMode()) {
      return readMockDB().settings.filter(s => s.guestHouseId === guestHouseId);
    }
    return await prisma.setting.findMany({
      where: { guestHouseId }
    });
  },

  async updateSetting(key: string, value: string, guestHouseId: string): Promise<Setting> {
    if (isDemoMode()) {
      const db = readMockDB();
      const idx = db.settings.findIndex(s => s.key === key && s.guestHouseId === guestHouseId);
      if (idx !== -1) {
        db.settings[idx].value = value;
      } else {
        db.settings.push({
          id: "s_" + Math.random().toString(36).substr(2, 9),
          guestHouseId,
          key,
          value
        });
      }
      writeMockDB(db);
      return db.settings.find(s => s.key === key && s.guestHouseId === guestHouseId)!;
    }
    return await prisma.setting.upsert({
      where: { guestHouseId_key: { guestHouseId, key } },
      update: { value },
      create: { guestHouseId, key, value }
    });
  },

  async getFullDatabaseBackup(guestHouseId: string): Promise<any> {
    if (isDemoMode()) {
      const db = readMockDB();
      return {
        guests: db.guests.filter(g => g.guestHouseId === guestHouseId),
        rooms: db.rooms.filter(r => r.guestHouseId === guestHouseId),
        bookings: db.bookings.filter(b => b.guestHouseId === guestHouseId).map(b => ({
          ...b,
          guest: db.guests.find(g => g.id === b.guestId),
          room: db.rooms.find(r => r.id === b.roomId)
        })),
        payments: db.payments.filter(p => p.guestHouseId === guestHouseId),
        auditLogs: db.auditLogs.filter(l => l.guestHouseId === guestHouseId),
        settings: db.settings.filter(s => s.guestHouseId === guestHouseId)
      };
    }
    const guests = await prisma.guest.findMany({ where: { guestHouseId } });
    const rooms = await prisma.room.findMany({ where: { guestHouseId } });
    const bookings = await prisma.booking.findMany({
      where: { guestHouseId },
      include: { guest: true, room: true }
    });
    const payments = await prisma.payment.findMany({ where: { guestHouseId } });
    const auditLogs = await prisma.auditLog.findMany({ where: { guestHouseId } });
    const settings = await prisma.setting.findMany({ where: { guestHouseId } });
    return { guests, rooms, bookings, payments, auditLogs, settings };
  },

  async clearAllData(guestHouseId: string): Promise<void> {
    if (isDemoMode()) {
      const db = readMockDB();
      db.guests = db.guests.filter(g => g.guestHouseId !== guestHouseId);
      db.bookings = db.bookings.filter(b => b.guestHouseId !== guestHouseId);
      db.payments = db.payments.filter(p => p.guestHouseId !== guestHouseId);
      db.auditLogs = db.auditLogs.filter(l => l.guestHouseId !== guestHouseId);
      
      // Make all rooms belonging to this guest house AVAILABLE
      db.rooms.forEach((r, idx) => {
        if (r.guestHouseId === guestHouseId) {
          db.rooms[idx].status = "AVAILABLE";
        }
      });
      writeMockDB(db);
      return;
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { guestHouseId } }),
      prisma.booking.deleteMany({ where: { guestHouseId } }),
      prisma.guest.deleteMany({ where: { guestHouseId } }),
      prisma.auditLog.deleteMany({ where: { guestHouseId } }),
      prisma.room.updateMany({
        where: { guestHouseId },
        data: { status: "AVAILABLE" }
      })
    ]);
  },

  // --- DASHBOARD & ANALYTICS STATS ---
  async getDashboardStats(guestHouseId: string) {
    const isDemo = isDemoMode();
    const db = isDemo ? readMockDB() : null;
    
    let rooms: Room[] = [];
    let bookings: Booking[] = [];
    let payments: Payment[] = [];
    
    if (isDemo && db) {
      rooms = db.rooms.filter(r => r.guestHouseId === guestHouseId);
      bookings = db.bookings.filter(b => b.guestHouseId === guestHouseId);
      payments = db.payments.filter(p => p.guestHouseId === guestHouseId);
    // --- PostgreSQL optimized dashboard ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const gte7 = new Date();
    gte7.setDate(gte7.getDate() - 7);

    const gte30 = new Date();
    gte30.setDate(gte30.getDate() - 30);

    const gte365 = new Date();
    gte365.setDate(gte365.getDate() - 365);

    const [
      todayCheckinsCount,
      todayCheckoutsCount,
      roomCounts,
      totalColAgg,
      todayColAgg,
      col7Agg,
      col30Agg,
      col365Agg,
      pendingAgg,
      recentBookingsRaw,
      recentPaymentsRaw,
      upcomingCheckoutsRaw,
      roomsList,
      activeBookings
    ] = await Promise.all([
      // 1. Today Checkins
      prisma.booking.count({
        where: {
          guestHouseId,
          status: "ACTIVE",
          checkInDate: { gte: todayStart, lte: todayEnd }
        }
      }),
      // 2. Today Checkouts
      prisma.booking.count({
        where: {
          guestHouseId,
          status: "CHECKED_OUT",
          checkOutDate: { gte: todayStart, lte: todayEnd }
        }
      }),
      // 3. Room counts group by status
      prisma.room.groupBy({
        by: ["status"],
        where: { guestHouseId },
        _count: { _all: true }
      }),
      // 4. Total revenue
      prisma.booking.aggregate({
        where: { guestHouseId, status: "CHECKED_OUT" },
        _sum: { totalAmount: true }
      }),
      // 5. Today's collections
      prisma.booking.aggregate({
        where: {
          guestHouseId,
          status: "CHECKED_OUT",
          OR: [
            { updatedAt: { gte: todayStart, lte: todayEnd } },
            { checkOutDate: { gte: todayStart, lte: todayEnd } }
          ]
        },
        _sum: { totalAmount: true }
      }),
      // 6. Last 7 Days
      prisma.booking.aggregate({
        where: {
          guestHouseId,
          status: "CHECKED_OUT",
          OR: [
            { updatedAt: { gte: gte7 } },
            { checkOutDate: { gte: gte7 } }
          ]
        },
        _sum: { totalAmount: true }
      }),
      // 7. Last Month
      prisma.booking.aggregate({
        where: {
          guestHouseId,
          status: "CHECKED_OUT",
          OR: [
            { updatedAt: { gte: gte30 } },
            { checkOutDate: { gte: gte30 } }
          ]
        },
        _sum: { totalAmount: true }
      }),
      // 8. Last Year
      prisma.booking.aggregate({
        where: {
          guestHouseId,
          status: "CHECKED_OUT",
          OR: [
            { updatedAt: { gte: gte365 } },
            { checkOutDate: { gte: gte365 } }
          ]
        },
        _sum: { totalAmount: true }
      }),
      // 9. Pending Amount
      prisma.booking.aggregate({
        where: { guestHouseId, status: "ACTIVE" },
        _sum: { balanceAmount: true }
      }),
      // 10. Recent Bookings (limit 5)
      prisma.booking.findMany({
        where: { guestHouseId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          receiptNo: true,
          checkInDate: true,
          checkOutDate: true,
          totalAmount: true,
          advancePaid: true,
          balanceAmount: true,
          status: true,
          guest: {
            select: { name: true, phone: true }
          },
          room: {
            select: { roomNumber: true, type: true }
          }
        }
      }),
      // 11. Recent Payments (limit 5)
      prisma.payment.findMany({
        where: { guestHouseId },
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          receiptNo: true,
          amount: true,
          method: true,
          date: true,
          notes: true,
          booking: {
            select: {
              guest: {
                select: { name: true }
              }
            }
          }
        }
      }),
      // 12. Upcoming Checkouts (limit 5)
      prisma.booking.findMany({
        where: { guestHouseId, status: "ACTIVE" },
        orderBy: { checkOutDate: "asc" },
        take: 5,
        select: {
          id: true,
          receiptNo: true,
          checkOutDate: true,
          balanceAmount: true,
          guest: {
            select: { name: true }
          },
          room: {
            select: { roomNumber: true }
          }
        }
      }),
      // 13. Rooms list for Floor grid
      prisma.room.findMany({
        where: { guestHouseId },
        select: {
          id: true,
          roomNumber: true,
          floor: true,
          type: true,
          status: true,
          capacity: true,
          ratePerDay: true,
          facilities: true
        }
      }),
      // 14. Active stays to map Floor grid details
      prisma.booking.findMany({
        where: { guestHouseId, status: "ACTIVE" },
        select: {
          roomId: true,
          checkOutDate: true,
          guest: {
            select: { name: true }
          }
        }
      })
    ]);

    // Parse Room counts by status
    let occupiedCount = 0;
    let availableCount = 0;
    let cleaningCount = 0;
    let maintenanceCount = 0;
    roomCounts.forEach(c => {
      if (c.status === "OCCUPIED") occupiedCount = c._count._all;
      if (c.status === "AVAILABLE") availableCount = c._count._all;
      if (c.status === "CLEANING") cleaningCount = c._count._all;
      if (c.status === "MAINTENANCE") maintenanceCount = c._count._all;
    });

    const totalCollection = totalColAgg._sum.totalAmount || 0;
    const todayCollection = todayColAgg._sum.totalAmount || 0;
    const last7DaysCollection = col7Agg._sum.totalAmount || 0;
    const lastMonthCollection = col30Agg._sum.totalAmount || 0;
    const yearCollection = col365Agg._sum.totalAmount || 0;
    const pendingAmount = pendingAgg._sum.balanceAmount || 0;

    // Transform recent bookings
    const recentCheckins = recentBookingsRaw.map(b => ({
      id: b.id,
      receiptNo: b.receiptNo,
      guestName: b.guest?.name || "Unknown Guest",
      phone: b.guest?.phone || "N/A",
      roomNumber: b.room?.roomNumber || "N/A",
      roomType: b.room?.type || "N/A",
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      totalAmount: b.totalAmount,
      advancePaid: b.advancePaid,
      balanceAmount: b.balanceAmount,
      status: b.status
    }));

    // Transform recent payments
    const recentPayments = recentPaymentsRaw.map(p => ({
      id: p.id,
      receiptNo: p.receiptNo,
      guestName: p.booking?.guest?.name || "N/A",
      amount: p.amount,
      method: p.method,
      date: p.date,
      notes: p.notes
    }));

    // Transform upcoming checkouts
    const upcomingCheckouts = upcomingCheckoutsRaw.map(b => ({
      id: b.id,
      receiptNo: b.receiptNo,
      guestName: b.guest?.name || "N/A",
      roomNumber: b.room?.roomNumber || "N/A",
      checkOutDate: b.checkOutDate,
      balanceAmount: b.balanceAmount
    }));

    // Optimize Floor Status mapping using an in-memory Map (0 N+1 queries!)
    const activeBookingMap = new Map();
    activeBookings.forEach(b => {
      activeBookingMap.set(b.roomId, {
        guestName: b.guest?.name || "Unknown Guest",
        checkOutDate: b.checkOutDate
      });
    });

    const mappedRooms = roomsList.map(r => {
      if (r.status === "OCCUPIED") {
        return {
          ...r,
          occupiedDetails: activeBookingMap.get(r.id)
        };
      }
      return r;
    });

    return {
      stats: {
        todayCheckinsCount,
        todayCheckoutsCount,
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
        Ground: mappedRooms.filter(r => r.floor.includes("Ground")),
        First: mappedRooms.filter(r => r.floor.includes("First")),
        Second: mappedRooms.filter(r => r.floor.includes("Second"))
      }
    };
  }
  },

  async getReportData(
    startDateStr: string,
    endDateStr: string,
    guestHouseId: string
  ): Promise<{ checkoutStays: Booking[]; collections: Payment[] }> {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    if (isDemoMode()) {
      const db = readMockDB();
      const allBookings = db.bookings
        .filter(b => b.guestHouseId === guestHouseId)
        .map(b => ({
          ...b,
          guest: db.guests.find(g => g.id === b.guestId),
          room: db.rooms.find(r => r.id === b.roomId)
        }));
      const allPayments = db.payments
        .filter(p => p.guestHouseId === guestHouseId)
        .map(p => {
          const b = db.bookings.find(bx => bx.id === p.bookingId);
          return {
            ...p,
            booking: b ? { guest: db.guests.find(g => g.id === b.guestId) } : null
          };
        });

      const relevantBookings = allBookings.filter(b => {
        const createdDate = new Date(b.createdAt);
        const isCreatedInRange = createdDate >= start && createdDate <= end;
        
        if (b.status === "CHECKED_OUT") {
          const checkOutD = new Date(b.updatedAt || b.checkOutDate);
          const isCheckOutInRange = checkOutD >= start && checkOutD <= end;
          return isCheckOutInRange || isCreatedInRange;
        }
        
        return isCreatedInRange;
      });

      const collections = allPayments.filter(p => {
        const d = new Date(p.date);
        return d >= start && d <= end;
      });

      return {
        checkoutStays: relevantBookings as unknown as Booking[],
        collections: collections as unknown as Payment[]
      };
    }

    const [bookings, collections] = await Promise.all([
      prisma.booking.findMany({
        where: {
          guestHouseId,
          OR: [
            {
              status: "CHECKED_OUT",
              OR: [
                { updatedAt: { gte: start, lte: end } },
                { checkOutDate: { gte: start, lte: end } }
              ]
            },
            {
              createdAt: { gte: start, lte: end }
            }
          ]
        },
        include: {
          guest: {
            select: { name: true, phone: true }
          },
          room: {
            select: { roomNumber: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.payment.findMany({
        where: {
          guestHouseId,
          date: { gte: start, lte: end }
        },
        include: {
          booking: {
            select: {
              guest: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { date: "desc" }
      })
    ]);

    return {
      checkoutStays: bookings as unknown as Booking[],
      collections: collections as unknown as Payment[]
    };
  }
};
