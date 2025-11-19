// 📂 src/components/maps/RouteStoresManager.js
import { useState, useEffect } from 'react'

export default function RouteStoresManager({ route, onClose, onStoresUpdated }) {
  const [stores, setStores] = useState([])
  const [availableStores, setAvailableStores] = useState([])
  const [selectedStores, setSelectedStores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRouteStores()
    fetchAvailableStores()
  }, [route])

  const fetchRouteStores = async () => {
    try {
      const response = await fetch(`/api/routes/${route.id}/stores`)
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching route stores:', error)
    }
  }

  const fetchAvailableStores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stores')
      if (response.ok) {
        const allStores = await response.json()
        // فقط فروشگاه‌هایی که مسیر ندارند یا مسیرشان متفاوت است
        const available = allStores.filter(store => 
          !store.routeId || store.routeId !== route.id
        )
        setAvailableStores(available)
      }
    } catch (error) {
      console.error('Error fetching available stores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStores = async () => {
    if (selectedStores.length === 0) {
      alert('لطفاً حداقل یک فروشگاه انتخاب کنید')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/routes/${route.id}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeIds: selectedStores
        })
      })

      if (response.ok) {
        await fetchRouteStores()
        await fetchAvailableStores()
        setSelectedStores([])
        if (onStoresUpdated) onStoresUpdated()
        alert('فروشگاه‌ها با موفقیت به مسیر اضافه شدند')
      } else {
        const error = await response.json()
        alert(error.error || 'خطا در اضافه کردن فروشگاه‌ها')
      }
    } catch (error) {
      console.error('Error adding stores:', error)
      alert('خطا در اضافه کردن فروشگاه‌ها')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveStore = async (storeId) => {
    if (!confirm('آیا از حذف این فروشگاه از مسیر اطمینان دارید؟')) return

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: null
        })
      })

      if (response.ok) {
        await fetchRouteStores()
        await fetchAvailableStores()
        if (onStoresUpdated) onStoresUpdated()
        alert('فروشگاه از مسیر حذف شد')
      } else {
        const error = await response.json()
        alert(error.error || 'خطا در حذف فروشگاه')
      }
    } catch (error) {
      console.error('Error removing store:', error)
      alert('خطا در حذف فروشگاه')
    }
  }

  const filteredAvailableStores = availableStores.filter(store =>
    store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.code?.includes(searchTerm) ||
    store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shop me-2"></i>
              مدیریت فروشگاه‌های مسیر - {route.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* ستون سمت راست: فروشگاه‌های موجود در مسیر */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-check-circle me-2"></i>
                      فروشگاه‌های این مسیر
                      <span className="badge bg-light text-success ms-2">
                        {stores.length} فروشگاه
                      </span>
                    </h6>
                  </div>
                  <div className="card-body">
                    {stores.length > 0 ? (
                      <div className="table-responsive" style={{ maxHeight: '400px' }}>
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>نام فروشگاه</th>
                              <th>کد</th>
                              <th>تعداد سفارشات</th>
                              <th>عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stores.map(store => (
                              <tr key={store.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-shop text-muted me-2"></i>
                                    {store.name}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">{store.code}</span>
                                </td>
                                <td>
                                  <span className="badge bg-info">
                                    {store._count?.orders || 0}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveStore(store.id)}
                                    disabled={isSubmitting}
                                  >
                                    <i className="bi bi-x-circle"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inboxes display-6 d-block mb-2"></i>
                        <p>هنوز فروشگاهی به این مسیر اضافه نشده است</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ستون سمت چپ: فروشگاه‌های قابل اضافه کردن */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-plus-circle me-2"></i>
                      افزودن فروشگاه جدید
                    </h6>
                  </div>
                  <div className="card-body">
                    {/* جستجو */}
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="جستجوی فروشگاه (نام، کد، مالک)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* لیست فروشگاه‌های قابل انتخاب */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-3">
                      {isLoading ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm text-primary"></div>
                          <span className="ms-2">در حال بارگذاری...</span>
                        </div>
                      ) : filteredAvailableStores.length > 0 ? (
                        filteredAvailableStores.map(store => (
                          <div key={store.id} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedStores.includes(store.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStores(prev => [...prev, store.id])
                                } else {
                                  setSelectedStores(prev => prev.filter(id => id !== store.id))
                                }
                              }}
                              id={`store-${store.id}`}
                            />
                            <label className="form-check-label w-100" htmlFor={`store-${store.id}`}>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{store.name}</strong>
                                  <small className="text-muted d-block">
                                    کد: {store.code} | {store.ownerName}
                                  </small>
                                </div>
                                {store.routeId && (
                                  <span className="badge bg-warning text-dark small">
                                    دارای مسیر دیگر
                                  </span>
                                )}
                              </div>
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">
                          <i className="bi bi-search display-6 d-block mb-2"></i>
                          <p>فروشگاهی برای نمایش وجود ندارد</p>
                        </div>
                      )}
                    </div>

                    {/* دکمه افزودن */}
                    <button
                      className="btn btn-success w-100"
                      onClick={handleAddStores}
                      disabled={selectedStores.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          در حال افزودن...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          افزودن فروشگاه‌های انتخاب شده ({selectedStores.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* آمار کلی */}
            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h4 className="text-primary">{stores.length}</h4>
                    <small className="text-muted">فروشگاه در این مسیر</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h4 className="text-success">
                      {stores.reduce((sum, store) => sum + (store._count?.orders || 0), 0)}
                    </h4>
                    <small className="text-muted">کل سفارشات</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h4 className="text-info">{availableStores.length}</h4>
                    <small className="text-muted">فروشگاه قابل اضافه کردن</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}