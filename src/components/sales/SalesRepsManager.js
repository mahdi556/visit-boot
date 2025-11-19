// 📂 src/components/sales/SalesRepsManager.js
import { useState, useEffect } from 'react'

export default function SalesRepsManager() {
  const [salesReps, setSalesReps] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRep, setEditingRep] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    isActive: true
  })

  useEffect(() => {
    fetchSalesReps()
  }, [])

  const fetchSalesReps = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sales-reps')
      if (response.ok) {
        const data = await response.json()
        setSalesReps(data)
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const url = editingRep ? `/api/sales-reps/${editingRep.id}` : '/api/sales-reps'
      const method = editingRep ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        if (editingRep) {
          setSalesReps(prev => prev.map(rep => 
            rep.id === editingRep.id ? result : rep
          ))
        } else {
          setSalesReps(prev => [result, ...prev])
        }

        setShowModal(false)
        resetForm()
        alert(editingRep ? 'ویزیتور با موفقیت ویرایش شد' : 'ویزیتور با موفقیت ایجاد شد')
      } else {
        alert(result.error || 'خطا در ذخیره ویزیتور')
      }
    } catch (error) {
      console.error('Error saving sales rep:', error)
      alert('خطا در ذخیره ویزیتور')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (rep) => {
    setEditingRep(rep)
    setFormData({
      code: rep.code,
      name: rep.name,
      phone: rep.phone || '',
      email: rep.email || '',
      isActive: rep.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (repId) => {
    if (!confirm('آیا از حذف این ویزیتور اطمینان دارید؟')) return

    try {
      const response = await fetch(`/api/sales-reps/${repId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setSalesReps(prev => prev.filter(rep => rep.id !== repId))
        alert('ویزیتور با موفقیت حذف شد')
      } else {
        alert(result.error || 'خطا در حذف ویزیتور')
      }
    } catch (error) {
      console.error('Error deleting sales rep:', error)
      alert('خطا در حذف ویزیتور')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      phone: '',
      email: '',
      isActive: true
    })
    setEditingRep(null)
    setShowModal(false)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-person-badge me-2"></i>
          مدیریت ویزیتورها
        </h5>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          ویزیتور جدید
        </button>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>کد</th>
                <th>نام</th>
                <th>تلفن</th>
                <th>ایمیل</th>
                <th>تعداد سفارشات</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {salesReps.map(rep => (
                <tr key={rep.id}>
                  <td>
                    <strong>{rep.code}</strong>
                  </td>
                  <td>{rep.name}</td>
                  <td>{rep.phone || '-'}</td>
                  <td>{rep.email || '-'}</td>
                  <td>
                    <span className="badge bg-info">
                      {rep._count?.orders || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${rep.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {rep.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEdit(rep)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(rep.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salesReps.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-person-badge display-1 d-block mb-3"></i>
            <p>هنوز ویزیتوری تعریف نشده است</p>
          </div>
        )}
      </div>

      {/* مودال ایجاد/ویرایش ویزیتور */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRep ? 'ویرایش ویزیتور' : 'ویزیتور جدید'}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">کد ویزیتور *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">نام *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">تلفن</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">ایمیل</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        disabled={isSubmitting}
                      />
                      <label className="form-check-label">
                        ویزیتور فعال
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    انصراف
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        در حال ذخیره...
                      </>
                    ) : (
                      editingRep ? 'ویرایش ویزیتور' : 'ایجاد ویزیتور'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}