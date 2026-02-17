'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Input, Button } from '@/components/ui';
import { Mail, Lock, User, Wallet } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#181818] dark:via-[#1a1a1a] dark:to-[#181818]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Don't render form if user is authenticated (will redirect)
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name || undefined);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#181818] dark:via-[#1a1a1a] dark:to-[#181818] px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Bắt đầu quản lý chi tiêu thông minh</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-[#333]">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Họ tên"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              leftIcon={<User size={18} />}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              leftIcon={<Mail size={18} />}
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
              leftIcon={<Lock size={18} />}
              hint="Mật khẩu cần có ít nhất 6 ký tự"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
          Quản lý chi tiêu thông minh
        </p>
      </div>
    </div>
  );
}
