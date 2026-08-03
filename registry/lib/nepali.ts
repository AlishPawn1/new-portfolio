import DateConverter from "@remotemerge/nepali-date-converter";

const BS_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export type BsDate = { year: number; month: number; date: number };

export function adToBs(isoDate: string): BsDate | null {
  try {
    const bs = new DateConverter(isoDate).toBs();
    return { year: bs.year, month: bs.month, date: bs.date };
  } catch {
    return null;
  }
}

export function bsToAd(bs: BsDate): string | null {
  try {
    const ad = new DateConverter(
      `${bs.year}-${String(bs.month).padStart(2, "0")}-${String(
        bs.date,
      ).padStart(2, "0")}`,
    ).toAd();
    return `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(
      ad.date,
    ).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

export function bsDaysInMonth(year: number, month: number): number {
  const start = bsToAd({ year, month, date: 1 });
  const next =
    month === 12
      ? { year: year + 1, month: 1, date: 1 }
      : { year, month: month + 1, date: 1 };
  const nextAd = bsToAd(next);
  if (!start || !nextAd) return 30;
  const diff =
    (new Date(`${nextAd}T00:00:00Z`).getTime() -
      new Date(`${start}T00:00:00Z`).getTime()) /
    86400000;
  return Math.round(diff);
}

export function bsWeekdayOffset(year: number, month: number): number {
  const start = bsToAd({ year, month, date: 1 });
  if (!start) return 0;
  return new Date(`${start}T00:00:00Z`).getUTCDay();
}

export function bsMonthName(month: number): string {
  return BS_MONTHS[(month - 1 + 12) % 12] ?? "";
}

export function formatBsDate(isoDate: string): string {
  const bs = adToBs(isoDate);
  if (!bs) return isoDate;
  return `${bs.year} ${bsMonthName(bs.month)} ${bs.date}`;
}
