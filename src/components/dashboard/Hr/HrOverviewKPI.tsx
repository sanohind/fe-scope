import React, { useEffect, useState } from "react";
import { hrApi } from "../../../services/api/dashboardApi";
import { UserCircleIcon, GroupIcon, FileIcon, CalenderIcon } from "../../../icons";

interface ActiveEmployeesData {
  total_active_employees: number;
  total_pages_processed: number;
}

interface EmploymentStatusItem {
  status: string;
  count: number;
}

interface EmploymentStatusData {
  data: EmploymentStatusItem[];
  total: number;
  summary: {
    [key: string]: number;
  };
}

const HrOverviewKPI: React.FC = () => {
  const [activeEmployeesData, setActiveEmployeesData] = useState<ActiveEmployeesData | null>(null);
  const [employmentStatusData, setEmploymentStatusData] = useState<EmploymentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both APIs in parallel
        const [activeEmployeesResult, employmentStatusResult] = await Promise.all([
          hrApi.getActiveEmployeesCount(),
          hrApi.getEmploymentStatusComparison()
        ]);

        // Handle API response structure: { success, data, message }
        const activeEmployees = activeEmployeesResult?.data || activeEmployeesResult;
        const employmentStatus = employmentStatusResult?.data || employmentStatusResult;

        setActiveEmployeesData(activeEmployees);
        setEmploymentStatusData(employmentStatus);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
            <div className="mt-5 space-y-2">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 w-20"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-800 w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !activeEmployeesData || !employmentStatusData) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">{error || "Failed to load data"}</p>
      </div>
    );
  }

  // Extract employment status counts
  const permanentCount = employmentStatusData.summary?.Permanent || 0;
  const contractCount = employmentStatusData.summary?.Contract || 0;
  const outsourcingCount = employmentStatusData.summary?.Outsourcing || 0;

  const metrics = [
    {
      id: 1,
      title: "Total Active Employees",
      value: activeEmployeesData.total_active_employees.toLocaleString(),
      icon: UserCircleIcon,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Permanent Employees",
      value: permanentCount.toLocaleString(),
      icon: GroupIcon,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
    {
      id: 3,
      title: "Contract Employees",
      value: contractCount.toLocaleString(),
      icon: CalenderIcon,
      bgColor: "bg-warning-50 dark:bg-warning-500/10",
      iconColor: "text-warning-500",
    },
    {
      id: 4,
      title: "Outsourcing Employees",
      value: outsourcingCount.toLocaleString(),
      icon: FileIcon,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-500/10",
      iconColor: "text-blue-light-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <div key={metric.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor}`}>
              <IconComponent className={`size-6 ${metric.iconColor}`} />
            </div>

            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{metric.value}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HrOverviewKPI;