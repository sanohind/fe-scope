import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Ecommerce from "./pages/Dashboard/Ecommerce";
import Stocks from "./pages/Dashboard/Stocks";
import Crm from "./pages/Dashboard/Crm";
import Marketing from "./pages/Dashboard/Marketing";
import Analytics from "./pages/Dashboard/Analytics";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Carousel from "./pages/UiElements/Carousel";
import Maintenance from "./pages/OtherPage/Maintenance";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Pagination from "./pages/UiElements/Pagination";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import ButtonsGroup from "./pages/UiElements/ButtonsGroup";
import Notifications from "./pages/UiElements/Notifications";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import PieChart from "./pages/Charts/PieChart";
import Invoices from "./pages/Invoices";
import ComingSoon from "./pages/OtherPage/ComingSoon";
import FileManager from "./pages/FileManager";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import DataTables from "./pages/Tables/DataTables";
import PricingTables from "./pages/PricingTables";
import Faqs from "./pages/Faqs";
import Chats from "./pages/Chat/Chats";
import FormElements from "./pages/Forms/FormElements";
import FormLayout from "./pages/Forms/FormLayout";
import Blank from "./pages/Blank";
import EmailInbox from "./pages/Email/EmailInbox";
import EmailDetails from "./pages/Email/EmailDetails";

import TaskKanban from "./pages/Task/TaskKanban";
import BreadCrumb from "./pages/UiElements/BreadCrumb";
import Cards from "./pages/UiElements/Cards";
import Dropdowns from "./pages/UiElements/Dropdowns";
import Links from "./pages/UiElements/Links";
import Lists from "./pages/UiElements/Lists";
import Popovers from "./pages/UiElements/Popovers";
import Progressbar from "./pages/UiElements/Progressbar";
import Ribbons from "./pages/UiElements/Ribbons";
import Spinners from "./pages/UiElements/Spinners";
import Tabs from "./pages/UiElements/Tabs";
import Tooltips from "./pages/UiElements/Tooltips";
import Modals from "./pages/UiElements/Modals";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import TwoStepVerification from "./pages/AuthPages/TwoStepVerification";
import Success from "./pages/OtherPage/Success";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TaskList from "./pages/Task/TaskList";
import Saas from "./pages/Dashboard/Saas";
import InventoryWhfg01 from "./pages/MainPages/Inventory/inventory-whfg01";
import InventoryWhfg02 from "./pages/MainPages/Inventory/inventory-whfg02";
import InventoryWhrm01 from "./pages/MainPages/Inventory/inventory-whrm01";
import InventoryWhrm02 from "./pages/MainPages/Inventory/inventory-whrm02";
import InventoryWhmt01 from "./pages/MainPages/Inventory/inventory-whmt01";
import WarehouseWhfg01 from "./pages/MainPages/Warehouse/warehouse-whfg01";
import WarehouseWhfg02 from "./pages/MainPages/Warehouse/warehouse-whfg02";
import WarehouseWhrm01 from "./pages/MainPages/Warehouse/warehouse-whrm01";
import WarehouseWhrm02 from "./pages/MainPages/Warehouse/warehouse-whrm02";
import WarehouseWhmt01 from "./pages/MainPages/Warehouse/warehouse-whmt01";
import ProductionBz from "./pages/MainPages/Production/bzProd";
import ProductionCh from "./pages/MainPages/Production/chProd";
import ProductionNl from "./pages/MainPages/Production/nlProd";
import ProductionPs from "./pages/MainPages/Production/psProd";
import ProductionSc from "./pages/MainPages/Production/psProd";
import DailyUseUpload from "./pages/MainPages/PlanningManage/daily-use-upload";
import DailyUseManage from "./pages/MainPages/PlanningManage/daily-use-manage";
import ProductionPlanUpload from "./pages/MainPages/PlanningManage/production-plan-upload";
import ProductionPlanManage from "./pages/MainPages/PlanningManage/production-plan-manage";
import InventoryWhrm01StockDetail from "./pages/MainPages/Inventory/inventory-whrm01-stock-detail";
import InventoryWhrm02StockDetail from "./pages/MainPages/Inventory/inventory-whrm02-stock-detail";
import InventoryWhmt01StockDetail from "./pages/MainPages/Inventory/inventory-whmt01-stock-detail";
import AsakaiBoard from "./pages/MainPages/Asakai/asakai-board";
import AsakaiManage from "./pages/MainPages/Asakai/asakai-manage";
import AsakaiManageReasons from "./pages/MainPages/Asakai/asakai-manage-reasons";
import AsakaiReasonsList from "./pages/MainPages/Asakai/asakai-reasons-list";

// Lazy load dashboard pages for better performance
const WarehouseAllRm = lazy(() => import("./pages/MainPages/Warehouse/warehouse-allRm"));
const WarehouseAllFg = lazy(() => import("./pages/MainPages/Warehouse/warehouse-allFg"));
const InventoryAllFg = lazy(() => import("./pages/MainPages/Inventory/inventory-allFg"));
const InventoryAllRm = lazy(() => import("./pages/MainPages/Inventory/inventory-allRm"));
const ProductionDashboard = lazy(() => import("./pages/MainPages/Production/ProductionDashboard"));
const SalesDashboard = lazy(() => import("./pages/MainPages/SalesDashboard"));
const LogisticsDashboard = lazy(() => import("./pages/MainPages/LogisticsDashboard"));
const HrDashboard = lazy(() => import("./pages/MainPages/HrDashboard"));

