
import DashboardLayout from '@/components/layout/DashboardLayout'

export const metadata = {
  title: 'داشبورد - سیستم پخش مویرگی',
}

export default function DashboardRootLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}