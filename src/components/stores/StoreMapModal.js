// 📂 src/components/stores/StoreFormModal.js
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Grid,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  LocationOn,
  EditLocation
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

export default function StoreFormModal({ 
  open, 
  editingStore, 
  selectedLocation, 
  onClose, 
  onSubmit, 
  onOpenMap 
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    ownerName: "",
    phone: "",
    address: "",
    storeType: "SUPERMARKET",
  });

  useEffect(() => {
    if (editingStore) {
      setFormData({
        name: editingStore.name || "",
        code: editingStore.code || "",
        ownerName: editingStore.ownerName || "",
        phone: editingStore.phone || "",
        address: editingStore.address || "",
        storeType: editingStore.storeType || "SUPERMARKET",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        ownerName: "",
        phone: "",
        address: "",
        storeType: "SUPERMARKET",
      });
    }
  }, [editingStore, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      ownerName: "",
      phone: "",
      address: "",
      storeType: "SUPERMARKET",
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={resetForm}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      {/* اصلاح شده: حذف Typography تودرتو */}
      <DialogTitle sx={{ pb: 1 }}>
        <Typography 
          variant="h5" 
          fontWeight="700"
          component="div" // اضافه کردن این خط
        >
          {editingStore ? 'ویرایش فروشگاه' : 'افزودن فروشگاه جدید'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام فروشگاه"
                value={formData.name}
                onChange={handleChange('name')}
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="نام مالک"
                value={formData.ownerName}
                onChange={handleChange('ownerName')}
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="کد فروشگاه"
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="مثلاً: ST001"
                helperText="اگر خالی بگذارید، کد به صورت خودکار تولید می‌شود"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="شماره تلفن"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="نوع فروشگاه"
                value={formData.storeType}
                onChange={handleChange('storeType')}
                required
                margin="normal"
              >
                <MenuItem value="SUPERMARKET">سوپرمارکت</MenuItem>
                <MenuItem value="GROCERY">بقالی</MenuItem>
                <MenuItem value="CONVENIENCE">مینی‌مارکت</MenuItem>
                <MenuItem value="HYPERMARKET">هایپر مارکت</MenuItem>
              </TextField>

              <Box mt={2} mb={2}>
                <Typography variant="subtitle2" gutterBottom component="div">
                  موقعیت روی نقشه
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: selectedLocation ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: selectedLocation ? 'success.light' : 'grey.50',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {selectedLocation ? (
                    <Box>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography color="success.main" fontWeight="600" gutterBottom component="div">
                        موقعیت مشخص شده
                      </Typography>
                      <Chip 
                        label={`${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        startIcon={<EditLocation />}
                        onClick={onOpenMap}
                        variant="outlined"
                        size="small"
                      >
                        تغییر موقعیت
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LocationOn sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary" gutterBottom component="div">
                        موقعیت مشخص نشده
                      </Typography>
                      <Button
                        startIcon={<LocationOn />}
                        onClick={onOpenMap}
                        variant="contained"
                        size="small"
                      >
                        انتخاب موقعیت روی نقشه
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="آدرس کامل"
            value={formData.address}
            onChange={handleChange('address')}
            required
            margin="normal"
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={resetForm} variant="outlined">
            انصراف
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!selectedLocation}
          >
            {editingStore ? 'ویرایش فروشگاه' : 'ایجاد فروشگاه'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}