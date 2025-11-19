// 📂 src/components/catalog/ProductGrid.js

import { useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  getProductPricingInfo,
  onAddToOrder,
  onShowPricing,
  selectedStore,
  tempOrderMode
}) {
  if (products.length === 0) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <i className="bi bi-inboxes display-1 text-muted mb-3"></i>
          <h5 className="text-muted">محصولی یافت نشد</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {products.map((product, index) => (
        <div key={product.id} className="product-section" style={{ marginBottom: "4rem" }}>
          <ProductCard
            product={product}
            pricing={getProductPricingInfo(product)}
            onAddToOrder={onAddToOrder}
            onShowPricing={onShowPricing}
            productNumber={index + 1}
            totalProducts={products.length}
            selectedStore={selectedStore}
            tempOrderMode={tempOrderMode}
          />
        </div>
      ))}
      
      <style jsx>{`
        .product-section {
          height: 100vh;
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
}