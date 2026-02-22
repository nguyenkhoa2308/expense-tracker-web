'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore, useToastStore } from '@/store';
import { authApi, emailSyncApi, recurringApi } from '@/lib/api';
import {
  Loader2, Shield, Bell, Mail, RefreshCw, Check, X, User,
  CreditCard, Pencil, Lock, Save, CalendarClock,
} from 'lucide-react';
import { Input, Button, Switch, CurrencyInput, ConfirmModal } from '@/components/ui';

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { user, checkAuth, setUser } = useAuthStore();
  const { success, error: toastError } = useToastStore();
  const searchParams = useSearchParams();

  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileSalary, setProfileSalary] = useState(user?.salary ? String(user.salary) : '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Recurring income suggestion
  const [showRecurringSuggestion, setShowRecurringSuggestion] = useState(false);
  const [salaryForRecurring, setSalaryForRecurring] = useState(0);
  const [creatingRecurring, setCreatingRecurring] = useState(false);

  // Recurring income removal suggestion
  const [showRemoveRecurring, setShowRemoveRecurring] = useState(false);
  const [salaryRecurringId, setSalaryRecurringId] = useState<string | null>(null);
  const [removingRecurring, setRemovingRecurring] = useState(false);

  // Gmail disconnect confirm
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Change password
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification toggles (localStorage)
  const [emailNotif, setEmailNotif] = useState(true);
  const [syncAlerts, setSyncAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  useEffect(() => {
    setEmailNotif(localStorage.getItem('notif_email') !== 'false');
    setSyncAlerts(localStorage.getItem('notif_sync') !== 'false');
    setBudgetAlerts(localStorage.getItem('notif_budget') !== 'false');
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileSalary(user.salary ? String(user.salary) : '');
    }
  }, [user]);

  useEffect(() => {
    const gmailStatus = searchParams.get('gmail');
    if (gmailStatus === 'connected') {
      setMessage({ type: 'success', text: 'Kết nối Gmail thành công!' });
      checkAuth();
    } else if (gmailStatus === 'error') {
      setMessage({ type: 'error', text: 'Không thể kết nối Gmail. Vui lòng thử lại.' });
    }
  }, [searchParams, checkAuth]);

  const handleConnectGmail = async () => {
    try {
      const res = await emailSyncApi.getGmailAuthUrl();
      window.location.href = res.data.url;
    } catch {
      setMessage({ type: 'error', text: 'Không thể lấy URL đăng nhập Gmail' });
    }
  };

  const handleDisconnectGmail = async () => {
    setShowDisconnectConfirm(false);
    try {
      await emailSyncApi.disconnectGmail();
      success('Đã ngắt kết nối Gmail');
      checkAuth();
    } catch {
      toastError('Không thể ngắt kết nối Gmail');
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await emailSyncApi.manualSync();
      success(`Đã đồng bộ ${res.data.synced} giao dịch từ email`);
    } catch {
      toastError('Không thể đồng bộ email');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const salaryNum = parseInt(profileSalary.replace(/\D/g, '')) || 0;
      const previousSalary = user?.salary || 0;
      const { data } = await authApi.updateProfile({
        name: profileName || undefined,
        salary: salaryNum > 0 ? salaryNum : 0,
      });
      setUser(data);
      setEditingProfile(false);
      success('Đã cập nhật hồ sơ');

      // Suggest creating recurring income if salary was set/changed
      if (salaryNum > 0 && salaryNum !== previousSalary) {
        setSalaryForRecurring(salaryNum);
        setShowRecurringSuggestion(true);
      }

      // Suggest removing recurring income if salary was cleared
      if (salaryNum === 0 && previousSalary > 0) {
        try {
          const { data: recurrings } = await recurringApi.getAll();
          const salaryRecurring = recurrings.find(
            (r) => r.type === 'income' && r.category === 'salary' && r.isActive
          );
          if (salaryRecurring) {
            setSalaryRecurringId(salaryRecurring.id);
            setShowRemoveRecurring(true);
          }
        } catch {
          // silently ignore — not critical
        }
      }
    } catch {
      toastError('Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateRecurringIncome = async () => {
    setCreatingRecurring(true);
    try {
      const now = new Date();
      // Ngày 1 tháng sau (hoặc tháng sau nữa nếu hôm nay đã là ngày 1)
      const next = now.getDate() > 1
        ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      await recurringApi.create({
        type: 'income',
        amount: salaryForRecurring,
        description: 'Lương hàng tháng',
        category: 'salary',
        frequency: 'monthly',
        nextDate: `${yyyy}-${mm}-${dd}`,
      });
      success('Đã tạo thu nhập định kỳ cho lương');
      setShowRecurringSuggestion(false);
    } catch {
      toastError('Không thể tạo thu nhập định kỳ');
    } finally {
      setCreatingRecurring(false);
    }
  };

  const handleRemoveRecurringIncome = async () => {
    if (!salaryRecurringId) return;
    setRemovingRecurring(true);
    try {
      await recurringApi.delete(salaryRecurringId);
      success('Đã xoá thu nhập định kỳ lương');
      setShowRemoveRecurring(false);
      setSalaryRecurringId(null);
    } catch {
      toastError('Không thể xoá thu nhập định kỳ');
    } finally {
      setRemovingRecurring(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toastError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Đổi mật khẩu thành công');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg || 'Không thể đổi mật khẩu');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleNotif = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
          <p className="text-gray-500 dark:text-gray-400">Quản lý tài khoản và tùy chỉnh</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
            <span>{message.text}</span>
            <button type="button" title="Đóng" onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Recurring income suggestion */}
        {showRecurringSuggestion && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarClock size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300">
                  Tạo thu nhập định kỳ?
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Bạn muốn tạo thu nhập định kỳ{' '}
                  <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salaryForRecurring)}</strong>
                  /tháng không? Hệ thống sẽ tự động ghi nhận lương vào đầu mỗi tháng.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleCreateRecurringIncome} loading={creatingRecurring}
                    leftIcon={!creatingRecurring ? <Check size={14} /> : undefined}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
                  >
                    Tạo định kỳ
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRecurringSuggestion(false)}>
                    Bỏ qua
                  </Button>
                </div>
              </div>
              <button type="button" title="Đóng" onClick={() => setShowRecurringSuggestion(false)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 rounded text-emerald-600 dark:text-emerald-400">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Remove recurring income suggestion */}
        {showRemoveRecurring && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarClock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-amber-800 dark:text-amber-300">
                  Xoá thu nhập định kỳ lương?
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  Bạn đã xoá lương hàng tháng. Bạn có muốn xoá luôn thu nhập định kỳ lương không?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="danger" onClick={handleRemoveRecurringIncome} loading={removingRecurring}>
                    Xoá định kỳ
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRemoveRecurring(false)}>
                    Giữ lại
                  </Button>
                </div>
              </div>
              <button type="button" title="Đóng" onClick={() => setShowRemoveRecurring(false)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800/40 rounded text-amber-600 dark:text-amber-400">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <User className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Hồ sơ</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Thông tin tài khoản của bạn</p>
                  </div>
                </div>
                {!editingProfile && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)} leftIcon={<Pencil size={14} />}>
                    Sửa
                  </Button>
                )}
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <Input
                    label="Họ và tên"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                  <CurrencyInput
                    label="Lương hàng tháng"
                    value={profileSalary}
                    onChange={setProfileSalary}
                    placeholder="VD: 15.000.000"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditingProfile(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} loading={savingProfile} leftIcon={!savingProfile ? <Save size={14} /> : undefined}>
                      Lưu
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#303030]">
                    <span className="text-gray-600 dark:text-gray-400">Tên</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user?.name || 'Chưa đặt'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#303030]">
                    <span className="text-gray-600 dark:text-gray-400">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#303030]">
                    <span className="text-gray-600 dark:text-gray-400">Lương tháng</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user?.salary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.salary) : 'Chưa đặt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 dark:text-gray-400">Vai trò</span>
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
                      {user?.role || 'USER'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Lock className="text-amber-600 dark:text-amber-400" size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Mật khẩu</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đổi mật khẩu đăng nhập</p>
                  </div>
                </div>
                {!changingPassword && (
                  <Button variant="ghost" size="sm" onClick={() => setChangingPassword(true)} leftIcon={<Pencil size={14} />}>
                    Đổi
                  </Button>
                )}
              </div>

              {changingPassword ? (
                <div className="space-y-4">
                  <Input
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    hint="Tối thiểu 6 ký tự"
                  />
                  <Input
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword && newPassword !== confirmPassword ? 'Mật khẩu không khớp' : undefined}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" size="sm" onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleChangePassword}
                      loading={savingPassword}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bấm &quot;Đổi&quot; để thay đổi mật khẩu đăng nhập.
                </p>
              )}
            </div>

            {/* Gmail Integration */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Mail className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Kết nối Gmail</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tự động đọc email ngân hàng và tạo giao dịch
                  </p>
                </div>
              </div>

              {user?.gmailConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl">
                    <Check size={18} />
                    <span className="font-medium">Đã kết nối Gmail</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleManualSync} loading={syncing} leftIcon={!syncing ? <RefreshCw size={16} /> : undefined}>
                      {syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDisconnectConfirm(true)}>
                      Ngắt kết nối
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hệ thống tự đồng bộ mỗi 5 phút. Bạn cũng có thể đồng bộ thủ công.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Kết nối Gmail để tự động đọc thông báo ngân hàng (VCB, TCB, MB, ACB...) và tạo chi tiêu tự động.
                  </p>
                  <Button onClick={handleConnectGmail} leftIcon={<Mail size={16} />} variant="danger">
                    Kết nối Gmail
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chúng tôi chỉ đọc email ngân hàng, không đọc email cá nhân.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trạng thái</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    user?.gmailConnected ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-[#303030] text-gray-400'
                  }`}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Gmail</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.gmailConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Bảo mật</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email đã xác minh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Banks */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Ngân hàng hỗ trợ</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Vietcombank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank', 'TPBank', 'BIDV', 'Agribank'].map((bank) => (
                  <span key={bank} className="px-2.5 py-1 bg-gray-100 dark:bg-[#303030] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                    {bank}
                  </span>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-[#212121] rounded-xl shadow-sm border border-gray-100 dark:border-[#303030] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
              </div>
              <div className="space-y-4">
                <Switch
                  label="Thông báo email"
                  checked={emailNotif}
                  onChange={(e) => toggleNotif('notif_email', e.target.checked, setEmailNotif)}
                />
                <Switch
                  label="Cảnh báo đồng bộ"
                  checked={syncAlerts}
                  onChange={(e) => toggleNotif('notif_sync', e.target.checked, setSyncAlerts)}
                />
                <Switch
                  label="Cảnh báo ngân sách"
                  checked={budgetAlerts}
                  onChange={(e) => toggleNotif('notif_budget', e.target.checked, setBudgetAlerts)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showDisconnectConfirm}
        title="Ngắt kết nối Gmail"
        message="Bạn có chắc muốn ngắt kết nối Gmail? Hệ thống sẽ không tự động đồng bộ giao dịch từ email nữa."
        confirmText="Ngắt kết nối"
        onConfirm={handleDisconnectGmail}
        onCancel={() => setShowDisconnectConfirm(false)}
      />
    </DashboardLayout>
  );
}
