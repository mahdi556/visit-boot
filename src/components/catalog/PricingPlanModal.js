// 📂 src/components/catalog/PricingPlanModal.js
import { useState, useEffect } from "react";

export default function PricingPlanModal({ product, onClose, onAddToOrder }) {
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allGroupProducts, setAllGroupProducts] = useState([]);
  const [groupTiers, setGroupTiers] = useState([]);

  useEffect(() => {
    fetchPricingData();
    fetchGroupDetails();
  }, [product]);

  const fetchPricingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cartItems = [
        {
          product: {
            code: product.code,
            price: product.price,
          },
          quantity: 10,
        },
      ];

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      if (response.ok) {
        const data = await response.json();
        setPricingData(data);
      } else {
        throw new Error("خطا در دریافت اطلاعات تخفیف");
      }
    } catch (err) {
      console.error("Error fetching pricing data:", err);
      setError("خطا در دریافت اطلاعات تخفیف");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch("/api/discount-groups");
      if (response.ok) {
        const groups = await response.json();
        const productGroup = groups.find(
          (group) =>
            group.groupProducts &&
            group.groupProducts.some((gp) => gp.productCode === product.code)
        );

        if (productGroup) {
          setAllGroupProducts(productGroup.groupProducts || []);
          setGroupTiers(productGroup.groupTiers || []);
        }
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const activeGroup = pricingData?.groupDiscounts?.[0];
  const relatedProducts = allGroupProducts
    .filter((gp) => gp.product && gp.productCode !== product.code)
    .map((gp) => gp.product);
  const displayTiers = groupTiers.length > 0 ? groupTiers : activeGroup?.groupTiers || [];

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-percent me-2"></i>
              طرح تخفیف گروهی - {product.name}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} />
            ) : activeGroup || displayTiers.length > 0 ? (
              <div className="row">
                <div className="col-md-6">
                  <DiscountTiers 
                    activeGroup={activeGroup}
                    displayTiers={displayTiers}
                    product={product}
                  />
                </div>
                <div className="col-md-6">
                  <RelatedProducts 
                    relatedProducts={relatedProducts}
                  />
                </div>
              </div>
            ) : (
              <NoDiscountState />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>
              بستن
            </button>
            <button type="button" className="btn btn-success" onClick={onAddToOrder}>
              <i className="bi bi-cart-plus me-1"></i>
              افزودن به سفارش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">در حال بارگذاری...</span>
      </div>
      <div className="mt-2">در حال دریافت اطلاعات تخفیف...</div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="alert alert-danger text-center">
      <i className="bi bi-exclamation-triangle me-2"></i>
      {error}
    </div>
  );
}

function NoDiscountState() {
  return (
    <div className="text-center py-5">
      <i className="bi bi-percent display-1 text-muted mb-3"></i>
      <h5 className="text-muted">تخفیف گروهی فعال نیست</h5>
      <p className="text-muted">این محصول تحت پوشش هیچ گروه تخفیفی قرار ندارد</p>
    </div>
  );
}

function DiscountTiers({ activeGroup, displayTiers, product }) {
  return (
    <div className="card h-100">
      <div className="card-header bg-success text-white">
        <h6 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          پله‌های تخفیف گروهی
          {activeGroup && (
            <span className="badge bg-light text-success ms-2">{activeGroup.groupName}</span>
          )}
        </h6>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <p className="text-muted small mb-4">
            تخفیف‌های پلکانی بر اساس مجموع خرید از کل گروه
          </p>
        </div>

        <div className="tiers-list">
          {displayTiers.length > 0 ? (
            displayTiers.map((tier, index) => (
              <TierItem 
                key={tier.id || index}
                tier={tier}
                product={product}
                isActive={activeGroup?.appliedTier?.minQuantity === tier.minQuantity}
              />
            ))
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-exclamation-triangle display-6 d-block mb-2"></i>
              <p>هیچ پله تخفیفی تعریف نشده است</p>
            </div>
          )}
        </div>

        {displayTiers.length > 0 && (
          <TiersSummary displayTiers={displayTiers} />
        )}
      </div>
    </div>
  );
}

