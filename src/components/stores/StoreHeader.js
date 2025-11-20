// 📂 src/components/stores/StoreHeader.js
'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Breadcrumbs,
  Chip 
} from '@mui/material';
import { 
  ArrowBack, 
  Edit, 
  Store as StoreIcon 
} from '@mui/icons-material';
import Link from 'next/link';

export default function StoreHeader({ store }) {
  const getStoreTypeText = (type) => {
    const types = {
      SUPERMARKET: "سوپرمارکت",
      GROCERY: "بقالی",
      CONVENIENCE: "مینی‌مارکت",
      HYPERMARKET: "هایپر مارکت",
    };
    return types[type] || type;
  };

  const getStoreTypeColor = (type) => {
    const colors = {
      SUPERMARKET: 'primary',
      GROCERY: 'success',
      CONVENIENCE: 'warning',
      HYPERMARKET: 'error',
    };
    return colors[type] || 'default';
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
      <Box flex={1}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Box display="flex" alignItems="center" color="inherit">
              <Typography variant="body2" color="text.primary">
                داشبورد
              </Typography>
            </Box>
          </Link>
          <Link href="/dashboard/stores" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="text.primary">
              فروشگاه‌ها
            </Typography>
          </Link>
          <Typography variant="body2" color="primary.main" fontWeight="600">
            {store.name}
          </Typography>
        </Breadcrumbs>

        {/* عنوان و اطلاعات */}
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <StoreIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
              {store.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={getStoreTypeText(store.storeType)}
                color={getStoreTypeColor(store.storeType)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                کد: {store.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مالک: {store.ownerName}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* دکمه‌های عمل */}
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button
          component={Link}
          href={`/dashboard/stores/${store.id}/edit`}
          variant="outlined"
          startIcon={<Edit />}
          size="large"
        >
          ویرایش فروشگاه
        </Button>
        <Button
          component={Link}
          href="/dashboard/stores"
          variant="outlined"
          startIcon={<ArrowBack />}
          size="large"
        >
          بازگشت به لیست
        </Button>
      </Box>
    </Box>
  );
}