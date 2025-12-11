import { ProductionPlanManage } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function ProductionPlanUpload() {
  return (
    <>
      <PageMeta title="Planning Manage | Production Plan" description="Manage production plan data with import, edit, and delete capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ProductionPlanManage />
        </div>
      </div>
    </>
  );
}
