import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import { HrOverviewKPI, PresentAttendanceByShift, TopDepartmentsOvertimeTable, TopEmployeesOvertimeTable } from "../../components/dashboard/Hr";

export default function HrDashboard() {
  return (
    <>
      <PageMeta title="HR Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 6: HR Dashboard - Employee management and attendance tracking" />
      <div className="space-y-6">
        {/* Chart 6.1: HR Overview KPI Cards - Load immediately */}
        <HrOverviewKPI />

        {/* Chart 6.2: Present Attendance by Shift */}
        <LazyLoad height="500px">
          <PresentAttendanceByShift />
        </LazyLoad>

        <LazyLoad height="500px">
          <TopEmployeesOvertimeTable />
        </LazyLoad>

        <LazyLoad height="500px">
          <TopDepartmentsOvertimeTable />
        </LazyLoad>
      </div>
    </>
  );
}
