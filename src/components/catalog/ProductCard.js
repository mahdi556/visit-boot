// 📂 src/components/catalog/ProductCard.js

import { useState } from "react";

export default function ProductCard({
  product,
  pricing,
  onAddToOrder,
  onShowPricing,
  selectedStore,
  tempOrderMode
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="position-relative vh-100 bg-light" style={{ marginBottom: "1rem" }}>
      <div className="position-relative w-100" style={{ height: "75vh" }}>
        <img
          src={`/images/products/${product.code}.jpg`}
          className="w-100 h-100"
          alt={product.name}
          style={{
            objectFit: "contain",
            objectPosition: "center",
            backgroundColor: "#f8f9fa",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/images/default-product.jpg";
            setImageLoaded(true);
          }}
        />

        <ProductHeader product={product} />
        <ProductActions 
          product={product}
          onAddToOrder={onAddToOrder}
          onShowPricing={onShowPricing}
          selectedStore={selectedStore}
          tempOrderMode={tempOrderMode}
        />
        <ProductPricing pricing={pricing} />

        {!imageLoaded && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="spinner-border text-primary" style={{ width: "2rem", height: "2rem" }}>
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductHeader({ product }) {
  return (
    <div className="position-absolute top-0 start-0 end-0">
      <div className="glass-card rounded-0 rounded-bottom-2 px-3 py-2 w-100">
        <div className="text-dark text-center">
          <div className="fw-bold mb-1 MuiTypography-h1" style={{  color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {product.name}
          </div>
          <div className="d-flex justify-content-center gap-3 gap-md-4" style={{ fontSize: "0.75rem" }}>
            <span style={{ color: "#4a5568" }}>کد: {product.code}</span>
            <span style={{ color: "#2d3748" }}>{product.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductActions({ product, onAddToOrder, onShowPricing, selectedStore, tempOrderMode }) {
  return (
    <div className="position-absolute top-0 start-0 mt-5 m-2 m-md-3">
      <div className="d-flex flex-column gap-3 gap-md-4">
        <ActionButton
          icon="bi-percent"
          color="info"
          title="طرح‌های تخفیف"
          onClick={() => onShowPricing(product)}
          size="md"
        />
        <ActionButton
          icon="bi-cart-plus"
          color="success"
          title="افزودن به سفارش"
          onClick={() => {
            if (!selectedStore && !tempOrderMode) {
              alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
              return;
            }
            onAddToOrder(product);
          }}
          size="md"
        />
      </div>
    </div>
  );
}

function ActionButton({ icon, color, title, onClick, size = "md" }) {
  // سایزهای مختلف برای دستگاه‌های مختلف
  const sizeClasses = {
    sm: {
      width: "45px",
      height: "45px",
      fontSize: "0.875rem"
    },
    md: {
      width: "60px",  // بزرگتر برای تبلت
      height: "60px", // بزرگتر برای تبلت
      fontSize: "1.125rem"
    },
    lg: {
      width: "70px",
      height: "70px",
      fontSize: "1.25rem"
    }
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className="position-relative">
      <button
        className={`btn btn-${color} glass-btn ${color === 'info' ? 'text-white' : ''}`}
        onClick={onClick}
        title={title}
        style={{
          width: selectedSize.width,
          height: selectedSize.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          borderRadius: "12px", // گوشه‌های گردتر
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // سایه عمیق‌تر
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
      >
        <i className={icon} style={{ fontSize: selectedSize.fontSize }}></i>
      </button>
    </div>
  );
}

function ProductPricing({ pricing }) {
  return (
    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 w-75">
      <div className="glass-card px-4 py-3">
        <div className="d-flex align-items-center justify-content-around" style={{ fontSize: "0.9rem" }}>
          <PriceItem 
            label="مصرف کننده"
            price={pricing.consumerPrice}
            style={{ color: "#6b7280", textDecoration: "line-through" }}
          />
          <PriceItem 
            label="فروشگاه"
            price={pricing.storeBasePrice}
            style={{ color: "#d97706", fontWeight: "bold" }}
          />
        </div>
      </div>
    </div>
  );
}

function PriceItem({ label, price, style }) {
  return (
    <div className="text-center">
      <div className="text-muted mb-1 MuiTypography-h4" >{label}</div>
      <div style={{ fontSize: "0.8rem", ...style }}>
        {price.toLocaleString("fa-IR")}
      </div>
    </div>
  );
}

// اضافه کردن استایل‌های رسپانسیو
const responsiveStyles = `
  @media (min-width: 768px) and (max-width: 1024px) {
    /* تبلت */
    .glass-btn {
      width: 65px !important;
      height: 65px !important;
    }
    
    .glass-btn i {
      font-size: 1.25rem !important;
    }
  }
  
  @media (min-width: 1025px) {
    /* دسکتاپ */
    .glass-btn {
      width: 55px !important;
      height: 55px !important;
    }
    
    .glass-btn i {
      font-size: 1rem !important;
    }
  }
  
  @media (max-width: 767px) {
    /* موبایل */
    .glass-btn {
      width: 50px !important;
      height: 50px !important;
    }
    
    .glass-btn i {
      font-size: 0.875rem !important;
    }
  }
  
  /* انیمیشن hover برای همه دستگاه‌ها */
  .glass-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
  }
`;

// اضافه کردن استایل‌ها به صفحه
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = responsiveStyles;
  document.head.appendChild(styleElement);
}