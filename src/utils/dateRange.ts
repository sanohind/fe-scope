const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map((item) => parseInt(item, 10));
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
};

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export const formatDateRange = (from: string, to: string, locale: string = "id-ID") => {
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  return `${formatter.format(parseDate(from))} - ${formatter.format(parseDate(to))}`;
};

export const describeDateRange = (from: string, to: string, locale: string = "id-ID") => {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / ONE_DAY_MS) + 1);
  return `${formatDateRange(from, to, locale)} · ${days.toLocaleString(locale)} days`;
};
