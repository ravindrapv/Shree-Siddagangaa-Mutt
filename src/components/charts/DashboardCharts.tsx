"use client";

import { useEffect, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Card, { CardTitle } from "../ui/Card";

// Mock history data for visualizations
const revenueHistory = [
  { name: "Mon", amount: 18200 },
  { name: "Tue", amount: 22400 },
  { name: "Wed", amount: 19800 },
  { name: "Thu", amount: 25600 },
  { name: "Fri", amount: 28900 },
  { name: "Sat", amount: 32100 },
  { name: "Sun", amount: 24650 }
];

const occupancyHistory = [
  { name: "Mon", rate: 68 },
  { name: "Tue", rate: 75 },
  { name: "Wed", rate: 70 },
  { name: "Thu", rate: 82 },
  { name: "Fri", rate: 90 },
  { name: "Sat", rate: 95 },
  { name: "Sun", rate: 78 }
];

const COLORS = ["#D96A0B", "#10B981", "#3B82F6"];

interface DashboardChartsProps {
  cash: number;
  upi: number;
  card: number;
}

export default function DashboardCharts({ cash, upi, card }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-card p-6 h-[300px] animate-pulse"></div>
        <div className="bg-white border border-gray-100 rounded-card p-6 h-[300px] animate-pulse"></div>
        <div className="bg-white border border-gray-100 rounded-card p-6 h-[300px] animate-pulse"></div>
      </div>
    );
  }

  const pieData = [
    { name: "Cash", value: cash || 14300 },
    { name: "UPI", value: upi || 10350 },
    { name: "Card", value: card || 0 }
  ].filter(item => item.value > 0);

  const totalPieValue = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Revenue Card */}
      <Card>
        <CardTitle className="mb-4">Revenue Trend (Last 7 Days)</CardTitle>
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D96A0B" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#D96A0B" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "#2B1D16", borderRadius: "10px", color: "#fff", border: "none" }}
                formatter={(val) => [`₹ ${val}`, "Collection"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#D96A0B" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Occupancy Card */}
      <Card>
        <CardTitle className="mb-4">Room Occupancy % (Last 7 Days)</CardTitle>
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={occupancyHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ background: "#2B1D16", borderRadius: "10px", color: "#fff", border: "none" }}
                formatter={(val) => [`${val}%`, "Occupancy Rate"]}
              />
              <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorOcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardTitle className="mb-4">Today's Revenue Source Split</CardTitle>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[230px]">
          {/* Pie Chart container */}
          <div className="w-[140px] h-[140px] flex-shrink-0">
            {totalPieValue > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 text-center p-2 font-medium">
                No Payments Today
              </div>
            )}
          </div>

          {/* Ledger Legends */}
          <div className="flex-1 space-y-3.5 w-full">
            {pieData.map((item, index) => {
              const percentage = totalPieValue > 0 ? Math.round((item.value / totalPieValue) * 100) : 0;
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span>{item.name}</span>
                    </div>
                    <span>{percentage}% (₹{item.value.toLocaleString("en-IN")})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length] 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
