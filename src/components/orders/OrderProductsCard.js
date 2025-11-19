// 📂 src/components/orders/OrderProductsCard.js
'use client'
import { Card, CardContent, Typography, Box, Avatar, Paper, Grid, Chip } from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'

export default function OrderProductsCard({ order, formatCurrency }) {
  if (!order.items || order.items.length === 0) {
    return (
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            هیچ محصولی در این سفارش وجود ندارد
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <ShoppingCart />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="700">
              لیست کالاها
            </Typography>
            <Typography variant="body2" color="text.secondary">
              محصولات سفارش داده شده
            </Typography>
          </Box>
        </Box>

        {order.items.map((item, index) => (
          <Paper 
            key={item.id} 
            elevation={1}
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid #dee2e6'
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <Typography variant="body2" fontWeight="600" color="white">
                      {index + 1}
                    </Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      {item.product?.name || 'محصول حذف شده'}
                    </Typography>
                    {item.product?.category && (
                      <Typography variant="caption" color="text.secondary">
                        {item.product.category}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">
                        کد محصول
                      </Typography>
                      <Chip 
                        label={item.product?.code || 'ندارد'} 
                        size="small" 
                        color="info" 
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">
                        تعداد
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {item.quantity} عدد
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">
                        قیمت واحد
                      </Typography>
                      <Typography variant="body1" fontWeight="600" color="success.main">
                        {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">
                        مبلغ کل
                      </Typography>
                      <Typography variant="body1" fontWeight="700" color="primary.main">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            borderRadius: 2,
            border: '1px solid #ffd54f'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="700">
              جمع کل سفارش:
            </Typography>
            <Typography variant="h5" fontWeight="800" color="warning.main">
              {formatCurrency(order.totalAmount)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}