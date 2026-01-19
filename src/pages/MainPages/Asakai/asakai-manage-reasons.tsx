import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { asakaiApi, AsakaiReason, AsakaiChartWithReasons } from "../../../services/asakaiApi";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";

const SECTION_OPTIONS = ["brazzing", "chassis", "nylon", "subcon", "passthrough"];

export default function AsakaiManageReasons() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const [chart, setChart] = useState<AsakaiChartWithReasons | null>(null);
  const [reasons, setReasons] = useState<AsakaiReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState<AsakaiReason | null>(null);
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
        section: "brazzing",
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
          section: formData.section as "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough",
        });
      } else {
        await asakaiApi.createReason({
          ...formData,
          section: formData.section as "brazzing" | "chassis" | "nylon" | "subcon" | "passthrough",
        });
      }
      handleCloseModal();
      fetchChartAndReasons();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save reason");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this reason?")) {
      try {
        await asakaiApi.deleteReason(id);
        fetchChartAndReasons();
      } catch (error) {
        alert("Failed to delete reason");
      }
    }
  };

  return (
    <>
      <PageMeta title="Manage Reasons | SCOPE - Sanoh Indonesia" description="Manage Asakai reasons" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/asakai-manage")} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 mb-2">
              <ArrowLeft size={16} />
              Back to Charts
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Reasons</h1>
            {chart && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {chart.asakai_title} - {chart.date} (Qty: {chart.qty})
              </p>
            )}
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} />
            Add Reason
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Part No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Part Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Section</th>
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
                      No reasons available. Click "Add Reason" to create one.
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
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{reason.penyebab}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{reason.perbaikan}</td>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{editingReason ? "Edit Reason" : "Add Reason"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Part No</label>
                  <input
                    type="text"
                    value={formData.part_no}
                    onChange={(e) => setFormData({ ...formData, part_no: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Part Name</label>
                  <input
                    type="text"
                    value={formData.part_name}
                    onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
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
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
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
                    required
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Perbaikan</label>
                <textarea
                  value={formData.perbaikan}
                  onChange={(e) => setFormData({ ...formData, perbaikan: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
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
    </>
  );
}
