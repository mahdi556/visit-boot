// 📂 src/components/orders/OrderEditForm.js
"use client";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Paper,
} from "@mui/material";
import { Add, Remove, Save, Cancel } from "@mui/icons-material";
import SalesRepSelector from "./SalesRepSelector";

export default function OrderEditForm({
  order,
  formData,
  setFormData,
  products,
  stores,
  salesReps,
  orderItems,
  setOrderItems,
  newItem,
  setNewItem,
  isAdmin,
  onUpdate,
  onCancel,
  onAddItem,
  onRemoveItem,
  onUpdateItemQuantity,
  onUpdateItemPrice,
  onProductChange,
  formatCurrency,
  calculateTotal,
}) {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight="700" color="primary">
          ویرایش سفارش
        </Typography>

        <form onSubmit={onUpdate}>
          {/* فیلدهای اصلی */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="وضعیت سفارش"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
                variant="outlined"
              >
                <MenuItem value="PENDING">در انتظار</MenuItem>
                <MenuItem value="CONFIRMED">تایید شده</MenuItem>
                <MenuItem value="PREPARING">در حال آماده‌سازی</MenuItem>
                <MenuItem value="DELIVERING">در حال ارسال</MenuItem>
                <MenuItem value="DELIVERED">تحویل شده</MenuItem>
                <MenuItem value="CANCELLED">لغو شده</MenuItem>
              </TextField>
            </Grid>

            {isAdmin && (
              <Grid item xs={12} md={4}>
                <SalesRepSelector
                  selectedRep={formData.salesRepId}
                  onRepChange={(salesRepId) =>
                    setFormData({ ...formData, salesRepId })
                  }
                  salesReps={salesReps}
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="فروشگاه"
                value={formData.storeCode}
                onChange={(e) =>
                  setFormData({ ...formData, storeCode: e.target.value })
                }
                required
                variant="outlined"
              >
                <MenuItem value="">انتخاب فروشگاه</MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.code} value={store.code}>
                    {store.name} - {store.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="یادداشت"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="یادداشت درباره سفارش..."
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* افزودن کالا */}
          <Card sx={{ mb: 4, bgcolor: "background.default" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                افزودن کالا به سفارش
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="محصول"
                    value={newItem.productCode}
                    onChange={(e) => onProductChange(e.target.value)}
                    variant="outlined"
                    size="small"
                  >
                    <MenuItem value="">انتخاب محصول</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.code} value={product.code}>
                        {product.name} - {formatCurrency(product.price)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="تعداد"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                    inputProps={{ min: 1 }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="قیمت"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="تاریخ تحویل"
                    value={formData.deliveryDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAddItem}
                    size="large"
                  >
                    افزودن کالا
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* لیست کالاها */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              لیست کالاها
            </Typography>

            {orderItems.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>نام کالا</TableCell>
                      <TableCell>کد کالا</TableCell>
                      <TableCell align="center">تعداد</TableCell>
                      <TableCell align="center">قیمت واحد</TableCell>
                      <TableCell align="center">مبلغ کل</TableCell>
                      <TableCell align="center">عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {item.productName || "محصول حذف شده"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              onUpdateItemQuantity(item.id, e.target.value)
                            }
                            inputProps={{ min: 1 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              onUpdateItemPrice(item.id, e.target.value)
                            }
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="primary"
                          >
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Remove />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="h6" fontWeight="700">
                          جمع کل:
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          color="success.main"
                        >
                          {formatCurrency(calculateTotal())}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                هیچ کالایی به سفارش اضافه نشده است
              </Alert>
            )}
          </Box>

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              size="large"
            >
              ذخیره تغییرات
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
              size="large"
            >
              انصراف
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
