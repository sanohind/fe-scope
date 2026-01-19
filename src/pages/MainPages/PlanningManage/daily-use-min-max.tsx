import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import { dailyUseWhApi, DailyUseWhMinMaxData } from "../../../services/dailyUseWhApi";
import Button from "../../../components/ui/button/Button";

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

export default function DailyUseMinMax() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DailyUseWhMinMaxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(25);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Partial<DailyUseWhMinMaxData> | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Helper to get month name
  const getMonthName = (period: number): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[period - 1] || `Period ${period}`;
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, warehouseFilter, yearFilter, periodFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (yearFilter) params.year = Number(yearFilter);
      if (periodFilter) params.period = Number(periodFilter);

      const result = await dailyUseWhApi.getMinMax(params);

      if (result.success && result.data) {
        setRows(result.data.data || []);
        setPagination({
          total: result.data.total,
          per_page: result.data.per_page,
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          from: result.data.from,
          to: result.data.to,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (data?: DailyUseWhMinMaxData) => {
    if (data) {
      // Edit mode
      setEditingData({ ...data });
    } else {
      // Create mode
      const now = new Date();
      setEditingData({
        warehouse: "WHRM01",
        year: now.getFullYear(),
        period: now.getMonth() + 1,
        min_onhand: 0,
        max_onhand: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingData) return;

    // Validation
    if (Number(editingData.min_onhand) > Number(editingData.max_onhand)) {
      alert("Minimum stock cannot be greater than Maximum stock");
      return;
    }

    try {
      setSaveLoading(true);
      
      // Ensure types are correct
      const payload: DailyUseWhMinMaxData = {
        ...(editingData as DailyUseWhMinMaxData),
        year: Number(editingData.year),
        period: Number(editingData.period),
        min_onhand: Number(editingData.min_onhand),
        max_onhand: Number(editingData.max_onhand),
      };

      await dailyUseWhApi.createOrUpdateMinMax(payload);
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setSaveLoading(false);
    }
  };

  // Static options
  const availableYears = [2024, 2025, 2026, 2027, 2028];
  const availablePeriods = Array.from({ length: 12 }, (_, i) => i + 1);
  const warehouseOptions = ["WHRM01", "WHRM02", "WHFG01", "WHFG02", "WHMT01"];

  const resetFilters = () => {
    setWarehouseFilter("");
    setYearFilter("");
    setPeriodFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = warehouseFilter || yearFilter || periodFilter;

  return (
    <>
      <PageMeta title="Min/Max Stock Manage | SCOPE" description="Manage Min/Max Stock limits for warehouses" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate("/daily-use-upload")} 
              className="mb-2 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <ArrowLeft size={16} />
              Back to Daily Use
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Min/Max Stock Manager</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Set minimum and maximum stock levels per warehouse per month</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2">
            <Plus size={16} />
            Add Min/Max
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Warehouses</option>
              {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Periods</option>
              {availablePeriods.map(p => <option key={p} value={p}>{getMonthName(p)}</option>)}
            </select>

            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Onhand</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Onhand</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No data available</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.warehouse}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{getMonthName(row.period)}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white font-medium">{NUMBER_FORMATTER.format(row.min_onhand)}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white font-medium">{NUMBER_FORMATTER.format(row.max_onhand)}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button 
                          onClick={() => handleOpenModal(row)}
                          className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && editingData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {editingData.id ? "Edit Min/Max Stock" : "Add Min/Max Stock"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Warehouse</label>
                  <select
                    value={editingData.warehouse}
                    onChange={(e) => setEditingData({ ...editingData, warehouse: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Year</label>
                  <select
                    value={editingData.year}
                    onChange={(e) => setEditingData({ ...editingData, year: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Period</label>
                <select
                  value={editingData.period}
                  onChange={(e) => setEditingData({ ...editingData, period: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {availablePeriods.map(p => <option key={p} value={p}>{getMonthName(p)}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Min Onhand</label>
                  <input
                    type="number"
                    min="0"
                    value={editingData.min_onhand}
                    onChange={(e) => setEditingData({ ...editingData, min_onhand: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Max Onhand</label>
                  <input
                    type="number"
                    min="0"
                    value={editingData.max_onhand}
                    onChange={(e) => setEditingData({ ...editingData, max_onhand: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
