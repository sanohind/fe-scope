import React, { useEffect, useState } from "react";
import { dailyUseWhApi, DailyUseWhData } from "../../../services/dailyUseWhApi";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import DatePicker from "../../form/date-picker";
import Alert from "../../ui/alert/Alert";

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const DailyUseManageTable: React.FC = () => {
  const [rows, setRows] = useState<DailyUseWhData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [planDateFilter, setPlanDateFilter] = useState("");
  const [selectedDateValue, setSelectedDateValue] = useState("");

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<DailyUseWhData | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DailyUseWhData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected rows for bulk delete
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Alert state
  const [alert, setAlert] = useState<{ variant: "success" | "error"; title: string; message: string } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
  }, [searchTerm, currentPage, perPage, planDateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) params.partno = searchTerm;
      if (planDateFilter) params.plan_date = planDateFilter;

      const result = await dailyUseWhApi.getAll(params);

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

  const handleEdit = (row: DailyUseWhData) => {
    setEditingData(row);
    setEditFormData({
      partno: row.partno,
      daily_use: row.daily_use,
      plan_date: row.plan_date,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingData?.id) return;

    try {
      setIsSaving(true);
      const response = await dailyUseWhApi.update(editingData.id, editFormData);

      if (response.success) {
        setIsEditModalOpen(false);
        setEditingData(null);
        setAlert({ variant: "success", title: "Success", message: "Data updated successfully" });
        setTimeout(() => setAlert(null), 3000);
        fetchData(); // Refresh data
      } else {
        setAlert({ variant: "error", title: "Error", message: response.message || "Failed to update data" });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update data";
      setAlert({ variant: "error", title: "Error", message: errorMsg });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const response = await dailyUseWhApi.delete(deletingId);

      if (response.success) {
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        setAlert({ variant: "success", title: "Success", message: "Data deleted successfully" });
        setTimeout(() => setAlert(null), 3000);
        fetchData(); // Refresh data
      } else {
        setAlert({ variant: "error", title: "Error", message: response.message || "Failed to delete data" });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete data";
      setAlert({ variant: "error", title: "Error", message: errorMsg });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await dailyUseWhApi.deleteMultiple(selectedIds);

      if (response.success) {
        setSelectedIds([]);
        setAlert({ variant: "success", title: "Success", message: `${selectedIds.length} records deleted successfully` });
        setTimeout(() => setAlert(null), 3000);
        fetchData(); // Refresh data
      } else {
        setAlert({ variant: "error", title: "Error", message: response.message || "Failed to delete data" });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete data";
      setAlert({ variant: "error", title: "Error", message: errorMsg });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((row) => row.id!).filter((id): id is number => id !== undefined));
    }
  };

  const formatNumber = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const renderSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-56 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-gray-100 dark:bg-gray-900/40" />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  return (
    <>
      {alert && (
        <div className="mb-4">
          <Alert variant={alert.variant} title={alert.title} message={alert.message} />
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Use Planning Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage daily use warehouse planning data</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={searchInput}
              placeholder="Search part number..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <DatePicker
              id="plan-date-filter"
              placeholder="Filter by date"
              value={selectedDateValue}
              onChange={(_dates, currentDateString) => {
                setPlanDateFilter(currentDateString);
                setSelectedDateValue(currentDateString);
                setCurrentPage(1);
              }}
            />
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {[25, 50, 100, 150].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            {(searchInput || planDateFilter) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setPlanDateFilter("");
                  setSelectedDateValue("");
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </Button>
            )}
            {selectedIds.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleBulkDelete} disabled={isDeleting}>
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="max-h-[520px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </th>
                  <th className="px-4 py-3">Part Number</th>
                  <th className="px-4 py-3 text-right">Daily Use</th>
                  <th className="px-4 py-3">Plan Date</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Updated At</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id!)}
                          onChange={() => toggleSelectRow(row.id!)}
                          className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.partno || "-"}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.daily_use)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(row.plan_date)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.created_at ? formatDate(row.created_at) : "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.updated_at ? formatDate(row.updated_at) : "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(row)} className="rounded-lg px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(row.id!)} className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                            Delete
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

        {pagination && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {pagination.from} to {pagination.to} of {pagination.total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-2">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                disabled={currentPage === pagination.last_page}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-[600px] p-5 lg:p-10">
        <div className="relative w-full overflow-y-auto bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Daily Use Planning</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update the daily use planning data.</p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Label>Part Number</Label>
                  <Input type="text" name="partno" value={editFormData.partno || ""} onChange={(e) => setEditFormData({ ...editFormData, partno: e.target.value })} required />
                </div>
                <div>
                  <Label>Daily Use</Label>
                  <Input type="number" name="daily_use" value={editFormData.daily_use || 0} onChange={(e) => setEditFormData({ ...editFormData, daily_use: parseInt(e.target.value) || 0 })} min="0" required />
                </div>
                <div>
                  <DatePicker
                    id="edit-plan-date"
                    label="Plan Date"
                    placeholder="Select a date"
                    defaultDate={editFormData.plan_date}
                    onChange={(_dates, currentDateString) => {
                      setEditFormData({ ...editFormData, plan_date: currentDateString });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-[500px] p-5">
        <div className="relative w-full bg-white rounded-3xl dark:bg-gray-900 p-6">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete this record? This action cannot be undone.</p>
          <div className="flex items-center gap-3 justify-end">
            <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="outline" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DailyUseManageTable;
