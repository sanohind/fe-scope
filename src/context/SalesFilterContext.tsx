/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { describeDateRange } from "../utils/dateRange";

export type SalesDateMode = "daily" | "monthly" | "yearly";

export interface SalesFilterRequestParams {
  period: SalesDateMode;
  date_from: string;
  date_to: string;
}

interface SalesFilterContextValue {
  mode: SalesDateMode;
  modeLabel: string;
  dateRange: { from: string; to: string };
  rangeSummary: string;
  rangeDescription: string;
  requestParams: SalesFilterRequestParams;
  requestKey: string;
  months: { value: number; label: string }[];
  years: number[];
  setMode: (mode: SalesDateMode) => void;
  resetFilters: () => void;
  daily: {
    month: number;
    year: number;
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
  };
  monthly: {
    year: number;
    setYear: (year: number) => void;
  };
  yearly: {
    startYear: number;
    endYear: number;
    setStartYear: (year: number) => void;
    setEndYear: (year: number) => void;
  };
}

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 8 }, (_, idx) => CURRENT_YEAR - 5 + idx);

const SalesFilterContext = createContext<SalesFilterContextValue | undefined>(undefined);

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface SalesFilterProviderProps {
  children: React.ReactNode;
}

export const SalesFilterProvider = ({ children }: SalesFilterProviderProps) => {
  const defaultStartYear = CURRENT_YEAR - 1;
  const [mode, setMode] = useState<SalesDateMode>("daily");
  const [dailyMonth, setDailyMonth] = useState<number>(new Date().getMonth() + 1);
  const [dailyYear, setDailyYear] = useState<number>(CURRENT_YEAR);
  const [monthlyYear, setMonthlyYear] = useState<number>(CURRENT_YEAR);
  const [yearRange, setYearRange] = useState<{ startYear: number; endYear: number }>({ startYear: defaultStartYear, endYear: CURRENT_YEAR });

  const adjustYearRange = useCallback((updates: Partial<{ startYear: number; endYear: number }>) => {
    setYearRange((prev) => {
      const next = { ...prev, ...updates };
      if (next.startYear > next.endYear) {
        if (updates.startYear !== undefined) {
          next.endYear = updates.startYear;
        } else if (updates.endYear !== undefined) {
          next.startYear = updates.endYear;
        }
      }
      return next;
    });
  }, []);

  const dateDetails = useMemo(() => {
    if (mode === "daily") {
      const fromDate = new Date(dailyYear, dailyMonth - 1, 1);
      const toDate = new Date(dailyYear, dailyMonth, 0);
      return {
        dateRange: { from: toIsoDate(fromDate), to: toIsoDate(toDate) },
        summary: `${MONTH_OPTIONS.find((m) => m.value === dailyMonth)?.label ?? ""} ${dailyYear}`,
      };
    }
    if (mode === "monthly") {
      const fromDate = new Date(monthlyYear, 0, 1);
      const toDate = new Date(monthlyYear, 11, 31);
      return {
        dateRange: { from: toIsoDate(fromDate), to: toIsoDate(toDate) },
        summary: `${monthlyYear}`,
      };
    }
    const fromDate = new Date(yearRange.startYear, 0, 1);
    const toDate = new Date(yearRange.endYear, 11, 31);
    const summary = yearRange.startYear === yearRange.endYear ? `${yearRange.startYear}` : `${yearRange.startYear} - ${yearRange.endYear}`;
    return {
      dateRange: { from: toIsoDate(fromDate), to: toIsoDate(toDate) },
      summary,
    };
  }, [dailyMonth, dailyYear, mode, monthlyYear, yearRange.endYear, yearRange.startYear]);

  const modeLabel = useMemo(() => mode.charAt(0).toUpperCase() + mode.slice(1), [mode]);
  const rangeDescription = useMemo(() => describeDateRange(dateDetails.dateRange.from, dateDetails.dateRange.to), [dateDetails.dateRange.from, dateDetails.dateRange.to]);
  const rangeSummary = `${modeLabel} · ${dateDetails.summary}`;

  const resetFilters = useCallback(() => {
    const now = new Date();
    setMode("daily");
    setDailyMonth(now.getMonth() + 1);
    setDailyYear(CURRENT_YEAR);
    setMonthlyYear(CURRENT_YEAR);
    setYearRange({ startYear: defaultStartYear, endYear: CURRENT_YEAR });
  }, [defaultStartYear]);

  const requestParams: SalesFilterRequestParams = useMemo(() => {
    return {
      period: mode,
      date_from: dateDetails.dateRange.from,
      date_to: dateDetails.dateRange.to,
    };
  }, [dateDetails.dateRange.from, dateDetails.dateRange.to, mode]);

  const requestKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);

  const value: SalesFilterContextValue = {
    mode,
    modeLabel,
    dateRange: dateDetails.dateRange,
    rangeSummary,
    rangeDescription,
    requestParams,
    requestKey,
    months: MONTH_OPTIONS,
    years: YEAR_RANGE,
    setMode,
    resetFilters,
    daily: {
      month: dailyMonth,
      year: dailyYear,
      setMonth: setDailyMonth,
      setYear: setDailyYear,
    },
    monthly: {
      year: monthlyYear,
      setYear: setMonthlyYear,
    },
    yearly: {
      startYear: yearRange.startYear,
      endYear: yearRange.endYear,
      setStartYear: (year: number) => adjustYearRange({ startYear: year }),
      setEndYear: (year: number) => adjustYearRange({ endYear: year }),
    },
  };

  return <SalesFilterContext.Provider value={value}>{children}</SalesFilterContext.Provider>;
};

export const useSalesFilters = () => {
  const context = useContext(SalesFilterContext);
  if (!context) {
    throw new Error("useSalesFilters must be used within a SalesFilterProvider");
  }
  return context;
};

export const salesFiltersToQuery = (filters?: SalesFilterRequestParams) => {
  if (!filters) return {};
  return {
    period: filters.period,
    date_from: filters.date_from,
    date_to: filters.date_to,
  };
};
