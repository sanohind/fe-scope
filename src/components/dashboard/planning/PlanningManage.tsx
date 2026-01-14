import { useState } from "react";
import { Link } from "react-router-dom";
import FixDropZone from "./FixDropZone";
import { dailyUseWhApi } from "../../../services/dailyUseWhApi";
import { API_CONFIG } from "../../../config/apiConfig";
import Button from "../../ui/button/Button";
import { SlidersVertical, Download } from "lucide-react";

const PlanningManage: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle file upload
  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("idle");
    setUploadError("");

    try {
      const response = await dailyUseWhApi.importExcel(file);

      if (response.success) {
        setUploadStatus("success");
        const data = response.data as { inserted?: number; updated?: number };
        setSuccessMessage(`✓ Import berhasil! ${data.inserted || 0} record ditambahkan, ${data.updated || 0} record diupdate`);
        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus("idle");
          setSuccessMessage("");
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadError(response.message);
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file download
  const handleDownload = async () => {
    try {
      const downloadUrl = `${API_CONFIG.BASE_URL}/api/files/download/prod_plan/${encodeURIComponent("DailyUseTest1.xlsx")}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DailyUseTest1.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setUploadError("Failed to download file");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Use Manage</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage daily use warehouse data with import, edit, and delete capabilities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Download size={16} />
            Download Template
          </button>
          <Link to="/daily-use-manage">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <SlidersVertical size={16} /> Manage Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">{successMessage}</div>}

      <FixDropZone onFileSelect={handleFileSelect} isLoading={isUploading} uploadStatus={uploadStatus} errorMessage={uploadError} />
    </div>
  );
};

export default PlanningManage;
