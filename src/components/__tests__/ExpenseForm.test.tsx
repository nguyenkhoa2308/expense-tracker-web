import { render, screen } from '@testing-library/react';
import { ExpenseForm } from '../ExpenseForm';

// Mock the API module
vi.mock('@/lib/api', () => ({
  expenseApi: { create: vi.fn() },
}));

describe('ExpenseForm', () => {
  it('should render form with required fields', () => {
    render(<ExpenseForm onSuccess={vi.fn()} />);
    expect(screen.getByText('Thêm chi tiêu mới')).toBeInTheDocument();
    expect(screen.getByText('Số tiền')).toBeInTheDocument();
    expect(screen.getByText('Danh mục')).toBeInTheDocument();
  });

  it('should disable submit button when amount is empty', () => {
    render(<ExpenseForm onSuccess={vi.fn()} />);
    const submitButton = screen.getByRole('button', { name: /Thêm chi tiêu/i });
    expect(submitButton).toBeDisabled();
  });
});
