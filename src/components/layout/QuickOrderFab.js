"use client";

import { Add } from "@mui/icons-material";

export default function QuickOrderFab({ user }) {
  if (!(user.role === 'SALES_REP' || user.role === 'ADMIN')) {
    return null;
  }

  return (
    <>
      <button
        className="quick-order-fab"
        data-bs-toggle="modal"
        data-bs-target="#orderModal"
      >
        <Add sx={{ fontSize: 24 }} />
      </button>

      <style jsx>{`
        .quick-order-fab {
          position: fixed;
          bottom: 80px;
          left: 16px;
          z-index: 1001;
          background: linear-gradient(135deg, #00a76f, #00d2a0);
          color: white;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 167, 111, 0.4);
          transition: all 0.3s ease;
          cursor: pointer;
          display: none;
        }

        .quick-order-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 167, 111, 0.6);
        }

        @media (max-width: 991px) {
          .quick-order-fab {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .quick-order-fab {
            bottom: 75px;
            left: 12px;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </>
  );
}