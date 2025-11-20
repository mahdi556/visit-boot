// 📂 src/components/orders/OrdersList.js
'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import OrderCard from './OrderCard';

export default function OrdersList({ orders, userRole, onShowInvoice, onEdit }) {
  if (orders.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              هیچ سفارشی یافت نشد
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRole === "SALES_REP" 
                ? "هنوز هیچ سفارشی به شما اختصاص داده نشده است" 
                : "هیچ سفارشی با فیلترهای انتخاب شده یافت نشد"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          userRole={userRole}
          onShowInvoice={onShowInvoice}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}