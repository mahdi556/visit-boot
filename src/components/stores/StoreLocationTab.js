// 📂 src/components/stores/StoreLocationTab.js
'use client';

import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Alert 
} from '@mui/material';
import { 
  Map, 
  OpenInNew,
  Edit 
} from '@mui/icons-material';
import Link from 'next/link';

export default function StoreLocationTab({ store }) {
  if (!store.latitude || !store.longitude) {
    return (
      <Box textAlign="center" py={6}>
        <Map sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          موقعیت مکانی برای این فروشگاه تعریف نشده است
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          برای مشاهده موقعیت روی نقشه، لطفاً موقعیت مکانی را اضافه کنید
        </Typography>
        <Button
          component={Link}
          href={`/dashboard/stores/${store.id}/edit`}
          variant="contained"
          startIcon={<Edit />}
        >
          افزودن موقعیت مکانی
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              مختصات جغرافیایی
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  عرض جغرافیایی
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {store.latitude}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  طول جغرافیایی
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {store.longitude}
                </Typography>
              </Box>
            </Box>

            <Box mt={3}>
              <Button
                href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<OpenInNew />}
                fullWidth
              >
                مشاهده در Google Maps
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
          <CardContent sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              نقشه موقعیت
            </Typography>
            
            <Box 
              sx={{ 
                bgcolor: 'grey.100', 
                borderRadius: 2, 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 2
              }}
            >
              <Box textAlign="center">
                <Map sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="grey.600">
                  نقشه در اینجا نمایش داده می‌شود
                </Typography>
                <Typography variant="caption" color="grey.500">
                  (پیاده‌سازی نقشه)
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              برای مشاهده موقعیت دقیق روی نقشه، بر روی دکمه «مشاهده در Google Maps» کلیک کنید.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}