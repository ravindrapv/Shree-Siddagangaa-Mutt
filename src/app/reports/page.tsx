import { getPayments, getBookings } from "@/app/actions";
import ReportsClient from "./ReportsClient";

export const revalidate = 0;

export const metadata = {
  title: "Revenue & Stay Audit Reports - Siddaganga Mata",
  description: "Export financial collection reports and audit registers.",
};

export default async function ReportsPage() {
  const payments = await getPayments();
  const bookings = await getBookings();

  return (
    <ReportsClient initialPayments={payments} initialBookings={bookings} />
  );
}
