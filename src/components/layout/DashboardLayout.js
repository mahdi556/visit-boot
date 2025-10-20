'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'داشبورد', href: '/dashboard', icon: 'bi-speedometer2' },
    { name: 'سفارشات', href: '/dashboard/orders', icon: 'bi-cart-check' },
    { name: 'مشتریان', href: '/dashboard/stores', icon: 'bi-people' },
    { name: 'محصولات', href: '/dashboard/products', icon: 'bi-box-seam' },
    { name: 'گزارشات', href: '/dashboard/reports', icon: 'bi-graph-up' },
    { name: 'مناطق پخش', href: '/dashboard/areas', icon: 'bi-geo-alt' },
    { name: 'پیک‌ها', href: '/dashboard/drivers', icon: 'bi-truck' },
    { name: 'مالی', href: '/dashboard/financial', icon: 'bi-cash-coin' },
    { name: 'تنظیمات', href: '/dashboard/settings', icon: 'bi-gear' },
  ]

  useEffect(() => {
    // بستن سایدبار هنگام تغییر مسیر در موبایل
    if (window.innerWidth < 992) {
      setSidebarOpen(false)
    }
  }, [pathname])

  return (
    <div className="d-flex">
      {/* Overlay برای موبایل */}
      {sidebarOpen && (
        <div 
          className="overlay show d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* سایدبار */}
      <div className={`
        sidebar
        ${sidebarOpen ? 'show' : ''}
      `}>
        <div className="d-flex flex-column h-100">
          {/* برند */}
          <div className="sidebar-brand">
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-shop-window brand-icon"></i>
              <span className="brand-text">پخش مویرگی</span>
            </div>
          </div>
          
          {/* منوی ناوبری */}
          <div className="flex-grow-1 p-3">
            <ul className="nav nav-pills flex-column">
              {navigation.map((item) => (
                <li key={item.name} className="nav-item">
                  <Link
                    href={item.href}
                    className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* بخش کاربر */}
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <i className="bi bi-person-fill"></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">محمد رضایی</div>
                <small className="text-white-50">مدیر سیستم</small>
              </div>
              <a href="#" className="text-white-50">
                <i className="bi bi-box-arrow-left"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="main-content">
        {/* نوار بالایی */}
        <nav className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container-fluid">
            <button 
              className="btn btn-primary me-3 d-lg-none" 
              id="sidebarToggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list"></i>
            </button>
            
            <a className="navbar-brand" href="#">
              <i className="bi bi-shop-window me-2"></i>
              پخش مویرگی
            </a>
            
            <div className="d-flex ms-auto">
              <div className="dropdown me-3">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="bi bi-bell"></i>
                  <span className="badge bg-danger">3</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#">سفارش جدید دریافت شد</a></li>
                  <li><a className="dropdown-item" href="#">پیک جدید به سیستم اضافه شد</a></li>
                  <li><a className="dropdown-item" href="#">گزارش فروش هفتگی آماده است</a></li>
                </ul>
              </div>
              
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle me-2"></i>
                  محمد رضایی
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>پروفایل</a></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>تنظیمات</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-box-arrow-left me-2"></i>خروج</a></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* محتوای صفحه */}
        {children}

        {/* دکمه ثبت سریع سفارش */}
        <button 
          className="quick-order-btn" 
          data-bs-toggle="modal" 
          data-bs-target="#orderModal"
        >
          <i className="bi bi-plus-lg"></i>
        </button>

        {/* مودال ثبت سریع سفارش */}
        <div className="modal fade" id="orderModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ثبت سریع سفارش</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">نام مشتری</label>
                      <input type="text" className="form-control" placeholder="نام مشتری را وارد کنید" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">شماره تماس</label>
                      <input type="text" className="form-control" placeholder="شماره تماس را وارد کنید" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">آدرس</label>
                    <textarea className="form-control" rows="2" placeholder="آدرس کامل را وارد کنید"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">محصولات</label>
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>شیر پرچرب (کد: 00123)</span>
                        <div className="d-flex align-items-center">
                          <button type="button" className="btn btn-sm btn-outline-secondary">-</button>
                          <span className="mx-2">1</span>
                          <button type="button" className="btn btn-sm btn-outline-secondary">+</button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>ماست کم چرب (کد: 00124)</span>
                        <div className="d-flex align-items-center">
                          <button type="button" className="btn btn-sm btn-outline-secondary">-</button>
                          <span className="mx-2">2</span>
                          <button type="button" className="btn btn-sm btn-outline-secondary">+</button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>پنیر پیتزا (کد: 00125)</span>
                        <div className="d-flex align-items-center">
                          <button type="button" className="btn btn-sm btn-outline-secondary">-</button>
                          <span className="mx-2">1</span>
                          <button type="button" className="btn btn-sm btn-outline-secondary">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">یادداشت</label>
                    <textarea className="form-control" rows="2" placeholder="یادداشت سفارش (اختیاری)"></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="button" className="btn btn-primary">ثبت سفارش</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}