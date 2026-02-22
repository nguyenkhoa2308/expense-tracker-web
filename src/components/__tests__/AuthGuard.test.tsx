import { render, screen } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuthStore = vi.fn();
vi.mock('@/store', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /login when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      checkAuth: vi.fn(),
    });

    render(<AuthGuard><div>Protected Content</div></AuthGuard>);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should render children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: '1', email: 'test@test.com', role: 'USER' },
      isLoading: false,
      checkAuth: vi.fn(),
    });

    render(<AuthGuard><div>Protected Content</div></AuthGuard>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
