import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export default function Card({ children, hoverEffect = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-card p-6 shadow-premium transition-all duration-300 ${
        hoverEffect ? "hover:shadow-premium-lg hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-bold text-dark-brown ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}
