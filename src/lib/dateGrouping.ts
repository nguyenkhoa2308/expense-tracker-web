import {
  isToday,
  isYesterday,
  isThisWeek,
  startOfWeek,
  endOfWeek,
  subWeeks,
  isWithinInterval,
  isThisMonth,
  format,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';

export interface DateGroup<T> {
  label: string;
  dateKey: string;
  items: T[];
}

export function groupTransactionsByDate<T extends { date: string }>(
  items: T[]
): DateGroup<T>[] {
  const groups: DateGroup<T>[] = [];
  const groupMap = new Map<string, DateGroup<T>>();

  const now = new Date();
  const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  for (const item of items) {
    const date = parseISO(item.date);
    let label: string;
    let dateKey: string;

    if (isToday(date)) {
      label = 'Hôm nay';
      dateKey = 'today';
    } else if (isYesterday(date)) {
      label = 'Hôm qua';
      dateKey = 'yesterday';
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      label = format(date, 'EEEE, dd/MM', { locale: vi });
      label = label.charAt(0).toUpperCase() + label.slice(1);
      dateKey = `thisweek-${format(date, 'yyyy-MM-dd')}`;
    } else if (isWithinInterval(date, { start: prevWeekStart, end: prevWeekEnd })) {
      label = 'Tuần trước';
      dateKey = 'lastweek';
    } else if (isThisMonth(date)) {
      label = 'Tháng này';
      dateKey = 'thismonth';
    } else {
      label = `Tháng ${format(date, 'MM/yyyy')}`;
      dateKey = `month-${format(date, 'yyyy-MM')}`;
    }

    const existing = groupMap.get(dateKey);
    if (existing) {
      existing.items.push(item);
    } else {
      const group: DateGroup<T> = { label, dateKey, items: [item] };
      groupMap.set(dateKey, group);
      groups.push(group);
    }
  }

  return groups;
}
