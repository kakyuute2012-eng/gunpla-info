export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const grid: (Date | null)[] = [];

  // Fill leading nulls
  for (let i = 0; i < startDayOfWeek; i++) {
    grid.push(null);
  }

  // Fill days
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month - 1, d));
  }

  return grid;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}
