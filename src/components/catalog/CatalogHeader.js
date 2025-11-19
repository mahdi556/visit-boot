// 📂 src/components/catalog/CatalogHeader.js
export default function CatalogHeader({
  selectedStore,
  tempOrderMode,
  stores,
  filteredStores,
  storeSearch,
  showStoreResults,
  searchTerm,
  selectedCategory,
  categories,
  cart,
  onStoreSelect,
  onStoreSearchChange,
  onShowStoreResults,
  onTempOrderModeChange,
  onSearchTermChange,
  onCategoryChange,
  onShowCart,
  onBack
}) {
  return (
    <div className="sticky-top bg-white shadow-sm z-3">
      <div className="container-fluid py-2">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <button className="btn btn-outline-secondary btn-sm me-3" onClick={onBack}>
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
              <StoreSelector
                selectedStore={selectedStore}
                stores={stores}
                filteredStores={filteredStores}
                storeSearch={storeSearch}
                showStoreResults={showStoreResults}
                onStoreSelect={onStoreSelect}
                onStoreSearchChange={onStoreSearchChange}
                onShowStoreResults={onShowStoreResults}
                onTempOrderModeChange={onTempOrderModeChange}
              />

              <button
                className="btn btn-primary btn-sm position-relative"
                onClick={onShowCart}
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
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
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
  );
}

function StoreSelector({
  selectedStore,
  stores,
  filteredStores,
  storeSearch,
  showStoreResults,
  onStoreSelect,
  onStoreSearchChange,
  onShowStoreResults,
  onTempOrderModeChange
}) {
  return (
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
              onStoreSearchChange(e.target.value);
              onShowStoreResults(true);
            }}
            onFocus={() => onShowStoreResults(true)}
          />
        </div>

        {showStoreResults && storeSearch.length >= 2 && (
          <div className="mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filteredStores.slice(0, 5).map((store) => (
              <button
                key={store.id}
                className="dropdown-item text-start small"
                onClick={() => {
                  onStoreSelect(store);
                  onStoreSearchChange("");
                  onShowStoreResults(false);
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
              onTempOrderModeChange(true);
              onStoreSelect(null);
              onShowStoreResults(false);
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
  );
}