"use client";

import { useEffect, useState, useCallback } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { budgetApi, BudgetOverview, BudgetCategoryOverview } from "@/lib/api";
import {
  Button,
  Select,
  SelectOption,
  CurrencyInput,
  ConfirmModal,
} from "@/components/ui";
import { Plus, X, Pencil, Trash2, Wallet } from "lucide-react";
import { useToastStore } from "@/store";
import { AnimatedCurrency } from "@/components/AnimatedCurrency";
import { ChartReveal, SkeletonTransition } from "@/components/motion";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DatePicker as AntDatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

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

function getProgressColor(percentage: number) {
  if (percentage >= 100)
    return { bar: "bg-red-500", bg: "bg-red-100", text: "text-red-600" };
  if (percentage >= 80)
    return { bar: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-600" };
  return {
    bar: "bg-emerald-500",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  };
}

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState("food");
  const [formAmount, setFormAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toast = useToastStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getOverview(month, year);
      setOverview(res.data);
    } catch {
      console.error("Failed to fetch budget overview");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) return;

    setSubmitting(true);
    try {
      if (editId) {
        await budgetApi.update(editId, { amount: Number(formAmount) });
        toast.success("Cập nhật ngân sách thành công");
      } else {
        await budgetApi.create({
          category: formCategory,
          amount: Number(formAmount),
          month,
          year,
        });
        toast.success("Tạo ngân sách thành công");
      }
      resetForm();
      fetchData();
    } catch {
      toast.error(
        editId
          ? "Không thể cập nhật ngân sách"
          : "Ngân sách cho danh mục này đã tồn tại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: BudgetCategoryOverview) => {
    setEditId(item.id);
    setFormCategory(item.category);
    setFormAmount(String(item.budget));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await budgetApi.delete(deleteId);
      fetchData();
      toast.success("Xóa ngân sách thành công");
    } catch {
      toast.error("Không thể xóa ngân sách");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormCategory("food");
    setFormAmount("");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getCategoryInfo = (value: string) =>
    CATEGORIES.find((c) => c.value === value) || { label: value, emoji: "📦" };

  // Filter categories that don't have a budget yet (for create form)
  const usedCategories = overview?.categories.map((c) => c.category) || [];
  const availableCategories = CATEGORIES.filter(
    (c) => !usedCategories.includes(c.value),
  );

  // Donut — phân bổ ngân sách theo danh mục
  const CATEGORY_COLORS = [
    "#7c3aed",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#6b7280",
  ];
  const allocationData =
    overview?.categories.map((item, i) => {
      const cat = getCategoryInfo(item.category);
      return {
        name: cat.label,
        value: item.budget,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      };
    }) || [];

  // Donut — tổng quan đã dùng bao nhiêu %
  const overallPercentage =
    overview && overview.totalBudget > 0
      ? Math.round((overview.totalSpent / overview.totalBudget) * 100)
      : 0;
  const donutSummary = overview
    ? [
        {
          name: "Đã chi",
          value: overview.totalSpent,
          fill:
            overallPercentage >= 100
              ? "#ef4444"
              : overallPercentage >= 80
                ? "#f59e0b"
                : "#10b981",
        },
        {
          name: "Còn lại",
          value: Math.max(0, overview.totalRemaining),
          fill: "#e5e7eb",
        },
      ]
    : [];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1f1f1f",
      border: "1px solid #404040",
      borderRadius: "10px",
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    },
    labelStyle: {
      color: "#e5e5e5",
      fontSize: "13px",
      fontWeight: 600 as const,
      marginBottom: "6px",
    },
    itemStyle: { color: "#d4d4d4", fontSize: "13px", padding: "2px 0" },
  };

  return (
    <DashboardLayout>
      <SkeletonTransition
        loading={showSkeleton}
        skeleton={
          <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-7 skeleton rounded w-40 mb-2" />
                <div className="h-4 skeleton rounded w-64" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 skeleton rounded-2xl w-44" />
                <div className="h-11 skeleton rounded-2xl w-24" />
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

            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="skeleton-card rounded-2xl border p-6">
                <div className="h-5 skeleton rounded w-48 mb-4" />
                <div className="flex items-center justify-center h-[220px]">
                  <div className="w-[180px] h-[180px] rounded-full border-[20px] skeleton" />
                </div>
              </div>
              <div className="skeleton-card rounded-2xl border p-6">
                <div className="h-5 skeleton rounded w-32 mb-4" />
                <div className="flex items-center justify-center h-[220px]">
                  <div className="w-[180px] h-[180px] rounded-full border-[20px] skeleton" />
                </div>
              </div>
            </div>

            {/* Budget list skeleton */}
            <div className="skeleton-card rounded-2xl border overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="h-5 skeleton rounded w-40" />
              </div>
              <div className="p-6 space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 skeleton rounded-xl" />
                        <div>
                          <div className="h-4 skeleton rounded w-24 mb-1" />
                          <div className="h-3 skeleton rounded w-32" />
                        </div>
                      </div>
                      <div className="h-5 skeleton rounded w-16" />
                    </div>
                    <div className="h-2.5 skeleton rounded-full w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ngân sách</h1>
            <p className="text-gray-500">Đặt giới hạn chi tiêu theo danh mục</p>
          </div>
          <div className="flex items-center gap-3">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#7c3aed",
                  fontFamily: "inherit",
                },
              }}
            >
              <AntDatePicker
                picker="month"
                value={dayjs(`${year}-${String(month).padStart(2, "0")}`)}
                onChange={(date) => {
                  if (date) {
                    setMonth(date.month() + 1);
                    setYear(date.year());
                  }
                }}
                format="[Tháng] M, YYYY"
                allowClear={false}
                placement="bottomRight"
                styles={{ popup: { root: { zIndex: 99999 } } }}
                className="ant-datepicker-custom !w-44"
              />
            </ConfigProvider>
            <Button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              leftIcon={showForm ? <X size={18} /> : <Plus size={18} />}
              variant={showForm ? "secondary" : "primary"}
              disabled={availableCategories.length === 0 && !editId}
            >
              {showForm ? "Đóng" : "Thêm"}
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editId ? "Sửa ngân sách" : "Thêm ngân sách mới"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Danh mục"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  options={editId ? CATEGORIES : availableCategories}
                  disabled={!!editId}
                />
                <CurrencyInput
                  label="Số tiền ngân sách"
                  value={formAmount}
                  onChange={setFormAmount}
                  required
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 mt-5">
                <Button
                  type="submit"
                  disabled={!formAmount}
                  loading={submitting}
                  leftIcon={editId ? <Pencil size={18} /> : <Plus size={18} />}
                >
                  {submitting
                    ? editId
                      ? "Đang cập nhật..."
                      : "Đang tạo..."
                    : editId
                      ? "Cập nhật"
                      : "Tạo ngân sách"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/25">
              <p className="text-primary-100 text-sm font-medium">
                Tổng ngân sách
              </p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedCurrency value={overview.totalBudget} />
              </p>
              <p className="text-primary-200 text-sm mt-1">
                {overview.categories.length} danh mục
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/25">
              <p className="text-red-100 text-sm font-medium">Đã chi</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedCurrency value={overview.totalSpent} />
              </p>
              <p className="text-red-200 text-sm mt-1">
                {overview.totalBudget > 0
                  ? `${Math.round((overview.totalSpent / overview.totalBudget) * 100)}% ngân sách`
                  : "0%"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
              <p className="text-emerald-100 text-sm font-medium">Còn lại</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedCurrency value={overview.totalRemaining} />
              </p>
              <p className="text-emerald-200 text-sm mt-1">
                {overview.totalRemaining < 0
                  ? "Đã vượt ngân sách!"
                  : "có thể chi tiêu"}
              </p>
            </div>
          </div>
        )}

        {/* Charts — Phân bổ + Tổng quan */}
        {overview && overview.categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut — phân bổ ngân sách theo danh mục */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Phân bổ ngân sách
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Tỷ lệ ngân sách theo danh mục
              </p>
              <div className="flex items-center gap-6">
                <ChartReveal delay={0.1}>
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {allocationData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartReveal>
                <div className="flex-1 space-y-2">
                  {allocationData.map((item, i) => {
                    const pct =
                      overview.totalBudget > 0
                        ? Math.round((item.value / overview.totalBudget) * 100)
                        : 0;
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-gray-600 flex-1 truncate">
                          {item.name}
                        </span>
                        <span className="font-medium text-gray-900 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Donut — tổng quan % đã dùng */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 self-start">
                Tổng quan
              </h2>
              <p className="text-sm text-gray-500 mb-4 self-start">
                Đã sử dụng ngân sách
              </p>
              <ChartReveal delay={0.2}>
                <div className="relative">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={donutSummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {donutSummary.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-3xl font-bold ${
                        overallPercentage >= 100
                          ? "text-red-500"
                          : overallPercentage >= 80
                            ? "text-amber-500"
                            : "text-emerald-500"
                      }`}
                    >
                      {overallPercentage}%
                    </span>
                    <span className="text-xs text-gray-500">đã dùng</span>
                  </div>
                </div>
              </ChartReveal>
              <div className="mt-4 w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Đã chi</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(overview.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Còn lại</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(Math.max(0, overview.totalRemaining))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Chi tiết ngân sách
            </h2>
            {overview && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Tháng {month}/{year}
              </span>
            )}
          </div>

          {!overview || overview.categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                Chưa có ngân sách nào
              </p>
              <p className="text-sm text-gray-400">
                Nhấn &quot;Thêm&quot; để đặt ngân sách cho tháng {month}/{year}
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {overview.categories.map((item) => {
                const cat = getCategoryInfo(item.category);
                const colors = getProgressColor(item.percentage);
                const clampedPercentage = Math.min(item.percentage, 100);

                return (
                  <div key={item.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm">
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {cat.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.spent)} /{" "}
                            {formatCurrency(item.budget)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {item.percentage}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-100/80 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100/80 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${clampedPercentage}%` }}
                      />
                    </div>
                    {item.percentage >= 80 && item.percentage < 100 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Sắp hết ngân sách cho {cat.label}
                      </p>
                    )}
                    {item.percentage >= 100 && (
                      <p className="text-xs text-red-600 mt-1">
                        🚨 Đã vượt ngân sách cho {cat.label}!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Xóa ngân sách"
        message="Bạn có chắc muốn xóa ngân sách này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
      </SkeletonTransition>
    </DashboardLayout>
  );
}
