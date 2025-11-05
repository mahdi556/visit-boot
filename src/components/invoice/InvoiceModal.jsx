'use client'

import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import InvoiceTemplate from './InvoiceTemplate'
import ReceiptTemplate from './ReceiptTemplate'

export default function InvoiceModal({ order, show, onClose }) {
  const componentRef = useRef()
  const [isPrinting, setIsPrinting] = useState(false)
  const [receiptType, setReceiptType] = useState('detailed') // 'detailed' یا 'receipt'

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: receiptType === 'detailed' 
      ? `فاکتور-${order.id}` 
      : `فیش-${order.id}`,
    onBeforeGetContent: () => {
      setIsPrinting(true)
      return new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    }
  })

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-receipt me-2"></i>
              {receiptType === 'detailed' ? 'فاکتور کامل' : 'فیش پرینتر'} - #{order.id.toString().padStart(4, '0')}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isPrinting}
            ></button>
          </div>
          
          {/* انتخاب نوع فاکتور */}
          <div className="modal-body border-bottom">
            <div className="btn-group w-100">
              <button
                type="button"
                className={`btn ${receiptType === 'detailed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setReceiptType('detailed')}
              >
                <i className="bi bi-file-text me-2"></i>
                فاکتور کامل
              </button>
              <button
                type="button"
                className={`btn ${receiptType === 'receipt' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setReceiptType('receipt')}
              >
                <i className="bi bi-receipt-cutoff me-2"></i>
                فیش پرینتر
              </button>
            </div>
          </div>

          <div className="modal-body">
            <div ref={componentRef}>
              {receiptType === 'detailed' ? (
                <InvoiceTemplate order={order} />
              ) : (
                <ReceiptTemplate order={order} />
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isPrinting}
            >
              بستن
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  در حال آماده‌سازی...
                </>
              ) : (
                <>
                  <i className="bi bi-printer me-2"></i>
                  پرینت {receiptType === 'detailed' ? 'فاکتور' : 'فیش'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}