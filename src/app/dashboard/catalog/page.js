// 📂 src/app/dashboard/catalog/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import ProductGrid from "@/components/catalog/ProductGrid";
import AddToOrderModal from "@/components/catalog/AddToOrderModal";
import PricingPlanModal from "@/components/catalog/PricingPlanModal";
import CartModal from "@/components/catalog/CartModal";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [selectedProductForPricing, setSelectedProductForPricing] =
    useState(null);
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
              discountAmount:
                calculatedPrice.discountAmount + item.discountAmount,
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
                  appliedDiscountRate:
                    productPriceInfo.appliedDiscountRate || 0,
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
      alert(
        "لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید"
      );
      return;
    }

    if (cart.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }

    try {
      const storeCode = tempOrderMode ? "7000" : selectedStore.code;
      const orderStatus = "PENDING";
      const orderNotes = tempOrderMode
        ? "فاکتور موقت - انتساب خودکار به فروشگاه 7000"
        : "";

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
        discountAmount: cart.reduce(
          (sum, item) => sum + item.discountAmount,
          0
        ),
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
          alert(
            `فاکتور موقت با شماره ${result.orderNumber} ثبت شد و به فروشگاه 7000 ارسال شد.`
          );
        } else {
          alert(
            `فاکتور نهایی با شماره ${result.orderNumber} برای فروشگاه ${selectedStore.name} ثبت شد.`
          );
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
      alert(
        "لطفاً ابتدا فروشگاه را انتخاب کنید یا حالت فاکتور موقت را فعال نمایید"
      );
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
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <div className="h4">در حال بارگذاری محصولات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <CatalogHeader
        selectedStore={selectedStore}
        tempOrderMode={tempOrderMode}
        stores={stores}
        filteredStores={filteredStores}
        storeSearch={storeSearch}
        showStoreResults={showStoreResults}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        cart={cart}
        onStoreSelect={setSelectedStore}
        onStoreSearchChange={setStoreSearch}
        onShowStoreResults={setShowStoreResults}
        onTempOrderModeChange={setTempOrderMode}
        onSearchTermChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onShowCart={() => setShowCartModal(true)}
        onBack={() => router.push("/dashboard")}
      />

      <ProductGrid
        products={filteredProducts}
        getProductPricingInfo={getProductPricingInfo}
        onAddToOrder={handleAddToOrder}
        onShowPricing={handleShowPricing}
        selectedStore={selectedStore}
        tempOrderMode={tempOrderMode}
      />

      {selectedProductForOrder && (
        <AddToOrderModal
          product={selectedProductForOrder}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onConfirm={(calculatedPrice) =>
            handleAddToCart(selectedProductForOrder, calculatedPrice)
          }
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
    </div>
  );
}
