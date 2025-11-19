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
          <div className="fw-bold mb-1" style={{ fontSize: "0.9rem", color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
        />
      </div>
    </div>
  );
}

function ActionButton({ icon, color, title, onClick }) {
  return (
    <div className="position-relative">
      <button
        className={`btn btn-${color} glass-btn ${color === 'info' ? 'text-white' : ''}`}
        onClick={onClick}
        title={title}
        style={{
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <i className={`${icon} fs-6`}></i>
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
      <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>{label}</div>
      <div style={{ fontSize: "0.8rem", ...style }}>
        {price.toLocaleString("fa-IR")}
      </div>
    </div>
  );
}