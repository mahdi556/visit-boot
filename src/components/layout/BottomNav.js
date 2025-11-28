"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ user }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(0);

  const bottomNavItems = [
    { 
      label: "خانه", 
      href: "/dashboard", 
      icon: "🏠",
      value: 0
    },
    { 
      label: "سفارش", 
      href: "/dashboard/orders", 
      icon: "🛒",
      value: 1
    },
    { 
      label: "مشتری", 
      href: "/dashboard/stores", 
      icon: "🏪",
      value: 2
    },
    { 
      label: "محصول", 
      href: "/dashboard/catalog", 
      icon: "📦",
      value: 3
    },
  ];

  useEffect(() => {
    const routes = ["/dashboard", "/dashboard/orders", "/dashboard/stores", "/dashboard/catalog"];
    const currentIndex = routes.findIndex(route => pathname === route || pathname.startsWith(route + '/'));
    if (currentIndex !== -1) {
      setActiveTab(currentIndex);
    }
  }, [pathname]);

  return (
    <nav className="bottom-navigation">
      <div className="bottom-nav-container">
        {bottomNavItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`bottom-nav-item ${activeTab === index ? "bottom-nav-active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            <div className="bottom-nav-content">
              <div className="icon-wrapper">
                <span className="nav-icon">{item.icon}</span>
                {activeTab === index && <div className="active-dot"></div>}
              </div>
              <span className="nav-label">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .bottom-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e0e0e0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          height: 62px;
          padding: 4px 0;
          display: none;
        }

        @media (max-width: 991px) {
          .bottom-navigation {
            display: block;
          }
        }

        .bottom-nav-container {
          display: flex;
          height: 100%;
          align-items: stretch;
          justify-content: space-around;
          padding: 0 8px;
          max-width: 500px;
          margin: 0 auto;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #666;
          flex: 1;
          max-width: 80px;
          position: relative;
          transition: all 0.2s ease;
        }

        .bottom-nav-active {
          color: #00a76f;
        }

        .bottom-nav-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .icon-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nav-icon {
          font-size: 1.5rem;
          margin-bottom: 2px;
          transition: all 0.2s ease;
        }

        .bottom-nav-active .nav-icon {
          transform: scale(1.1);
        }

        .active-dot {
          width: 4px;
          height: 4px;
          background: #00a76f;
          border-radius: 50%;
          position: absolute;
          bottom: -6px;
        }

        .nav-label {
          font-size: 0.65rem;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }

        .bottom-nav-item:hover {
          color: #00a76f;
        }

        /* استایل‌های مخصوص برای شبیه‌سازی دقیق‌تر */
        .bottom-navigation {
          background: #ffffff;
          border-top: 1px solid #f0f0f0;
        }

        .bottom-nav-item {
          border-radius: 8px;
          margin: 0 2px;
        }

        .bottom-nav-active {
          background: rgba(0, 167, 111, 0.05);
        }

        @media (max-width: 480px) {
          .bottom-navigation {
            height: 60px;
            padding: 3px 0;
          }
          
          .bottom-nav-container {
            padding: 0 6px;
          }
          
          .bottom-nav-item {
            max-width: 70px;
          }
          
          .nav-icon {
            font-size: 1.4rem;
          }
          
          .nav-label {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 360px) {
          .bottom-navigation {
            height: 58px;
          }
          
          .nav-icon {
            font-size: 1.3rem;
          }
          
          .nav-label {
            font-size: 0.55rem;
          }
        }
      `}</style>
    </nav>
  );
}