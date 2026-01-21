import React from "react";
import { Modal } from "./index";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}) => {
  const isDanger = variant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[400px] p-6 text-center">
      <div className="flex flex-col items-center justify-center">
        <div 
          className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
            isDanger 
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
              : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          }`}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
        
        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
