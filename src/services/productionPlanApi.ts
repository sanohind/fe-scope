import { API_CONFIG } from "../config/apiConfig";

const BASE_URL = API_CONFIG.BASE_URL;

export interface ProductionPlanData {
  id?: number;
  partno: string;
  divisi: string;
  year: number;
  period: number;
  days: {
    [key: string]: number; // "1": 100, "2": 150, etc.
  };
  created_at?: string;
  updated_at?: string;
}

export interface ProductionPlanResponse {
  success: boolean;
  message: string;
  data: ProductionPlanData[] | ProductionPlanData | { inserted?: number; deleted?: number };
}

export interface ProductionPlanListResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: ProductionPlanData[];
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

const API_BASE = `${BASE_URL}/api/production-plan`;

export const productionPlanApi = {
  // Import Excel file
  importExcel: async (file: File): Promise<ProductionPlanResponse> => {
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
  getAll: async (params?: { page?: number; per_page?: number; plan_date?: string; partno?: string }): Promise<ProductionPlanListResponse> => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${API_BASE}${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  },

  // Get single record by ID
  getById: async (id: number): Promise<ProductionPlanResponse> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch record");
    return response.json();
  },

  // Create new record
  create: async (data: ProductionPlanData[]): Promise<ProductionPlanResponse> => {
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
  update: async (id: number, data: Partial<ProductionPlanData>): Promise<ProductionPlanResponse> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update record");
    return response.json();
  },

  // Delete record by ID
  delete: async (id: number): Promise<ProductionPlanResponse> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete record");
    return response.json();
  },

  // Delete multiple records
  deleteMultiple: async (ids: number[]): Promise<ProductionPlanResponse> => {
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
};
