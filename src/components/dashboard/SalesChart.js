'use client'

export default function SalesChart() {
  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title mb-0">روند فروش ماهانه</h5>
      </div>
      <div className="card-body">
        <div className="chart-container h-100">
          <div className="chart-placeholder h-100">
            <i className="bi bi-bar-chart"></i>
            <p>نمودار فروش ماهانه</p>
          </div>
        </div>
      </div>
    </div>
  )
}