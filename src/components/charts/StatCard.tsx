'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'bg-primary-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-primary-500',
};

const bgColorClasses = {
  blue: 'bg-primary-50',
  green: 'bg-green-50',
  orange: 'bg-orange-50',
  red: 'bg-red-50',
  purple: 'bg-primary-50',
};

const iconColorClasses = {
  blue: 'text-primary-500',
  green: 'text-green-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  purple: 'text-primary-500',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p
              className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% so với tháng trước
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColorClasses[color]}`}>
          <Icon size={24} className={iconColorClasses[color]} />
        </div>
      </div>
      <div className={`h-1 ${colorClasses[color]} rounded-full mt-4`} />
    </div>
  );
}
