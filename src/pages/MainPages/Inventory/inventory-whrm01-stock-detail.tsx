import PageMeta from "../../../components/common/PageMeta";
import RawMaterialStockLevelTable from "../../../components/dashboard/inventory/RawMaterialStockLevelTable";

const WAREHOUSE = "WHRM01";

export default function InventoryWhrm01StockDetail() {
  return (
    <>
      <PageMeta
        title={`Raw Material Stock Level Detail - ${WAREHOUSE} | SCOPE - Sanoh Indonesia`}
        description={`Detailed raw material stock level information for ${WAREHOUSE}`}
      />
      <RawMaterialStockLevelTable warehouse={WAREHOUSE} />
    </>
  );
}
