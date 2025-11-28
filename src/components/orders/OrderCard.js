// 📂 src/components/orders/OrderCard.js
"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Receipt,
  Visibility,
  Edit,
  Store,
  Person,
  CalendarToday,
  AttachMoney,
  CreditCard,
  Schedule,
  LocalAtm,
  AccountBalanceWallet,
  Warning,
  CheckCircle,
  Pending,
  Error,
  LocalShipping,
} from "@mui/icons-material";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { useState, useEffect } from "react";

export default function OrderCard({ order, userRole, onShowInvoice, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // به روز رسانی تاریخ فعلی هر دقیقه
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // هر دقیقه به روز شود

    return () => clearInterval(interval);
  }, []);

  // مقداردهی پیش‌فرض برای داده‌های ممکن است undefined باشند
  const orderData = {
    paymentStatus: order.paymentStatus || "UNPAID",
    paymentMethod: order.paymentMethod || "CASH",
    creditDays: order.creditDays || 0,
    orderDate: order.orderDate || order.createdAt,
    ...order,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  // تابع محاسبه روزهای باقیمانده
  const getRemainingDays = () => {
    if (!orderData.creditDays || orderData.paymentMethod !== "CREDIT")
      return null;

    const orderDate = new Date(orderData.orderDate);
    const dueDate = new Date(orderDate);
    dueDate.setDate(orderDate.getDate() + orderData.creditDays);

    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysRemaining;
  };

  // تابع برای وضعیت چشمک زن
  const getBlinkStatus = () => {
    const remainingDays = getRemainingDays();

    if (remainingDays === null) return null;

    if (remainingDays < 0) {
      return "expired"; // گذشته
    } else if (remainingDays === 0) {
      return "today"; // امروز
    } else if (remainingDays <= 3) {
      return "warning"; // 3 روز مانده
    }

    return null;
  };

  // تابع برای دریافت رنگ بوردر بر اساس وضعیت تسویه و اعتبار
  const getBorderColor = () => {
    const { paymentStatus, paymentMethod } = orderData;
    const remainingDays = getRemainingDays();
    const blinkStatus = getBlinkStatus();

    console.log("OrderCard - Processed Data:", {
      paymentStatus,
      paymentMethod,
      creditDays: orderData.creditDays,
      remainingDays,
      blinkStatus,
    });

    // اولویت ۱: وضعیت تسویه
    if (paymentStatus === "PAID") {
      return {
        color: "success.main",
        tooltip: "تسویه کامل شده",
        icon: <CheckCircle fontSize="small" />,
      };
    } else if (paymentStatus === "PARTIALLY_PAID") {
      return {
        color: "info.main",
        tooltip: "تسویه جزئی",
        icon: <Pending fontSize="small" />,
      };
    } else if (paymentStatus === "OVERDUE") {
      return {
        color: "error.main",
        tooltip: "تسویه معوق",
        icon: <Error fontSize="small" />,
      };
    }

    // اولویت ۲: وضعیت اعتبار برای سفارشات اعتباری
    if (paymentMethod === "CREDIT") {
      if (remainingDays !== null) {
        if (remainingDays < 0) {
          return {
            color: "error.main",
            tooltip: `اعتبار ${Math.abs(remainingDays)} روز گذشته`,
            icon: <Error fontSize="small" />,
          };
        } else if (remainingDays === 0) {
          return {
            color: "warning.main",
            tooltip: "آخرین روز اعتبار",
            icon: <Warning fontSize="small" />,
          };
        } else if (remainingDays <= 3) {
          return {
            color: "warning.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <Warning fontSize="small" />,
          };
        } else if (remainingDays <= 7) {
          return {
            color: "info.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <Schedule fontSize="small" />,
          };
        } else {
          return {
            color: "success.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <CheckCircle fontSize="small" />,
          };
        }
      } else {
        // اعتباری اما بدون تاریخ مشخص
        return {
          color: "primary.main",
          tooltip: "اعتباری - بدون مدت مشخص",
          icon: <CreditCard fontSize="small" />,
        };
      }
    }

    // اولویت ۳: وضعیت عادی برای سایر روش‌های پرداخت
    if (paymentStatus === "UNPAID") {
      if (paymentMethod === "CASH") {
        return {
          color: "primary.main",
          tooltip: "نقدی - در انتظار تسویه",
          icon: <LocalAtm fontSize="small" />,
        };
      } else if (paymentMethod === "CHEQUE") {
        return {
          color: "secondary.main",
          tooltip: "چکی - در انتظار تسویه",
          icon: <AccountBalanceWallet fontSize="small" />,
        };
      }
    }

    // حالت پیش‌فرض برای سفارشات بدون اطلاعات پرداخت
    return {
      color: "grey.400",
      tooltip: "اطلاعات پرداخت موجود نیست",
      icon: <Info fontSize="small" />,
    };
  };

  // تابع برای نمایش هوشمند مدت اعتبار
  const getCreditPeriodDisplay = () => {
    const { paymentMethod, creditDays } = orderData;
    const remainingDays = getRemainingDays();

    switch (paymentMethod) {
      case "CREDIT":
        if (remainingDays !== null) {
          if (remainingDays < 0) {
            return `${Math.abs(remainingDays)} روز گذشته`;
          } else if (remainingDays === 0) {
            return "امروز";
          } else {
            return `${remainingDays} روز باقیمانده`;
          }
        }
        return creditDays ? `${creditDays} روز` : "بدون مدت";
      case "CHEQUE":
        return "چک";
      case "CASH":
      default:
        return "-";
    }
  };

  // تابع برای دریافت آیکون روش پرداخت
  const getPaymentMethodIcon = () => {
    switch (orderData.paymentMethod) {
      case "CREDIT":
        return <CreditCard color="primary" />;
      case "CHEQUE":
        return <AccountBalanceWallet color="warning" />;
      case "CASH":
      default:
        return <LocalAtm color="success" />;
    }
  };

  // تابع برای دریافت رنگ روش پرداخت
  const getPaymentMethodColor = () => {
    switch (orderData.paymentMethod) {
      case "CREDIT":
        return "primary";
      case "CHEQUE":
        return "warning";
      case "CASH":
      default:
        return "success";
    }
  };

  // تابع برای دریافت متن کامل روش پرداخت
  const getPaymentMethodText = () => {
    switch (orderData.paymentMethod) {
      case "CREDIT":
        return "اعتباری";
      case "CHEQUE":
        return "چکی";
      case "CASH":
      default:
        return "نقدی";
    }
  };

  // تابع برای دریافت رنگ وضعیت اعتبار
  const getCreditStatusColor = () => {
    const blinkStatus = getBlinkStatus();
    const remainingDays = getRemainingDays();

    if (blinkStatus === "expired") {
      return "error";
    } else if (blinkStatus === "today") {
      return "warning";
    } else if (blinkStatus === "warning") {
      return "warning";
    } else if (remainingDays !== null && remainingDays > 0) {
      return "success";
    }

    return "text.secondary";
  };

  // کامپوننت دایره چشمک زن
  const BlinkingDot = ({ status }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      if (status) {
        const interval = setInterval(() => {
          setVisible((prev) => !prev);
        }, 600); // چشمک زدن هر 600 میلی‌ثانیه

        return () => clearInterval(interval);
      }
    }, [status]);

    if (!status) return null;

    const getDotColor = () => {
      switch (status) {
        case "expired":
          return "#f44336"; // قرمز
        case "today":
        case "warning":
          return "#ff9800"; // نارنجی
        default:
          return "#4caf50"; // سبز
      }
    };

    return (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: getDotColor(),
          opacity: visible ? 1 : 0.3,
          transition: "opacity 0.6s ease",
          ml: 1,
        }}
      />
    );
  };

  const borderInfo = getBorderColor();
  const remainingDays = getRemainingDays();
  const blinkStatus = getBlinkStatus();

  console.log("OrderCard - Final Border Info:", borderInfo);

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "2px solid",
        borderColor: borderInfo.color,
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${borderInfo.color}40`,
        },
      }}
    >
      {/* نشانگر وضعیت در گوشه کارت */}
      <Tooltip title={borderInfo.tooltip} arrow>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: borderInfo.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {borderInfo.icon}
        </Box>
      </Tooltip>

      <CardContent sx={{ p: 3, pt: 4 }}>
        {/* هدر کارت - شماره سفارش و وضعیت */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="700"
              color="primary"
              gutterBottom
            >
              #ORD-{order.id.toString().padStart(4, "0")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              تاریخ سفارش: {formatDate(orderData.orderDate)}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StatusBadge status={order.status} />
            {blinkStatus && <BlinkingDot status={blinkStatus} />}
          </Box>
        </Box>
        {order.deliveryDate && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShipping fontSize="small" color="info" />
              <Typography variant="body2" color="text.secondary">
                تاریخ تحویل:
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="600" color="info.main">
              {formatDate(order.deliveryDate)}
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />

        {/* اطلاعات اصلی */}
        <Box display="flex" flexDirection="column" gap={2}>
          {/* فروشگاه */}
          <Box display="flex" alignItems="center" gap={2}>
            <Store color="primary" fontSize="small" />
            <Box flex={1}>
              <Typography variant="body1" fontWeight="600">
                {order.store.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                کد فروشگاه: {order.store.code}
              </Typography>
            </Box>
          </Box>

          {/* ویزیتور */}
          <Box display="flex" alignItems="center" gap={2}>
            <Person color="secondary" fontSize="small" />
            <Box flex={1}>
              <Typography variant="body1" fontWeight="600">
                {order.salesRep ? order.salesRep.name : "تعیین نشده"}
              </Typography>
              {order.salesRep && (
                <Typography variant="body2" color="text.secondary">
                  کد ویزیتور: {order.salesRep.code}
                </Typography>
              )}
            </Box>
          </Box>

          {/* مبلغ و تاریخ */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney color="success" fontSize="small" />
              <Typography variant="h6" fontWeight="700" color="success.main">
                {formatCurrency(order.totalAmount)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(orderData.orderDate)}
              </Typography>
            </Box>
          </Box>

          {/* ردیف جدید: روش پرداخت و مدت اعتبار */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            {/* روش پرداخت */}
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={`روش پرداخت: ${getPaymentMethodText()}`} arrow>
                <IconButton size="small" color={getPaymentMethodColor()}>
                  {getPaymentMethodIcon()}
                </IconButton>
              </Tooltip>
              <Typography variant="body2" color="text.primary" fontWeight="500">
                {getPaymentMethodText()}
              </Typography>
            </Box>

            {/* مدت اعتبار */}
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip
                title={
                  orderData.paymentMethod === "CREDIT" && orderData.creditDays
                    ? `تعداد روز اعتبار: ${orderData.creditDays} روز`
                    : "مدت اعتبار"
                }
                arrow
              >
                <Schedule fontSize="small" color={getCreditStatusColor()} />
              </Tooltip>
              <Typography
                variant="body2"
                color={getCreditStatusColor()}
                fontWeight="600"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {getCreditPeriodDisplay()}
                {blinkStatus === "expired" && (
                  <Warning fontSize="small" color="error" />
                )}
              </Typography>
            </Box>
          </Box>

          {/* وضعیت پرداخت */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${borderInfo.color}15`,
              border: `1px solid ${borderInfo.color}30`,
            }}
          >
            <Typography
              variant="body2"
              fontWeight="700"
              color={borderInfo.color}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {borderInfo.icon}
              {borderInfo.tooltip}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* دکمه‌های عملیات */}
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            color="info"
            startIcon={<Receipt />}
            size="small"
            onClick={() => onShowInvoice(order)}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" } }}
          >
            فاکتور
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Visibility />}
            size="small"
            component={Link}
            href={`/dashboard/orders/${order.id}`}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" } }}
          >
            جزئیات
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<Edit />}
            size="small"
            onClick={() => onEdit(order)}
            sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" } }}
          >
            ویرایش
          </Button>
        </Box>

        {/* اطلاعات اضافی برای ادمین */}
        {userRole !== "SALES_REP" && order.salesRep && (
          <Box mt={2} p={2} bgcolor="background.default" borderRadius={2}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              اطلاعات ویزیتور:
            </Typography>
            <Typography variant="body2">
              {order.salesRep.name} - {order.salesRep.code}
              {order.salesRep.phone && ` - تلفن: ${order.salesRep.phone}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
