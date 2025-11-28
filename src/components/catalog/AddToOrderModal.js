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

        const productPriceInfo = data.itemPrices?.find(
          (item) => item.productCode === product.code
        );
        
        if (productPriceInfo && productPriceInfo.unitPrice !== null && productPriceInfo.unitPrice !== undefined) {
          setCalculatedPrice({
            unitPrice: productPriceInfo.unitPrice,
            totalPrice: productPriceInfo.totalPrice,
            discountAmount: productPriceInfo.discountAmount || 0,
            appliedDiscountRate: productPriceInfo.appliedDiscountRate || 0,
          });
        } else {
          // استفاده از قیمت پایه در صورت عدم وجود داده
          const basePrice = Math.round(product.price * (1 - 0.123));
          setCalculatedPrice({
            unitPrice: basePrice,
            totalPrice: basePrice * quantity,
            discountAmount: 0,
            appliedDiscountRate: 0,
          });
        }
      } else {
        // در صورت خطای API از قیمت پایه استفاده کن
        throw new Error('خطا در دریافت قیمت از سرور');
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
      <div className="modal-dialog modal-lg modal-tablet-friendly">
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

      {/* استایل‌های سفارشی برای تبلت */}
      <style jsx>{`
        .modal-tablet-friendly .modal-content {
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .modal-tablet-friendly .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #e9ecef;
        }
        
        .modal-tablet-friendly .modal-body {
          padding: 2rem;
        }
        
        .modal-tablet-friendly .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid #e9ecef;
        }
        
        @media (max-width: 768px) {
          .modal-tablet-friendly .modal-dialog {
            margin: 1rem;
            max-width: calc(100% - 2rem);
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .modal-tablet-friendly .modal-dialog {
            max-width: 600px;
            margin: 2rem auto;
          }
        }
      `}</style>
    </div>
  );
}

