import {
  toPersianDate,
  toISOStringWithoutTimezone,
  isValidDate,
  getToday,
  getTomorrow,
  getDayAfterTomorrow,
  getThreeDaysLater,
} from "@/lib/persian-date-simple";

export default function DeliveryDateSection({ deliveryDate, onDeliveryDateChange }) {
  const today = toISOStringWithoutTimezone(getToday());
  const tomorrow = toISOStringWithoutTimezone(getTomorrow());

  const getQuickDateOptions = () => [
    {
      value: today,
      label: "امروز",
      persianDate: isValidDate(today)
        ? toPersianDate(today)
        : "تعیین نشده",
    },
    {
      value: tomorrow,
      label: "فردا",
      persianDate: isValidDate(tomorrow)
        ? toPersianDate(tomorrow)
        : "تعیین نشده",
    },
    {
      value: toISOStringWithoutTimezone(getDayAfterTomorrow()),
      label: "پس‌فردا",
      persianDate: isValidDate(getDayAfterTomorrow())
        ? toPersianDate(getDayAfterTomorrow())
        : "تعیین نشده",
    },
    {
      value: toISOStringWithoutTimezone(getThreeDaysLater()),
      label: "۳ روز دیگر",
      persianDate: isValidDate(getThreeDaysLater())
        ? toPersianDate(getThreeDaysLater())
        : "تعیین نشده",
    },
  ];

  return (
    <div className="mb-4 p-4 bg-light rounded-3 border">
      <label className="form-label fs-5 fw-bold mb-3">
        <i className="bi bi-calendar-check me-2"></i>
        تاریخ تحویل
      </label>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-bold">انتخاب سریع</label>
          <div className="d-flex gap-2 flex-wrap">
            {getQuickDateOptions().map((option) => (
              <button
                key={option.value}
                type="button"
                className={`btn ${
                  deliveryDate === option.value
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => onDeliveryDateChange(option.value)}
              >
                {option.label}
                <br />
                <small>{option.persianDate}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">انتخاب دستی تاریخ</label>
          <input
            type="date"
            className="form-control form-control-lg"
            value={deliveryDate || ""}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            min={today}
          />
          {deliveryDate && isValidDate(deliveryDate) && (
            <div className="mt-2 p-2 bg-info bg-opacity-10 rounded">
              <i className="bi bi-info-circle text-info me-2"></i>
              <strong>تاریخ انتخابی:</strong> {toPersianDate(deliveryDate)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 alert alert-info">
        <i className="bi bi-lightbulb me-2"></i>
        <strong>راهنما:</strong> تاریخ تحویل پیش‌فرض فردا تنظیم شده است.
        می‌توانید از دکمه‌های سریع استفاده کنید یا تاریخ مورد نظر را به صورت
        دستی انتخاب نمایید.
      </div>
    </div>
  );
}