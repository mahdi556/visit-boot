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
  TablePagination
} from '@mui/material';
import { Visibility, Edit, Receipt } from '@mui/icons-material';
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
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                userRole={userRole}
                onShowInvoice={onShowInvoice}
                onEdit={onEdit}
              />
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