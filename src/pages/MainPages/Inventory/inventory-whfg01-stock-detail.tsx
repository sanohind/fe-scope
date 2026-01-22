import PageMeta from "../../../components/common/PageMeta";
import FinishGoodStockLevelTable from "../../../components/dashboard/inventory/FinishGoodStockLevelTable";

const WAREHOUSE = "WHFG01";

export default function InventoryWhfg01StockDetail() {
  return (
    <>
      <PageMeta
        title={`Finish Good Stock Level Detail - ${WAREHOUSE} | SCOPE - Sanoh Indonesia`}
        description={`Detailed finish good stock level information for ${WAREHOUSE}`}
      />
      <FinishGoodStockLevelTable warehouse={WAREHOUSE} />
    </>
  );
}
