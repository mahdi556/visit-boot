// components/dashboard/RecentOrders.js
'use client'

import { useEffect, useState } from 'react'

export default function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/dashboard/orders/recent')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
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
                  <th>تاریخ</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr key={item}>
                    <td colSpan="5">
                      <div className="placeholder-glow">
                        <span className="placeholder col-12"></span>
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

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-cart-check text-primary me-2"></i>
          سفارشات اخیر
        </h5>
        <a href="/dashboard/orders" className="btn btn-sm btn-outline-primary">
          مشاهده همه
        </a>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>شماره سفارش</th>
                <th>فروشگاه</th>
                <th>تاریخ</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-bold">#{order.id}</td>
                  <td>{order.store.name}</td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="fw-bold text-success">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary">
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-4">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <p className="text-muted">هیچ سفارشی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  )
}