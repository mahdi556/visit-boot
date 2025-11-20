// 📂 src/components/stores/StoreCard.js
'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Store as StoreIcon,
  Person,
  Phone,
  LocationOn,
  Map,
  ShoppingCart
} from '@mui/icons-material';
import Link from 'next/link';

export default function StoreCard({ store, onEdit, onDelete }) {
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
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* هدر کارت */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Link href={`/dashboard/stores/${store.id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              color="primary"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {store.name}
            </Typography>
          </Link>
          <Chip
            label={getStoreTypeText(store.storeType)}
            color={getStoreTypeColor(store.storeType)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* کد فروشگاه */}
        <Box mb={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            کد: {store.code}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* اطلاعات فروشگاه */}
        <Box sx={{ flex: 1, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Person color="action" fontSize="small" />
            <Typography variant="body2" color="text.primary">
              {store.ownerName}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Phone color="action" fontSize="small" />
            <Typography variant="body2" color="text.primary">
              {store.phone}
            </Typography>
          </Box>

          <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
            <LocationOn color="action" fontSize="small" sx={{ mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {store.address}
            </Typography>
          </Box>

          {store.latitude && store.longitude && (
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Map color="success" fontSize="small" />
              <Typography variant="caption" color="success.main" fontWeight="600">
                موقعیت روی نقشه مشخص شده
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {store._count?.orders || 0} سفارش
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* دکمه‌های عملیات */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            #{store.id.toString().padStart(3, '0')}
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton
              color="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(store);
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'primary.main'
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(store.id);
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'error.main'
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}