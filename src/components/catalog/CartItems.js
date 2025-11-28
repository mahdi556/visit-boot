function CartItem({ item, isCalculatingCart, onRemoveItem, onUpdateQuantity }) {
  return (
    <tr style={{ fontSize: "1rem" }}>
      <td style={{ padding: "1.25rem" }}>
        <div className="d-flex align-items-center">
          <img
            src={`/images/products/${item.product.code}.jpg`}
            className="rounded me-4"
            alt={item.product.name}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              border: "2px solid #dee2e6",
            }}
            onError={(e) => {
              e.target.src = "/images/default-product.jpg";
            }}
          />
          <div>
            <div className="fw-bold fs-5 mb-1">{item.product.name}</div>
            <div className="text-muted fs-6">کد: {item.product.code}</div>
            <div className="text-muted fs-6">دسته: {item.product.category}</div>
          </div>
        </div>
      </td>
      <td className="text-center align-middle" style={{ padding: "1.25rem" }}>
        <QuantityControl
          item={item}
          isCalculatingCart={isCalculatingCart}
          onUpdateQuantity={onUpdateQuantity}
        />
      </td>
      <td className="text-center align-middle" style={{ padding: "1.25rem" }}>
        <div className="fw-bold text-success fs-5">
          {item.unitPrice.toLocaleString("fa-IR")}
        </div>
        <small className="text-muted fs-6">ریال</small>
      </td>
      <td className="text-center align-middle" style={{ padding: "1.25rem" }}>
        {item.appliedDiscountRate > 0 ? (
          <span className="badge bg-success fs-6 p-2">
            {Math.round(item.appliedDiscountRate * 100)}%
          </span>
        ) : (
          <span className="badge bg-secondary fs-6 p-2">بدون تخفیف</span>
        )}
      </td>
      <td className="text-center align-middle" style={{ padding: "1.25rem" }}>
        <div className="fw-bold fs-5">
          {item.totalPrice.toLocaleString("fa-IR")}
        </div>
        <small className="text-muted fs-6">ریال</small>
      </td>
      <td className="text-center align-middle" style={{ padding: "1.25rem" }}>
        <button
          type="button"
          className="btn btn-outline-danger btn-lg"
          onClick={() => onRemoveItem(item.product.id)}
          disabled={isCalculatingCart}
          style={{ width: "50px", height: "50px" }}
        >
          <i className="bi bi-trash fs-6"></i>
        </button>
      </td>
    </tr>
  );
}

function QuantityControl({ item, isCalculatingCart, onUpdateQuantity }) {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <button
        type="button"
        className="btn btn-outline-secondary btn-lg"
        style={{ width: "50px", height: "50px" }}
        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
        disabled={isCalculatingCart || item.quantity <= 1}
      >
        <i className="bi bi-dash fs-5"></i>
      </button>
      <span className="mx-4 fw-bold fs-3" style={{ minWidth: "60px" }}>
        {item.quantity}
        {isCalculatingCart && (
          <i className="bi bi-arrow-repeat spinner-border spinner-border-sm ms-2 text-warning fs-6"></i>
        )}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-lg"
        style={{ width: "50px", height: "50px" }}
        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        disabled={isCalculatingCart}
      >
        <i className="bi bi-plus fs-5"></i>
      </button>
    </div>
  );
}

export default function CartItems({
  cart,
  isCalculatingCart,
  onRemoveItem,
  onUpdateQuantity,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover fs-6">
        <thead className="table-dark">
          <tr>
            <th style={{ fontSize: "1.1rem", padding: "1rem" }}>محصول</th>
            <th
              className="text-center"
              style={{ fontSize: "1.1rem", padding: "1rem" }}
            >
              تعداد
            </th>
            <th
              className="text-center"
              style={{ fontSize: "1.1rem", padding: "1rem" }}
            >
              قیمت واحد
            </th>
            <th
              className="text-center"
              style={{ fontSize: "1.1rem", padding: "1rem" }}
            >
              تخفیف
            </th>
            <th
              className="text-center"
              style={{ fontSize: "1.1rem", padding: "1rem" }}
            >
              جمع
            </th>
            <th
              className="text-center"
              style={{ fontSize: "1.1rem", padding: "1rem" }}
            >
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              isCalculatingCart={isCalculatingCart}
              onRemoveItem={onRemoveItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}