// 📂 src/components/orders/OrderCard.js
'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { Receipt, Visibility, Edit, Store, Person, CalendarToday, AttachMoney } from '@mui/icons-material';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order, userRole, onShowInvoice, onEdit }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <Card 
      sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* هدر کارت - شماره سفارش و وضعیت */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
              #ORD-{order.id.toString().padStart(4, '0')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              تاریخ سفارش: {formatDate(order.orderDate || order.createdAt)}
            </Typography>
          </Box>
          <StatusBadge status={order.status} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* اطلاعات اصلی */}
        <Box display="flex" flexDirection="column" gap={2}>
          {/* فروشگاه */}
          <Box display="flex" alignItems="center" gap={2}>
            <Store color="primary" fontSize="small" />
            <Box flex={1}>
              <Typography variant="body1" fontWeight="600">
                {order.store.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                کد فروشگاه: {order.store.code}
              </Typography>
            </Box>
          </Box>

          {/* ویزیتور */}
          <Box display="flex" alignItems="center" gap={2}>
            <Person color="secondary" fontSize="small" />
            <Box flex={1}>
              <Typography variant="body1" fontWeight="600">
                {order.salesRep ? order.salesRep.name : 'تعیین نشده'}
              </Typography>
              {order.salesRep && (
                <Typography variant="body2" color="text.secondary">
                  کد ویزیتور: {order.salesRep.code}
                </Typography>
              )}
            </Box>
          </Box>

          {/* مبلغ و تاریخ */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney color="success" fontSize="small" />
              <Typography variant="h6" fontWeight="700" color="success.main">
                {formatCurrency(order.totalAmount)}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(order.orderDate || order.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* دکمه‌های عملیات */}
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            color="info"
            startIcon={<Receipt />}
            size="small"
            onClick={() => onShowInvoice(order)}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: 'none' } }}
          >
            فاکتور
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Visibility />}
            size="small"
            component={Link}
            href={`/dashboard/orders/${order.id}`}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: 'none' } }}
          >
            جزئیات
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<Edit />}
            size="small"
            onClick={() => onEdit(order)}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: 'none' } }}
          >
            ویرایش
          </Button>
        </Box>

        {/* اطلاعات اضافی برای ادمین */}
        {userRole !== "SALES_REP" && order.salesRep && (
          <Box mt={2} p={2} bgcolor="background.default" borderRadius={2}>
            <Typography variant="caption" color="text.secondary" display="block">
              اطلاعات ویزیتور:
            </Typography>
            <Typography variant="body2">
              {order.salesRep.name} - {order.salesRep.code}
              {order.salesRep.phone && ` - تلفن: ${order.salesRep.phone}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}