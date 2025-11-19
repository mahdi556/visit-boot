// 📂 src/components/catalog/AddToOrderModal.js
import { useState, useEffect } from "react";

export default function AddToOrderModal({
  product,
  quantity,
  onQuantityChange,
  onConfirm,
  onCancel,
  selectedStore,
  tempOrderMode,
}) {
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    calculatePrice();
  }, [product, quantity, selectedStore]);

  const calculatePrice = async () => {
    if (!product || quantity < 1) return;

    setIsLoading(true);
    try {
      const cartItems = [
        {
          product: {
            code: product.code,
            price: product.price,
          },
          quantity: quantity,
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

        const productPriceInfo = data.itemPrices.find(
          (item) => item.productCode === product.code
        );
        if (productPriceInfo) {
          setCalculatedPrice({
            unitPrice: productPriceInfo.unitPrice,
            totalPrice: productPriceInfo.totalPrice,
            discountAmount: productPriceInfo.discountAmount || 0,
            appliedDiscountRate: productPriceInfo.appliedDiscountRate || 0,
          });
        } else {
          const basePrice = Math.round(product.price * (1 - 0.123));
          setCalculatedPrice({
            unitPrice: basePrice,
            totalPrice: basePrice * quantity,
            discountAmount: 0,
            appliedDiscountRate: 0,
          });
        }
      }
    } catch (error) {
      console.error("خطا در محاسبه قیمت:", error);
      const basePrice = Math.round(product.price * (1 - 0.123));
      setCalculatedPrice({
        unitPrice: basePrice,
        totalPrice: basePrice * quantity,
        discountAmount: 0,
        appliedDiscountRate: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const basePrice = Math.round(product.price * (1 - 0.123));
  const baseTotalPrice = basePrice * quantity;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <ModalHeader onCancel={onCancel} />
          <ModalBody
            product={product}
            selectedStore={selectedStore}
            tempOrderMode={tempOrderMode}
            isLoading={isLoading}
            calculatedPrice={calculatedPrice}
            basePrice={basePrice}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            pricingData={pricingData}
            baseTotalPrice={baseTotalPrice}
          />
          <ModalFooter
            isLoading={isLoading}
            selectedStore={selectedStore}
            tempOrderMode={tempOrderMode}
            calculatedPrice={calculatedPrice}
            basePrice={basePrice}
            baseTotalPrice={baseTotalPrice}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}

function ModalHeader({ onCancel }) {
  return (
    <div className="modal-header">
      <h5 className="modal-title">
        <i className="bi bi-cart-plus text-success me-2"></i>
        افزودن به سفارش
      </h5>
      <button type="button" className="btn-close" onClick={onCancel}></button>
    </div>
  );
}

function ModalBody({
  product,
  selectedStore,
  tempOrderMode,
  isLoading,
  calculatedPrice,
  basePrice,
  quantity,
  onQuantityChange,
  pricingData,
  baseTotalPrice
}) {
  return (
    <div className="modal-body text-center">
      <h6 className="mb-3">{product.name}</h6>

      <StoreInfo selectedStore={selectedStore} tempOrderMode={tempOrderMode} />
      <PriceDisplay isLoading={isLoading} calculatedPrice={calculatedPrice} basePrice={basePrice} />
      <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} isLoading={isLoading} />
      <TotalPrice 
        isLoading={isLoading}
        calculatedPrice={calculatedPrice}
        baseTotalPrice={baseTotalPrice}
      />
      <DiscountInfo pricingData={pricingData} isLoading={isLoading} />
    </div>
  );
}

function StoreInfo({ selectedStore, tempOrderMode }) {
  return (
    <div className="mb-3 p-2 rounded bg-light">
      {selectedStore ? (
        <div className="text-start small">
          <div className="fw-bold text-success">
            <i className="bi bi-check-circle me-1"></i>
            فروشگاه: {selectedStore.name}
          </div>
          <div className="text-muted">
            کد: {selectedStore.code} | {selectedStore.phone}
          </div>
        </div>
      ) : tempOrderMode ? (
        <div className="text-start small">
          <div className="fw-bold text-info">
            <i className="bi bi-shop me-1"></i>
            فاکتور موقت - فروشگاه 7000
          </div>
          <div className="text-muted">
            این سفارش به فروشگاه با کد 7000 ارسال می‌شود
          </div>
        </div>
      ) : (
        <div className="text-start small text-danger">
          <i className="bi bi-exclamation-triangle me-1"></i>
          لطفاً ابتدا فروشگاه را انتخاب کنید
        </div>
      )}
    </div>
  );
}

function PriceDisplay({ isLoading, calculatedPrice, basePrice }) {
  return (
    <div className="mb-3">
      <div className="text-muted small">قیمت واحد:</div>
      {isLoading ? (
        <div className="h5 text-warning">
          <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>
          در حال محاسبه...
        </div>
      ) : calculatedPrice ? (
        <div>
          {calculatedPrice.appliedDiscountRate > 0 ? (
            <div>
              <div className="text-decoration-line-through text-muted small">
                {basePrice.toLocaleString("fa-IR")} ریال
              </div>
              <div className="h5 text-warning">
                {calculatedPrice.unitPrice.toLocaleString("fa-IR")} ریال
                <span className="badge bg-success ms-2">
                  {Math.round(calculatedPrice.appliedDiscountRate * 100)}% تخفیف
                </span>
              </div>
            </div>
          ) : (
            <div className="h5 text-warning">
              {calculatedPrice.unitPrice.toLocaleString("fa-IR")} ریال
            </div>
          )}
        </div>
      ) : (
        <div className="h5 text-warning">
          {basePrice.toLocaleString("fa-IR")} ریال
        </div>
      )}
    </div>
  );
}

function QuantitySelector({ quantity, onQuantityChange, isLoading }) {
  return (
    <div className="mb-4">
      <label className="form-label">تعداد:</label>
      <div className="d-flex justify-content-center align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={isLoading}
        >
          <i className="bi bi-dash"></i>
        </button>
        <span className="h4 mb-0 mx-3">
          {quantity}
          {isLoading && (
            <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-1 text-warning"></i>
          )}
        </span>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={isLoading}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
    </div>
  );
}

function TotalPrice({ isLoading, calculatedPrice, baseTotalPrice }) {
  return (
    <div className="border-top pt-3">
      {isLoading ? (
        <div className="d-flex justify-content-between align-items-center">
          <strong>جمع کل:</strong>
          <div className="text-warning">
            <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>
            در حال محاسبه...
          </div>
        </div>
      ) : calculatedPrice ? (
        <div>
          {calculatedPrice.discountAmount > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">جمع پایه:</span>
                <span className="text-decoration-line-through text-muted">
                  {baseTotalPrice.toLocaleString("fa-IR")} ریال
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-success">تخفیف:</span>
                <span className="text-success">
                  -{calculatedPrice.discountAmount.toLocaleString("fa-IR")} ریال
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <strong>جمع نهایی:</strong>
                <strong className="text-success h5">
                  {calculatedPrice.totalPrice.toLocaleString("fa-IR")} ریال
                </strong>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-between align-items-center">
              <strong>جمع کل:</strong>
              <strong className="text-success h5">
                {calculatedPrice.totalPrice.toLocaleString("fa-IR")} ریال
              </strong>
            </div>
          )}
        </div>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <strong>جمع کل:</strong>
          <strong className="text-success h5">
            {baseTotalPrice.toLocaleString("fa-IR")} ریال
          </strong>
        </div>
      )}
    </div>
  );
}

function DiscountInfo({ pricingData, isLoading }) {
  if (isLoading) return null;

  return (
    <>
      {pricingData?.appliedPlan && (
        <div className="alert alert-info mt-3 p-2 small">
          <i className="bi bi-tags me-1"></i>
          <strong>طرح فعال: </strong>
          {pricingData.appliedPlan.name}
          {pricingData.appliedTier && (
            <div className="mt-1">{pricingData.appliedTier.description}</div>
          )}
        </div>
      )}

      {pricingData?.groupDiscounts && pricingData.groupDiscounts.length > 0 && (
        <div className="alert alert-success mt-3 p-2 small">
          <i className="bi bi-collection me-1"></i>
          <strong>تخفیف گروهی: </strong>
          {pricingData.groupDiscounts[0].groupName}
          <div className="mt-1">{pricingData.groupDiscounts[0].description}</div>
        </div>
      )}
    </>
  );
}

function ModalFooter({
  isLoading,
  selectedStore,
  tempOrderMode,
  calculatedPrice,
  basePrice,
  baseTotalPrice,
  onCancel,
  onConfirm
}) {
  return (
    <div className="modal-footer">
      <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
        انصراف
      </button>
      <button
        type="button"
        className="btn btn-success"
        onClick={() =>
          onConfirm(
            calculatedPrice || {
              unitPrice: basePrice,
              totalPrice: baseTotalPrice,
              discountAmount: 0,
              appliedDiscountRate: 0,
            }
          )
        }
        disabled={(!selectedStore && !tempOrderMode) || isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            در حال محاسبه...
          </>
        ) : tempOrderMode ? (
          <>
            <i className="bi bi-clock me-1"></i>
            ثبت موقت
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-1"></i>
            تأیید
          </>
        )}
      </button>
    </div>
  );
}