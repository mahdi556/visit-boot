// 📂 src/components/stores/StoreOrdersTab.js
'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Alert,
  IconButton,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  ShoppingCart as CartIcon, 
  Refresh as RefreshIcon,
  Receipt as InvoiceIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StoreOrdersTab({ store, orders, onRefresh }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCreateOrder = () => {
    router.push(`/dashboard/catalog?storeCode=${store.code}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOrderClick = (orderId) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleShowInvoice = (order, e) => {
    e.stopPropagation();
    // اینجا می‌توانید مودال فاکتور را باز کنید
    console.log('Show invoice for order:', order.id);
  };

  const handleEditOrder = (order, e) => {
    e.stopPropagation();
    router.push(`/dashboard/orders/${order.id}/edit`);
  };

  const formatPrice = (price) => {
    if (!price) return '۰ تومان';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PREPARING': 'secondary',
      'DELIVERED': 'success',
      'CANCELLED': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'در انتظار',
      'CONFIRMED': 'تأیید شده',
      'PREPARING': 'در حال آماده‌سازی',
      'DELIVERED': 'تحویل شده',
      'CANCELLED': 'لغو شده'
    };
    return statusMap[status] || status;
  };

  // محاسبه تعداد اقلام
  const getTotalItems = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
    }
    return 0;
  };

  // اگر orders undefined یا null باشد
  if (!orders) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          خطا در دریافت اطلاعات سفارشات
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'در حال بارگذاری...' : 'تلاش مجدد'}
        </Button>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            سفارش‌های فروشگاه
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              بروزرسانی
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOrder}
              size="large"
            >
              ایجاد سفارش جدید
            </Button>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              هنوز سفارشی برای این فروشگاه ثبت نشده است
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              اولین سفارش را برای {store.name} ایجاد کنید
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateOrder}
            >
              ایجاد اولین سفارش
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          سفارش‌های فروشگاه ({orders.length})
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            بروزرسانی
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
          >
            سفارش جدید
          </Button>
        </Box>
      </Box>

      {/* لیست کارت‌های سفارش */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {orders.map((order) => (
          <Card 
            key={order.id}
            sx={{ 
              borderRadius: 2, 
              boxShadow: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleOrderClick(order.id)}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    سفارش #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.orderDate)}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status)}
                    size="small"
                    variant="outlined"
                  />
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleEditOrder(order, e)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleShowInvoice(order, e)}
                    color="secondary"
                  >
                    <InvoiceIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    مبلغ کل
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatPrice(order.totalAmount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    تخفیف
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    {formatPrice(order.totalDiscount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    مبلغ نهایی
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatPrice(order.finalAmount || order.totalAmount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    تعداد اقلام
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getTotalItems(order)} قلم
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    فروشنده
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {order.user?.firstName} {order.user?.lastName}
                  </Typography>
                  {order.salesRep && (
                    <Typography variant="caption" color="text.secondary">
                      {order.salesRep.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* اطلاعات اضافی برای موبایل */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
                <Stack direction="row" spacing={2} justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      مبلغ نهایی
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatPrice(order.finalAmount || order.totalAmount)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      تعداد
                    </Typography>
                    <Typography variant="body2">
                      {getTotalItems(order)} قلم
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}