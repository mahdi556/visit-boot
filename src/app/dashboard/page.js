import StatsCards from '@/components/dashboard/StatsCards'
import SalesChart from '@/components/dashboard/SalesChart'
import StoreMap from '@/components/stores/StoreMap'
import RecentOrders from '@/components/dashboard/RecentOrders'

export const metadata = {
  title: 'داشبورد - سیستم پخش مویرگی',
}

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

      {/* Charts and Maps */}
      <div className="row mb-4">
        <div className="col-xl-8 mb-4">
          <SalesChart />
        </div>
        <div className="col-xl-4 mb-4">
          <StoreMap />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  )
}