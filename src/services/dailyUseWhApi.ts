const BASE_URL = "http://127.0.0.1:8000";

export interface DailyUseWhData {
  id?: number;
  partno: string;
  daily_use: number;
  plan_date: string;
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
};
