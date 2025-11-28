import { toPersianDate } from "@/lib/persian-date-simple";

function SubmitOrderButton({
  selectedStore,
  tempOrderMode,
  isCalculatingCart,
  isSubmitDisabled,
  paymentMethod,
  deliveryDate,
  deliveryStatus,
  onSubmitOrder,
}) {
  const getButtonText = () => {
    if (isCalculatingCart) return "در حال محاسبه...";

    const methodText = {
      CASH: "نقدی",
      CREDIT: "اعتباری",
      CHEQUE: "چکی",
    }[paymentMethod];

    const statusText = deliveryStatus === 'DELIVERED' ? 'تحویل گرم' : 'در انتظار';

    return `ثبت فاکتور ${tempOrderMode ? "موقت" : "نهایی"} (${methodText} - ${statusText})`;
  };

  return (
    <button
      type="button"
      className="btn btn-success btn-lg px-5 py-2 fw-bold"
      onClick={onSubmitOrder}
      disabled={isSubmitDisabled}
      style={{ fontSize: "1.2rem" }}
    >
      {isCalculatingCart ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          در حال محاسبه...
        </>
      ) : (
        <>
          <i className="bi bi-check-circle me-2 fs-5"></i>
          {getButtonText()}
          <br />
          <small className="fs-6">تحویل: {toPersianDate(deliveryDate)}</small>
        </>
      )}
    </button>
  );
}

export default function ModalFooter({
  cart,
  selectedStore,
  tempOrderMode,
  isCalculatingCart,
  paymentMethod,
  chequeDetails,
  deliveryDate,
  deliveryStatus,
  cashPaymentDetails,
  onClose,
  onSubmitOrder,
}) {
  const isSubmitDisabled = () => {
    if (!selectedStore && !tempOrderMode) return true;
    if (cart.length === 0) return true;
    if (isCalculatingCart) return true;
    if (!deliveryDate) return true;
    
    // اعتبارسنجی فرم چک
    if (paymentMethod === "CHEQUE") {
      return (
        !chequeDetails.chequeNumber ||
        !chequeDetails.dueDate ||
        !chequeDetails.bankName
      );
    }
    
    // اعتبارسنجی پرداخت نقدی برای تحویل گرم
    if (paymentMethod === "CASH" && deliveryStatus === "DELIVERED") {
      if (cashPaymentDetails.method === "CARD_TRANSFER" && !cashPaymentDetails.cardNumber) {
        return true;
      }
      if (cashPaymentDetails.method === "POS" && !cashPaymentDetails.posDevice) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-secondary btn-lg px-5 py-2"
        onClick={onClose}
      >
        <i className="bi bi-x-circle me-2 fs-5"></i>
        بستن
      </button>
      {cart.length > 0 && (
        <SubmitOrderButton
          selectedStore={selectedStore}
          tempOrderMode={tempOrderMode}
          isCalculatingCart={isCalculatingCart}
          isSubmitDisabled={isSubmitDisabled()}
          paymentMethod={paymentMethod}
          deliveryDate={deliveryDate}
          deliveryStatus={deliveryStatus}
          onSubmitOrder={onSubmitOrder}
        />
      )}
    </div>
  );
}