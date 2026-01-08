import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { productionPlanApi, ProductionPlanData } from "../../../services/productionPlanApi";

interface ProductionPlanEditFormProps {
  data?: ProductionPlanData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductionPlanEditForm: React.FC<ProductionPlanEditFormProps> = ({ data, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<ProductionPlanData>>({
    partno: "",
    qty_plan: 0,
    plan_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Helper function to convert date to YYYY-MM-DD format without timezone issues
  // Handles both ISO strings (UTC) and simple date strings
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";

    // If it's already a simple date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Parse the date string (handles ISO UTC strings by converting to local browser time)
    const date = new Date(dateString);

    // Check if valid date
    if (isNaN(date.getTime())) return "";

    // Get the year, month, and day in LOCAL timezone
    // This is crucial: 2026-01-08T17:00:00Z (prev day) -> 2026-01-09 00:00:00 (local)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Initialize form with data
  useEffect(() => {
    if (data) {
      setFormData({
        partno: data.partno,
        qty_plan: data.qty_plan,
        plan_date: formatDateForInput(data.plan_date),
      });
    } else {
      setFormData({
        partno: "",
        qty_plan: 0,
        plan_date: "",
      });
    }
    setError("");
  }, [data, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<ProductionPlanData>) => ({
      ...prev,
      [name]: name === "qty_plan" ? (value ? parseInt(value) : 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.partno?.trim()) {
        setError("Part No is required");
        setLoading(false);
        return;
      }
      if (!formData.qty_plan || formData.qty_plan <= 0) {
        setError("Production Qty must be greater than 0");
        setLoading(false);
        return;
      }
      if (!formData.plan_date) {
        setError("Plan Date is required");
        setLoading(false);
        return;
      }

      let response;
      if (data?.id) {
        // Update
        response = await productionPlanApi.update(data.id, formData);
      } else {
        // Create
        response = await productionPlanApi.create([formData as ProductionPlanData]);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data?.id ? "Edit Record" : "Add New Record"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Part No */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Part No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partno"
              value={formData.partno || ""}
              onChange={handleChange}
              placeholder="e.g., P001"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Production Qty */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Production Qty <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="qty_plan"
              value={formData.qty_plan || 0}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="1"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Plan Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Plan Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="plan_date"
              value={formData.plan_date || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionPlanEditForm;
