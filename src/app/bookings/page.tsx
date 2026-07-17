import { getBookings } from "../actions";
import BookingsClient from "./BookingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Stay Bookings Register - Siddaganga Mata",
  description: "View and edit stays, room transfers, and extensions.",
};

export default async function BookingsPage() {
  const data = await getBookings();

  return (
    <BookingsClient initialBookings={data} />
  );
}
