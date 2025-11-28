// 📂 src/app/dashboard/orders/page.js
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  Pagination,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import OrdersList from "@/components/orders/OrdersList";
import OrdersFilters from "@/components/orders/OrdersFilters";
import OrdersStats from "@/components/orders/OrdersStats";
import InvoiceModal from "@/components/invoice/InvoiceModal";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [filters, setFilters] = useState({
    status: "all",
    salesRepId: "all",
    search: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [userRole, setUserRole] = useState("SALES_REP");

  // حالت‌های صفحه‌بندی
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
    limit: 40,
  });

  // دریافت سفارشات از API
  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "40",
      });

      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.salesRepId !== "all")
        queryParams.append("salesRepId", filters.salesRepId);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`/api/orders?${queryParams}`);

      if (!response.ok) {
        throw new Error("خطا در دریافت سفارشات");
      }

      const data = await response.json();

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
      showSnackbar("خطا در دریافت سفارشات", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // اولین بار که صفحه لود می‌شود
  useEffect(() => {
    fetchOrders(1);
    const role = localStorage.getItem("userRole") || "SALES_REP";
    setUserRole(role);
  }, []);

  // وقتی فیلترها تغییر می‌کنند، به صفحه اول برو
  useEffect(() => {
    fetchOrders(1);
  }, [filters]);

  const handleCreateOrder = () => {
    router.push("/dashboard/catalog");
  };

  const handleRefresh = () => {
    fetchOrders(pagination.currentPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleOrderClick = (order) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const handleShowInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleEditOrder = (order) => {
    router.push(`/dashboard/orders/${order.id}/edit`);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const handlePageChange = (event, page) => {
    fetchOrders(page);
    // اسکرول به بالای صفحه
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // آمار سفارشات (از کل داده‌ها)
  const getOrdersStats = () => {
    const total = pagination.totalOrders;
    // برای آمار دقیق‌تر می‌توانید یک API جداگانه برای آمار بسازید
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const confirmed = orders.filter(
      (order) => order.status === "CONFIRMED"
    ).length;
    const delivered = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;
    const cancelled = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    const today = new Date();
    const thisWeekDeliveries = orders.filter(
      (order) =>
        order.deliveryDate &&
        new Date(order.deliveryDate) >=
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    ).length;

    const overdueDeliveries = orders.filter(
      (order) =>
        order.deliveryDate &&
        new Date(order.deliveryDate) < today &&
        order.status !== "DELIVERED"
    ).length;

    return {
      total,
      pending,
      confirmed,
      delivered,
      cancelled,
      thisWeekDeliveries,
      overdueDeliveries,
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* هدر صفحه */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            مدیریت سفارشات
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filters.search ||
            filters.status !== "all" ||
            filters.salesRepId !== "all" ? (
              <>
                نمایش {orders.length} سفارش از {pagination.totalOrders} سفارش
              </>
            ) : (
              <>تعداد کل سفارشات: {pagination.totalOrders}</>
            )}
            {pagination.totalPages > 1 && (
              <>
                {" "}
                - صفحه {pagination.currentPage} از {pagination.totalPages}
              </>
            )}
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            بروزرسانی
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
            size="large"
          >
            سفارش جدید
          </Button>
        </Box>
      </Box>

      {/* آمار سریع */}
      <Box mb={4}>
        <OrdersStats stats={getOrdersStats()} />
      </Box>

      {/* فیلترها */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <OrdersFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* اطلاعات صفحه‌بندی */}
      {pagination.totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="body2" color="text.secondary">
            نمایش {(pagination.currentPage - 1) * pagination.limit + 1} تا{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalOrders
            )}{" "}
            از {pagination.totalOrders} سفارش
          </Typography>

          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* محتوای اصلی - لیست کارت‌ها */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, minHeight: 400, mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <OrdersList
            orders={orders}
            onOrderClick={handleOrderClick}
            onShowInvoice={handleShowInvoice}
            onEditOrder={handleEditOrder}
            isLoading={isLoading}
            userRole={userRole}
          />
        </CardContent>
      </Card>

      {/* صفحه‌بندی پایین */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              صفحه {pagination.currentPage} از {pagination.totalPages} - هر
              صفحه: {pagination.limit} سفارش
            </Typography>
          </Stack>
        </Box>
      )}

      {/* مودال فاکتور */}
      {selectedOrder && (
        <InvoiceModal
          open={showInvoice}
          order={selectedOrder}
          onClose={handleCloseInvoice}
        />
      )}

      {/* اسنک بار */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}
