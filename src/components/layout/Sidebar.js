"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ open, onClose, user }) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);

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

  // بستن سایدبار هنگام کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay برای موبایل */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* سایدبار */}
      <div 
        ref={sidebarRef}
        className={`sidebar ${open ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="brand-wrapper">
              <i className="bi bi-shop-window brand-icon"></i>
              <span className="brand-text">نبات نگین آرا</span>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={onClose}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="user-info-section">
            <div className="user-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="user-details">
              <div className="user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="user-role">
                {user.role === 'SALES_REP' ? 'ویزیتور' : 
                 user.role === 'ADMIN' ? 'مدیر سیستم' : 
                 user.role === 'MANAGER' ? 'مدیر' : 'کاربر'}
                {user.salesRep && ` - ${user.salesRep.name}`}
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navigation.map((item) => (
                <li key={item.name} className="nav-item">
                  <Link
                    href={item.href}
                    className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`}
                    onClick={onClose}
                  >
                    <i className={`bi ${item.icon} nav-icon`}></i>
                    <span className="nav-text">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="footer-content">
              <div className="footer-user">
                <div className="footer-username">{user.username}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          position: fixed;
          top: 0;
          right: -280px;
          height: 100vh;
          z-index: 1050;
          transition: right 0.3s ease-in-out;
          overflow-y: auto;
        }

        .sidebar-open {
          right: 0;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .sidebar-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          background: rgba(0, 0, 0, 0.1);
        }

        .brand-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .brand-icon {
          font-size: 2rem;
          color: #4dabf7;
        }

        .brand-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
        }

        .sidebar-close-btn {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .sidebar-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .user-info-section {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-role {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin: 0.25rem 0.75rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-link-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nav-icon {
          font-size: 1.2rem;
          width: 20px;
          text-align: center;
        }

        .nav-text {
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-username {
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (min-width: 992px) {
          .sidebar {
            position: static;
            right: 0;
          }
          
          .sidebar-overlay {
            display: none;
          }
          
          .sidebar-close-btn {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 260px;
            right: -260px;
          }
        }
      `}</style>
    </>
  );
}