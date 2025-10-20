'use client'

import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    currentStock: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          currentStock: parseInt(formData.currentStock)
        })
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({ name: '', price: '', category: '', currentStock: '' })
        fetchProducts() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDelete = async (productId) => {
    if (confirm('آیا از حذف این محصول مطمئن هستید؟')) {
      try {
        // در اینجا باید API حذف ایجاد کنید
        console.log('Deleting product:', productId)
        fetchProducts() // Refresh
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">مدیریت محصولات</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          محصول جدید
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>نام محصول</th>
                  <th>دسته‌بندی</th>
                  <th>قیمت</th>
                  <th>موجودی</th>
                  <th>تاریخ ایجاد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="fw-bold">{product.name}</td>
                    <td>
                      <span className="badge bg-secondary">{product.category}</span>
                    </td>
                    <td className="text-success">
                      {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                    </td>
                    <td>
                      <span className={`badge ${product.currentStock > 10 ? 'bg-success' : product.currentStock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                        {product.currentStock} عدد
                      </span>
                    </td>
                    <td>
                      {new Date(product.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(product.id)}
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

          {products.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-box display-1 text-muted mb-3"></i>
              <p className="text-muted">هیچ محصولی یافت نشد</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                افزودن اولین محصول
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal برای افزودن محصول */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">افزودن محصول جدید</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">نام محصول</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">قیمت (تومان)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">دسته‌بندی</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="لبنیات">لبنیات</option>
                      <option value="نوشیدنی">نوشیدنی</option>
                      <option value="خشکبار">خشکبار</option>
                      <option value="تنقلات">تنقلات</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">موجودی اولیه</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    انصراف
                  </button>
                  <button type="submit" className="btn btn-primary">
                    ایجاد محصول
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