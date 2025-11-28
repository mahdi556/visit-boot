import { useState, useEffect } from "react";
import SalesRepSelector from "@/components/orders/SalesRepSelector";
import DeliveryStatusSelector from "@/components/orders/DeliveryStatusSelector";
import CashPaymentMethod from "@/components/orders/CashPaymentMethod";
import DeliveryDateSection from "@/components/orders/DeliveryDateSection";
import StoreInfo from "./StoreInfo";
import CartItems from "./CartItems";
import CartSummary from "./CartSummary";
import ModalFooter from "./ModalFooter";
import {
  toPersianDate,
  toISOStringWithoutTimezone,
  isValidDate,
  getToday,
  getTomorrow,
} from "@/lib/persian-date-simple";

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
  selectedSalesRep,
  onSalesRepChange,
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [chequeDetails, setChequeDetails] = useState({
    chequeNumber: "",
    dueDate: "",
    bankName: "",
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("PENDING");
  const [cashPaymentDetails, setCashPaymentDetails] = useState({
    method: 'CASH',
    cardNumber: '',
    posDevice: ''
  });
  const [showChequeForm, setShowChequeForm] = useState(false);
  const [showCashPaymentForm, setShowCashPaymentForm] = useState(false);

  // استفاده از selectedSalesRep به عنوان مقدار اولیه
  const [localSelectedSalesRep, setLocalSelectedSalesRep] = useState(selectedSalesRep);

  // تنظیم تاریخ تحویل پیش‌فرض
  useEffect(() => {
    const tomorrow = getTomorrow();
    setDeliveryDate(toISOStringWithoutTimezone(tomorrow));
  }, []);

  // وقتی selectedSalesRep از بیرون تغییر کرد، state داخلی را آپدیت کن
  useEffect(() => {
    setLocalSelectedSalesRep(selectedSalesRep);
  }, [selectedSalesRep]);

  // تنظیم پیش‌فرض روش پرداخت بر اساس نوع اعتبار فروشگاه
  useEffect(() => {
    if (selectedStore) {
      let defaultPaymentMethod = "CASH";

      if (selectedStore.creditEnabled) {
        switch (selectedStore.creditType) {
          case "CREDIT":
            defaultPaymentMethod = "CREDIT";
            break;
          case "CHEQUE":
            defaultPaymentMethod = "CHEQUE";
            break;
          default:
            defaultPaymentMethod = "CASH";
        }
      }

      setPaymentMethod(defaultPaymentMethod);
    }
  }, [selectedStore]);

  // وقتی روش پرداخت تغییر کرد، فرم‌های مربوطه را نمایش/مخفی کن
  useEffect(() => {
    setShowChequeForm(paymentMethod === "CHEQUE");
    setShowCashPaymentForm(paymentMethod === "CASH");
  }, [paymentMethod]);

  // وقتی وضعیت تحویل تغییر کرد، تاریخ تحویل را تنظیم کن
  useEffect(() => {
    if (deliveryStatus === "DELIVERED") {
      // برای تحویل گرم، تاریخ امروز تنظیم شود
      const today = getToday();
      setDeliveryDate(toISOStringWithoutTimezone(today));
    } else {
      // برای سایر حالات، تاریخ فردا تنظیم شود
      const tomorrow = getTomorrow();
      setDeliveryDate(toISOStringWithoutTimezone(tomorrow));
    }
  }, [deliveryStatus]);

  // وقتی وضعیت تحویل تغییر کرد
  const handleDeliveryStatusChange = (status) => {
    setDeliveryStatus(status);
  };

  // وقتی جزئیات پرداخت نقدی تغییر کرد
  const handleCashPaymentChange = (details) => {
    setCashPaymentDetails(details);
  };

  // وقتی تاریخ تحویل تغییر کرد
  const handleDeliveryDateChange = (date) => {
    setDeliveryDate(date);
  };

  const handleSalesRepChange = (repId) => {
    setLocalSelectedSalesRep(repId);
    if (onSalesRepChange) {
      onSalesRepChange(repId);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedStore && !tempOrderMode) {
      alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
      return;
    }

    if (cart.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }

    // اعتبارسنجی فرم چک
    if (paymentMethod === "CHEQUE") {
      if (
        !chequeDetails.chequeNumber ||
        !chequeDetails.dueDate ||
        !chequeDetails.bankName
      ) {
        alert("لطفاً تمام مشخصات چک را تکمیل کنید");
        return;
      }
    }

    // اعتبارسنجی پرداخت نقدی
    if (paymentMethod === "CASH" && deliveryStatus === "DELIVERED") {
      if (cashPaymentDetails.method === "CARD_TRANSFER" && !cashPaymentDetails.cardNumber) {
        alert("لطفاً ۴ رقم آخر کارت را وارد کنید");
        return;
      }
      if (cashPaymentDetails.method === "POS" && !cashPaymentDetails.posDevice) {
        alert("لطفاً نوع کارتخوان را انتخاب کنید");
        return;
      }
    }

    // اعتبارسنجی تاریخ تحویل
    if (!deliveryDate || !isValidDate(deliveryDate)) {
      alert("لطفاً تاریخ تحویل معتبر انتخاب کنید");
      return;
    }

    try {
      const storeCode = tempOrderMode ? "7000" : selectedStore.code;
      const orderStatus = deliveryStatus;
      const orderNotes = tempOrderMode
        ? "فاکتور موقت - انتساب خودکار به فروشگاه 7000"
        : "";

      // محاسبه مجموع از روی cart فعلی
      const currentCartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
      const currentTotalDiscount = cart.reduce((sum, item) => sum + item.discountAmount, 0);

      // آماده کردن داده‌های سفارش
      const orderData = {
        storeCode: storeCode,
        userId: 1,
        salesRepId: localSelectedSalesRep,
        items: cart.map((item) => ({
          productCode: item.product.code,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        totalAmount: currentCartTotal,
        status: orderStatus,
        notes: orderNotes,
        discountAmount: currentTotalDiscount,
        paymentMethod: paymentMethod,
        deliveryDate: deliveryDate,
        ...(paymentMethod === "CHEQUE" && {
          chequeDetails: {
            chequeNumber: chequeDetails.chequeNumber,
            dueDate: chequeDetails.dueDate,
            bankName: chequeDetails.bankName,
          },
        }),
        ...(paymentMethod === "CASH" && deliveryStatus === "DELIVERED" && {
          cashPaymentDetails: cashPaymentDetails,
        }),
        ...(paymentMethod === "CREDIT" &&
          selectedStore?.creditDays && {
            creditDays: selectedStore.creditDays,
          }),
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

        let successMessage = `فاکتور با شماره ${result.orderNumber} ثبت شد.`;
        if (tempOrderMode) {
          successMessage += ` (فاکتور موقت - ارسال به فروشگاه 7000)`;
        } else {
          successMessage += ` (فروشگاه: ${selectedStore.name})`;
        }

        // اضافه کردن اطلاعات روش پرداخت
        const paymentMethodText = {
          CASH: "نقدی",
          CREDIT: "اعتباری",
          CHEQUE: "چکی",
        }[paymentMethod];

        successMessage += ` - روش پرداخت: ${paymentMethodText}`;

        // اضافه کردن اطلاعات وضعیت تحویل
        successMessage += ` - وضعیت تحویل: ${deliveryStatus === 'DELIVERED' ? 'تحویل گرم' : 'در انتظار تحویل'}`;

        if (paymentMethod === "CHEQUE") {
          successMessage += ` - شماره چک: ${chequeDetails.chequeNumber}`;
        }

        if (paymentMethod === "CASH" && deliveryStatus === "DELIVERED") {
          const cashMethodText = {
            CASH: 'نقدی',
            CARD_TRANSFER: `کارت به کارت (${cashPaymentDetails.cardNumber})`,
            POS: `کارتخوان (${cashPaymentDetails.posDevice})`
          }[cashPaymentDetails.method];
          successMessage += ` - روش پرداخت نقدی: ${cashMethodText}`;
        }

        // اضافه کردن تاریخ تحویل
        successMessage += ` - تاریخ تحویل: ${toPersianDate(deliveryDate)}`;

        alert(successMessage);

        // ریست فرم
        setPaymentMethod("CASH");
        setDeliveryStatus("PENDING");
        setCashPaymentDetails({
          method: 'CASH',
          cardNumber: '',
          posDevice: ''
        });
        setChequeDetails({
          chequeNumber: "",
          dueDate: "",
          bankName: "",
        });
        // ریست تاریخ تحویل به فردا
        const tomorrow = getTomorrow();
        setDeliveryDate(toISOStringWithoutTimezone(tomorrow));

        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ثبت فاکتور");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("خطا در ثبت فاکتور: " + error.message);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-tablet-friendly">
        <div className="modal-content">
          <ModalHeader onClose={onClose} />
          <div className="modal-body">
            {/* اطلاعات فروشگاه */}
            <StoreInfo
              selectedStore={selectedStore}
              tempOrderMode={tempOrderMode}
            />

            {/* انتخاب ویزیتور */}
            <div className="mb-4 p-4 bg-light rounded-3 border">
              <label className="form-label fs-5 fw-bold mb-3">
                <i className="bi bi-person-badge me-2"></i>
                ویزیتور مسئول
                {localSelectedSalesRep && (
                  <span className="badge bg-success ms-2 fs-6">پیش‌فرض</span>
                )}
              </label>
              <SalesRepSelector
                selectedRep={localSelectedSalesRep}
                onRepChange={handleSalesRepChange}
                disabled={isCalculatingCart}
              />
              <small className="text-muted fs-6 mt-2 d-block">
                {localSelectedSalesRep 
                  ? "ویزیتور به صورت خودکار انتخاب شده است. در صورت نیاز می‌توانید تغییر دهید."
                  : "انتخاب ویزیتور برای پیگیری سفارش"
                }
              </small>
            </div>

            {/* وضعیت تحویل */}
            <DeliveryStatusSelector
              onDeliveryStatusChange={handleDeliveryStatusChange}
              defaultStatus={deliveryStatus}
            />

            {/* تاریخ تحویل - فقط برای وضعیت غیر از تحویل گرم نمایش داده شود */}
            {deliveryStatus !== "DELIVERED" && (
              <DeliveryDateSection
                deliveryDate={deliveryDate}
                onDeliveryDateChange={handleDeliveryDateChange}
              />
            )}

            {/* روش پرداخت اصلی */}
            <PaymentMethodSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              chequeDetails={chequeDetails}
              onChequeDetailsChange={setChequeDetails}
              showChequeForm={showChequeForm}
              selectedStore={selectedStore}
            />

            {/* روش پرداخت نقدی - فقط برای تحویل گرم */}
            {showCashPaymentForm && deliveryStatus === "DELIVERED" && (
              <CashPaymentMethod
                onPaymentMethodChange={handleCashPaymentChange}
                defaultMethod={cashPaymentDetails.method}
              />
            )}

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
                  paymentMethod={paymentMethod}
                  selectedStore={selectedStore}
                  deliveryDate={deliveryDate}
                  deliveryStatus={deliveryStatus}
                  cashPaymentDetails={cashPaymentDetails}
                />
              </>
            )}
          </div>
          <ModalFooter
            cart={cart}
            selectedStore={selectedStore}
            tempOrderMode={tempOrderMode}
            isCalculatingCart={isCalculatingCart}
            paymentMethod={paymentMethod}
            chequeDetails={chequeDetails}
            deliveryDate={deliveryDate}
            deliveryStatus={deliveryStatus}
            cashPaymentDetails={cashPaymentDetails}
            onClose={onClose}
            onSubmitOrder={handleSubmitOrder}
          />
        </div>
      </div>

      {/* استایل‌های سفارشی برای تبلت */}
      <style jsx>{`
        .modal-tablet-friendly .modal-content {
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        }

        .modal-tablet-friendly .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 3px solid #e9ecef;
        }

        .modal-tablet-friendly .modal-body {
          padding: 2rem;
        }

        .modal-tablet-friendly .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 3px solid #e9ecef;
        }

        @media (max-width: 768px) {
          .modal-tablet-friendly .modal-dialog {
            margin: 1rem;
            max-width: calc(100% - 2rem);
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .modal-tablet-friendly .modal-dialog {
            max-width: 800px;
            margin: 2rem auto;
          }
        }
      `}</style>
    </div>
  );
}

// کامپوننت هدر مودال
function ModalHeader({ onClose }) {
  return (
    <div className="modal-header">
      <h3 className="modal-title fw-bold">
        <i className="bi bi-cart-check text-success me-2 fs-2"></i>
        سبد خرید
      </h3>
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
        style={{ transform: "scale(1.5)" }}
      ></button>
    </div>
  );
}

// کامپوننت سبد خرید خالی
function EmptyCart() {
  return (
    <div className="text-center py-5">
      <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
      <h3 className="text-muted fw-bold">سبد خرید خالی است</h3>
      <p className="text-muted fs-5">محصولاتی به سبد خرید اضافه کنید</p>
    </div>
  );
}

// کامپوننت بخش روش پرداخت
function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
  chequeDetails,
  onChequeDetailsChange,
  showChequeForm,
  selectedStore,
}) {
  const getPaymentMethodIcon = (method) => {
    const icons = {
      CASH: "bi-cash-coin",
      CREDIT: "bi-credit-card",
      CHEQUE: "bi-receipt",
    };
    return icons[method] || "bi-cash-coin";
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      CASH: "success",
      CREDIT: "primary",
      CHEQUE: "warning",
    };
    return colors[method] || "success";
  };

  // تعیین روش‌های پرداخت قابل انتخاب بر اساس تنظیمات فروشگاه
  const getAvailablePaymentMethods = () => {
    if (!selectedStore || !selectedStore.creditEnabled) {
      return ["CASH"]; // فقط نقدی اگر اعتبار فعال نباشد
    }

    const methods = ["CASH"]; // همیشه نقدی موجود است

    if (
      selectedStore.creditType === "CREDIT" ||
      selectedStore.creditType === "CHEQUE"
    ) {
      methods.push(selectedStore.creditType);
    }

    return methods;
  };

  const availableMethods = getAvailablePaymentMethods();
  const isMethodDisabled = (method) => !availableMethods.includes(method);

  const getStoreCreditInfo = () => {
    if (!selectedStore || !selectedStore.creditEnabled) return null;

    const creditTypeText = {
      CASH: "نقدی",
      CREDIT: "اعتباری",
      CHEQUE: "چکی",
    }[selectedStore.creditType];

    let info = `این فروشگاه به صورت ${creditTypeText} فعالیت می‌کند`;

    if (selectedStore.creditLimit) {
      info += ` - سقف اعتبار: ${selectedStore.creditLimit.toLocaleString(
        "fa-IR"
      )} تومان`;
    }

    if (selectedStore.creditDays) {
      info += ` - مدت اعتبار: ${selectedStore.creditDays} روز`;
    }

    return info;
  };

  return (
    <div className="mb-4 p-4 bg-light rounded-3 border">
      <label className="form-label fs-5 fw-bold mb-3">
        <i className="bi bi-wallet2 me-2"></i>
        روش تسویه حساب
        {selectedStore && selectedStore.creditEnabled && (
          <span className="badge bg-primary ms-2 fs-6">اعتباری فعال</span>
        )}
      </label>

      {/* اطلاعات اعتبار فروشگاه */}
      {selectedStore && selectedStore.creditEnabled && (
        <div className="alert alert-info mb-3">
          <i className="bi bi-info-circle me-2"></i>
          <strong>تنظیمات اعتباری فروشگاه:</strong> {getStoreCreditInfo()}
        </div>
      )}

      <div className="row g-3 mb-3">
        {["CASH", "CREDIT", "CHEQUE"].map((method) => (
          <div key={method} className="col-md-4">
            <div className={`form-check card h-100 ${
              paymentMethod === method ? 'border-primary' : ''
            }`}>
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethod"
                id={`payment-${method}`}
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                disabled={isMethodDisabled(method)}
                style={{ transform: "scale(1.2)", marginTop: "0.8rem" }}
              />
              <label
                className={`form-check-label card-body d-flex align-items-center ${
                  isMethodDisabled(method) ? "text-muted" : ""
                }`}
                htmlFor={`payment-${method}`}
              >
                <div>
                  <i
                    className={`bi ${getPaymentMethodIcon(method)} fs-2 ${
                      isMethodDisabled(method)
                        ? "text-secondary"
                        : `text-${getPaymentMethodColor(method)}`
                    } me-3`}
                  ></i>
                  <span className="fw-bold fs-6">
                    {method === "CASH" && "نقدی"}
                    {method === "CREDIT" && "اعتباری"}
                    {method === "CHEQUE" && "چک"}
                  </span>
                  {isMethodDisabled(method) && (
                    <small className="d-block text-muted mt-1">غیرفعال</small>
                  )}
                  {!isMethodDisabled(method) &&
                    method === selectedStore?.creditType && (
                      <small className="d-block text-success mt-1">
                        <i className="bi bi-check-circle me-1"></i>
                        پیش‌فرض فروشگاه
                      </small>
                    )}
                  {!isMethodDisabled(method) &&
                    method === "CREDIT" &&
                    selectedStore?.creditDays && (
                      <small className="d-block text-success mt-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        {selectedStore.creditDays} روز اعتبار
                      </small>
                    )}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* فرم مشخصات چک */}
      {showChequeForm && (
        <div className="mt-4 p-4 bg-white rounded-3 border border-warning">
          <h6 className="fw-bold text-warning mb-3">
            <i className="bi bi-exclamation-circle me-2"></i>
            مشخصات چک
          </h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">شماره چک</label>
              <input
                type="text"
                className="form-control"
                placeholder="مثال: 123456"
                value={chequeDetails.chequeNumber}
                onChange={(e) =>
                  onChequeDetailsChange({
                    ...chequeDetails,
                    chequeNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">تاریخ سررسید</label>
              <input
                type="date"
                className="form-control"
                value={chequeDetails.dueDate}
                onChange={(e) =>
                  onChequeDetailsChange({
                    ...chequeDetails,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">نام بانک</label>
              <input
                type="text"
                className="form-control"
                placeholder="مثال: ملی، ملت، ..."
                value={chequeDetails.bankName}
                onChange={(e) =>
                  onChequeDetailsChange({
                    ...chequeDetails,
                    bankName: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}