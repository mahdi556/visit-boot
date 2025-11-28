// src/app/dashboard/products/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Button,
  Box,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageLoadedStates, setImageLoadedStates] = useState({});
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    currentStock: "",
    weight: "",
    unit: "",
    code: "",
    description: "",
    image: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = (productId) => {
    setImageLoadedStates(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const handleImageError = (productId, e) => {
    e.target.src = "/images/default-product.jpg";
    setImageLoadedStates(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          currentStock: parseInt(formData.currentStock),
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
        alert(
          editingProduct ? "محصول با موفقیت ویرایش شد" : "محصول جدید ایجاد شد"
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطایی رخ داده است");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("خطا در ذخیره محصول");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      currentStock: product.currentStock || "",
      weight: product.weight || "",
      unit: product.unit || "",
      code: product.code || "",
      description: product.description || "",
      image: product.image || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (
      confirm("آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.")
    ) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchProducts();
          alert("محصول با موفقیت حذف شد");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "خطا در حذف محصول");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("خطا در حذف محصول");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      currentStock: "",
      weight: "",
      unit: "",
      code: "",
      description: "",
      image: ""
    });
    setEditingProduct(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const getStockColor = (stock) => {
    if (stock > 10) return "success";
    if (stock > 0) return "warning";
    return "error";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "لبنیات": "primary",
      "نوشیدنی": "secondary",
      "خشکبار": "warning",
      "تنقلات": "info",
      "کنسرو": "success",
      "روغن": "error",
      "غلات": "default",
      "پروتئین": "primary",
      "میوه و سبزی": "success",
      "سایر": "default"
    };
    return colors[category] || "default";
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          در حال بارگذاری محصولات...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="container-fluid">
      {/* هدر صفحه */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            مدیریت محصولات
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مشاهده، ویرایش و مدیریت کلیه محصولات
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          محصول جدید
        </Button>
      </Box>

      {/* لیست محصولات به صورت کارت */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              {/* تصویر محصول */}
              <Box sx={{ 
                height: 200, 
                position: 'relative',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={`/images/products/${product.code}.jpg`}
                  className="w-100 h-100"
                  alt={product.name}
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                    backgroundColor: "#f8f9fa",
                  }}
                  onLoad={() => handleImageLoad(product.id)}
                  onError={(e) => handleImageError(product.id, e)}
                />
                {!imageLoadedStates[product.id] && (
                  <CircularProgress 
                    size={40} 
                    sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }} 
                  />
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* عنوان و دسته‌بندی */}
                <Typography variant="h6" component="h2" gutterBottom noWrap>
                  {product.name}
                </Typography>
                
                {product.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.description}
                  </Typography>
                )}

                {/* کد محصول */}
                {product.code && (
                  <Chip
                    label={`کد: ${product.code}`}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1, mr: 1 }}
                  />
                )}

                {/* دسته‌بندی */}
                <Chip
                  label={product.category}
                  color={getCategoryColor(product.category)}
                  size="small"
                  sx={{ mb: 1 }}
                />

                {/* اطلاعات قیمت و موجودی */}
                <Stack spacing={1} mt={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      قیمت:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {formatCurrency(product.price)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      وزن:
                    </Typography>
                    <Typography variant="body2">
                      {product.weight ? `${product.weight} ${product.unit || "گرم"}` : "تعریف نشده"}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      موجودی:
                    </Typography>
                    <Chip
                      label={`${product.currentStock} عدد`}
                      color={getStockColor(product.currentStock)}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      تاریخ ایجاد:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(product.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              {/* دکمه‌های عملیات */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <IconButton
                    component={Link}
                    href={`/dashboard/products/${product.id}`}
                    color="info"
                    size="small"
                    title="مشاهده جزئیات"
                  >
                    <ViewIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleEdit(product)}
                    color="primary"
                    size="small"
                    title="ویرایش محصول"
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleDelete(product.id)}
                    color="error"
                    size="small"
                    title="حذف محصول"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* حالت بدون محصول */}
      {products.length === 0 && (
        <Box textAlign="center" py={10}>
          <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            هیچ محصولی یافت نشد
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            برای شروع کار اولین محصول خود را ایجاد کنید
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowModal(true)}
            size="large"
          >
            افزودن اولین محصول
          </Button>
        </Box>
      )}

      {/* مودال ایجاد/ویرایش محصول */}
      <Dialog 
        open={showModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="نام محصول"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="کد محصول"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="اختیاری"
                  margin="normal"
                  helperText="کد محصول برای نام فایل تصویر استفاده می‌شود"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="قیمت پایه (مصرف کننده)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  margin="normal"
                  inputProps={{ min: "0", step: "1000" }}
                  helperText="قیمت تک عددی برای مصرف کننده نهایی"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="آدرس تصویر محصول (اختیاری)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  margin="normal"
                  helperText="در صورت عدم تعریف، تصویر از /images/products/{کد-محصول}.jpg لود می‌شود"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    value={formData.category}
                    label="دسته‌بندی"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="">انتخاب کنید</MenuItem>
                    <MenuItem value="لبنیات">لبنیات</MenuItem>
                    <MenuItem value="نوشیدنی">نوشیدنی</MenuItem>
                    <MenuItem value="خشکبار">خشکبار</MenuItem>
                    <MenuItem value="تنقلات">تنقلات</MenuItem>
                    <MenuItem value="کنسرو">کنسرو</MenuItem>
                    <MenuItem value="روغن">روغن</MenuItem>
                    <MenuItem value="غلات">غلات</MenuItem>
                    <MenuItem value="پروتئین">پروتئین</MenuItem>
                    <MenuItem value="میوه و سبزی">میوه و سبزی</MenuItem>
                    <MenuItem value="سایر">سایر</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="موجودی اولیه"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  required
                  margin="normal"
                  inputProps={{ min: "0" }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="وزن"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  margin="normal"
                  placeholder="اختیاری"
                  inputProps={{ min: "0", step: "0.1" }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>واحد</InputLabel>
                  <Select
                    value={formData.unit}
                    label="واحد"
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <MenuItem value="">انتخاب واحد</MenuItem>
                    <MenuItem value="گرم">گرم</MenuItem>
                    <MenuItem value="کیلوگرم">کیلوگرم</MenuItem>
                    <MenuItem value="میلی‌لیتر">میلی‌لیتر</MenuItem>
                    <MenuItem value="لیتر">لیتر</MenuItem>
                    <MenuItem value="عدد">عدد</MenuItem>
                    <MenuItem value="بسته">بسته</MenuItem>
                    <MenuItem value="کارتن">کارتن</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  placeholder="توضیحات اختیاری درباره محصول..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseModal}>
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained"
            >
              {editingProduct ? "بروزرسانی محصول" : "ایجاد محصول"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}