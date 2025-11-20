// 📂 src/components/stores/StoreDeleteDialog.js
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Warning, Delete } from '@mui/icons-material';

export default function StoreDeleteDialog({ open, store, onClose, onConfirm }) {
  if (!store) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Warning color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="700" color="error">
            تایید حذف فروشگاه
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          آیا از حذف فروشگاه "{store.name}" اطمینان دارید؟
        </Alert>
        <Typography variant="body2" color="text.secondary">
          این عمل غیرقابل بازگشت است. تمام اطلاعات مربوط به این فروشگاه شامل سفارشات و تاریخچه حذف خواهد شد.
        </Typography>
        {store._count?.orders > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            این فروشگاه دارای {store._count.orders} سفارش می‌باشد.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          انصراف
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          startIcon={<Delete />}
        >
          حذف فروشگاه
        </Button>
      </DialogActions>
    </Dialog>
  );
}