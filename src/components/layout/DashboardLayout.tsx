"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useNotificationStore } from "@/store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AiChat } from "../AiChat";
import { ErrorBoundary } from "../ErrorBoundary";
import { PageTransition } from "../motion";
import { Onboarding } from "../Onboarding";
import { ToastContainer } from "../Toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { connectSSE, disconnectSSE } = useNotificationStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      connectSSE();
      return () => disconnectSSE();
    }
  }, [user, connectSSE, disconnectSSE]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden animate-pulse">
        {/* Header skeleton */}
        <div className="h-16 bg-white dark:bg-[#212121] border-b border-gray-200 dark:border-[#303030] flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 skeleton rounded-lg" />
            <div className="w-36 h-9 skeleton rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8 skeleton rounded-full" />
            <div className="w-8 h-8 skeleton rounded-full" />
            <div className="w-8 h-8 skeleton rounded-full" />
          </div>
        </div>
        <div className="flex-1 flex min-h-0">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-64 bg-white dark:bg-[#212121] border-r border-gray-200 dark:border-[#303030] p-3 pt-6">
            <div className="space-y-2">
              <div className="h-11 skeleton rounded-lg" />
              <div className="h-11 skeleton rounded-lg" />
              <div className="h-11 skeleton rounded-lg" />
              <div className="h-11 skeleton rounded-lg" />
              <div className="h-11 skeleton rounded-lg" />
            </div>
          </div>
          {/* Content skeleton */}
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex justify-between">
              <div>
                <div className="h-4 skeleton rounded w-36 mb-2" />
                <div className="h-7 skeleton rounded w-52" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 skeleton rounded-lg w-24" />
                <div className="h-10 skeleton rounded-lg w-24" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card rounded-xl p-5 border">
                  <div className="h-4 skeleton rounded w-16 mb-3" />
                  <div className="h-7 skeleton rounded w-32 mb-2" />
                  <div className="h-4 skeleton rounded w-40" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 skeleton-card rounded-xl p-6 border h-80" />
              <div className="skeleton-card rounded-xl p-6 border h-80" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!user.onboarded) {
    return (
      <>
        <Onboarding />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden">
      <Header />
      <div className="flex-1 flex min-h-0">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto scrollbar-stable">
          <ErrorBoundary>
            <PageTransition>{children}</PageTransition>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
      <AiChat />
      <ToastContainer />
    </div>
  );
}
