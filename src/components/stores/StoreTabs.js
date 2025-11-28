// 📂 src/components/stores/StoreTabs.js
"use client"; // مطمئن شوید این خط وجود دارد

import { Card, CardContent, Tab, Tabs, Box } from "@mui/material";
import { AccountBalance } from "@mui/icons-material"; // اضافه کردن این خط
import StoreInfoTab from "./StoreInfoTab";
import StoreOrdersTab from "./StoreOrdersTab";
import StoreLocationTab from "./StoreLocationTab";
import StoreCreditTab from "./StoreCreditTab"; // اضافه کردن این خط

export default function StoreTabs({ activeTab, onTabChange, store, orders }) {
  const handleTabChange = (event, newValue) => {
    onTabChange(newValue);
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="اطلاعات فروشگاه" value="info" />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalance fontSize="small" />
                  وضعیت اعتبار
                </Box>
              }
              value="credit"
            />
            <Tab
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  component="span"
                >
                  تاریخچه سفارش‌ها
                  <Box
                    component="span"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                    }}
                  >
                    {orders.length}
                  </Box>
                </Box>
              }
              value="orders"
            />
            <Tab label="موقعیت مکانی" value="location" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === "info" && <StoreInfoTab store={store} />}
          {activeTab === "orders" && (
            <StoreOrdersTab store={store} orders={orders} />
          )}
          {activeTab === "location" && <StoreLocationTab store={store} />}
          {activeTab === "credit" && <StoreCreditTab store={store} />}
        </Box>
      </CardContent>
    </Card>
  );
}
