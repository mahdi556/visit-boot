"use client";

import { useState, useEffect, useCallback } from "react";
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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  Store as StoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

// تابع debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function StoresPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStores: 0,
    hasNext: false,
    hasPrev: false,
    limit: 25,
  });

  // استفاده از debounce برای جستجو
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms تاخیر

  // تابع fetchStores با useCallback
  const fetchStores = useCallback(async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        ...(search && { search }),
      });

      console.log("🔄 Fetching stores with params:", params.toString());

      const response = await fetch(`/api/stores?${params}`);

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "خطا در دریافت اطلاعات فروشگاه‌ها";
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
          console.error("🔴 API Error details:", errorData);
        } catch (e) {
          console.error("🔴 Could not parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(
        "📦 Received data successfully, stores count:",
        data.stores?.length
      );

      if (data && data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
        setPagination(data.pagination);
      } else {
        console.warn("⚠️ Unexpected data structure:", data);
        setStores([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalStores: 0,
          hasNext: false,
          hasPrev: false,
          limit: 25,
        });
      }
    } catch (error) {
      console.error("❌ Error in fetchStores:", error);
      setError(error.message);
      setStores([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalStores: 0,
        hasNext: false,
        hasPrev: false,
        limit: 25,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // بارگذاری اولیه
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // جستجو با debounce
  useEffect(() => {
    if (debouncedSearchTerm !== null) {
      fetchStores(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchStores]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // دیگر اینجا fetchStores فراخوانی نمی‌شود - توسط useEffect با debounce مدیریت می‌شود
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || "",
      code: store.code || "",
      ownerName: store.ownerName || "",
      phone: store.phone || "",
      address: store.address || "",
      storeType: store.storeType || "SUPERMARKET",
      latitude: store.latitude || "",
      longitude: store.longitude || "",
      deliveryZoneId: store.deliveryZone?.id || "",
      routeId: store.route?.id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (storeId) => {
    if (!confirm("آیا از حذف این فروشگاه اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStores(pagination.currentPage, searchTerm);
        alert("فروشگاه با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف فروشگاه");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      alert("خطا در حذف فروشگاه");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    ownerName: "",
    phone: "",
    address: "",
    storeType: "SUPERMARKET",
    latitude: "",
    longitude: "",
    deliveryZoneId: "",
    routeId: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      ownerName: "",
      phone: "",
      address: "",
      storeType: "SUPERMARKET",
      latitude: "",
      longitude: "",
      deliveryZoneId: "",
      routeId: "",
    });
    setEditingStore(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingStore
        ? `/api/stores/${editingStore.id}`
        : "/api/stores";
      const method = editingStore ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchStores(pagination.currentPage, searchTerm);
        alert(
          editingStore ? "فروشگاه با موفقیت ویرایش شد" : "فروشگاه جدید ایجاد شد"
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در ذخیره فروشگاه");
      }
    } catch (error) {
      console.error("Error saving store:", error);
      alert("خطا در ذخیره فروشگاه");
    }
  };

  const getStoreTypeText = (type) => {
    const types = {
      SUPERMARKET: "سوپرمارکت",
      GROCERY: "بقالی",
      CONVENIENCE: "مینی‌مارکت",
      HYPERMARKET: "هایپر مارکت",
      OTHER: "سایر",
    };
    return types[type] || type;
  };

  const getStoreTypeColor = (type) => {
    const colors = {
      SUPERMARKET: "primary",
      GROCERY: "success",
      CONVENIENCE: "warning",
      HYPERMARKET: "error",
      OTHER: "default",
    };
    return colors[type] || "default";
  };

  if (isLoading && stores.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          در حال بارگذاری فروشگاه‌ها...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* هدر صفحه */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={4}
      >
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Typography
                color="text.primary"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                داشبورد
              </Typography>
            </Link>
            <Typography color="text.primary">مدیریت فروشگاه‌ها</Typography>
          </Breadcrumbs>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            مدیریت فروشگاه‌ها
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ایجاد، ویرایش و مدیریت فروشگاه‌ها
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          فروشگاه جدید
        </Button>
      </Box>

      {/* نمایش خطا */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* جستجو */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="جستجو در فروشگاه‌ها (نام، کد، مالک، تلفن، آدرس)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {searchTerm && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              در حال جستجو برای: "{searchTerm}"
              {isLoading && " (در حال بارگذاری...)"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* آمار */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "primary.main" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    کل فروشگاه‌ها
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {pagination.totalStores} فروشگاه
                  </Typography>
                </Box>
                <StoreIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* اطلاعات نتایج */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="body1" color="text.secondary">
          {searchTerm ? (
            <>
              نمایش {stores.length} فروشگاه از {pagination.totalStores} فروشگاه
              {isLoading && " (در حال بروزرسانی...)"}
            </>
          ) : (
            <>تعداد فروشگاه‌ها: {pagination.totalStores}</>
          )}
        </Typography>

        {/* اطلاعات صفحه‌بندی */}
        {pagination.totalPages > 1 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              disabled={!pagination.hasPrev || isLoading}
              onClick={() =>
                fetchStores(pagination.currentPage - 1, searchTerm)
              }
            >
              قبلی
            </Button>

            <Typography variant="body2" color="text.secondary">
              صفحه {pagination.currentPage} از {pagination.totalPages}
            </Typography>

            <Button
              size="small"
              disabled={!pagination.hasNext || isLoading}
              onClick={() =>
                fetchStores(pagination.currentPage + 1, searchTerm)
              }
            >
              بعدی
            </Button>
          </Box>
        )}
      </Box>

      {/* لیست فروشگاه‌ها */}
      <Card>
        <CardContent>
          {isLoading && stores.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                در حال بارگذاری...
              </Typography>
            </Box>
          ) : stores && stores.length > 0 ? (
            <>
              {/* نمایش جدول در دسکتاپ */}
              {!isMobile && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>نام فروشگاه</TableCell>
                        <TableCell>کد</TableCell>
                        <TableCell>مالک</TableCell>
                        <TableCell>تلفن</TableCell>
                        <TableCell>نوع</TableCell>
                        <TableCell>آدرس</TableCell>
                        <TableCell>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {store.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={store.code}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{store.ownerName || "-"}</TableCell>
                          <TableCell>{store.phone || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStoreTypeText(store.storeType)}
                              color={getStoreTypeColor(store.storeType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {store.address}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {/* دکمه مشاهده جزئیات فروشگاه */}
                              <Link href={`/dashboard/stores/${store.id}`} passHref>
                                <IconButton
                                  color="info"
                                  size="small"
                                  title="مشاهده جزئیات فروشگاه"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Link>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleEdit(store)}
                                title="ویرایش فروشگاه"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDelete(store.id)}
                                title="حذف فروشگاه"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
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
                  {stores.map((store) => (
                    <Card key={store.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {store.name}
                            </Typography>
                            <Chip
                              label={store.code}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              نوع:
                            </Typography>
                            <Chip
                              label={getStoreTypeText(store.storeType)}
                              color={getStoreTypeColor(store.storeType)}
                              size="small"
                            />
                          </Box>

                          {store.ownerName && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                مالک:
                              </Typography>
                              <Typography variant="body2">
                                {store.ownerName}
                              </Typography>
                            </Box>
                          )}

                          {store.phone && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                تلفن:
                              </Typography>
                              <Typography variant="body2">
                                {store.phone}
                              </Typography>
                            </Box>
                          )}

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              آدرس:
                            </Typography>
                            <Typography variant="body2">
                              {store.address}
                            </Typography>
                          </Box>

                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            spacing={1}
                          >
                            {/* دکمه مشاهده جزئیات فروشگاه در موبایل */}
                            <Link href={`/dashboard/stores/${store.id}`} passHref>
                              <IconButton
                                color="info"
                                size="small"
                                title="مشاهده جزئیات فروشگاه"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Link>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEdit(store)}
                              title="ویرایش فروشگاه"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(store.id)}
                              title="حذف فروشگاه"
                            >
                              <DeleteIcon />
                            </IconButton>
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
              <StoreIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm
                  ? "هیچ فروشگاهی با مشخصات جستجو شده یافت نشد"
                  : "هنوز فروشگاهی تعریف نشده است"}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowModal(true)}
                  sx={{ mt: 2 }}
                >
                  ایجاد اولین فروشگاه
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* مودال ایجاد/ویرایش فروشگاه */}
      <Dialog open={showModal} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStore ? "ویرایش فروشگاه" : "فروشگاه جدید"}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="نام فروشگاه"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="کد فروشگاه"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="نام مالک"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تلفن"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>نوع فروشگاه</InputLabel>
                  <Select
                    value={formData.storeType}
                    label="نوع فروشگاه"
                    onChange={(e) =>
                      setFormData({ ...formData, storeType: e.target.value })
                    }
                  >
                    <MenuItem value="SUPERMARKET">سوپرمارکت</MenuItem>
                    <MenuItem value="GROCERY">بقالی</MenuItem>
                    <MenuItem value="CONVENIENCE">مینی‌مارکت</MenuItem>
                    <MenuItem value="HYPERMARKET">هایپر مارکت</MenuItem>
                    <MenuItem value="OTHER">سایر</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="آدرس"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="عرض جغرافیایی"
                  type="number"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="طول جغرافیایی"
                  type="number"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={resetForm}>انصراف</Button>
            <Button type="submit" variant="contained">
              {editingStore ? "ویرایش فروشگاه" : "ایجاد فروشگاه"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}