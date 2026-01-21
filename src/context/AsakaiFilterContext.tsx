import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { describeDateRange } from "../utils/dateRange";

export type AsakaiDateMode = "daily" | "monthly" | "yearly";
export type AsakaiSection = "all" | "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough";

export interface AsakaiFilterRequestParams {
  period: AsakaiDateMode;
  date_from: string;
  date_to: string;
  section: AsakaiSection;
}

interface AsakaiFilterContextValue {
  mode: AsakaiDateMode;
  modeLabel: string;
  dateRange: { from: string; to: string };
  rangeSummary: string;
  rangeDescription: string;
  section: AsakaiSection;
  requestParams: AsakaiFilterRequestParams;
  requestKey: string;
  months: { value: number; label: string }[];
  years: number[];
  setMode: (mode: AsakaiDateMode) => void;
  setSection: (section: AsakaiSection) => void;
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

const AsakaiFilterContext = createContext<AsakaiFilterContextValue | undefined>(undefined);

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface AsakaiFilterProviderProps {
  children: React.ReactNode;
}

export const AsakaiFilterProvider = ({ children }: AsakaiFilterProviderProps) => {
  // Helper to get initial state from local storage
  const getInitialState = () => {
    try {
      const stored = localStorage.getItem("asakai_filter_state");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse asakai filter state", e);
    }
    return null;
  };

  const initialState = getInitialState();
  const defaultStartYear = CURRENT_YEAR - 1;

  const [mode, setMode] = useState<AsakaiDateMode>(initialState?.mode || "daily");
  const [section, setSection] = useState<AsakaiSection>(initialState?.section || "all");
  const [dailyMonth, setDailyMonth] = useState<number>(initialState?.dailyMonth || new Date().getMonth() + 1);
  const [dailyYear, setDailyYear] = useState<number>(initialState?.dailyYear || CURRENT_YEAR);
  const [monthlyYear, setMonthlyYear] = useState<number>(initialState?.monthlyYear || CURRENT_YEAR);
  const [yearRange, setYearRange] = useState<{ startYear: number; endYear: number }>(
    initialState?.yearRange || { startYear: defaultStartYear, endYear: CURRENT_YEAR }
  );

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
    setSection("all");
    setDailyMonth(now.getMonth() + 1);
    setDailyYear(CURRENT_YEAR);
    setMonthlyYear(CURRENT_YEAR);
    setYearRange({ startYear: defaultStartYear, endYear: CURRENT_YEAR });
  }, [defaultStartYear]);

  /* Save state to local storage */
  useEffect(() => {
    localStorage.setItem(
      "asakai_filter_state",
      JSON.stringify({
        mode,
        section,
        dailyMonth,
        dailyYear,
        monthlyYear,
        yearRange,
      })
    );
  }, [mode, section, dailyMonth, dailyYear, monthlyYear, yearRange]);

  const requestParams: AsakaiFilterRequestParams = useMemo(() => {
    return {
      period: mode,
      date_from: dateDetails.dateRange.from,
      date_to: dateDetails.dateRange.to,
      section,
    };
  }, [dateDetails.dateRange.from, dateDetails.dateRange.to, mode, section]);

  /* Save computed params to local storage for other pages */
  useEffect(() => {
    localStorage.setItem("asakai_filter_params", JSON.stringify(requestParams));
  }, [requestParams]);

  const requestKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);

  const value: AsakaiFilterContextValue = {
    mode,
    modeLabel,
    dateRange: dateDetails.dateRange,
    rangeSummary,
    rangeDescription,
    section,
    requestParams,
    requestKey,
    months: MONTH_OPTIONS,
    years: YEAR_RANGE,
    setMode,
    setSection,
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

  return <AsakaiFilterContext.Provider value={value}>{children}</AsakaiFilterContext.Provider>;
};

export const useAsakaiFilters = () => {
  const context = useContext(AsakaiFilterContext);
  if (!context) {
    throw new Error("useAsakaiFilters must be used within an AsakaiFilterProvider");
  }
  return context;
};

export const asakaiFiltersToQuery = (filters?: AsakaiFilterRequestParams) => {
  if (!filters) return {};
  return {
    period: filters.period,
    date_from: filters.date_from,
    date_to: filters.date_to,
    section: filters.section !== "all" ? filters.section : undefined,
  };
};
