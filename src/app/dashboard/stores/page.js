"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LocationPickerMap = dynamic(
  () => import("@/components/stores/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "500px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری نقشه...</span>
        </div>
      </div>
    ),
  }
);

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingStore, setEditingStore] = useState(null); // برای حالت ویرایش
  const [deleteConfirm, setDeleteConfirm] = useState(null); // برای تایید حذف
  const [formData, setFormData] = useState({
    name: "",
    code: "", // اضافه شده
    ownerName: "",
    phone: "",
    address: "",
    storeType: "SUPERMARKET",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // تابع ویرایش فروشگاه
  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      code: store.code || "", // اضافه شده
      ownerName: store.ownerName,
      phone: store.phone,
      address: store.address,
      storeType: store.storeType || "SUPERMARKET",
      latitude: store.latitude || "",
      longitude: store.longitude || "",
    });
    setSelectedLocation(
      store.latitude && store.longitude
        ? { lat: store.latitude, lng: store.longitude }
        : null
    );
    setShowModal(true);
  };

  // تابع حذف فروشگاه
  const handleDelete = async (storeId) => {
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStores(stores.filter((store) => store.id !== storeId));
        setDeleteConfirm(null);
        alert("فروشگاه با موفقیت حذف شد");
      } else {
        const error = await response.json();
        alert(error.error || "خطا در حذف فروشگاه");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      alert("خطا در حذف فروشگاه");
    }
  };

  // تابع ایجاد/ویرایش فروشگاه
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStore
        ? `/api/stores/${editingStore.id}`
        : "/api/stores";
      const method = editingStore ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          latitude: selectedLocation ? selectedLocation.lat : null,
          longitude: selectedLocation ? selectedLocation.lng : null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          ownerName: "",
          code: "", // اضافه شده
          phone: "",
          address: "",
          storeType: "SUPERMARKET",
          latitude: "",
          longitude: "",
        });
        setSelectedLocation(null);
        setEditingStore(null);
        fetchStores();

        const message = editingStore
          ? "فروشگاه با موفقیت ویرایش شد"
          : "فروشگاه با موفقیت ایجاد شد";
        alert(message);
      } else {
        const error = await response.json();
        alert(error.error || "خطا در ذخیره فروشگاه");
      }
    } catch (error) {
      console.error("Error saving store:", error);
      alert("خطا در ذخیره فروشگاه");
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng });
  };

  const handleLocationConfirm = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setShowMapModal(false);
  };

  const getStoreTypeText = (type) => {
    const types = {
      SUPERMARKET: "سوپرمارکت",
      GROCERY: "بقالی",
      CONVENIENCE: "مینی‌مارکت",
      HYPERMARKET: "هایپر مارکت",
    };
    return types[type] || type;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      ownerName: "",
      code: "", // اضافه شده
      phone: "",
      address: "",
      storeType: "SUPERMARKET",
      latitude: "",
      longitude: "",
    });
    setSelectedLocation(null);
    setEditingStore(null);
    setShowModal(false);
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
        <h1 className="h3 mb-0 fw-bold">مدیریت فروشگاه‌ها</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingStore(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          فروشگاه جدید
        </button>
      </div>
      <div className="row">
        {stores.map((store) => (
          <div key={store.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 store-card">
              <div className="card-body">
                {/* هدر کارت - قابل کلیک */}
                <Link
                  href={`/dashboard/stores/${store.id}`}
                  className="text-decoration-none"
                >
                  <div className="d-flex justify-content-between align-items-start mb-3 cursor-pointer">
                    <h5 className="card-title text-primary">{store.name}</h5>
                    <span className="badge bg-info">
                      {getStoreTypeText(store.storeType)}
                    </span>
                  </div>
                </Link>

                {/* اطلاعات فروشگاه - قابل کلیک */}
                <Link
                  href={`/dashboard/stores/${store.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="store-info">
                    <div className="mb-2">
                      <i className="bi bi-person me-2 text-muted"></i>
                      <span>{store.ownerName}</span>
                    </div>

                    <div className="mb-2">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      <span>{store.phone}</span>
                    </div>

                    <div className="mb-3">
                      <i className="bi bi-geo-alt me-2 text-muted"></i>
                      <small className="text-muted">{store.address}</small>
                    </div>

                    {store.latitude && store.longitude && (
                      <div className="mb-3">
                        <i className="bi bi-geo me-2 text-muted"></i>
                        <small className="text-success">
                          موقعیت روی نقشه مشخص شده
                        </small>
                      </div>
                    )}
                  </div>
                </Link>

                {/* دکمه‌های عملیات - بدون تغییر */}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    {store._count?.orders || 0} سفارش
                  </span>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation(); // جلوگیری از انتشار event
                        handleEdit(store);
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation(); // جلوگیری از انتشار event
                        setDeleteConfirm(store.id);
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {stores.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-shop display-1 text-muted mb-3"></i>
          <p className="text-muted">هیچ فروشگاهی یافت نشد</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            افزودن اولین فروشگاه
          </button>
        </div>
      )}
      {/* Modal برای افزودن/ویرایش فروشگاه */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStore ? "ویرایش فروشگاه" : "افزودن فروشگاه جدید"}
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
                        <label className="form-label">نام فروشگاه</label>
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
                      <div className="mb-3">
                        <label className="form-label">نام مالک</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ownerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ownerName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">کد فروشگاه</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          placeholder="مثلاً: ST001 یا خالی بگذارید تا خودکار تولید شود"
                        />
                        <div className="form-text">
                          اگر خالی بگذارید، کد به صورت خودکار تولید می‌شود
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">شماره تلفن</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">نوع فروشگاه</label>
                        <select
                          className="form-select"
                          value={formData.storeType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storeType: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="SUPERMARKET">سوپرمارکت</option>
                          <option value="GROCERY">بقالی</option>
                          <option value="CONVENIENCE">مینی‌مارکت</option>
                          <option value="HYPERMARKET">هایپر مارکت</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">موقعیت روی نقشه</label>
                        <div className="border rounded p-3 bg-light">
                          {selectedLocation ? (
                            <div className="text-center">
                              <i className="bi bi-check-circle-fill text-success fs-4 mb-2"></i>
                              <p className="text-success mb-2">
                                موقعیت مشخص شده
                              </p>
                              <small className="text-muted d-block">
                                عرض جغرافیایی: {selectedLocation.lat.toFixed(6)}
                              </small>
                              <small className="text-muted d-block">
                                طول جغرافیایی: {selectedLocation.lng.toFixed(6)}
                              </small>
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm mt-2"
                                onClick={() => setShowMapModal(true)}
                              >
                                تغییر موقعیت
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <i className="bi bi-geo-alt text-muted fs-4 mb-2"></i>
                              <p className="text-muted mb-2">
                                موقعیت مشخص نشده
                              </p>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowMapModal(true)}
                              >
                                انتخاب موقعیت روی نقشه
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">آدرس کامل</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!selectedLocation}
                  >
                    {!selectedLocation
                      ? "لطفا موقعیت را انتخاب کنید"
                      : editingStore
                      ? "ویرایش فروشگاه"
                      : "ایجاد فروشگاه"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal برای انتخاب موقعیت روی نقشه */}
      {showMapModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">انتخاب موقعیت فروشگاه روی نقشه</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMapModal(false);
                    if (window.confirmLocation) {
                      delete window.confirmLocation;
                    }
                  }}
                ></button>
              </div>
              <div className="modal-body p-0">
                <LocationPickerMap
                  onLocationSelect={handleLocationSelect}
                  onLocationConfirm={handleLocationConfirm}
                  initialLocation={selectedLocation}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal تایید حذف */}
      {deleteConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">تایید حذف</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteConfirm(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>آیا از حذف این فروشگاه اطمینان دارید؟</p>
                <p className="text-muted small">این عمل غیرقابل بازگشت است.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  حذف فروشگاه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
