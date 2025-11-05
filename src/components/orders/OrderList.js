'use client'

import { useState } from 'react'
import InvoiceModal from '@/components/invoice/InvoiceModal'

export default function OrderList({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)

  const handleShowInvoice = (order) => {
    setSelectedOrder(order)
    setShowInvoice(true)
  }

  return (
    <>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>شماره سفارش</th>
            <th>فروشگاه</th>
            <th>کد فروشگاه</th> {/* اضافه شده */}
            <th>مبلغ</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.store.name}</td>
              <td>
                <span className="badge bg-secondary">{order.store.code}</span> {/* اضافه شده */}
              </td>
              <td>{order.totalAmount.toLocaleString()} تومان</td>
              <td>{new Date(order.orderDate).toLocaleDateString('fa-IR')}</td>
              <td>
                <span className={`badge ${getStatusBadge(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleShowInvoice(order)}
                >
                  <i className="bi bi-receipt me-1"></i>
                  فاکتور
                </button>
                {/* سایر دکمه‌ها */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          show={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  )
}

function getStatusBadge(status) {
  const badges = {
    PENDING: 'bg-warning',
    PAID: 'bg-success',
    CANCELLED: 'bg-danger'
  }
  return badges[status] || 'bg-secondary'
}

function getStatusText(status) {
  const texts = {
    PENDING: 'در انتظار پرداخت',
    PAID: 'پرداخت شده',
    CANCELLED: 'لغو شده'
  }
  return texts[status] || status
}