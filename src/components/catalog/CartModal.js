// 📂 src/components/catalog/CartModal.js
import { useState, useEffect } from 'react'
import SalesRepSelector from '@/components/orders/SalesRepSelector'

export default function CartModal({
  cart,
  cartTotal,
  isCalculatingCart,
  onRemoveItem,
  onUpdateQuantity,
  onSubmitOrder,
  onClose,
  selectedStore,
  tempOrderMode,
}) {
  const [selectedSalesRep, setSelectedSalesRep] = useState(null)

  const handleSubmitOrder = async () => {
    if (!selectedStore && !tempOrderMode) {
      alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
      return;
    }

    if (cart.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }

    try {
      const storeCode = tempOrderMode ? '7000' : selectedStore.code;
      const orderStatus = 'PENDING';
      const orderNotes = tempOrderMode 
        ? 'فاکتور موقت - انتساب خودکار به فروشگاه 7000' 
        : '';

      const orderData = {
        storeCode: storeCode,
        userId: 1,
        salesRepId: selectedSalesRep,
        items: cart.map((item) => ({
          productCode: item.product.code,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        totalAmount: cartTotal,
        status: orderStatus,
        notes: orderNotes,
        discountAmount: cart.reduce((sum, item) => sum + item.discountAmount, 0),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();

        if (tempOrderMode) {
          alert(`فاکتور موقت با شماره ${result.orderNumber} ثبت شد و به فروشگاه 7000 ارسال شد.`);
        } else {
          alert(`فاکتور نهایی با شماره ${result.orderNumber} برای فروشگاه ${selectedStore.name} ثبت شد.`);
        }

        onClose();
      } else {
        throw new Error("خطا در ثبت فاکتور");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("خطا در ثبت فاکتور");
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-cart-check text-success me-2"></i>
              سبد خرید
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* اطلاعات فروشگاه */}
            <div className="mb-4 p-3 rounded bg-light">
              {selectedStore ? (
                <div className="row">
                  <div className="col-md-6">
                    <strong className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      فروشگاه: {selectedStore.name}
                    </strong>
                    <div className="text-muted small">
                      کد: {selectedStore.code} | تلفن: {selectedStore.phone}
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <div className="text-muted">مالک: {selectedStore.ownerName}</div>
                    <div className="text-muted small">آدرس: {selectedStore.address}</div>
                  </div>
                </div>
              ) : tempOrderMode ? (
                <div className="text-info">
                  <i className="bi bi-shop me-1"></i>
                  <strong>فاکتور موقت - فروشگاه 7000</strong>
                  <div className="text-muted small">
                    این فاکتور به طور خودکار به فروشگاه با کد 7000 ارسال می‌شود
                  </div>
                </div>
              ) : (
                <div className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  لطفاً ابتدا فروشگاه را انتخاب کنید
                </div>
              )}
            </div>

            {/* انتخاب ویزیتور */}
            <div className="mb-4">
              <label className="form-label">
                <i className="bi bi-person-badge me-2"></i>
                ویزیتور مسئول
              </label>
              <SalesRepSelector
                selectedRep={selectedSalesRep}
                onRepChange={setSelectedSalesRep}
                disabled={isCalculatingCart}
              />
              <small className="text-muted">
                انتخاب ویزیتور برای پیگیری سفارش (اختیاری)
              </small>
            </div>
            
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                <CartItems 
                  cart={cart}
                  isCalculatingCart={isCalculatingCart}
                  onRemoveItem={onRemoveItem}
                  onUpdateQuantity={onUpdateQuantity}
                />
                <CartSummary 
                  cart={cart}
                  cartTotal={cartTotal}
                />
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>
              بستن
            </button>
            {cart.length > 0 && (
              <SubmitOrderButton
                selectedStore={selectedStore}
                tempOrderMode={tempOrderMode}
                isCalculatingCart={isCalculatingCart}
                onSubmitOrder={handleSubmitOrder}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-5">
      <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
      <h5 className="text-muted">سبد خرید خالی است</h5>
      <p className="text-muted">محصولاتی به سبد خرید اضافه کنید</p>
    </div>
  );
}

function CartItems({ cart, isCalculatingCart, onRemoveItem, onUpdateQuantity }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>محصول</th>
            <th className="text-center">تعداد</th>
            <th className="text-center">قیمت واحد</th>
            <th className="text-center">تخفیف</th>
            <th className="text-center">جمع</th>
            <th className="text-center">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              isCalculatingCart={isCalculatingCart}
              onRemoveItem={onRemoveItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CartItem({ item, isCalculatingCart, onRemoveItem, onUpdateQuantity }) {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <img
            src={`/images/products/${item.product.code}.jpg`}
            className="rounded me-3"
            alt={item.product.name}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/images/default-product.jpg";
            }}
          />
          <div>
            <div className="fw-bold">{item.product.name}</div>
            <small className="text-muted">کد: {item.product.code}</small>
          </div>
        </div>
      </td>
      <td className="text-center">
        <QuantityControl
          item={item}
          isCalculatingCart={isCalculatingCart}
          onUpdateQuantity={onUpdateQuantity}
        />
      </td>
      <td className="text-center">
        <div className="fw-bold text-success">
          {item.unitPrice.toLocaleString("fa-IR")}
        </div>
        <small className="text-muted">ریال</small>
      </td>
      <td className="text-center">
        {item.appliedDiscountRate > 0 ? (
          <span className="badge bg-success">
            {Math.round(item.appliedDiscountRate * 100)}%
          </span>
        ) : (
          <span className="badge bg-secondary">بدون تخفیف</span>
        )}
      </td>
      <td className="text-center">
        <div className="fw-bold">{item.totalPrice.toLocaleString("fa-IR")}</div>
        <small className="text-muted">ریال</small>
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onRemoveItem(item.product.id)}
          disabled={isCalculatingCart}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
}

function QuantityControl({ item, isCalculatingCart, onUpdateQuantity }) {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
        disabled={isCalculatingCart}
      >
        <i className="bi bi-dash"></i>
      </button>
      <span className="mx-3 fw-bold">
        {item.quantity}
        {isCalculatingCart && (
          <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-1 text-warning"></i>
        )}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        disabled={isCalculatingCart}
      >
        <i className="bi bi-plus"></i>
      </button>
    </div>
  );
}

function CartSummary({ cart, cartTotal }) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discountAmount, 0);

  return (
    <div className="row mt-4">
      <div className="col-md-6">
        <div className="bg-light rounded p-3">
          <h6 className="fw-bold mb-3">خلاصه سفارش</h6>
          <div className="d-flex justify-content-between mb-2">
            <span>تعداد محصولات:</span>
            <span className="fw-bold">{cart.length} محصول</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>تعداد کل اقلام:</span>
            <span className="fw-bold">{totalItems} عدد</span>
          </div>
          <div className="d-flex justify-content-between mb-2 text-success">
            <span>تخفیف کل:</span>
            <span className="fw-bold">
              -{totalDiscount.toLocaleString("fa-IR")} ریال
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <strong className="fs-5">مبلغ قابل پرداخت:</strong>
            <strong className="text-success fs-4">
              {cartTotal.toLocaleString("fa-IR")} ریال
            </strong>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="bg-warning bg-opacity-10 rounded p-3 h-100">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-info-circle me-2"></i>
            راهنمای ثبت فاکتور
          </h6>
          <ul className="small">
            <li>پس از اطمینان از صحت اطلاعات، فاکتور نهایی را ثبت کنید</li>
            <li>فاکتور پس از ثبت، قابل ویرایش نیست</li>
            <li>فاکتورهای موقت به فروشگاه 7000 ارسال می‌شوند</li>
            <li>تخفیف‌ها به صورت خودکار محاسبه شده‌اند</li>
            <li>ویزیتور مسئول برای پیگیری سفارش انتخاب شده است</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SubmitOrderButton({ selectedStore, tempOrderMode, isCalculatingCart, onSubmitOrder }) {
  return (
    <button
      type="button"
      className="btn btn-success"
      onClick={onSubmitOrder}
      disabled={(!selectedStore && !tempOrderMode) || isCalculatingCart}
    >
      {isCalculatingCart ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          در حال محاسبه...
        </>
      ) : (
        <>
          <i className="bi bi-check-circle me-1"></i>
          {tempOrderMode ? "ثبت فاکتور موقت" : "ثبت فاکتور نهایی"}
        </>
      )}
    </button>
  );
}