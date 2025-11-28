// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Button,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  Inventory,
  Collections,
  People,
  BarChart,
  LocalShipping,
  Settings,
  Notifications,
  LocationOn,
  Discount,
  CardGiftcard
} from "@mui/icons-material";
import Link from "next/link";

// آمارهای دمو
const statsData = [
  { 
    label: "سفارشات امروز", 
    value: "۴۲", 
    change: "+۱۲%", 
    icon: ShoppingCart,
    color: "#00C853"
  },
  { 
    label: "مشتریان فعال", 
    value: "۱۲۴", 
    change: "+۸%", 
    icon: People,
    color: "#2979FF"
  },
  { 
    label: "محصولات", 
    value: "۸۶", 
    change: "+۵%", 
    icon: Inventory,
    color: "#FF6D00"
  },
  { 
    label: "فروش ماه", 
    value: "۱۲۵M", 
    change: "+۱۵%", 
    icon: BarChart,
    color: "#D500F9"
  }
];

// منوهای اصلی
const mainServices = [
  { 
    name: "سفارشات", 
    icon: ShoppingCart, 
    href: "/dashboard/orders",
    color: "#00C853",
    description: "مدیریت سفارشات"
  },
  { 
    name: "مشتریان", 
    icon: Store, 
    href: "/dashboard/stores",
    color: "#2979FF",
    description: "لیست مشتریان"
  },
  { 
    name: "محصولات", 
    icon: Inventory, 
    href: "/dashboard/products",
    color: "#FF6D00",
    description: "مدیریت محصولات"
  },
  { 
    name: "کاتالوگ", 
    icon: Collections, 
    href: "/dashboard/catalog",
    color: "#D500F9",
    description: "کاتالوگ محصولات"
  },
  { 
    name: "ویزیتورها", 
    icon: People, 
    href: "/dashboard/sales-reps",
    color: "#00BFA5",
    description: "مدیریت ویزیتورها"
  },
  { 
    name: "گزارشات", 
    icon: BarChart, 
    href: "/dashboard/reports",
    color: "#FFD600",
    description: "گزارشات فروش"
  },
  { 
    name: "پیک‌ها", 
    icon: LocalShipping, 
    href: "/dashboard/drivers",
    color: "#FF4081",
    description: "مدیریت پیک‌ها"
  },
  { 
    name: "تنظیمات", 
    icon: Settings, 
    href: "/dashboard/settings",
    color: "#757575",
    description: "تنظیمات سیستم"
  }
];

// تبلیغات ویژه
const promotions = [
  {
    title: "طرح فروش ویژه",
    description: "تخفیف‌های ویژه فصل پاییز",
    date: "۲ آذر",
    badge: "جدید",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    title: "کاتالوگ به‌روز",
    description: "محصولات جدید اضافه شد",
    date: "۱ آذر",
    badge: "آپدیت",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  }
];

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Typography>در حال بارگذاری...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#f8f9fa', minHeight: '100vh', pb: 4 }}>
      {/* هدر */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #00d2a0 0%, #00b48a 100%)',
        color: 'white',
        pt: 2,
        pb: 3,
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 20px rgba(0, 210, 160, 0.3)'
      }}>
        <Box sx={{ px: 2 }}>
          {/* نوار بالایی */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              <Typography variant="h6" fontWeight="bold">
                دفتر مرکزی
              </Typography>
            </Box>
            
            <IconButton sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
              <Notifications />
            </IconButton>
          </Box>

          {/* کارت امتیاز */}
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  <Discount sx={{ verticalAlign: 'middle', mr: 1 }} />
                  طرح‌های فروش
                </Typography>
                <Chip 
                  label="فعال" 
                  size="small" 
                  sx={{ background: 'rgba(255,255,255,0.3)', color: 'white' }} 
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  طرح‌های فعال
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ۳
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
                مدیریت طرح‌های تخفیف و فروش
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* منوی سرویس‌ها */}
      <Box sx={{ px: 2, mt: 3 }}>
        <Grid container spacing={2}>
          {mainServices.map((service, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Link href={service.href} style={{ textDecoration: 'none' }}>
                <Card sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Avatar sx={{ 
                      background: service.color,
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1
                    }}>
                      <service.icon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* آمارهای سریع */}
      <Box sx={{ px: 2, mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          آمار سریع
        </Typography>
        
        <Grid container spacing={2}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      background: stat.color,
                      width: 40,
                      height: 40,
                      mr: 2
                    }}>
                      <stat.icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Chip 
                        label={stat.change} 
                        size="small" 
                        color="success"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* تبلیغات و اطلاعیه‌ها */}
      <Box sx={{ px: 2, mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          اطلاعیه‌ها
        </Typography>
        
        <Grid container spacing={2}>
          {promotions.map((promo, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                background: promo.color,
                color: 'white',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip 
                      label={promo.badge}
                      size="small"
                      sx={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}
                    />
                    <Typography variant="body2">
                      {promo.date}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {promo.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    {promo.description}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    مشاهده جزئیات
                  </Button>
                </CardContent>
                
                {/* دکوریشن */}
                <Box sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)'
                }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* دکمه سریع سفارش */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        left: 24,
        zIndex: 1000
      }}>
        <Link href="/dashboard/orders?quick=true">
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            sx={{
              background: 'linear-gradient(135deg, #00d2a0 0%, #00b48a 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 20px rgba(0, 210, 160, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0, 210, 160, 0.6)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            سفارش سریع
          </Button>
        </Link>
      </Box>
    </Box>
  );
}