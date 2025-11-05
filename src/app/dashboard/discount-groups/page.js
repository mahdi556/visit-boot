// 📂 src/app/dashboard/discount-groups/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DiscountGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsResponse, productsResponse] = await Promise.all([
        fetch("/api/discount-groups"),
        fetch("/api/products"),
      ]);

      const groupsData = await groupsResponse.json();
      const productsData = await productsResponse.json();

      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setGroups([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">مدیریت گروه‌های تخفیف</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          گروه جدید
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="row">
          {groups.map((group) => (
            <div key={group.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">{group.name}</h5>
                  {group.description && (
                    <p className="text-muted mb-0 small">{group.description}</p>
                  )}
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>محصولات گروه:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {group.groupProducts.map((gp) => (
                        <span key={gp.id} className="badge bg-secondary">
                          {gp.product.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6>سطوح تخفیف:</h6>
                    {group.groupTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="d-flex justify-content-between align-items-center mb-1"
                      >
                        <span>خرید {tier.minQuantity}+ عدد از گروه:</span>
                        <span className="text-success fw-bold">
                          {Math.round(tier.discountRate * 100)}% تخفیف
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer">
                  <Link
                    href={`/dashboard/discount-groups/${group.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    ویرایش
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-collection display-1 text-muted mb-3"></i>
          <h5 className="text-muted">هیچ گروه تخفیفی تعریف نشده</h5>
          <p className="text-muted mb-4">
            گروه‌های تخفیف اجازه می‌دهند تخفیف بر اساس مجموع خرید از چند محصول
            خاص اعمال شود.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ایجاد اولین گروه تخفیف
          </button>
        </div>
      )}

      {/* مودال ایجاد گروه جدید */}
      {showModal && (
        <DiscountGroupForm
          products={products}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// کامپوننت فرم ایجاد گروه (ساده‌شده)
// در فایل src/app/dashboard/discount-groups/page.js - بخش DiscountGroupForm
function DiscountGroupForm({ products, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedProducts: [],
    tiers: [
      { minQuantity: 1, discountRate: 0 }, // سطح پیش‌فرض - بدون تخفیف
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی
    if (formData.selectedProducts.length === 0) {
      alert("لطفاً حداقل یک محصول انتخاب کنید");
      return;
    }

    if (formData.tiers.length === 0) {
      alert("لطفاً حداقل یک سطح تخفیف تعریف کنید");
      return;
    }

    // حذف سطح "بدون تخفیف" اگر کاربر آن را تغییر نداده
    const finalTiers = formData.tiers.filter(
      (tier) => !(tier.minQuantity === 1 && tier.discountRate === 0)
    );

    // اگر همه سطوح حذف شدند، یک سطح پیش‌فرض اضافه کن
    const tiersToSubmit = finalTiers.length > 0 ? finalTiers : formData.tiers;

    const submitData = {
      name: formData.name,
      description: formData.description,
      productCodes: formData.selectedProducts,
      tiers: tiersToSubmit.map((tier) => ({
        minQuantity: tier.minQuantity,
        discountRate: tier.discountRate / 100,
        description: `تخفیف ${tier.discountRate}% برای خرید ${tier.minQuantity}+ عدد از گروه`,
      })),
    };

    try {
      const response = await fetch("/api/discount-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSuccess();
        alert("گروه تخفیف با موفقیت ایجاد شد");
      } else {
        const error = await response.json();
        alert(error.error || "خطا در ایجاد گروه");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("خطا در ایجاد گروه");
    }
  };

  // اضافه کردن سطح جدید
  const addTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1];
    const newMinQuantity = lastTier ? lastTier.minQuantity + 1 : 1;
    const newDiscountRate = lastTier ? lastTier.discountRate + 5 : 5;

    setFormData({
      ...formData,
      tiers: [
        ...formData.tiers,
        {
          minQuantity: newMinQuantity,
          discountRate: Math.min(newDiscountRate, 100),
        },
      ],
    });
  };

  // حذف سطح
  const removeTier = (index) => {
    if (formData.tiers.length > 1) {
      const newTiers = formData.tiers.filter((_, i) => i !== index);
      setFormData({ ...formData, tiers: newTiers });
    } else {
      alert("حداقل یک سطح تخفیف باید وجود داشته باشد");
    }
  };

  // به روزرسانی سطح
  const updateTier = (index, field, value) => {
    const newTiers = [...formData.tiers];

    if (field === "minQuantity") {
      value = Math.max(1, parseInt(value) || 1);
    } else if (field === "discountRate") {
      value = Math.max(0, Math.min(100, parseFloat(value) || 0));
    }

    newTiers[index][field] = value;
    setFormData({ ...formData, tiers: newTiers });
  };

  // مرتب کردن سطوح بر اساس تعداد
  const sortedTiers = [...formData.tiers].sort(
    (a, b) => a.minQuantity - b.minQuantity
  );

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">ایجاد گروه تخفیف جدید</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* بخش اطلاعات گروه */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">نام گروه *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="مثال: گروه لبنیات، گروه خشکبار، ..."
                    />
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
                      placeholder="توضیحات اختیاری درباره گروه"
                    />
                  </div>
                </div>
              </div>

              {/* بخش انتخاب محصولات */}
              <div className="mb-4">
                <label className="form-label">انتخاب محصولات *</label>
                <div
                  className="border rounded p-3"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {products.length > 0 ? (
                    products.map((product) => (
                      <div key={product.id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.selectedProducts.includes(
                            product.code
                          )}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...formData.selectedProducts, product.code]
                              : formData.selectedProducts.filter(
                                  (code) => code !== product.code
                                );
                            setFormData({
                              ...formData,
                              selectedProducts: newSelected,
                            });
                          }}
                        />
                        <label className="form-check-label">
                          {product.name} ({product.code}) -{" "}
                          {product.price?.toLocaleString("fa-IR")} ریال
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      هیچ محصولی یافت نشد
                    </div>
                  )}
                </div>
                <small className="text-muted">
                  محصولاتی که در این گروه تخفیف قرار می‌گیرند
                  {formData.selectedProducts.length > 0 && (
                    <span className="text-success">
                      {" "}
                      ({formData.selectedProducts.length} محصول انتخاب شده)
                    </span>
                  )}
                </small>
              </div>

              {/* بخش سطوح تخفیف */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <label className="form-label mb-0">
                      سطوح تخفیف پلکانی *
                    </label>
                    <small className="text-muted d-block">
                      تعریف تخفیف‌های مختلف بر اساس تعداد کل خرید از گروه
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addTier}
                  >
                    <i className="bi bi-plus me-1"></i>
                    افزودن سطح
                  </button>
                </div>

                <div className="border rounded p-3 bg-light">
                  {sortedTiers.map((tier, index) => {
                    const originalIndex = formData.tiers.findIndex(
                      (t) =>
                        t.minQuantity === tier.minQuantity &&
                        t.discountRate === tier.discountRate
                    );

                    return (
                      <div
                        key={originalIndex}
                        className="row mb-3 pb-3 border-bottom"
                      >
                        <div className="col-md-1 text-center pt-3">
                          <span className="badge bg-secondary">
                            {index + 1}
                          </span>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">
                            حداقل تعداد از گروه
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={tier.minQuantity}
                            onChange={(e) =>
                              updateTier(
                                originalIndex,
                                "minQuantity",
                                e.target.value
                              )
                            }
                            min="1"
                            required
                            placeholder="مثال: 3"
                          />
                          <small className="text-muted">
                            تعداد کل از تمام محصولات گروه
                          </small>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">درصد تخفیف</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              value={tier.discountRate}
                              onChange={(e) =>
                                updateTier(
                                  originalIndex,
                                  "discountRate",
                                  e.target.value
                                )
                              }
                              min="0"
                              max="100"
                              step="0.1"
                              required
                              placeholder="مثال: 10"
                            />
                            <span className="input-group-text">%</span>
                          </div>
                          <small className="text-muted">
                            تخفیف روی محصولات گروه
                          </small>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small d-block">
                            &nbsp;
                          </label>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeTier(originalIndex)}
                            disabled={formData.tiers.length === 1}
                            title="حذف سطح"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* راهنمای سطوح تخفیف */}
                  <div className="alert alert-info mt-3">
                    <div className="d-flex">
                      <i className="bi bi-info-circle me-2 mt-1"></i>
                      <div>
                        <strong>راهنمای سطوح تخفیف:</strong>
                        <ul className="mb-0 mt-2">
                          <li>
                            سیستم به طور خودکار{" "}
                            <strong>بهترین تخفیف ممکن</strong> را اعمال می‌کند
                          </li>
                          <li>
                            مثال: اگر سطوح 3 عدد (10%) و 6 عدد (15%) تعریف کنید:
                          </li>
                          <li>→ خرید 5 عدد: 10% تخفیف (بالاتر از 3 عدد)</li>
                          <li>→ خرید 8 عدد: 15% تخفیف (بالاتر از 6 عدد)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* پیش‌نمایش گروه */}
              {formData.selectedProducts.length > 0 && (
                <div className="alert alert-success">
                  <div className="d-flex">
                    <i className="bi bi-eye me-2 mt-1"></i>
                    <div>
                      <strong>پیش‌نمایش گروه تخفیف:</strong>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <strong>نام گروه:</strong>{" "}
                          {formData.name || "(بدون نام)"}
                        </div>
                        <div className="col-md-6">
                          <strong>تعداد محصولات:</strong>{" "}
                          {formData.selectedProducts.length} محصول
                        </div>
                      </div>
                      {sortedTiers.length > 0 && (
                        <div className="mt-2">
                          <strong>سطوح تخفیف تعریف شده:</strong>
                          <div className="mt-1">
                            {sortedTiers.map((tier, index) => (
                              <div
                                key={index}
                                className="badge bg-success me-2 mb-1"
                              >
                                {tier.minQuantity}+ عدد → {tier.discountRate}%
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                <i className="bi bi-x-circle me-1"></i>
                انصراف
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  formData.selectedProducts.length === 0 || !formData.name
                }
              >
                <i className="bi bi-check-circle me-1"></i>
                ایجاد گروه تخفیف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
