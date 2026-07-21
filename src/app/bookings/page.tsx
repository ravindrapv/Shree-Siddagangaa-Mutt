import { getBookingsPaged } from "../actions";
import BookingsClient from "./BookingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Stay Bookings Register - Siddaganga Mata",
  description: "View and edit stays, room transfers, and extensions.",
};

export default async function BookingsPage() {
  const result = await getBookingsPaged("", "ALL", 1, 10);

  return (
    <BookingsClient initialBookings={result.bookings} initialTotalCount={result.totalCount} />
  );
}
