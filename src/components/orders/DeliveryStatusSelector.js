// 📂 src/components/orders/DeliveryStatusSelector.js
import { useState } from 'react';

export default function DeliveryStatusSelector({ 
  onDeliveryStatusChange,
  defaultStatus = 'PENDING'
}) {
  const [deliveryStatus, setDeliveryStatus] = useState(defaultStatus);

  const handleStatusChange = (status) => {
    setDeliveryStatus(status);
    onDeliveryStatusChange(status);
  };

  return (
    <div className="mb-4 p-4 bg-light rounded-3 border">
      <label className="form-label fs-5 fw-bold mb-3">
        <i className="bi bi-truck me-2"></i>
        وضعیت تحویل
      </label>
      
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-check card h-100">
            <input
              className="form-check-input"
              type="radio"
              name="deliveryStatus"
              id="delivery-hot"
              value="DELIVERED"
              checked={deliveryStatus === 'DELIVERED'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
            />
            <label className="form-check-label card-body d-flex align-items-center" htmlFor="delivery-hot">
              <div>
                <i className="bi bi-fire text-success fs-2 me-3"></i>
                <span className="fw-bold fs-6">تحویل گرم</span>
                <small className="d-block text-success mt-1">
                  <i className="bi bi-check-circle me-1"></i>
                  سفارش بلافاصله تحویل داده می‌شود
                </small>
              </div>
            </label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-check card h-100">
            <input
              className="form-check-input"
              type="radio"
              name="deliveryStatus"
              id="delivery-pending"
              value="PENDING"
              checked={deliveryStatus === 'PENDING'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
            />
            <label className="form-check-label card-body d-flex align-items-center" htmlFor="delivery-pending">
              <div>
                <i className="bi bi-clock text-warning fs-2 me-3"></i>
                <span className="fw-bold fs-6">در انتظار تحویل</span>
                <small className="d-block text-warning mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  سفارش برای تحویل بعدی برنامه‌ریزی می‌شود
                </small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-3 alert alert-info">
        <i className="bi bi-lightbulb me-2"></i>
        <strong>راهنما:</strong> 
        {deliveryStatus === 'DELIVERED' 
          ? ' در تحویل گرم، سفارش بلافاصله آماده و ارسال می‌شود.' 
          : ' در حالت عادی، سفارش در نوبت تحویل قرار می‌گیرد.'
        }
      </div>
    </div>
  );
}