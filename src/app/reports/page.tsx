import { getReportData } from "@/app/actions";
import ReportsClient from "./ReportsClient";

export const revalidate = 0;

export const metadata = {
  title: "Revenue & Stay Audit Reports - Siddaganga Mata",
  description: "Export financial collection reports and audit registers.",
};

export default async function ReportsPage() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const initialData = await getReportData(
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
  );

  return (
    <ReportsClient initialPayments={initialData.collections} initialBookings={initialData.checkoutStays} />
  );
}
