// 📂 src/components/orders/OrdersList.js
'use client';

import { 
  Grid, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Skeleton 
} from '@mui/material';
import OrderCard from './OrderCard';

export default function OrdersList({ 
  orders, 
  onOrderClick, 
  onShowInvoice, 
  onEditOrder,
  isLoading = false,
  userRole = 'SALES_REP'
}) {
  // حالت اسکلتون برای زمانی که در حال لودینگ هستیم
  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Grid container spacing={3}>
          {/* 12 اسکلتون برای پر کردن صفحه */}
          {Array.from(new Array(12)).map((_, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ 
                  borderRadius: 2,
                  mb: 1
                }} 
              />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // حالت خالی - وقتی داده‌ها لود شده اما سفارشی وجود ندارد
  if (orders.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          سفارشی یافت نشد
        </Typography>
        <Typography variant="body2" color="text.secondary">
          هیچ سفارشی با معیارهای جستجوی شما مطابقت ندارد
        </Typography>
      </Box>
    );
  }

  // حالت عادی - نمایش سفارشات
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} sm={6} lg={4} key={order.id}>
            <OrderCard
              order={order}
              userRole={userRole}
              onShowInvoice={onShowInvoice}
              onEdit={onEditOrder}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}