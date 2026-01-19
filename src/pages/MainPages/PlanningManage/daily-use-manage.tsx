import { DailyUseManageTable } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function DailyUseManage() {

  return (
    <>
      <PageMeta title="Daily Use Manage | Daily Use Warehouse Management" description="Manage daily use warehouse data with edit and delete capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <DailyUseManageTable />
        </div>
      </div>
    </>
  );
}
