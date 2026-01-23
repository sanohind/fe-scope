import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { asakaiApi, AsakaiReason } from "../../../services/asakaiApi";
import { ArrowLeft, Search, Printer } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import { API_CONFIG } from "../../../config/apiConfig";

// Helper function to convert between DD-MM-YYYY and YYYY-MM-DD
const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

export default function AsakaiReasonsList() {
  const { titleId, titleName } = useParams<{ titleId: string; titleName: string }>();
  const navigate = useNavigate();
  const [reasons, setReasons] = useState<AsakaiReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  /* Filters removed in favor of global filter */
  const [searchQuery, setSearchQuery] = useState("");

  const handlePrintBIRA = () => {
    // Get date range from localStorage (same as used in fetchReasons)
    const storedParamsStr = localStorage.getItem("asakai_filter_params");
    let dateFrom = "";
    let dateTo = "";

    if (storedParamsStr) {
      try {
        const storedParams = JSON.parse(storedParamsStr);
        dateFrom = storedParams.date_from || "";
        dateTo = storedParams.date_to || "";
      } catch (e) {
        console.error("Failed to parse stored filter params", e);
      }
    }

    // Validate that we have the required parameters
    if (!titleId) {
      alert("Title ID is missing");
      return;
    }

    if (!dateFrom || !dateTo) {
      alert("Please select a date range from the filter");
      return;
    }

    // Construct the PDF export URL
    const pdfUrl = `${API_CONFIG.BASE_URL}/api/asakai/reasons/export-pdf?${new URLSearchParams({
      asakai_title_id: titleId,
      date_from: dateFrom,
      date_to: dateTo,
    }).toString()}`;

    // Open PDF in new tab
    window.open(pdfUrl, "_blank");
  };

  useEffect(() => {
    fetchReasons();
  }, [titleId, currentPage, searchQuery]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const params: any = {
        per_page: 100, // Get more results to filter client-side
      };

      const storedParamsStr = localStorage.getItem("asakai_filter_params");
      if (storedParamsStr) {
        try {
          const storedParams = JSON.parse(storedParamsStr);
          if (storedParams.date_from) params.date_from = storedParams.date_from;
          if (storedParams.date_to) params.date_to = storedParams.date_to;
        } catch (e) {
          console.error("Failed to parse stored filter params", e);
        }
      }

      if (searchQuery) params.search = searchQuery;

      const response = await asakaiApi.getReasons(params);
      
      if (response.success) {
        // Filter by asakai_title based on titleName
        const decodedTitleName = decodeURIComponent(titleName || "");
        const filteredReasons = response.data.filter(
          (reason: AsakaiReason) => reason.asakai_title === decodedTitleName
        );
        
        // Manual pagination
        const startIndex = (currentPage - 1) * 20;
        const endIndex = startIndex + 20;
        const paginatedReasons = filteredReasons.slice(startIndex, endIndex);
        
        setReasons(paginatedReasons);
        setTotal(filteredReasons.length);
        setTotalPages(Math.ceil(filteredReasons.length / 20));
      }
    } catch (error) {
      console.error("Failed to fetch reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <PageMeta 
        title={`${decodeURIComponent(titleName || "")} - Reasons | SCOPE - Sanoh Indonesia`} 
        description={`View all reasons for ${decodeURIComponent(titleName || "")}`} 
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/asakai-board")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={16} />
              Back to Board
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {decodeURIComponent(titleName || "")} - BIRA
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View all BIRA for this Asakai title
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintBIRA}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Printer size={16} />
            Print BIRA
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Search Part No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by part number..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Part No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Part Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Penyebab
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Perbaikan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : reasons.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No reasons found
                    </td>
                  </tr>
                ) : (
                  reasons.map((reason) => (
                    <tr key={reason.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDateToDisplay(reason.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {reason.part_no}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {reason.part_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {reason.problem}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {reason.qty}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {reason.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {reason.line}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {reason.penyebab}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {reason.perbaikan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {reason.user}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {currentPage} of {totalPages} ({total} total reasons)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