function TierItem({ tier, product, isActive }) {
  return (
    <div className={`tier-item p-3 mb-3 rounded border ${
      isActive ? "border-success bg-success bg-opacity-10" : "border-light bg-light"
    }`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center">
          <span className="badge bg-primary me-2 fs-6">{tier.minQuantity}+</span>
          <span className="fw-medium">عدد از گروه</span>
        </div>
        <span className={`badge ${isActive ? "bg-success" : "bg-secondary"} fs-6`}>
          {Math.round((tier.discountRate || 0) * 100)}%
        </span>
      </div>

      {tier.description && (
        <div className="text-muted small mt-2">
          <i className="bi bi-info-circle me-1"></i>
          {tier.description}
        </div>
      )}

      <div className="mt-2 pt-2 border-top">
        <div className="row text-center small">
          <div className="col-6">
            <div className="text-muted">قیمت واحد</div>
            <div className="fw-bold text-success">
              {Math.round(
                product.price * (1 - 0.123) * (1 - (tier.discountRate || 0))
              ).toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="col-6">
            <div className="text-muted">صرفه‌جویی</div>
            <div className="fw-bold text-danger">
              {Math.round(
                product.price * (1 - 0.123) * (tier.discountRate || 0)
              ).toLocaleString("fa-IR")}
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="text-center mt-2">
          <span className="badge bg-warning text-dark">
            <i className="bi bi-star-fill me-1"></i>
            تخفیف فعال برای ۱۰ عدد
          </span>
        </div>
      )}
    </div>
  );
}

function TiersSummary({ displayTiers }) {
  return (
    <div className="bg-light rounded p-3 mt-3">
      <div className="row text-center small">
        <div className="col-6 border-end">
          <div className="text-muted">تعداد پله‌ها</div>
          <div className="fw-bold text-primary">{displayTiers.length}</div>
        </div>
        <div className="col-6">
          <div className="text-muted">بیشترین تخفیف</div>
          <div className="fw-bold text-success">
            {Math.round(
              Math.max(...displayTiers.map((t) => (t.discountRate || 0) * 100))
            )}%
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedProducts({ relatedProducts }) {
  return (
    <div className="card h-100">
      <div className="card-header bg-info text-white">
        <h6 className="mb-0">
          <i className="bi bi-collection me-2"></i>
          محصولات هم‌گروهی
          <span className="badge bg-light text-info ms-2">{relatedProducts.length} محصول</span>
        </h6>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          با افزودن این محصولات به سفارش، از تخفیف گروهی بهره‌مند شوید
        </p>

        <div className="related-products-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <RelatedProductItem 
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-box-seam display-6 d-block mb-2"></i>
              <p>هیچ محصول هم‌گروهی دیگری یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RelatedProductItem({ product }) {
  return (
    <div className="related-product-item p-3 mb-3 rounded border bg-light">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="flex-grow-1">
          <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
          <div className="text-muted small">
            کد: {product.code}
            {product.category && (
              <span className="me-2"> | دسته: {product.category}</span>
            )}
          </div>
        </div>
        <span className="badge bg-secondary">
          {product.weight
            ? `${product.weight} ${product.unit}`
            : "نامشخص"}
        </span>
      </div>

      <div className="row text-center mt-2 pt-2 border-top">
        <div className="col-6 border-end">
          <div className="text-muted small">مصرف‌کننده</div>
          <div className="text-decoration-line-through text-danger small">
            {product.price?.toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="col-6">
          <div className="text-muted small">فروشگاه</div>
          <div className="text-success fw-bold">
            {Math.round(product.price * (1 - 0.123)).toLocaleString("fa-IR")}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="badge bg-warning text-dark small">تخفیف پایه: ۱۲.۳٪</span>
      </div>
    </div>
  );
}