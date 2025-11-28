// 📂 src/components/orders/OrdersTable.js
'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  IconButton,
  Chip,
  TablePagination,
  Tooltip
} from '@mui/material';
import { Visibility, Edit, Receipt, CreditCard, Schedule } from '@mui/icons-material';
import Link from 'next/link';
import OrderRow from './OrderRow';
import StatusBadge from './StatusBadge';

export default function OrdersTable({ 
  orders, 
  currentPage, 
  itemsPerPage, 
  userRole, 
  onShowInvoice, 
  onEdit,
  onPageChange 
}) {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // تابع برای نمایش متن روش پرداخت
  const getPaymentMethodText = (method) => {
    const methods = {
      'CASH': 'نقدی',
      'CREDIT': 'اعتباری',
      'CHEQUE': 'چکی'
    };
    return methods[method] || method;
  };

  // تابع برای رنگ روش پرداخت
  const getPaymentMethodColor = (method) => {
    const colors = {
      'CASH': 'success',
      'CREDIT': 'primary',
      'CHEQUE': 'warning'
    };
    return colors[method] || 'default';
  };

  if (orders.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          هیچ سفارشی یافت نشد
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {userRole === "SALES_REP" 
            ? "هنوز هیچ سفارشی به شما اختصاص داده نشده است" 
            : "هیچ سفارشی در سیستم ثبت نشده است"}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>فروشگاه</TableCell>
              {userRole !== "SALES_REP" && <TableCell>ویزیتور</TableCell>}
              <TableCell>تاریخ سفارش</TableCell>
              <TableCell align="center">مبلغ</TableCell>
              <TableCell align="center">روش پرداخت</TableCell>
              <TableCell align="center">مدت اعتبار</TableCell>
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order.id} hover>
                {/* شماره سفارش */}
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {order.orderNumber || `ORD-${order.id.toString().padStart(6, '0')}`}
                  </Typography>
                </TableCell>

                {/* فروشگاه */}
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {order.store?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.store?.code}
                    </Typography>
                  </Box>
                </TableCell>

                {/* ویزیتور */}
                {userRole !== "SALES_REP" && (
                  <TableCell>
                    {order.salesRep ? (
                      <Box>
                        <Typography variant="body2">
                          {order.salesRep.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.salesRep.code}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        بدون ویزیتور
                      </Typography>
                    )}
                  </TableCell>
                )}

                {/* تاریخ سفارش */}
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString('fa-IR')}
                    </Typography>
                  </Box>
                </TableCell>

                {/* مبلغ */}
                <TableCell align="center">
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {order.finalAmount?.toLocaleString('fa-IR')} ریال
                    </Typography>
                    {order.totalDiscount > 0 && (
                      <Typography variant="caption" color="warning.main">
                        تخفیف: {order.totalDiscount.toLocaleString('fa-IR')} ریال
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* روش پرداخت */}
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <Tooltip title={getPaymentMethodText(order.paymentMethod)}>
                      <Chip 
                        icon={order.paymentMethod === 'CREDIT' ? <CreditCard /> : undefined}
                        label={getPaymentMethodText(order.paymentMethod)}
                        color={getPaymentMethodColor(order.paymentMethod)}
                        size="small"
                        variant={order.paymentMethod === 'CREDIT' ? 'filled' : 'outlined'}
                      />
                    </Tooltip>
                  </Box>
                </TableCell>

                {/* مدت اعتبار */}
                <TableCell align="center">
                  {order.paymentMethod === 'CREDIT' ? (
                    order.creditDays ? (
                      <Tooltip title={`این سفارش ${order.creditDays} روز اعتبار دارد`}>
                        <Chip 
                          icon={<Schedule />}
                          label={`${order.creditDays} روز`}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="سفارش اعتباری بدون مدت مشخص">
                        <Chip 
                          label="بدون مدت"
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    )
                  ) : order.paymentMethod === 'CHEQUE' ? (
                    <Tooltip title="پرداخت با چک">
                      <Chip 
                        label="چک"
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                {/* وضعیت */}
                <TableCell align="center">
                  <StatusBadge status={order.status} />
                </TableCell>

                {/* عملیات */}
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="مشاهده جزئیات">
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={Link}
                        href={`/dashboard/orders/${order.id}`}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="ویرایش سفارش">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => onEdit && onEdit(order)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="چاپ فاکتور">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => onShowInvoice && onShowInvoice(order)}
                      >
                        <Receipt />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* صفحه‌بندی */}
      <TablePagination
        component="div"
        count={orders.length}
        page={currentPage - 1}
        onPageChange={handleChangePage}
        rowsPerPage={itemsPerPage}
        rowsPerPageOptions={[itemsPerPage]}
        labelDisplayedRows={({ from, to, count }) => 
          `نمایش ${from}-${to} از ${count} سفارش`
        }
        labelRowsPerPage="تعداد در هر صفحه:"
      />
    </>
  );
}