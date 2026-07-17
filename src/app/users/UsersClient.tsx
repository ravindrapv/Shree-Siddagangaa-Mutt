"use client";

import { useState } from "react";
import { UserCheck, Shield, Clock, ShieldAlert } from "lucide-react";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface UsersClientProps {
  initialAuditLogs: any[];
}

export default function UsersClient({ initialAuditLogs }: UsersClientProps) {
  const [logs, setLogs] = useState(initialAuditLogs);

  // Mock list of operators
  const operators = [
    { id: "u1", name: "Ravi Kumar", username: "reception_desk1", role: "RECEPTION", status: "ACTIVE" },
    { id: "u2", name: "Swami Chaitanya", username: "office_admin", role: "ADMIN", status: "ACTIVE" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-dark-brown">Operator Profiles & Audit Logs</h2>
          <p className="text-sm text-gray-500 font-medium">Verify system operators and trace database logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Operators List */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <UserCheck className="text-brand-orange" size={18} />
              Console Operators
            </CardTitle>

            <div className="space-y-4">
              {operators.map((op) => (
                <div key={op.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-dark-brown">{op.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Username: {op.username}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] uppercase font-black bg-orange-100 text-brand-orange px-2 py-0.5 rounded">
                        {op.role}
                      </span>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Active now"></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Audit Logs list */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2">
              <ShieldAlert className="text-brand-orange" size={18} />
              Database Audit Trail (Last 50 Logs)
            </CardTitle>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 text-gray-400 font-bold uppercase pb-3">
                    <th className="pb-3 pr-2">Timestamp</th>
                    <th className="pb-3 pr-2">Operator</th>
                    <th className="pb-3 pr-2">Action Category</th>
                    <th className="pb-3">Action Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700 font-semibold">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30">
                      <td className="py-3 text-[10px] text-gray-400 whitespace-nowrap pr-2">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 font-bold text-dark-brown pr-2">{log.username || "System"}</td>
                      <td className="py-3 pr-2">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-150 font-mono text-[9px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-xs leading-relaxed">{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-450 font-bold">No system activity log entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