function ModalHeader({ onCancel }) {
  return (
    <div className="modal-header">
      <h4 className="modal-title fw-bold">
        <i className="bi bi-cart-plus text-success me-2 fs-3"></i>
        افزودن به سفارش
      </h4>
      <button 
        type="button" 
        className="btn-close" 
        onClick={onCancel}
        style={{ transform: 'scale(1.3)' }}
      ></button>
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
      <h4 className="mb-4 fw-bold text-dark">{product.name}</h4>
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <ProductImage product={product} />
        </div>
        <div className="col-md-6">
          <ProductDetails product={product} />
        </div>
      </div>

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

function ProductImage({ product }) {
  return (
    <div className="text-center mb-3">
      <img
        src={`/images/products/${product.code}.jpg`}
        className="img-fluid rounded-3"
        alt={product.name}
        style={{
          maxHeight: '200px',
          objectFit: 'contain',
          backgroundColor: '#f8f9fa',
          padding: '1rem'
        }}
        onError={(e) => {
          e.target.src = "/images/default-product.jpg";
        }}
      />
    </div>
  );
}

function ProductDetails({ product }) {
  return (
    <div className="text-start">
      <div className="mb-2">
        <strong className="text-muted">کد محصول:</strong>
        <span className="ms-2 fw-bold">#{product.code}</span>
      </div>
      <div className="mb-2">
        <strong className="text-muted">دسته‌بندی:</strong>
        <span className="ms-2 badge bg-primary fs-6">{product.category}</span>
      </div>
      {product.unit && (
        <div className="mb-2">
          <strong className="text-muted">واحد:</strong>
          <span className="ms-2">{product.unit}</span>
        </div>
      )}
    </div>
  );
}

function StoreInfo({ selectedStore, tempOrderMode }) {
  return (
    <div className="mb-4 p-3 rounded-3 bg-light border">
      {selectedStore ? (
        <div className="text-center">
          <div className="fw-bold text-success fs-5 mb-2">
            <i className="bi bi-check-circle me-2"></i>
            فروشگاه انتخاب شده
          </div>
          <div className="row text-start">
            <div className="col-md-6">
              <strong>نام:</strong> {selectedStore.name}
            </div>
            <div className="col-md-6">
              <strong>کد:</strong> {selectedStore.code}
            </div>
            <div className="col-md-6">
              <strong>مالک:</strong> {selectedStore.ownerName}
            </div>
            <div className="col-md-6">
              <strong>تلفن:</strong> {selectedStore.phone}
            </div>
          </div>
        </div>
      ) : tempOrderMode ? (
        <div className="text-center">
          <div className="fw-bold text-info fs-5 mb-2">
            <i className="bi bi-shop me-2"></i>
            فاکتور موقت
          </div>
          <div className="text-muted fs-6">
            این سفارش به فروشگاه با کد 7000 ارسال می‌شود
          </div>
        </div>
      ) : (
        <div className="text-center text-danger">
          <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
          <strong className="fs-5">لطفاً ابتدا فروشگاه را انتخاب کنید</strong>
        </div>
      )}
    </div>
  );
}

function PriceDisplay({ isLoading, calculatedPrice, basePrice }) {
  // تابع ایمن برای نمایش قیمت
  const getSafePrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 0;
    }
    return price;
  };

  const displayPrice = calculatedPrice ? getSafePrice(calculatedPrice.unitPrice) : getSafePrice(basePrice);
  const appliedDiscountRate = calculatedPrice?.appliedDiscountRate || 0;

  return (
    <div className="mb-4 p-3 bg-warning bg-opacity-10 rounded-3 border border-warning">
      <div className="text-muted fs-6 mb-2">قیمت واحد:</div>
      {isLoading ? (
        <div className="h3 text-warning fw-bold">
          <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>
          در حال محاسبه...
        </div>
      ) : (
        <div>
          {appliedDiscountRate > 0 ? (
            <div className="text-center">
              <div className="text-decoration-line-through text-muted fs-5">
                {getSafePrice(basePrice).toLocaleString("fa-IR")} ریال
              </div>
              <div className="h2 text-warning fw-bold my-2">
                {displayPrice.toLocaleString("fa-IR")} ریال
              </div>
              <span className="badge bg-success fs-6 p-2">
                {Math.round(appliedDiscountRate * 100)}% تخفیف
              </span>
            </div>
          ) : (
            <div className="h2 text-warning fw-bold text-center">
              {displayPrice.toLocaleString("fa-IR")} ریال
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuantitySelector({ quantity, onQuantityChange, isLoading }) {
  return (
    <div className="mb-4">
      <label className="form-label fs-5 fw-bold mb-3">تعداد:</label>
      <div className="d-flex justify-content-center align-items-center gap-4">
        <button
          type="button"
          className="btn btn-outline-secondary btn-lg"
          style={{ width: '60px', height: '60px' }}
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={isLoading}
        >
          <i className="bi bi-dash fs-4"></i>
        </button>
        
        <span className="display-4 fw-bold mx-4" style={{ minWidth: '80px' }}>
          {quantity}
          {isLoading && (
            <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-2 text-warning fs-6"></i>
          )}
        </span>
        
        <button
          type="button"
          className="btn btn-outline-secondary btn-lg"
          style={{ width: '60px', height: '60px' }}
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={isLoading}
        >
          <i className="bi bi-plus fs-4"></i>
        </button>
      </div>
    </div>
  );
}

function TotalPrice({ isLoading, calculatedPrice, baseTotalPrice }) {
  // تابع ایمن برای نمایش قیمت
  const getSafePrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 0;
    }
    return price;
  };

  const displayTotalPrice = calculatedPrice ? getSafePrice(calculatedPrice.totalPrice) : getSafePrice(baseTotalPrice);
  const discountAmount = calculatedPrice?.discountAmount || 0;

  return (
    <div className="border-top pt-4 mt-4">
      {isLoading ? (
        <div className="d-flex justify-content-between align-items-center">
          <strong className="fs-4">جمع کل:</strong>
          <div className="text-warning fs-4">
            <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>
            در حال محاسبه...
          </div>
        </div>
      ) : (
        <div>
          {discountAmount > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fs-5">جمع پایه:</span>
                <span className="text-decoration-line-through text-muted fs-5">
                  {getSafePrice(baseTotalPrice).toLocaleString("fa-IR")} ریال
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-success fs-5">تخفیف:</span>
                <span className="text-success fs-5">
                  -{getSafePrice(discountAmount).toLocaleString("fa-IR")} ریال
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <strong className="fs-3">جمع نهایی:</strong>
                <strong className="text-success display-6">
                  {displayTotalPrice.toLocaleString("fa-IR")} ریال
                </strong>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-between align-items-center">
              <strong className="fs-3">جمع کل:</strong>
              <strong className="text-success display-6">
                {displayTotalPrice.toLocaleString("fa-IR")} ریال
              </strong>
            </div>
          )}
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
        <div className="alert alert-info mt-4 p-3 fs-6 border-0 rounded-3">
          <i className="bi bi-tags me-2 fs-4"></i>
          <strong className="fs-5">طرح فعال: </strong>
          {pricingData.appliedPlan.name}
          {pricingData.appliedTier && (
            <div className="mt-2 fs-6">{pricingData.appliedTier.description}</div>
          )}
        </div>
      )}

      {pricingData?.groupDiscounts && pricingData.groupDiscounts.length > 0 && (
        <div className="alert alert-success mt-3 p-3 fs-6 border-0 rounded-3">
          <i className="bi bi-collection me-2 fs-4"></i>
          <strong className="fs-5">تخفیف گروهی: </strong>
          {pricingData.groupDiscounts[0].groupName}
          <div className="mt-2 fs-6">{pricingData.groupDiscounts[0].description}</div>
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
  // تابع ایمن برای بررسی قیمت
  const getSafeCalculatedPrice = () => {
    if (calculatedPrice && 
        calculatedPrice.unitPrice !== null && 
        calculatedPrice.unitPrice !== undefined &&
        calculatedPrice.totalPrice !== null &&
        calculatedPrice.totalPrice !== undefined) {
      return calculatedPrice;
    }
    
    // در صورت مشکل در calculatedPrice از قیمت پایه استفاده کن
    return {
      unitPrice: basePrice,
      totalPrice: baseTotalPrice,
      discountAmount: 0,
      appliedDiscountRate: 0,
    };
  };

  return (
    <div className="modal-footer">
      <button 
        type="button" 
        className="btn btn-secondary btn-lg px-4"
        onClick={onCancel} 
        disabled={isLoading}
      >
        <i className="bi bi-x-circle me-2"></i>
        انصراف
      </button>
      <button
        type="button"
        className="btn btn-success btn-lg px-4"
        onClick={() => onConfirm(getSafeCalculatedPrice())}
        disabled={(!selectedStore && !tempOrderMode) || isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            در حال محاسبه...
          </>
        ) : tempOrderMode ? (
          <>
            <i className="bi bi-clock me-2"></i>
            ثبت موقت
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>
            تأیید و افزودن
          </>
        )}
      </button>
    </div>
  );
}