import { getRooms } from "../actions";
import RoomsClient from "./RoomsClient";

export const revalidate = 0;

export const metadata = {
  title: "Rooms Grid Management - Siddaganga Mata",
  description: "View and edit room availability and cleanliness states.",
};

export default async function RoomsPage() {
  const data = await getRooms();

  return (
    <RoomsClient initialRooms={data} />
  );
}
