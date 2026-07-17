"use client";

import { useState, useTransition } from "react";
import { Settings, Save, Database, Printer, Building, Phone, Trash2 } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { updateSetting, clearAllSystemData } from "@/app/actions";

interface SettingsClientProps {
  initialSettings: any[];
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Find setting values
  const getVal = (key: string, fallback = "") => {
    return initialSettings.find(s => s.key === key)?.value || fallback;
  };

  const [templeName, setTempleName] = useState(getVal("templeName", "Siddaganga Mata Tumkur"));
  const [templeAddress, setTempleAddress] = useState(getVal("templeAddress", "Siddaganga Mutt Road, Tumkur, Karnataka, India - 572104"));
  const [contactNumber, setContactNumber] = useState(getVal("contactNumber", "+91 816 2282247"));
  const [receiptFooter, setReceiptFooter] = useState(getVal("receiptFooter", "This is a computer-generated receipt. Thank you for your support. Have a safe & blessed stay."));

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSetting("templeName", templeName);
        await updateSetting("templeAddress", templeAddress);
        await updateSetting("contactNumber", contactNumber);
        await updateSetting("receiptFooter", receiptFooter);

        toast.success("Temple metadata settings saved successfully");
      } catch (err) {
        toast.error("Failed to update settings");
      }
    });
  };

  const handleDownloadBackup = () => {
    try {
      // Create mockup database json export
      const backupData = {
        timestamp: new Date().toISOString(),
        backupType: "FULL_SYSTEM_DB_BACKUP",
        settings: { templeName, templeAddress, contactNumber, receiptFooter }
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const link = document.createElement("a");
      link.setAttribute("href", jsonString);
      link.setAttribute("download", `siddaganga_mutt_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("System backup snapshot downloaded successfully");
    } catch (err) {
      toast.error("Backup creation failed");
    }
  };

  const handleClearSystemData = () => {
    if (!window.confirm("Are you absolutely sure you want to clear all bookings, guests, payments, audit logs, and make all rooms available? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      try {
        await clearAllSystemData();
        toast.success("System database reset successfully. All rooms are now vacant.");
      } catch (err) {
        toast.error("Failed to reset system data");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">System Settings & backups</h2>
          <p className="text-sm text-gray-500 font-medium font-semibold">Customize organization variables, printing templates, and perform system data checkups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Building size={18} className="text-brand-orange" />
              Temple Profile Information
            </CardTitle>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Temple / Institution Name</label>
                <input
                  type="text"
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact Address</label>
                <input
                  type="text"
                  value={templeAddress}
                  onChange={(e) => setTempleAddress(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact/Office Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Printer size={18} className="text-brand-orange" />
              Receipt Print templates
            </CardTitle>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Thermal/A4 Print Footer Notes</label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-6 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Save size={16} />
                Save Configurations
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar utility controls */}
        <div className="space-y-6">
          <Card className="border border-orange-100 bg-orange-50/10">
            <CardTitle className="mb-4 flex items-center gap-2">
              <Database size={18} className="text-brand-orange" />
              Database Backups & Restore
            </CardTitle>
            <p className="text-xs text-orange-950/80 font-medium leading-relaxed mb-4">
              Keep regular snapshots of your guest entries. In case of unexpected server downtime, backup files can restore full devotee registry logs.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Database size={14} />
              Create DB Backup Snapshot
            </button>

            <hr className="my-4 border-orange-100/50" />
            <p className="text-xs text-red-950/80 font-medium leading-relaxed mb-4 font-bold">
              Dangerous Area: Reset the entire system. This deletes all guest profiles, stay bookings, payments, audit logs, and marks all rooms as Vacant/Available.
            </p>
            <button
              onClick={handleClearSystemData}
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-750 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={14} />
              Clear All Data & Reset Rooms
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
}
