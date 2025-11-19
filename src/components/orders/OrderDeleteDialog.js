// 📂 src/components/orders/OrderDeleteDialog.js
'use client'
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material'
import { Delete } from '@mui/icons-material'

export default function OrderDeleteDialog({ 
  open, 
  order, 
  onClose, 
  onConfirm 
}) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Delete color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" fontWeight="700">
          حذف سفارش
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          آیا از حذف سفارش
          <Typography component="span" color="primary" fontWeight="700" mx={1}>
            #{order.id.toString().padStart(4, '0')}
          </Typography>
          مطمئن هستید؟
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
          این عمل قابل بازگشت نیست.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          انصراف
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          startIcon={<Delete />}
          sx={{ borderRadius: 2 }}
        >
          حذف سفارش
        </Button>
      </DialogActions>
    </Dialog>
  )
}