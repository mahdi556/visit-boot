// 📂 src/components/orders/OrdersFilters.js
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  FilterList,
  Clear,
  Search,
} from '@mui/icons-material';

export default function OrdersFilters({ filters, onFilterChange, onRefresh }) {
  const [localFilters, setLocalFilters] = useState({
    status: filters?.status || 'all',
    salesRepId: filters?.salesRepId || 'all',
    search: filters?.search || '',
    deliveryDateFilter: filters?.deliveryDateFilter || 'all', // اضافه شده
  });

  const [salesReps, setSalesReps] = useState([]);

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const fetchSalesReps = async () => {
    try {
      const response = await fetch('/api/sales-reps');
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data);
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: 'all',
      salesRepId: 'all',
      search: '',
      deliveryDateFilter: 'all',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.status !== 'all' ||
    localFilters.salesRepId !== 'all' ||
    localFilters.search !== '' ||
    localFilters.deliveryDateFilter !== 'all';

  return (
    <Box>
      {/* نمایش فیلترهای فعال */}
      {hasActiveFilters && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          {localFilters.status !== 'all' && (
            <Chip
              label={`وضعیت: ${localFilters.status}`}
              onDelete={() => handleFilterChange('status', 'all')}
              color="primary"
              variant="outlined"
            />
          )}
          {localFilters.salesRepId !== 'all' && (
            <Chip
              label={`ویزیتور: ${salesReps.find(rep => rep.id === parseInt(localFilters.salesRepId))?.name || localFilters.salesRepId}`}
              onDelete={() => handleFilterChange('salesRepId', 'all')}
              color="secondary"
              variant="outlined"
            />
          )}
          {localFilters.deliveryDateFilter !== 'all' && (
            <Chip
              label={`تاریخ تحویل: ${getDeliveryDateFilterLabel(localFilters.deliveryDateFilter)}`}
              onDelete={() => handleFilterChange('deliveryDateFilter', 'all')}
              color="info"
              variant="outlined"
            />
          )}
          {localFilters.search && (
            <Chip
              label={`جستجو: ${localFilters.search}`}
              onDelete={() => handleFilterChange('search', '')}
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      )}

      <Grid container spacing={2} alignItems="center">
        {/* فیلتر وضعیت */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>وضعیت سفارش</InputLabel>
            <Select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="وضعیت سفارش"
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="PENDING">در انتظار</MenuItem>
              <MenuItem value="CONFIRMED">تأیید شده</MenuItem>
              <MenuItem value="PREPARING">در حال آماده‌سازی</MenuItem>
              <MenuItem value="DELIVERED">تحویل شده</MenuItem>
              <MenuItem value="CANCELLED">لغو شده</MenuItem>
              <MenuItem value="RETURNED">مرجوع شده</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* فیلتر ویزیتور */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>ویزیتور</InputLabel>
            <Select
              value={localFilters.salesRepId}
              onChange={(e) => handleFilterChange('salesRepId', e.target.value)}
              label="ویزیتور"
            >
              <MenuItem value="all">همه ویزیتورها</MenuItem>
              {salesReps.map((rep) => (
                <MenuItem key={rep.id} value={rep.id}>
                  {rep.name} - {rep.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* فیلتر تاریخ تحویل - جدید */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>تاریخ تحویل</InputLabel>
            <Select
              value={localFilters.deliveryDateFilter}
              onChange={(e) => handleFilterChange('deliveryDateFilter', e.target.value)}
              label="تاریخ تحویل"
            >
              <MenuItem value="all">همه تاریخ‌ها</MenuItem>
              <MenuItem value="today">امروز</MenuItem>
              <MenuItem value="this_week">این هفته</MenuItem>
              <MenuItem value="overdue">تأخیر دار</MenuItem>
              <MenuItem value="delivered">تحویل شده</MenuItem>
              <MenuItem value="not_delivered">در انتظار تحویل</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* فیلتر جستجو */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="جستجو (فروشگاه، کد، شماره سفارش)"
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Grid>

        {/* دکمه‌های عملیات */}
        <Grid item xs={12}>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              size="small"
            >
              پاک کردن فیلترها
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={onRefresh}
              size="small"
            >
              اعمال فیلتر
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// تابع کمکی برای نمایش متن فیلتر تاریخ تحویل
function getDeliveryDateFilterLabel(value) {
  const labels = {
    today: 'امروز',
    this_week: 'این هفته',
    overdue: 'تأخیر دار',
    delivered: 'تحویل شده',
    not_delivered: 'در انتظار تحویل',
  };
  return labels[value] || value;
}