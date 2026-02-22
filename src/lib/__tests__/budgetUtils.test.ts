import { getProgressColor } from '../budgetUtils';

describe('getProgressColor', () => {
  it('should return emerald (green) for percentage below 60%', () => {
    const result = getProgressColor(45);
    expect(result.bar).toBe('bg-emerald-500');
    expect(result.bg).toBe('bg-emerald-100');
    expect(result.text).toBe('text-emerald-600');
  });

  it('should return red for percentage >= 100%', () => {
    const result = getProgressColor(105);
    expect(result.bar).toBe('bg-red-500');
    expect(result.bg).toBe('bg-red-100');
    expect(result.text).toBe('text-red-600');
  });
});
