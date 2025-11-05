// src/app/dashboard/orders/[id]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import InvoiceModal from '@/components/invoice/InvoiceModal'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  // تبدیل orderId به number
  const orderId = parseInt(params.id)
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  })
  const [orderItems, setOrderItems] = useState([])
  const [newItem, setNewItem] = useState({
    productCode: '', // تغییر از productId به productCode
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    if (orderId && !isNaN(orderId)) {
      fetchOrder()
      fetchProducts()
    } else {
      setError('شناسه سفارش نامعتبر است')
      setIsLoading(false)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrder(data)
        setFormData({
          status: data.status,
          notes: data.notes || ''
        })
        // تبدیل items برای استفاده از productCode
        setOrderItems(data.items?.map(item => ({
          ...item,
          productCode: item.product?.code, // استفاده از productCode
          productName: item.product?.name
        })) || [])
      } else {
        setError(data.error || 'سفارش یافت نشد')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const orderData = {
        status: formData.status,
        notes: formData.notes,
        storeCode: order.storeCode, // اضافه کردن storeCode
        items: orderItems.map(item => ({
          productCode: item.productCode, // استفاده از productCode
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)
        setEditMode(false)
        alert('سفارش با موفقیت بروزرسانی شد')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'خطا در بروزرسانی سفارش')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('خطا در بروزرسانی سفارش')
    }
  }

  const handleDelete = async () => {
    if (confirm('آیا از حذف این سفارش مطمئن هستید؟ این عمل قابل بازگشت نیست.')) {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('سفارش با موفقیت حذف شد')
          router.push('/dashboard/orders')
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'خطا در حذف سفارش')
        }
      } catch (error) {
        console.error('Error deleting order:', error)
        alert('خطا در حذف سفارش')
      }
    }
  }

  // مدیریت آیتم‌های سفارش - با productCode
  const handleAddItem = () => {
    if (!newItem.productCode || newItem.quantity <= 0 || newItem.price <= 0) {
      alert('لطفاً تمام فیلدهای مورد نیاز را پر کنید')
      return
    }

    const selectedProduct = products.find(p => p.code === newItem.productCode)
    const existingItemIndex = orderItems.findIndex(item => item.productCode === newItem.productCode)

    if (existingItemIndex >= 0) {
      // اگر محصول قبلاً وجود دارد، تعداد را افزایش می‌دهیم
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity)
      setOrderItems(updatedItems)
    } else {
      // اضافه کردن آیتم جدید
      setOrderItems([...orderItems, {
        id: Date.now(), // ID موقت
        productCode: newItem.productCode, // استفاده از productCode
        productName: selectedProduct?.name,
        quantity: parseInt(newItem.quantity),
        price: parseFloat(newItem.price)
      }])
    }

    // ریست کردن فرم جدید
    setNewItem({
      productCode: '',
      quantity: 1,
      price: 0
    })
  }

  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }

    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
    ))
  }

  const handleUpdateItemPrice = (itemId, newPrice) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, price: parseFloat(newPrice) } : item
    ))
  }

  const handleProductChange = (productCode) => {
    const selectedProduct = products.find(p => p.code === productCode)
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productCode: productCode,
        price: selectedProduct.price || 0
      })
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '۰ تومان'
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص'
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'در انتظار', class: 'bg-warning' },
      CONFIRMED: { label: 'تایید شده', class: 'bg-info' },
      PREPARING: { label: 'در حال آماده‌سازی', class: 'bg-primary' },
      DELIVERING: { label: 'در حال ارسال', class: 'bg-secondary' },
      DELIVERED: { label: 'تحویل شده', class: 'bg-success' },
      CANCELLED: { label: 'لغو شده', class: 'bg-danger' }
    }
    
    const config = statusConfig[status] || { label: status, class: 'bg-secondary' }
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
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

  if (error || !order) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger text-center">
          <h4>{error || 'سفارش یافت نشد'}</h4>
          <div className="mt-3">
            <Link href="/dashboard/orders" className="btn btn-primary me-2">
              بازگشت به لیست سفارشات
            </Link>
            <button 
              className="btn btn-secondary"
              onClick={fetchOrder}
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* هدر صفحه */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard" className="text-decoration-none">
                  داشبورد
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/dashboard/orders" className="text-decoration-none">
                  سفارشات
                </Link>
              </li>
              <li className="breadcrumb-item active">
                سفارش #{order.id.toString().padStart(4, '0')}
              </li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 fw-bold">
            سفارش #{order.id.toString().padStart(4, '0')}
          </h1>
          <small className="text-muted">
            تاریخ ایجاد: {formatDate(order.createdAt)}
          </small>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-success"
            onClick={() => setShowInvoice(true)}
          >
            <i className="bi bi-receipt me-2"></i>
            فاکتور
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => setEditMode(!editMode)}
          >
            <i className="bi bi-pencil me-2"></i>
            {editMode ? 'لغو ویرایش' : 'ویرایش'}
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <i className="bi bi-trash me-2"></i>
            حذف
          </button>
          <Link 
            href="/dashboard/orders" 
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-right me-2"></i>
            بازگشت
          </Link>
        </div>
      </div>

      <div className="row">
        {/* اطلاعات اصلی سفارش */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">مشخصات سفارش</h5>
            </div>
            <div className="card-body">
              {editMode ? (
                <form onSubmit={handleUpdate}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">وضعیت سفارش</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          required
                        >
                          <option value="PENDING">در انتظار</option>
                          <option value="CONFIRMED">تایید شده</option>
                          <option value="PREPARING">در حال آماده‌سازی</option>
                          <option value="DELIVERING">در حال ارسال</option>
                          <option value="DELIVERED">تحویل شده</option>
                          <option value="CANCELLED">لغو شده</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">یادداشت</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          placeholder="یادداشت درباره سفارش..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* فرم اضافه کردن آیتم جدید */}
                  <div className="border rounded p-3 mb-4 bg-light">
                    <h6 className="border-bottom pb-2 mb-3">افزودن کالا به سفارش</h6>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={newItem.productCode}
                          onChange={(e) => handleProductChange(e.target.value)}
                        >
                          <option value="">انتخاب محصول</option>
                          {products.map(product => (
                            <option key={product.code} value={product.code}>
                              {product.name} - {formatCurrency(product.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="تعداد"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                          min="1"
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="قیمت"
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div className="col-md-3">
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={handleAddItem}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          افزودن
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* لیست آیتم‌های سفارش */}
                  <div className="mb-4">
                    <h6 className="border-bottom pb-2 mb-3">لیست کالاها</h6>
                    {orderItems.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>نام کالا</th>
                              <th>کد کالا</th>
                              <th width="100">تعداد</th>
                              <th width="150">قیمت واحد</th>
                              <th width="150">مبلغ کل</th>
                              <th width="80">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderItems.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="fw-bold">
                                    {item.productName || 'محصول حذف شده'}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-info">{item.productCode}</span>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateItemQuantity(item.id, e.target.value)}
                                    min="1"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={item.price}
                                    onChange={(e) => handleUpdateItemPrice(item.id, e.target.value)}
                                    min="0"
                                    step="1000"
                                  />
                                </td>
                                <td className="fw-bold text-primary">
                                  {formatCurrency(item.price * item.quantity)}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-warning">
                              <td colSpan="4" className="text-end fw-bold">جمع کل:</td>
                              <td className="fw-bold">
                                {formatCurrency(calculateTotal())}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted">
                        هیچ کالایی به سفارش اضافه نشده است
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      ذخیره تغییرات
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditMode(false)}
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td width="40%" className="fw-bold">شماره سفارش:</td>
                          <td>#ORD-{order.id.toString().padStart(4, '0')}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">وضعیت:</td>
                          <td>{getStatusBadge(order.status)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">مبلغ کل:</td>
                          <td className="text-success fw-bold">
                            {formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">تاریخ ایجاد:</td>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    {order.notes && (
                      <div className="border rounded p-3 bg-light">
                        <strong>یادداشت:</strong>
                        <p className="mb-0 mt-1">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* نمایش آیتم‌های سفارش در حالت غیر ویرایشی */}
          {!editMode && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">لیست کالاها</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>نام کالا</th>
                        <th>کد کالا</th>
                        <th>تعداد</th>
                        <th>قیمت واحد</th>
                        <th>مبلغ کل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-bold">{item.product?.name || 'محصول حذف شده'}</div>
                            {item.product?.category && (
                              <small className="text-muted">
                                {item.product.category}
                              </small>
                            )}
                          </td>
                          <td>
                            {item.product?.code ? (
                              <span className="badge bg-info">{item.product.code}</span>
                            ) : (
                              <span className="text-muted">ندارد</span>
                            )}
                          </td>
                          <td>{item.quantity} عدد</td>
                          <td className="text-success">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="fw-bold text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-warning">
                        <td colSpan="4" className="text-end fw-bold">جمع کل:</td>
                        <td className="fw-bold">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* اطلاعات جانبی */}
        <div className="col-lg-4">
          {/* اطلاعات مشتری */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">اطلاعات مشتری</h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td className="fw-bold">نام:</td>
                    <td>{order.user?.firstName || 'نامشخص'} {order.user?.lastName || ''}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">ایمیل:</td>
                    <td>{order.user?.email || 'ثبت نشده'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">نام کاربری:</td>
                    <td>{order.user?.username || 'ثبت نشده'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* اطلاعات فروشگاه */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">اطلاعات فروشگاه</h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td className="fw-bold">نام:</td>
                    <td>{order.store?.name || 'نامشخص'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">کد فروشگاه:</td>
                    <td><span className="badge bg-secondary">{order.store?.code}</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">مالک:</td>
                    <td>{order.store?.ownerName || 'نامشخص'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">تلفن:</td>
                    <td>{order.store?.phone || 'ثبت نشده'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">آدرس:</td>
                    <td>{order.store?.address || 'ثبت نشده'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* مودال فاکتور */}
      {order && (
        <InvoiceModal
          order={order}
          show={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  )
}