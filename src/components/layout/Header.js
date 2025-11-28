"use client";

import { useRouter } from "next/navigation";

export default function Header({ onMenuToggle, user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-start">
          <button
            className="sidebar-toggle"
            onClick={onMenuToggle}
          >
            <i className="bi bi-list"></i>
          </button>

          <div className="header-brand">
            <i className="bi bi-shop-window brand-icon-sm"></i>
            <span className="brand-text-sm">
              نبات نگین آرا
            </span>
            {user.role === 'SALES_REP' && user.salesRep && (
              <span className="salesrep-info">
                | ویزیتور: {user.salesRep.name}
              </span>
            )}
          </div>
        </div>

        <div className="header-end">
          <div className="notification-dropdown">
            <button
              className="notification-btn"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <ul className="dropdown-menu">
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

          <div className="user-dropdown">
            <button
              className="user-btn"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle user-avatar-sm"></i>
              <span className="user-name-sm">
                {user.firstName} {user.lastName}
              </span>
            </button>
            <ul className="dropdown-menu">
              <li>
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="dropdown-user-role">
                    {user.role === 'SALES_REP' ? 'ویزیتور' : 
                     user.role === 'ADMIN' ? 'مدیر سیستم' : 
                     user.role === 'MANAGER' ? 'مدیر' : 'کاربر'}
                    {user.salesRep && ` - ${user.salesRep.name}`}
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item logout-dropdown-btn" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-left"></i>
                  <span>خروج</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-header {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1030;
          height: 70px;
          margin: 0;
          padding: 0;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          height: 100%;
        }

        .header-start {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle {
          background: #007bff;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-icon-sm {
          font-size: 1.5rem;
          color: #007bff;
        }

        .brand-text-sm {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .salesrep-info {
          font-size: 0.85rem;
          color: #666;
          margin-right: 0.5rem;
          display: none;
        }

        .header-end {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-dropdown {
          position: relative;
        }

        .notification-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s ease;
        }

        .notification-btn:hover {
          background: #e9ecef;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc3545;
          color: white;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .user-dropdown {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .user-btn:hover {
          background: #e9ecef;
        }

        .user-avatar-sm {
          font-size: 1.3rem;
          color: #007bff;
        }

        .user-name-sm {
          font-weight: 500;
        }

        .dropdown-menu {
          border: none;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          padding: 0.5rem;
          min-width: 200px;
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-user-info {
          padding: 0.75rem 1rem;
        }

        .dropdown-user-name {
          font-weight: 600;
          color: #333;
        }

        .dropdown-user-role {
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .logout-dropdown-btn {
          color: #dc3545;
        }

        .logout-dropdown-btn:hover {
          background: #fff5f5;
          color: #dc3545;
        }

        @media (min-width: 992px) {
          .salesrep-info {
            display: inline;
          }
        }

        @media (max-width: 991px) {
          .user-name-sm {
            display: none;
          }
          
          .notification-dropdown {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .header-container {
            padding: 0 0.75rem;
          }
          
          .brand-text-sm {
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  );
}