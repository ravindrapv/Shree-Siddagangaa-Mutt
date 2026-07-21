"use server";

import { dbService, Guest, Room, Booking, Payment, AuditLog, Setting } from "@/lib/db-service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

// Branded static guest house UUIDs
const KALYANI_ID = "a1c8f615-5e60-449e-b8d4-539c2bb0e4cf";
const YATHRI_ID = "b2d9a726-6f71-55af-c9e5-649d3cc1f5d0";

// Resolves current active tenant context from cookies safely on the server side
export async function getTenantId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const guestHouseId = cookieStore.get("guesthouse_id")?.value;
    if (!guestHouseId) {
      // Fallback default to Kalyani Guest House context to prevent boot-up page rendering crashes
      return KALYANI_ID;
    }
    return guestHouseId;
  } catch {
    return KALYANI_ID;
  }
}

export async function getDashboardStats() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getDashboardStats(tenantId);
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    throw new Error("Failed to load dashboard statistics.");
  }
}

export async function getGuests() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getGuests(tenantId);
  } catch (error) {
    console.error("Failed to get guests:", error);
    throw new Error("Failed to load guests.");
  }
}

export async function getGuest(id: string) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getGuest(id, tenantId);
  } catch (error) {
    console.error("Failed to get guest:", error);
    throw new Error("Failed to load guest profile.");
  }
}

export async function getRooms() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getRooms(tenantId);
  } catch (error) {
    console.error("Failed to get rooms:", error);
    throw new Error("Failed to load rooms.");
  }
}

export async function updateRoomStatus(roomId: string, status: Room['status']) {
  try {
    const tenantId = await getTenantId();
    const r = await dbService.updateRoomStatus(roomId, status, tenantId);
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
    const tenantId = await getTenantId();
    return await dbService.searchGuest(query, tenantId);
  } catch (error) {
    console.error("Failed to search guest:", error);
    throw new Error("Failed to search for guest.");
  }
}

export async function createGuest(data: Omit<Guest, "id" | "guestHouseId" | "createdAt" | "updatedAt">) {
  try {
    const tenantId = await getTenantId();
    const g = await dbService.createGuest(data, tenantId);
    revalidatePath("/guests");
    return g;
  } catch (error) {
    console.error("Failed to create guest:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save guest profile.");
  }
}

export async function createBooking(data: {
  guestId: string;
  roomId?: string;
  roomIds?: string[];
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
    const tenantId = await getTenantId();
    const b = await dbService.createBooking(data, tenantId);
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
    const tenantId = await getTenantId();
    const b = await dbService.checkoutBooking(id, paymentDetails, tenantId);
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
    const tenantId = await getTenantId();
    const b = await dbService.transferRoom(bookingId, newRoomId, tenantId);
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
    const tenantId = await getTenantId();
    const b = await dbService.extendStay(bookingId, additionalDays, additionalCost, tenantId);
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
    const tenantId = await getTenantId();
    const b = await dbService.cancelBooking(bookingId, tenantId);
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
    const tenantId = await getTenantId();
    return await dbService.getBookings(tenantId);
  } catch (error) {
    console.error("Failed to get bookings:", error);
    throw new Error("Failed to load bookings.");
  }
}

export async function getBooking(id: string) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getBooking(id, tenantId);
  } catch (error) {
    console.error("Failed to get booking details:", error);
    throw new Error("Failed to load booking details.");
  }
}

export async function getBookingByReceipt(receiptNo: string) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getBookingByReceipt(receiptNo, tenantId);
  } catch (error) {
    console.error("Failed to find booking by receipt:", error);
    throw new Error("Failed to search for booking receipt.");
  }
}

export async function getPayments() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getPayments(tenantId);
  } catch (error) {
    console.error("Failed to get payments:", error);
    throw new Error("Failed to load payment history.");
  }
}

export async function getAuditLogs() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getAuditLogs(tenantId);
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    throw new Error("Failed to load activity logs.");
  }
}

export async function getSettings() {
  try {
    const tenantId = await getTenantId();
    return await dbService.getSettings(tenantId);
  } catch (error) {
    console.error("Failed to get settings:", error);
    throw new Error("Failed to load settings.");
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const tenantId = await getTenantId();
    const s = await dbService.updateSetting(key, value, tenantId);
    revalidatePath("/settings");
    return s;
  } catch (error) {
    console.error("Failed to update setting:", error);
    throw new Error("Failed to update settings.");
  }
}

