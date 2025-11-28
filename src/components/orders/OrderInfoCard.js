// 📂 src/components/orders/OrderInfoCard.js
"use client";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Info,
  AttachMoney,
  CalendarToday,
  Person,
  Store,
  CheckCircle,
  Pending,
  Error,
  Warning,
  Schedule,
  CreditCard,
  AccountBalanceWallet,
  LocalAtm,
  LocalShipping,
} from "@mui/icons-material";
import OrderStatusChip from "./OrderStatusChip";
import { useState, useEffect } from "react";

export default function OrderInfoCard({ order, formatCurrency, formatDate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentDate, setCurrentDate] = useState(new Date());

  // به روز رسانی تاریخ فعلی هر دقیقه
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

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

    // اولویت ۱: وضعیت تسویه
    if (paymentStatus === "PAID") {
      return {
        color: "success.main",
        tooltip: "تسویه کامل شده",
        icon: <CheckCircle fontSize="small" />,
        text: "تسویه کامل",
      };
    } else if (paymentStatus === "PARTIALLY_PAID") {
      return {
        color: "info.main",
        tooltip: "تسویه جزئی",
        icon: <Pending fontSize="small" />,
        text: "تسویه جزئی",
      };
    } else if (paymentStatus === "OVERDUE") {
      return {
        color: "error.main",
        tooltip: "تسویه معوق",
        icon: <Error fontSize="small" />,
        text: "تسویه معوق",
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
            text: "اعتبار گذشته",
          };
        } else if (remainingDays === 0) {
          return {
            color: "warning.main",
            tooltip: "آخرین روز اعتبار",
            icon: <Warning fontSize="small" />,
            text: "آخرین روز",
          };
        } else if (remainingDays <= 3) {
          return {
            color: "warning.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <Warning fontSize="small" />,
            text: `${remainingDays} روز مانده`,
          };
        } else if (remainingDays <= 7) {
          return {
            color: "info.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <Schedule fontSize="small" />,
            text: `${remainingDays} روز مانده`,
          };
        } else {
          return {
            color: "success.light",
            tooltip: `${remainingDays} روز تا پایان اعتبار`,
            icon: <CheckCircle fontSize="small" />,
            text: `${remainingDays} روز مانده`,
          };
        }
      } else {
        // اعتباری اما بدون تاریخ مشخص
        return {
          color: "primary.main",
          tooltip: "اعتباری - بدون مدت مشخص",
          icon: <CreditCard fontSize="small" />,
          text: "اعتباری",
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
          text: "نقدی",
        };
      } else if (paymentMethod === "CHEQUE") {
        return {
          color: "secondary.main",
          tooltip: "چکی - در انتظار تسویه",
          icon: <AccountBalanceWallet fontSize="small" />,
          text: "چکی",
        };
      }
    }

    // حالت پیش‌فرض برای سفارشات بدون اطلاعات پرداخت
    return {
      color: "grey.400",
      tooltip: "اطلاعات پرداخت موجود نیست",
      icon: <Info fontSize="small" />,
      text: "بدون اطلاعات",
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
        return <CreditCard />;
      case "CHEQUE":
        return <AccountBalanceWallet />;
      case "CASH":
      default:
        return <LocalAtm />;
    }
  };

  // تابع برای دریافت متن روش پرداخت
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

  const borderInfo = getBorderColor();
  const remainingDays = getRemainingDays();
  const blinkStatus = getBlinkStatus();

  const InfoItem = ({
    icon,
    bgColor,
    primary,
    secondary,
    isCurrency = false,
  }) => (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", mb: isMobile ? 2 : 2.5 }}
    >
      <Avatar
        sx={{
          bgcolor: bgColor,
          width: isMobile ? 28 : 32,
          height: isMobile ? 28 : 32,
          flexShrink: 0,
          mr: 1,
          mt: 0.1,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          fontWeight="600"
          lineHeight={1.2}
        >
          {primary}
        </Typography>
        <Typography
          variant={isMobile ? "body2" : "body1"}
          fontWeight="700"
          color={isCurrency ? "success.main" : "text.primary"}
          lineHeight={1.3}
          sx={{ mt: 0.2 }}
        >
          {secondary}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: 2,
        border: "3px solid",
        borderColor: borderInfo.color,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          boxShadow: `0 4px 20px ${borderInfo.color}40`,
        },
      }}
    >
      {/* نشانگر وضعیت در گوشه کارت */}
      <Tooltip title={borderInfo.tooltip} arrow>
        <Box
          sx={{
            position: "absolute",
            top: -12,
            right: -12,
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: "50%",
            backgroundColor: borderInfo.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: 3,
            border: "3px solid white",
          }}
        >
          {borderInfo.icon}
        </Box>
      </Tooltip>

      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
              }}
            >
              <Info sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700">
                مشخصات سفارش
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                color="text.secondary"
              >
                اطلاعات کامل سفارش
              </Typography>
            </Box>
          </Box>
          <OrderStatusChip status={order.status} />
        </Box>

        {/* وضعیت پرداخت و اعتبار */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: `${borderInfo.color}15`,
            border: `2px solid ${borderInfo.color}30`,
            background: `linear-gradient(135deg, ${borderInfo.color}15 0%, ${borderInfo.color}08 100%)`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              {getPaymentMethodIcon()}
              <Typography
                variant={isMobile ? "body2" : "body1"}
                fontWeight="700"
              >
                روش پرداخت: {getPaymentMethodText()}
              </Typography>
            </Box>
            <Chip
              icon={borderInfo.icon}
              label={borderInfo.text}
              color={
                borderInfo.color.includes("error")
                  ? "error"
                  : borderInfo.color.includes("warning")
                  ? "warning"
                  : borderInfo.color.includes("success")
                  ? "success"
                  : borderInfo.color.includes("info")
                  ? "info"
                  : "primary"
              }
              variant="filled"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} md={6}>
            <InfoItem
              icon={
                <Typography
                  variant="body2"
                  fontWeight="600"
                  fontSize={isMobile ? "0.7rem" : "0.8rem"}
                >
                  #
                </Typography>
              }
              bgColor="primary.light"
              primary="شماره سفارش"
              secondary={`ORD-${order.id.toString().padStart(4, "0")}`}
            />
            <InfoItem
              icon={<AttachMoney fontSize={isMobile ? "small" : "small"} />}
              bgColor="success.light"
              primary="مبلغ کل"
              secondary={formatCurrency(order.totalAmount)}
              isCurrency={true}
            />
            <InfoItem
              icon={<CalendarToday fontSize={isMobile ? "small" : "small"} />}
              bgColor="info.light"
              primary="تاریخ  سفارش"
              secondary={formatDate(order.orderDate)}
            />
            {order.deliveryDate && (
              <InfoItem
                icon={<LocalShipping fontSize={isMobile ? "small" : "small"} />}
                bgColor="success.light"
                primary="تاریخ تحویل"
                secondary={formatDate(order.deliveryDate)}
              />
            )}
            {/* ردیف جدید: مدت اعتبار */}
            <InfoItem
              icon={<Schedule fontSize={isMobile ? "small" : "small"} />}
              bgColor={
                blinkStatus === "expired"
                  ? "error.light"
                  : blinkStatus === "today"
                  ? "warning.light"
                  : blinkStatus === "warning"
                  ? "warning.light"
                  : remainingDays !== null
                  ? "success.light"
                  : "grey.300"
              }
              primary="مدت اعتبار"
              secondary={getCreditPeriodDisplay()}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<Person fontSize={isMobile ? "small" : "small"} />}
              bgColor="secondary.light"
              primary="ویزیتور"
              secondary={order.salesRep?.name || "تعیین نشده"}
            />
            <InfoItem
              icon={<Store fontSize={isMobile ? "small" : "small"} />}
              bgColor="warning.light"
              primary="فروشگاه"
              secondary={order.store?.name}
            />
            <InfoItem
              icon={
                <Typography
                  variant="body2"
                  fontWeight="600"
                  fontSize={isMobile ? "0.7rem" : "0.8rem"}
                >
                  کد
                </Typography>
              }
              bgColor="info.light"
              primary="کد فروشگاه"
              secondary={order.store?.code}
            />
            {/* ردیف جدید: وضعیت پرداخت */}
            <InfoItem
              icon={borderInfo.icon}
              bgColor={`${borderInfo.color}30`}
              primary="وضعیت پرداخت"
              secondary={borderInfo.text}
            />
          </Grid>
        </Grid>

        {order.notes && (
          <Alert
            severity="info"
            sx={{
              mt: 3,
              borderRadius: 2,
              background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
            }}
          >
            <Typography
              variant={isMobile ? "caption" : "subtitle2"}
              gutterBottom
              fontWeight="600"
            >
              📝 یادداشت:
            </Typography>
            <Typography variant={isMobile ? "caption" : "body1"}>
              {order.notes}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
