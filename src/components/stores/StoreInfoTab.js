// 📂 src/components/stores/StoreInfoTab.js
'use client';

import { Grid, Box, Typography, Chip, Divider } from '@mui/material';
import { 
  Person, 
  Phone, 
  LocationOn, 
  Category,
  CalendarToday 
} from '@mui/icons-material';

export default function StoreInfoTab({ store }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getStoreTypeText = (type) => {
    const types = {
      SUPERMARKET: "سوپرمارکت",
      GROCERY: "بقالی",
      CONVENIENCE: "مینی‌مارکت",
      HYPERMARKET: "هایپر مارکت",
    };
    return types[type] || type;
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
          اطلاعات اصلی
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Person color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                نام مالک
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {store.ownerName}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Phone color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                شماره تلفن
              </Typography>
              <Typography 
                variant="body1" 
                fontWeight="600"
                component="a"
                href={`tel:${store.phone}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                {store.phone}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Category color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                نوع فروشگاه
              </Typography>
              <Chip 
                label={getStoreTypeText(store.storeType)} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
          اطلاعات پخش
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <LocationOn color="secondary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                منطقه پخش
              </Typography>
              {store.deliveryZone ? (
                <Chip 
                  label={store.deliveryZone.name}
                  sx={{ 
                    bgcolor: store.deliveryZone.color || 'primary.main',
                    color: 'white'
                  }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  تعریف نشده
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <LocationOn color="secondary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                مسیر تحویل
              </Typography>
              {store.route ? (
                <Chip 
                  label={store.route.name}
                  sx={{ 
                    bgcolor: store.route.color || 'secondary.main',
                    color: 'white'
                  }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  تعریف نشده
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <CalendarToday color="secondary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                تاریخ ثبت
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {formatDate(store.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="flex-start" gap={2}>
          <LocationOn color="action" />
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              آدرس کامل
            </Typography>
            <Typography variant="body1">
              {store.address}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}