import { api, getAccessToken, setAccessToken } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ParsedTransaction {
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
  originalText: string;
}

export const aiApi = {
  // Streaming chat via SSE
  chatStream: async (message: string, onChunk: (text: string) => void, onDone: () => void) => {
    // Gọi thẳng BE, không qua Next.js rewrite vì rewrite buffer response → mất streaming
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = getAccessToken();

    let res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    // Auto-refresh token on 401
    if (res.status === 401) {
      try {
        const { data } = await api.post<{ access_token: string }>('/auth/refresh');
        setAccessToken(data.access_token);
        res = await fetch(`${baseUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.access_token}`,
          },
          body: JSON.stringify({ message }),
        });
      } catch {
        throw new Error('Session expired');
      }
    }

    if (!res.ok || !res.body) {
      throw new Error('Stream failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              onDone();
              return;
            }
            if (data.error) {
              onChunk(data.error);
              onDone();
              return;
            }
            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }
    onDone();
  },

  parse: (text: string) =>
    api.post<ParsedTransaction>('/ai/parse', { text }),

  confirmParse: (data: {
    amount: number;
    category: string;
    description?: string;
    date: string;
    type: 'expense' | 'income';
  }) => api.post('/ai/parse/confirm', data),

  getInsights: () => api.get<{ insights: string }>('/ai/insights'),

  getHistory: () =>
    api.get<{ messages: ChatMessage[] }>('/ai/history'),

  clearHistory: () => api.delete<{ success: boolean }>('/ai/history'),
};
