// 📂 src/components/orders/StatusBadge.js
'use client';

import { Chip } from '@mui/material';
import {
  Schedule as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Inventory as PreparingIcon,
  LocalShipping as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';

const statusConfig = {
  PENDING: {
    label: 'در انتظار',
    color: 'warning',
    icon: PendingIcon
  },
  CONFIRMED: {
    label: 'تأیید شده',
    color: 'info',
    icon: ConfirmedIcon
  },
  PREPARING: {
    label: 'در حال آماده‌سازی',
    color: 'secondary',
    icon: PreparingIcon
  },
  DELIVERED: {
    label: 'تحویل شده',
    color: 'success',
    icon: DeliveredIcon
  },
  CANCELLED: {
    label: 'لغو شده',
    color: 'error',
    icon: CancelledIcon
  }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    color: 'default',
    icon: null
  };

  const IconComponent = config.icon;

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant="filled"
      size="small"
      icon={IconComponent ? <IconComponent /> : undefined}
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        minWidth: 100
      }}
    />
  );
}