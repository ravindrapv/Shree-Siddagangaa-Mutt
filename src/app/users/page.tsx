import { getAuditLogs } from "../actions";
import UsersClient from "./UsersClient";


export const revalidate = 0;

export const metadata = {
  title: "Console Operators & Audit Trail - Siddaganga Mata",
  description: "View operator logs and active console users.",
};

export default async function UsersPage() {
  const data = await getAuditLogs();

  return (
    <UsersClient initialAuditLogs={data} />
  );
}
