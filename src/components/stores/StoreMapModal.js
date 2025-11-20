// 📂 src/components/stores/StoreMapModal.js
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import LocationPickerMap from '@/components/stores/LocationPickerMap';

export default function StoreMapModal({ open, initialLocation, onClose, onLocationConfirm }) {
  const handleLocationSelect = (lat, lng) => {
    // این تابع می‌تواند برای نمایش موقعیت در نقشه استفاده شود
    console.log('Location selected:', lat, lng);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          height: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="700">
          انتخاب موقعیت فروشگاه روی نقشه
        </Typography>
        <Typography variant="body2" color="text.secondary">
          روی نقشه کلیک کنید تا موقعیت فروشگاه را مشخص کنید
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box sx={{ height: '100%', minHeight: 500 }}>
          <LocationPickerMap
            onLocationSelect={handleLocationSelect}
            onLocationConfirm={onLocationConfirm}
            initialLocation={initialLocation}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          startIcon={<Close />}
        >
          انصراف
        </Button>
        <Button 
          variant="contained"
          startIcon={<Check />}
          onClick={() => {
            // این دکمه موقعیت فعلی رو تأیید می‌کنه
            if (window.lastSelectedLocation) {
              onLocationConfirm(window.lastSelectedLocation.lat, window.lastSelectedLocation.lng);
            }
          }}
        >
          تأیید موقعیت
        </Button>
      </DialogActions>
    </Dialog>
  );
}