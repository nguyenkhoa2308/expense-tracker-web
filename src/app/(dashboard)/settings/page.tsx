'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store';
import { emailSyncApi } from '@/lib/api';
import { Loader2, Shield, Bell, Mail, RefreshCw, Check, X, User, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui';

export default function SettingsPage() {
  const { user, checkAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const gmailStatus = searchParams.get('gmail');
    if (gmailStatus === 'connected') {
      setMessage({ type: 'success', text: 'Gmail connected successfully!' });
      checkAuth();
    } else if (gmailStatus === 'error') {
      setMessage({
        type: 'error',
        text: 'Could not connect Gmail. Please try again.',
      });
    }
  }, [searchParams, checkAuth]);

  const handleConnectGmail = async () => {
    try {
      const res = await emailSyncApi.getGmailAuthUrl();
      window.location.href = res.data.url;
    } catch {
      setMessage({ type: 'error', text: 'Could not get Gmail login URL' });
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect Gmail?')) return;

    try {
      await emailSyncApi.disconnectGmail();
      setMessage({ type: 'success', text: 'Gmail disconnected' });
      checkAuth();
    } catch {
      setMessage({ type: 'error', text: 'Could not disconnect Gmail' });
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await emailSyncApi.manualSync();
      setMessage({
        type: 'success',
        text: `Synced ${res.data.synced} transactions from email`,
      });
    } catch {
      setMessage({ type: 'error', text: 'Could not sync emails' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )}
            <span>{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="ml-auto p-1 hover:bg-white/50 rounded"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="text-primary-600" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Profile</h2>
                  <p className="text-sm text-gray-500">Your account information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">
                    {user?.name || 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Role</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {user?.role || 'USER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gmail Integration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Mail className="text-red-600" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Gmail Integration</h2>
                  <p className="text-sm text-gray-500">
                    Auto-read bank emails and create expenses
                  </p>
                </div>
              </div>

              {user?.gmailConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                    <Check size={18} />
                    <span className="font-medium">Gmail Connected</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={syncing}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {syncing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                      {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnectGmail}
                      className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Disconnect
                    </button>
                  </div>

                  <p className="text-sm text-gray-500">
                    System auto-syncs every 5 minutes. You can also sync manually.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Connect Gmail to auto-read bank notifications (VCB, TCB, MB,
                    ACB...) and create expenses automatically.
                  </p>

                  <button
                    type="button"
                    onClick={handleConnectGmail}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Mail size={18} />
                    Connect Gmail
                  </button>

                  <p className="text-sm text-gray-500">
                    We only read bank emails, not other personal emails.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      user?.gmailConnected
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Gmail</p>
                    <p className="text-xs text-gray-500">
                      {user?.gmailConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Security</p>
                    <p className="text-xs text-gray-500">Email verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Banks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Supported Banks</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Vietcombank',
                  'Techcombank',
                  'MB Bank',
                  'ACB',
                  'VPBank',
                  'TPBank',
                  'BIDV',
                  'Agribank',
                ].map((bank) => (
                  <span
                    key={bank}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="space-y-4">
                <Switch label="Email notifications" defaultChecked />
                <Switch label="Sync alerts" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
