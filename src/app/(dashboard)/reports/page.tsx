"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { Expense, expenseApi, Income, incomeApi } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  PiggyBank,
  Download,
  Wallet,
} from "lucide-react";

import { subDays, startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { AnimatedCurrency } from "@/components/AnimatedCurrency";
import { ChartReveal, SkeletonTransition } from "@/components/motion";

const EXPENSE_COLORS = [
  "#EF4444",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

const INCOME_COLORS = [
  "#10B981",
  "#3B82F6",
  "#14B8A6",
  "#22C55E",
  "#0EA5E9",
  "#6EE7B7",
  "#34D399",
  "#2DD4BF",
];

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

type Period = "7d" | "30d" | "month" | "3m" | "year";
type ViewMode = "all" | "income" | "expense";

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [period, setPeriod] = useState<Period>("month");
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const fetchData = useCallback(async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        expenseApi.getAll(),
        incomeApi.getAll(),
      ]);
      setExpenses(expRes.data);
      setIncomes(incRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get date range based on period
  const getDateRange = (p: Period) => {
    const now = new Date();
    switch (p) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "3m":
        return { start: subDays(now, 90), end: now };
      case "year":
        return { start: subDays(now, 365), end: now };
    }
  };

  // Get previous period for comparison
  const getPreviousDateRange = (p: Period) => {
    const { start, end } = getDateRange(p);
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(end.getTime() - duration),
    };
  };

  // Filter data by date range
  const filterByRange = <T extends { date: string }>(
    data: T[],
    start: Date,
    end: Date,
  ) => {
    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  };

  // Current period data
  const { start: currentStart, end: currentEnd } = getDateRange(period);

  const currentExpenses = useMemo(
    () => filterByRange(expenses, currentStart, currentEnd),
    [expenses, currentStart, currentEnd],
  );
  const currentIncomes = useMemo(
    () => filterByRange(incomes, currentStart, currentEnd),
    [incomes, currentStart, currentEnd],
  );

  const currentExpenseTotal = currentExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );
  const currentIncomeTotal = currentIncomes.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );
  const currentBalance = currentIncomeTotal - currentExpenseTotal;

  // Previous period data for comparison
  const { start: prevStart, end: prevEnd } = getPreviousDateRange(period);

  const previousExpenses = useMemo(
    () => filterByRange(expenses, prevStart, prevEnd),
    [expenses, prevStart, prevEnd],
  );
  const previousIncomes = useMemo(
    () => filterByRange(incomes, prevStart, prevEnd),
    [incomes, prevStart, prevEnd],
  );

  const previousExpenseTotal = previousExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );
  const previousIncomeTotal = previousIncomes.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );
  const previousBalance = previousIncomeTotal - previousExpenseTotal;

  // Calculate change percentages
  const expenseChangePercent = previousExpenseTotal
    ? ((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) *
      100
    : 0;
  const incomeChangePercent = previousIncomeTotal
    ? ((currentIncomeTotal - previousIncomeTotal) / previousIncomeTotal) * 100
    : 0;
  const balanceChange = currentBalance - previousBalance;

  // Group expenses by category
  const expenseByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    currentExpenses.forEach((e) => {
      result[e.category] = (result[e.category] || 0) + Number(e.amount);
    });
    return result;
  }, [currentExpenses]);

  // Group incomes by category
  const incomeByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    currentIncomes.forEach((i) => {
      result[i.category] = (result[i.category] || 0) + Number(i.amount);
    });
    return result;
  }, [currentIncomes]);

  // Pie chart data
  const expensePieData = Object.entries(expenseByCategory)
    .map(([key, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[key] || key,
      value,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const incomePieData = Object.entries(incomeByCategory)
    .map(([key, value]) => ({
      name: INCOME_CATEGORY_LABELS[key] || key,
      value,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Daily trend data
  const dailyTrend = useMemo(() => {
    const days: Record<string, { income: number; expense: number }> = {};
    const dayCount = Math.min(
      period === "7d" ? 7 : period === "30d" ? 30 : 30,
      30,
    );

    for (let i = 0; i < dayCount; i++) {
      const date = format(subDays(new Date(), i), "dd/MM");
      days[date] = { income: 0, expense: 0 };
    }

    currentExpenses.forEach((e) => {
      const date = format(new Date(e.date), "dd/MM");
      if (days[date] !== undefined) {
        days[date].expense += Number(e.amount);
      }
    });

    currentIncomes.forEach((i) => {
      const date = format(new Date(i.date), "dd/MM");
      if (days[date] !== undefined) {
        days[date].income += Number(i.amount);
      }
    });

    return Object.entries(days)
      .map(([date, data]) => ({
        date,
        ...data,
        balance: data.income - data.expense,
      }))
      .reverse();
  }, [currentExpenses, currentIncomes, period]);

  // Monthly comparison (last 6 months)
  const monthlyComparison = useMemo(() => {
    const months: { month: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthExpenses = filterByRange(expenses, monthStart, monthEnd);
      const monthIncomes = filterByRange(incomes, monthStart, monthEnd);

      const expenseTotal = monthExpenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0,
      );
      const incomeTotal = monthIncomes.reduce(
        (sum, i) => sum + Number(i.amount),
        0,
      );

      months.push({
        month: format(monthDate, "MMM", { locale: vi }),
        income: incomeTotal,
        expense: expenseTotal,
      });
    }

    return months;
  }, [expenses, incomes]);

  // Insights
  const insights = useMemo(() => {
    const result: string[] = [];

    if (currentBalance >= 0) {
      const savingRate = currentIncomeTotal
        ? ((currentBalance / currentIncomeTotal) * 100).toFixed(0)
        : 0;
      result.push(`Tiết kiệm được ${savingRate}% thu nhập`);
    } else {
      result.push(`Chi vượt thu ${formatCurrency(Math.abs(currentBalance))}`);
    }

    if (incomeChangePercent > 10) {
      result.push(`Thu nhập tăng ${incomeChangePercent.toFixed(0)}%`);
    } else if (incomeChangePercent < -10) {
      result.push(`Thu nhập giảm ${Math.abs(incomeChangePercent).toFixed(0)}%`);
    }

    if (expenseChangePercent > 10) {
      result.push(`Chi tiêu tăng ${expenseChangePercent.toFixed(0)}%`);
    } else if (expenseChangePercent < -10) {
      result.push(
        `Chi tiêu giảm ${Math.abs(expenseChangePercent).toFixed(0)}%`,
      );
    }

    const topExpense = expensePieData[0];
    if (topExpense) {
      const percent = currentExpenseTotal
        ? ((topExpense.value / currentExpenseTotal) * 100).toFixed(0)
        : 0;
      result.push(`${topExpense.name}: ${percent}% chi tiêu`);
    }

    return result;
  }, [
    currentBalance,
    currentIncomeTotal,
    currentExpenseTotal,
    incomeChangePercent,
    expenseChangePercent,
    expensePieData,
  ]);

  // Group by date
  const byDate = useMemo(() => {
    const result: Record<string, { income: number; expense: number }> = {};
    currentExpenses.forEach((e) => {
      const date = format(new Date(e.date), "dd/MM/yyyy");
      if (!result[date]) result[date] = { income: 0, expense: 0 };
      result[date].expense += Number(e.amount);
    });
    currentIncomes.forEach((i) => {
      const date = format(new Date(i.date), "dd/MM/yyyy");
      if (!result[date]) result[date] = { income: 0, expense: 0 };
      result[date].income += Number(i.amount);
    });
    return result;
  }, [currentExpenses, currentIncomes]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [
      ...currentExpenses.map((e) => ({ ...e, type: "expense" as const })),
      ...currentIncomes.map((i) => ({ ...i, type: "income" as const })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }, [currentExpenses, currentIncomes]);

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const params: Record<string, string> = {};
      const { start, end } = getDateRange(period);
      params.dateFrom = format(start, "yyyy-MM-dd");
      params.dateTo = format(end, "yyyy-MM-dd");

      const [expRes, incRes] = await Promise.all([
        expenseApi.exportPdf(params),
        incomeApi.exportPdf(params),
      ]);

      // Open expense PDF in new tab for preview
      const expBlob = new Blob([expRes.data], { type: "application/pdf" });
      const expUrl = URL.createObjectURL(expBlob);
      window.open(expUrl, "_blank");

      // Open income PDF in new tab for preview
      const incBlob = new Blob([incRes.data], { type: "application/pdf" });
      const incUrl = URL.createObjectURL(incBlob);
      setTimeout(() => window.open(incUrl, "_blank"), 300);
    } catch {
      // Failed to export PDF
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Ngày", "Loại", "Danh mục", "Mô tả", "Số tiền", "Nguồn"];
    const expenseRows = currentExpenses.map((e) => [
      format(new Date(e.date), "dd/MM/yyyy"),
      "Chi tiêu",
      EXPENSE_CATEGORY_LABELS[e.category] || e.category,
      e.description || "",
      `-${e.amount}`,
      e.source,
    ]);
    const incomeRows = currentIncomes.map((i) => [
      format(new Date(i.date), "dd/MM/yyyy"),
      "Thu nhập",
      INCOME_CATEGORY_LABELS[i.category] || i.category,
      i.description || "",
      `+${i.amount}`,
      i.source,
    ]);

    const allRows = [...incomeRows, ...expenseRows].sort((a, b) => {
      const dateA = a[0].split("/").reverse().join("");
      const dateB = b[0].split("/").reverse().join("");
      return dateB.localeCompare(dateA);
    });

    const csvContent = [headers, ...allRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-tai-chinh-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <DashboardLayout>
      <SkeletonTransition
        loading={showSkeleton}
        skeleton={
          <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="h-7 skeleton rounded w-48 mb-2" />
                  <div className="h-4 skeleton rounded w-64" />
                </div>
                <div className="h-10 skeleton rounded-lg w-28" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex gap-2 skeleton-card rounded-lg p-1 shadow-sm border">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 skeleton rounded-md w-16" />
                  ))}
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-9 skeleton rounded-lg w-24" />
                  ))}
                </div>
              </div>
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-card rounded-xl shadow-sm border p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 skeleton rounded w-20" />
                    <div className="w-5 h-5 skeleton rounded" />
                  </div>
                  <div className="h-7 skeleton rounded w-28 mb-2" />
                  <div className="h-4 skeleton rounded w-36" />
                </div>
              ))}
            </div>

            {/* Insights skeleton */}
            <div className="skeleton-light rounded-xl p-5 border border-gray-200 dark:border-[#303030]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 skeleton rounded" />
                <div className="h-4 skeleton rounded w-28" />
              </div>
              <div className="flex flex-wrap gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 skeleton rounded-lg w-40" />
                ))}
              </div>
            </div>

            {/* Area chart skeleton */}
            <div className="skeleton-card rounded-xl shadow-sm border p-6">
              <div className="h-5 skeleton rounded w-44 mb-4" />
              <div className="h-[300px] flex items-end gap-1">
                <div className="flex-1 skeleton-light rounded-t h-1/4" />
                <div className="flex-1 skeleton-light rounded-t h-2/5" />
                <div className="flex-1 skeleton-light rounded-t h-1/3" />
                <div className="flex-1 skeleton-light rounded-t h-3/5" />
                <div className="flex-1 skeleton-light rounded-t h-1/2" />
                <div className="flex-1 skeleton-light rounded-t h-2/3" />
                <div className="flex-1 skeleton-light rounded-t h-2/5" />
                <div className="flex-1 skeleton-light rounded-t h-4/5" />
                <div className="flex-1 skeleton-light rounded-t h-3/5" />
                <div className="flex-1 skeleton-light rounded-t h-1/2" />
                <div className="flex-1 skeleton-light rounded-t h-3/4" />
                <div className="flex-1 skeleton-light rounded-t h-2/5" />
                <div className="flex-1 skeleton-light rounded-t h-[90%]" />
                <div className="flex-1 skeleton-light rounded-t h-3/5" />
                <div className="flex-1 skeleton-light rounded-t h-1/3" />
                <div className="flex-1 skeleton-light rounded-t h-1/2" />
                <div className="flex-1 skeleton-light rounded-t h-2/3" />
                <div className="flex-1 skeleton-light rounded-t h-2/5" />
                <div className="flex-1 skeleton-light rounded-t h-3/4" />
                <div className="flex-1 skeleton-light rounded-t h-1/2" />
              </div>
            </div>

            {/* Pie charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-card rounded-xl shadow-sm border p-6"
                >
                  <div className="h-5 skeleton rounded w-40 mb-4" />
                  <div className="flex items-center justify-center h-[280px]">
                    <div className="w-[180px] h-[180px] rounded-full border-[24px] skeleton" />
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly comparison skeleton */}
            <div className="skeleton-card rounded-xl shadow-sm border p-6">
              <div className="h-5 skeleton rounded w-48 mb-4" />
              <div className="flex items-end gap-4 h-[280px] pt-8">
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-2/5" />
                  <div className="flex-1 skeleton-light rounded-t h-1/4" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-3/5" />
                  <div className="flex-1 skeleton-light rounded-t h-2/5" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-4/5" />
                  <div className="flex-1 skeleton-light rounded-t h-3/5" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-1/2" />
                  <div className="flex-1 skeleton-light rounded-t h-1/3" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-3/4" />
                  <div className="flex-1 skeleton-light rounded-t h-1/2" />
                </div>
                <div className="flex-1 flex gap-1 items-end">
                  <div className="flex-1 skeleton rounded-t h-[90%]" />
                  <div className="flex-1 skeleton-light rounded-t h-3/4" />
                </div>
              </div>
            </div>

            {/* Category progress bars skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-card rounded-xl shadow-sm border p-6"
                >
                  <div className="h-5 skeleton rounded w-40 mb-4" />
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="h-4 skeleton rounded w-20" />
                        <div className="h-4 skeleton rounded w-24" />
                      </div>
                      <div className="w-full skeleton-light rounded-full h-2">
                        <div className="skeleton h-2 rounded-full w-4/5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="h-4 skeleton rounded w-20" />
                        <div className="h-4 skeleton rounded w-24" />
                      </div>
                      <div className="w-full skeleton-light rounded-full h-2">
                        <div className="skeleton h-2 rounded-full w-3/5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="h-4 skeleton rounded w-20" />
                        <div className="h-4 skeleton rounded w-24" />
                      </div>
                      <div className="w-full skeleton-light rounded-full h-2">
                        <div className="skeleton h-2 rounded-full w-2/5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="h-4 skeleton rounded w-20" />
                        <div className="h-4 skeleton rounded w-24" />
                      </div>
                      <div className="w-full skeleton-light rounded-full h-2">
                        <div className="skeleton h-2 rounded-full w-1/4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Báo cáo & Phân tích
              </h1>
              <p className="text-gray-500">
                Thu nhập, chi tiêu và xu hướng tài chính
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                type="button"
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {[
                { value: "7d", label: "7 ngày" },
                { value: "30d", label: "30 ngày" },
                { value: "month", label: "Tháng này" },
                { value: "3m", label: "3 tháng" },
                { value: "year", label: "Năm" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    period === p.value
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2 sm:ml-auto">
              {[
                { value: "all", label: "Tất cả", icon: Wallet },
                { value: "income", label: "Thu nhập", icon: TrendingUp },
                { value: "expense", label: "Chi tiêu", icon: TrendingDown },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setViewMode(tab.value as ViewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === tab.value
                      ? tab.value === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : tab.value === "expense"
                          ? "bg-red-100 text-red-700"
                          : "bg-primary-100 text-primary-700"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Balance */}
          <div
            className={`rounded-xl shadow-sm border p-5 ${
              currentBalance >= 0
                ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                : "bg-gradient-to-br from-red-50 to-orange-50 border-red-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Số dư kỳ này</span>
              <PiggyBank
                size={18}
                className={
                  currentBalance >= 0 ? "text-emerald-500" : "text-red-500"
                }
              />
            </div>
            <p
              className={`text-2xl font-bold ${currentBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}
            >
              <AnimatedCurrency value={currentBalance} />
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {balanceChange >= 0 ? "+" : ""}
              {formatCurrency(balanceChange)} so với kỳ trước
            </p>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Thu nhập</span>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCurrency value={currentIncomeTotal} />
            </p>
            <p
              className={`text-sm mt-1 ${incomeChangePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {incomeChangePercent >= 0 ? "+" : ""}
              {incomeChangePercent.toFixed(1)}% so với kỳ trước
            </p>
          </div>

          {/* Expense */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Chi tiêu</span>
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCurrency value={currentExpenseTotal} />
            </p>
            <p
              className={`text-sm mt-1 ${expenseChangePercent <= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {expenseChangePercent >= 0 ? "+" : ""}
              {expenseChangePercent.toFixed(1)}% so với kỳ trước
            </p>
          </div>

          {/* Saving Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tỷ lệ tiết kiệm</span>
              <Wallet size={18} className="text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentIncomeTotal > 0
                ? ((currentBalance / currentIncomeTotal) * 100).toFixed(0)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(currentBalance)} tiết kiệm
            </p>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-50 rounded-xl p-5 border border-primary-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-primary-600" />
              <span className="font-semibold text-primary-900">
                Nhận xét nhanh
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {insights.map((insight, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 shadow-sm"
                >
                  {insight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Area Chart - Income vs Expense */}
        {viewMode === "all" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thu nhập vs Chi tiêu
            </h3>
            {dailyTrend.length > 0 ? (
              <ChartReveal delay={0.1}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Thu nhập"
                      stackId="1"
                      stroke="#10B981"
                      fill="#D1FAE5"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Chi tiêu"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#FEE2E2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartReveal>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        )}

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Pie */}
          {(viewMode === "all" || viewMode === "income") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Thu nhập theo nguồn
              </h3>
              {incomePieData.length > 0 ? (
                <ChartReveal delay={0.2}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={incomePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {incomePieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartReveal>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-500">
                  Chưa có dữ liệu thu nhập
                </div>
              )}
            </div>
          )}

          {/* Expense Pie */}
          {(viewMode === "all" || viewMode === "expense") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500" />
                Chi tiêu theo danh mục
              </h3>
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-500">
                  Chưa có dữ liệu chi tiêu
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            So sánh 6 tháng gần đây
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar
                dataKey="income"
                name="Thu nhập"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Chi tiêu"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          {(viewMode === "all" || viewMode === "income") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Thu nhập theo nguồn
              </h3>
              <div className="space-y-3">
                {Object.entries(incomeByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percent = currentIncomeTotal
                      ? (amount / currentIncomeTotal) * 100
                      : 0;
                    return (
                      <div key={category} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-900">
                              {INCOME_CATEGORY_LABELS[category] || category}
                            </span>
                            <span className="text-emerald-600 font-medium">
                              +{formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                {Object.keys(incomeByCategory).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có dữ liệu thu nhập
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Expense by Category */}
          {(viewMode === "all" || viewMode === "expense") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500" />
                Chi tiêu theo danh mục
              </h3>
              <div className="space-y-3">
                {Object.entries(expenseByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percent = currentExpenseTotal
                      ? (amount / currentExpenseTotal) * 100
                      : 0;
                    return (
                      <div key={category} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-900">
                              {EXPENSE_CATEGORY_LABELS[category] || category}
                            </span>
                            <span className="text-red-600 font-medium">
                              -{formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                {Object.keys(expenseByCategory).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có dữ liệu chi tiêu
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Daily Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thu chi theo ngày
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {Object.entries(byDate)
              .sort((a, b) => {
                const dateA = a[0].split("/").reverse().join("");
                const dateB = b[0].split("/").reverse().join("");
                return dateB.localeCompare(dateA);
              })
              .map(([date, data]) => {
                const dailyBalance = data.income - data.expense;
                return (
                  <div
                    key={date}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">{date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {data.income > 0 && (
                        <span className="text-emerald-600 font-medium">
                          +{formatCurrency(data.income)}
                        </span>
                      )}
                      {data.expense > 0 && (
                        <span className="text-red-600 font-medium">
                          -{formatCurrency(data.expense)}
                        </span>
                      )}
                      <span
                        className={`font-bold ${dailyBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        = {formatCurrency(dailyBalance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            {Object.keys(byDate).length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Giao dịch gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Ngày
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Loại
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Mô tả
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions
                  .filter((t) => viewMode === "all" || t.type === viewMode)
                  .slice(0, 15)
                  .map((item) => {
                    const isIncome = item.type === "income";
                    const labels = isIncome
                      ? INCOME_CATEGORY_LABELS
                      : EXPENSE_CATEGORY_LABELS;
                    return (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(item.date), "dd/MM/yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              isIncome
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isIncome ? "Thu nhập" : "Chi tiêu"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            {labels[item.category] || item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.description || "-"}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${
                            isIncome ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {recentTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Không có giao dịch trong kỳ này
              </p>
            )}
          </div>
        </div>
      </div>
      </SkeletonTransition>
    </DashboardLayout>
  );
}
