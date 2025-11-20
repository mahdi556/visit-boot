// 📂 src/components/stores/StoreOrdersTab.js
'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import { Add as AddIcon, ShoppingCart as CartIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
      // ریفرش دستی صفحه
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
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

        <Card>
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

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>شماره سفارش</strong></TableCell>
              <TableCell><strong>تاریخ</strong></TableCell>
              <TableCell><strong>مبلغ کل</strong></TableCell>
              <TableCell><strong>تخفیف</strong></TableCell>
              <TableCell><strong>مبلغ نهایی</strong></TableCell>
              <TableCell><strong>وضعیت</strong></TableCell>
              <TableCell><strong>فروشنده</strong></TableCell>
              <TableCell><strong>تعداد اقلام</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id}
                hover
                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">
                    #{order.id}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                <TableCell>{formatPrice(order.totalDiscount)}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="primary">
                    {formatPrice(order.finalAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {order.user?.firstName} {order.user?.lastName}
                  {order.salesRep && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {order.salesRep.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {order.totalItems} قلم
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}