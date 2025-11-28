import { toPersianDate } from "@/lib/persian-date-simple";

export default function CartSummary({
  cart,
  cartTotal,
  paymentMethod,
  selectedStore,
  deliveryDate,
  deliveryStatus,
  cashPaymentDetails,
}) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalDiscount = cart.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );

  const getPaymentMethodText = () => {
    const methods = {
      CASH: "نقدی",
      CREDIT: "اعتباری",
      CHEQUE: "چکی",
    };
    return methods[paymentMethod] || "نقدی";
  };

  const getPaymentMethodDetails = () => {
    if (!selectedStore) return "";

    if (paymentMethod === "CREDIT" && selectedStore.creditDays) {
      return ` (${selectedStore.creditDays} روزه)`;
    }

    if (paymentMethod === "CHEQUE") {
      return " (چک)";
    }

    return "";
  };

  const getPaymentMethodIcon = () => {
    const icons = {
      CASH: "bi-cash-coin",
      CREDIT: "bi-credit-card",
      CHEQUE: "bi-receipt",
    };
    return icons[paymentMethod] || "bi-cash-coin";
  };

  const getCashPaymentDetails = () => {
    if (paymentMethod !== "CASH" || deliveryStatus !== "DELIVERED") return null;

    const methodText = {
      CASH: "نقدی",
      CARD_TRANSFER: `کارت به کارت (${cashPaymentDetails.cardNumber})`,
      POS: `کارتخوان (${cashPaymentDetails.posDevice})`,
    }[cashPaymentDetails.method];

    return methodText;
  };

  return (
    <div className="row mt-5">
      <div className="col-lg-7">
        <div className="bg-light rounded-3 p-4 border">
          <h4 className="fw-bold mb-4 text-primary">
            <i className="bi bi-receipt me-2"></i>
            خلاصه سفارش
          </h4>
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded">
            <span className="fs-5">تعداد محصولات:</span>
            <span className="fw-bold fs-5">{cart.length} محصول</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded">
            <span className="fs-5">تعداد کل اقلام:</span>
            <span className="fw-bold fs-5">{totalItems} عدد</span>
          </div>

          {/* وضعیت تحویل - جدید */}
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-info bg-opacity-10 rounded border border-info">
            <span className="fs-5">
              <i
                className={`bi ${
                  deliveryStatus === "DELIVERED"
                    ? "bi-fire text-success"
                    : "bi-clock text-warning"
                } me-2`}
              ></i>
              وضعیت تحویل:
            </span>
            <span
              className={`fw-bold fs-5 ${
                deliveryStatus === "DELIVERED" ? "text-success" : "text-warning"
              }`}
            >
              {deliveryStatus === "DELIVERED" ? "تحویل گرم" : "در انتظار تحویل"}
            </span>
          </div>

          {/* تاریخ تحویل */}
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-info bg-opacity-10 rounded border border-info">
            <span className="fs-5">
              <i className="bi bi-calendar-check text-info me-2"></i>
              تاریخ تحویل:
            </span>
            <span className="fw-bold fs-5 text-info">
              {toPersianDate(deliveryDate)}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded">
            <span className="fs-5">روش پرداخت:</span>
            <span
              className={`fw-bold fs-5 badge bg-${
                paymentMethod === "CASH"
                  ? "success"
                  : paymentMethod === "CREDIT"
                  ? "primary"
                  : "warning"
              }`}
            >
              <i className={`bi ${getPaymentMethodIcon()} me-2`}></i>
              {getPaymentMethodText()}
              {getPaymentMethodDetails()}
            </span>
          </div>

          {/* جزئیات پرداخت نقدی برای تحویل گرم */}
          {paymentMethod === "CASH" && deliveryStatus === "DELIVERED" && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-success bg-opacity-10 rounded border border-success">
              <span className="fs-5">
                <i className="bi bi-credit-card text-success me-2"></i>
                روش پرداخت نقدی:
              </span>
              <span className="fw-bold fs-5 text-success">
                {getCashPaymentDetails()}
              </span>
            </div>
          )}

          {/* نمایش جزئیات اعتبار برای خرید اعتباری */}
          {paymentMethod === "CREDIT" &&
            selectedStore &&
            selectedStore.creditDays && (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-info bg-opacity-10 rounded border border-info">
                <span className="fs-5">
                  <i className="bi bi-calendar-check text-info me-2"></i>
                  مدت اعتبار:
                </span>
                <span className="fw-bold fs-5 text-info">
                  {selectedStore.creditDays} روز
                </span>
              </div>
            )}

          <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded text-success">
            <span className="fs-5">تخفیف کل:</span>
            <span className="fw-bold fs-5">
              -{totalDiscount.toLocaleString("fa-IR")} ریال
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
            <strong className="fs-2 text-dark">مبلغ قابل پرداخت:</strong>
            <strong className="text-success display-5 fw-bold">
              {cartTotal > 0 ? cartTotal.toLocaleString("fa-IR") : "۰"} ریال
            </strong>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="bg-warning bg-opacity-10 rounded-3 p-4 h-100 border border-warning">
          <h4 className="fw-bold mb-4 text-warning">
            <i className="bi bi-info-circle me-2"></i>
            راهنمای ثبت فاکتور
          </h4>
          <ul className="list-unstyled fs-6">
            <li className="mb-3 d-flex align-items-start">
              <i className="bi bi-check-circle text-success me-2 mt-1 fs-5"></i>
              <span>
                پس از اطمینان از صحت اطلاعات، فاکتور نهایی را ثبت کنید
              </span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i
                className={`bi ${
                  deliveryStatus === "DELIVERED"
                    ? "bi-fire text-success"
                    : "bi-clock text-warning"
                } me-2 mt-1 fs-5`}
              ></i>
              <span>
                وضعیت تحویل:{" "}
                {deliveryStatus === "DELIVERED"
                  ? "تحویل گرم"
                  : "در انتظار تحویل"}
              </span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i className="bi bi-calendar-check text-info me-2 mt-1 fs-5"></i>
              <span>تاریخ تحویل: {toPersianDate(deliveryDate)}</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i className="bi bi-exclamation-triangle text-warning me-2 mt-1 fs-5"></i>
              <span>فاکتور پس از ثبت، قابل ویرایش نیست</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i className="bi bi-shop text-info me-2 mt-1 fs-5"></i>
              <span>فاکتورهای موقت به فروشگاه 7000 ارسال می‌شوند</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i className="bi bi-percent text-success me-2 mt-1 fs-5"></i>
              <span>تخفیف‌ها به صورت خودکار محاسبه شده‌اند</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <i
                className={`bi ${getPaymentMethodIcon()} text-primary me-2 mt-1 fs-5`}
              ></i>
              <span>
                روش پرداخت: {getPaymentMethodText()}
                {getPaymentMethodDetails()}
              </span>
            </li>
            {paymentMethod === "CREDIT" && selectedStore?.creditDays && (
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-calendar-check text-info me-2 mt-1 fs-5"></i>
                <span>
                  این فاکتور {selectedStore.creditDays} روز اعتبار دارد
                </span>
              </li>
            )}
            {paymentMethod === "CHEQUE" && (
              <li className="d-flex align-items-start">
                <i className="bi bi-receipt text-warning me-2 mt-1 fs-5"></i>
                <span>مشخصات چک در سیستم ثبت خواهد شد</span>
              </li>
            )}
            {paymentMethod === "CASH" && deliveryStatus === "DELIVERED" && (
              <li className="d-flex align-items-start">
                <i className="bi bi-credit-card text-success me-2 mt-1 fs-5"></i>
                <span>روش پرداخت نقدی: {getCashPaymentDetails()}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
