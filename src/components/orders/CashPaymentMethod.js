// 📂 src/components/orders/CashPaymentMethod.js
import { useState } from 'react';

export default function CashPaymentMethod({ 
  onPaymentMethodChange,
  defaultMethod = 'CASH'
}) {
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [cardNumber, setCardNumber] = useState('');
  const [posDevice, setPosDevice] = useState('');

  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    onPaymentMethodChange({
      method: method,
      cardNumber: method === 'CARD_TRANSFER' ? cardNumber : '',
      posDevice: method === 'POS' ? posDevice : ''
    });
  };

  const handleCardNumberChange = (number) => {
    const last4Digits = number.replace(/\D/g, '').slice(-4);
    setCardNumber(last4Digits);
    onPaymentMethodChange({
      method: paymentMethod,
      cardNumber: last4Digits,
      posDevice: posDevice
    });
  };

  const handlePosDeviceChange = (device) => {
    setPosDevice(device);
    onPaymentMethodChange({
      method: paymentMethod,
      cardNumber: cardNumber,
      posDevice: device
    });
  };

  return (
    <div className="mb-4 p-4 bg-light rounded-3 border">
      <label className="form-label fs-5 fw-bold mb-3">
        <i className="bi bi-cash-coin me-2"></i>
        روش پرداخت نقدی
      </label>
      
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="form-check card h-100">
            <input
              className="form-check-input"
              type="radio"
              name="cashPaymentMethod"
              id="cash-cash"
              value="CASH"
              checked={paymentMethod === 'CASH'}
              onChange={(e) => handleMethodChange(e.target.value)}
              style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
            />
            <label className="form-check-label card-body d-flex align-items-center" htmlFor="cash-cash">
              <div>
                <i className="bi bi-cash text-success fs-2 me-3"></i>
                <span className="fw-bold fs-6">پرداخت نقدی</span>
                <small className="d-block text-success mt-1">
                  پرداخت به صورت نقدی انجام شده
                </small>
              </div>
            </label>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="form-check card h-100">
            <input
              className="form-check-input"
              type="radio"
              name="cashPaymentMethod"
              id="cash-card"
              value="CARD_TRANSFER"
              checked={paymentMethod === 'CARD_TRANSFER'}
              onChange={(e) => handleMethodChange(e.target.value)}
              style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
            />
            <label className="form-check-label card-body d-flex align-items-center" htmlFor="cash-card">
              <div>
                <i className="bi bi-credit-card text-primary fs-2 me-3"></i>
                <span className="fw-bold fs-6">کارت به کارت</span>
                <small className="d-block text-primary mt-1">
                  انتقال از طریق کارت بانکی
                </small>
              </div>
            </label>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="form-check card h-100">
            <input
              className="form-check-input"
              type="radio"
              name="cashPaymentMethod"
              id="cash-pos"
              value="POS"
              checked={paymentMethod === 'POS'}
              onChange={(e) => handleMethodChange(e.target.value)}
              style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
            />
            <label className="form-check-label card-body d-flex align-items-center" htmlFor="cash-pos">
              <div>
                <i className="bi bi-receipt text-warning fs-2 me-3"></i>
                <span className="fw-bold fs-6">کارتخوان</span>
                <small className="d-block text-warning mt-1">
                  پرداخت با دستگاه پوز
                </small>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* فیلدهای اضافی برای کارت به کارت */}
      {paymentMethod === 'CARD_TRANSFER' && (
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label fw-bold">
              <i className="bi bi-credit-card-2-front text-primary me-2"></i>
              ۴ رقم آخر کارت مبدا
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="مثال: 1234"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              maxLength={4}
              pattern="[0-9]{4}"
            />
            <small className="text-muted">
              فقط ۴ رقم آخر کارت بانکی را وارد کنید
            </small>
          </div>
        </div>
      )}

      {/* فیلدهای اضافی برای کارتخوان */}
      {paymentMethod === 'POS' && (
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label fw-bold">
              <i className="bi bi-device-ssd text-warning me-2"></i>
              نوع کارتخوان
            </label>
            <select
              className="form-control"
              value={posDevice}
              onChange={(e) => handlePosDeviceChange(e.target.value)}
            >
              <option value="">انتخاب کنید</option>
              <option value="SADAD">شبکه شتاب (سداد)</option>
              <option value="PARSIAN">پارسیان</option>
              <option value="MELLAT">ملت</option>
              <option value="SAMAN">سامان</option>
              <option value="PASARGAD">پاسارگاد</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-3 alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        <strong>توجه:</strong> این اطلاعات برای گزارش‌گیری و پیگیری مالی ثبت می‌شود.
      </div>
    </div>
  );
}