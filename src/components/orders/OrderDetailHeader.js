// 📂 src/components/orders/OrderDetailHeader.js
'use client'
import { Breadcrumbs, Typography, Box, Avatar, useTheme, useMediaQuery } from '@mui/material'
import { Home, ShoppingCart } from '@mui/icons-material'
import Link from 'next/link'

export default function OrderDetailHeader({ order }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (!order) return null

  return (
    <Box sx={{ mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Box display="flex" alignItems="center" color="inherit">
            <Home sx={{ mr: 1, fontSize: isMobile ? '1rem' : '1.25rem' }} />
            <Typography variant={isMobile ? "body2" : "body1"}>داشبورد</Typography>
          </Box>
        </Link>
        <Link href="/dashboard/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant={isMobile ? "body2" : "body1"}>سفارشات</Typography>
        </Link>
        <Typography variant={isMobile ? "body2" : "body1"} color="primary.main" fontWeight="600">
          سفارش #{order.id.toString().padStart(4, '0')}
        </Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ 
          bgcolor: 'primary.main', 
          width: isMobile ? 48 : 56, 
          height: isMobile ? 48 : 56 
        }}>
          <ShoppingCart sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
        </Avatar>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            fontWeight="700"
            sx={{ fontSize: { xs: '1.25rem', md: '1.5rem', lg: '2rem' } }}
          >
            سفارش #{order.id.toString().padStart(4, '0')}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
            تاریخ ایجاد: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}