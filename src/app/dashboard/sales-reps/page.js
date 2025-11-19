// 📂 src/app/dashboard/sales-reps/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SalesRepsPage() {
  const [salesReps, setSalesReps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRep, setEditingRep] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    isActive: true,
    password: "", // اضافه شده
  });

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const fetchSalesReps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sales-reps");
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data);
      }
    } catch (error) {
      console.error("Error fetching sales reps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const url = editingRep
        ? `/api/sales-reps/${editingRep.id}`
        : "/api/sales-reps";
      const method = editingRep ? "PUT" : "POST";

      // فقط فیلدهای لازم را ارسال کن
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password; // اگر رمز خالی است، ارسال نشود
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        if (editingRep) {
          setSalesReps((prev) =>
            prev.map((rep) =>
              rep.id === editingRep.id ? result.salesRep || result : rep
            )
          );
        } else {
          setSalesReps((prev) => [result.salesRep || result, ...prev]);
        }

        setShowModal(false);
        resetForm();

        // نمایش پیام موفقیت با اطلاعات کاربر
        if (result.userCredentials) {
          alert(
            `ویزیتور با موفقیت ${
              editingRep ? "ویرایش" : "ایجاد"
            } شد!\n\nاطلاعات ورود:\nنام کاربری: ${
              result.userCredentials.username
            }\nرمز عبور: ${result.userCredentials.password}`
          );
        } else if (result.message) {
          alert(result.message);
        } else {
          alert(`ویزیتور با موفقیت ${editingRep ? "ویرایش" : "ایجاد"} شد`);
        }
      } else {
        alert(result.error || "خطا در ذخیره ویزیتور");
      }
    } catch (error) {
      console.error("Error saving sales rep:", error);
      alert("خطا در ذخیره ویزیتور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rep) => {
    setEditingRep(rep);
    setFormData({
      code: rep.code,
      name: rep.name,
      phone: rep.phone || "",
      email: rep.email || "",
      isActive: rep.isActive,
      password: "", // رمز عبور خالی برای ویرایش
    });
    setShowModal(true);
  };

  const handleDelete = async (repId) => {
    if (!confirm("آیا از حذف این ویزیتور اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/sales-reps/${repId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setSalesReps((prev) => prev.filter((rep) => rep.id !== repId));
        alert("ویزیتور با موفقیت حذف شد");
      } else {
        alert(result.error || "خطا در حذف ویزیتور");
      }
    } catch (error) {
      console.error("Error deleting sales rep:", error);
      alert("خطا در حذف ویزیتور");
    }
  };

  const handleToggleStatus = async (repId, currentStatus) => {
    try {
      const response = await fetch(`/api/sales-reps/${repId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        const updatedRep = await response.json();
        setSalesReps((prev) =>
          prev.map((rep) => (rep.id === repId ? updatedRep : rep))
        );
        alert(`ویزیتور ${!currentStatus ? "فعال" : "غیرفعال"} شد`);
      } else {
        alert("خطا در تغییر وضعیت ویزیتور");
      }
    } catch (error) {
      console.error("Error toggling sales rep status:", error);
      alert("خطا در تغییر وضعیت ویزیتور");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      phone: "",
      email: "",
      isActive: true,
      password: "", // اضافه شده
    });
    setEditingRep(null);
    setShowModal(false);
    setIsSubmitting(false);
  };

  // آمار
  const totalReps = salesReps.length;
  const activeReps = salesReps.filter((rep) => rep.isActive).length;
  const inactiveReps = salesReps.filter((rep) => !rep.isActive).length;
  const totalOrders = salesReps.reduce(
    (sum, rep) => sum + (rep._count?.orders || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <span className="ms-2">در حال بارگذاری ویزیتورها...</span>
        </div>
      </div>
    );
  }

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
              <li className="breadcrumb-item active">مدیریت ویزیتورها</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 fw-bold">مدیریت ویزیتورها</h1>
          <small className="text-muted">
            ایجاد، ویرایش و مدیریت ویزیتورهای فروش
          </small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          ویزیتور جدید
        </button>
      </div>

      {/* آمار */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-primary border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                    کل ویزیتورها
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {totalReps} نفر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-people fs-2 text-gray-300"></i>
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
                    ویزیتورهای فعال
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {activeReps} نفر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-check-circle fs-2 text-gray-300"></i>
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
                    ویزیتورهای غیرفعال
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {inactiveReps} نفر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-pause-circle fs-2 text-gray-300"></i>
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
                    کل سفارشات
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {totalOrders} سفارش
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-cart-check fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول ویزیتورها */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-person-badge me-2"></i>
            لیست ویزیتورها
          </h5>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              ویزیتور جدید
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>کد</th>
                  <th>نام</th>
                  <th>تلفن</th>
                  <th>ایمیل</th>
                  <th>تعداد سفارشات</th>
                  <th>وضعیت</th>
                  <th>تاریخ ایجاد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {salesReps.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <strong className="text-primary">{rep.code}</strong>
                    </td>
                    <td>
                      <div className="fw-bold">{rep.name}</div>
                    </td>
                    <td>{rep.phone || "-"}</td>
                    <td>{rep.email || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          rep._count?.orders > 0 ? "bg-info" : "bg-secondary"
                        }`}
                      >
                        {rep._count?.orders || 0} سفارش
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rep.isActive ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {rep.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td>
                      {new Date(rep.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(rep)}
                          title="ویرایش ویزیتور"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn ${
                            rep.isActive
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            handleToggleStatus(rep.id, rep.isActive)
                          }
                          title={rep.isActive ? "غیرفعال کردن" : "فعال کردن"}
                        >
                          <i
                            className={`bi ${
                              rep.isActive ? "bi-pause" : "bi-play"
                            }`}
                          ></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(rep.id)}
                          title="حذف ویزیتور"
                          disabled={rep._count?.orders > 0}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      {rep._count?.orders > 0 && (
                        <small className="text-muted d-block mt-1">
                          دارای {rep._count.orders} سفارش
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {salesReps.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-badge display-1 d-block mb-3"></i>
              <p>هنوز ویزیتوری تعریف نشده است</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                ایجاد اولین ویزیتور
              </button>
            </div>
          )}
        </div>
      </div>

      {/* مودال ایجاد/ویرایش ویزیتور */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRep ? "ویرایش ویزیتور" : "ویزیتور جدید"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">کد ویزیتور *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                          placeholder="مثلاً: V001"
                        />
                        <small className="text-muted">
                          کد یکتا برای شناسایی ویزیتور
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">نام کامل *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                          placeholder="نام و نام خانوادگی"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">تلفن</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="09xxxxxxxxx"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">ایمیل</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="email@example.com"
                    />
                  </div>
                  {/* فیلد رمز عبور - فقط در حالت ویرایش یا برای کاربر جدید */}
                  {(editingRep || !editingRep) && (
                    <div className="mb-3">
                      <label className="form-label">
                        {editingRep ? "تغییر رمز عبور" : "رمز عبور"}
                        {!editingRep && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isSubmitting}
                        placeholder={
                          editingRep ? "در صورت تغییر پر شود" : "رمز عبور کاربر"
                        }
                        minLength="6"
                      />
                      <small className="text-muted">
                        {editingRep
                          ? "در صورت تغییر رمز عبور پر کنید (حداقل ۶ کاراکتر)"
                          : "رمز عبور برای ورود کاربر به سیستم (حداقل ۶ کاراکتر)"}
                      </small>
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        disabled={isSubmitting}
                      />
                      <label className="form-check-label">ویزیتور فعال</label>
                    </div>
                    <small className="text-muted">
                      ویزیتورهای غیرفعال در لیست انتخاب نمایش داده نمی‌شوند
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        در حال ذخیره...
                      </>
                    ) : editingRep ? (
                      "ویرایش ویزیتور"
                    ) : (
                      "ایجاد ویزیتور"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
