// 📂 src/components/stores/StoreStats.js
'use client';

import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { 
  Store as StoreIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as MoneyIcon,
  Inventory as ProductIcon
} from '@mui/icons-material';

export default function StoreStats({ store, orders }) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount), 0);
  const totalItems = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const stats = [
    {
      title: 'تعداد سفارشات',
      value: totalOrders,
      icon: OrderIcon,
      color: '#1976d2'
    },
    {
      title: 'درآمد کل',
      value: `${new Intl.NumberFormat('fa-IR').format(totalRevenue)} تومان`,
      icon: MoneyIcon,
      color: '#2e7d32'
    },
    {
      title: 'تعداد اقلام فروخته شده',
      value: totalItems,
      icon: ProductIcon,
      color: '#ed6c02'
    },
    {
      title: 'میانگین ارزش سفارش',
      value: totalOrders > 0 
        ? `${new Intl.NumberFormat('fa-IR').format(Math.round(totalRevenue / totalOrders))} تومان`
        : '۰ تومان',
      icon: StoreIcon,
      color: '#9c27b0'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 2,
              background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
              border: `1px solid ${stat.color}30`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <stat.icon sx={{ color: stat.color, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}