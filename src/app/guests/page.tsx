import { getGuests } from "@/app/actions";
import GuestsClient from "./GuestsClient";

export const revalidate = 0;

export const metadata = {
  title: "Guest Directory - Siddaganga Mata",
  description: "View returning guest stay profiles and visit history logs.",
};

export default async function GuestsPage() {
  const data = await getGuests();

  return (
    <GuestsClient initialGuests={data} />
  );
}
