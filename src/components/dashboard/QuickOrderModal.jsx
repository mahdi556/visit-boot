"use client";

import { useState, useEffect, useRef } from "react";

// Hook برای debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// توابع کمکی
function getStoreTypeText(type) {
  const types = {
    SUPERMARKET: "سوپرمارکت",
    GROCERY: "بقالی",
    CONVENIENCE: "مینی‌مارکت",
    HYPERMARKET: "هایپر مارکت",
  };
  return types[type] || type;
}

function getStoreTypeBadge(type) {
  const badges = {
    SUPERMARKET: "bg-primary",
    GROCERY: "bg-success",
    CONVENIENCE: "bg-warning",
    HYPERMARKET: "bg-danger",
  };
  return badges[type] || "bg-secondary";
}

function getCreditTypeText(type) {
  const types = {
    CASH: "نقدی",
    CREDIT: "اعتباری",
    CHEQUE: "چکی",
  };
  return types[type] || type;
}

// کامپوننت اصلی
export default function QuickOrderModal() {
  const [isClient, setIsClient] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showStoreResults, setShowStoreResults] = useState(false);
  const [showProductResults, setShowProductResults] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [pricingCalculation, setPricingCalculation] = useState({
    subtotal: 0,
    discount: 0,
    finalAmount: 0,
    appliedPlan: null,
    appliedTier: null,
    itemPrices: [],
  });
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [focusedStoreIndex, setFocusedStoreIndex] = useState(-1);
  const [focusedProductIndex, setFocusedProductIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const storeSearchRef = useRef(null);
  const productSearchRef = useRef(null);

  // استفاده از debounce
  const debouncedSelectedProducts = useDebounce(selectedProducts, 500);

  // فیلتر فروشگاه‌ها با حفاظت کامل
  const filteredStores = Array.isArray(stores) 
    ? stores.filter((store) =>
        store?.name?.toLowerCase().includes(storeSearch.toLowerCase()) ||
        store?.phone?.includes(storeSearch) ||
        store?.ownerName?.toLowerCase().includes(storeSearch.toLowerCase()) ||
        store?.code?.toLowerCase().includes(storeSearch.toLowerCase())
      )
    : [];

  // فیلتر محصولات با حفاظت کامل
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product?.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product?.code?.includes(productSearch)
      )
    : [];

  // تابع محاسبه قیمت پایه فروشگاه
  const calculateStorePrice = (consumerPrice) => {
    if (!consumerPrice) return 0;
    return Math.round(consumerPrice * (1 - 0.123));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchInitialData();
    }
  }, [isClient]);

  useEffect(() => {
    calculatePricing();
  }, [debouncedSelectedProducts]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchStores(), fetchProducts()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("📦 Stores API Response:", data);
      
      // ساختار بر اساس API شما
      if (data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
      } else if (Array.isArray(data)) {
        setStores(data);
      } else {
        console.error("Unexpected stores API structure:", data);
        setStores([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("📦 Products API Response:", data);
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.error("Unexpected products API structure:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const calculatePricing = async () => {
    if (selectedProducts.length === 0) {
      setPricingCalculation({
        subtotal: 0,
        discount: 0,
        finalAmount: 0,
        appliedPlan: null,
        appliedTier: null,
        itemPrices: [],
      });
      return;
    }

    setIsCalculatingPrice(true);

    try {
      const cartItems = selectedProducts.map((product) => ({
        product: {
          code: product.code,
          price: product.price,
        },
        quantity: product.quantity,
      }));

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      if (response.ok) {
        const pricingData = await response.json();
        setPricingCalculation(pricingData);
      } else {
        calculateBasePrice();
      }
    } catch (error) {
      console.error("Error calculating pricing:", error);
      calculateBasePrice();
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const calculateBasePrice = () => {
    const subtotal = selectedProducts.reduce(
      (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
      0
    );
    setPricingCalculation({
      subtotal,
      discount: 0,
      finalAmount: subtotal,
      appliedPlan: null,
      appliedTier: null,
      itemPrices: selectedProducts.map((product) => ({
        productCode: product.code,
        quantity: product.quantity,
        unitPrice: product.price,
        totalPrice: (product.price || 0) * (product.quantity || 0),
        discount: 0,
      })),
    });
  };

  const handleStoreSearch = (value) => {
    setStoreSearch(value);
    setFocusedStoreIndex(-1);
    if (value.length >= 2) {
      setShowStoreResults(true);
    } else {
      setShowStoreResults(false);
    }
  };

  const handleProductSearch = (value) => {
    setProductSearch(value);
    setFocusedProductIndex(-1);
    if (value.length >= 2) {
      setShowProductResults(true);
    } else {
      setShowProductResults(false);
    }
  };

  const selectStore = (store) => {
    setSelectedStore(store);
    setStoreSearch(`${store.name} (${store.code})`);
    setShowStoreResults(false);
    setFocusedStoreIndex(-1);
    setTimeout(() => {
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
    }, 100);
  };

  const selectProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 0) + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
    setProductSearch("");
    setShowProductResults(false);
    setFocusedProductIndex(-1);
  };

  const updateProductQuantity = (productId, newQuantity) => {
    let updatedProducts;

    if (newQuantity === 0) {
      updatedProducts = selectedProducts.filter((p) => p.id !== productId);
    } else {
      updatedProducts = selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      );
    }

    setSelectedProducts(updatedProducts);
  };

  const resetForm = () => {
    setSelectedStore(null);
    setSelectedProducts([]);
    setStoreSearch("");
    setProductSearch("");
    setShowStoreResults(false);
    setShowProductResults(false);
    setOrderNotes("");
    setFocusedStoreIndex(-1);
    setFocusedProductIndex(-1);
    setPricingCalculation({
      subtotal: 0,
      discount: 0,
      finalAmount: 0,
      appliedPlan: null,
      appliedTier: null,
      itemPrices: [],
    });
  };

  const handleSubmit = async () => {
    if (!selectedStore || selectedProducts.length === 0) return;

    try {
      const userId = 1;

      const orderData = {
        storeCode: selectedStore.code,
        userId: userId,
        items: selectedProducts.map((product) => ({
          productCode: product.code,
          quantity: product.quantity,
          price:
            pricingCalculation.itemPrices.find(
              (p) => p.productCode === product.code
            )?.unitPrice || product.price,
        })),
        totalAmount: pricingCalculation.finalAmount,
        subtotal: pricingCalculation.subtotal,
        discount: pricingCalculation.discount,
        pricingPlanId: pricingCalculation.appliedPlan?.id,
        notes: orderNotes,
      };

      console.log("Sending order data:", orderData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
        if (closeButton) {
          closeButton.click();
        }

        resetForm();
        alert("سفارش با موفقیت ثبت شد!");
      } else {
        throw new Error(result.error || "خطا در ثبت سفارش");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.message || "خطا در ثبت سفارش");
    }
  };

  // مدیریت keyboard navigation
  useEffect(() => {
    const handleStoreKeyDown = (e) => {
      if (!showStoreResults || filteredStores.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedStoreIndex((prev) =>
            prev < filteredStores.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedStoreIndex((prev) =>
            prev > 0 ? prev - 1 : filteredStores.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (
            focusedStoreIndex >= 0 &&
            focusedStoreIndex < filteredStores.length
          ) {
            selectStore(filteredStores[focusedStoreIndex]);
          }
          break;

        case "Escape":
          setShowStoreResults(false);
          setFocusedStoreIndex(-1);
          break;

        default:
          break;
      }
    };

    if (storeSearchRef.current) {
      storeSearchRef.current.addEventListener("keydown", handleStoreKeyDown);
    }

    return () => {
      if (storeSearchRef.current) {
        storeSearchRef.current.removeEventListener(
          "keydown",
          handleStoreKeyDown
        );
      }
    };
  }, [showStoreResults, filteredStores, focusedStoreIndex]);

  useEffect(() => {
    const handleProductKeyDown = (e) => {
      if (!showProductResults || filteredProducts.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedProductIndex((prev) =>
            prev < filteredProducts.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedProductIndex((prev) =>
            prev > 0 ? prev - 1 : filteredProducts.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (
            focusedProductIndex >= 0 &&
            focusedProductIndex < filteredProducts.length
          ) {
            selectProduct(filteredProducts[focusedProductIndex]);
          }
          break;

        case "Escape":
          setShowProductResults(false);
          setFocusedProductIndex(-1);
          break;

        default:
          break;
      }
    };

    if (productSearchRef.current) {
      productSearchRef.current.addEventListener(
        "keydown",
        handleProductKeyDown
      );
    }

    return () => {
      if (productSearchRef.current) {
        productSearchRef.current.removeEventListener(
          "keydown",
          handleProductKeyDown
        );
      }
    };
  }, [showProductResults, filteredProducts, focusedProductIndex]);

  if (!isClient || isLoading) {
    return (
      <div className="modal fade" id="orderModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">ثبت سریع سفارش</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
                <span className="ms-2">در حال بارگذاری...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal fade" id="orderModal" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-lightning-charge text-warning me-2"></i>
              ثبت سریع سفارش
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              onClick={resetForm}
            ></button>
          </div>
          <div className="modal-body">
            {/* Store Search Section */}
            <div className="mb-4">
              <label className="form-label fw-bold text-primary">
                <i className="bi bi-shop me-2"></i>
                انتخاب فروشگاه
              </label>
              <div className="position-relative">
                <input
                  ref={storeSearchRef}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="نام فروشگاه، کد فروشگاه، شماره تماس یا نام مالک را وارد کنید..."
                  value={storeSearch}
                  onChange={(e) => handleStoreSearch(e.target.value)}
                  onFocus={() => storeSearch.length >= 2 && setShowStoreResults(true)}
                />
                {selectedStore && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger position-absolute"
                    style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
                    onClick={() => {
                      setSelectedStore(null);
                      setStoreSearch("");
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}

                {showStoreResults && filteredStores.length > 0 && (
                  <div className="search-results dropdown-menu show w-100">
                    {filteredStores.slice(0, 5).map((store, index) => (
                      <button
                        key={store.id}
                        type="button"
                        className={`dropdown-item ${
                          index === focusedStoreIndex ? "active" : ""
                        }`}
                        onClick={() => selectStore(store)}
                        onMouseEnter={() => setFocusedStoreIndex(index)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{store.name}</div>
                            <small className="text-muted">
                              کد: {store.code} | {store.ownerName} - {store.phone}
                            </small>
                          </div>
                          <span className={`badge ${getStoreTypeBadge(store.storeType)}`}>
                            {getStoreTypeText(store.storeType)}
                          </span>
                        </div>
                      </button>
                    ))}
                    <div className="dropdown-item text-center small text-muted py-2">
                      <i className="bi bi-arrow-up-down me-1"></i>
                      با کلیدهای بالا/پایین حرکت کنید - Enter برای انتخاب
                    </div>
                  </div>
                )}
              </div>

              {selectedStore && (
                <div className="mt-2 p-3 bg-light rounded">
                  <div className="row">
                    <div className="col-6">
                      <strong>نام:</strong> {selectedStore.name}
                    </div>
                    <div className="col-6">
                      <strong>کد:</strong>{" "}
                      <span className="badge bg-secondary">{selectedStore.code}</span>
                    </div>
                    <div className="col-6">
                      <strong>مالک:</strong> {selectedStore.ownerName}
                    </div>
                    <div className="col-6">
                      <strong>تلفن:</strong> {selectedStore.phone}
                    </div>
                    <div className="col-6">
                      <strong>نوع:</strong> {getStoreTypeText(selectedStore.storeType)}
                    </div>
                    <div className="col-12 mt-1">
                      <strong>آدرس:</strong> {selectedStore.address}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Search Section */}
            <div className="mb-4">
              <label className="form-label fw-bold text-primary">
                <i className="bi bi-basket me-2"></i>
                افزودن محصول
              </label>
              <div className="position-relative">
                <input
                  ref={productSearchRef}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="نام محصول یا کد کالا را وارد کنید..."
                  value={productSearch}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  onFocus={() => productSearch.length >= 2 && setShowProductResults(true)}
                  disabled={!selectedStore}
                />

                {showProductResults && filteredProducts.length > 0 && (
                  <div className="search-results dropdown-menu show w-100">
                    {filteredProducts.slice(0, 5).map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        className={`dropdown-item ${
                          index === focusedProductIndex ? "active" : ""
                        }`}
                        onClick={() => selectProduct(product)}
                        onMouseEnter={() => setFocusedProductIndex(index)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{product.name}</div>
                            <small className="text-muted">کد: {product.code}</small>
                            <div className="mt-1">
                              <small className="text-danger">
                                مصرف‌کننده: {product.price?.toLocaleString("fa-IR")} ریال
                              </small>
                              <small className="text-success d-block">
                                فروشگاه:{" "}
                                {calculateStorePrice(product.price)?.toLocaleString("fa-IR")} ریال
                              </small>
                            </div>
                          </div>
                          <span className="badge bg-success">موجود</span>
                        </div>
                      </button>
                    ))}
                    <div className="dropdown-item text-center small text-muted py-2">
                      <i className="bi bi-arrow-up-down me-1"></i>
                      با کلیدهای بالا/پایین حرکت کنید - Enter برای انتخاب
                    </div>
                  </div>
                )}
              </div>
              {!selectedStore && (
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  لطفاً ابتدا فروشگاه را انتخاب کنید
                </small>
              )}
            </div>

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-bold text-primary">
                  <i className="bi bi-list-check me-2"></i>
                  لیست سفارش
                  {isCalculatingPrice && (
                    <span className="badge bg-warning me-2">
                      <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-1"></i>
                      در حال محاسبه...
                    </span>
                  )}
                  {pricingCalculation.appliedPlan && !isCalculatingPrice && (
                    <span className="badge bg-success me-2">طرح: {pricingCalculation.appliedPlan.name}</span>
                  )}
                </label>

                <div className="border rounded">
                  {selectedProducts.map((product) => {
                    const itemPrice = pricingCalculation.itemPrices.find(
                      (p) => p.productCode === product.code
                    );
                    const unitPrice = itemPrice?.unitPrice || product.price;
                    const itemDiscount = itemPrice?.discountAmount || 0;
                    const totalPrice = unitPrice * product.quantity;
                    const baseStorePrice =
                      itemPrice?.storeBasePrice ||
                      calculateStorePrice(product.price);

                    return (
                      <div
                        key={product.id}
                        className="p-3 border-bottom quick-order-item"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-bold">{product.name}</div>
                            <div className="row mt-1">
                              <div className="col-12">
                                <small className="text-muted">
                                  <span className="d-block">
                                    مصرف‌کننده:{" "}
                                    <del>
                                      {product.price?.toLocaleString("fa-IR")} ریال
                                    </del>
                                  </span>
                                  <span className="d-block">
                                    پایه فروشگاه:{" "}
                                    {baseStorePrice?.toLocaleString("fa-IR")} ریال
                                  </span>
                                  {itemPrice?.appliedDiscountRate > 0 && (
                                    <span className="d-block text-success">
                                      نهایی: {unitPrice?.toLocaleString("fa-IR")} ریال (
                                      {Math.round(itemPrice.appliedDiscountRate * 100)}%
                                      تخفیف)
                                    </span>
                                  )}
                                </small>
                              </div>
                            </div>
                            <div className="mt-2">
                              {itemDiscount > 0 ? (
                                <>
                                  <span className="text-danger text-decoration-line-through me-2">
                                    {(baseStorePrice * product.quantity).toLocaleString(
                                      "fa-IR"
                                    )}{ " "}
                                    ریال
                                  </span>
                                  <span className="text-success fw-bold">
                                    {totalPrice.toLocaleString("fa-IR")} ریال
                                  </span>
                                  <small className="text-danger me-2">
                                    (تخفیف: {itemDiscount.toLocaleString("fa-IR")} ریال)
                                  </small>
                                </>
                              ) : (
                                <span className="text-success fw-bold">
                                  {totalPrice.toLocaleString("fa-IR")} ریال
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="quantity-controls d-flex align-items-center me-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  updateProductQuantity(product.id, product.quantity - 1)
                                }
                                disabled={isCalculatingPrice || product.quantity <= 1}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="mx-3 fw-bold fs-6">
                                {product.quantity}
                                {isCalculatingPrice && (
                                  <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-1 text-warning"></i>
                                )}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  updateProductQuantity(product.id, product.quantity + 1)
                                }
                                disabled={isCalculatingPrice}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={() => updateProductQuantity(product.id, 0)}
                              disabled={isCalculatingPrice}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* خلاصه قیمت‌گذاری */}
                  <div className="p-3 bg-light">
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex justify-content-between mb-2">
                          <span>جمع کل:</span>
                          <span>
                            {isCalculatingPrice ? (
                              <i className="bi bi-arrow-repeat spinner-border spinner-border-sm text-warning"></i>
                            ) : (
                              pricingCalculation.subtotal.toLocaleString("fa-IR") + " ریال"
                            )}
                          </span>
                        </div>
                        {pricingCalculation.discount > 0 && !isCalculatingPrice && (
                          <div className="d-flex justify-content-between mb-2 text-danger">
                            <span>تخفیف کل:</span>
                            <span>-{pricingCalculation.discount.toLocaleString("fa-IR")} ریال</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                          <strong className="fs-6">مبلغ قابل پرداخت:</strong>
                          <strong className="text-success fs-5">
                            {isCalculatingPrice ? (
                              <i className="bi bi-arrow-repeat spinner-border spinner-border-sm text-warning"></i>
                            ) : (
                              pricingCalculation.finalAmount.toLocaleString("fa-IR") + " ریال"
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                    {pricingCalculation.appliedPlan && !isCalculatingPrice && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <div className="bg-info text-white p-2 rounded small">
                            <i className="bi bi-tags me-1"></i>
                            <strong>طرح فعال: </strong>
                            {pricingCalculation.appliedPlan.name}
                            {pricingCalculation.appliedTier && (
                              <div className="mt-1">{pricingCalculation.appliedTier.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Details Section */}
            {selectedStore && (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-telephone me-2"></i>
                    شماره تماس
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedStore.phone || "ثبت نشده"}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-geo-alt me-2"></i>
                    آدرس
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedStore.address || "ثبت نشده"}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-pencil me-2"></i>
                    یادداشت سفارش
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="یادداشت سفارش (اختیاری)..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* اطلاعات اعتباری فروشگاه */}
                {selectedStore.creditEnabled && (
                  <div className="mb-3">
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-credit-card me-2 fs-5"></i>
                        <div>
                          <strong>سیستم اعتباری فعال</strong>
                          <div className="small mt-1">
                            {selectedStore.creditLimit && (
                              <span className="me-3">سقف اعتبار: {selectedStore.creditLimit.toLocaleString("fa-IR")} ریال</span>
                            )}
                            {selectedStore.creditDays && (
                              <span className="me-3">مهلت پرداخت: {selectedStore.creditDays} روز</span>
                            )}
                            <span>نوع: {getCreditTypeText(selectedStore.creditType)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={resetForm}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !selectedStore ||
                selectedProducts.length === 0 ||
                isCalculatingPrice
              }
              onClick={handleSubmit}
            >
              {isCalculatingPrice ? (
                <>
                  <i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>
                  در حال محاسبه...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  ثبت سفارش (
                  {pricingCalculation.finalAmount.toLocaleString("fa-IR")} ریال)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}