import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import { asakaiApi, AsakaiTarget, AsakaiTitle } from "../../../services/asakaiApi";
import Button from "../../../components/ui/button/Button";
import { ConfirmationModal } from "../../../components/ui/modal/ConfirmationModal";

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

export default function AsakaiManageTarget() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AsakaiTarget[]>([]);
  const [titles, setTitles] = useState<AsakaiTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filters
  const [titleFilter, setTitleFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(25);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Partial<AsakaiTarget> | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Helper to get month name
  const getMonthName = (period: number): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[period - 1] || `Period ${period}`;
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, titleFilter, yearFilter, periodFilter]);

  const fetchTitles = async () => {
    try {
      const response = await asakaiApi.getTitles();
      if (response.success) {
        setTitles(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch titles:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (titleFilter) params.asakai_title_id = Number(titleFilter);
      if (yearFilter) params.year = Number(yearFilter);
      if (periodFilter) params.period = Number(periodFilter);

      const result = await asakaiApi.getTargets(params);

      // Map title data if separate or included
      // Assuming result.data.data has AsakaiTarget objects
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

  const handleOpenModal = (data?: AsakaiTarget) => {
    if (data) {
      // Edit mode
      setEditingData({ ...data });
    } else {
      // Create mode
      const now = new Date();
      setEditingData({
        asakai_title_id: titles[0]?.id || 0,
        year: now.getFullYear(),
        period: now.getMonth() + 1,
        target: 0,
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

    try {
      setSaveLoading(true);
      
      const payload = {
        asakai_title_id: Number(editingData.asakai_title_id),
        year: Number(editingData.year),
        period: Number(editingData.period),
        target: Number(editingData.target),
      };

      await asakaiApi.createOrUpdateTarget(payload);
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    try {
      await asakaiApi.deleteTarget(itemToDelete);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete data");
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // Helper to find title name by ID
  const getTitleName = (id: number) => {
    const t = titles.find(t => t.id === id);
    return t ? t.title : `Title #${id}`;
  };

  // Static options
  const availableYears = [2024, 2025, 2026, 2027, 2028];
  const availablePeriods = Array.from({ length: 12 }, (_, i) => i + 1);

  const resetFilters = () => {
    setTitleFilter("");
    setYearFilter("");
    setPeriodFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = titleFilter || yearFilter || periodFilter;

  return (
    <>
      <PageMeta title="Manage Asakai Targets | SCOPE - Sanoh Indonesia" description="Manage target values for Asakai charts" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate("/asakai-manage")} 
              className="mb-2 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <ArrowLeft size={16} />
              Back to Asakai Manage
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asakai Target Manager</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Set monthly targets for Asakai charts</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2">
            <Plus size={16} />
            Add Target
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={titleFilter}
              onChange={(e) => {
                setTitleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Titles</option>
              {titles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asakai Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No targets found</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {row.asakai_title || getTitleName(row.asakai_title_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{getMonthName(row.period)}</td>
                      <td className="px-6 py-4 text-right text-sm text-brand-600 dark:text-brand-400 font-bold">{NUMBER_FORMATTER.format(row.target)}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleOpenModal(row)}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
              {editingData.id ? "Edit Target" : "Add Target"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Asakai Title</label>
                <select
                  value={editingData.asakai_title_id}
                  onChange={(e) => setEditingData({ ...editingData, asakai_title_id: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {titles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Period (Month)</label>
                  <select
                    value={editingData.period}
                    onChange={(e) => setEditingData({ ...editingData, period: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {availablePeriods.map(p => <option key={p} value={p}>{getMonthName(p)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Target Value</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={editingData.target}
                  onChange={(e) => setEditingData({ ...editingData, target: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Target"
        message="Are you sure you want to delete this target?"
        confirmText="Delete"
        isLoading={deleteLoading}
        variant="danger"
      />
    </>
  );
}
