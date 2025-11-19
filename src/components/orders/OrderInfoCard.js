// 📂 src/components/orders/OrderInfoCard.js
'use client'
import { Card, CardContent, Typography, Box, Avatar, Grid, Alert, useTheme, useMediaQuery } from '@mui/material'
import { Info, AttachMoney, CalendarToday, Person, Store } from '@mui/icons-material'
import OrderStatusChip from './OrderStatusChip'

export default function OrderInfoCard({ order, formatCurrency, formatDate }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const InfoItem = ({ icon, bgColor, primary, secondary, isCurrency = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: isMobile ? 2 : 2.5 }}>
      <Avatar sx={{ 
        bgcolor: bgColor, 
        width: isMobile ? 28 : 32, 
        height: isMobile ? 28 : 32,
        flexShrink: 0,
        mr: 1,
        mt: 0.1
      }}>
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          color="text.secondary" 
          fontWeight="600" 
          lineHeight={1.2}
        >
          {primary}
        </Typography>
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          fontWeight="700" 
          color={isCurrency ? 'success.main' : 'text.primary'}
          lineHeight={1.3}
          sx={{ mt: 0.2 }}
        >
          {secondary}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: isMobile ? 40 : 48, 
              height: isMobile ? 40 : 48 
            }}>
              <Info sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700">
                مشخصات سفارش
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                اطلاعات کامل سفارش
              </Typography>
            </Box>
          </Box>
          <OrderStatusChip status={order.status} />
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<Typography variant="body2" fontWeight="600" fontSize={isMobile ? "0.7rem" : "0.8rem"}>#</Typography>}
              bgColor="primary.light"
              primary="شماره سفارش"
              secondary={`ORD-${order.id.toString().padStart(4, '0')}`}
            />
            <InfoItem
              icon={<AttachMoney fontSize={isMobile ? "small" : "small"} />}
              bgColor="success.light"
              primary="مبلغ کل"
              secondary={formatCurrency(order.totalAmount)}
              isCurrency={true}
            />
            <InfoItem
              icon={<CalendarToday fontSize={isMobile ? "small" : "small"} />}
              bgColor="info.light"
              primary="تاریخ ایجاد"
              secondary={formatDate(order.createdAt)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<Person fontSize={isMobile ? "small" : "small"} />}
              bgColor="secondary.light"
              primary="ویزیتور"
              secondary={order.salesRep?.name || 'تعیین نشده'}
            />
            <InfoItem
              icon={<Store fontSize={isMobile ? "small" : "small"} />}
              bgColor="warning.light"
              primary="فروشگاه"
              secondary={order.store?.name}
            />
            <InfoItem
              icon={<Typography variant="body2" fontWeight="600" fontSize={isMobile ? "0.7rem" : "0.8rem"}>کد</Typography>}
              bgColor="info.light"
              primary="کد فروشگاه"
              secondary={order.store?.code}
            />
          </Grid>
        </Grid>

        {order.notes && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
            }}
          >
            <Typography variant={isMobile ? "caption" : "subtitle2"} gutterBottom fontWeight="600">
              📝 یادداشت:
            </Typography>
            <Typography variant={isMobile ? "caption" : "body1"}>{order.notes}</Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}