"use client";

import { useEffect, useState } from "react";
import InvoiceModal from "@/components/invoice/InvoiceModal";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, searchTerm, currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      // مرتب‌سازی بر اساس تاریخ سفارش (orderDate) - جدیدترین اول
      const sortedOrders = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    // فیلتر بر اساس وضعیت
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // فیلتر بر اساس جستجو (نام فروشگاه یا کد فروشگاه)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((order) =>
        order.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.store.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleShowInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleEdit = (order) => {
    window.location.href = `/dashboard/orders/${order.id}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // بازگشت به صفحه اول هنگام جستجو
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // بازگشت به صفحه اول هنگام تغییر فیلتر
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
          <h1 className="h3 mb-0 fw-bold">مدیریت سفارشات</h1>
          <small className="text-muted">
            تعداد کل سفارشات: {orders.length} | نمایش: {currentOrders.length} از {filteredOrders.length}
          </small>
        </div>
        
        <div className="btn-group">
          <button
            className={`btn ${
              filterStatus === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleStatusFilter("all")}
          >
            همه
          </button>
          <button
            className={`btn ${
              filterStatus === "PENDING" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleStatusFilter("PENDING")}
          >
            در انتظار
          </button>
          <button
            className={`btn ${
              filterStatus === "DELIVERED" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleStatusFilter("DELIVERED")}
          >
            تحویل شده
          </button>
        </div>
      </div>

      {/* جستجو */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="جستجو بر اساس نام فروشگاه یا کد فروشگاه..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between align-items-center h-100">
                <small className="text-muted">
                  {searchTerm && `نتایج جستجو برای: "${searchTerm}"`}
                </small>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>شماره سفارش</th>
                  <th>فروشگاه</th>
                  <th>کد فروشگاه</th>
                  <th>مشتری</th>
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
                    </td>
                    <td>
                      <span className="badge bg-secondary">{order.store.code}</span>
                    </td>
                    <td>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "نامشخص"}
                    </td>
                    <td>
                      {formatDate(order.orderDate)}
                    </td>
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
                  صفحه {currentPage} از {totalPages} | 
                  نمایش {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} از {filteredOrders.length} سفارش
                </small>
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={goToPreviousPage}>
                      قبلی
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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
                {searchTerm || filterStatus !== "all"
                  ? "هیچ سفارشی با فیلترهای انتخاب شده یافت نشد"
                  : "هیچ سفارشی یافت نشد"}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
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