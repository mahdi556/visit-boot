export default function StoreInfo({ selectedStore, tempOrderMode }) {
  const getStoreCreditDetails = () => {
    if (!selectedStore || !selectedStore.creditEnabled) return null;

    let details = [];

    if (selectedStore.creditLimit) {
      details.push(
        `سقف اعتبار: ${selectedStore.creditLimit.toLocaleString("fa-IR")} تومان`
      );
    }

    if (selectedStore.creditDays && selectedStore.creditType === "CREDIT") {
      details.push(`مدت اعتبار: ${selectedStore.creditDays} روز`);
    }

    if (selectedStore.creditType) {
      const typeText = {
        CASH: "نقدی",
        CREDIT: "اعتباری",
        CHEQUE: "چکی",
      }[selectedStore.creditType];
      details.push(`نوع: ${typeText}`);
    }

    return details.length > 0 ? `(${details.join(" - ")})` : "";
  };

  return (
    <div className="mb-4 p-4 rounded-3 bg-light border">
      {selectedStore ? (
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="fw-bold text-success fs-4 mb-2">
              <i className="bi bi-check-circle me-2"></i>
              فروشگاه انتخاب شده
              {selectedStore.creditEnabled && (
                <span className="badge bg-info ms-2 fs-6">
                  اعتباری{" "}
                  {selectedStore.creditDays
                    ? `${selectedStore.creditDays} روزه`
                    : ""}
                </span>
              )}
            </div>
            <div className="row fs-6">
              <div className="col-md-6 mb-2">
                <strong>نام:</strong> {selectedStore.name}
              </div>
              <div className="col-md-6 mb-2">
                <strong>کد:</strong> {selectedStore.code}
              </div>
              <div className="col-md-6 mb-2">
                <strong>مالک:</strong> {selectedStore.ownerName}
              </div>
              <div className="col-md-6 mb-2">
                <strong>تلفن:</strong> {selectedStore.phone}
              </div>
              <div className="col-12">
                <strong>آدرس:</strong> {selectedStore.address}
              </div>
              {selectedStore.creditEnabled && (
                <div className="col-12 mt-2">
                  <div className="bg-info bg-opacity-10 p-2 rounded">
                    <i className="bi bi-info-circle text-info me-2"></i>
                    <strong>تنظیمات اعتباری:</strong> {getStoreCreditDetails()}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div
              className={`rounded-3 p-3 ${
                selectedStore.creditEnabled
                  ? "bg-info text-white"
                  : "bg-success text-white"
              }`}
            >
              <i
                className={`bi ${
                  selectedStore.creditEnabled ? "bi-credit-card" : "bi-shop"
                } display-4 mb-2`}
              ></i>
              <div className="fw-bold fs-5">
                {selectedStore.creditEnabled
                  ? "فروشگاه اعتباری"
                  : "فروشگاه فعال"}
              </div>
              {selectedStore.creditEnabled && selectedStore.creditDays && (
                <div className="fs-6 mt-1">
                  {selectedStore.creditDays} روز اعتبار
                </div>
              )}
            </div>
          </div>
        </div>
      ) : tempOrderMode ? (
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="fw-bold text-info fs-4 mb-2">
              <i className="bi bi-shop me-2"></i>
              فاکتور موقت
            </div>
            <div className="fs-6 text-muted">
              این فاکتور به طور خودکار به فروشگاه با کد 7000 ارسال می‌شود
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="bg-info text-white rounded-3 p-3">
              <i className="bi bi-clock display-4 mb-2"></i>
              <div className="fw-bold fs-5">موقت</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-danger py-4">
          <i className="bi bi-exclamation-triangle display-1 mb-3"></i>
          <h4 className="fw-bold">لطفاً ابتدا فروشگاه را انتخاب کنید</h4>
          <p className="fs-5">برای ثبت سفارش نیاز به انتخاب فروشگاه دارید</p>
        </div>
      )}
    </div>
  );
}