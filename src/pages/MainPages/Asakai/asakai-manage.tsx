import { useState, useEffect } from "react";
import { asakaiApi, AsakaiChart, AsakaiTitle } from "../../../services/asakaiApi";
import { Plus, Edit, Trash2, MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import { Modal } from "../../../components/ui/modal";

// Helper functions to convert between DD-MM-YYYY and YYYY-MM-DD
const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

export default function AsakaiManage() {
  const [charts, setCharts] = useState<AsakaiChart[]>([]);
  const [titles, setTitles] = useState<AsakaiTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Custom Error Modal State
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [editingChart, setEditingChart] = useState<AsakaiChart | null>(null);
  const [formData, setFormData] = useState({
    asakai_title_id: 0,
    date: "",
    qty: 0,
  });
  const [filterTitle, setFilterTitle] = useState<number>(0);
  const [searchDate, setSearchDate] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    current_page: 1
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTitles();
  }, []);

  useEffect(() => {
    fetchCharts();
  }, [filterTitle, searchDate, page, perPage]);

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

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page,
        per_page: perPage
      };
      if (filterTitle > 0) params.asakai_title_id = filterTitle;
      if (searchDate) params.date = searchDate;

      const response = await asakaiApi.getCharts(params);
      if (response.success) {
        // Handle both paginated and non-paginated responses
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
           // Paginated response
           setCharts(response.data.data);
           setPagination({
             total: response.data.total,
             last_page: response.data.last_page,
             from: response.data.from,
             to: response.data.to,
             current_page: response.data.current_page
           });
        } else if (Array.isArray(response.data)) {
            // Non-paginated response (fallback)
            setCharts(response.data);
            setPagination({
              total: response.data.length,
              last_page: 1,
              from: 1,
              to: response.data.length,
              current_page: 1
            });
        }
      }
    } catch (error) {
      console.error("Failed to fetch charts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (chart?: AsakaiChart) => {
    if (chart) {
      setEditingChart(chart);
      setFormData({
        asakai_title_id: chart.asakai_title_id,
        date: chart.date,
        qty: chart.qty,
      });
    } else {
      setEditingChart(null);
      setFormData({
        asakai_title_id: titles[0]?.id || 0,
        date: new Date().toISOString().split("T")[0],
        qty: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChart(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChart) {
        await asakaiApi.updateChart(editingChart.id, formData);
        handleCloseModal();
        fetchCharts();
      } else {
        const response = await asakaiApi.createChart(formData);
        if (response.success && response.data?.id) {
          // Redirect to manage reasons after creating new chart
          navigate(`/asakai-manage-reasons/${response.data.id}`);
        } else {
           handleCloseModal();
           fetchCharts(); 
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save chart");
      setErrorModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this chart? This will also delete all associated BIRA.")) {
      try {
        await asakaiApi.deleteChart(id);
        fetchCharts();
      } catch (error) {
        setErrorMessage("Failed to delete chart");
        setErrorModalOpen(true);
      }
    }
  };

  const handleManageReasons = (chartId: number) => {
    navigate(`/asakai-manage-reasons/${chartId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPage(newPage);
    }
  };

  return (
    <>
      <PageMeta title="Manage Asakai Charts | SCOPE - Sanoh Indonesia" description="Manage Asakai chart data" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Asakai Charts</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Create, edit, and delete Asakai chart data</p>
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} />
            Add Chart Data
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Filter by Title</label>
              <select
                value={filterTitle}
                onChange={(e) => {
                    setFilterTitle(Number(e.target.value));
                    setPage(1); // Reset to page 1 on filter change
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value={0}>All Titles</option>
                {titles.map((title) => (
                  <option key={title.id} value={title.id}>
                    {title.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <DatePicker
                id="search-date"
                label="Search by Date"
                placeholder="Select date"
                value={searchDate ? formatDateToDisplay(searchDate) : ""}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setSearchDate(`${year}-${month}-${day}`);
                  } else {
                    setSearchDate("");
                  }
                  setPage(1); // Reset to page 1 on filter change
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BIRA</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : charts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  charts.map((chart) => (
                    <tr key={chart.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{chart.asakai_title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{chart.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDateToDisplay(chart.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{chart.qty}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{chart.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {chart.reasons_count || 0} BIRA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleManageReasons(chart.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Manage BIRA">
                            <MessageSquareQuote size={18} />
                          </button>
                          <button onClick={() => handleOpenModal(chart)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(chart.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
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
          
          {/* Pagination Controls */}
          {charts.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-400">Show</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700 dark:text-gray-400">entries</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-400">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pagination.last_page}
                    className="rounded-lg border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Same as before */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{editingChart ? "Edit Chart Data" : "Add Chart Data"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Title</label>
                <select
                  value={formData.asakai_title_id}
                  onChange={(e) => setFormData({ ...formData, asakai_title_id: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {titles.map((title) => (
                    <option key={title.id} value={title.id}>
                      {title.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <DatePicker
                  id="form-date"
                  label="Date"
                  placeholder="Select date"
                  value={formData.date ? formatDateToDisplay(formData.date) : ""}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      setFormData({ ...formData, date: `${year}-${month}-${day}` });
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  {editingChart ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Error Modal */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        className="max-w-[400px] p-6 text-center"
      >
        <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center z-1 mb-4">
            <svg
              className="fill-error-50 dark:fill-error-500/15"
              width="64"
              height="64"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
              />
            </svg>

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-error-600 dark:fill-error-500"
                width="32"
                height="32"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Error</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
          <button
            onClick={() => setErrorModalOpen(false)}
            className="w-full rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700"
          >
            Okay, Got it
          </button>
        </div>
      </Modal>
    </>
  );
}
