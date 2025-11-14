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

  const deleteGroup = async (groupId) => {
    if (!confirm("آیا از حذف این گروه تخفیف اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/discount-groups/${groupId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("گروه تخفیف با موفقیت حذف شد");
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || "خطا در حذف گروه");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("خطا در حذف گروه");
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
      {/* هدر صفحه */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold">مدیریت گروه‌های تخفیف</h1>
          <p className="text-muted mb-0">
            تعریف تخفیف‌های پلکانی بر اساس مجموع خرید از گروه‌های محصولات
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          گروه جدید
        </button>
      </div>

      {/* آمار کلی */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{groups.length}</h4>
                  <small>تعداد گروه‌ها</small>
                </div>
                <i className="bi bi-collection fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">
                    {groups.reduce((total, group) => total + group.groupProducts.length, 0)}
                  </h4>
                  <small>محصولات تحت پوشش</small>
                </div>
                <i className="bi bi-box-seam fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">
                    {groups.reduce((total, group) => total + group.groupTiers.length, 0)}
                  </h4>
                  <small>سطوح تخفیف</small>
                </div>
                <i className="bi bi-graph-up fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">
                    {Math.max(...groups.map(group => 
                      Math.max(...group.groupTiers.map(tier => tier.discountRate * 100))
                    ), 0)}%
                  </h4>
                  <small>بیشترین تخفیف</small>
                </div>
                <i className="bi bi-percent fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* لیست گروه‌ها */}
      {groups.length > 0 ? (
        <div className="row">
          {groups.map((group) => (
            <div key={group.id} className="col-xl-4 col-lg-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 text-primary">{group.name}</h5>
                    {group.description && (
                      <p className="text-muted mb-0 small">{group.description}</p>
                    )}
                  </div>
                  <span className={`badge ${group.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {group.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                
                <div className="card-body">
                  {/* محصولات گروه */}
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-box-seam me-1"></i>
                      محصولات گروه ({group.groupProducts.length} محصول)
                    </h6>
                    <div className="d-flex flex-wrap gap-1">
                      {group.groupProducts.slice(0, 4).map((gp) => (
                        <span key={gp.id} className="badge bg-secondary bg-opacity-20 text-dark border">
                          {gp.product.name}
                        </span>
                      ))}
                      {group.groupProducts.length > 4 && (
                        <span className="badge bg-light text-muted border">
                          +{group.groupProducts.length - 4} محصول دیگر
                        </span>
                      )}
                    </div>
                  </div>

                  {/* سطوح تخفیف پلکانی */}
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-graph-up me-1"></i>
                      سطوح تخفیف پلکانی
                    </h6>
                    <div className="bg-light rounded p-2">
                      {group.groupTiers.map((tier, index) => (
                        <div
                          key={tier.id}
                          className="d-flex justify-content-between align-items-center mb-1 px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">{tier.minQuantity}+</span>
                            <span className="small">عدد از گروه</span>
                          </div>
                          <span className="text-success fw-bold">
                            {Math.round(tier.discountRate * 100)}% تخفیف
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* خلاصه عملکرد */}
                  <div className="border-top pt-2">
                    <div className="row text-center small">
                      <div className="col-6">
                        <div className="text-muted">بیشترین تخفیف</div>
                        <div className="fw-bold text-success">
                          {Math.round(Math.max(...group.groupTiers.map(t => t.discountRate * 100)))}%
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted">حداقل خرید</div>
                        <div className="fw-bold text-primary">
                          {Math.min(...group.groupTiers.map(t => t.minQuantity))} عدد
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <Link
                      href={`/dashboard/discount-groups/${group.id}`}
                      className="btn btn-outline-primary btn-sm flex-fill"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      ویرایش
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteGroup(group.id)}
                      title="حذف گروه"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-5">
              <i className="bi bi-collection display-1 text-muted mb-3"></i>
              <h5 className="text-muted">هیچ گروه تخفیفی تعریف نشده</h5>
              <p className="text-muted mb-4">
                گروه‌های تخفیف پلکانی اجازه می‌دهند تخفیف بر اساس مجموع خرید از چند محصول خاص اعمال شود.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                ایجاد اولین گروه تخفیف
              </button>
            </div>
          </div>
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

// کامپوننت فرم ایجاد گروه تخفیف
function DiscountGroupForm({ products, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedProducts: [],
    tiers: [{ minQuantity: 3, discountRate: 5 }], // سطح پیش‌فرض معقول‌تر
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // اعتبارسنجی
    if (formData.selectedProducts.length === 0) {
      alert("لطفاً حداقل یک محصول انتخاب کنید");
      setIsSubmitting(false);
      return;
    }

    if (formData.tiers.length === 0) {
      alert("لطفاً حداقل یک سطح تخفیف تعریف کنید");
      setIsSubmitting(false);
      return;
    }

    // اعتبارسنجی سطوح تخفیف
    const quantities = formData.tiers.map(t => t.minQuantity);
    const uniqueQuantities = new Set(quantities);
    if (uniqueQuantities.size !== quantities.length) {
      alert("سطوح تخفیف نمی‌توانند حداقل تعداد یکسان داشته باشند");
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
      productCodes: formData.selectedProducts,
      tiers: formData.tiers.map((tier) => ({
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // اضافه کردن سطح جدید
  const addTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1];
    const newMinQuantity = lastTier ? lastTier.minQuantity + 3 : 3; // افزایش 3 تایی
    const newDiscountRate = lastTier ? lastTier.discountRate + 5 : 10;

    setFormData({
      ...formData,
      tiers: [
        ...formData.tiers,
        {
          minQuantity: newMinQuantity,
          discountRate: Math.min(newDiscountRate, 50), // حداکثر 50% تخفیف
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
    
    // مرتب کردن سطوح بر اساس تعداد
    newTiers.sort((a, b) => a.minQuantity - b.minQuantity);
    
    setFormData({ ...formData, tiers: newTiers });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              ایجاد گروه تخفیف جدید
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* اطلاعات اصلی گروه */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">اطلاعات گروه</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">نام گروه *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="مثال: گروه لبنیات، خشکبار ویژه، ..."
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">توضیحات</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="توضیحات درباره گروه تخفیف و محصولات آن"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* انتخاب محصولات */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">انتخاب محصولات ({formData.selectedProducts.length} محصول انتخاب شده)</h6>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {products.length > 0 ? (
                        <div className="row">
                          {products.map((product) => (
                            <div key={product.id} className="col-md-6 mb-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={formData.selectedProducts.includes(product.code)}
                                  onChange={(e) => {
                                    const newSelected = e.target.checked
                                      ? [...formData.selectedProducts, product.code]
                                      : formData.selectedProducts.filter((code) => code !== product.code);
                                    setFormData({ ...formData, selectedProducts: newSelected });
                                  }}
                                />
                                <label className="form-check-label small">
                                  <div className="fw-medium">{product.name}</div>
                                  <div className="text-muted">
                                    کد: {product.code} | {product.price?.toLocaleString("fa-IR")} ریال
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted py-3">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          هیچ محصولی یافت نشد
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* سطوح تخفیف پلکانی */}
              <div className="card mt-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">سطوح تخفیف پلکانی</h6>
                    <small className="text-muted">تعریف تخفیف‌های مختلف بر اساس تعداد کل خرید از گروه</small>
                  </div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addTier}>
                    <i className="bi bi-plus me-1"></i>
                    افزودن سطح
                  </button>
                </div>
                <div className="card-body">
                  {formData.tiers.map((tier, index) => (
                    <div key={index} className="row mb-3 align-items-center border-bottom pb-3">
                      <div className="col-md-1 text-center">
                        <span className="badge bg-primary fs-6">{index + 1}</span>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">حداقل تعداد از گروه</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={tier.minQuantity}
                            onChange={(e) => updateTier(index, "minQuantity", e.target.value)}
                            min="1"
                            required
                          />
                          <span className="input-group-text">عدد</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">درصد تخفیف</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={tier.discountRate}
                            onChange={(e) => updateTier(index, "discountRate", e.target.value)}
                            min="0"
                            max="100"
                            step="0.5"
                            required
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm mt-4"
                          onClick={() => removeTier(index)}
                          disabled={formData.tiers.length === 1}
                        >
                          <i className="bi bi-trash"></i>
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* راهنمای سطوح تخفیف */}
                  <div className="alert alert-info mt-3">
                    <div className="d-flex">
                      <i className="bi bi-lightbulb me-2 mt-1"></i>
                      <div>
                        <strong>نکته مهم:</strong>
                        <ul className="mb-0 mt-2">
                          <li>سیستم به طور خودکار <strong>بهترین تخفیف ممکن</strong> را اعمال می‌کند</li>
                          <li>مثال: برای سطوح 3 عدد (5%)، 6 عدد (10%)، 9 عدد (15%):</li>
                          <li>→ خرید 5 عدد: 5% تخفیف (بالاتر از 3 عدد)</li>
                          <li>→ خرید 8 عدد: 10% تخفیف (بالاتر از 6 عدد)</li>
                          <li>→ خرید 12 عدد: 15% تخفیف (بالاتر از 9 عدد)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* پیش‌نمایش */}
              {formData.name && formData.selectedProducts.length > 0 && (
                <div className="card mt-4 border-success">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">پیش‌نمایش گروه تخفیف</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <strong>نام گروه:</strong> {formData.name}
                      </div>
                      <div className="col-md-4">
                        <strong>تعداد محصولات:</strong> {formData.selectedProducts.length} محصول
                      </div>
                      <div className="col-md-4">
                        <strong>تعداد سطوح:</strong> {formData.tiers.length} سطح
                      </div>
                    </div>
                    <div className="mt-3">
                      <strong>سطوح تخفیف:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {formData.tiers.map((tier, index) => (
                          <span key={index} className="badge bg-primary fs-6">
                            {tier.minQuantity}+ عدد → {tier.discountRate}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                <i className="bi bi-x-circle me-1"></i>
                انصراف
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || formData.selectedProducts.length < 2 || !formData.name}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    ایجاد گروه تخفیف
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}