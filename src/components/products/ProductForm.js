// src/components/products/ProductForm.js
export default function ProductForm({ product, onSubmit }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    weight: product?.weight || '',
    unit: product?.unit || '',
    code: product?.code || '',
    description: product?.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">نام محصول *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">قیمت (تومان) *</label>
            <input
              type="number"
              className="form-control"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">دسته‌بندی *</label>
            <input
              type="text"
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">کد محصول</label>
            <input
              type="text"
              className="form-control"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">وزن</label>
            <input
              type="number"
              className="form-control"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="بر حسب گرم"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">واحد</label>
            <select
              className="form-select"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              <option value="">انتخاب واحد</option>
              <option value="گرم">گرم</option>
              <option value="کیلوگرم">کیلوگرم</option>
              <option value="میلی‌لیتر">میلی‌لیتر</option>
              <option value="لیتر">لیتر</option>
              <option value="عدد">عدد</option>
              <option value="بسته">بسته</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">دسته‌بندی</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">انتخاب دسته</option>
              <option value="کنسرو">کنسرو</option>
              <option value="روغن">روغن</option>
              <option value="غلات">غلات</option>
              <option value="لبنیات">لبنیات</option>
              <option value="نوشیدنی">نوشیدنی</option>
              <option value="خشکبار">خشکبار</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">توضیحات</label>
        <textarea
          className="form-control"
          rows="3"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {product ? 'بروزرسانی' : 'ایجاد'} محصول
      </button>
    </form>
  )
}