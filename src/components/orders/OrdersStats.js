// 📂 src/components/orders/OrdersStats.js
'use client';

import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { 
  ShoppingCart, 
  Schedule, 
  CheckCircle, 
  Person, 
  PersonOff 
} from '@mui/icons-material';

export default function OrdersStats({ orders, userRole, sx = {} }) {
  const calculateStats = () => {
    let statsOrders = orders;

    return {
      totalOrders: statsOrders.length,
      pendingOrders: statsOrders.filter(order => order.status === "PENDING").length,
      deliveredOrders: statsOrders.filter(order => order.status === "DELIVERED").length,
      ordersWithSalesRep: statsOrders.filter(order => order.salesRepId).length,
      ordersWithoutSalesRep: statsOrders.filter(order => !order.salesRepId).length,
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: userRole === "SALES_REP" ? "سفارشات من" : "کل سفارشات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'primary',
      borderColor: 'primary.main'
    },
    {
      title: "در انتظار",
      value: stats.pendingOrders,
      icon: Schedule,
      color: 'warning',
      borderColor: 'warning.main'
    },
    {
      title: "تحویل شده",
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: 'success',
      borderColor: 'success.main'
    },
    ...(userRole !== "SALES_REP" ? [
      {
        title: "دارای ویزیتور",
        value: stats.ordersWithSalesRep,
        icon: Person,
        color: 'info',
        borderColor: 'info.main'
      },
      {
        title: "بدون ویزیتور",
        value: stats.ordersWithoutSalesRep,
        icon: PersonOff,
        color: 'secondary',
        borderColor: 'secondary.main'
      }
    ] : [])
  ];

  return (
    <Grid container spacing={3} sx={sx}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={userRole !== "SALES_REP" ? 2.4 : 4} key={index}>
          <Card 
            sx={{ 
              borderLeft: `4px solid`,
              borderColor: stat.borderColor,
              borderRadius: 2,
              boxShadow: 2,
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontWeight="600" 
                    gutterBottom
                  >
                    {stat.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    fontWeight="700" 
                    color="text.primary"
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${stat.color}.light`,
                    color: `${stat.color}.main`
                  }}
                >
                  <stat.icon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}