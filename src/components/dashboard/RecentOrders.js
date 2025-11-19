'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/orders/recent')
      
      if (!response.ok) {
        throw new Error(`خطا در دریافت داده‌ها: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 Orders received:', data)
      
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        console.error('Expected array but got:', data)
        setOrders([])
        setError('فرمت داده‌ها نامعتبر است')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.message)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'در انتظار', class: 'bg-warning text-dark' },
      CONFIRMED: { label: 'تایید شده', class: 'bg-info' },
      PREPARING: { label: 'در حال آماده‌سازی', class: 'bg-primary' },
      DELIVERING: { label: 'در حال ارسال', class: 'bg-secondary' },
      DELIVERED: { label: 'تحویل شده', class: 'bg-success' },
      CANCELLED: { label: 'لغو شده', class: 'bg-danger' }
    }
    
    const config = statusConfig[status] || { label: status, class: 'bg-secondary' }
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  const formatCurrency = (amount) => {
    if (!amount) return '۰ ریال'
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص'
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">سفارشات اخیر</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>فروشگاه</th>
                  <th>ویزیتور</th>
                  <th>تاریخ</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <tr key={item}>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-10"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-7"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-7"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-5"></span>
                      </div>
                    </td>
                    <td>
                      <div className="placeholder-glow">
                        <span className="placeholder col-4"></span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">سفارشات اخیر</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchRecentOrders}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-cart-check text-primary me-2"></i>
          سفارشات اخیر
        </h5>
        <Link href="/dashboard/orders" className="btn btn-sm btn-outline-primary">
          مشاهده همه
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>شماره سفارش</th>
                <th>فروشگاه</th>
                <th>ویزیتور</th>
                <th>تاریخ</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold">
                      #{order.id.toString().padStart(4, '0')}
                    </td>
                    <td>
                      <div className="fw-bold">{order.store?.name || 'نامشخص'}</div>
                      {order.store?.code && (
                        <small className="text-muted">
                          کد: {order.store.code}
                        </small>
                      )}
                    </td>
                    <td>
                      {order.salesRep ? (
                        <div>
                          <div className="fw-bold text-primary">{order.salesRep.name}</div>
                          <small className="text-muted">کد: {order.salesRep.code}</small>
                        </div>
                      ) : (
                        <span className="text-muted">تعیین نشده</span>
                      )}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="fw-bold text-success">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Link 
                        href={`/dashboard/orders/${order.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted">هیچ سفارشی یافت نشد</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={fetchRecentOrders}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      بارگذاری مجدد
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}