// Loading fallback component
const DashboardLoading = () => (
  <div className="p-6">
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded dark:bg-gray-800"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl dark:bg-gray-800"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-2xl dark:bg-gray-800"></div>
    </div>
  </div>
);

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Navigate to="/inventory-rm" replace />} />
            <Route path="/ecommerce" element={<Ecommerce />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/crm" element={<Crm />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/inventory/whfg01" element={<InventoryWhfg01 />} />
            <Route path="/inventory/whfg02" element={<InventoryWhfg02 />} />
            <Route path="/inventory/whrm01" element={<InventoryWhrm01 />} />
            <Route path="/inventory/whrm02" element={<InventoryWhrm02 />} />
            <Route path="/inventory/whmt01" element={<InventoryWhmt01 />} />
            <Route path="/inventory/whrm01/stock-detail" element={<InventoryWhrm01StockDetail />} />
            <Route path="/inventory/whrm02/stock-detail" element={<InventoryWhrm02StockDetail />} />
            <Route path="/inventory/whmt01/stock-detail" element={<InventoryWhmt01StockDetail />} />
            <Route path="/warehouse/whfg01" element={<WarehouseWhfg01 />} />
            <Route path="/warehouse/whfg02" element={<WarehouseWhfg02 />} />
            <Route path="/warehouse/whrm01" element={<WarehouseWhrm01 />} />
            <Route path="/warehouse/whrm02" element={<WarehouseWhrm02 />} />
            <Route path="/warehouse/whmt01" element={<WarehouseWhmt01 />} />
            <Route path="/production/bz" element={<ProductionBz />} />
            <Route path="/production/ch" element={<ProductionCh />} />
            <Route path="/production/nl" element={<ProductionNl />} />
            <Route path="/production/ps" element={<ProductionPs />} />
            <Route path="/production/sc" element={<ProductionSc />} />
            <Route
              path="/production"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <ProductionDashboard />
                </Suspense>
              }
            />
            <Route
              path="/warehouse-rm"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <WarehouseAllRm />
                </Suspense>
              }
            />
            <Route
              path="/warehouse-fg"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <WarehouseAllFg />
                </Suspense>
              }
            />
            <Route
              path="/inventory-fg"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <InventoryAllFg />
                </Suspense>
              }
            />
            <Route
              path="/inventory-rm"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <InventoryAllRm />
                </Suspense>
              }
            />
            <Route
              path="/sales"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <SalesDashboard />
                </Suspense>
              }
            />
            <Route
              path="/logistics"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <LogisticsDashboard />
                </Suspense>
              }
            />
            <Route
              path="/hr"
              element={
                <Suspense fallback={<DashboardLoading />}>
                  <HrDashboard />
                </Suspense>
              }
            />
            <Route path="/daily-use-upload" element={<DailyUseUpload />} />
            <Route path="/daily-use-manage" element={<DailyUseManage />} />
            <Route path="/production-plan-upload" element={<ProductionPlanUpload />} />
            <Route path="/production-plan-manage" element={<ProductionPlanManage />} />
            <Route path="/asakai-board" element={<AsakaiBoard />} />
            <Route path="/asakai-manage" element={<AsakaiManage />} />
            <Route path="/asakai-manage-reasons/:chartId" element={<AsakaiManageReasons />} />
            <Route path="/asakai-reasons/:titleId/:titleName" element={<AsakaiReasonsList />} />
            <Route path="/saas" element={<Saas />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/faq" element={<Faqs />} />
            <Route path="/pricing-tables" element={<PricingTables />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/form-layout" element={<FormLayout />} />

            {/* Applications */}
            <Route path="/chat" element={<Chats />} />

            <Route path="/task-list" element={<TaskList />} />
            <Route path="/task-kanban" element={<TaskKanban />} />
            <Route path="/file-manager" element={<FileManager />} />

            {/* Email */}

            <Route path="/inbox" element={<EmailInbox />} />
            <Route path="/inbox-details" element={<EmailDetails />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/data-tables" element={<DataTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/breadcrumb" element={<BreadCrumb />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-group" element={<ButtonsGroup />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/dropdowns" element={<Dropdowns />} />
            <Route path="/images" element={<Images />} />
            <Route path="/links" element={<Links />} />
            <Route path="/list" element={<Lists />} />
            <Route path="/modals" element={<Modals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pagination" element={<Pagination />} />
            <Route path="/popovers" element={<Popovers />} />
            <Route path="/progress-bar" element={<Progressbar />} />
            <Route path="/ribbons" element={<Ribbons />} />
            <Route path="/spinners" element={<Spinners />} />
            <Route path="/tabs" element={<Tabs />} />
            <Route path="/tooltips" element={<Tooltips />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/pie-chart" element={<PieChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/two-step-verification" element={<TwoStepVerification />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/success" element={<Success />} />
          <Route path="/five-zero-zero" element={<FiveZeroZero />} />
          <Route path="/five-zero-three" element={<FiveZeroThree />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </Router>
    </>
  );
}
