import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { dailyUseWhApi, DailyUseWhData } from "../../../services/dailyUseWhApi";
// FORCE REBUILD - 2026-01-08 09:02:35

interface DailyUseWhEditFormProps {
  data?: DailyUseWhData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DailyUseWhEditForm: React.FC<DailyUseWhEditFormProps> = ({ data, isOpen, onClose, onSuccess }) => {
  console.log("🚀 DailyUseWhEditForm LOADED - NEW VERSION WITH DATE FIX");
  
  const [formData, setFormData] = useState<Partial<DailyUseWhData>>({
    partno: "",
    daily_use: 0,
    plan_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Store original plan_date to preserve it when user doesn't change the date
  const [originalPlanDate, setOriginalPlanDate] = useState<string>("");
  const [displayPlanDate, setDisplayPlanDate] = useState<string>("");
  const [dateWasChanged, setDateWasChanged] = useState<boolean>(false); // Track if user changed date

  // Helper function to convert date to YYYY-MM-DD format without timezone issues
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    
    // Parse the date string and create a Date object
    const date = new Date(dateString);
    
    // Get the year, month, and day in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Initialize form with data
  useEffect(() => {
    console.log("📝 useEffect triggered - isOpen:", isOpen, "data:", data);
    
    if (data) {
      const formattedDate = formatDateForInput(data.plan_date);
      setOriginalPlanDate(data.plan_date); // Store original date from API
      setDisplayPlanDate(formattedDate); // Store formatted date for comparison
      setDateWasChanged(false); // Reset flag
      
      console.log("✅ Form initialized with data:");
      console.log("  - Original plan_date:", data.plan_date);
      console.log("  - Formatted plan_date:", formattedDate);
      console.log("  - dateWasChanged reset to:", false);
      
      setFormData({
        partno: data.partno,
        daily_use: data.daily_use,
        plan_date: formattedDate,
      });
    } else {
      setOriginalPlanDate("");
      setDisplayPlanDate("");
      setDateWasChanged(false);
      setFormData({
        partno: "",
        daily_use: 0,
        plan_date: "",
      });
    }
    setError("");
  }, [data, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    console.log("🔄 handleChange called - field:", name, "value:", value);
    
    // Track if user interacted with the date field
    if (name === "plan_date") {
      setDateWasChanged(true);
      console.log("📅 Date field changed! Setting dateWasChanged to TRUE");
    }
    
    setFormData((prev: Partial<DailyUseWhData>) => ({
      ...prev,
      [name]: name === "daily_use" ? (value ? parseInt(value) : 0) : value,
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
      if (!formData.daily_use || formData.daily_use <= 0) {
        setError("Daily Use must be greater than 0");
        setLoading(false);
        return;
      }
      if (!formData.plan_date) {
        setError("Plan Date is required");
        setLoading(false);
        return;
      }

      // Prepare data to send
      const dataToSend: Partial<DailyUseWhData> = {
        partno: formData.partno,
        daily_use: formData.daily_use,
      };

      // Only include plan_date if user explicitly changed it
      // Compare current value with the original display value
      const currentDateValue = formData.plan_date || "";
      const dateHasChanged = currentDateValue !== displayPlanDate;
      
      console.log("🔍 DEBUG INFO:");
      console.log("Original Plan Date (from API):", originalPlanDate);
      console.log("Display Plan Date (formatted):", displayPlanDate);
      console.log("Current Form Plan Date:", formData.plan_date);
      console.log("Date Was Changed by User (flag)?", dateWasChanged);
      console.log("Date Has Changed (comparison)?", dateHasChanged);
      console.log("Comparison:", `"${currentDateValue}" !== "${displayPlanDate}"`);
      
      if (dateHasChanged) {
        dataToSend.plan_date = formData.plan_date;
        console.log("✅ Including plan_date in payload:", formData.plan_date);
      } else {
        console.log("⛔ NOT including plan_date in payload (unchanged)");
      }
      
      console.log("Plan Date to Send:", dataToSend.plan_date || "NOT SENT");
      console.log("Data to Send:", dataToSend);

      let response;
      if (data?.id) {
        // Update
        response = await dailyUseWhApi.update(data.id, dataToSend);
      } else {
        // Create
        response = await dailyUseWhApi.create([dataToSend as DailyUseWhData]);
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

          {/* Daily Use */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Use <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="daily_use"
              value={formData.daily_use || 0}
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

export default DailyUseWhEditForm;
