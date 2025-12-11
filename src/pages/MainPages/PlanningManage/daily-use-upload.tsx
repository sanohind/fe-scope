import { PlanningManage } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function DailyUseUpload() {
  return (
    <>
      <PageMeta title="Planning Manage | Daily Use Warehouse" description="Manage daily use warehouse data with import, edit, and delete capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <PlanningManage />
        </div>
      </div>
    </>
  );
}
