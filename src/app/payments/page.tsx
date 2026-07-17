import { getBookings } from "../actions";
import PaymentsClient from "./PaymentsClient";

export const revalidate = 0;

export const metadata = {
  title: "Payments Collections Ledger - Siddaganga Mata",
  description: "View financial entries and cash summaries.",
};

export default async function PaymentsPage() {
  const bookings = await getBookings();

  return (
    <PaymentsClient initialBookings={bookings} />
  );
}
