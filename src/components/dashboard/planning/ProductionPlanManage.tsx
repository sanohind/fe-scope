import { useState } from "react";
import { Link } from "react-router-dom";
import ProductionPlanDropZone from "./ProductionPlanDropZone";
import { productionPlanApi } from "../../../services/productionPlanApi";
import Button from "../../ui/button/Button";
import { Download, SlidersVertical } from "lucide-react";

const ProductionPlanManage: React.FC = () => {
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
      const response = await productionPlanApi.importExcel(file);

      if (response.success) {
        setUploadStatus("success");
        const data = response.data as { inserted?: number; updated?: number };
        setSuccessMessage(`✓ Import berhasil! ${data.inserted || 0} baris data ditambahkan`);
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
      const response = await fetch("/api/files/download/prod_plan/ProdPlanTest1.xlsx");
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ProdPlanTest1.xlsx";
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Production Plan Manage</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage production plan data with import, edit, and delete capabilities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Download size={16} />
            Download Template
          </button>
          <Link to="/daily-use-manage">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700"><SlidersVertical size={16} /> Manage Data</Button>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">{successMessage}</div>}

      <ProductionPlanDropZone onFileSelect={handleFileSelect} isLoading={isUploading} uploadStatus={uploadStatus} errorMessage={uploadError} />
    </div>
  );
};

export default ProductionPlanManage;
