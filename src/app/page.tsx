import { getDashboardStats } from "./actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

// Revalidate this page on demand
export const revalidate = 0;

export default async function DashboardPage() {
  const data = await getDashboardStats();

  return (
    <DashboardClient initialStats={data} />
  );
}
