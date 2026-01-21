import { API_CONFIG } from "../config/apiConfig";

const BASE_URL = API_CONFIG.BASE_URL;

export interface DailyUseWhData {
  id?: number;
  partno: string;
  warehouse: string;
  year: number;
  period: number;
  qty: number; // Quantity for the entire month
  created_at?: string;
  updated_at?: string;
}

export interface DailyUseWhResponse {
  success: boolean;
  message: string;
  data: DailyUseWhData[] | DailyUseWhData | { inserted?: number; deleted?: number };
}

export interface DailyUseWhListResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: DailyUseWhData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

const API_BASE = `${BASE_URL}/api/daily-use-wh`;

export const dailyUseWhApi = {
  // Import Excel file
  importExcel: async (file: File): Promise<DailyUseWhResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/import`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to import Excel file");
    return response.json();
  },

  // Get all data with filters
  getAll: async (params?: { page?: number; per_page?: number; plan_date?: string; partno?: string }): Promise<DailyUseWhListResponse> => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${API_BASE}${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  },

  // Get single record by ID
  getById: async (id: number): Promise<DailyUseWhResponse> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch record");
    return response.json();
  },

  // Create new record
  create: async (data: DailyUseWhData[]): Promise<DailyUseWhResponse> => {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) throw new Error("Failed to create record");
    return response.json();
  },

  // Update record by ID
  update: async (id: number, data: Partial<DailyUseWhData>): Promise<DailyUseWhResponse> => {
    console.log("📤 API UPDATE REQUEST:");
    console.log("ID:", id);
    console.log("Payload:", JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed to update record");
    const result = await response.json();
    
    console.log("📥 API UPDATE RESPONSE:");
    console.log("Response:", JSON.stringify(result, null, 2));
    
    return result;
  },

  // Delete record by ID
  delete: async (id: number): Promise<DailyUseWhResponse> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete record");
    return response.json();
  },

  // Delete multiple records
  deleteMultiple: async (ids: number[]): Promise<DailyUseWhResponse> => {
    const response = await fetch(`${API_BASE}/delete-multiple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error("Failed to delete records");
    return response.json();
  },

  // --- MIN MAX STOCK API ---

  // Get Min/Max data
  getMinMax: async (params?: { page?: number; per_page?: number; warehouse?: string; year?: number; period?: number }): Promise<DailyUseWhMinMaxListResponse> => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${API_BASE}/min-max${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Min/Max data");
    return response.json();
  },

  // Create or Update Min/Max data
  createOrUpdateMinMax: async (data: DailyUseWhMinMaxData): Promise<DailyUseWhMinMaxResponse> => {
    const response = await fetch(`${API_BASE}/min-max`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save Min/Max data");
    }
    return response.json();
  },

  // Delete Min/Max data
  deleteMinMax: async (id: number): Promise<DailyUseWhMinMaxResponse> => {
    const response = await fetch(`${API_BASE}/min-max/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete Min/Max data");
    }
    return response.json();
  },
};

export interface DailyUseWhMinMaxData {
  id?: number;
  warehouse: string;
  year: number;
  period: number;
  min_onhand: number;
  max_onhand: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailyUseWhMinMaxResponse {
  success: boolean;
  message: string;
  data: DailyUseWhMinMaxData;
}

export interface DailyUseWhMinMaxListResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: DailyUseWhMinMaxData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}
