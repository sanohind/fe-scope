import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { asakaiApi, AsakaiReason, AsakaiChartWithReasons } from "../../../services/asakaiApi";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import { ConfirmationModal } from "../../../components/ui/modal/ConfirmationModal";

const SECTION_OPTIONS = ["no_section", "brazzing", "chassis", "nylon", "subcon", "passthrough"];

export default function AsakaiManageReasons() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const [chart, setChart] = useState<AsakaiChartWithReasons | null>(null);
  const [reasons, setReasons] = useState<AsakaiReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState<AsakaiReason | null>(null);
  
  // Custom Error Modal State
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Delete Confirmation State
  const [reasonToDelete, setReasonToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    asakai_chart_id: Number(chartId),
    date: "",
    part_no: "",
    part_name: "",
    problem: "",
    qty: 0,
    section: "brazzing",
    line: "",
    penyebab: "",
    perbaikan: "",
  });

  useEffect(() => {
    if (chartId) {
      fetchChartAndReasons();
    }
  }, [chartId]);

  const fetchChartAndReasons = async () => {
    try {
      setLoading(true);
      const response = await asakaiApi.getChartById(Number(chartId));
      if (response.success) {
        setChart(response.data);
        setReasons(response.data.reasons || []);
        setFormData((prev) => ({ ...prev, date: response.data.date }));
      }
    } catch (error) {
      console.error("Failed to fetch chart and reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reason?: AsakaiReason) => {
    if (reason) {
      setEditingReason(reason);
      setFormData({
        asakai_chart_id: reason.asakai_chart_id,
        date: reason.date,
        part_no: reason.part_no,
        part_name: reason.part_name,
        problem: reason.problem,
        qty: reason.qty,
        section: reason.section,
        line: reason.line,
        penyebab: reason.penyebab,
        perbaikan: reason.perbaikan,
      });
    } else {
      setEditingReason(null);
      setFormData({
        asakai_chart_id: Number(chartId),
        date: chart?.date || "",
        part_no: "",
        part_name: "",
        problem: "",
        qty: 0,
        section: "no_section",
        line: "",
        penyebab: "",
        perbaikan: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReason(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReason) {
        await asakaiApi.updateReason(editingReason.id, {
          ...formData,
          section: formData.section as "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough" | "no_section",
        });
      } else {
        await asakaiApi.createReason({
          ...formData,
          section: formData.section as "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough" | "no_section",
        });
      }
      handleCloseModal();
      fetchChartAndReasons();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save reason");
      setErrorModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setReasonToDelete(id);
  };

  const confirmDelete = async () => {
    if (!reasonToDelete) return;
    
    setDeleteLoading(true);
    try {
      await asakaiApi.deleteReason(reasonToDelete);
      fetchChartAndReasons();
    } catch (error) {
      setErrorMessage("Failed to delete reason");
      setErrorModalOpen(true);
    } finally {
      setDeleteLoading(false);
      setReasonToDelete(null);
    }
  };

  return (
    <>
      <PageMeta title="BIRA Problem List | SCOPE - Sanoh Indonesia" description="Manage Asakai reasons" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/asakai-manage")} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 mb-2">
              <ArrowLeft size={16} />
              Back to Charts
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BIRA Problem List</h1>
            {chart && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {chart.asakai_title} - {chart.date} (Qty: {chart.qty})
              </p>
            )}
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} />
            Add BIRA
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden max-w-[1260px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Part No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Part Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Line</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Penyebab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perbaikan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : reasons.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No reasons available. Click "Add BIRA" to create one.
                    </td>
                  </tr>
                ) : (
                  reasons.map((reason) => (
                    <tr key={reason.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{reason.part_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{reason.part_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{reason.problem}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{reason.qty}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{reason.section}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{reason.line}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[100px] truncate">{reason.penyebab}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[100px] truncate">{reason.perbaikan}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(reason)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(reason.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 my-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{editingReason ? "Edit BIRA" : "Add BIRA"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Part No</label>
                  <input
                    type="text"
                    value={formData.part_no}
                    onChange={(e) => setFormData({ ...formData, part_no: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Part Name</label>
                  <input
                    type="text"
                    value={formData.part_name}
                    onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Problem</label>
                <textarea
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {SECTION_OPTIONS.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Line</label>
                  <input
                    type="text"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Penyebab</label>
                <textarea
                  value={formData.penyebab}
                  onChange={(e) => setFormData({ ...formData, penyebab: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Perbaikan</label>
                <textarea
                  value={formData.perbaikan}
                  onChange={(e) => setFormData({ ...formData, perbaikan: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  {editingReason ? "Update" : "Create"}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!reasonToDelete}
        onClose={() => setReasonToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Reason"
        message="Are you sure you want to delete this reason?"
        confirmText="Delete"
        isLoading={deleteLoading}
        variant="danger"
      />
    </>
  );
}
