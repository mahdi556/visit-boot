"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// کامپوننت MapEditor را import کنید
const MapEditor = dynamic(() => import("@/components/maps/MapEditor"), {
  ssr: false,
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "600px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">در حال بارگذاری نقشه...</span>
      </div>
    </div>
  ),
});

export default function RoutesAndAreasPage() {
  const [activeTab, setActiveTab] = useState("routes");
  const [routes, setRoutes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    driverName: "",
    vehicleType: "",
    color: "#6C63FF",
    isActive: true
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes");
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const url = editingRoute ? `/api/routes/${editingRoute.id}` : "/api/routes";
      const method = editingRoute ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const routeData = await response.json();
        
        if (editingRoute) {
          setRoutes(prev => prev.map(route => 
            route.id === editingRoute.id ? routeData : route
          ));
        } else {
          setRoutes(prev => [routeData, ...prev]);
        }

        setShowCreateModal(false);
        resetForm();
        alert(editingRoute ? "مسیر با موفقیت ویرایش شد" : "مسیر با موفقیت ایجاد شد");
      } else {
        const error = await response.json();
        alert(error.error || "خطا در ذخیره مسیر");
      }
    } catch (error) {
      console.error("Error saving route:", error);
      alert("خطا در ذخیره مسیر");
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      driverName: route.driverName || "",
      vehicleType: route.vehicleType || "",
      color: route.color,
      isActive: route.isActive
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (routeId) => {
    if (!confirm("آیا از حذف این مسیر اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoutes(prev => prev.filter(route => route.id !== routeId));
        alert("مسیر با موفقیت حذف شد");
      } else {
        const error = await response.json();
        alert(error.error || "خطا در حذف مسیر");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      alert("خطا در حذف مسیر");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      driverName: "",
      vehicleType: "",
      color: "#6C63FF",
      isActive: true
    });
    setEditingRoute(null);
    setShowCreateModal(false);
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
              <li className="breadcrumb-item active">مدیریت مسیرها و مناطق</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 fw-bold">مدیریت مسیرها و مناطق پخش</h1>
          <small className="text-muted">
            ایجاد مسیرهای تحویل و تعیین مناطق جغرافیایی آنها
          </small>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingRoute(null);
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            ایجاد مسیر جدید
          </button>
          <Link href="/dashboard/stores" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-right me-2"></i>
            بازگشت به فروشگاه‌ها
          </Link>
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
                    کل مسیرها
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {routes.length} مسیر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-signpost fs-2 text-gray-300"></i>
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
                    مسیرهای دارای منطقه
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {routes.filter(r => r.coordinates).length} مسیر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-map fs-2 text-gray-300"></i>
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
                    فروشگاه‌های تحت پوشش
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {routes.reduce((sum, route) => sum + (route._count?.stores || 0), 0)} فروشگاه
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
          <div className="card border-start-warning border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                    مسیرهای فعال
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {routes.filter(r => r.isActive).length} مسیر
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-check-circle fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌های اصلی */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "routes" ? "active" : ""}`}
                onClick={() => setActiveTab("routes")}
              >
                <i className="bi bi-list-ul me-2"></i>
                لیست مسیرها
                <span className="badge bg-primary ms-2">{routes.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "map" ? "active" : ""}`}
                onClick={() => setActiveTab("map")}
              >
                <i className="bi bi-map me-2"></i>
                نقشه و مناطق
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* تب لیست مسیرها */}
          {activeTab === "routes" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">مدیریت مسیرها</h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingRoute(null);
                    setShowCreateModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  مسیر جدید
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>نام مسیر</th>
                      <th>راننده</th>
                      <th>وسیله نقلیه</th>
                      <th>تعداد فروشگاه</th>
                      <th>منطقه جغرافیایی</th>
                      <th>وضعیت</th>
                      <th>تاریخ ایجاد</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route) => (
                      <tr key={route.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-3"
                              style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: route.color,
                                border: "2px solid #fff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              }}
                            ></div>
                            <strong>{route.name}</strong>
                          </div>
                        </td>
                        <td>{route.driverName || '-'}</td>
                        <td>{route.vehicleType || '-'}</td>
                        <td>
                          <span className={`badge ${route._count?.stores > 0 ? 'bg-success' : 'bg-secondary'}`}>
                            {route._count?.stores || 0} فروشگاه
                          </span>
                        </td>
                        <td>
                          {route.coordinates ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              تعریف شده
                            </span>
                          ) : (
                            <span className="badge bg-warning">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              تعریف نشده
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${route.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {route.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>{formatDate(route.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(route)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => {
                                setActiveTab("map");
                                // می‌توانید stateای برای auto-select این مسیر در نقشه اضافه کنید
                              }}
                            >
                              <i className="bi bi-map"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(route.id)}
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

              {routes.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-signpost display-1 text-muted mb-3"></i>
                  <p className="text-muted">هنوز مسیری تعریف نشده است</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    ایجاد اولین مسیر
                  </button>
                </div>
              )}
            </div>
          )}

          {/* تب نقشه و مناطق */}
          {activeTab === "map" && (
            <div>
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>راهنمای استفاده از نقشه:</strong>
                <ul className="mb-0 mt-2">
                  <li>از منوی <strong>سمت راست نقشه</strong> یک مسیر انتخاب کنید</li>
                  <li>برای رسم منطقه جدید روی <strong>"شروع رسم"</strong> کلیک کنید</li>
                  <li>برای ویرایش منطقه موجود روی <strong>"ویرایش"</strong> کلیک کنید</li>
                  <li>روی نقشه کلیک کنید تا نقاط منطقه را مشخص کنید</li>
                  <li>برای ذخیره، حداقل ۳ نقطه مشخص کنید و روی <strong>"ذخیره"</strong> کلیک کنید</li>
                </ul>
              </div>
              
              <MapEditor />
            </div>
          )}
        </div>
      </div>

      {/* مودال ایجاد/ویرایش مسیر */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRoute ? "ویرایش مسیر" : "ایجاد مسیر جدید"}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleCreateRoute}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">نام مسیر *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">نام راننده</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">وسیله نقلیه</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">رنگ مسیر</label>
                    <input
                      type="color"
                      className="form-control"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label">
                        مسیر فعال
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    انصراف
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingRoute ? "ویرایش مسیر" : "ایجاد مسیر"}
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