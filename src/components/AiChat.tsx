'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X, Send, Sparkles, Trash2, Zap, Check, XIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { aiApi, ChatMessage, ParsedTransaction } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store';

const EXPENSE_CATEGORIES: Record<string, string> = {
  food: 'Ăn uống', transport: 'Di chuyển', shopping: 'Mua sắm',
  entertainment: 'Giải trí', bills: 'Hóa đơn', health: 'Sức khỏe',
  education: 'Học tập', transfer: 'Chuyển khoản', other: 'Khác',
};
const INCOME_CATEGORIES: Record<string, string> = {
  salary: 'Lương', freelance: 'Freelance', investment: 'Đầu tư',
  bonus: 'Thưởng', gift: 'Quà tặng', refund: 'Hoàn tiền', other: 'Khác',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const CHART_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

// Parse AI message for category data (e.g. "- Ăn uống: 2.000.000 ₫ (45%)")
function extractChartData(text: string): { name: string; value: number }[] {
  const lines = text.split('\n');
  const data: { name: string; value: number }[] = [];

  for (const line of lines) {
    // Match patterns like: "- Ăn uống: 2.000.000 ₫ (45%)" or "- **Ăn uống** (45%)" or "- Ăn uống (45%)"
    const match = line.match(/[-•]\s*\*{0,2}([^*:(\n]+?)\*{0,2}\s*(?::[^(]*?)?\((\d+(?:[.,]\d+)?)%\)/);
    if (match) {
      const name = match[1].trim();
      const value = parseFloat(match[2].replace(',', '.'));
      if (value > 0 && name.length > 1 && name.length < 30) {
        data.push({ name, value });
      }
    }
  }

  return data.length >= 2 ? data : [];
}

function MiniChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="mt-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-3 border border-gray-100 dark:border-[#303030]">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {data.map((item, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Detect if text looks like a transaction (has amount pattern)
function looksLikeTransaction(text: string): boolean {
  // Match patterns like: 45k, 50K, 1tr, 2TR, 100đ, 200.000, 1,500,000, 100 nghìn, 2 triệu, 1 củ
  return /\d+\s*(k|K|tr|TR|đ|Đ|nghìn|nghin|triệu|trieu|củ|cu)\b/.test(text)
    || /\d{2,3}([.,]\d{3})+/.test(text);
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null);
  const [parsing, setParsing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const toast = useToastStore();

  const scrollToBottom = (instant = false) => {
    if (instant && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(true), 50);
    }
  }, [isOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const loadHistory = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const res = await aiApi.getHistory();
      if (res.data.messages?.length > 0) {
        setMessages(res.data.messages);
      }
    } catch {
      // Failed to load history
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadInsights = useCallback(async () => {
    if (messages.length > 0) return;

    setLoading(true);
    try {
      const res = await aiApi.getInsights();
      setMessages([{ role: 'assistant', content: res.data.insights }]);
    } catch {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI giúp bạn quản lý chi tiêu. Hãy hỏi tôi bất cứ điều gì!',
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !loading) {
      loadInsights();
    }
  }, [isOpen, messages.length, loading, loadInsights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    // Auto-detect transaction and parse instead of chat
    if (looksLikeTransaction(userMessage)) {
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      setParsing(true);
      try {
        const res = await aiApi.parse(userMessage);
        setParsedTx(res.data);
      } catch {
        toast.error('Không thể phân tích giao dịch');
      } finally {
        setParsing(false);
      }
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setStreamingContent('');

    try {
      let accumulated = '';
      await aiApi.chatStream(
        userMessage,
        (chunk) => {
          accumulated += chunk;
          setStreamingContent(accumulated);
        },
        () => {
          setMessages((prev) => [...prev, { role: 'assistant', content: accumulated }]);
          setStreamingContent('');
          setLoading(false);
        },
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.' },
      ]);
      setStreamingContent('');
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!input.trim() || parsing) return;
    const text = input.trim();
    setParsing(true);

    try {
      const res = await aiApi.parse(text);
      setParsedTx(res.data);
      setInput('');
    } catch {
      toast.error('Không thể phân tích văn bản');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmParse = async () => {
    if (!parsedTx || confirming) return;
    setConfirming(true);

    try {
      await aiApi.confirmParse({
        amount: parsedTx.amount,
        category: parsedTx.category,
        description: parsedTx.description,
        date: parsedTx.date,
        type: parsedTx.type,
      });
      toast.success(`Đã lưu ${parsedTx.type === 'income' ? 'thu nhập' : 'chi tiêu'}: ${formatCurrency(parsedTx.amount)}`);
      setParsedTx(null);
      // Notify other pages to refresh data
      window.dispatchEvent(new CustomEvent('transaction-created'));
    } catch {
      toast.error('Không thể lưu giao dịch');
    } finally {
      setConfirming(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiApi.clearHistory();
      setMessages([]);
      setTimeout(() => loadInsights(), 100);
    } catch {
      // ignore
    }
  };

  const suggestedQuestions = [
    'Tôi chi tiêu nhiều nhất vào gì?',
    'Làm sao để tiết kiệm hơn?',
    'Phân tích chi tiêu tháng này',
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-2xl z-50',
          'bg-gradient-to-br from-primary-500 to-primary-600',
          'text-white shadow-lg shadow-primary-500/30',
          'hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105',
          'active:scale-95',
          'transition-all duration-200',
          'flex items-center justify-center',
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        )}
        title="Mở trợ lý AI"
      >
        <Sparkles size={24} />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-[#1a1a1a] z-50 flex flex-col',
          'shadow-2xl border-l border-gray-200/50 dark:border-[#303030]',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Trợ lý AI</h3>
              <p className="text-xs text-white/70">Hỏi hoặc nhập giao dịch</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2.5 hover:bg-white/20 hover:!text-red-400 hover:scale-110 rounded-xl transition-all"
              title="Xóa lịch sử chat"
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 dark:bg-[#121212]">
          {messages.map((msg, i) => {
            const chartData = msg.role === 'assistant' ? extractChartData(msg.content) : [];
            return (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md shadow-sm'
                      : 'bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-[#303030]'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  {chartData.length > 0 && <MiniChart data={chartData} />}
                </div>
              </div>
            );
          })}

          {/* Streaming response */}
          {streamingContent && (() => {
            const streamChartData = extractChartData(streamingContent);
            return (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-[#303030]">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {streamingContent}
                    <span className="inline-block w-1.5 h-4 bg-primary-500 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                  </p>
                  {streamChartData.length > 0 && <MiniChart data={streamChartData} />}
                </div>
              </div>
            );
          })()}

          {loading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#252525] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-[#303030]">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary-500" />
                  <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Transaction Preview */}
          {parsedTx && (
            <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm border border-primary-200 dark:border-primary-800">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-3">Xác nhận giao dịch</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Loại</span>
                  <span className={cn('font-semibold', parsedTx.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                    {parsedTx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Số tiền</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(parsedTx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Danh mục</span>
                  <span className="text-gray-900 dark:text-white">
                    {(parsedTx.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[parsedTx.category] || parsedTx.category}
                  </span>
                </div>
                {parsedTx.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Mô tả</span>
                    <span className="text-gray-900 dark:text-white">{parsedTx.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ngày</span>
                  <span className="text-gray-900 dark:text-white">{parsedTx.date}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleConfirmParse}
                  disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {confirming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setParsedTx(null)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-[#303030] hover:bg-gray-200 dark:hover:bg-[#404040] text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition"
                >
                  <XIcon size={14} />
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length <= 1 && !loading && !parsedTx && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Gợi ý:
              </p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(q)}
                  className={cn(
                    'block w-full text-left text-sm px-4 py-3',
                    'bg-white dark:bg-[#252525] hover:bg-primary-50 dark:hover:bg-primary-900/20',
                    'rounded-xl text-gray-700 dark:text-gray-300 transition-all duration-150',
                    'border border-gray-100 dark:border-[#303030] hover:border-primary-200 dark:hover:border-primary-700',
                    'hover:text-primary-700 dark:hover:text-primary-400'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-100 dark:border-[#303030] bg-white dark:bg-[#1a1a1a] shrink-0"
        >
          <div className="relative flex items-center gap-2">
            <div
              className={cn(
                'absolute -inset-0.5 rounded-2xl opacity-0 blur transition-all duration-300',
                isFocused && 'opacity-100 bg-primary-400/20'
              )}
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder='Hỏi hoặc nhập "Ăn phở 45k"...'
                className={cn(
                  'w-full px-4 py-3 text-sm text-gray-800 dark:text-gray-100 font-medium rounded-2xl',
                  'bg-white dark:bg-[#252525] border-2 border-gray-200 dark:border-[#404040]',
                  'placeholder:text-gray-400 placeholder:font-normal',
                  'hover:border-gray-300 dark:hover:border-[#505050]',
                  'focus:outline-none focus:bg-white dark:focus:bg-[#252525] focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10',
                  'transition-all duration-200',
                  'disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-[#1a1a1a]'
                )}
                disabled={loading || parsing}
              />
            </div>
            {/* Quick parse button */}
            <button
              type="button"
              onClick={handleParse}
              disabled={loading || parsing || !input.trim()}
              className={cn(
                'relative p-3 rounded-2xl transition-all duration-200',
                'bg-gradient-to-br from-amber-500 to-orange-500',
                'text-white shadow-md shadow-amber-500/25',
                'hover:shadow-lg hover:shadow-amber-500/30',
                'active:scale-95',
                'disabled:opacity-50 disabled:active:scale-100'
              )}
              title="Nhập nhanh giao dịch"
            >
              {parsing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={cn(
                'relative p-3 rounded-2xl transition-all duration-200',
                'bg-gradient-to-br from-primary-500 to-primary-600',
                'text-white shadow-md shadow-primary-500/25',
                'hover:shadow-lg hover:shadow-primary-500/30',
                'active:scale-95',
                'disabled:opacity-50 disabled:active:scale-100'
              )}
              title="Gửi"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
