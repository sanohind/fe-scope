import { ProductionPlanManageTable } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function ProductionPlanManage() {
  return (
    <>
      <PageMeta title="Planning Manage | Production Plan Management" description="Manage production plan data with edit and delete capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ProductionPlanManageTable />
        </div>
      </div>
    </>
  );
}
