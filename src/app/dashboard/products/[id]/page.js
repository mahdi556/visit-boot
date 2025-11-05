// 📂 src/app/dashboard/products/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [pricingPlans, setPricingPlans] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    fetchProductData();
    fetchPricingPlans();
  }, [productId]);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/pricing-plans`);
      const data = await response.json();
      setPricingPlans(data);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
    }
  };

  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/history`);
      const data = await response.json();
      setProductData(data);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // محاسبه قیمت پایه فروشگاه (12.3% کمتر از قیمت مصرف کننده)
  const calculateStoreBasePrice = (consumerPrice) => {
    return Math.round(consumerPrice * (1 - 0.123));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const handleDeletePlan = async (planId) => {
    if (confirm("آیا از حذف این طرح قیمت مطمئن هستید؟")) {
      try {
        const response = await fetch(`/api/pricing-plans/${planId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("طرح قیمت حذف شد");
          fetchPricingPlans();
        } else {
          alert("خطا در حذف طرح قیمت");
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("خطا در حذف طرح قیمت");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger text-center">
          <h4>محصول یافت نشد</h4>
          <Link href="/dashboard/products" className="btn btn-primary mt-3">
            بازگشت به لیست محصولات
          </Link>
        </div>
      </div>
    );
  }

  const { product, salesHistory, totalSales, totalRevenue } = productData;
  const storeBasePrice = calculateStoreBasePrice(product.price);

  return (
    <div className="container-fluid">
      {/* هدر صفحه */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard" className="text-decoration-none">
                  داشبورد
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  href="/dashboard/products"
                  className="text-decoration-none"
                >
                  محصولات
                </Link>
              </li>
              <li className="breadcrumb-item active">{product.name}</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 fw-bold">{product.name}</h1>
          {product.code && (
            <small className="text-muted">کد: {product.code}</small>
          )}
        </div>
        <div className="btn-group">
          <Link
            href="/dashboard/products"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-right me-2"></i>
            بازگشت
          </Link>
          <button className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>
            ویرایش
          </button>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-primary border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                    قیمت مصرف کننده
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {formatCurrency(product.price)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-tag fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-success border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-success text-uppercase mb-1">
                    قیمت پایه فروشگاه
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {formatCurrency(storeBasePrice)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-shop fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-info border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-info text-uppercase mb-1">
                    تعداد فروش
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {totalSales} عدد
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-cart-check fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-warning border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                    درآمد کل
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {formatCurrency(totalRevenue)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "details" ? "active" : ""
                }`}
                onClick={() => setActiveTab("details")}
              >
                <i className="bi bi-info-circle me-2"></i>
                اطلاعات محصول
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                <i className="bi bi-clock-history me-2"></i>
                تاریخچه فروش
                {salesHistory.length > 0 && (
                  <span className="badge bg-primary ms-2">
                    {salesHistory.length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "pricing" ? "active" : ""
                }`}
                onClick={() => setActiveTab("pricing")}
              >
                <i className="bi bi-tags me-2"></i>
                طرح‌های قیمت‌گذاری
                {pricingPlans.length > 0 && (
                  <span className="badge bg-primary ms-2">
                    {pricingPlans.length}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* تب اطلاعات محصول */}
          {activeTab === "details" && (
            <div className="row">
              <div className="col-md-6">
                <h5 className="border-bottom pb-2 mb-3">مشخصات اصلی</h5>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td width="30%" className="fw-bold">
                        نام محصول:
                      </td>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">قیمت مصرف کننده:</td>
                      <td className="text-success fw-bold">
                        {formatCurrency(product.price)}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">قیمت پایه فروشگاه:</td>
                      <td className="text-primary fw-bold">
                        {formatCurrency(storeBasePrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">دسته‌بندی:</td>
                      <td>
                        <span className="badge bg-secondary">
                          {product.category}
                        </span>
                      </td>
                    </tr>
                    {product.code && (
                      <tr>
                        <td className="fw-bold">کد محصول:</td>
                        <td>{product.code}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-bold">تاریخ ایجاد:</td>
                      <td>{formatDate(product.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-md-6">
                <h5 className="border-bottom pb-2 mb-3">اطلاعات تکمیلی</h5>
                <table className="table table-borderless">
                  <tbody>
                    {product.weight && (
                      <tr>
                        <td width="30%" className="fw-bold">
                          وزن:
                        </td>
                        <td>
                          {product.weight} {product.unit || "گرم"}
                        </td>
                      </tr>
                    )}
                    {product.description && (
                      <tr>
                        <td className="fw-bold">توضیحات:</td>
                        <td>{product.description}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-bold">تعداد کل فروش:</td>
                      <td className="fw-bold text-primary">{totalSales} عدد</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">درآمد کل:</td>
                      <td className="fw-bold text-success">
                        {formatCurrency(totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تب تاریخچه فروش */}
          {activeTab === "history" && (
            <div>
              <h5 className="border-bottom pb-2 mb-3">تاریخچه فروش محصول</h5>

              {salesHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>تاریخ فروش</th>
                        <th>شماره سفارش</th>
                        <th>مشتری</th>
                        <th>فروشگاه</th>
                        <th>تعداد</th>
                        <th>قیمت واحد</th>
                        <th>مبلغ کل</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesHistory.map((sale) => (
                        <tr key={sale.id}>
                          <td>{formatDate(sale.orderDate)}</td>
                          <td>
                            <Link
                              href={`/dashboard/orders/${sale.orderId}`}
                              className="text-decoration-none"
                            >
                              #ORD-{sale.orderId.toString().padStart(4, "0")}
                            </Link>
                          </td>
                          <td>
                            {sale.customer
                              ? `${sale.customer.firstName} ${sale.customer.lastName}`
                              : "مشتری حذف شده"}
                          </td>
                          <td>{sale.store.name}</td>
                          <td>{sale.quantity} عدد</td>
                          <td className="text-success">
                            {formatCurrency(sale.price)}
                          </td>
                          <td className="fw-bold text-primary">
                            {formatCurrency(sale.totalAmount)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                sale.orderStatus === "DELIVERED"
                                  ? "bg-success"
                                  : sale.orderStatus === "COMPLETED"
                                  ? "bg-info"
                                  : "bg-warning"
                              }`}
                            >
                              {sale.orderStatus === "DELIVERED"
                                ? "تحویل شده"
                                : sale.orderStatus === "COMPLETED"
                                ? "تکمیل شده"
                                : sale.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                  <p className="text-muted">
                    هنوز فروشی برای این محصول ثبت نشده است
                  </p>
                </div>
              )}
            </div>
          )}

          {/* تب طرح‌های قیمت‌گذاری */}
          {activeTab === "pricing" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">طرح‌های قیمت‌گذاری محصول</h5>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPricingModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  افزودن سطح قیمت
                </button>
              </div>

              {pricingPlans.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>طرح</th>
                        <th>حداقل تعداد</th>
                        <th>درصد تخفیف</th>
                        <th>قیمت پایه فروشگاه</th>
                        <th>قیمت با تخفیف</th>
                        <th>توضیحات</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingPlans.map((plan) => {
                        const discountedPrice = Math.round(
                          storeBasePrice * (1 - plan.discountRate)
                        );

                        return (
                          <tr key={plan.id}>
                            <td>{plan.pricingPlan.name}</td>
                            <td>
                              <span className="badge bg-info">
                                {plan.minQuantity} عدد
                              </span>
                            </td>
                            <td className="text-success fw-bold">
                              {Math.round(plan.discountRate * 100)}%
                            </td>
                            <td>{formatCurrency(storeBasePrice)}</td>
                            <td className="text-danger fw-bold">
                              {formatCurrency(discountedPrice)}
                            </td>
                            <td>{plan.description || "-"}</td>
                            <td>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeletePlan(plan.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-tags display-1 text-muted mb-3"></i>
                  <p className="text-muted">
                    هیچ طرح قیمت‌گذاری برای این محصول تعریف نشده است
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPricingModal(true)}
                  >
                    افزودن اولین سطح قیمت
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* مودال افزودن طرح قیمت */}
      {showPricingModal && (
        <PricingPlanForm
          product={product}
          storeBasePrice={storeBasePrice}
          onSuccess={() => {
            setShowPricingModal(false);
            fetchPricingPlans();
          }}
          onCancel={() => setShowPricingModal(false)}
        />
      )}
    </div>
  );
}

// کامپوننت فرم افزودن طرح قیمت
function PricingPlanForm({ product, storeBasePrice, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    pricingPlanId: "",
    minQuantity: 3,
    discountRate: 8, // درصد
    description: "",
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch("/api/pricing-plans");
      if (!response.ok) {
        throw new Error("خطا در دریافت طرح‌ها");
      }
      const data = await response.json();
      // مطمئن شویم data یک آرایه است
      setAvailablePlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      setAvailablePlans([]); // در صورت خطا آرایه خالی تنظیم شود
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی
    if (!formData.pricingPlanId) {
      alert("لطفاً یک طرح قیمت‌گذاری انتخاب کنید");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        pricingPlanId: parseInt(formData.pricingPlanId),
        minQuantity: parseInt(formData.minQuantity),
        discountRate: parseFloat(formData.discountRate) / 100, // تبدیل به اعشار
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

  const discountedPrice = Math.round(
    storeBasePrice * (1 - formData.discountRate / 100)
  );

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">افزودن سطح قیمت جدید</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">طرح قیمت‌گذاری *</label>
                    {isLoadingPlans ? (
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">
                            در حال بارگذاری...
                          </span>
                        </div>
                        <span>در حال بارگذاری طرح‌ها...</span>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={formData.pricingPlanId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricingPlanId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">انتخاب طرح</option>
                        {availablePlans && availablePlans.length > 0 ? (
                          availablePlans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}{" "}
                              {plan.description && `- ${plan.description}`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            هیچ طرحی یافت نشد
                          </option>
                        )}
                      </select>
                    )}
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
                      حداقل تعداد برای اعمال این تخفیف
                    </small>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">درصد تخفیف *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.discountRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      max="100"
                      step="1"
                    />
                    <small className="text-muted">
                      درصد تخفیف از قیمت پایه فروشگاه
                    </small>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">توضیحات</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="مثال: تخفیف عمده‌فروشی"
                    />
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <strong>پیش‌نمایش قیمت:</strong>
                <div className="row mt-2">
                  <div className="col-md-4">
                    <small>قیمت مصرف‌کننده:</small>
                    <div className="fw-bold">
                      {product.price?.toLocaleString("fa-IR")} ریال
                    </div>
                  </div>
                  <div className="col-md-4">
                    <small>قیمت پایه فروشگاه:</small>
                    <div className="fw-bold text-primary">
                      {storeBasePrice?.toLocaleString("fa-IR")} ریال
                    </div>
                  </div>
                  <div className="col-md-4">
                    <small>قیمت با تخفیف:</small>
                    <div className="fw-bold text-success">
                      {discountedPrice?.toLocaleString("fa-IR")} ریال
                    </div>
                  </div>
                </div>
                <small className="text-muted mt-2 d-block">
                  اگر مشتری {formData.minQuantity} عدد یا بیشتر بخرد، قیمت هر
                  عدد {discountedPrice?.toLocaleString("fa-IR")} ریال خواهد بود.
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !formData.pricingPlanId}
              >
                {isLoading ? "در حال ذخیره..." : "افزودن سطح قیمت"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
