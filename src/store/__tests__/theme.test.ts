import { useThemeStore } from '../theme';

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useThemeStore.setState({ theme: 'light' });
  });

  it('should default to light theme', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('light');
  });

  it('should switch to dark theme and persist to localStorage', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
