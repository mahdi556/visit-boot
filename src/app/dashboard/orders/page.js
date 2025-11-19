"use client";

import { useEffect, useState } from "react";
import InvoiceModal from "@/components/invoice/InvoiceModal";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSalesRep, setFilterSalesRep] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [salesReps, setSalesReps] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [currentSalesRepId, setCurrentSalesRepId] = useState(null);

  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
    fetchSalesReps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, filterSalesRep, searchTerm, currentPage]);

  // دریافت اطلاعات کاربر لاگین شده
  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
        setCurrentSalesRepId(userData.salesRepId);

        console.log("👤 User info:", {
          role: userData.role,
          salesRepId: userData.salesRepId,
          name: `${userData.firstName} ${userData.lastName}`,
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log("🔄 Fetching orders...");
      console.log("👤 Current user context:", {
        role: userRole,
        salesRepId: currentSalesRepId,
      });

      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error(`خطا در دریافت سفارشات: ${response.status}`);
      }

      const data = await response.json();

      console.log("📦 Orders received from API:", {
        total: data.length,
        userRole: userRole,
        salesRepId: currentSalesRepId,
        orders: data.map((order) => ({
          id: order.id,
          salesRepId: order.salesRepId,
          store: order.store.name,
        })),
      });

      // اگر کاربر ویزیتور است، مطمئن شویم فقط سفارشات خودش را می‌بیند
      if (userRole === "SALES_REP") {
        const myOrders = data.filter(
          (order) => order.salesRepId === currentSalesRepId
        );
        console.log(
          `🔍 Filtered orders for sales rep ${currentSalesRepId}:`,
          myOrders.length
        );
        setOrders(myOrders);
      } else {
        // برای ادمین/مدیر همه سفارشات
        const sortedOrders = data.sort(
          (a, b) =>
            new Date(b.orderDate || b.createdAt) -
            new Date(a.orderDate || a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("خطا در دریافت سفارشات: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesReps = async () => {
    try {
      const response = await fetch("/api/sales-reps");
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data);
      }
    } catch (error) {
      console.error("Error fetching sales reps:", error);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    // فیلتر بر اساس وضعیت
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // فیلتر بر اساس ویزیتور - فقط برای ادمین/مدیر
    if (userRole !== "SALES_REP" && filterSalesRep !== "all") {
      const salesRepId = parseInt(filterSalesRep);
      if (salesRepId === 0) {
        // سفارشات بدون ویزیتور
        filtered = filtered.filter((order) => !order.salesRepId);
      } else {
        // سفارشات با ویزیتور خاص
        filtered = filtered.filter((order) => order.salesRepId === salesRepId);
      }
    }

    // فیلتر بر اساس جستجو (نام فروشگاه، کد فروشگاه، نام ویزیتور)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.salesRep &&
            order.salesRep.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (order.salesRep &&
            order.salesRep.code
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  };

  // محاسبه آمار بر اساس دسترسی کاربر
  const calculateStats = () => {
    let statsOrders = orders;

    // اگر کاربر ویزیتور است، فقط آمار سفارشات خودش را حساب کن
    if (userRole === "SALES_REP") {
      statsOrders = orders; // قبلاً فیلتر شده
    }

    return {
      totalOrders: statsOrders.length,
      pendingOrders: statsOrders.filter((order) => order.status === "PENDING")
        .length,
      deliveredOrders: statsOrders.filter(
        (order) => order.status === "DELIVERED"
      ).length,
      ordersWithSalesRep: statsOrders.filter((order) => order.salesRepId)
        .length,
      ordersWithoutSalesRep: statsOrders.filter((order) => !order.salesRepId)
        .length,
    };
  };

  const stats = calculateStats();

  const handleShowInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleEdit = (order) => {
    window.location.href = `/dashboard/orders/${order.id}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSalesRepFilter = (salesRepId) => {
    setFilterSalesRep(salesRepId);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: "در انتظار", class: "bg-warning" },
      CONFIRMED: { label: "تایید شده", class: "bg-info" },
      PREPARING: { label: "در حال آماده‌سازی", class: "bg-primary" },
      DELIVERING: { label: "در حال ارسال", class: "bg-secondary" },
      DELIVERED: { label: "تحویل شده", class: "bg-success" },
      CANCELLED: { label: "لغو شده", class: "bg-danger" },
    };

    const config = statusConfig[status] || {
      label: status,
      class: "bg-secondary",
    };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  // محاسبات صفحه‌بندی
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
        <div>
          <h1 className="h3 mb-0 fw-bold">
            مدیریت سفارشات
            {userRole === "SALES_REP" && (
              <small className="text-primary fs-6 ms-2">(سفارشات من)</small>
            )}
          </h1>
          <small className="text-muted">
            {userRole === "SALES_REP"
              ? `سفارشات ویزیتور: ${stats.totalOrders} سفارش`
              : `تعداد کل سفارشات: ${stats.totalOrders} | نمایش: ${currentOrders.length} از ${filteredOrders.length}`}
          </small>
        </div>

        <Link href="/dashboard/catalog" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          ثبت سفارش جدید
        </Link>
      </div>

      {/* آمار */}
      <div className="row mb-4">
        <div className="col-xl-2 col-md-4 mb-3">
          <div className="card border-start-primary border-3">
            <div className="card-body">
              <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                {userRole === "SALES_REP" ? "سفارشات من" : "کل سفارشات"}
              </div>
              <div className="h5 mb-0 fw-bold text-gray-800">
                {stats.totalOrders}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 mb-3">
          <div className="card border-start-warning border-3">
            <div className="card-body">
              <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                در انتظار
              </div>
              <div className="h5 mb-0 fw-bold text-gray-800">
                {stats.pendingOrders}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 mb-3">
          <div className="card border-start-success border-3">
            <div className="card-body">
              <div className="text-xs fw-bold text-success text-uppercase mb-1">
                تحویل شده
              </div>
              <div className="h5 mb-0 fw-bold text-gray-800">
                {stats.deliveredOrders}
              </div>
            </div>
          </div>
        </div>

        {/* این آمار فقط برای ادمین/مدیر نمایش داده شود */}
        {userRole !== "SALES_REP" && (
          <>
            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card border-start-info border-3">
                <div className="card-body">
                  <div className="text-xs fw-bold text-info text-uppercase mb-1">
                    دارای ویزیتور
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {stats.ordersWithSalesRep}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card border-start-secondary border-3">
                <div className="card-body">
                  <div className="text-xs fw-bold text-secondary text-uppercase mb-1">
                    بدون ویزیتور
                  </div>
                  <div className="h5 mb-0 fw-bold text-gray-800">
                    {stats.ordersWithoutSalesRep}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* فیلترها */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">فیلتر وضعیت</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار</option>
                <option value="CONFIRMED">تایید شده</option>
                <option value="PREPARING">در حال آماده‌سازی</option>
                <option value="DELIVERING">در حال ارسال</option>
                <option value="DELIVERED">تحویل شده</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </div>

            {/* فیلتر ویزیتور فقط برای ادمین/مدیر */}
            {userRole !== "SALES_REP" && (
              <div className="col-md-3">
                <label className="form-label">فیلتر ویزیتور</label>
                <select
                  className="form-select"
                  value={filterSalesRep}
                  onChange={(e) => handleSalesRepFilter(e.target.value)}
                >
                  <option value="all">همه ویزیتورها</option>
                  <option value="0">بدون ویزیتور</option>
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} - {rep.code}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={userRole !== "SALES_REP" ? "col-md-4" : "col-md-6"}>
              <label className="form-label">جستجو</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    userRole === "SALES_REP"
                      ? "جستجو در سفارشات من..."
                      : "جستجو بر اساس فروشگاه، کد فروشگاه، ویزیتور..."
                  }
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className={userRole !== "SALES_REP" ? "col-md-2" : "col-md-3"}>
              <label className="form-label">&nbsp;</label>
              <div>
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterSalesRep("all");
                    setCurrentPage(1);
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  بازنشانی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-cart-check me-2"></i>
            {userRole === "SALES_REP" ? "سفارشات من" : "لیست سفارشات"}
          </h5>
          {userRole === "SALES_REP" && currentSalesRepId && (
            <small className="text-muted">
              نمایش سفارشات اختصاص داده شده به شما
            </small>
          )}
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>فروشگاه</th>
                  {/* ستون ویزیتور فقط برای ادمین/مدیر */}
                  {userRole !== "SALES_REP" && <th>ویزیتور</th>}
                  <th>ویزیتور</th> {/* تغییر از "مشتری" به "ویزیتور" */}
                  <th>تاریخ سفارش</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold">
                      #ORD-{order.id.toString().padStart(4, "0")}
                    </td>
                    <td>
                      <div className="fw-bold">{order.store.name}</div>
                      <small className="text-muted">
                        کد: {order.store.code}
                      </small>
                    </td>
                    {/* ستون ویزیتور فقط برای ادمین/مدیر */}
                    {userRole !== "SALES_REP" && (
                      <td>
                        {order.salesRep ? (
                          <div>
                            <div className="fw-bold text-primary">
                              {order.salesRep.name}
                            </div>
                            <small className="text-muted">
                              کد: {order.salesRep.code}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">تعیین نشده</span>
                        )}
                      </td>
                    )}
                    {/* ستون ویزیتور (که قبلاً مشتری بود) */}
                    <td>
                      {order.salesRep ? (
                        <div>
                          <div className="fw-bold text-primary">
                            {order.salesRep.name}
                          </div>
                          <small className="text-muted">
                            کد: {order.salesRep.code}
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted">تعیین نشده</span>
                      )}
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td className="fw-bold text-success">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleShowInvoice(order)}
                          title="مشاهده فاکتور"
                        >
                          <i className="bi bi-receipt"></i>
                        </button>
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="btn btn-outline-primary"
                          title="مشاهده جزئیات"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleEdit(order)}
                          title="ویرایش سفارش"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* صفحه‌بندی */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <small className="text-muted">
                  صفحه {currentPage} از {totalPages} | نمایش {startIndex + 1}-
                  {Math.min(endIndex, filteredOrders.length)} از{" "}
                  {filteredOrders.length} سفارش
                </small>
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={goToPreviousPage}>
                      قبلی
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={goToNextPage}>
                      بعدی
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {currentOrders.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-cart display-1 text-muted mb-3"></i>
              <p className="text-muted">
                {searchTerm ||
                filterStatus !== "all" ||
                (userRole !== "SALES_REP" && filterSalesRep !== "all")
                  ? "هیچ سفارشی با فیلترهای انتخاب شده یافت نشد"
                  : userRole === "SALES_REP"
                  ? "هنوز هیچ سفارشی به شما اختصاص داده نشده است"
                  : "هیچ سفارشی یافت نشد"}
              </p>
              {(searchTerm ||
                filterStatus !== "all" ||
                (userRole !== "SALES_REP" && filterSalesRep !== "all")) && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterSalesRep("all");
                    setCurrentPage(1);
                  }}
                >
                  نمایش همه سفارشات
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* مودال فاکتور */}
      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          show={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}