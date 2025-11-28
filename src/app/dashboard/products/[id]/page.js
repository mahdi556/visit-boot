// 📂 src/app/dashboard/products/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Home as HomeIcon,
  Inventory as ProductsIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Tag as TagIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  LocalOffer as PricingIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from "@mui/icons-material";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductData();
      fetchPricingPlans();
    }
  }, [productId]);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/pricing-plans`);
      if (response.ok) {
        const data = await response.json();
        setPricingPlans(data);
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
    }
  };

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products/${productId}/history`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("محصول یافت نشد");
        } else {
          throw new Error("خطا در دریافت اطلاعات محصول");
        }
      }
      
      const data = await response.json();
      
      if (!data || !data.product) {
        throw new Error("داده‌های محصول نامعتبر است");
      }
      
      setProductData(data);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError(error.message);
      setProductData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStoreBasePrice = (consumerPrice) => {
    if (!consumerPrice) return 0;
    return Math.round(consumerPrice * (1 - 0.123));
  };

  const formatCurrency = (amount) => {
    if (!amount) return "۰ ریال";
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "تعریف نشده";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const handleDeletePlan = async (planId) => {
    if (confirm("آیا از حذف این طرح قیمت مطمئن هستید؟")) {
      try {
        const response = await fetch(`/api/pricing-plans/${planId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("طرح قیمت حذف شد");
          fetchPricingPlans();
        } else {
          alert("خطا در حذف طرح قیمت");
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("خطا در حذف طرح قیمت");
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          در حال بارگذاری اطلاعات محصول...
        </Typography>
      </Box>
    );
  }

  if (error || !productData) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">{error || "خطا در دریافت اطلاعات محصول"}</Typography>
        </Alert>
        <Button
          component={Link}
          href="/dashboard/products"
          variant="contained"
          startIcon={<BackIcon />}
        >
          بازگشت به لیست محصولات
        </Button>
      </Box>
    );
  }

  const { product, salesHistory = [], totalSales = 0, totalRevenue = 0 } = productData;
  
  if (!product) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">محصول یافت نشد</Typography>
        </Alert>
        <Button
          component={Link}
          href="/dashboard/products"
          variant="contained"
          startIcon={<BackIcon />}
        >
          بازگشت به لیست محصولات
        </Button>
      </Box>
    );
  }

  const storeBasePrice = calculateStoreBasePrice(product.price);

  // آمار محصول
  const stats = [
    {
      label: "قیمت مصرف کننده",
      value: formatCurrency(product.price),
      icon: <TagIcon />,
      color: "primary"
    },
    {
      label: "قیمت پایه فروشگاه",
      value: formatCurrency(storeBasePrice),
      icon: <StoreIcon />,
      color: "success"
    },
    {
      label: "تعداد فروش",
      value: `${totalSales} عدد`,
      icon: <CartIcon />,
      color: "info"
    },
    {
      label: "درآمد کل",
      value: formatCurrency(totalRevenue),
      icon: <MoneyIcon />,
      color: "warning"
    }
  ];

  const tabs = [
    { label: "اطلاعات محصول", icon: <InfoIcon /> },
    { label: "تاریخچه فروش", icon: <HistoryIcon /> },
    { label: "طرح‌های قیمت‌گذاری", icon: <PricingIcon /> }
  ];

  return (
    <Box p={3}>
      {/* هدر صفحه */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                داشبورد
              </Typography>
            </Link>
            <Link href="/dashboard/products" style={{ textDecoration: 'none' }}>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ProductsIcon sx={{ mr: 0.5 }} fontSize="small" />
                محصولات
              </Typography>
            </Link>
            <Typography color="text.primary">
              {product.name}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>
          {product.code && (
            <Typography variant="body1" color="text.secondary">
              کد: {product.code}
            </Typography>
          )}
        </Box>
        
        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
          <Button
            component={Link}
            href="/dashboard/products"
            variant="outlined"
            startIcon={<BackIcon />}
            size={isMobile ? "small" : "medium"}
          >
            بازگشت
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            size={isMobile ? "small" : "medium"}
          >
            ویرایش
          </Button>
        </Stack>
      </Box>

      {/* کارت‌های آمار */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                borderLeft: 4,
                borderColor: `${stat.color}.main`,
                height: '100%'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}.light`,
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* تب‌ها */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tab.icon}
                    <Box sx={{ ml: 1 }}>{tab.label}</Box>
                    {index === 1 && salesHistory.length > 0 && (
                      <Chip 
                        label={salesHistory.length} 
                        size="small" 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {index === 2 && pricingPlans.length > 0 && (
                      <Chip 
                        label={pricingPlans.length} 
                        size="small" 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {/* تب اطلاعات محصول */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  مشخصات اصلی
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                          نام محصول:
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          قیمت مصرف کننده:
                        </TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(product.price)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          قیمت پایه فروشگاه:
                        </TableCell>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          {formatCurrency(storeBasePrice)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          دسته‌بندی:
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.category || "تعریف نشده"} 
                            color="secondary" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      {product.code && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            کد محصول:
                          </TableCell>
                          <TableCell>{product.code}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          تاریخ ایجاد:
                        </TableCell>
                        <TableCell>{formatDate(product.createdAt)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  اطلاعات تکمیلی
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      {product.weight && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                            وزن:
                          </TableCell>
                          <TableCell>
                            {product.weight} {product.unit || "گرم"}
                          </TableCell>
                        </TableRow>
                      )}
                      {product.description && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                            توضیحات:
                          </TableCell>
                          <TableCell>{product.description}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          تعداد کل فروش:
                        </TableCell>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          {totalSales} عدد
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          درآمد کل:
                        </TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(totalRevenue)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {/* تب تاریخچه فروش */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                تاریخچه فروش محصول
              </Typography>

              {salesHistory.length > 0 ? (
                <>
                  {/* نمایش جدول در دسکتاپ */}
                  {!isMobile && (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>تاریخ فروش</TableCell>
                            <TableCell>شماره سفارش</TableCell>
                            <TableCell>مشتری</TableCell>
                            <TableCell>فروشگاه</TableCell>
                            <TableCell>تعداد</TableCell>
                            <TableCell>قیمت واحد</TableCell>
                            <TableCell>مبلغ کل</TableCell>
                            <TableCell>وضعیت</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {salesHistory.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>{formatDate(sale.orderDate)}</TableCell>
                              <TableCell>
                                <Link
                                  href={`/dashboard/orders/${sale.orderId}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Typography color="primary" variant="body2">
                                    #ORD-{sale.orderId.toString().padStart(4, "0")}
                                  </Typography>
                                </Link>
                              </TableCell>
                              <TableCell>
                                {sale.customer
                                  ? `${sale.customer.firstName} ${sale.customer.lastName}`
                                  : "مشتری حذف شده"}
                              </TableCell>
                              <TableCell>{sale.store?.name || "فروشگاه حذف شده"}</TableCell>
                              <TableCell>{sale.quantity} عدد</TableCell>
                              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                {formatCurrency(sale.price)}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {formatCurrency(sale.totalAmount)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    sale.orderStatus === "DELIVERED"
                                      ? "تحویل شده"
                                      : sale.orderStatus === "COMPLETED"
                                      ? "تکمیل شده"
                                      : sale.orderStatus
                                  }
                                  color={
                                    sale.orderStatus === "DELIVERED"
                                      ? "success"
                                      : sale.orderStatus === "COMPLETED"
                                      ? "info"
                                      : "warning"
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* نمایش کارت در موبایل */}
                  {isMobile && (
                    <Stack spacing={2}>
                      {salesHistory.map((sale) => (
                        <Card key={sale.id} variant="outlined">
                          <CardContent>
                            <Stack spacing={2}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="subtitle2" fontWeight="bold">
                                  #{sale.orderId.toString().padStart(4, "0")}
                                </Typography>
                                <Chip
                                  label={
                                    sale.orderStatus === "DELIVERED"
                                      ? "تحویل شده"
                                      : sale.orderStatus === "COMPLETED"
                                      ? "تکمیل شده"
                                      : sale.orderStatus
                                  }
                                  color={
                                    sale.orderStatus === "DELIVERED"
                                      ? "success"
                                      : sale.orderStatus === "COMPLETED"
                                      ? "info"
                                      : "warning"
                                  }
                                  size="small"
                                />
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  تاریخ:
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(sale.orderDate)}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  مشتری:
                                </Typography>
                                <Typography variant="body2">
                                  {sale.customer
                                    ? `${sale.customer.firstName} ${sale.customer.lastName}`
                                    : "مشتری حذف شده"}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  فروشگاه:
                                </Typography>
                                <Typography variant="body2">
                                  {sale.store?.name || "فروشگاه حذف شده"}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  تعداد:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {sale.quantity} عدد
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  قیمت واحد:
                                </Typography>
                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                  {formatCurrency(sale.price)}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  مبلغ کل:
                                </Typography>
                                <Typography variant="body1" color="primary.main" fontWeight="bold">
                                  {formatCurrency(sale.totalAmount)}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={5}>
                  <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    هنوز فروشی برای این محصول ثبت نشده است
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* تب طرح‌های قیمت‌گذاری */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="primary">
                  طرح‌های قیمت‌گذاری محصول
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowPricingModal(true)}
                  size="small"
                >
                  افزودن سطح قیمت
                </Button>
              </Box>

              {pricingPlans.length > 0 ? (
                <>
                  {/* نمایش جدول در دسکتاپ */}
                  {!isMobile && (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>طرح</TableCell>
                            <TableCell>حداقل تعداد</TableCell>
                            <TableCell>درصد تخفیف</TableCell>
                            <TableCell>قیمت پایه فروشگاه</TableCell>
                            <TableCell>قیمت با تخفیف</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell>عملیات</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pricingPlans.map((plan) => {
                            const discountedPrice = Math.round(
                              storeBasePrice * (1 - (plan.discountRate || 0))
                            );

                            return (
                              <TableRow key={plan.id}>
                                <TableCell>{plan.pricingPlan?.name || "طرح نامشخص"}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={`${plan.minQuantity} عدد`} 
                                    color="info" 
                                    size="small" 
                                  />
                                </TableCell>
                                <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                  {Math.round((plan.discountRate || 0) * 100)}%
                                </TableCell>
                                <TableCell>{formatCurrency(storeBasePrice)}</TableCell>
                                <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                  {formatCurrency(discountedPrice)}
                                </TableCell>
                                <TableCell>{plan.description || "-"}</TableCell>
                                <TableCell>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeletePlan(plan.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* نمایش کارت در موبایل */}
                  {isMobile && (
                    <Stack spacing={2}>
                      {pricingPlans.map((plan) => {
                        const discountedPrice = Math.round(
                          storeBasePrice * (1 - (plan.discountRate || 0))
                        );

                        return (
                          <Card key={plan.id} variant="outlined">
                            <CardContent>
                              <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {plan.pricingPlan?.name || "طرح نامشخص"}
                                  </Typography>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeletePlan(plan.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    حداقل تعداد:
                                  </Typography>
                                  <Chip 
                                    label={`${plan.minQuantity} عدد`} 
                                    color="info" 
                                    size="small" 
                                  />
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    درصد تخفیف:
                                  </Typography>
                                  <Typography variant="body2" color="success.main" fontWeight="bold">
                                    {Math.round((plan.discountRate || 0) * 100)}%
                                  </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    قیمت پایه:
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(storeBasePrice)}
                                  </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    قیمت با تخفیف:
                                  </Typography>
                                  <Typography variant="body1" color="error.main" fontWeight="bold">
                                    {formatCurrency(discountedPrice)}
                                  </Typography>
                                </Box>
                                
                                {plan.description && (
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      توضیحات:
                                    </Typography>
                                    <Typography variant="body2">
                                      {plan.description}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={5}>
                  <PricingIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    هیچ طرح قیمت‌گذاری برای این محصول تعریف نشده است
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowPricingModal(true)}
                    sx={{ mt: 2 }}
                  >
                    افزودن اولین سطح قیمت
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* مودال افزودن طرح قیمت */}
      {showPricingModal && (
        <PricingPlanForm
          product={product}
          storeBasePrice={storeBasePrice}
          onSuccess={() => {
            setShowPricingModal(false);
            fetchPricingPlans();
          }}
          onCancel={() => setShowPricingModal(false)}
        />
      )}
    </Box>
  );
}

// کامپوننت فرم افزودن طرح قیمت
function PricingPlanForm({ product, storeBasePrice, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    pricingPlanId: "",
    minQuantity: 3,
    discountRate: 8,
    description: "",
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch("/api/pricing-plans");
      if (!response.ok) {
        throw new Error("خطا در دریافت طرح‌ها");
      }
      const data = await response.json();
      setAvailablePlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      setAvailablePlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pricingPlanId) {
      alert("لطفاً یک طرح قیمت‌گذاری انتخاب کنید");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        pricingPlanId: parseInt(formData.pricingPlanId),
        minQuantity: parseInt(formData.minQuantity),
        discountRate: parseFloat(formData.discountRate) / 100,
        description: formData.description,
      };

      const response = await fetch(
        `/api/products/${product.id}/pricing-plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("طرح قیمت با موفقیت اضافه شد");
        onSuccess();
      } else {
        alert(result.error || "خطا در افزودن طرح قیمت");
      }
    } catch (error) {
      console.error("Error adding pricing plan:", error);
      alert("خطا در افزودن طرح قیمت");
    } finally {
      setIsLoading(false);
    }
  };

  const discountedPrice = Math.round(
    storeBasePrice * (1 - formData.discountRate / 100)
  );

  return (
    <Dialog open maxWidth="md" fullWidth>
      <DialogTitle>افزودن سطح قیمت جدید</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>طرح قیمت‌گذاری</InputLabel>
                {isLoadingPlans ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">در حال بارگذاری طرح‌ها...</Typography>
                  </Box>
                ) : (
                  <Select
                    value={formData.pricingPlanId}
                    label="طرح قیمت‌گذاری"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricingPlanId: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">انتخاب طرح</MenuItem>
                    {availablePlans && availablePlans.length > 0 ? (
                      availablePlans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name}{" "}
                          {plan.description && `- ${plan.description}`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        هیچ طرحی یافت نشد
                      </MenuItem>
                    )}
                  </Select>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="حداقل تعداد"
                type="number"
                value={formData.minQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minQuantity: parseInt(e.target.value) || 1,
                  })
                }
                required
                margin="normal"
                inputProps={{ min: "1" }}
                helperText="حداقل تعداد برای اعمال این تخفیف"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="درصد تخفیف"
                type="number"
                value={formData.discountRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountRate: parseFloat(e.target.value) || 0,
                  })
                }
                required
                margin="normal"
                inputProps={{ min: "0", max: "100", step: "1" }}
                helperText="درصد تخفیف از قیمت پایه فروشگاه"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="توضیحات"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                margin="normal"
                placeholder="مثال: تخفیف عمده‌فروشی"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  پیش‌نمایش قیمت:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      قیمت مصرف‌کننده:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {product.price?.toLocaleString("fa-IR")} ریال
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      قیمت پایه فروشگاه:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {storeBasePrice?.toLocaleString("fa-IR")} ریال
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      قیمت با تخفیف:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {discountedPrice?.toLocaleString("fa-IR")} ریال
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  اگر مشتری {formData.minQuantity} عدد یا بیشتر بخرد، قیمت هر
                  عدد {discountedPrice?.toLocaleString("fa-IR")} ریال خواهد بود.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={isLoading}>
            انصراف
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading || !formData.pricingPlanId}
          >
            {isLoading ? "در حال ذخیره..." : "افزودن سطح قیمت"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}