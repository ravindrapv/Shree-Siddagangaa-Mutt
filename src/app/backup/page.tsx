import Link from "next/link";
import { Database, ArrowLeft, ShieldCheck } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";

export const metadata = {
  title: "Database Backups - Siddaganga Mata",
  description: "Manage database backup snapshots.",
};

export default function BackupPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2 border-b border-gray-150 pb-4">
        <Link href="/" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h2 className="text-xl font-black text-dark-brown">Database Backups Portal</h2>
      </div>

      <Card className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-brand-orange mx-auto flex items-center justify-center mb-4">
          <Database size={32} />
        </div>
        <CardTitle className="mb-2">Download System Backups</CardTitle>
        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto mb-6">
          System backup configurations and data snapshot generators are located in the main settings dashboard panel. You can download and save JSON schemas locally.
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/settings"
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow"
          >
            Access Backups in Settings
          </Link>
          <Link
            href="/"
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Go Dashboard
          </Link>
        </div>
      </Card>
      
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800 font-semibold leading-relaxed">
        <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" />
        <p>
          All stay entries, payment collections, room changes, and transaction records are automatically auto-saved in the server-side JSON mock storage. No action is required to commit changes.
        </p>
      </div>
    </div>
  );
}
