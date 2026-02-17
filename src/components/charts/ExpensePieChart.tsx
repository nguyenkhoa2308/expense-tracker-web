'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#7C3AED', // primary
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

const CATEGORY_LABELS: Record<string, string> = {
  food: '🍔 Ăn uống',
  transport: '🚗 Di chuyển',
  shopping: '🛒 Mua sắm',
  entertainment: '🎮 Giải trí',
  bills: '📄 Hóa đơn',
  health: '💊 Sức khỏe',
  education: '📚 Học tập',
  transfer: '💸 Chuyển khoản',
  other: '📦 Khác',
};

interface ExpensePieChartProps {
  data: Record<string, number>;
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: CATEGORY_LABELS[name] || name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(value)
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