export async function clearAllSystemData() {
  try {
    const tenantId = await getTenantId();
    await dbService.clearAllData(tenantId);
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
    const tenantId = await getTenantId();
    return await dbService.getFullDatabaseBackup(tenantId);
  } catch (error) {
    console.error("Failed to export full database backup:", error);
    throw new Error("Failed to export full database backup.");
  }
}

export async function updateGuestPhoto(guestId: string, photoUrl: string) {
  try {
    const tenantId = await getTenantId();
    const g = await dbService.updateGuestPhoto(guestId, photoUrl, tenantId);
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
    const tenantId = await getTenantId();
    const g = await dbService.updateGuestIdCardPhoto(guestId, idCardPhotoUrl, tenantId);
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
      let guestHouseId = "";
      let guestHouseNameKn = "";

      if (building === "Kalyani") {
        if (username === "kalyani_reception" && password === "KalyaniDesk@Rec44") {
          isValid = true;
          detectedRole = "RECEPTION";
          guestHouseId = KALYANI_ID;
          guestHouseNameKn = "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ";
        } else if (username === "kalyani_admin" && password === "SiddhaKalyani#Ad99") {
          isValid = true;
          detectedRole = "ADMIN";
          guestHouseId = KALYANI_ID;
          guestHouseNameKn = "ಕಲ್ಯಾಣಿ ಅತಿಥಿ ಗೃಹ";
        }
      } else {
        if (username === "yathri_reception" && password === "YathriDesk&Rec33") {
          isValid = true;
          detectedRole = "RECEPTION";
          guestHouseId = YATHRI_ID;
          guestHouseNameKn = "ಯಾತ್ರಿ ನಿವಾಸ";
        } else if (username === "yathri_admin" && password === "MuttYathri$Ad88") {
          isValid = true;
          detectedRole = "ADMIN";
          guestHouseId = YATHRI_ID;
          guestHouseNameKn = "ಯಾತ್ರಿ ನಿವಾಸ";
        }
      }
      return { isValid, role: detectedRole, guestHouseId, guestHouseNameKn };
    }

    // Database authentication
    const user = await prisma.user.findFirst({
      where: { username },
      include: { guestHouse: true }
    });
    if (!user) {
      return { isValid: false, role: "", guestHouseId: "", guestHouseNameKn: "" };
    }

    // Verify username building matches prefix
    if (building === "Kalyani" && !username.startsWith("kalyani_")) {
      return { isValid: false, role: "", guestHouseId: "", guestHouseNameKn: "" };
    }
    if (building === "Yathri" && !username.startsWith("yathri_")) {
      return { isValid: false, role: "", guestHouseId: "", guestHouseNameKn: "" };
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return { isValid: false, role: "", guestHouseId: "", guestHouseNameKn: "" };
    }

    return { 
      isValid: true, 
      role: user.role, 
      guestHouseId: user.guestHouseId, 
      guestHouseNameKn: user.guestHouse.nameKn 
    };
  } catch (error) {
    console.error("Failed to authenticate operator:", error);
    return { isValid: false, role: "", guestHouseId: "", guestHouseNameKn: "" };
  }
}

export async function getBookingsPaged(search: string, status: string, page: number, pageSize?: number) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getBookingsPaged(tenantId, search, status, page, pageSize);
  } catch (error) {
    console.error("Failed to get paged bookings:", error);
    throw new Error("Failed to load bookings list.");
  }
}

export async function getGuestsPaged(search: string, page: number, pageSize?: number) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getGuestsPaged(tenantId, search, page, pageSize);
  } catch (error) {
    console.error("Failed to get paged guests:", error);
    throw new Error("Failed to load guests directory.");
  }
}

export async function getReportData(startDateStr: string, endDateStr: string) {
  try {
    const tenantId = await getTenantId();
    return await dbService.getReportData(startDateStr, endDateStr, tenantId);
  } catch (error) {
    console.error("Failed to load report data:", error);
    throw new Error("Failed to load report data.");
  }
}
