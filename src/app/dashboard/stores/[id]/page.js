"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function StoreDetailsPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStoreDetails();
      fetchStoreOrders();
    }
  }, [params.id]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setStore(data);
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
    }
  };

  const fetchStoreOrders = async () => {
    try {
      console.log(`Fetching orders for store ID: ${params.id}`);

      const response = await fetch(`/api/stores/${params.id}/orders`);

      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.length} orders for store`);
        setOrders(data);
      } else {
        const errorData = await response.json();
        console.error("Error fetching orders:", errorData.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching store orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: "bg-warning", text: "در انتظار" },
      CONFIRMED: { class: "bg-info", text: "تأیید شده" },
      PREPARING: { class: "bg-primary", text: "در حال آماده‌سازی" },
      DELIVERING: { class: "bg-secondary", text: "در حال ارسال" },
      DELIVERED: { class: "bg-success", text: "تحویل شده" },
      CANCELLED: { class: "bg-danger", text: "لغو شده" },
    };

    const config = statusConfig[status] || {
      class: "bg-secondary",
      text: status,
    };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
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

  if (!store) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">فروشگاه یافت نشد</div>
        <Link href="/dashboard/stores" className="btn btn-primary">
          بازگشت به لیست فروشگاه‌ها
        </Link>
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
              <li className="breadcrumb-item">
                <Link href="/dashboard/stores" className="text-decoration-none">
                  فروشگاه‌ها
                </Link>
              </li>
              <li className="breadcrumb-item active">{store.name}</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0 fw-bold">{store.name}</h1>
          <small className="text-muted">
            اطلاعات کامل فروشگاه و تاریخچه سفارش‌ها
          </small>
        </div>
        <div className="btn-group">
          <Link
            href={`/dashboard/stores/${params.id}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil me-2"></i>
            ویرایش فروشگاه
          </Link>
          <Link href="/dashboard/stores" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-right me-2"></i>
            بازگشت به لیست
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
                    کل سفارشات
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {store._count.orders} سفارش
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
          <div className="card border-start-success border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-success text-uppercase mb-1">
                    میانگین ارزش سفارش
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {formatCurrency(
                      orders.reduce(
                        (sum, order) => sum + order.totalAmount,
                        0
                      ) / (orders.length || 1)
                    )}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <strong>کد فروشگاه:</strong>
          <p className="fs-5 text-primary">{store.code}</p>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-start-info border-3">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs fw-bold text-info text-uppercase mb-1">
                    منطقه پخش
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {store.deliveryZone
                      ? store.deliveryZone.name
                      : "تعریف نشده"}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-geo-alt fs-2 text-gray-300"></i>
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
                    مسیر اختصاصی
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {store.route ? store.route.name : "تعریف نشده"}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-signpost fs-2 text-gray-300"></i>
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
                className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <i className="bi bi-info-circle me-2"></i>
                اطلاعات فروشگاه
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <i className="bi bi-cart-check me-2"></i>
                تاریخچه سفارش‌ها
                <span className="badge bg-primary ms-2">{orders.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "location" ? "active" : ""
                }`}
                onClick={() => setActiveTab("location")}
              >
                <i className="bi bi-geo-alt me-2"></i>
                موقعیت مکانی
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* تب اطلاعات فروشگاه */}
          {activeTab === "info" && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary mb-3">اطلاعات اصلی</h6>
                <div className="mb-3">
                  <strong>نام فروشگاه:</strong>
                  <p className="fs-5">{store.name}</p>
                </div>
                <div className="mb-3">
                  <strong>نام صاحب:</strong>
                  <p>{store.ownerName}</p>
                </div>
                <div className="mb-3">
                  <strong>شماره تلفن:</strong>
                  <p>
                    <a
                      href={`tel:${store.phone}`}
                      className="text-decoration-none"
                    >
                      {store.phone}
                    </a>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>نوع فروشگاه:</strong>
                  <p>
                    <span className="badge bg-secondary">
                      {store.storeType}
                    </span>
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-primary mb-3">اطلاعات پخش</h6>
                <div className="mb-3">
                  <strong>منطقه پخش:</strong>
                  <p>
                    {store.deliveryZone ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: store.deliveryZone.color,
                          color: "white",
                        }}
                      >
                        {store.deliveryZone.name}
                      </span>
                    ) : (
                      <span className="text-muted">تعریف نشده</span>
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>مسیر تحویل:</strong>
                  <p>
                    {store.route ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: store.route.color,
                          color: "white",
                        }}
                      >
                        {store.route.name}
                      </span>
                    ) : (
                      <span className="text-muted">تعریف نشده</span>
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>آدرس کامل:</strong>
                  <p className="text-muted">{store.address}</p>
                </div>
                <div className="mb-3">
                  <strong>تاریخ ثبت:</strong>
                  <p>{formatDate(store.createdAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* تب تاریخچه سفارش‌ها */}
          {activeTab === "orders" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="text-primary mb-0">تاریخچه سفارش‌ها</h6>
                <Link
                  href="/dashboard/orders/new"
                  className="btn btn-primary btn-sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  سفارش جدید
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>شماره سفارش</th>
                        <th>تاریخ سفارش</th>
                        <th>مبلغ کل</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>#{order.id}</strong>
                          </td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td className="text-success fw-bold">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td>
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-eye"></i> مشاهده
                            </Link>
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
                    هنوز سفارشی برای این فروشگاه ثبت نشده است
                  </p>
                  <Link
                    href="/dashboard/orders/new"
                    className="btn btn-primary"
                  >
                    ایجاد اولین سفارش
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* تب موقعیت مکانی */}
          {activeTab === "location" && (
            <div>
              <h6 className="text-primary mb-3">موقعیت مکانی فروشگاه</h6>

              {store.latitude && store.longitude ? (
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h6>مختصات جغرافیایی</h6>
                        <div className="mb-2">
                          <strong>عرض جغرافیایی:</strong>
                          <span className="text-muted"> {store.latitude}</span>
                        </div>
                        <div className="mb-2">
                          <strong>طول جغرافیایی:</strong>
                          <span className="text-muted"> {store.longitude}</span>
                        </div>
                        <div className="mt-3">
                          <a
                            href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="bi bi-map me-2"></i>
                            مشاهده در Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h6>نقشه موقعیت</h6>
                        <div
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ height: "200px" }}
                        >
                          <i className="bi bi-map display-4 text-muted"></i>
                          <small className="text-muted mt-2">
                            نقشه در اینجا نمایش داده می‌شود
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-geo-alt display-1 text-muted mb-3"></i>
                  <p className="text-muted">
                    موقعیت مکانی برای این فروشگاه تعریف نشده است
                  </p>
                  <Link
                    href={`/dashboard/stores/${params.id}/edit`}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-pencil me-2"></i>
                    افزودن موقعیت مکانی
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
