// 📂 src/components/orders/OrdersFilters.js
'use client';

import { Grid, TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';

export default function OrdersFilters({ filters, onFilterChange, salesReps, userRole }) {
  const handleFilterUpdate = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const resetFilters = () => {
    onFilterChange({
      status: 'all',
      salesRep: 'all',
      search: ''
    });
  };

  return (
    <Grid container spacing={3} alignItems="flex-end">
      {/* فیلتر وضعیت */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          fullWidth
          label="وضعیت سفارش"
          value={filters.status}
          onChange={(e) => handleFilterUpdate('status', e.target.value)}
          variant="outlined"
          size="small"
        >
          <MenuItem value="all">همه وضعیت‌ها</MenuItem>
          <MenuItem value="PENDING">در انتظار</MenuItem>
          <MenuItem value="CONFIRMED">تایید شده</MenuItem>
          <MenuItem value="PREPARING">در حال آماده‌سازی</MenuItem>
          <MenuItem value="DELIVERING">در حال ارسال</MenuItem>
          <MenuItem value="DELIVERED">تحویل شده</MenuItem>
          <MenuItem value="CANCELLED">لغو شده</MenuItem>
        </TextField>
      </Grid>

      {/* فیلتر ویزیتور - فقط برای ادمین/مدیر */}
      {userRole !== "SALES_REP" && (
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="ویزیتور"
            value={filters.salesRep}
            onChange={(e) => handleFilterUpdate('salesRep', e.target.value)}
            variant="outlined"
            size="small"
          >
            <MenuItem value="all">همه ویزیتورها</MenuItem>
            <MenuItem value="0">بدون ویزیتور</MenuItem>
            {salesReps.map((rep) => (
              <MenuItem key={rep.id} value={rep.id}>
                {rep.name} - {rep.code}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* جستجو */}
      <Grid item xs={12} sm={6} md={userRole !== "SALES_REP" ? 4 : 6}>
        <TextField
          fullWidth
          label="جستجو"
          value={filters.search}
          onChange={(e) => handleFilterUpdate('search', e.target.value)}
          variant="outlined"
          size="small"
          placeholder={
            userRole === "SALES_REP" 
              ? "جستجو در سفارشات من..." 
              : "جستجو بر اساس فروشگاه، کد فروشگاه، ویزیتور..."
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      {/* دکمه بازنشانی */}
      <Grid item xs={12} sm={6} md={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Refresh />}
          onClick={resetFilters}
          size="large"
        >
          بازنشانی
        </Button>
      </Grid>
    </Grid>
  );
}