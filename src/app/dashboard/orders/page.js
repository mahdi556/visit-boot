// 📂 src/app/dashboard/stores/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Box, 
  CircularProgress, 
  Alert,
  Snackbar,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import StoreHeader from '@/components/stores/StoreHeader';
import StoreStats from '@/components/stores/StoreStats';
import StoreTabs from '@/components/stores/StoreTabs';

export default function StoreDetailsPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setStore(data);
      } else {
        throw new Error('فروشگاه یافت نشد');
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
      showSnackbar('خطا در دریافت اطلاعات فروشگاه', 'error');
    }
  };

  const fetchStoreOrders = async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching store orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStoreDetails(), fetchStoreOrders()]);
    showSnackbar('اطلاعات با موفقیت بروزرسانی شد', 'success');
  };

  useEffect(() => {
    if (params.id) {
      Promise.all([fetchStoreDetails(), fetchStoreOrders()]);
    }
  }, [params.id]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!store) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          فروشگاه یافت نشد
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
        >
          بازگشت
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* دکمه بروزرسانی */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="small"
        >
          {isRefreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}
        </Button>
      </Box>

      {/* هدر صفحه */}
      <StoreHeader store={store} />

      {/* آمار */}
      <StoreStats store={store} orders={orders} />

      {/* تب‌ها */}
      <StoreTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        store={store}
        orders={orders}
        onRefresh={handleRefresh}
      />

      {/* اسنک بار */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}