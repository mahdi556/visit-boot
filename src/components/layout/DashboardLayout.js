"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import QuickOrderFab from "./QuickOrderFab";
import QuickOrderModal from "@/components/dashboard/QuickOrderModal";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
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

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout" dir="rtl">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
      />
      
      <div className="main-content">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
        />
        
        <main className="content-area">
          {children}
        </main>

        <BottomNav user={user} />
        <QuickOrderFab user={user} />
      </div>

      <QuickOrderModal />

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
          margin: 0;
          padding: 0;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .content-area {
          flex: 1;
          padding: 1rem;
          padding-bottom: 70px;
          background: #f8f9fa;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f8f9fa;
        }

        @media (max-width: 767px) {
          .content-area {
            padding: 0.75rem;
            padding-bottom: 70px;
          }
        }
      `}</style>
    </div>
  );
}