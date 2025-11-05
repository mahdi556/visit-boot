import StatsCards from "@/components/dashboard/StatsCards";
import SalesChart from "@/components/dashboard/SalesChart";
import StoreMap from "@/components/stores/StoreMap";
import RecentOrders from "@/components/dashboard/RecentOrders";
import TopProducts from "@/components/dashboard/TopProducts";

export const metadata = {
  title: "داشبورد - سیستم پخش مویرگی",
};

export default function DashboardPage() {
  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">داشبورد فروش</h1>
        <div className="btn-group">
          <button className="btn btn-outline-primary">امروز</button>
          <button className="btn btn-outline-primary">هفته جاری</button>
          <button className="btn btn-outline-primary active">ماه جاری</button>
          <button className="btn btn-outline-primary">سه ماهه</button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Full Width Map Section */}
      <div className="row mb-4">
        <div className="col-12">
          <StoreMap />
        </div>
      </div>

      {/* Charts and Top Products */}
      <div className="row mb-4">
        {/* Sales Chart */}
        <div className="col-xl-8 mb-4">
          <div className="card h-100">
            <SalesChart />
          </div>
        </div>

        {/* Top Products */}
        <div className="col-xl-4 mb-4">
          <TopProducts />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />

      {/* Quick Order Button */}
      <button
        className="quick-order-btn"
        id="quickOrderBtn"
        data-bs-toggle="modal"
        data-bs-target="#orderModal"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  );
}
