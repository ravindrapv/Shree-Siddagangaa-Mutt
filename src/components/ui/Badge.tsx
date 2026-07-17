import React from "react";

type BadgeVariant = 
  | "available" 
  | "occupied" 
  | "cleaning" 
  | "maintenance" 
  | "active" 
  | "checked_out" 
  | "cancelled"
  | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant, children, className = "", ...props }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold",
    occupied: "bg-rose-50 text-rose-700 border-rose-200/60 font-semibold",
    cleaning: "bg-amber-50 text-amber-700 border-amber-200/60 font-semibold animate-soft-pulse",
    maintenance: "bg-gray-100 text-gray-700 border-gray-200 font-semibold",
    active: "bg-blue-50 text-blue-700 border-blue-200/60 font-semibold",
    checked_out: "bg-gray-100 text-gray-600 border-gray-200",
    cancelled: "bg-red-50 text-red-700 border-red-200/60",
    neutral: "bg-slate-50 text-slate-700 border-slate-200"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
