export function getProgressColor(percentage: number) {
  if (percentage >= 100)
    return { bar: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-600' };
  if (percentage >= 80)
    return { bar: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-600' };
  return {
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  };
}
