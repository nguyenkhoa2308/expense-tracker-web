import { render, screen } from '@testing-library/react';
import { StatCard } from '../charts/StatCard';
import { Wallet } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value correctly', () => {
    render(<StatCard title="Tổng chi tiêu" value="5.000.000 ₫" icon={Wallet} color="blue" />);
    expect(screen.getByText('Tổng chi tiêu')).toBeInTheDocument();
    expect(screen.getByText('5.000.000 ₫')).toBeInTheDocument();
  });

  it('should display trend indicator when provided', () => {
    render(
      <StatCard
        title="Thu nhập"
        value="10.000.000 ₫"
        icon={Wallet}
        color="green"
        trend={{ value: 12, isPositive: true }}
      />
    );
    expect(screen.getByText(/12%/)).toBeInTheDocument();
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });
});
