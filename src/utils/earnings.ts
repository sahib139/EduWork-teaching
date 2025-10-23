export interface DailyRecord {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface MonthlyRecord {
  month: string; // YYYY-MM
  amount: number;
}

const DAILY_KEY = 'eduwork_daily_earnings';
const MONTHLY_KEY = 'eduwork_monthly_earnings';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getOrInitDaily(): DailyRecord {
  const today = getTodayKey();
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) {
    const rec: DailyRecord = { date: today, amount: 0 };
    localStorage.setItem(DAILY_KEY, JSON.stringify(rec));
    return rec;
  }
  try {
    const rec: DailyRecord = JSON.parse(raw);
    if (rec.date !== today) {
      const reset: DailyRecord = { date: today, amount: 0 };
      localStorage.setItem(DAILY_KEY, JSON.stringify(reset));
      return reset;
    }
    return rec;
  } catch {
    const rec: DailyRecord = { date: today, amount: 0 };
    localStorage.setItem(DAILY_KEY, JSON.stringify(rec));
    return rec;
  }
}

export function getOrInitMonthly(): MonthlyRecord {
  const month = getMonthKey();
  const raw = localStorage.getItem(MONTHLY_KEY);
  if (!raw) {
    const rec: MonthlyRecord = { month, amount: 0 };
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(rec));
    return rec;
  }
  try {
    const rec: MonthlyRecord = JSON.parse(raw);
    if (rec.month !== month) {
      const reset: MonthlyRecord = { month, amount: 0 };
      localStorage.setItem(MONTHLY_KEY, JSON.stringify(reset));
      return reset;
    }
    return rec;
  } catch {
    const rec: MonthlyRecord = { month, amount: 0 };
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(rec));
    return rec;
  }
}

export function getDailyEarnings(): number {
  return getOrInitDaily().amount;
}

export function getMonthlyEarnings(): number {
  return getOrInitMonthly().amount;
}

/**
 * Sets today earnings and adjusts this month accordingly.
 * If today earnings increases later (e.g., from 130 to 167),
 * diffs are added to the monthly total.
 */
export function setTodayEarnings(newAmount: number): void {
  const daily = getOrInitDaily();
  const delta = newAmount - daily.amount;
  const updatedDaily: DailyRecord = { date: daily.date, amount: newAmount };
  localStorage.setItem(DAILY_KEY, JSON.stringify(updatedDaily));

  const monthly = getOrInitMonthly();
  const updatedMonthly: MonthlyRecord = { month: monthly.month, amount: monthly.amount + delta };
  localStorage.setItem(MONTHLY_KEY, JSON.stringify(updatedMonthly));
}


