"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Expense,
  expenseApi,
  PaginationParams,
  statsApi,
  TypeSummary,
} from "@/lib/api";
import {
  Input,
  Select,
  Button,
  SelectOption,
  DatePicker,
  DateRangePicker,
  CurrencyInput,
  ConfirmModal,
  EditTransactionModal,
  Pagination,
} from "@/components/ui";
import {
  Plus,
  Calendar,
  Trash2,
  Search,
  X,
  Pencil,
  FilterX,
  TrendingDown,
  TrendingUp,
  Download,
} from "lucide-react";
import { groupTransactionsByDate } from "@/lib/dateGrouping";
import { useToastStore } from "@/store";
import { AnimatedCurrency } from "@/components/AnimatedCurrency";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const tooltipStyle = {
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

const CATEGORIES: SelectOption[] = [
  { value: "food", label: "Ăn uống", emoji: "🍔" },
  { value: "transport", label: "Di chuyển", emoji: "🚗" },
  { value: "shopping", label: "Mua sắm", emoji: "🛒" },
  { value: "entertainment", label: "Giải trí", emoji: "🎮" },
  { value: "bills", label: "Hóa đơn", emoji: "📄" },
  { value: "health", label: "Sức khỏe", emoji: "💊" },
  { value: "education", label: "Học tập", emoji: "📚" },
  { value: "transfer", label: "Chuyển khoản", emoji: "💸" },
  { value: "other", label: "Khác", emoji: "📦" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<TypeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const showSkeleton = useDelayedLoading(loading && isFirstLoad);
  const showInlineSkeleton = useDelayedLoading(loading && !isFirstLoad, 0, 800);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedAmountMin = useDebounce(amountMin, 500);
  const debouncedAmountMax = useDebounce(amountMax, 500);

  const toast = useToastStore();

  const hasActiveFilters = !!(
    searchQuery ||
    filterCategory ||
    dateFrom ||
    dateTo ||
    amountMin ||
    amountMax
  );
  const hasStatsFilters = !!(
    filterCategory ||
    dateFrom ||
    dateTo ||
    amountMin ||
    amountMax
  );

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
  };

  // Auto-swap amount min/max if inverted
  useEffect(() => {
    if (amountMin && amountMax && Number(amountMin) > Number(amountMax)) {
      const tmp = amountMin;
      setAmountMin(amountMax);
      setAmountMax(tmp);
      toast.info("Đã tự động đổi chỗ số tiền từ và đến");
    }
  }, [debouncedAmountMin, debouncedAmountMax]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filterCategory,
    dateFrom,
    dateTo,
    debouncedAmountMin,
    debouncedAmountMax,
  ]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await statsApi.getExpenseSummary({
        ...(filterCategory && { category: filterCategory }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(debouncedAmountMin && { amountMin: Number(debouncedAmountMin) }),
        ...(debouncedAmountMax && { amountMax: Number(debouncedAmountMax) }),
      });
      setSummary(res.data);
    } catch {
      // ignore
    }
  }, [
    filterCategory,
    dateFrom,
    dateTo,
    debouncedAmountMin,
    debouncedAmountMax,
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: PaginationParams = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterCategory && { category: filterCategory }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(debouncedAmountMin && { amountMin: Number(debouncedAmountMin) }),
        ...(debouncedAmountMax && { amountMax: Number(debouncedAmountMax) }),
      };

      const paginatedRes = await expenseApi.getPaginated(params);
      setExpenses(paginatedRes.data.data);
      setTotalPages(paginatedRes.data.meta.totalPages);
      setTotal(paginatedRes.data.meta.total);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [
    page,
    debouncedSearch,
    filterCategory,
    dateFrom,
    dateTo,
    debouncedAmountMin,
    debouncedAmountMax,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when AI creates a transaction
  useEffect(() => {
    const handler = () => {
      fetchData();
      fetchSummary();
    };
    window.addEventListener("transaction-created", handler);
    return () => window.removeEventListener("transaction-created", handler);
  }, [fetchData, fetchSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setSubmitting(true);
    try {
      await expenseApi.create({
        amount: Number(amount),
        category,
        description: description || undefined,
        date,
      });
      setAmount("");
      setDescription("");
      setShowForm(false);
      setPage(1);
      fetchData();
      fetchSummary();
      toast.success("Thêm chi tiêu thành công");
    } catch {
      toast.error("Không thể thêm chi tiêu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await expenseApi.delete(deleteId);
      fetchData();
      fetchSummary();
      toast.success("Xóa chi tiêu thành công");
    } catch {
      toast.error("Không thể xóa chi tiêu");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = async (
    id: string,
    data: {
      amount?: number;
      description?: string;
      category?: string;
      date?: string;
    },
  ) => {
    await expenseApi.update(id, data);
    setEditingExpense(null);
    fetchData();
    fetchSummary();
    toast.success("Cập nhật chi tiêu thành công");
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params: PaginationParams = {
        ...(filterCategory && { category: filterCategory }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(debouncedAmountMin && { amountMin: Number(debouncedAmountMin) }),
        ...(debouncedAmountMax && { amountMax: Number(debouncedAmountMax) }),
      };
      const res = await expenseApi.exportCsv(params);
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chi-tieu-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Xuất CSV thành công");
    } catch {
      toast.error("Không thể xuất CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params: PaginationParams = {
        ...(filterCategory && { category: filterCategory }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(debouncedAmountMin && { amountMin: Number(debouncedAmountMin) }),
        ...(debouncedAmountMax && { amountMax: Number(debouncedAmountMax) }),
      };
      const res = await expenseApi.exportPdf(params);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Không thể xuất PDF");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getCategoryInfo = (value: string) => {
    return (
      CATEGORIES.find((c) => c.value === value) || { label: value, emoji: "📦" }
    );
  };

  // Chart colors
  const CHART_COLORS = [
    "#7c3aed",
    "#c4b5fd",
    "#a78bfa",
    "#8b5cf6",
    "#6d28d9",
    "#ddd6fe",
    "#5b21b6",
    "#ede9fe",
    "#4c1d95",
  ];

  // Donut chart data - by category (from summary)
  const categoryChartData = summary
    ? Object.entries(summary.current.byCategory).map(([key, value], index) => {
        const cat = CATEGORIES.find((c) => c.value === key);
        return {
          name: cat ? `${cat.emoji} ${cat.label}` : key,
          value,
          fill: CHART_COLORS[index % CHART_COLORS.length],
        };
      })
    : [];

  if (showSkeleton) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-7 skeleton rounded w-32 mb-2" />
              <div className="h-4 skeleton rounded w-64" />
            </div>
            <div className="h-11 skeleton rounded-2xl w-36" />
          </div>

          {/* Filters skeleton */}
          <div className="skeleton-card rounded-2xl border p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-12 skeleton rounded-2xl" />
              <div className="sm:w-56 h-12 skeleton rounded-2xl" />
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card rounded-2xl p-5 border">
                <div className="h-4 skeleton rounded w-24 mb-2" />
                <div className="h-7 skeleton rounded w-32 mb-2" />
                <div className="h-4 skeleton rounded w-20" />
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="skeleton-card rounded-2xl border p-6">
            <div className="h-5 skeleton rounded w-32 mb-4" />
            <div className="flex items-center justify-center h-[250px]">
              <div className="w-[180px] h-[180px] rounded-full border-[24px] skeleton" />
            </div>
          </div>

          {/* List skeleton */}
          <div className="skeleton-card rounded-2xl border overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="h-5 skeleton rounded w-40" />
              <div className="h-6 skeleton rounded-full w-24" />
            </div>
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 skeleton rounded-xl" />
                    <div>
                      <div className="h-4 skeleton rounded w-32 mb-2" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiêu</h1>
            <p className="text-gray-500">Quản lý các khoản chi tiêu của bạn</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportCsv}
              leftIcon={<Download size={18} />}
              variant="secondary"
              loading={exporting}
              disabled={exporting}
            >
              CSV
            </Button>
            <Button
              onClick={handleExportPdf}
              leftIcon={<Download size={18} />}
              variant="secondary"
              loading={exporting}
              disabled={exporting}
            >
              PDF
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              leftIcon={showForm ? <X size={18} /> : <Plus size={18} />}
              variant={showForm ? "secondary" : "primary"}
            >
              {showForm ? "Đóng" : "Thêm chi tiêu"}
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Thêm chi tiêu mới
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CurrencyInput
                  label="Số tiền"
                  value={amount}
                  onChange={setAmount}
                  required
                />

                <Select
                  label="Danh mục"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORIES}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5 mt-5">
                <div className="flex-1">
                  <Input
                    label="Mô tả"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ăn trưa văn phòng"
                  />
                </div>

                <DatePicker
                  label="Ngày"
                  value={date}
                  onChange={(value) => setDate(value)}
                  className="w-48"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <Button
                  type="submit"
                  disabled={!amount}
                  loading={submitting}
                  leftIcon={<Plus size={18} />}
                >
                  {submitting ? "Đang thêm..." : "Thêm chi tiêu"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm chi tiêu..."
                leftIcon={<Search size={18} />}
              />
            </div>
            <div className="sm:w-56">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: "", label: "Tất cả danh mục" },
                  ...CATEGORIES,
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex items-end gap-2">
              <CurrencyInput
                label="Số tiền từ"
                value={amountMin}
                onChange={setAmountMin}
                placeholder="0"
                compact
                className="w-40"
              />
              <span className="pb-3 text-gray-400">—</span>
              <CurrencyInput
                label="Đến"
                value={amountMax}
                onChange={setAmountMax}
                placeholder="∞"
                compact
                className="w-40"
              />
            </div>

            <DateRangePicker
              label="Khoảng ngày"
              value={dateFrom || dateTo ? [dateFrom, dateTo] : undefined}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />

            {hasActiveFilters && (
              <div className="flex items-end pb-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  leftIcon={<FilterX size={16} />}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        {showInlineSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card rounded-2xl p-5 border">
                <div className="h-4 skeleton rounded w-24 mb-2" />
                <div className="h-7 skeleton rounded w-32 mb-2" />
                <div className="h-4 skeleton rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          summary && (
            <div
              className={`grid grid-cols-1 ${hasStatsFilters ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4`}
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/25">
                <p className="text-primary-100 text-sm font-medium">
                  {hasStatsFilters ? "Tổng chi tiêu" : "Chi tiêu tháng này"}
                </p>
                <p className="text-2xl font-bold mt-1">
                  <AnimatedCurrency value={summary.current.total} />
                </p>
                {!hasStatsFilters && summary.previous.total > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    {summary.change > 0 ? (
                      <TrendingUp size={14} className="text-red-300" />
                    ) : (
                      <TrendingDown size={14} className="text-emerald-300" />
                    )}
                    <p
                      className={`text-sm font-medium ${summary.change > 0 ? "text-red-200" : "text-emerald-200"}`}
                    >
                      {summary.change > 0 ? "+" : ""}
                      {summary.change}% so với tháng trước
                    </p>
                  </div>
                ) : (
                  <p className="text-primary-200 text-sm mt-1">
                    {summary.current.count} giao dịch
                  </p>
                )}
              </div>
              {hasStatsFilters ? (
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/25">
                  <p className="text-orange-100 text-sm font-medium">
                    Số giao dịch
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {summary.current.count}
                  </p>
                  <p className="text-orange-200 text-sm mt-1">
                    giao dịch phù hợp
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/25">
                    <p className="text-orange-100 text-sm font-medium">
                      Tháng trước
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      <AnimatedCurrency value={summary.previous.total} />
                    </p>
                    <p className="text-orange-200 text-sm mt-1">
                      {summary.previous.count} giao dịch
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
                    <p className="text-emerald-100 text-sm font-medium">
                      Giao dịch tháng này
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.current.count}
                    </p>
                    <p className="text-emerald-200 text-sm mt-1">giao dịch</p>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* Category Chart */}
        {showInlineSkeleton ? (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-[#303030] p-6 animate-pulse">
            <div className="h-5 skeleton rounded w-32 mb-4" />
            <div className="flex items-center justify-center h-[250px]">
              <div className="w-[180px] h-[180px] rounded-full border-[24px] skeleton" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Theo danh mục
            </h2>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-gray-400 text-sm">
                  Không có dữ liệu cho bộ lọc hiện tại
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expense List */}
        {showInlineSkeleton ? (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-[#303030] overflow-hidden animate-pulse">
            <div className="p-5 border-b border-gray-100 dark:border-[#303030] flex items-center justify-between">
              <div className="h-5 skeleton rounded w-40" />
              <div className="h-6 skeleton rounded-full w-24" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 skeleton rounded-xl" />
                    <div>
                      <div className="h-4 skeleton rounded w-32 mb-2" />
                      <div className="h-3 skeleton rounded w-20" />
                    </div>
                  </div>
                  <div className="h-4 skeleton rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách chi tiêu
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {total} giao dịch
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  Chưa có chi tiêu nào
                </p>
                <p className="text-sm text-gray-400">
                  Nhấn &quot;Thêm chi tiêu&quot; để bắt đầu theo dõi
                </p>
              </div>
            ) : (
              <div>
                {groupTransactionsByDate(expenses).map((group) => (
                  <div key={group.dateKey}>
                    <div className="px-5 py-2.5 bg-gray-50/80 dark:bg-white/[0.04] border-b border-gray-100 dark:border-[#3f3f3f]">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {group.label}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-[#3f3f3f]">
                      {group.items.map((expense) => {
                        const catInfo = getCategoryInfo(expense.category);
                        return (
                          <div
                            key={expense.id}
                            className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.08] transition group cursor-pointer"
                            onClick={() => setEditingExpense(expense)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                {catInfo.emoji}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {expense.description || catInfo.label}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                                    {catInfo.label}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    {format(
                                      new Date(expense.date),
                                      "dd/MM/yyyy",
                                      {
                                        locale: vi,
                                      },
                                    )}
                                  </span>
                                  {expense.source === "email" && (
                                    <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-600 rounded-lg font-medium">
                                      Email
                                    </span>
                                  )}
                                  {expense.source === "recurring" && (
                                    <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg font-medium">
                                      Định kỳ
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                                -{formatCurrency(expense.amount)}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingExpense(expense);
                                }}
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900 rounded-lg transition-all"
                                title="Sửa"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(expense.id);
                                }}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900 rounded-lg transition-all"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Xóa chi tiêu"
        message="Bạn có chắc muốn xóa chi tiêu này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <EditTransactionModal
        open={!!editingExpense}
        title="Sửa chi tiêu"
        transaction={editingExpense}
        categories={CATEGORIES}
        onSave={handleEdit}
        onCancel={() => setEditingExpense(null)}
      />
    </DashboardLayout>
  );
}
