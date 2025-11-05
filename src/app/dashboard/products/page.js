// src/app/dashboard/products/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "", // این همان قیمت پایه است
    category: "",
    currentStock: "",
    weight: "",
    unit: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          currentStock: parseInt(formData.currentStock),
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
        alert(
          editingProduct ? "محصول با موفقیت ویرایش شد" : "محصول جدید ایجاد شد"
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطایی رخ داده است");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("خطا در ذخیره محصول");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      currentStock: product.currentStock || "",
      weight: product.weight || "",
      unit: product.unit || "",
      code: product.code || "",
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (
      confirm("آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.")
    ) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchProducts();
          alert("محصول با موفقیت حذف شد");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "خطا در حذف محصول");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("خطا در حذف محصول");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      currentStock: "",
      weight: "",
      unit: "",
      code: "",
      description: "",
    });
    setEditingProduct(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
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
        <h1 className="h3 mb-0 fw-bold">مدیریت محصولات</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          محصول جدید
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>نام محصول</th>
                  <th>کد محصول</th>
                  <th>دسته‌بندی</th>
                  <th>قیمت</th>
                  <th>وزن/واحد</th>
                  <th>موجودی</th>
                  <th>تاریخ ایجاد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="fw-bold">{product.name}</div>
                      {product.description && (
                        <small
                          className="text-muted d-block"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description}
                        </small>
                      )}
                    </td>
                    <td>
                      {product.code ? (
                        <span className="badge bg-info">{product.code}</span>
                      ) : (
                        <span className="text-muted">ندارد</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {product.category}
                      </span>
                    </td>
                    <td className="text-success fw-bold">
                      {formatCurrency(product.price)}
                    </td>
                    <td>
                      {product.weight ? (
                        <span className="text-muted">
                          {product.weight} {product.unit || "گرم"}
                        </span>
                      ) : (
                        <span className="text-muted">تعریف نشده</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.currentStock > 10
                            ? "bg-success"
                            : product.currentStock > 0
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {product.currentStock} عدد
                      </span>
                    </td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="btn btn-outline-info"
                          title="مشاهده جزئیات"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(product)}
                          title="ویرایش محصول"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(product.id)}
                          title="حذف محصول"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-box display-1 text-muted mb-3"></i>
              <p className="text-muted">هیچ محصولی یافت نشد</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                افزودن اولین محصول
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal برای افزودن/ویرایش محصول */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">نام محصول *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">کد محصول</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          placeholder="اختیاری"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          قیمت پایه (مصرف کننده) *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.retailPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              retailPrice: e.target.value,
                            })
                          }
                          required
                          min="0"
                          step="1000"
                          placeholder="قیمت فروش به مصرف کننده"
                        />
                        <small className="text-muted">
                          قیمت تک عددی برای مصرف کننده نهایی
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          قیمت پایه (فروشگاه) *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.wholesalePrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wholesalePrice: e.target.value,
                            })
                          }
                          required
                          min="0"
                          step="1000"
                          placeholder="قیمت فروش به فروشگاه"
                        />
                        <small className="text-muted">
                          قیمت پایه برای فروشگاه‌ها (بدون تخفیف)
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">دسته‌بندی *</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">انتخاب کنید</option>
                          <option value="لبنیات">لبنیات</option>
                          <option value="نوشیدنی">نوشیدنی</option>
                          <option value="خشکبار">خشکبار</option>
                          <option value="تنقلات">تنقلات</option>
                          <option value="کنسرو">کنسرو</option>
                          <option value="روغن">روغن</option>
                          <option value="غلات">غلات</option>
                          <option value="پروتئین">پروتئین</option>
                          <option value="میوه و سبزی">میوه و سبزی</option>
                          <option value="سایر">سایر</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">موجودی اولیه *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.currentStock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentStock: e.target.value,
                            })
                          }
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">وزن</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="اختیاری"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">واحد</label>
                        <select
                          className="form-select"
                          value={formData.unit}
                          onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value })
                          }
                        >
                          <option value="">انتخاب واحد</option>
                          <option value="گرم">گرم</option>
                          <option value="کیلوگرم">کیلوگرم</option>
                          <option value="میلی‌لیتر">میلی‌لیتر</option>
                          <option value="لیتر">لیتر</option>
                          <option value="عدد">عدد</option>
                          <option value="بسته">بسته</option>
                          <option value="کارتن">کارتن</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">توضیحات</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="توضیحات اختیاری درباره محصول..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    انصراف
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "بروزرسانی محصول" : "ایجاد محصول"}
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
