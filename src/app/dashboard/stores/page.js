// 📂 src/app/dashboard/stores/page.js
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Add, Store as StoreIcon, Search, Clear } from '@mui/icons-material';
import dynamic from 'next/dynamic';

// کامپوننت‌ها
import StoreCard from '@/components/stores/StoreCard';
import StoreFormModal from '@/components/stores/StoreFormModal';
import StoreDeleteDialog from '@/components/stores/StoreDeleteDialog';

// نقشه با لودینگ داینامیک
const StoreMapModal = dynamic(() => import('@/components/stores/StoreMapModal'), {
  ssr: false,
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
      <CircularProgress />
    </Box>
  )
});

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    applySearch();
  }, [stores, searchTerm]);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      const data = await response.json();
      setStores(data);
      setFilteredStores(data); // مقدار اولیه برای filteredStores
    } catch (error) {
      console.error("Error fetching stores:", error);
      showSnackbar('خطا در دریافت فروشگاه‌ها', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredStores(stores);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(term) ||
      store.code.toLowerCase().includes(term) ||
      store.ownerName.toLowerCase().includes(term) ||
      store.phone.includes(term) ||
      store.address.toLowerCase().includes(term)
    );
    
    setFilteredStores(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setSelectedLocation(
      store.latitude && store.longitude
        ? { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) }
        : null
    );
    setShowFormModal(true);
  };

  const handleDelete = async (storeId) => {
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStores(stores.filter((store) => store.id !== storeId));
        setDeleteDialog(null);
        showSnackbar('فروشگاه با موفقیت حذف شد', 'success');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'خطا در حذف فروشگاه', 'error');
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      showSnackbar('خطا در حذف فروشگاه', 'error');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = editingStore ? `/api/stores/${editingStore.id}` : "/api/stores";
      const method = editingStore ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          latitude: selectedLocation ? selectedLocation.lat : null,
          longitude: selectedLocation ? selectedLocation.lng : null,
        }),
      });

      if (response.ok) {
        setShowFormModal(false);
        setEditingStore(null);
        setSelectedLocation(null);
        fetchStores();

        const message = editingStore ? "فروشگاه با موفقیت ویرایش شد" : "فروشگاه با موفقیت ایجاد شد";
        showSnackbar(message, 'success');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'خطا در ذخیره فروشگاه', 'error');
      }
    } catch (error) {
      console.error("Error saving store:", error);
      showSnackbar('خطا در ذخیره فروشگاه', 'error');
    }
  };

  const handleLocationConfirm = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setShowMapModal(false);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setEditingStore(null);
    setSelectedLocation(null);
    setShowFormModal(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* هدر صفحه */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            مدیریت فروشگاه‌ها
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? (
              <>نمایش {filteredStores.length} از {stores.length} فروشگاه</>
            ) : (
              <>تعداد فروشگاه‌ها: {stores.length}</>
            )}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => setShowFormModal(true)}
          sx={{ borderRadius: 2 }}
        >
          فروشگاه جدید
        </Button>
      </Box>

      {/* جستجو */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            label="جستجو در فروشگاه‌ها"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="جستجو بر اساس نام، کد، مالک، تلفن یا آدرس..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <Button
                    onClick={clearSearch}
                    size="small"
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <Clear fontSize="small" />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {searchTerm && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                نتایج جستجو برای: "{searchTerm}"
              </Typography>
              <Button 
                onClick={clearSearch}
                size="small" 
                startIcon={<Clear />}
              >
                پاک کردن جستجو
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* لیست فروشگاه‌ها */}
      {filteredStores.length > 0 ? (
        <Grid container spacing={3}>
          {filteredStores.map((store) => (
            <Grid item xs={12} sm={6} lg={4} key={store.id}>
              <StoreCard
                store={store}
                onEdit={handleEdit}
                onDelete={setDeleteDialog}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Box textAlign="center" py={8}>
              <StoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? 'هیچ فروشگاهی یافت نشد' : 'هیچ فروشگاهی یافت نشد'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? `هیچ فروشگاهی با عبارت "${searchTerm}" یافت نشد`
                  : 'برای شروع اولین فروشگاه خود را ایجاد کنید'
                }
              </Typography>
              {searchTerm ? (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearSearch}
                  sx={{ mr: 1 }}
                >
                  پاک کردن جستجو
                </Button>
              ) : null}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowFormModal(true)}
                size="large"
              >
                افزودن اولین فروشگاه
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* مودال فرم */}
      <StoreFormModal
        open={showFormModal}
        editingStore={editingStore}
        selectedLocation={selectedLocation}
        onClose={resetForm}
        onSubmit={handleSubmit}
        onOpenMap={() => setShowMapModal(true)}
      />

      {/* مودال نقشه */}
      {showMapModal && (
        <StoreMapModal
          open={showMapModal}
          initialLocation={selectedLocation}
          onClose={() => setShowMapModal(false)}
          onLocationConfirm={handleLocationConfirm}
        />
      )}

      {/* دیالوگ حذف */}
      <StoreDeleteDialog
        open={!!deleteDialog}
        store={stores.find(s => s.id === deleteDialog)}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => handleDelete(deleteDialog)}
      />

      {/* اسنک بار */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}