import { getSettings } from "../actions";
import SettingsClient from "@/components/settings/SettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "System Settings - Siddaganga Mata",
  description: "View and customize temple metadata and printers.",
};

export default async function SettingsPage() {
  const data = await getSettings();

  return (
    <SettingsClient initialSettings={data} />
  );
}
