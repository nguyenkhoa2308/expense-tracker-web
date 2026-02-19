"use client";

import { useEffect, useState, useCallback } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { recurringApi, RecurringTransaction } from "@/lib/api";
import {
  Button,
  Select,
  SelectOption,
  CurrencyInput,
  ConfirmModal,
} from "@/components/ui";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CalendarClock,
} from "lucide-react";
import { useToastStore } from "@/store";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DatePicker } from "@/components/ui";
import { SkeletonTransition } from "@/components/motion";

const EXPENSE_CATEGORIES: SelectOption[] = [
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

const INCOME_CATEGORIES: SelectOption[] = [
  { value: "salary", label: "Lương", emoji: "💰" },
  { value: "freelance", label: "Freelance", emoji: "💻" },
  { value: "investment", label: "Đầu tư", emoji: "📈" },
  { value: "bonus", label: "Thưởng", emoji: "🎁" },
  { value: "gift", label: "Quà tặng", emoji: "🎀" },
  { value: "refund", label: "Hoàn tiền", emoji: "🔄" },
  { value: "other", label: "Khác", emoji: "📦" },
];

const FREQUENCY_OPTIONS: SelectOption[] = [
  { value: "daily", label: "Hàng ngày" },
  { value: "weekly", label: "Hàng tuần" },
  { value: "monthly", label: "Hàng tháng" },
  { value: "yearly", label: "Hàng năm" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { value: "expense", label: "Chi tiêu" },
  { value: "income", label: "Thu nhập" },
];

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  yearly: "Hàng năm",
};

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formCategory, setFormCategory] = useState("food");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formNextDate, setFormNextDate] = useState<string | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toast = useToastStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recurringApi.getAll();
      setItems(res.data);
    } catch {
      console.error("Failed to fetch recurring transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories =
    formType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const getCategoryInfo = (type: string, category: string) => {
    const cats = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return (
      cats.find((c) => c.value === category) || { label: category, emoji: "📦" }
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formNextDate) return;

    setSubmitting(true);
    try {
      const data = {
        type: formType,
        amount: Number(formAmount),
        description: formDescription || undefined,
        category: formCategory,
        frequency: formFrequency as "daily" | "weekly" | "monthly" | "yearly",
        nextDate: formNextDate!,
      };

      if (editId) {
        await recurringApi.update(editId, data);
        toast.success("Cập nhật giao dịch định kỳ thành công");
      } else {
        await recurringApi.create(data);
        toast.success("Tạo giao dịch định kỳ thành công");
      }
      resetForm();
      fetchData();
    } catch {
      toast.error(
        editId ? "Không thể cập nhật" : "Không thể tạo giao dịch định kỳ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditId(item.id);
    setFormType(item.type);
    setFormCategory(item.category);
    setFormAmount(String(item.amount));
    setFormDescription(item.description || "");
    setFormFrequency(item.frequency);
    setFormNextDate(item.nextDate.split("T")[0]);
    setShowForm(true);
  };

  const [pauseId, setPauseId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    try {
      const res = await recurringApi.toggle(id);
      fetchData();
      if (res.data.isActive) {
        toast.success("Đã kích hoạt lại giao dịch định kỳ");
      } else {
        toast.success("Đã tạm dừng giao dịch định kỳ");
      }
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    } finally {
      setPauseId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await recurringApi.delete(deleteId);
      fetchData();
      toast.success("Xóa giao dịch định kỳ thành công");
    } catch {
      toast.error("Không thể xóa");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormType("expense");
    setFormCategory("food");
    setFormAmount("");
    setFormDescription("");
    setFormFrequency("monthly");
    setFormNextDate(undefined);
  };

  // When type changes, reset category to first of that type
  const handleTypeChange = (type: string) => {
    const newType = type as "expense" | "income";
    setFormType(newType);
    setFormCategory(newType === "expense" ? "food" : "salary");
  };

  const activeItems = items.filter((i) => i.isActive);
  const inactiveItems = items.filter((i) => !i.isActive);

  const totalMonthlyExpense = activeItems
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => {
      const amount = Number(i.amount);
      switch (i.frequency) {
        case "daily":
          return sum + amount * 30;
        case "weekly":
          return sum + amount * 4;
        case "monthly":
          return sum + amount;
        case "yearly":
          return sum + amount / 12;
        default:
          return sum + amount;
      }
    }, 0);

  const totalMonthlyIncome = activeItems
    .filter((i) => i.type === "income")
    .reduce((sum, i) => {
      const amount = Number(i.amount);
      switch (i.frequency) {
        case "daily":
          return sum + amount * 30;
        case "weekly":
          return sum + amount * 4;
        case "monthly":
          return sum + amount;
        case "yearly":
          return sum + amount / 12;
        default:
          return sum + amount;
      }
    }, 0);

  return (
    <DashboardLayout>
      <SkeletonTransition
        loading={showSkeleton}
        skeleton={
          <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-7 skeleton rounded w-48 mb-2" />
                <div className="h-4 skeleton rounded w-72" />
              </div>
              <div className="h-11 skeleton rounded-2xl w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card rounded-2xl p-5 border">
                  <div className="h-4 skeleton rounded w-24 mb-2" />
                  <div className="h-7 skeleton rounded w-32 mb-2" />
                  <div className="h-4 skeleton rounded w-20" />
                </div>
              ))}
            </div>
            <div className="skeleton-card rounded-2xl border overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="h-5 skeleton rounded w-48" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 skeleton rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 skeleton rounded w-32 mb-2" />
                      <div className="h-3 skeleton rounded w-48" />
                    </div>
                    <div className="h-6 skeleton rounded w-24" />
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
              <h1 className="text-2xl font-bold text-gray-900">
                Giao dịch định kỳ
              </h1>
              <p className="text-gray-500">Tự động tạo thu chi theo lịch</p>
            </div>
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
            >
              {showForm ? "Đóng" : "Thêm"}
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {editId ? "Sửa giao dịch định kỳ" : "Thêm giao dịch định kỳ"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select
                    label="Loại"
                    value={formType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    options={TYPE_OPTIONS}
                  />
                  <Select
                    label="Danh mục"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    options={categories}
                  />
                  <CurrencyInput
                    label="Số tiền"
                    value={formAmount}
                    onChange={setFormAmount}
                    required
                    placeholder="0"
                  />
                  <Select
                    label="Tần suất"
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    options={FREQUENCY_OPTIONS}
                  />
                  <DatePicker
                    label={editId ? "Ngày tiếp theo" : "Ngày bắt đầu"}
                    value={formNextDate}
                    onChange={setFormNextDate}
                    allowFuture
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      placeholder="VD: Tiền nhà hàng tháng"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button
                    type="submit"
                    disabled={!formAmount || !formNextDate}
                    loading={submitting}
                    leftIcon={
                      editId ? <Pencil size={18} /> : <Plus size={18} />
                    }
                  >
                    {submitting
                      ? editId
                        ? "Đang cập nhật..."
                        : "Đang tạo..."
                      : editId
                        ? "Cập nhật"
                        : "Tạo"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#303030] p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Chi định kỳ / tháng
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalMonthlyExpense)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {activeItems.filter((i) => i.type === "expense").length} khoản
              </p>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#303030] p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Thu định kỳ / tháng
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalMonthlyIncome)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {activeItems.filter((i) => i.type === "income").length} khoản
              </p>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#303030] p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Số dư định kỳ / tháng
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatCurrency(totalMonthlyIncome - totalMonthlyExpense)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {activeItems.length} khoản đang hoạt động
              </p>
            </div>
          </div>

          {/* Active list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Đang hoạt động
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {activeItems.length} khoản
              </span>
            </div>

            {activeItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarClock size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  Chưa có giao dịch định kỳ
                </p>
                <p className="text-sm text-gray-400">
                  Nhấn &quot;Thêm&quot; để tạo giao dịch tự động
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeItems.map((item) => {
                  const cat = getCategoryInfo(item.type, item.category);
                  const isExpense = item.type === "expense";

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center gap-4 group hover:bg-gray-50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                        {cat.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {item.description || cat.label}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isExpense
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isExpense ? "Chi" : "Thu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <RefreshCw size={12} />
                            {FREQUENCY_LABELS[item.frequency]}
                          </span>
                          <span>
                            Tiếp theo:{" "}
                            {format(new Date(item.nextDate), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <p
                        className={`font-bold text-lg flex-shrink-0 ${
                          isExpense ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(Number(item.amount))}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setPauseId(item.id)}
                          className="p-2.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                          title="Tạm dừng"
                        >
                          <ToggleRight size={22} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="Sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(item.id)}
                          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inactive list */}
          {inactiveItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-500">
                  Đã tạm dừng
                </h2>
                <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {inactiveItems.length} khoản
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {inactiveItems.map((item) => {
                  const cat = getCategoryInfo(item.type, item.category);
                  const isExpense = item.type === "expense";

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-600 truncate">
                            {item.description || cat.label}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isExpense
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isExpense ? "Chi" : "Thu"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {FREQUENCY_LABELS[item.frequency]} ·{" "}
                          {formatCurrency(Number(item.amount))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id)}
                          className="p-2.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Kích hoạt lại"
                        >
                          <ToggleLeft size={22} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(item.id)}
                          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          open={!!pauseId}
          title="Tạm dừng giao dịch định kỳ"
          message="Giao dịch sẽ không được tạo tự động cho đến khi bạn kích hoạt lại."
          confirmText="Tạm dừng"
          onConfirm={() => handleToggle(pauseId!)}
          onCancel={() => setPauseId(null)}
        />

        <ConfirmModal
          open={!!deleteId}
          title="Xóa giao dịch định kỳ"
          message="Bạn có chắc muốn xóa? Các giao dịch đã tạo trước đó sẽ không bị ảnh hưởng."
          confirmText="Xóa"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </SkeletonTransition>
    </DashboardLayout>
  );
}
