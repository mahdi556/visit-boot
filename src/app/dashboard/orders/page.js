'use client'

import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

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
        <h1 className="h3 mb-0 fw-bold">مدیریت سفارشات</h1>
        <div className="btn-group">
          <button 
            className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('all')}
          >
            همه
          </button>
          <button 
            className={`btn ${filterStatus === 'PENDING' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            در انتظار
          </button>
          <button 
            className={`btn ${filterStatus === 'DELIVERED' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('DELIVERED')}
          >
            تحویل شده
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>فروشگاه</th>
                  <th>مشتری</th>
                  <th>تاریخ سفارش</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="fw-bold">#ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td>{order.store.name}</td>
                    <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'نامشخص'}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="fw-bold text-success">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          جزئیات
                        </button>
                        <button className="btn btn-outline-success">
                          ویرایش
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-cart display-1 text-muted mb-3"></i>
              <p className="text-muted">
                {filterStatus === 'all' 
                  ? 'هیچ سفارشی یافت نشد' 
                  : `هیچ سفارشی با وضعیت ${filterStatus} یافت نشد`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}