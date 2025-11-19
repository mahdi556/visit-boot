"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import QuickOrderModal from "@/components/dashboard/QuickOrderModal";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // منوهای پایه برای همه کاربران
  const baseNavigation = [
    { name: "داشبورد", href: "/dashboard", icon: "bi-speedometer2" },
    { name: "سفارشات", href: "/dashboard/orders", icon: "bi-cart-check" },
  ];

  // منوهای اضافی برای ادمین و مدیران
  const adminNavigation = [
    { name: "مشتریان", href: "/dashboard/stores", icon: "bi-people" },
    { name: "محصولات", href: "/dashboard/products", icon: "bi-box-seam" },
    { name: "ویزیتورها", href: "/dashboard/sales-reps", icon: "bi-person-badge" },
    { name: "طرح های فروش", href: "/dashboard/discount-groups", icon: "bi-percent" },
    { name: "کاتالوگ محصولات", href: "/dashboard/catalog", icon: "bi-grid-3x3-gap" },
    { name: "مسیرها و مناطق", href: "/dashboard/routes-and-areas", icon: "bi-signpost" },
    { name: "پیک‌ها", href: "/dashboard/drivers", icon: "bi-truck" },
    { name: "گزارشات", href: "/dashboard/reports", icon: "bi-graph-up" },
    { name: "مالی", href: "/dashboard/financial", icon: "bi-cash-coin" },
    { name: "تنظیمات", href: "/dashboard/settings", icon: "bi-gear" },
  ];

  // منوهای مخصوص ویزیتور
  const salesRepNavigation = [
    { name: "مشتریان من", href: "/dashboard/stores", icon: "bi-people" },
    { name: "محصولات", href: "/dashboard/products", icon: "bi-box-seam" },
    { name: "کاتالوگ", href: "/dashboard/catalog", icon: "bi-grid-3x3-gap" },
    { name: "گزارشات من", href: "/dashboard/reports", icon: "bi-graph-up" },
  ];

  const getNavigation = () => {
    if (!user) return baseNavigation;
    
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      return [...baseNavigation, ...adminNavigation];
    } else if (user.role === 'SALES_REP') {
      return [...baseNavigation, ...salesRepNavigation];
    }
    
    return baseNavigation;
  };

  const navigation = getNavigation();

  useEffect(() => {
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

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
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="d-flex flex-column h-100">
          <div className="sidebar-brand">
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-shop-window brand-icon"></i>
              <span className="brand-text">نبات نگین آرا</span>
            </div>
          </div>

          <div className="user-info-sidebar p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div className="user-avatar me-3">
                <i className="bi bi-person-fill"></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold text-white">
                  {user.firstName} {user.lastName}
                </div>
                <small className="text-white-50">
                  {user.role === 'SALES_REP' ? 'ویزیتور' : 
                   user.role === 'ADMIN' ? 'مدیر سیستم' : 
                   user.role === 'MANAGER' ? 'مدیر' : 'کاربر'}
                  {user.salesRep && ` - ${user.salesRep.name}`}
                </small>
              </div>
            </div>
          </div>

          <div className="flex-grow-1 p-3">
            <ul className="nav nav-pills flex-column">
              {navigation.map((item) => (
                <li key={item.name} className="nav-item">
                  <Link
                    href={item.href}
                    className={`nav-link ${
                      pathname === item.href ? "active" : ""
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="flex-grow-1">
                <div className="fw-bold text-white">{user.username}</div>
              </div>
              <button 
                className="btn btn-link text-white-50 p-0"
                onClick={handleLogout}
                title="خروج"
              >
                <i className="bi bi-box-arrow-left"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="main-content">
        <nav className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container-fluid">
            {/* سمت راست - منوی همبرگری و برند */}
            <div className="d-flex align-items-center">
              <button
                className="btn btn-primary me-2 d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ minWidth: '40px' }}
              >
                <i className="bi bi-list"></i>
              </button>

              {/* برند با فونت کوچک در موبایل */}
              <div className="navbar-brand">
                <i className="bi bi-shop-window me-1 me-md-2"></i>
                <span className=" d-sm-inline brand-text-sm">
                  نبات نگین آرا
                </span>
                {user.role === 'SALES_REP' && user.salesRep && (
                  <small className="ms-1 ms-md-2 text-muted d-none d-lg-inline salesrep-text-sm">
                    | ویزیتور: {user.salesRep.name}
                  </small>
                )}
              </div>
            </div>

            {/* سمت چپ - منوی کاربر */}
            <div className="d-flex align-items-center">
              {/* نوتیفیکیشن - فقط در دسکتاپ */}
              <div className="dropdown me-2 d-none d-sm-block">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                  style={{ 
                    padding: '6px 8px',
                    fontSize: '0.875rem'
                  }}
                >
                  <i className="bi bi-bell"></i>
                  <span className="badge bg-danger">3</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-start"> {/* تغییر به dropdown-menu-start */}
                  <li>
                    <a className="dropdown-item" href="#">
                      سفارش جدید دریافت شد
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      گزارش فروش روزانه آماده است
                    </a>
                  </li>
                </ul>
              </div>

              {/* منوی کاربر - کامپکت */}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                  data-bs-toggle="dropdown"
                  style={{ 
                    padding: '6px 8px',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {/* آیکون کاربر */}
                  <i className="bi bi-person-circle me-1"></i>
                  
                  {/* نام کاربر - فقط در تبلت و دسکتاپ */}
                  <span className=" d-md-inline user-name-sm">
                    {user.firstName} {user.lastName}
                  </span>
                  
                  {/* نام کوتاه در موبایل */}
                  {/* <span className="d-md-none user-initials-sm">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span> */}
                </button>
                <ul className="dropdown-menu dropdown-menu-start"> {/* تغییر به dropdown-menu-start */}
                  <li>
                    <span className="dropdown-item-text small">
                      {user.firstName} {user.lastName}
                    </span>
                  </li>
                  <li>
                    <span className="dropdown-item-text small text-muted">
                      {user.role === 'SALES_REP' ? 'ویزیتور' : 
                       user.role === 'ADMIN' ? 'مدیر سیستم' : 
                       user.role === 'MANAGER' ? 'مدیر' : 'کاربر'}
                      {user.salesRep && ` - ${user.salesRep.name}`}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-left me-2"></i>خروج
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {children}

        {/* دکمه ثبت سریع سفارش - فقط برای ویزیتورها */}
        {(user.role === 'SALES_REP' || user.role === 'ADMIN') && (
          <button
            className="quick-order-btn"
            data-bs-toggle="modal"
            data-bs-target="#orderModal"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        )}

        <QuickOrderModal />
      </div>

      {/* استایل‌های سفارشی برای navbar کامپکت */}
      <style jsx>{`
        .navbar {
          padding: 0.5rem 1rem;
        }
        
        .navbar-brand {
          font-size: 1rem;
          margin-right: 0;
        }
        
        .btn {
          font-size: 0.875rem;
        }
        
        /* فونت کوچک برای برند در موبایل */
        .brand-text-sm {
          font-size: 0.9rem;
        }
        
        .salesrep-text-sm {
          font-size: 0.8rem;
        }
        
        .user-name-sm {
          font-size: 0.85rem;
        }
        
        .user-initials-sm {
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        @media (max-width: 576px) {
          .navbar {
            padding: 0.4rem 0.5rem;
          }
          
          .navbar-brand {
            font-size: 0.9rem;
          }
          
          .brand-text-sm {
            font-size: 0.8rem;
          }
          
          .btn {
            padding: 4px 6px;
            font-size: 0.8rem;
          }
          
          .user-name-sm {
            font-size: 0.8rem;
          }
          
          .user-initials-sm {
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 360px) {
          .navbar-brand {
            font-size: 0.8rem;
          }
          
          .brand-text-sm {
            font-size: 0.75rem;
          }
          
          .btn {
            padding: 3px 5px;
            font-size: 0.75rem;
          }
          
          .user-name-sm {
            font-size: 0.75rem;
          }
          
          .user-initials-sm {
            font-size: 0.7rem;
          }
        }
        
        /* اطمینان از باز شدن منوها به سمت راست */
        .dropdown-menu-start {
          right: 0 !important;
          left: auto !important;
          text-align: right;
        }
      `}</style>
    </div>
  );
}