"use client";

import { useEffect, useState } from "react";
import StoreMap from "@/components/stores/StoreMap";
import LocationPickerMap from "@/components/stores/LocationPickerMap";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
    storeType: "SUPERMARKET",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchStores();
    return () => {
      // Cleanup global functions when component unmounts
      if (window.confirmSelectedLocation) {
        delete window.confirmSelectedLocation;
      }
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/stores", {
        method: "POST",
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
          phone: "",
          address: "",
          storeType: "SUPERMARKET",
          latitude: "",
          longitude: "",
        });
        setSelectedLocation(null);
        fetchStores();
      }
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  const handleLocationSelect = (lat, lng) => {
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          فروشگاه جدید
        </button>
      </div>
      <div className="row">
        {stores.map((store) => (
          <div key={store.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title text-primary">{store.name}</h5>
                  <span className="badge bg-info">
                    {getStoreTypeText(store.storeType)}
                  </span>
                </div>

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

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    {store._count?.orders || 0} سفارش
                  </span>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary">ویرایش</button>
                    <button className="btn btn-outline-danger">حذف</button>
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
      {/* Modal برای افزودن فروشگاه */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">افزودن فروشگاه جدید</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLocation(null);
                  }}
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

                      {/* بخش موقعیت روی نقشه */}
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
                    onClick={() => {
                      setShowModal(false);
                      setSelectedLocation(null);
                    }}
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
                      : "ایجاد فروشگاه"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal برای انتخاب موقعیت روی نقشه */}
      // در بخش modal موقعیت، این تغییرات را اعمال کنید:
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
                    // Cleanup global function
                    if (window.confirmSelectedLocation) {
                      delete window.confirmSelectedLocation;
                    }
                  }}
                ></button>
              </div>
              <div className="modal-body p-0">
                <LocationPickerMap
                  onLocationSelect={(lat, lng) => {
                    handleLocationSelect(lat, lng);
                    // Cleanup after selection
                    if (window.confirmSelectedLocation) {
                      delete window.confirmSelectedLocation;
                    }
                  }}
                  initialLocation={selectedLocation}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
