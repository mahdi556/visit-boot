// 📂 src/components/stores/StoreCreditTab.js
'use client';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Switch,
  TextField,
  MenuItem,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  AccountBalance, 
  Payment, 
  Schedule,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

export default function StoreCreditTab({ store }) {
  const [creditData, setCreditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    creditEnabled: store.creditEnabled || false,
    creditLimit: store.creditLimit || '',
    creditDays: store.creditDays || '',
    creditType: store.creditType || 'CASH'
  });

  useEffect(() => {
    fetchCreditData();
  }, [store.id]);

  const fetchCreditData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stores/${store.id}/credit`);
      
      if (response.ok) {
        const data = await response.json();
        setCreditData(data);
        setFormData({
          creditEnabled: data.creditEnabled,
          creditLimit: data.creditLimit || '',
          creditDays: data.creditDays || '',
          creditType: data.creditType
        });
      } else {
        // اگر API کار نمی‌کند، از داده‌های پایه فروشگاه استفاده کن
        console.log('⚠️ Using fallback store data');
        setCreditData({
          ...store,
          creditBalance: 0,
          creditTransactions: [],
          creditPayments: []
        });
      }
    } catch (error) {
      console.error('Error fetching credit data:', error);
      setError('خطا در دریافت اطلاعات اعتبار');
      // استفاده از داده‌های پایه
      setCreditData({
        ...store,
        creditBalance: 0,
        creditTransactions: [],
        creditPayments: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/stores/${store.id}/credit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCreditData(updatedData);
        // همچنین داده‌های فروشگاه اصلی را آپدیت کن
        store.creditEnabled = updatedData.creditEnabled;
        store.creditLimit = updatedData.creditLimit;
        store.creditDays = updatedData.creditDays;
        store.creditType = updatedData.creditType;
        
        alert('تنظیمات اعتبار با موفقیت ذخیره شد');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      console.error('Error saving credit settings:', error);
      setError(error.message);
      alert('خطا در ذخیره تنظیمات: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCreditStatus = () => {
    if (!creditData) return 'loading';
    
    const balance = creditData.creditBalance || 0;
    const limit = creditData.creditLimit || 0;
    
    if (limit > 0 && balance > limit) return 'over_limit';
    if (limit > 0 && balance > limit * 0.8) return 'warning';
    return 'normal';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>در حال بارگذاری اطلاعات اعتبار...</Typography>
      </Box>
    );
  }

  if (error && !creditData) {
    return (
      <Alert severity="error" icon={<ErrorIcon />}>
        {error}
        <Button onClick={fetchCreditData} sx={{ ml: 2 }} size="small">
          تلاش مجدد
        </Button>
      </Alert>
    );
  }

  const creditStatus = getCreditStatus();
  const balance = creditData?.creditBalance || 0;
  const limit = creditData?.creditLimit || 0;

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* کارت وضعیت اعتبار */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color={balance < 0 ? 'error' : 'primary'}>
                    {new Intl.NumberFormat('fa-IR').format(Math.abs(balance))} تومان
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {balance < 0 ? 'بدهی' : 'اعتبار'} فعلی
                  </Typography>
                </Box>
              </Box>

              {creditStatus === 'over_limit' && (
                <Alert severity="error" icon={<Warning />}>
                  اعتبار فروشگاه بیش از حد مجاز است!
                </Alert>
              )}
              {creditStatus === 'warning' && (
                <Alert severity="warning">
                  اعتبار فروشگاه نزدیک به سقف مجاز است
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>سقف اعتبار:</strong> {limit ? new Intl.NumberFormat('fa-IR').format(limit) + ' تومان' : 'تعیین نشده'}
                </Typography>
                <Typography variant="body2">
                  <strong>نوع اعتبار:</strong> {formData.creditType === 'CASH' ? 'نقدی' : 
                            formData.creditType === 'CREDIT' ? 'اعتباری' : 'چکی'}
                </Typography>
                {formData.creditDays && (
                  <Typography variant="body2">
                    <strong>مدت اعتبار:</strong> {formData.creditDays} روز
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  فروشگاه: {store.name}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* تنظیمات اعتبار */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            تنظیمات اعتبار فروشگاه
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>فعال‌سازی سیستم اعتباری</Typography>
                <Switch
                  checked={formData.creditEnabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    creditEnabled: e.target.checked
                  }))}
                />
              </Box>
            </Grid>

            {formData.creditEnabled && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="سقف اعتبار (تومان)"
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      creditLimit: e.target.value
                    }))}
                    placeholder="1000000"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="نوع اعتبار"
                    value={formData.creditType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      creditType: e.target.value
                    }))}
                  >
                    <MenuItem value="CASH">نقدی</MenuItem>
                    <MenuItem value="CREDIT">اعتباری</MenuItem>
                    <MenuItem value="CHEQUE">چکی</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="تعداد روز اعتبار"
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      creditDays: e.target.value
                    }))}
                    disabled={formData.creditType === 'CASH'}
                    placeholder="30"
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} /> : null}
            >
              {isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={fetchCreditData}
            >
              بروزرسانی اطلاعات
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* پیام اطلاعاتی */}
      <Alert severity="info">
        <Typography variant="body2">
          در این بخش می‌توانید سیستم اعتباری فروشگاه را مدیریت کنید. 
          برای فروشگاه‌های معتبر می‌توانید سقف اعتبار و مدت زمان آن را تعیین نمایید.
        </Typography>
      </Alert>
    </Box>
  );
}