// 📂 src/app/dashboard/catalog/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [selectedProductForPricing, setSelectedProductForPricing] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isCalculatingCart, setIsCalculatingCart] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeSearch, setStoreSearch] = useState("");
  const [showStoreResults, setShowStoreResults] = useState(false);
  const [filteredStores, setFilteredStores] = useState([]);
  const [tempOrderMode, setTempOrderMode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  useEffect(() => {
    const filtered = stores.filter(
      (store) =>
        store.name?.toLowerCase().includes(storeSearch.toLowerCase()) ||
        store.phone?.includes(storeSearch) ||
        store.ownerName?.toLowerCase().includes(storeSearch.toLowerCase()) ||
        store.code?.toLowerCase().includes(storeSearch.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [storeSearch, stores]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);

        const uniqueCategories = [
          ...new Set(data.map((product) => product.category).filter(Boolean)),
        ];
        setCategories(["همه", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("خطا در دریافت محصولات:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      if (response.ok) {
        const data = await response.json();
        setStores(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("خطا در دریافت فروشگاه‌ها:", error);
      setStores([]);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "همه") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code?.includes(searchTerm)
      );
    }

    setFilteredProducts(filtered);
  };

  const getProductPricingInfo = (product) => {
    const consumerPrice = product.price || 0;
    const storeBasePrice = Math.round(consumerPrice * (1 - 0.123));

    return {
      consumerPrice,
      storeBasePrice,
      discount: consumerPrice - storeBasePrice,
      discountPercentage: (
        ((consumerPrice - storeBasePrice) / consumerPrice) *
        100
      ).toFixed(1),
    };
  };

  const addToCart = async (product, calculatedPrice) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
              unitPrice: calculatedPrice.unitPrice,
              totalPrice: calculatedPrice.totalPrice + item.totalPrice,
              discountAmount: calculatedPrice.discountAmount + item.discountAmount,
            }
          : item
      );
      setCart(updatedCart);
    } else {
      const newItem = {
        product: product,
        quantity: quantity,
        unitPrice: calculatedPrice.unitPrice,
        totalPrice: calculatedPrice.totalPrice,
        discountAmount: calculatedPrice.discountAmount,
        appliedDiscountRate: calculatedPrice.appliedDiscountRate,
      };
      setCart([...cart, newItem]);
    }

    setSelectedProductForOrder(null);
    setQuantity(1);
    calculateCartTotal();
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    calculateCartTotal();
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = cart.find((item) => item.product.id === productId)?.product;
    if (!product) return;

    setIsCalculatingCart(true);
    try {
      const cartItems = [
        {
          product: {
            code: product.code,
            price: product.price,
          },
          quantity: newQuantity,
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
        const productPriceInfo = data.itemPrices.find(
          (item) => item.productCode === product.code
        );

        if (productPriceInfo) {
          const updatedCart = cart.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  unitPrice: productPriceInfo.unitPrice,
                  totalPrice: productPriceInfo.totalPrice,
                  discountAmount: productPriceInfo.discountAmount || 0,
                  appliedDiscountRate: productPriceInfo.appliedDiscountRate || 0,
                }
              : item
          );
          setCart(updatedCart);
          calculateCartTotal();
        }
      }
    } catch (error) {
      console.error("خطا در محاسبه قیمت سبد:", error);
    } finally {
      setIsCalculatingCart(false);
    }
  };

  const calculateCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    setCartTotal(total);
  };

  const submitFinalOrder = async () => {
    if (!selectedStore && !tempOrderMode) {
      alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
      return;
    }

    if (cart.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }

    try {
      const storeCode = tempOrderMode ? '7000' : selectedStore.code;
      const orderStatus = 'PENDING';
      const orderNotes = tempOrderMode 
        ? 'فاکتور موقت - انتساب خودکار به فروشگاه 7000' 
        : '';

      const orderData = {
        storeCode: storeCode,
        userId: 1,
        items: cart.map((item) => ({
          productCode: item.product.code,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        totalAmount: cartTotal,
        status: orderStatus,
        notes: orderNotes,
        discountAmount: cart.reduce((sum, item) => sum + item.discountAmount, 0),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();

        if (tempOrderMode) {
          alert(`فاکتور موقت با شماره ${result.orderNumber} ثبت شد و به فروشگاه 7000 ارسال شد.`);
        } else {
          alert(`فاکتور نهایی با شماره ${result.orderNumber} برای فروشگاه ${selectedStore.name} ثبت شد.`);
        }

        setCart([]);
        setCartTotal(0);
        setShowCartModal(false);
        setTempOrderMode(false);
      } else {
        throw new Error("خطا در ثبت فاکتور");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("خطا در ثبت فاکتور");
    }
  };

  const handleAddToOrder = (product) => {
    if (!selectedStore && !tempOrderMode) {
      alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
      return;
    }
    setSelectedProductForOrder(product);
    setQuantity(1);
  };

  const handleShowPricing = (product) => {
    setSelectedProductForPricing(product);
    setShowPricingModal(true);
  };

  const handleAddToCart = async (product, calculatedPrice) => {
    await addToCart(product, calculatedPrice);
    alert(`${quantity} عدد ${product.name} به سبد خرید اضافه شد`);
  };

  if (isLoading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <div className="h4">در حال بارگذاری محصولات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="sticky-top bg-white shadow-sm z-3">
        <div className="container-fluid py-2">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => router.push("/dashboard")}>
                  <i className="bi bi-arrow-right"></i>
                </button>
                <div>
                  <h1 className="h5 mb-0 fw-bold text-dark">
                    <i className="bi bi-grid-3x3-gap text-primary me-2"></i>
                    کاتالوگ محصولات
                  </h1>
                  {selectedStore && (
                    <small className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      فروشگاه: {selectedStore.name} ({selectedStore.code})
                    </small>
                  )}
                  {tempOrderMode && (
                    <small className="text-info">
                      <i className="bi bi-shop me-1"></i>
                      فاکتور موقت - فروشگاه 7000
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex gap-2 align-items-center">
                <div className="dropdown">
                  <button className="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-shop me-1"></i>
                    {selectedStore ? selectedStore.name : "انتخاب فروشگاه"}
                  </button>
                  <div className="dropdown-menu dropdown-menu-end p-3" style={{ width: "400px" }}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">جستجوی فروشگاه</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="نام، کد، تلفن یا مالک..."
                        value={storeSearch}
                        onChange={(e) => {
                          setStoreSearch(e.target.value);
                          setShowStoreResults(true);
                        }}
                        onFocus={() => setShowStoreResults(true)}
                      />
                    </div>

                    {showStoreResults && storeSearch.length >= 2 && (
                      <div className="mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {filteredStores.slice(0, 5).map((store) => (
                          <button
                            key={store.id}
                            className="dropdown-item text-start small"
                            onClick={() => {
                              setSelectedStore(store);
                              setStoreSearch("");
                              setShowStoreResults(false);
                              setTempOrderMode(false);
                            }}
                          >
                            <div className="fw-bold">{store.name}</div>
                            <small className="text-muted">
                              کد: {store.code} | {store.ownerName} - {store.phone}
                            </small>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="border-top pt-3">
                      <button
                        className="btn btn-warning btn-sm w-100"
                        onClick={() => {
                          setTempOrderMode(true);
                          setSelectedStore(null);
                          setShowStoreResults(false);
                        }}
                      >
                        <i className="bi bi-clock me-1"></i>
                        ثبت فاکتور موقت (فروشگاه 7000)
                      </button>
                      <small className="text-muted d-block mt-2">
                        فاکتور موقت به طور خودکار به فروشگاه 7000 ارسال می‌شود
                      </small>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm position-relative"
                  onClick={() => setShowCartModal(true)}
                  disabled={cart.length === 0}
                >
                  <i className="bi bi-cart-plus me-1"></i>
                  سبد خرید
                  {cart.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cart.length}
                      <span className="visually-hidden">تعداد محصولات در سبد</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="row mt-2 g-2">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="جستجوی محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-0">
        {filteredProducts.map((product, index) => (
          <div key={product.id} className="product-section" style={{ marginBottom: "4rem" }}>
            <FullScreenCatalogProduct
              product={product}
              pricing={getProductPricingInfo(product)}
              onAddToOrder={handleAddToOrder}
              onShowPricing={handleShowPricing}
              productNumber={index + 1}
              totalProducts={filteredProducts.length}
              selectedStore={selectedStore}
              tempOrderMode={tempOrderMode}
            />
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="text-center">
              <i className="bi bi-inboxes display-1 text-muted mb-3"></i>
              <h5 className="text-muted">محصولی یافت نشد</h5>
            </div>
          </div>
        )}
      </div>

      {selectedProductForOrder && (
        <AddToOrderModal
          product={selectedProductForOrder}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onConfirm={(calculatedPrice) => handleAddToCart(selectedProductForOrder, calculatedPrice)}
          onCancel={() => setSelectedProductForOrder(null)}
          selectedStore={selectedStore}
          tempOrderMode={tempOrderMode}
        />
      )}

      {showPricingModal && selectedProductForPricing && (
        <PricingPlanModal
          product={selectedProductForPricing}
          onClose={() => {
            setShowPricingModal(false);
            setSelectedProductForPricing(null);
          }}
          onAddToOrder={() => {
            setShowPricingModal(false);
            setSelectedProductForPricing(null);
            handleAddToOrder(selectedProductForPricing);
          }}
        />
      )}

      {showCartModal && (
        <CartModal
          cart={cart}
          cartTotal={cartTotal}
          isCalculatingCart={isCalculatingCart}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onSubmitOrder={submitFinalOrder}
          onClose={() => setShowCartModal(false)}
          selectedStore={selectedStore}
          tempOrderMode={tempOrderMode}
        />
      )}
      
      <style jsx>{`
        .product-section {
          height: 100vh;
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
}

function FullScreenCatalogProduct({
  product,
  pricing,
  onAddToOrder,
  onShowPricing,
  productNumber,
  totalProducts,
  selectedStore,
  tempOrderMode,
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

        <div className="position-absolute top-0 start-0 mt-5 m-2 m-md-3">
          <div className="d-flex flex-column gap-3 gap-md-4">
            <div className="position-relative">
              <button
                className="btn btn-info glass-btn text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowPricing(product);
                }}
                title="طرح‌های تخفیف"
                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
              >
                <i className="bi bi-percent fs-6"></i>
              </button>
            </div>

            <div className="position-relative">
              <button
                className="btn btn-success glass-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!selectedStore && !tempOrderMode) {
                    alert("لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید");
                    return;
                  }
                  onAddToOrder(product);
                }}
                title="افزودن به سفارش"
                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
              >
                <i className="bi bi-cart-plus fs-6"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 w-75">
          <div className="glass-card px-4 py-3">
            <div className="d-flex align-items-center justify-content-around" style={{ fontSize: "0.9rem" }}>
              <div className="text-center">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>مصرف کننده</div>
                <div className="text-decoration-line-through" style={{ color: "#6b7280", fontSize: "0.8rem", fontWeight: "500" }}>
                  {pricing.consumerPrice.toLocaleString("fa-IR")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>فروشگاه</div>
                <div className="fw-bold" style={{ color: "#d97706", fontSize: "1rem", fontWeight: "bold" }}>
                  {pricing.storeBasePrice.toLocaleString("fa-IR")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!imageLoaded && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="spinner-border text-primary" style={{ width: "2rem", height: "2rem" }}>
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .glass-btn {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
        }

        .glass-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .btn-info.glass-btn {
          background: rgba(14, 165, 233, 0.9);
          border: 1px solid rgba(14, 165, 233, 0.5);
        }

        .btn-info.glass-btn:hover {
          background: rgba(14, 165, 233, 1);
        }

        .btn-success.glass-btn {
          background: rgba(34, 197, 94, 0.9);
          border: 1px solid rgba(34, 197, 94, 0.5);
        }

        .btn-success.glass-btn:hover {
          background: rgba(34, 197, 94, 1);
        }

        @media (max-width: 768px) {
          .glass-card {
            border-radius: 0 0 8px 8px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
          }

          .glass-btn {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </div>
  );
}

function AddToOrderModal({
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
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-cart-plus text-success me-2"></i>
              افزودن به سفارش
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body text-center">
            <h6 className="mb-3">{product.name}</h6>

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

            {pricingData?.appliedPlan && !isLoading && (
              <div className="alert alert-info mt-3 p-2 small">
                <i className="bi bi-tags me-1"></i>
                <strong>طرح فعال: </strong>
                {pricingData.appliedPlan.name}
                {pricingData.appliedTier && (
                  <div className="mt-1">{pricingData.appliedTier.description}</div>
                )}
              </div>
            )}

            {pricingData?.groupDiscounts && pricingData.groupDiscounts.length > 0 && !isLoading && (
              <div className="alert alert-success mt-3 p-2 small">
                <i className="bi bi-collection me-1"></i>
                <strong>تخفیف گروهی: </strong>
                {pricingData.groupDiscounts[0].groupName}
                <div className="mt-1">{pricingData.groupDiscounts[0].description}</div>
              </div>
            )}
          </div>
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
        </div>
      </div>
    </div>
  );
}

function PricingPlanModal({ product, onClose, onAddToOrder }) {
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
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
                <div className="mt-2">در حال دریافت اطلاعات تخفیف...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : activeGroup || displayTiers.length > 0 ? (
              <div className="row">
                <div className="col-md-6">
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
                            <div
                              key={tier.id || index}
                              className={`tier-item p-3 mb-3 rounded border ${
                                activeGroup?.appliedTier?.minQuantity === tier.minQuantity
                                  ? "border-success bg-success bg-opacity-10"
                                  : "border-light bg-light"
                              }`}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-primary me-2 fs-6">{tier.minQuantity}+</span>
                                  <span className="fw-medium">عدد از گروه</span>
                                </div>
                                <span
                                  className={`badge ${
                                    activeGroup?.appliedTier?.minQuantity === tier.minQuantity
                                      ? "bg-success"
                                      : "bg-secondary"
                                  } fs-6`}
                                >
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

                              {activeGroup?.appliedTier?.minQuantity === tier.minQuantity && (
                                <div className="text-center mt-2">
                                  <span className="badge bg-warning text-dark">
                                    <i className="bi bi-star-fill me-1"></i>
                                    تخفیف فعال برای ۱۰ عدد
                                  </span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted py-4">
                            <i className="bi bi-exclamation-triangle display-6 d-block mb-2"></i>
                            <p>هیچ پله تخفیفی تعریف نشده است</p>
                          </div>
                        )}
                      </div>

                      {displayTiers.length > 0 && (
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
                                )}
                                %
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
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
                          relatedProducts.map((relatedProduct, index) => (
                            <div
                              key={relatedProduct.id}
                              className="related-product-item p-3 mb-3 rounded border bg-light"
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold text-dark mb-1">{relatedProduct.name}</h6>
                                  <div className="text-muted small">
                                    کد: {relatedProduct.code}
                                    {relatedProduct.category && (
                                      <span className="me-2"> | دسته: {relatedProduct.category}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="badge bg-secondary">
                                  {relatedProduct.weight
                                    ? `${relatedProduct.weight} ${relatedProduct.unit}`
                                    : "نامشخص"}
                                </span>
                              </div>

                              <div className="row text-center mt-2 pt-2 border-top">
                                <div className="col-6 border-end">
                                  <div className="text-muted small">مصرف‌کننده</div>
                                  <div className="text-decoration-line-through text-danger small">
                                    {relatedProduct.price?.toLocaleString("fa-IR")}
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-muted small">فروشگاه</div>
                                  <div className="text-success fw-bold">
                                    {Math.round(relatedProduct.price * (1 - 0.123)).toLocaleString("fa-IR")}
                                  </div>
                                </div>
                              </div>

                              <div className="text-center mt-2">
                                <span className="badge bg-warning text-dark small">تخفیف پایه: ۱۲.۳٪</span>
                              </div>
                            </div>
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
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-percent display-1 text-muted mb-3"></i>
                <h5 className="text-muted">تخفیف گروهی فعال نیست</h5>
                <p className="text-muted">این محصول تحت پوشش هیچ گروه تخفیفی قرار ندارد</p>
              </div>
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

function CartModal({
  cart,
  cartTotal,
  isCalculatingCart,
  onRemoveItem,
  onUpdateQuantity,
  onSubmitOrder,
  onClose,
  selectedStore,
  tempOrderMode,
}) {
  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-cart-check text-success me-2"></i>
              سبد خرید
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4 p-3 rounded bg-light">
              {selectedStore ? (
                <div className="row">
                  <div className="col-md-6">
                    <strong className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      فروشگاه: {selectedStore.name}
                    </strong>
                    <div className="text-muted small">
                      کد: {selectedStore.code} | تلفن: {selectedStore.phone}
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <div className="text-muted">مالک: {selectedStore.ownerName}</div>
                    <div className="text-muted small">آدرس: {selectedStore.address}</div>
                  </div>
                </div>
              ) : tempOrderMode ? (
                <div className="text-info">
                  <i className="bi bi-shop me-1"></i>
                  <strong>فاکتور موقت - فروشگاه 7000</strong>
                  <div className="text-muted small">
                    این فاکتور به طور خودکار به فروشگاه با کد 7000 ارسال می‌شود
                  </div>
                </div>
              ) : (
                <div className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  لطفاً ابتدا فروشگاه را انتخاب کنید
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                <h5 className="text-muted">سبد خرید خالی است</h5>
                <p className="text-muted">محصولاتی به سبد خرید اضافه کنید</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>محصول</th>
                      <th className="text-center">تعداد</th>
                      <th className="text-center">قیمت واحد</th>
                      <th className="text-center">تخفیف</th>
                      <th className="text-center">جمع</th>
                      <th className="text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={`/images/products/${item.product.code}.jpg`}
                              className="rounded me-3"
                              alt={item.product.name}
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.src = "/images/default-product.jpg";
                              }}
                            />
                            <div>
                              <div className="fw-bold">{item.product.name}</div>
                              <small className="text-muted">کد: {item.product.code}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              disabled={isCalculatingCart}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="mx-3 fw-bold">
                              {item.quantity}
                              {isCalculatingCart && (
                                <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-1 text-warning"></i>
                              )}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              disabled={isCalculatingCart}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="fw-bold text-success">
                            {item.unitPrice.toLocaleString("fa-IR")}
                          </div>
                          <small className="text-muted">ریال</small>
                        </td>
                        <td className="text-center">
                          {item.appliedDiscountRate > 0 ? (
                            <span className="badge bg-success">
                              {Math.round(item.appliedDiscountRate * 100)}%
                            </span>
                          ) : (
                            <span className="badge bg-secondary">بدون تخفیف</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="fw-bold">{item.totalPrice.toLocaleString("fa-IR")}</div>
                          <small className="text-muted">ریال</small>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onRemoveItem(item.product.id)}
                            disabled={isCalculatingCart}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cart.length > 0 && (
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="bg-light rounded p-3">
                    <h6 className="fw-bold mb-3">خلاصه سفارش</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>تعداد محصولات:</span>
                      <span className="fw-bold">{cart.length} محصول</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>تعداد کل اقلام:</span>
                      <span className="fw-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} عدد
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>تخفیف کل:</span>
                      <span className="fw-bold">
                        -{cart.reduce((sum, item) => sum + item.discountAmount, 0).toLocaleString("fa-IR")} ریال
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <strong className="fs-5">مبلغ قابل پرداخت:</strong>
                      <strong className="text-success fs-4">
                        {cartTotal.toLocaleString("fa-IR")} ریال
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-warning bg-opacity-10 rounded p-3 h-100">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      راهنمای ثبت فاکتور
                    </h6>
                    <ul className="small">
                      <li>پس از اطمینان از صحت اطلاعات، فاکتور نهایی را ثبت کنید</li>
                      <li>فاکتور پس از ثبت، قابل ویرایش نیست</li>
                      <li>فاکتورهای موقت به فروشگاه 7000 ارسال می‌شوند</li>
                      <li>تخفیف‌ها به صورت خودکار محاسبه شده‌اند</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>
              بستن
            </button>
            {cart.length > 0 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={onSubmitOrder}
                disabled={(!selectedStore && !tempOrderMode) || isCalculatingCart}
              >
                {isCalculatingCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    در حال محاسبه...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {tempOrderMode ? "ثبت فاکتور موقت" : "ثبت فاکتور نهایی"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}