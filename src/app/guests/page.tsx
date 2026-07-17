import { dbService } from "@/lib/db-service";
import GuestsClient from "./GuestsClient";

export const revalidate = 0;

export const metadata = {
  title: "Guest Directory - Siddaganga Mata",
  description: "View returning guest stay profiles and visit history logs.",
};

export default async function GuestsPage() {
  const data = await dbService.getGuests();

  return (
    <GuestsClient initialGuests={data} />
  );
}
