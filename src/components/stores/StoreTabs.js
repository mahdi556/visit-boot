// 📂 src/components/stores/StoreTabs.js
'use client';

import { Card, CardContent, Tab, Tabs, Box } from '@mui/material';
import StoreInfoTab from './StoreInfoTab';
import StoreOrdersTab from './StoreOrdersTab';
import StoreLocationTab from './StoreLocationTab';

export default function StoreTabs({ activeTab, onTabChange, store, orders }) {
  const handleTabChange = (event, newValue) => {
    onTabChange(newValue);
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 0 }}>
        {/* تب‌ها */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  اطلاعات فروشگاه
                </Box>
              } 
              value="info" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  تاریخچه سفارش‌ها
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 20, 
                      height: 20, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {orders.length}
                  </Box>
                </Box>
              } 
              value="orders" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  موقعیت مکانی
                </Box>
              } 
              value="location" 
            />
          </Tabs>
        </Box>

        {/* محتوای تب‌ها */}
        <Box sx={{ p: 3 }}>
          {activeTab === 'info' && <StoreInfoTab store={store} />}
          {activeTab === 'orders' && <StoreOrdersTab store={store} orders={orders} />}
          {activeTab === 'location' && <StoreLocationTab store={store} />}
        </Box>
      </CardContent>
    </Card>
  );
}