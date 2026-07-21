import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed script...");

  // 1. Seed Users (with hashed passwords using bcrypt)
  const saltRounds = 10;
  const usersToCreate = [
    {
      id: "system-user",
      username: "system_user",
      name: "System Automatons",
      passwordHash: await bcrypt.hash("SystemUserPass#100", saltRounds),
      role: "ADMIN" as const,
    },
    {
      id: "kalyani-admin-id",
      username: "kalyani_admin",
      name: "Kalyani Admin",
      passwordHash: await bcrypt.hash("SiddhaKalyani#Ad99", saltRounds),
      role: "ADMIN" as const,
    },
    {
      id: "kalyani-reception-id",
      username: "kalyani_reception",
      name: "Kalyani Reception",
      passwordHash: await bcrypt.hash("KalyaniDesk@Rec44", saltRounds),
      role: "RECEPTION" as const,
    },
    {
      id: "yathri-admin-id",
      username: "yathri_admin",
      name: "Yathri Admin",
      passwordHash: await bcrypt.hash("MuttYathri$Ad88", saltRounds),
      role: "ADMIN" as const,
    },
    {
      id: "yathri-reception-id",
      username: "yathri_reception",
      name: "Yathri Reception",
      passwordHash: await bcrypt.hash("YathriDesk&Rec33", saltRounds),
      role: "RECEPTION" as const,
    },
  ];

  for (const u of usersToCreate) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
      },
      create: u,
    });
  }
  console.log("Users upserted successfully.");

  // 2. Read mock-db.json
  const mockDbPath = path.join(process.cwd(), "prisma", "mock-db.json");
  if (!fs.existsSync(mockDbPath)) {
    console.error("mock-db.json not found, seeding only default users.");
    return;
  }

  const fileData = fs.readFileSync(mockDbPath, "utf-8");
  const data = JSON.parse(fileData);

  // 3. Rooms
  if (Array.isArray(data.rooms)) {
    console.log(`Seeding ${data.rooms.length} rooms...`);
    for (const r of data.rooms) {
      await prisma.room.upsert({
        where: { id: r.id },
        update: {
          roomNumber: r.roomNumber,
          floor: r.floor,
          type: r.type,
          status: r.status,
          capacity: r.capacity,
          ratePerDay: r.ratePerDay,
          facilities: r.facilities,
        },
        create: {
          id: r.id,
          roomNumber: r.roomNumber,
          floor: r.floor,
          type: r.type,
          status: r.status,
          capacity: r.capacity,
          ratePerDay: r.ratePerDay,
          facilities: r.facilities,
        },
      });
    }
  }

  // 4. Guests
  if (Array.isArray(data.guests)) {
    console.log(`Seeding ${data.guests.length} guests...`);
    for (const g of data.guests) {
      await prisma.guest.upsert({
        where: { id: g.id },
        update: {
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
        create: {
          id: g.id,
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

  // 5. Bookings
  if (Array.isArray(data.bookings)) {
    console.log(`Seeding ${data.bookings.length} bookings...`);
    for (const b of data.bookings) {
      await prisma.booking.upsert({
        where: { id: b.id },
        update: {
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
        create: {
          id: b.id,
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

  // 6. Payments
  if (Array.isArray(data.payments)) {
    console.log(`Seeding ${data.payments.length} payments...`);
    for (const p of data.payments) {
      await prisma.payment.upsert({
        where: { id: p.id },
        update: {
          bookingId: p.bookingId,
          amount: p.amount,
          method: p.method,
          receiptNo: p.receiptNo,
          date: new Date(p.date),
          notes: p.notes,
        },
        create: {
          id: p.id,
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

  // 7. Settings
  if (Array.isArray(data.settings)) {
    console.log(`Seeding ${data.settings.length} settings...`);
    for (const s of data.settings) {
      await prisma.setting.upsert({
        where: { key: s.key },
        update: {
          value: s.value,
        },
        create: {
          id: s.id,
          key: s.key,
          value: s.value,
        },
      });
    }
  }

  // 8. Audit Logs
  if (Array.isArray(data.auditLogs)) {
    console.log(`Seeding ${data.auditLogs.length} audit logs...`);
    for (const al of data.auditLogs) {
      // Ensure user ID exists in our created list
      const userExists = usersToCreate.some((u) => u.id === al.userId);
      const finalUserId = userExists ? al.userId : "system-user";

      await prisma.auditLog.upsert({
        where: { id: al.id },
        update: {
          userId: finalUserId,
          action: al.action,
          details: al.details,
          timestamp: new Date(al.timestamp),
        },
        create: {
          id: al.id,
          userId: finalUserId,
          action: al.action,
          details: al.details,
          timestamp: new Date(al.timestamp),
        },
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
