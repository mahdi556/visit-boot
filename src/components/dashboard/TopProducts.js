export default function TopProducts() {
  const topProducts = [
    { id: 1, name: 'شیر پرچرب', code: '00123', icon: 'bi-cup-straw', color: 'text-primary', sales: 452 },
    { id: 2, name: 'ماست کم چرب', code: '00124', icon: 'bi-droplet', color: 'text-success', sales: 387 },
    { id: 3, name: 'پنیر پیتزا', code: '00125', icon: 'bi-egg', color: 'text-warning', sales: 298 },
    { id: 4, name: 'کره گیاهی', code: '00126', icon: 'bi-basket', color: 'text-info', sales: 245 },
    { id: 5, name: 'خامه صبحانه', code: '00127', icon: 'bi-cloud-drizzle', color: 'text-danger', sales: 210 }
  ]

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title mb-0">محصولات پرفروش</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {topProducts.map((product) => (
            <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center px-0 border-0 mb-2">
              <div className="d-flex align-items-center">
                <div className="bg-light rounded p-2 me-3">
                  <i className={`${product.icon} ${product.color}`}></i>
                </div>
                <div>
                  <h6 className="mb-0">{product.name}</h6>
                  <small className="text-muted">کد: {product.code}</small>
                </div>
              </div>
              <span className="badge bg-primary">{product.sales} عدد</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}