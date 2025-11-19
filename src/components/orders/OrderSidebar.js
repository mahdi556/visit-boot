// 📂 src/components/orders/OrderSidebar.js
'use client'
import { Stack, Card, CardContent, Typography, Box, Avatar, Alert, Chip } from '@mui/material'
import { Person, Store, CheckCircle } from '@mui/icons-material'

export default function OrderSidebar({ order }) {
  const InfoItem = ({ icon, primary, secondary, chip }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2.5 }}>
      <Avatar sx={{ 
        bgcolor: 'primary.light', 
        width: 32, 
        height: 32,
        flexShrink: 0,
        mt: 0.1
      }}>
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight="600" lineHeight={1.2}>
          {primary}
        </Typography>
        {chip ? (
          <Box sx={{ mt: 0.2 }}>
            {chip}
          </Box>
        ) : (
          <Typography variant="body1" fontWeight="700" color="text.primary" lineHeight={1.3} sx={{ mt: 0.2 }}>
            {secondary}
          </Typography>
        )}
      </Box>
    </Box>
  )

  return (
    <Stack spacing={3}>
      {/* اطلاعات ویزیتور */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">
                اطلاعات ویزیتور
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مسئول پیگیری سفارش
              </Typography>
            </Box>
          </Box>

          {order.salesRep ? (
            <>
              <InfoItem
                icon={<Person fontSize="small" />}
                primary="نام"
                secondary={order.salesRep.name}
              />
              <InfoItem
                icon={<Typography variant="body2" fontWeight="600" fontSize="0.8rem">#</Typography>}
                primary="کد"
                chip={<Chip label={order.salesRep.code} size="small" color="primary" variant="filled" />}
              />
              <InfoItem
                icon={<Typography variant="body2" fontSize="0.8rem">📞</Typography>}
                primary="تلفن"
                secondary={order.salesRep.phone || 'ثبت نشده'}
              />
              <InfoItem
                icon={<CheckCircle fontSize="small" />}
                primary="وضعیت"
                chip={
                  <Chip 
                    label={order.salesRep.isActive ? 'فعال' : 'غیرفعال'} 
                    size="small" 
                    color={order.salesRep.isActive ? 'success' : 'error'} 
                  />
                }
              />
            </>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              ویزیتور تعیین نشده است
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* اطلاعات فروشگاه */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <Store />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">
                اطلاعات فروشگاه
              </Typography>
              <Typography variant="body2" color="text.secondary">
                اطلاعات کامل فروشگاه
              </Typography>
            </Box>
          </Box>

          <InfoItem
            icon={<Store fontSize="small" />}
            primary="نام فروشگاه"
            secondary={order.store?.name || 'نامشخص'}
          />
          <InfoItem
            icon={<Typography variant="body2" fontSize="0.8rem">🏷️</Typography>}
            primary="کد فروشگاه"
            chip={<Chip label={order.store?.code} size="small" color="secondary" />}
          />
          <InfoItem
            icon={<Typography variant="body2" fontSize="0.8rem">👤</Typography>}
            primary="مالک"
            secondary={order.store?.ownerName || 'نامشخص'}
          />
          <InfoItem
            icon={<Typography variant="body2" fontSize="0.8rem">📞</Typography>}
            primary="تلفن"
            secondary={order.store?.phone || 'ثبت نشده'}
          />
          <InfoItem
            icon={<Typography variant="body2" fontSize="0.8rem">📍</Typography>}
            primary="آدرس"
            secondary={order.store?.address || 'ثبت نشده'}
          />
        </CardContent>
      </Card>
    </Stack>
  )
}