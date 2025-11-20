// 📂 src/components/orders/OrderRow.js
'use client';

import { TableRow, TableCell, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Visibility, Edit, Receipt } from '@mui/icons-material';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function OrderRow({ order, userRole, onShowInvoice, onEdit }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Typography variant="body2" fontWeight="600" color="primary">
          #ORD-{order.id.toString().padStart(4, '0')}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="600">
            {order.store.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            کد: {order.store.code}
          </Typography>
        </Box>
      </TableCell>

      {/* ستون ویزیتور فقط برای ادمین/مدیر */}
      {userRole !== "SALES_REP" && (
        <TableCell>
          {order.salesRep ? (
            <Box>
              <Typography variant="body2" fontWeight="600" color="primary">
                {order.salesRep.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                کد: {order.salesRep.code}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              تعیین نشده
            </Typography>
          )}
        </TableCell>
      )}

      <TableCell>
        <Typography variant="body2">
          {formatDate(order.orderDate || order.createdAt)}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2" fontWeight="700" color="success.main">
          {formatCurrency(order.totalAmount)}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <StatusBadge status={order.status} />
      </TableCell>

      <TableCell align="center">
        <Box display="flex" justifyContent="center" gap={1}>
          <Tooltip title="مشاهده فاکتور">
            <IconButton 
              color="info" 
              size="small"
              onClick={() => onShowInvoice(order)}
            >
              <Receipt fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="مشاهده جزئیات">
            <IconButton 
              color="primary" 
              size="small"
              component={Link}
              href={`/dashboard/orders/${order.id}`}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="ویرایش سفارش">
            <IconButton 
              color="success" 
              size="small"
              onClick={() => onEdit(order)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}