/**
 * Vietnamese Lunar Calendar Engine (Hồ Ngọc Đức algorithm)
 * Timezone: Asia/Ho_Chi_Minh (UTC+7)
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}

export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

const PI = Math.PI;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd;
  }
  d = Math.floor((4 * c + 3) / 1461);
  e = c - Math.floor((1461 * d) / 4);
  m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

function getNewMoonDay(k: number, timezone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const Jd = Jd1 + C1;
  return Math.floor(Jd + 0.5 + timezone / 24);
}

function getSunLongitude(jdn: number, timezone = 7): number {
  const T = (jdn - 2451545.0 - timezone / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - 2 * PI * Math.floor(L / (2 * PI));
  return Math.floor((L / PI) * 6);
}

function getLunarMonth11(yy: number, timezone = 7): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timezone);
  const sunLong = getSunLongitude(nm, timezone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timezone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timezone = 7): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timezone), timezone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timezone), timezone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Convert Solar Date to Vietnamese Lunar Date
 */
export function convertSolar2Lunar(
  dd: number,
  mm: number,
  yy: number,
  timezone = 7,
): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timezone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timezone);
  }
  let a11 = getLunarMonth11(yy, timezone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timezone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timezone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timezone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeapMonth: lunarLeap,
  };
}

/**
 * Convert Vietnamese Lunar Date to Solar Date
 */
export function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeapMonth = false,
  timezone = 7,
): SolarDate {
  let a11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timezone);
  } else {
    a11 = getLunarMonth11(lunarYear, timezone);
  }

  const b11 = getLunarMonth11(lunarYear, timezone);
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth < 11 ? lunarMonth + 1 : lunarMonth - 11;

  const nextA11 = getLunarMonth11(lunarYear < 11 ? lunarYear : lunarYear + 1, timezone);
  const leapYearDiff = (lunarMonth < 11 ? b11 : nextA11) - a11;

  if (leapYearDiff > 365) {
    const leapOff = getLeapMonthOffset(a11, timezone);
    const mDiff = lunarMonth < 11 ? lunarMonth + 2 : lunarMonth - 10;
    if (mDiff > leapOff) {
      off++;
    } else if (mDiff === leapOff && isLeapMonth) {
      off++;
    }
  }

  const monthStart = getNewMoonDay(k + off, timezone);
  const [day, month, year] = jdToDate(monthStart + lunarDay - 1);
  return { day, month, year };
}

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/**
 * Get Can Chi string for a lunar year (e.g. 2026 -> Bính Ngọ)
 */
export function getCanChiYear(year: number): string {
  const canIndex = (year + 6) % 10;
  const chiIndex = (year + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Format lunar date string: e.g. "15/10 (Âm lịch)" or "15 Tháng 10 năm Bính Ngọ"
 */
export function formatLunarDate(lunar: LunarDate, full = false): string {
  const leapText = lunar.isLeapMonth ? ' (Nhuận)' : '';
  if (full) {
    return `Ngày ${lunar.day} tháng ${lunar.month}${leapText} năm ${getCanChiYear(lunar.year)}`;
  }
  return `${lunar.day}/${lunar.month}${leapText} ÂL`;
}

/**
 * Format lunar day for traditional Vietnamese calendar cells:
 * Days 1-10 are "Mùng 1", "Mùng 2", ..., "Mùng 10"
 * Day 15 can show "15" or "Rằm"
 */
export function formatLunarDayLabel(lunarDay: number): string {
  if (lunarDay >= 1 && lunarDay <= 10) {
    return `Mùng ${lunarDay}`;
  }
  if (lunarDay === 15) {
    return '15';
  }
  return String(lunarDay);
}

export const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const VIETNAMESE_WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

/**
 * Generate full month calendar days locally on Frontend
 * Zero backend calls needed when switching months!
 */
export function generateMonthCalendarDays<T extends {
  calendarType: 'GREGORIAN' | 'LUNAR';
  solarDay?: number | null;
  solarMonth?: number | null;
  solarYear?: number | null;
  lunarDay?: number | null;
  lunarMonth?: number | null;
  lunarYear?: number | null;
  isLeapMonth?: boolean;
  recurrence?: 'NONE' | 'ANNUALLY';
}>(
  year: number,
  month: number,
  events: T[] = [],
) {
  // Current Vietnam date
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [currY, currM, currD] = formatter.format(now).split('-').map(Number);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const lunar = convertSolar2Lunar(day, month, year);
    const isToday = year === currY && month === currM && day === currD;

    // Filter events matching this specific day
    const matchingEvents = events.filter((evt) => {
      if (evt.calendarType === 'GREGORIAN') {
        if (evt.recurrence === 'ANNUALLY') {
          return evt.solarMonth === month && evt.solarDay === day;
        }
        return (
          evt.solarYear === year &&
          evt.solarMonth === month &&
          evt.solarDay === day
        );
      } else {
        // LUNAR
        if (evt.recurrence === 'ANNUALLY') {
          return (
            evt.lunarMonth === lunar.month &&
            evt.lunarDay === lunar.day &&
            (evt.isLeapMonth ? lunar.isLeapMonth : true)
          );
        }
        return (
          evt.lunarYear === lunar.year &&
          evt.lunarMonth === lunar.month &&
          evt.lunarDay === lunar.day &&
          (evt.isLeapMonth ? lunar.isLeapMonth : true)
        );
      }
    });

    days.push({
      solarDate: dateString,
      solarDay: day,
      solarMonth: month,
      solarYear: year,
      dayOfWeek,
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      lunarYear: lunar.year,
      isLeapMonth: lunar.isLeapMonth,
      canChiYear: getCanChiYear(lunar.year),
      lunarFormatted: formatLunarDate(lunar),
      isRam: lunar.day === 15,
      isMung1: lunar.day === 1,
      isToday,
      events: matchingEvents,
    });
  }

  return days;
}
