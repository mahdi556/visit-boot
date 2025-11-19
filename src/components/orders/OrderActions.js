// 📂 src/components/orders/OrderActions.js
'use client'
import { Button, Stack, useTheme, useMediaQuery } from '@mui/material'
import { Receipt, Edit, Cancel, Delete } from '@mui/icons-material'

export default function OrderActions({ 
  order, 
  editMode, 
  isAdmin, 
  onShowInvoice, 
  onToggleEdit, 
  onDelete 
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Stack 
      direction={isMobile ? "column" : "row"} 
      spacing={1} 
      sx={{ mb: 3 }}
    >
      <Button
        variant="contained"
        startIcon={<Receipt />}
        onClick={onShowInvoice}
        sx={{ borderRadius: 2 }}
        size={isMobile ? "small" : "medium"}
        fullWidth={isMobile}
      >
        مشاهده فاکتور
      </Button>
      <Button
        variant="contained"
        color="warning"
        startIcon={editMode ? <Cancel /> : <Edit />}
        onClick={onToggleEdit}
        sx={{ borderRadius: 2 }}
        size={isMobile ? "small" : "medium"}
        fullWidth={isMobile}
      >
        {editMode ? 'لغو ویرایش' : 'ویرایش سفارش'}
      </Button>
      {isAdmin && (
        <Button
          variant="contained"
          color="error"
          startIcon={<Delete />}
          onClick={onDelete}
          sx={{ borderRadius: 2 }}
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
        >
          حذف سفارش
        </Button>
      )}
    </Stack>
  )
}