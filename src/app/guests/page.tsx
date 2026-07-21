import { getGuestsPaged } from "@/app/actions";
import GuestsClient from "./GuestsClient";

export const revalidate = 0;

export const metadata = {
  title: "Guest Directory - Siddaganga Mata",
  description: "View returning guest stay profiles and visit history logs.",
};

export default async function GuestsPage() {
  const result = await getGuestsPaged("", 1, 12);

  return (
    <GuestsClient initialGuests={result.guests} initialTotalCount={result.totalCount} />
  );
}
