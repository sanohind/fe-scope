import { API_CONFIG } from "../config/apiConfig";

const BASE_URL = API_CONFIG.BASE_URL;

// Helper function to filter out undefined/null values from params
const cleanParams = (params?: Record<string, any>): Record<string, any> => {
  if (!params) return {};
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined && value !== null));
};

export interface AsakaiTitle {
  id: number;
  title: string;
  category: "Safety" | "Quality" | "Delivery";
  created_at: string;
  updated_at: string;
}

export interface AsakaiChart {
  id: number;
  asakai_title_id: number;
  asakai_title: string;
  category: string;
  date: string;
  qty: number;
  user: string;
  user_id: number;
  reasons_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface AsakaiReason {
  id: number;
  asakai_chart_id: number;
  asakai_title?: string;
  category?: string;
  date: string;
  part_no: string;
  part_name: string;
  problem: string;
  qty: number;
  section: "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough" | "no_section";
  line: string;
  penyebab: string;
  perbaikan: string;
  user: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface AsakaiChartWithReasons extends AsakaiChart {
  reasons: AsakaiReason[];
}

type AsakaiFilterParams = {
  period?: string;
  date_from?: string;
  date_to?: string;
  section?: string;
  asakai_title_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
};

// Asakai Board API
export const asakaiApi = {
  // Titles
  getTitles: async (): Promise<{ success: boolean; data: AsakaiTitle[] }> => {
    const url = `${BASE_URL}/api/asakai/titles`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai titles");
    return response.json();
  },

  getTitleById: async (id: number): Promise<{ success: boolean; data: AsakaiTitle }> => {
    const url = `${BASE_URL}/api/asakai/titles/${id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai title");
    return response.json();
  },

  // Charts
  getCharts: async (params?: AsakaiFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/asakai/charts${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai charts");
    return response.json();
  },

  getChartById: async (id: number): Promise<{ success: boolean; data: AsakaiChartWithReasons }> => {
    const url = `${BASE_URL}/api/asakai/charts/${id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai chart");
    return response.json();
  },

  createChart: async (data: { asakai_title_id: number; date: string; qty: number }) => {
    const url = `${BASE_URL}/api/asakai/charts`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create chart");
    }
    return response.json();
  },

  updateChart: async (id: number, data: Partial<{ asakai_title_id: number; date: string; qty: number }>) => {
    const url = `${BASE_URL}/api/asakai/charts/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update chart");
    }
    return response.json();
  },

  deleteChart: async (id: number) => {
    const url = `${BASE_URL}/api/asakai/charts/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete chart");
    return response.json();
  },

  getAvailableDates: async (asakai_title_id: number) => {
    const url = `${BASE_URL}/api/asakai/charts/available-dates?asakai_title_id=${asakai_title_id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch available dates");
    return response.json();
  },

  getChartData: async (params?: AsakaiFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/asakai/charts/data${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai chart data");
    return response.json();
  },

  // Reasons
  getReasons: async (params?: AsakaiFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/asakai/reasons${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai reasons");
    return response.json();
  },

  getReasonById: async (id: number): Promise<{ success: boolean; data: AsakaiReason }> => {
    const url = `${BASE_URL}/api/asakai/reasons/${id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch asakai reason");
    return response.json();
  },

  createReason: async (data: {
    asakai_chart_id: number;
    date: string;
    part_no: string;
    part_name: string;
    problem: string;
    qty: number;
    section: string;
    line: string;
    penyebab: string;
    perbaikan: string;
  }) => {
    const url = `${BASE_URL}/api/asakai/reasons`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create reason");
    }
    return response.json();
  },

  updateReason: async (id: number, data: Partial<AsakaiReason>) => {
    const url = `${BASE_URL}/api/asakai/reasons/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update reason");
    }
    return response.json();
  },

  deleteReason: async (id: number) => {
    const url = `${BASE_URL}/api/asakai/reasons/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete reason");
    return response.json();
  },

  getReasonsByChartId: async (chartId: number) => {
    const url = `${BASE_URL}/api/asakai/charts/${chartId}/reasons`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch reasons by chart");
    return response.json();
  },
};
