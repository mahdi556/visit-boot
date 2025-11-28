// // components/dashboard/StatsCards.js
// 'use client'

// import { useEffect, useState } from 'react'

// export default function StatsCards() {
//   const [stats, setStats] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     fetchStats()
//   }, [])

//   const fetchStats = async () => {
//     try {
//       const response = await fetch('/api/dashboard/stats')
//       const data = await response.json()
//       setStats(data)
//     } catch (error) {
//       console.error('Error fetching stats:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="row">
//         {[1, 2, 3, 4].map((item) => (
//           <div key={item} className="col-xl-3 col-md-6 mb-4">
//             <div className="card stat-card">
//               <div className="card-body">
//                 <div className="d-flex align-items-center">
//                   <div className="stat-icon placeholder"></div>
//                   <div className="flex-grow-1">
//                     <div className="stat-label placeholder"></div>
//                     <div className="stat-value placeholder"></div>
//                     <div className="stat-change placeholder"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   if (!stats) {
//     return (
//       <div className="alert alert-danger">
//         خطا در بارگذاری آمار
//       </div>
//     )
//   }

//   return (
//     <div className="row">
//       {/* فروش کل */}
//       <div className="col-xl-3 col-md-6 mb-4">
//         <div className="card stat-card sales">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="stat-icon sales">
//                 <i className="bi bi-cart-check"></i>
//               </div>
//               <div className="flex-grow-1">
//                 <div className="stat-label">فروش کل</div>
//                 <div className="stat-value">
//                   {new Intl.NumberFormat('fa-IR').format(stats.totalSales)} تومان
//                 </div>
//                 <div className="stat-change text-success">
//                   <i className="bi bi-arrow-up"></i>
//                   {stats.salesGrowth}% رشد نسبت به ماه قبل
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* سفارشات */}
//       <div className="col-xl-3 col-md-6 mb-4">
//         <div className="card stat-card orders">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="stat-icon orders">
//                 <i className="bi bi-bag-check"></i>
//               </div>
//               <div className="flex-grow-1">
//                 <div className="stat-label">سفارشات</div>
//                 <div className="stat-value">
//                   {new Intl.NumberFormat('fa-IR').format(stats.totalOrders)}
//                 </div>
//                 <div className="stat-change text-success">
//                   <i className="bi bi-arrow-up"></i>
//                   {stats.ordersGrowth}% رشد نسبت به ماه قبل
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* فروشگاه‌ها */}
//       <div className="col-xl-3 col-md-6 mb-4">
//         <div className="card stat-card customers">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="stat-icon customers">
//                 <i className="bi bi-shop"></i>
//               </div>
//               <div className="flex-grow-1">
//                 <div className="stat-label">فروشگاه‌ها</div>
//                 <div className="stat-value">
//                   {new Intl.NumberFormat('fa-IR').format(stats.totalStores)}
//                 </div>
//                 <div className="stat-change text-success">
//                   <i className="bi bi-arrow-up"></i>
//                   {stats.storesGrowth}% رشد نسبت به ماه قبل
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* محصولات */}
//       <div className="col-xl-3 col-md-6 mb-4">
//         <div className="card stat-card revenue">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="stat-icon revenue">
//                 <i className="bi bi-box-seam"></i>
//               </div>
//               <div className="flex-grow-1">
//                 <div className="stat-label">محصولات</div>
//                 <div className="stat-value">
//                   {new Intl.NumberFormat('fa-IR').format(stats.totalProducts)}
//                 </div>
//                 <div className="stat-change text-success">
//                   <i className="bi bi-arrow-up"></i>
//                   {stats.productsGrowth}% رشد نسبت به ماه قبل
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// components/dashboard/StatsCards.js
"use client";

import { Grid, Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { ShoppingCart, People, Inventory, BarChart } from "@mui/icons-material";

const stats = [
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

export default function StatsCards() {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  background: stat.color,
                  width: 56,
                  height: 56,
                  mr: 2
                }}>
                  <stat.icon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}