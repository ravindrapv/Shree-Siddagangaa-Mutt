import { PrismaClient, RoomStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Static IDs to ensure migrations and seeds align perfectly
const KALYANI_ID = "a1c8f615-5e60-449e-b8d4-539c2bb0e4cf";
const YATHRI_ID = "b2d9a726-6f71-55af-c9e5-649d3cc1f5d0";

async function main() {
  console.log("Starting multi-tenant database seeding script...");

  // 1. Seed Guest Houses
  const kalyaniHouse = await prisma.guestHouse.upsert({
    where: { code: "KALYANI" },
    update: {
      name: "Kalyani Guest House",
      nameKn: "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ",
      address: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ.",
      phone: "+91 816 2282247",
    },
    create: {
      id: KALYANI_ID,
      code: "KALYANI",
      name: "Kalyani Guest House",
      nameKn: "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ",
      address: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ.",
      phone: "+91 816 2282247",
    },
  });

  const yathriHouse = await prisma.guestHouse.upsert({
    where: { code: "YATHRI" },
    update: {
      name: "Yathri Nivasa",
      nameKn: "ಯಾತ್ರಿ ನಿವಾಸ",
      address: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ.",
      phone: "+91 816 2282247",
    },
    create: {
      id: YATHRI_ID,
      code: "YATHRI",
      name: "Yathri Nivasa",
      nameKn: "ಯಾತ್ರಿ ನಿವಾಸ",
      address: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ.",
      phone: "+91 816 2282247",
    },
  });
  console.log("Guest houses seeded successfully.");

  // 2. Seed Users (with hashed passwords using bcrypt)
  const saltRounds = 10;
  const usersToCreate = [
    {
      id: "system-user",
      username: "system_user",
      name: "System Automatons",
      passwordHash: await bcrypt.hash("SystemUserPass#100", saltRounds),
      role: "ADMIN" as const,
      guestHouseId: KALYANI_ID,
    },
    {
      id: "kalyani-admin-id",
      username: "kalyani_admin",
      name: "Kalyani Admin",
      passwordHash: await bcrypt.hash("SiddhaKalyani#Ad99", saltRounds),
      role: "ADMIN" as const,
      guestHouseId: KALYANI_ID,
    },
    {
      id: "kalyani-reception-id",
      username: "kalyani_reception",
      name: "Kalyani Reception",
      passwordHash: await bcrypt.hash("KalyaniDesk@Rec44", saltRounds),
      role: "RECEPTION" as const,
      guestHouseId: KALYANI_ID,
    },
    {
      id: "yathri-admin-id",
      username: "yathri_admin",
      name: "Yathri Admin",
      passwordHash: await bcrypt.hash("MuttYathri$Ad88", saltRounds),
      role: "ADMIN" as const,
      guestHouseId: YATHRI_ID,
    },
    {
      id: "yathri-reception-id",
      username: "yathri_reception",
      name: "Yathri Reception",
      passwordHash: await bcrypt.hash("YathriDesk&Rec33", saltRounds),
      role: "RECEPTION" as const,
      guestHouseId: YATHRI_ID,
    },
  ];

  for (const u of usersToCreate) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        guestHouseId: u.guestHouseId,
      },
      create: u,
    });
  }
  console.log("Multi-tenant operators seeded successfully.");

  // 3. Seed Rooms dynamically for each Guest House
  console.log("Seeding rooms for Kalyani Guest House...");
  const kalyaniRooms = [
    // Ground Floor
    ...[1, 2, 3, 4, 5, 6, 19, 20, 21, 22, 23, 24].map(n => ({ num: `${n}`, floor: "Ground Floor" })),
    // First Floor
    ...[7, 8, 9, 10, 11, 12, 25, 26, 27, 28, 29, 30].map(n => ({ num: `${n}`, floor: "First Floor" })),
    // Second Floor
    ...[13, 14, 15, 16, 17, 18, 31, 32, 33, 34, 35, 36].map(n => ({ num: `${n}`, floor: "Second Floor" })),
  ];

  for (const r of kalyaniRooms) {
    const val = parseInt(r.num);
    const capacity = val % 3 === 0 ? 3 : val % 5 === 0 ? 4 : 2;
    const facilities = ["Hot Water"];
    if (val % 2 === 0) facilities.push("TV");
    if (val % 4 === 0) facilities.push("WiFi");

    await prisma.room.upsert({
      where: { guestHouseId_roomNumber: { guestHouseId: KALYANI_ID, roomNumber: r.num } },
      update: {},
      create: {
        guestHouseId: KALYANI_ID,
        roomNumber: r.num,
        floor: r.floor,
        type: "Standard Room",
        status: RoomStatus.AVAILABLE,
        capacity,
        ratePerDay: 300,
        facilities,
      },
    });
  }

  console.log("Seeding rooms for Yathri Nivasa...");
  const yathriRooms = [
    // Ground Floor
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(n => ({ num: n < 10 ? `0${n}` : `${n}`, floor: "Ground Floor" })),
    // First Floor
    ...[14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].map(n => ({ num: `${n}`, floor: "First Floor" })),
    // Second Floor
    ...[28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41].map(n => ({ num: `${n}`, floor: "Second Floor" })),
  ];

  for (const r of yathriRooms) {
    const val = parseInt(r.num);
    const capacity = val % 3 === 0 ? 3 : val % 5 === 0 ? 4 : 2;
    const facilities = ["Hot Water"];
    if (val % 2 === 0) facilities.push("TV");
    if (val % 4 === 0) facilities.push("WiFi");

    await prisma.room.upsert({
      where: { guestHouseId_roomNumber: { guestHouseId: YATHRI_ID, roomNumber: r.num } },
      update: {},
      create: {
        guestHouseId: YATHRI_ID,
        roomNumber: r.num,
        floor: r.floor,
        type: "Standard Room",
        status: RoomStatus.AVAILABLE,
        capacity,
        ratePerDay: 300,
        facilities,
      },
    });
  }
  console.log("Rooms seeded successfully.");

  // 4. Seed Settings for each Guest house
  const settingsToCreate = [
    // Kalyani Settings
    { guestHouseId: KALYANI_ID, key: "templeName", value: "Kalyani Guest House - Siddaganga Mutt" },
    { guestHouseId: KALYANI_ID, key: "templeAddress", value: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ. (KYATSANDRA, Siddaganga Math, Tumkur District.)" },
    { guestHouseId: KALYANI_ID, key: "contactNumber", value: "+91 816 2282247" },
    { guestHouseId: KALYANI_ID, key: "receiptFooter", value: "ಈ ರಶೀದಿಯು ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತದೆ. ತಮಗೆ ಸುಖಕರ ವಾಸ್ತವ್ಯವನ್ನು ಹಾರೈಸುತ್ತೇವೆ." },

    // Yathri Settings
    { guestHouseId: YATHRI_ID, key: "templeName", value: "Yathri Nivasa - Siddaganga Mutt" },
    { guestHouseId: YATHRI_ID, key: "templeAddress", value: "ಕ್ಯಾತಸಂದ್ರ, ಸಿದ್ದಗಂಗಾ ಮಠ, ತುಮಕೂರು ಜಿಲ್ಲೆ. (KYATSANDRA, Siddaganga Math, Tumkur District.)" },
    { guestHouseId: YATHRI_ID, key: "contactNumber", value: "+91 816 2282247" },
    { guestHouseId: YATHRI_ID, key: "receiptFooter", value: "ಈ ರಶೀದಿಯು ಯಾತ್ರಿ ನಿವಾಸಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತದೆ. ನಿಮ್ಮ ಯಾತ್ರೆ ಶುಭದಾಯಕವಾಗಿರಲಿ." },
  ];

  for (const s of settingsToCreate) {
    await prisma.setting.upsert({
      where: { guestHouseId_key: { guestHouseId: s.guestHouseId, key: s.key } },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("Settings seeded successfully.");

  // 5. Restore or import business data safely from backup
  let backupPath = path.join(process.cwd(), "prisma", "mock-db-backup.json");
  if (!fs.existsSync(backupPath)) {
    backupPath = path.join(process.cwd(), "prisma", "mock-db.json");
  }

  if (fs.existsSync(backupPath)) {
    console.log(`Loading business data from ${backupPath} for seeding...`);
    const fileData = fs.readFileSync(backupPath, "utf-8");
    const data = JSON.parse(fileData);

    // Seed Guests (isolated under Kalyani Guest House by default)
    if (Array.isArray(data.guests)) {
      console.log(`Seeding ${data.guests.length} guests...`);
      for (const g of data.guests) {
        await prisma.guest.upsert({
          where: { guestHouseId_phone: { guestHouseId: KALYANI_ID, phone: g.phone } },
          update: {},
          create: {
            id: g.id,
            guestHouseId: KALYANI_ID,
            name: g.name,
            phone: g.phone,
            address: g.address,
            gender: g.gender,
            age: g.age,
            occupation: g.occupation,
            district: g.district,
            state: g.state || "Karnataka",
            pin: g.pin,
            idType: g.idType,
            idNumber: g.idNumber,
            emergencyContact: g.emergencyContact,
            photoUrl: g.photoUrl,
            idCardPhotoUrl: g.idCardPhotoUrl,
            familyMembers: g.familyMembers ? JSON.parse(JSON.stringify(g.familyMembers)) : [],
          },
        });
      }
    }

    // Seed Bookings (linked to room and guests in Kalyani Guest house)
    if (Array.isArray(data.bookings)) {
      console.log(`Seeding ${data.bookings.length} bookings...`);
      for (const b of data.bookings) {
        // Enforce that rooms for these bookings belong to Kalyani Guest house
        const room = await prisma.room.findFirst({
          where: { id: b.roomId, guestHouseId: KALYANI_ID }
        });
        const guest = await prisma.guest.findFirst({
          where: { id: b.guestId, guestHouseId: KALYANI_ID }
        });

        if (room && guest) {
          await prisma.booking.upsert({
            where: { guestHouseId_receiptNo: { guestHouseId: KALYANI_ID, receiptNo: b.receiptNo } },
            update: {},
            create: {
              id: b.id,
              guestHouseId: KALYANI_ID,
              receiptNo: b.receiptNo,
              guestId: b.guestId,
              roomId: b.roomId,
              checkInDate: new Date(b.checkInDate),
              checkOutDate: new Date(b.checkOutDate),
              noOfDays: b.noOfDays,
              noOfPersons: b.noOfPersons,
              discount: b.discount,
              advancePaid: b.advancePaid,
              totalAmount: b.totalAmount,
              balanceAmount: b.balanceAmount,
              status: b.status,
              paymentMethod: b.paymentMethod,
              paymentNote: b.paymentNote,
            },
          });
        }
      }
    }

    // Seed Payments
    if (Array.isArray(data.payments)) {
      console.log(`Seeding ${data.payments.length} payments...`);
      for (const p of data.payments) {
        const booking = await prisma.booking.findUnique({
          where: { id: p.bookingId }
        });
        if (booking) {
          await prisma.payment.upsert({
            where: { id: p.id },
            update: {},
            create: {
              id: p.id,
              guestHouseId: KALYANI_ID,
              bookingId: p.bookingId,
              amount: p.amount,
              method: p.method,
              receiptNo: p.receiptNo,
              date: new Date(p.date),
              notes: p.notes,
            },
          });
        }
      }
    }

    // Seed Audit Logs
    if (Array.isArray(data.auditLogs)) {
      console.log(`Seeding ${data.auditLogs.length} audit logs...`);
      for (const al of data.auditLogs) {
        const userExists = usersToCreate.some((u) => u.id === al.userId);
        const finalUserId = userExists ? al.userId : "system-user";
        await prisma.auditLog.upsert({
          where: { id: al.id },
          update: {},
          create: {
            id: al.id,
            guestHouseId: KALYANI_ID,
            userId: finalUserId,
            action: al.action,
            details: al.details,
            timestamp: new Date(al.timestamp),
          },
        });
      }
    }
  }

  console.log("Database multi-tenant seeding successfully finished.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
