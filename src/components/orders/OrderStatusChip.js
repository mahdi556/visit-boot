// 📂 src/components/orders/OrderStatusChip.js
'use client'
import { Chip } from '@mui/material'
import { Schedule, CheckCircle, Edit, LocalShipping, Cancel, Info } from '@mui/icons-material'

export default function OrderStatusChip({ status }) {
  const statusConfig = {
    PENDING: {
      label: 'در انتظار',
      color: 'warning',
      icon: <Schedule />
    },
    CONFIRMED: {
      label: 'تایید شده',
      color: 'info',
      icon: <CheckCircle />
    },
    PREPARING: {
      label: 'در حال آماده‌سازی',
      color: 'primary',
      icon: <Edit />
    },
    DELIVERING: {
      label: 'در حال ارسال',
      color: 'secondary',
      icon: <LocalShipping />
    },
    DELIVERED: {
      label: 'تحویل شده',
      color: 'success',
      icon: <CheckCircle />
    },
    CANCELLED: {
      label: 'لغو شده',
      color: 'error',
      icon: <Cancel />
    }
  }

  const config = statusConfig[status] || {
    label: status,
    color: 'default',
    icon: <Info />
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="filled"
      sx={{ 
        fontWeight: 600, 
        fontSize: '0.9rem',
        height: '32px'
      }}
    />
  )
}