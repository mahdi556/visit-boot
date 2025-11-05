// 📂 src/components/pricing/PricingPlanForm.jsx
"use client";
import { useState, useEffect } from "react";

export default function PricingPlanForm({ product, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    pricingPlanId: "",
    minQuantity: 1,
    unitPrice: product.price || 0,
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch("/api/pricing-plans");
      const data = await response.json();
      setAvailablePlans(data);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        pricingPlanId: parseInt(formData.pricingPlanId),
        minQuantity: parseInt(formData.minQuantity),
        discountRate: parseFloat(formData.discountRate) / 100, // تبدیل درصد به اعشار
        description: formData.description,
      };

      const response = await fetch(
        `/api/products/${product.id}/pricing-plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("طرح قیمت با موفقیت اضافه شد");
        onSuccess();
      } else {
        alert(result.error || "خطا در افزودن طرح قیمت");
      }
    } catch (error) {
      console.error("Error adding pricing plan:", error);
      alert("خطا در افزودن طرح قیمت");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!product.price || !formData.unitPrice) return 0;
    return (
      ((product.price - formData.unitPrice) / product.price) *
      100
    ).toFixed(1);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">طرح قیمت‌گذاری *</label>
            <select
              className="form-select"
              value={formData.pricingPlanId}
              onChange={(e) =>
                setFormData({ ...formData, pricingPlanId: e.target.value })
              }
              required
            >
              <option value="">انتخاب طرح</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} {plan.description && `- ${plan.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">حداقل تعداد *</label>
            <input
              type="number"
              className="form-control"
              value={formData.minQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minQuantity: parseInt(e.target.value) || 1,
                })
              }
              required
              min="1"
            />
            <small className="text-muted">
              حداقل تعداد برای اعمال این قیمت
            </small>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">قیمت واحد (تومان) *</label>
            <input
              type="number"
              className="form-control"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitPrice: parseFloat(e.target.value) || 0,
                })
              }
              required
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">تخفیف اعمال شده</label>
            <div className="p-3 bg-light rounded">
              <div className="text-center">
                <div className="h4 text-success mb-1">
                  {calculateDiscount()}%
                </div>
                <small className="text-muted">
                  نسبت به قیمت پایه ({product.price?.toLocaleString()} تومان)
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="alert alert-info">
          <small>
            <strong>توضیح:</strong> با این تنظیمات، اگر مشتری حداقل{" "}
            {formData.minQuantity} عدد از این محصول خریداری کند، قیمت هر عدد{" "}
            {formData.unitPrice.toLocaleString()} تومان خواهد بود.
          </small>
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          انصراف
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : "ذخیره طرح قیمت"}
        </button>
      </div>
    </form>
  );
}
