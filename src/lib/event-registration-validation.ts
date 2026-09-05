type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function parseIsoCalendarDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null;

  return { year, month, day };
}

function calendarDateFromDateTime(value: string): CalendarDate | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function compareCalendarDates(left: CalendarDate, right: CalendarDate) {
  return (left.year - right.year) || (left.month - right.month) || (left.day - right.day);
}

export function isValidBirthDate(value: string) {
  const birthDate = parseIsoCalendarDate(value);
  if (!birthDate) return false;
  const today = calendarDateFromDateTime(new Date().toISOString());
  return Boolean(today && compareCalendarDates(birthDate, today) <= 0);
}

export function ageOnDate(birthDateValue: string, dateTimeValue: string): number | null {
  const birthDate = parseIsoCalendarDate(birthDateValue);
  const referenceDate = calendarDateFromDateTime(dateTimeValue);
  if (!birthDate || !referenceDate || compareCalendarDates(birthDate, referenceDate) > 0) return null;

  let age = referenceDate.year - birthDate.year;
  if (
    referenceDate.month < birthDate.month
    || (referenceDate.month === birthDate.month && referenceDate.day < birthDate.day)
  ) age -= 1;

  return age;
}

export function isMinorOnDate(birthDateValue: string, dateTimeValue: string) {
  const age = ageOnDate(birthDateValue, dateTimeValue);
  return age != null && age < 18;
}
