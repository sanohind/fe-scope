/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { describeDateRange } from "../utils/dateRange";
import { inventoryRevApi } from "../services/api/dashboardApi";

export type InventoryFilterMode = "daily" | "monthly" | "yearly";

export interface InventoryFilterRequestParams {
  period: InventoryFilterMode;
  date_from: string;
  date_to: string;
  customer?: string;
  group_type_desc?: string;
}

export interface InventoryFilterContextValue {
  warehouse: string;
  mode: InventoryFilterMode;
  modeLabel: string;
  dateRange: { from: string; to: string };
  rangeSummary: string;
  rangeDescription: string;
  requestParams: InventoryFilterRequestParams;
  requestKey: string;
  months: { value: number; label: string }[];
  years: number[];
  setMode: (mode: InventoryFilterMode) => void;
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
  customer: {
    value: string;
    options: { value: string; label: string }[];
    loading: boolean;
    error: string | null;
    setValue: (value: string) => void;
    refresh: () => void;
  };
  groupType: {
    value: string;
    options: { value: string; label: string }[];
    loading: boolean;
    error: string | null;
    setValue: (value: string) => void;
    refresh: () => void;
  };
}

interface InventoryFilterProviderProps {
  warehouse: string;
  children: React.ReactNode;
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

const InventoryFilterContext = createContext<InventoryFilterContextValue | undefined>(undefined);

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapToOptions = (values: string[], emptyLabel: string) => {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  const baseOptions = [{ value: "all", label: `All ${emptyLabel}` }];
  const mapped = uniqueValues.map((value) => ({ value, label: value }));
  return [...baseOptions, ...mapped];
};

export const InventoryFilterProvider = ({ warehouse, children }: InventoryFilterProviderProps) => {
  const defaultStartYear = CURRENT_YEAR - 1;
  const [mode, setMode] = useState<InventoryFilterMode>("daily");
  const [dailyMonth, setDailyMonth] = useState<number>(new Date().getMonth() + 1);
  const [dailyYear, setDailyYear] = useState<number>(CURRENT_YEAR);
  const [monthlyYear, setMonthlyYear] = useState<number>(CURRENT_YEAR);
  const [yearRange, setYearRange] = useState<{ startYear: number; endYear: number }>({ startYear: defaultStartYear, endYear: CURRENT_YEAR });

  const [customerValue, setCustomerValue] = useState<string>("all");
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([{ value: "all", label: "All Customers" }]);
  const [customerLoading, setCustomerLoading] = useState<boolean>(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [groupValue, setGroupValue] = useState<string>("all");
  const [groupOptions, setGroupOptions] = useState<{ value: string; label: string }[]>([{ value: "all", label: "All Group Types" }]);
  const [groupLoading, setGroupLoading] = useState<boolean>(false);
  const [groupError, setGroupError] = useState<string | null>(null);

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
    setCustomerValue("all");
    setGroupValue("all");
  }, [defaultStartYear]);

  const requestParams: InventoryFilterRequestParams = useMemo(() => {
    const params: InventoryFilterRequestParams = {
      period: mode,
      date_from: dateDetails.dateRange.from,
      date_to: dateDetails.dateRange.to,
    };
    if (customerValue && customerValue !== "all") {
      params.customer = customerValue;
    }
    if (groupValue && groupValue !== "all") {
      params.group_type_desc = groupValue;
    }
    return params;
  }, [customerValue, dateDetails.dateRange.from, dateDetails.dateRange.to, groupValue, mode]);

  const requestKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);

  const fetchCustomerOptions = useCallback(async () => {
    try {
      setCustomerLoading(true);
      setCustomerError(null);
      const response = await inventoryRevApi.getStockByCustomerChart(warehouse, {});
      type CustomerOption = { customer?: string | null };
      const rawData: CustomerOption[] = Array.isArray(response?.data) ? response.data : [];
      const values = rawData.map((item) => item.customer ?? "").filter(Boolean);
      const options = mapToOptions(values, "Customers");
      setCustomerOptions(options);
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : "Failed to load customer list");
      setCustomerOptions([{ value: "all", label: "All Customers" }]);
    } finally {
      setCustomerLoading(false);
    }
  }, [warehouse]);

  const fetchGroupOptions = useCallback(async () => {
    try {
      setGroupLoading(true);
      setGroupError(null);
      const response = await inventoryRevApi.getStockByGroup(warehouse, {});
      type GroupOption = { group_type_desc?: string | null };
      const rawData: GroupOption[] = Array.isArray(response?.data) ? response.data : [];
      const values = rawData.map((item) => item.group_type_desc ?? "").filter(Boolean);
      const options = mapToOptions(values, "Group Types");
      setGroupOptions(options);
    } catch (error) {
      setGroupError(error instanceof Error ? error.message : "Failed to load group types");
      setGroupOptions([{ value: "all", label: "All Group Types" }]);
    } finally {
      setGroupLoading(false);
    }
  }, [warehouse]);

  useEffect(() => {
    fetchCustomerOptions();
    fetchGroupOptions();
  }, [fetchCustomerOptions, fetchGroupOptions]);

  const value: InventoryFilterContextValue = {
    warehouse,
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
    customer: {
      value: customerValue,
      options: customerOptions,
      loading: customerLoading,
      error: customerError,
      setValue: setCustomerValue,
      refresh: fetchCustomerOptions,
    },
    groupType: {
      value: groupValue,
      options: groupOptions,
      loading: groupLoading,
      error: groupError,
      setValue: setGroupValue,
      refresh: fetchGroupOptions,
    },
  };

  return <InventoryFilterContext.Provider value={value}>{children}</InventoryFilterContext.Provider>;
};

export const useInventoryFilters = () => {
  const context = useContext(InventoryFilterContext);
  if (!context) {
    throw new Error("useInventoryFilters must be used within an InventoryFilterProvider");
  }
  return context;
};

export const useInventoryFilterContext = () => useContext(InventoryFilterContext);

interface InventoryRequestOverride {
  dateFrom?: string;
  dateTo?: string;
  customer?: string;
  group_type_desc?: string;
  period?: InventoryFilterMode;
}

export const useInventoryRequestParams = (overrides?: InventoryRequestOverride) => {
  const context = useInventoryFilterContext();
  const { dateFrom, dateTo, customer, group_type_desc, period } = overrides || {};

  return useMemo(() => {
    const params: Record<string, string> = {};
    if (context) {
      Object.assign(params, context.requestParams);
    }
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (customer) params.customer = customer;
    if (group_type_desc) params.group_type_desc = group_type_desc;
    if (period) params.period = period;
    return {
      params,
      key: JSON.stringify(params),
    };
  }, [context, dateFrom, dateTo, customer, group_type_desc, period]);
};

export const inventoryFiltersToQuery = (filters?: InventoryFilterRequestParams) => {
  if (!filters) return {};
  const query: Record<string, string> = {
    period: filters.period,
    date_from: filters.date_from,
    date_to: filters.date_to,
  };
  if (filters.customer) {
    query.customer = filters.customer;
  }
  if (filters.group_type_desc) {
    query.group_type_desc = filters.group_type_desc;
  }
  return query;
};
