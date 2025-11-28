'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Grid,
  Snackbar,
} from "@mui/material";
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import Link from "next/link";

// کامپوننت‌ها
import OrderDetailHeader from "@/components/orders/OrderDetailHeader";
import OrderInfoCard from "@/components/orders/OrderInfoCard";
import OrderProductsCard from "@/components/orders/OrderProductsCard";
import OrderActions from "@/components/orders/OrderActions";
import OrderSidebar from "@/components/orders/OrderSidebar";
import OrderDeleteDialog from "@/components/orders/OrderDeleteDialog";
import OrderEditForm from "@/components/orders/OrderEditForm";
import InvoiceModal from "@/components/invoice/InvoiceModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // حالت ویرایش
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    salesRepId: null,
    storeCode: "",
  });
  const [products, setProducts] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [stores, setStores] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({
    productCode: "",
    quantity: 1,
    price: 0,
  });

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`);

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // مقداردهی اولیه فرم
        setFormData({
          status: data.status,
          notes: data.notes || "",
          salesRepId: data.salesRepId,
          storeCode: data.storeCode,
        });
        setOrderItems(
          data.items?.map((item) => ({
            id: item.id,
            productCode: item.product?.code,
            productName: item.product?.name,
            quantity: item.quantity,
            price: item.price,
          })) || []
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "خطا در دریافت داده");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchCurrentUser();
      fetchOrder();
      fetchProducts();
      fetchSalesReps();
      fetchStores();
    } else {
      setError("شناسه سفارش وجود ندارد");
      setIsLoading(false);
    }
  }, [orderId]);

  // توابع ویرایش
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        status: formData.status,
        notes: formData.notes,
        salesRepId: formData.salesRepId,
        storeCode: formData.storeCode,
        items: orderItems.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: orderItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      };

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setEditMode(false);
        setSnackbar({
          open: true,
          message: "سفارش با موفقیت به‌روزرسانی شد",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "خطا در به‌روزرسانی سفارش",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setSnackbar({
        open: true,
        message: "خطا در ارتباط با سرور",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "سفارش با موفقیت حذف شد",
          severity: "success",
        });
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 1500);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "خطا در حذف سفارش",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setSnackbar({
        open: true,
        message: "خطا در ارتباط با سرور",
        severity: "error",
      });
    } finally {
      setDeleteDialog(false);
    }
  };

  // توابع مدیریت آیتم‌ها
  const handleAddItem = () => {
    if (!newItem.productCode || newItem.quantity <= 0 || newItem.price <= 0) {
      setSnackbar({
        open: true,
        message: "لطفاً اطلاعات محصول را کامل کنید",
        severity: "warning",
      });
      return;
    }

    const selectedProduct = products.find(
      (p) => p.code === newItem.productCode
    );
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productCode === newItem.productCode
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity);
      setOrderItems(updatedItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: Date.now(),
          productCode: newItem.productCode,
          productName: selectedProduct?.name,
          quantity: parseInt(newItem.quantity),
          price: parseFloat(newItem.price),
        },
      ]);
    }

    setNewItem({
      productCode: "",
      quantity: 1,
      price: 0,
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  const handleUpdateItemPrice = (itemId, newPrice) => {
    const priceValue = parseFloat(newPrice) || 0;
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, price: priceValue } : item
      )
    );
  };

  const handleProductChange = (productCode) => {
    const selectedProduct = products.find((p) => p.code === productCode);
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productCode: productCode,
        price: selectedProduct.price || 0,
      });
    }
  };

  // توابع فرمت
  const formatCurrency = (amount) => {
    if (!amount) return "۰ ریال";
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "نامشخص";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const isAdmin = currentUser?.role === "ADMIN";

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          flexDirection="column"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال بارگذاری سفارش #{orderId}...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {" "}
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {error || "سفارش یافت نشد"}
          </Typography>
        </Alert>
        <Box display="flex" gap={2}>
          <Button
            component={Link}
            href="/dashboard/orders"
            variant="contained"
            startIcon={<ArrowBack />}
          >
            بازگشت به لیست سفارشات
          </Button>
          <Button
            variant="outlined"
            onClick={fetchOrder}
            startIcon={<CheckCircle />}
          >
            تلاش مجدد
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* هدر */}
      <OrderDetailHeader order={order} />

      {/* اکشن‌ها */}
      <OrderActions
        order={order}
        editMode={editMode}
        isAdmin={isAdmin}
        onShowInvoice={() => setShowInvoice(true)}
        onToggleEdit={() => setEditMode(!editMode)}
        onDelete={() => setDeleteDialog(true)}
      />

      {/* محتوای اصلی */}
      {editMode ? (
        // حالت ویرایش
        <OrderEditForm
          order={order}
          formData={formData}
          setFormData={setFormData}
          products={products}
          stores={stores}
          salesReps={salesReps}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          newItem={newItem}
          setNewItem={setNewItem}
          isAdmin={isAdmin}
          onUpdate={handleUpdate}
          onCancel={() => setEditMode(false)}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onUpdateItemPrice={handleUpdateItemPrice}
          onProductChange={handleProductChange}
          formatCurrency={formatCurrency}
          calculateTotal={calculateTotal}
        />
      ) : (
        // حالت نمایش
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <OrderInfoCard
              order={order}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
            <OrderProductsCard order={order} formatCurrency={formatCurrency} />
          </Grid>

          <Grid item xs={12} lg={4}>
            <OrderSidebar order={order} />
          </Grid>
        </Grid>
      )}

      {/* دکمه بازگشت */}
      {!editMode && (
        <Box sx={{ mt: 3 }}>
          <Button
            component={Link}
            href="/dashboard/orders"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            بازگشت به لیست سفارشات
          </Button>
        </Box>
      )}

      {/* مودال‌ها و اسنک بار */}
      <OrderDeleteDialog
        open={deleteDialog}
        order={order}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      <InvoiceModal
        order={order}
        show={showInvoice}
        onClose={() => setShowInvoice(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
