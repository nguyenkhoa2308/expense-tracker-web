"use client";

import { useState } from "react";
import { User, Wallet, PiggyBank, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { useAuthStore, useToastStore } from "@/store";
import { cn } from "@/lib/utils";
import { Input, Button, CurrencyInput } from "@/components/ui";

const BUDGET_CATEGORIES = [
  { key: "food", label: "Ăn uống", emoji: "🍜" },
  { key: "transport", label: "Di chuyển", emoji: "🚗" },
  { key: "entertainment", label: "Giải trí", emoji: "🎮" },
];

const STEPS = [
  { title: "Thông tin cá nhân", icon: User },
  { title: "Thu nhập hàng tháng", icon: Wallet },
  { title: "Ngân sách cơ bản", icon: PiggyBank },
];

export function Onboarding() {
  const { user, setUser } = useAuthStore();
  const { success } = useToastStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [salary, setSalary] = useState("");
  const [budgets, setBudgets] = useState<Record<string, string>>({
    food: "",
    transport: "",
    entertainment: "",
  });

  const handleComplete = async () => {
    setSaving(true);
    try {
      const salaryNum = parseInt(salary.replace(/\D/g, "")) || 0;
      const budgetData = Object.entries(budgets)
        .filter(([, v]) => v && parseInt(v.replace(/\D/g, "")) > 0)
        .map(([category, amount]) => ({
          category,
          amount: parseInt(amount.replace(/\D/g, "")),
        }));

      const { data } = await authApi.completeOnboarding({
        name: name || undefined,
        salary: salaryNum || undefined,
        budgets: budgetData.length > 0 ? budgetData : undefined,
      });
      setUser(data);
      success("Thiết lập hoàn tất! Chào mừng bạn đến với Expense Tracker");
    } catch {
      useToastStore.getState().error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const { data } = await authApi.completeOnboarding({});
      setUser(data);
    } catch {
      useToastStore.getState().error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f0f0f] dark:to-[#1a1a1a] p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            <Sparkles size={16} />
            Chào mừng bạn!
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thiết lập tài khoản
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Chỉ mất 1 phút để bắt đầu quản lý chi tiêu
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                i === step && "bg-primary-500 text-white shadow-md",
                i < step && "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 cursor-pointer",
                i > step && "bg-gray-100 dark:bg-[#252525] text-gray-400 dark:text-gray-500",
              )}
            >
              {i < step ? <Check size={14} /> : <s.icon size={14} />}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-xl border border-gray-200 dark:border-[#303030] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Name */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                      <User size={28} className="text-primary-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Bạn tên gì?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Tên hiển thị trên ứng dụng
                    </p>
                  </div>
                  <Input
                    label="Họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
              )}

              {/* Step 2: Salary */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                      <Wallet size={28} className="text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Thu nhập hàng tháng
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Giúp AI phân tích tỉ lệ chi tiêu/thu nhập
                    </p>
                  </div>
                  <CurrencyInput
                    label="Lương tháng"
                    value={salary}
                    onChange={setSalary}
                    placeholder="VD: 15.000.000"
                  />
                </div>
              )}

              {/* Step 3: Budgets */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                      <PiggyBank size={28} className="text-amber-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ngân sách tháng này
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Đặt giới hạn chi tiêu cho 3 danh mục chính
                    </p>
                  </div>
                  <div className="space-y-3">
                    {BUDGET_CATEGORIES.map((cat) => (
                      <CurrencyInput
                        key={cat.key}
                        label={`${cat.emoji} ${cat.label}`}
                        value={budgets[cat.key]}
                        onChange={(v) => setBudgets((prev) => ({ ...prev, [cat.key]: v }))}
                        placeholder="VD: 3.000.000"
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft size={16} />}
              >
                Quay lại
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip} disabled={saving}>
                Bỏ qua
              </Button>
            )}

            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight size={16} />}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                loading={saving}
                rightIcon={!saving ? <Check size={16} /> : undefined}
              >
                Hoàn tất
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
