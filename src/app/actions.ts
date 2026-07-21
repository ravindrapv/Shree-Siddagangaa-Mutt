"use server";

import { dbService, Guest, Room, Booking, Payment, AuditLog, Setting } from "@/lib/db-service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function getDashboardStats() {
  try {
    return await dbService.getDashboardStats();
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    throw new Error("Failed to load dashboard statistics.");
  }
}

export async function getGuests() {
  try {
    return await dbService.getGuests();
  } catch (error) {
    console.error("Failed to get guests:", error);
    throw new Error("Failed to load guests.");
  }
}

export async function getGuest(id: string) {
  try {
    return await dbService.getGuest(id);
  } catch (error) {
    console.error("Failed to get guest:", error);
    throw new Error("Failed to load guest profile.");
  }
}


export async function getRooms() {
  try {
    return await dbService.getRooms();
  } catch (error) {
    console.error("Failed to get rooms:", error);
    throw new Error("Failed to load rooms.");
  }
}

export async function updateRoomStatus(roomId: string, status: Room['status']) {
  try {
    const r = await dbService.updateRoomStatus(roomId, status);
    revalidatePath("/");
    revalidatePath("/rooms");
    return r;
  } catch (error) {
    console.error("Failed to update room status:", error);
    throw new Error("Failed to update room status.");
  }
}

export async function searchGuest(query: string) {
  try {
    return await dbService.searchGuest(query);
  } catch (error) {
    console.error("Failed to search guest:", error);
    throw new Error("Failed to search for guest.");
  }
}

export async function createGuest(data: Omit<Guest, "id" | "createdAt" | "updatedAt">) {
  try {
    const g = await dbService.createGuest(data);
    revalidatePath("/guests");
    return g;
  } catch (error) {
    console.error("Failed to create guest:", error);
    throw new Error("Failed to save guest profile.");
  }
}

export async function createBooking(data: {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  noOfDays: number;
  noOfPersons: number;
  discount: number;
  advancePaid: number;
  totalAmount: number;
  balanceAmount: number;
  paymentMethod: Booking['paymentMethod'];
  paymentNote?: string;
}) {
  try {
    const b = await dbService.createBooking(data);
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    revalidatePath("/payments");
    return b;
  } catch (error) {
    console.error("Failed to create booking:", error);
    throw new Error("Failed to process booking.");
  }
}

export async function checkoutBooking(id: string, paymentDetails: {
  balanceAmount: number;
  paymentMethod: Booking['paymentMethod'];
  paymentNote?: string;
}) {
  try {
    const b = await dbService.checkoutBooking(id, paymentDetails);
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    revalidatePath("/payments");
    return b;
  } catch (error) {
    console.error("Failed to checkout booking:", error);
    throw new Error("Failed to complete check-out.");
  }
}

export async function transferRoom(bookingId: string, newRoomId: string) {
  try {
    const b = await dbService.transferRoom(bookingId, newRoomId);
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    return b;
  } catch (error) {
    console.error("Failed to transfer room:", error);
    throw new Error("Failed to transfer room.");
  }
}

export async function extendStay(bookingId: string, additionalDays: number, additionalCost: number) {
  try {
    const b = await dbService.extendStay(bookingId, additionalDays, additionalCost);
    revalidatePath("/");
    revalidatePath("/bookings");
    return b;
  } catch (error) {
    console.error("Failed to extend stay:", error);
    throw new Error("Failed to extend stay.");
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const b = await dbService.cancelBooking(bookingId);
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    return b;
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    throw new Error("Failed to cancel booking.");
  }
}

export async function getBookings() {
  try {
    return await dbService.getBookings();
  } catch (error) {
    console.error("Failed to get bookings:", error);
    throw new Error("Failed to load bookings.");
  }
}

export async function getBooking(id: string) {
  try {
    return await dbService.getBooking(id);
  } catch (error) {
    console.error("Failed to get booking details:", error);
    throw new Error("Failed to load booking details.");
  }
}

