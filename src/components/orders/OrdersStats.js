// 📂 src/components/orders/OrdersStats.js
'use client';

import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Schedule as PendingIcon,
  CheckCircle as ConfirmedIcon,
  LocalShipping as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';

const statItems = [
  {
    title: 'کل سفارشات',
    field: 'total',
    icon: OrderIcon,
    color: '#1976d2'
  },
  {
    title: 'در انتظار',
    field: 'pending',
    icon: PendingIcon,
    color: '#ed6c02'
  },
  {
    title: 'تأیید شده',
    field: 'confirmed',
    icon: ConfirmedIcon,
    color: '#2e7d32'
  },
  {
    title: 'تحویل شده',
    field: 'delivered',
    icon: DeliveredIcon,
    color: '#9c27b0'
  },
  {
    title: 'لغو شده',
    field: 'cancelled',
    icon: CancelledIcon,
    color: '#d32f2f'
  }
];

export default function OrdersStats({ stats }) {
  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 2,
              background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
              border: `1px solid ${item.color}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {stats[item.field] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: `${item.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <item.icon sx={{ color: item.color, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}