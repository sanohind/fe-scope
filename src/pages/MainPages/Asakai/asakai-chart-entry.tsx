import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { asakaiApi, AsakaiTitle } from "../../../services/asakaiApi";
import DatePicker from "../../../components/form/date-picker";

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

export default function AsakaiChartEntry() {
  const navigate = useNavigate();
  const [titles, setTitles] = useState<AsakaiTitle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // input values key: title_id => value
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [existingCharts, setExistingCharts] = useState<Record<number, number>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success"|"error", text: string} | null>(null);

  useEffect(() => {
    fetchTitles();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchExistingCharts();
    } else {
      setExistingCharts({});
    }
  }, [selectedDate]);

  const fetchExistingCharts = async () => {
    try {
      const response = await asakaiApi.getCharts({ date_from: selectedDate, date_to: selectedDate, per_page: 1000 });
      if (response.success) {
        const existing: Record<number, number> = {};
        response.data.forEach((chart: any) => {
          existing[chart.asakai_title_id] = chart.qty;
        });
        setExistingCharts(existing);
      }
    } catch (error) {
      console.error("Failed to fetch existing charts:", error);
    }
  };

  const fetchTitles = async () => {
    try {
      const response = await asakaiApi.getTitles();
      if (response.success) {
        setTitles(response.data);
        const uniqueCategories = Array.from(new Set(response.data.map(t => t.category)));
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch titles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (titleId: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [titleId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setMessage({ type: "error", text: "Please select a date first." });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    const relevantTitles = titles.filter(t => t.category === selectedCategory);
    let successCount = 0;
    let failCount = 0;
    let failMessages: string[] = [];

    const promises = relevantTitles.map(async (title) => {
      const isExisting = existingCharts[title.id] !== undefined;
      const val = formData[title.id];
      if (isExisting || val === undefined || val === "") return; // Skip if empty or already exists

      const payload = {
        asakai_title_id: title.id,
        date: selectedDate,
        qty: parseFloat(val)
      };

      try {
        await asakaiApi.createChart(payload);
        successCount++;
      } catch (err: any) {
        console.error(`Failed to submit title ${title.title}`, err);
        failCount++;
        failMessages.push(err.message || "Duplicate data");
      }
    });

    await Promise.all(promises);

    if (successCount === 0 && failCount === 0) {
      setMessage({ type: "error", text: "Please fill at least one data field." });
    } else if (failCount > 0) {
      setMessage({ type: "error", text: `Saved ${successCount} successfully, but failed to save ${failCount}. Error: ${failMessages[0]}` });
    } else {
      setMessage({ type: "success", text: `Successfully saved ${successCount} chart data.` });
      // Reset form
      setFormData({});
    }
    
    setSubmitLoading(false);
  };

  const relevantTitles = titles.filter(t => t.category === selectedCategory);

  return (
    <>
      <PageMeta title="Asakai Chart Entry | SCOPE - Sanoh Indonesia" description="Enter Asakai chart data by category" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate("/asakai-manage")} 
              className="mb-2 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <ArrowLeft size={16} />
              Back to Asakai Manage
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asakai Chart Entry</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Add multiple chart data based on category</p>
          </div>
        </div>

        {message && (
          <div className={`rounded-lg border p-4 ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' : 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
            <p>{message.text}</p>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <DatePicker
                  id="entry-date"
                  label=""
                  placeholder="Select Date"
                  value={selectedDate ? formatDateToDisplay(selectedDate) : ""}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      setSelectedDate(`${year}-${month}-${day}`);
                    }
                  }}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inputs for {selectedCategory}</h3>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : relevantTitles.length === 0 ? (
                <p className="text-gray-500">No titles found for this category.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-4 w-1/2 font-semibold">Chart Name</th>
                        <th scope="col" className="px-6 py-4 w-1/2 font-semibold">Qty / Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {relevantTitles.map((title) => {
                        const isExisting = existingCharts[title.id] !== undefined;
                        return (
                          <tr key={title.id} className="bg-white hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {title.title}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={isExisting ? "" : "Qty / Score"}
                                value={isExisting ? existingCharts[title.id] : (formData[title.id] ?? "")}
                                onChange={(e) => !isExisting && handleInputChange(title.id, e.target.value)}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                disabled={isExisting || submitLoading}
                                className={`w-full max-w-sm rounded-lg border px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:text-white ${
                                  isExisting 
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-400" 
                                    : "bg-white dark:bg-gray-900"
                                }`}
                              />
                              {isExisting && <span className="text-xs text-brand-600 dark:text-brand-400 mt-2 block font-medium">Already exists for this date</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitLoading || !selectedDate}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save size={18} />
                {submitLoading ? "Saving..." : "Save Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
