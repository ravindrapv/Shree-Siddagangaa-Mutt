import { getGuest, getBookings } from "@/app/actions";
import { notFound } from "next/navigation";
import GuestDetailClient from "./GuestDetailClient";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guest = await getGuest(id);
  return {
    title: guest ? `${guest.name} - Guest Profile` : "Guest Not Found",
    description: "Detailed guest stay history and profile.",
  };
}

export default async function GuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [guest, bookings] = await Promise.all([
    getGuest(id),
    getBookings(),
  ]);

  if (!guest) notFound();

  // Filter bookings for this specific guest
  const guestBookings = (bookings as any[]).filter((b: any) => b.guestId === id);

  return <GuestDetailClient guest={guest} bookings={guestBookings} />;
}
