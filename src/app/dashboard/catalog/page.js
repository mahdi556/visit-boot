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
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // اضافه شده
  const [selectedSalesRep, setSelectedSalesRep] = useState(null); // اضافه شده

  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser(); // اول کاربر جاری را بگیر
    fetchProducts();
    fetchAllStores();
  }, []);

  // تابع جدید برای دریافت اطلاعات کاربر جاری
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);

        // اگر کاربر ویزیتور است، salesRepId را تنظیم کن
        if (userData.salesRepId) {
          setSelectedSalesRep(userData.salesRepId);
          console.log("👤 Sales rep auto-selected:", userData.salesRepId);
        }
      }
    } catch (error) {
      console.error("خطا در دریافت اطلاعات کاربر:", error);
    }
  };
  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);
  useEffect(() => {
    calculateCartTotal();
  }, [cart]); // هر بار که cart تغییر کرد، مجموع محاسبه شود
  useEffect(() => {
    // جستجوی real-time در فروشگاهها
    if (storeSearch.trim()) {
      const filtered = stores.filter(
        (store) =>
          store.name?.toLowerCase().includes(storeSearch.toLowerCase()) ||
          store.phone?.includes(storeSearch) ||
          store.ownerName?.toLowerCase().includes(storeSearch.toLowerCase()) ||
          store.code?.toLowerCase().includes(storeSearch.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores.slice(0, 50)); // نمایش 50 فروشگاه اول در حالت عادی
    }
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

  // تابع جدید برای دریافت تمام فروشگاهها
  const fetchAllStores = async () => {
    try {
      setIsLoadingStores(true);
      let allStores = [];
      let page = 1;
      let hasMore = true;

      // دریافت تمام صفحات فروشگاهها
      while (hasMore) {
        const response = await fetch(`/api/stores?page=${page}&limit=100`); // افزایش limit به 100
        if (response.ok) {
          const data = await response.json();
          if (data.stores && data.stores.length > 0) {
            allStores = [...allStores, ...data.stores];
            hasMore = data.pagination.hasNext;
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
          console.error("خطا در دریافت فروشگاه‌ها");
        }
      }

      console.log(`✅ تعداد کل فروشگاه‌ها دریافت شده: ${allStores.length}`);
      setStores(allStores);
      setFilteredStores(allStores.slice(0, 50)); // نمایش 50 فروشگاه اول
    } catch (error) {
      console.error("خطا در دریافت فروشگاه‌ها:", error);
      setStores([]);
      setFilteredStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  };

  // تابع جدید برای جستجوی پیشرفته در فروشگاهها
  const searchStores = async (searchQuery) => {
    if (!searchQuery.trim()) {
      // اگر جستجو خالی است، 50 فروشگاه اول را نمایش بده
      setFilteredStores(stores.slice(0, 50));
      return;
    }

    try {
      setIsLoadingStores(true);

      // جستجو در فروشگاههای موجود
      const localFiltered = stores.filter(
        (store) =>
          store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.phone?.includes(searchQuery) ||
          store.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // اگر در فروشگاههای موجود پیدا نشد، از API جستجو کنیم
      if (localFiltered.length === 0) {
        const response = await fetch(
          `/api/stores?search=${encodeURIComponent(searchQuery)}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setFilteredStores(data.stores || []);
        }
      } else {
        setFilteredStores(localFiltered);
      }
    } catch (error) {
      console.error("خطا در جستجوی فروشگاه‌ها:", error);
      // در صورت خطا، از جستجوی محلی استفاده کن
      const localFiltered = stores.filter(
        (store) =>
          store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.phone?.includes(searchQuery) ||
          store.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStores(localFiltered);
    } finally {
      setIsLoadingStores(false);
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
      setIsCalculatingCart(false); // ✅ اصلاح شد
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
      const orderStatus = deliveryStatus;
      const orderNotes = tempOrderMode
        ? "فاکتور موقت - انتساب خودکار به فروشگاه 7000"
        : "";

      // محاسبه مجموع از روی cart فعلی (به جای استفاده از cartTotal state)
      const currentCartTotal = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const currentTotalDiscount = cart.reduce(
        (sum, item) => sum + item.discountAmount,
        0
      );

      console.log("💰 Order totals:", {
        cartTotalState: cartTotal,
        calculatedTotal: currentCartTotal,
        cartItems: cart,
      });

      const orderData = {
        storeCode: storeCode,
        userId: 1,
        salesRepId: selectedSalesRep,
        items: cart.map((item) => ({
          productCode: item.product.code,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        totalAmount: currentCartTotal, // استفاده از مقدار محاسبه شده
        status: orderStatus,
        notes: orderNotes,
        discountAmount: currentTotalDiscount, // استفاده از مقدار محاسبه شده
        paymentMethod: paymentMethod,
        deliveryDate: deliveryDate,
        ...(paymentMethod === "CHEQUE" && {
          chequeDetails: {
            chequeNumber: chequeDetails.chequeNumber,
            dueDate: chequeDetails.dueDate,
            bankName: chequeDetails.bankName,
          },
        }),
        ...(paymentMethod === "CASH" &&
          deliveryStatus === "DELIVERED" && {
            cashPaymentDetails: cashPaymentDetails,
          }),
        ...(paymentMethod === "CREDIT" &&
          selectedStore?.creditDays && {
            creditDays: selectedStore.creditDays,
          }),
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

        let successMessage = `فاکتور با شماره ${result.orderNumber} ثبت شد.`;
        if (tempOrderMode) {
          successMessage += ` (فاکتور موقت - ارسال به فروشگاه 7000)`;
        } else {
          successMessage += ` (فروشگاه: ${selectedStore.name})`;
        }

        // اضافه کردن اطلاعات روش پرداخت
        const paymentMethodText = {
          CASH: "نقدی",
          CREDIT: "اعتباری",
          CHEQUE: "چکی",
        }[paymentMethod];

        successMessage += ` - روش پرداخت: ${paymentMethodText}`;
        successMessage += ` - مبلغ: ${currentCartTotal.toLocaleString(
          "fa-IR"
        )} ریال`;

        if (paymentMethod === "CHEQUE") {
          successMessage += ` - شماره چک: ${chequeDetails.chequeNumber}`;
        }

        // اضافه کردن تاریخ تحویل
        successMessage += ` - تاریخ تحویل: ${toPersianDate(deliveryDate)}`;

        alert(successMessage);

        // ریست فرم
        setCart([]);
        setCartTotal(0);
        setShowCartModal(false);
        setTempOrderMode(false);
        setPaymentMethod("CASH");
        setDeliveryStatus("PENDING");
        setCashPaymentDetails({
          method: "CASH",
          cardNumber: "",
          posDevice: "",
        });
        setChequeDetails({
          chequeNumber: "",
          dueDate: "",
          bankName: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ثبت فاکتور");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("خطا در ثبت فاکتور: " + error.message);
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

  // تابع جدید برای مدیریت تغییر جستجوی فروشگاه
  const handleStoreSearchChange = (value) => {
    setStoreSearch(value);
    if (value.trim()) {
      searchStores(value);
    } else {
      setFilteredStores(stores.slice(0, 50));
    }
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
        isLoadingStores={isLoadingStores}
        onStoreSelect={setSelectedStore}
        onStoreSearchChange={handleStoreSearchChange}
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
          selectedSalesRep={selectedSalesRep} // ارسال ویزیتور پیش‌فرض
          onSalesRepChange={setSelectedSalesRep} // امکان تغییر ویزیتور
        />
      )}
    </div>
  );
}
