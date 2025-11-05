import React, { useEffect, useState } from "react";
import { salesApi } from "../../../services/api/dashboardApi";

interface ShipmentStatusData {
  stages: {
    sales_orders_created: number;
    shipments_generated: number;
    receipts_confirmed: number;
    invoices_issued: number;
    invoices_paid: number;
  };
  conversion_rates: {
    sales_to_shipment: number;
    shipment_to_receipt: number;
    receipt_to_invoice: number;
    invoice_to_paid: number;
  };
}

const ShipmentStatusTracking: React.FC = () => {
  const [data, setData] = useState<ShipmentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getShipmentStatusTracking();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Shipment Status Tracking
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const stages = [
    { label: "Sales Orders Created", value: data.stages.sales_orders_created || 0, color: "bg-brand-500", conversion: null },
    { label: "Shipments Generated", value: data.stages.shipments_generated || 0, color: "bg-blue-light-500", conversion: data.conversion_rates?.sales_to_shipment },
    { label: "Receipts Confirmed", value: data.stages.receipts_confirmed || 0, color: "bg-purple-500", conversion: data.conversion_rates?.shipment_to_receipt },
    { label: "Invoices Issued", value: data.stages.invoices_issued || 0, color: "bg-warning-500", conversion: data.conversion_rates?.receipt_to_invoice },
    { label: "Invoices Paid", value: data.stages.invoices_paid || 0, color: "bg-success-500", conversion: data.conversion_rates?.invoice_to_paid },
  ];

  const maxValue = data.stages.sales_orders_created;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Shipment Status Tracking
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Order to Payment Conversion Funnel
        </p>
      </div>

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const dropOff = index > 0 ? stages[index - 1].value - stage.value : 0;
          
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.label}
                  </span>
                  {stage.conversion != null && !isNaN(stage.conversion) && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stage.conversion >= 95 
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        : stage.conversion >= 85
                        ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                        : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                    }`}>
                      {Number(stage.conversion).toFixed(1)}% conversion
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {dropOff > 0 && (
                    <span className="text-xs text-error-600 dark:text-error-400">
                      -{dropOff.toLocaleString()} dropped
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90 min-w-[80px] text-right">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-end px-4`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-white text-sm font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Summary
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white/90">
              {data.stages.sales_orders_created.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid Orders</p>
            <p className="text-lg font-bold text-success-600 dark:text-success-400">
              {data.stages.invoices_paid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overall Conversion</p>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
              {((data.stages.invoices_paid / data.stages.sales_orders_created) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-lg font-bold text-warning-600 dark:text-warning-400">
              {(data.stages.sales_orders_created - data.stages.invoices_paid).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentStatusTracking;