export async function getBookingByReceipt(receiptNo: string) {
  try {
    return await dbService.getBookingByReceipt(receiptNo);
  } catch (error) {
    console.error("Failed to find booking by receipt:", error);
    throw new Error("Failed to search for booking receipt.");
  }
}

export async function getPayments() {
  try {
    return await dbService.getPayments();
  } catch (error) {
    console.error("Failed to get payments:", error);
    throw new Error("Failed to load payment history.");
  }
}

export async function getAuditLogs() {
  try {
    return await dbService.getAuditLogs();
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    throw new Error("Failed to load activity logs.");
  }
}

export async function getSettings() {
  try {
    return await dbService.getSettings();
  } catch (error) {
    console.error("Failed to get settings:", error);
    throw new Error("Failed to load settings.");
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const s = await dbService.updateSetting(key, value);
    revalidatePath("/settings");
    return s;
  } catch (error) {
    console.error("Failed to update setting:", error);
    throw new Error("Failed to update settings.");
  }
}

export async function clearAllSystemData() {
  try {
    await dbService.clearAllData();
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/rooms");
    revalidatePath("/guests");
    revalidatePath("/payments");
    revalidatePath("/reports");
  } catch (error) {
    console.error("Failed to clear system data:", error);
    throw new Error("Failed to clear system data.");
  }
}

export async function getFullDatabaseBackup() {
  try {
    return await dbService.getFullDatabaseBackup();
  } catch (error) {
    console.error("Failed to export full database backup:", error);
    throw new Error("Failed to export full database backup.");
  }
}

export async function updateGuestPhoto(guestId: string, photoUrl: string) {
  try {
    const g = await dbService.updateGuestPhoto(guestId, photoUrl);
    revalidatePath(`/guests/${guestId}`);
    revalidatePath("/guests");
    return g;
  } catch (error) {
    console.error("Failed to update guest profile photo:", error);
    throw new Error("Failed to update guest profile photo.");
  }
}

export async function updateGuestIdCardPhoto(guestId: string, idCardPhotoUrl: string) {
  try {
    const g = await dbService.updateGuestIdCardPhoto(guestId, idCardPhotoUrl);
    revalidatePath(`/guests/${guestId}`);
    revalidatePath("/guests");
    return g;
  } catch (error) {
    console.error("Failed to update guest ID card photo:", error);
    throw new Error("Failed to update guest ID card photo.");
  }
}

export async function authenticateOperator(username: string, password: string, building: "Kalyani" | "Yathri") {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      let isValid = false;
      let detectedRole = "";
      if (building === "Kalyani") {
        if (username === "kalyani_reception" && password === "KalyaniDesk@Rec44") {
          isValid = true;
          detectedRole = "RECEPTION";
        } else if (username === "kalyani_admin" && password === "SiddhaKalyani#Ad99") {
          isValid = true;
          detectedRole = "ADMIN";
        }
      } else {
        if (username === "yathri_reception" && password === "YathriDesk&Rec33") {
          isValid = true;
          detectedRole = "RECEPTION";
        } else if (username === "yathri_admin" && password === "MuttYathri$Ad88") {
          isValid = true;
          detectedRole = "ADMIN";
        }
      }
      return { isValid, role: detectedRole };
    }

    // Database authentication
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if (!user) {
      return { isValid: false, role: "" };
    }

    // Verify username building matches prefix
    if (building === "Kalyani" && !username.startsWith("kalyani_")) {
      return { isValid: false, role: "" };
    }
    if (building === "Yathri" && !username.startsWith("yathri_")) {
      return { isValid: false, role: "" };
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return { isValid: false, role: "" };
    }

    return { isValid: true, role: user.role };
  } catch (error) {
    console.error("Failed to authenticate operator:", error);
    return { isValid: false, role: "" };
  }
}
