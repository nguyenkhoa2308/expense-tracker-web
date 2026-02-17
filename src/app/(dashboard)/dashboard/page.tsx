"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { Expense, expenseApi, Income, incomeApi, statsApi, AllSummary } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { AnimatedCurrency } from "@/components/AnimatedCurrency";

import { format, subDays, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

const EXPENSE_EMOJIS: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  shopping: "🛒",
  entertainment: "🎮",
  bills: "📄",
  health: "💊",
  education: "📚",
  transfer: "💸",
  other: "📦",
};

const INCOME_EMOJIS: Record<string, string> = {
  salary: "💰",
  freelance: "💻",
  investment: "📈",
  bonus: "🎁",
  gift: "🎀",
  refund: "↩️",
  other: "📦",
};

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  food: "Ăn uống",
  transport: "Di chuyển",
  shopping: "Mua sắm",
  entertainment: "Giải trí",
  bills: "Hóa đơn",
  health: "Sức khỏe",
  education: "Học tập",
  transfer: "Chuyển khoản",
  other: "Khác",
};

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salary: "Lương",
  freelance: "Freelance",
  investment: "Đầu tư",
  bonus: "Thưởng",
  gift: "Quà tặng",
  refund: "Hoàn tiền",
  other: "Khác",
};

const darkTooltipStyle = {
  contentStyle: {
    backgroundColor: "#1F2937",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  labelStyle: { color: "#D1D5DB", fontSize: "12px", marginBottom: "6px" },
  itemStyle: { color: "#F9FAFB", fontSize: "13px", padding: "2px 0" },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<AllSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, incomesRes, summaryRes] = await Promise.all([
        expenseApi.getAll(),
        incomeApi.getAll(),
        statsApi.getAllSummary(),
      ]);
      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when AI creates a transaction
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener('transaction-created', handler);
    return () => window.removeEventListener('transaction-created', handler);
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const now = useMemo(() => new Date(), []);

  // Stats from summary API
  const thisMonthExpenseTotal = summary?.current.expense.total ?? 0;
  const thisMonthIncomeTotal = summary?.current.income.total ?? 0;
  const thisMonthBalance = summary?.current.balance ?? 0;
  const prevExpenseTotal = summary?.previous.expense.total ?? 0;
  const prevIncomeTotal = summary?.previous.income.total ?? 0;
  const savingDiff = thisMonthBalance - (summary?.previous.balance ?? 0);

  const expenseChange = prevExpenseTotal
    ? ((thisMonthExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100
    : 0;
  const incomeChange = prevIncomeTotal
    ? ((thisMonthIncomeTotal - prevIncomeTotal) / prevIncomeTotal) * 100
    : 0;

  // Bar chart - last 7 days
  const last7DaysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(now, 6 - i));
      const dateStr = format(date, "yyyy-MM-dd");
      const expenseTotal = expenses
        .filter((e) => format(new Date(e.date), "yyyy-MM-dd") === dateStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const incomeTotal = incomes
        .filter((inc) => format(new Date(inc.date), "yyyy-MM-dd") === dateStr)
        .reduce((sum, inc) => sum + Number(inc.amount), 0);
      return {
        name: format(date, "EEE", { locale: vi }),
        "Chi tiêu": expenseTotal,
        "Thu nhập": incomeTotal,
      };
    });
  }, [expenses, incomes, now]);

  // Donut chart - financial overview
  const financialOverview = useMemo(() => {
    const balance = Math.max(thisMonthBalance, 0);
    return [
      { name: "Số dư", value: balance, fill: "#7C3AED" },
      { name: "Chi tiêu", value: thisMonthExpenseTotal, fill: "#EF4444" },
      { name: "Thu nhập", value: thisMonthIncomeTotal, fill: "#F97316" },
    ].filter((d) => d.value > 0);
  }, [thisMonthBalance, thisMonthExpenseTotal, thisMonthIncomeTotal]);

  // Last 30 days expense bar chart (weekly buckets)
  const last30DaysExpenseData = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      // i=0 → tuần xa nhất (ngày 22-28 trước), i=3 → tuần gần nhất (0-6 ngày trước)
      const weekStart = startOfDay(subDays(now, (4 - i) * 7 - 1));
      const weekEnd = startOfDay(subDays(now, (3 - i) * 7));
      const total = expenses
        .filter((e) => {
          const d = startOfDay(new Date(e.date));
          return d >= weekStart && d <= weekEnd;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        name: `Tuần ${i + 1}`,
        value: total,
      };
    });
  }, [expenses, now]);

  // Recent expenses (latest 4)
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [expenses]);

  // Recent incomes (latest 5)
  const recentIncomes = useMemo(() => {
    return [...incomes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [incomes]);

  // Last 60 days income by category (donut)
  const INCOME_DONUT_COLORS = [
    "#7C3AED",
    "#EF4444",
    "#F97316",
    "#3B82F6",
    "#10B981",
    "#EC4899",
  ];
  const last60DaysIncomeData = useMemo(() => {
    const sixtyDaysAgo = subDays(now, 60);
    const filtered = incomes.filter((i) => new Date(i.date) >= sixtyDaysAgo);
    const byCategory: Record<string, number> = {};
    filtered.forEach((i) => {
      const label = INCOME_CATEGORY_LABELS[i.category] || i.category;
      byCategory[label] = (byCategory[label] || 0) + Number(i.amount);
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [incomes, now]);

  const last60DaysIncomeTotal = useMemo(() => {
    return last60DaysIncomeData.reduce((sum, d) => sum + d.value, 0);
  }, [last60DaysIncomeData]);

  if (showSkeleton) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="h-4 skeleton rounded w-40 mb-2" />
              <div className="h-7 skeleton rounded w-56" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 skeleton rounded-lg w-24" />
              <div className="h-10 skeleton rounded-lg w-24" />
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card rounded-xl p-5 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 skeleton rounded w-16" />
                  <div className="w-10 h-10 skeleton rounded-full" />
                </div>
                <div className="h-7 skeleton rounded w-32 mb-2" />
                <div className="h-4 skeleton rounded w-40" />
              </div>
            ))}
          </div>

          {/* Charts row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 skeleton-card rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 skeleton rounded w-36" />
                <div className="h-4 skeleton rounded w-20" />
              </div>
              <div className="flex items-end gap-4 h-[280px] pt-8">
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-3/5" />
                  <div className="flex-1 skeleton-light rounded-t h-2/5" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-2/5" />
                  <div className="flex-1 skeleton-light rounded-t h-1/4" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-4/5" />
                  <div className="flex-1 skeleton-light rounded-t h-3/5" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-1/3" />
                  <div className="flex-1 skeleton-light rounded-t h-1/5" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-3/4" />
                  <div className="flex-1 skeleton-light rounded-t h-1/2" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-1/2" />
                  <div className="flex-1 skeleton-light rounded-t h-1/3" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-[90%]" />
                  <div className="flex-1 skeleton-light rounded-t h-3/4" />
                </div>
              </div>
            </div>
            <div className="skeleton-card rounded-xl shadow-sm p-6 border">
              <div className="h-5 skeleton rounded w-36 mb-4" />
              <div className="flex items-center justify-center h-[280px]">
                <div className="w-[180px] h-[180px] rounded-full border-[24px] skeleton" />
              </div>
            </div>
          </div>

          {/* Expenses + Bar chart row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton-card rounded-xl shadow-sm border">
              <div className="p-5 border-b border-gray-100 dark:border-[#303030] flex items-center justify-between">
                <div className="h-5 skeleton rounded w-20" />
                <div className="h-8 skeleton rounded-lg w-24" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 flex items-center justify-between border-b border-gray-50 dark:border-[#2a2a2a] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 skeleton rounded-full" />
                    <div>
                      <div className="h-4 skeleton rounded w-28 mb-1.5" />
                      <div className="h-3 skeleton rounded w-20" />
                    </div>
                  </div>
                  <div className="h-4 skeleton rounded w-24" />
                </div>
              ))}
            </div>
            <div className="skeleton-card rounded-xl shadow-sm p-6 border">
              <div className="h-5 skeleton rounded w-40 mb-4" />
              <div className="flex items-end gap-6 h-[300px] pt-8">
                <div className="flex-1 skeleton rounded-t h-[45%]" />
                <div className="flex-1 skeleton rounded-t h-[70%]" />
                <div className="flex-1 skeleton rounded-t h-[55%]" />
                <div className="flex-1 skeleton rounded-t h-[85%]" />
              </div>
            </div>
          </div>

          {/* Income row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton-card rounded-xl shadow-sm p-6 border">
              <div className="h-5 skeleton rounded w-40 mb-4" />
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-[200px] h-[200px] rounded-full border-[28px] skeleton" />
              </div>
            </div>
            <div className="skeleton-card rounded-xl shadow-sm border">
              <div className="p-5 border-b border-gray-100 dark:border-[#303030] flex items-center justify-between">
                <div className="h-5 skeleton rounded w-20" />
                <div className="h-8 skeleton rounded-lg w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 flex items-center justify-between border-b border-gray-50 dark:border-[#2a2a2a] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 skeleton rounded-full" />
                    <div>
                      <div className="h-4 skeleton rounded w-28 mb-1.5" />
                      <div className="h-3 skeleton rounded w-20" />
                    </div>
                  </div>
                  <div className="h-4 skeleton rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 dark:text-gray-500 capitalize">
              {format(now, "EEEE, dd MMMM yyyy", { locale: vi })}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {now.getHours() < 12
                ? "Chào buổi sáng"
                : now.getHours() < 18
                  ? "Chào buổi chiều"
                  : "Chào buổi tối"}
              , {user?.name || "bạn"} 👋
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/incomes"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition text-sm"
            >
              <Plus size={16} />
              Thu nhập
            </Link>
            <Link
              href="/expenses"
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition text-sm"
            >
              <Plus size={16} />
              Chi tiêu
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Balance */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Số dư</span>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <PiggyBank size={20} className="text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCurrency value={thisMonthBalance} />
            </p>
            {summary?.previous.expense.count || summary?.previous.income.count ? (
              <p className={`text-sm mt-1 ${savingDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {savingDiff >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(savingDiff))} so với tháng trước
              </p>
            ) : (
              <p className="text-sm mt-1 text-gray-400">Tháng đầu tiên</p>
            )}
          </div>

          {/* Total Income */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                Thu nhập
              </span>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCurrency value={thisMonthIncomeTotal} />
            </p>
            {prevIncomeTotal > 0 ? (
              <p
                className={`text-sm mt-1 ${incomeChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {incomeChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(incomeChange).toFixed(0)}% so với tháng trước
              </p>
            ) : (
              <p className="text-sm mt-1 text-gray-400">{summary?.current.income.count ?? 0} giao dịch tháng này</p>
            )}
          </div>

          {/* Total Expense */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                Chi tiêu
              </span>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown size={20} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCurrency value={thisMonthExpenseTotal} />
            </p>
            {prevExpenseTotal > 0 ? (
              <p
                className={`text-sm mt-1 ${expenseChange <= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {expenseChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(expenseChange).toFixed(0)}% so với tháng trước
              </p>
            ) : (
              <p className="text-sm mt-1 text-gray-400">{summary?.current.expense.count ?? 0} giao dịch tháng này</p>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart - 7 days */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Thu chi trong tuần
              </h2>
              <Link
                href="/reports"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Xem chi tiết <ArrowRight size={14} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={last7DaysData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#111827"
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false}
                />
                <YAxis
                  stroke="#111827"
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : v.toString()
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(124, 58, 237, 0.04)" }}
                  {...darkTooltipStyle}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Chi tiêu" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Thu nhập" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart - Financial Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tổng quan tài chính
            </h2>
            {financialOverview.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={financialOverview}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {financialOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...darkTooltipStyle}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  {/* Center text */}
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    className="fill-gray-500 text-xs"
                  >
                    Số dư
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    className="fill-gray-900 text-lg font-bold"
                  >
                    {formatCurrency(thisMonthBalance)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                Chưa có dữ liệu tháng này
              </div>
            )}
          </div>
        </div>

        {/* Expenses Row: List + 30-day Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Expenses List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiêu</h2>
              <Link
                href="/expenses"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentExpenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có chi tiêu nào
                </div>
              ) : (
                recentExpenses.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-xl">
                        {EXPENSE_EMOJIS[item.category] || "📦"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {item.description ||
                            EXPENSE_CATEGORY_LABELS[item.category] ||
                            item.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(item.date), "dd MMM yyyy", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-red-500 text-sm">
                        - {formatCurrency(item.amount)}
                      </span>
                      <TrendingDown size={16} className="text-red-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Last 30 Days Expenses Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiêu 30 ngày qua
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last30DaysExpenseData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#111827"
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false}
                />
                <YAxis
                  stroke="#111827"
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : v.toString()
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(124, 58, 237, 0.04)" }}
                  {...darkTooltipStyle}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Chi tiêu",
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {last30DaysExpenseData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#7C3AED" : "#C4B5FD"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Row: 60-day Donut Chart + Income List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Last 60 Days Income Donut */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thu nhập 60 ngày qua
            </h2>
            {last60DaysIncomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={last60DaysIncomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {last60DaysIncomeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          INCOME_DONUT_COLORS[
                            index % INCOME_DONUT_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    {...darkTooltipStyle}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    className="fill-gray-500 text-xs"
                  >
                    Tổng thu nhập
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    className="fill-gray-900 text-base font-bold"
                  >
                    {formatCurrency(last60DaysIncomeTotal)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Chưa có dữ liệu thu nhập
              </div>
            )}
          </div>

          {/* Recent Income List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Thu nhập</h2>
              <Link
                href="/incomes"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentIncomes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có thu nhập nào
                </div>
              ) : (
                recentIncomes.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
                        {INCOME_EMOJIS[item.category] || "📦"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {item.description ||
                            INCOME_CATEGORY_LABELS[item.category] ||
                            item.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(item.date), "dd MMM yyyy", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-emerald-500 text-sm">
                        + {formatCurrency(item.amount)}
                      </span>
                      <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
