// // src/app/dashboard/orders/[id]/page.js
// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import Link from 'next/link'
// import InvoiceModal from '@/components/invoice/InvoiceModal'
// import SalesRepSelector from '@/components/orders/SalesRepSelector'

// export default function OrderDetailPage() {
//   const params = useParams()
//   const router = useRouter()

//   const orderId = parseInt(params.id)
//   const [order, setOrder] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [showInvoice, setShowInvoice] = useState(false)
//   const [editMode, setEditMode] = useState(false)
//   const [products, setProducts] = useState([])
//   const [salesReps, setSalesReps] = useState([])
//   const [stores, setStores] = useState([])
//   const [currentUser, setCurrentUser] = useState(null)
//   const [formData, setFormData] = useState({
//     status: '',
//     notes: '',
//     salesRepId: null,
//     storeCode: ''
//   })
//   const [orderItems, setOrderItems] = useState([])
//   const [newItem, setNewItem] = useState({
//     productCode: '',
//     quantity: 1,
//     price: 0
//   })

//   useEffect(() => {
//     if (orderId && !isNaN(orderId)) {
//       fetchCurrentUser()
//       fetchOrder()
//       fetchProducts()
//       fetchSalesReps()
//       fetchStores()
//     } else {
//       setError('شناسه سفارش نامعتبر است')
//       setIsLoading(false)
//     }
//   }, [orderId])

//   const fetchCurrentUser = async () => {
//     try {
//       const response = await fetch('/api/auth/me')
//       if (response.ok) {
//         const userData = await response.json()
//         setCurrentUser(userData)
//       }
//     } catch (error) {
//       console.error('Error fetching current user:', error)
//     }
//   }

//   const fetchOrder = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       const response = await fetch(`/api/orders/${orderId}`)
//       const data = await response.json()

//       if (response.ok) {
//         setOrder(data)
//         setFormData({
//           status: data.status,
//           notes: data.notes || '',
//           salesRepId: data.salesRepId,
//           storeCode: data.storeCode
//         })
//         setOrderItems(data.items?.map(item => ({
//           ...item,
//           productCode: item.product?.code,
//           productName: item.product?.name
//         })) || [])
//       } else {
//         setError(data.error || 'سفارش یافت نشد')
//       }
//     } catch (error) {
//       console.error('Error fetching order:', error)
//       setError('خطا در ارتباط با سرور')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch('/api/products')
//       const data = await response.json()
//       setProducts(data)
//     } catch (error) {
//       console.error('Error fetching products:', error)
//     }
//   }

//   const fetchSalesReps = async () => {
//     try {
//       const response = await fetch('/api/sales-reps')
//       if (response.ok) {
//         const data = await response.json()
//         setSalesReps(data)
//       }
//     } catch (error) {
//       console.error('Error fetching sales reps:', error)
//     }
//   }

//   const fetchStores = async () => {
//     try {
//       const response = await fetch('/api/stores')
//       if (response.ok) {
//         const data = await response.json()
//         setStores(data)
//       }
//     } catch (error) {
//       console.error('Error fetching stores:', error)
//     }
//   }

//   const handleUpdate = async (e) => {
//     e.preventDefault()
//     try {
//       const orderData = {
//         status: formData.status,
//         notes: formData.notes,
//         salesRepId: formData.salesRepId,
//         storeCode: formData.storeCode,
//         items: orderItems.map(item => ({
//           productCode: item.productCode,
//           quantity: item.quantity,
//           price: item.price
//         })),
//         totalAmount: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
//       }

//       const response = await fetch(`/api/orders/${orderId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(orderData)
//       })

//       if (response.ok) {
//         const updatedOrder = await response.json()
//         setOrder(updatedOrder)
//         setEditMode(false)
//         alert('سفارش با موفقیت بروزرسانی شد')
//       } else {
//         const errorData = await response.json()
//         alert(errorData.error || 'خطا در بروزرسانی سفارش')
//       }
//     } catch (error) {
//       console.error('Error updating order:', error)
//       alert('خطا در بروزرسانی سفارش')
//     }
//   }

//   const handleDelete = async () => {
//     if (confirm('آیا از حذف این سفارش مطمئن هستید؟ این عمل قابل بازگشت نیست.')) {
//       try {
//         const response = await fetch(`/api/orders/${orderId}`, {
//           method: 'DELETE'
//         })

//         if (response.ok) {
//           alert('سفارش با موفقیت حذف شد')
//           router.push('/dashboard/orders')
//         } else {
//           const errorData = await response.json()
//           alert(errorData.error || 'خطا در حذف سفارش')
//         }
//       } catch (error) {
//         console.error('Error deleting order:', error)
//         alert('خطا در حذف سفارش')
//       }
//     }
//   }

//   const handleAddItem = () => {
//     if (!newItem.productCode || newItem.quantity <= 0 || newItem.price <= 0) {
//       alert('لطفاً تمام فیلدهای مورد نیاز را پر کنید')
//       return
//     }

//     const selectedProduct = products.find(p => p.code === newItem.productCode)
//     const existingItemIndex = orderItems.findIndex(item => item.productCode === newItem.productCode)

//     if (existingItemIndex >= 0) {
//       const updatedItems = [...orderItems]
//       updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity)
//       setOrderItems(updatedItems)
//     } else {
//       setOrderItems([...orderItems, {
//         id: Date.now(),
//         productCode: newItem.productCode,
//         productName: selectedProduct?.name,
//         quantity: parseInt(newItem.quantity),
//         price: parseFloat(newItem.price)
//       }])
//     }

//     setNewItem({
//       productCode: '',
//       quantity: 1,
//       price: 0
//     })
//   }

//   const handleRemoveItem = (itemId) => {
//     setOrderItems(orderItems.filter(item => item.id !== itemId))
//   }

//   const handleUpdateItemQuantity = (itemId, newQuantity) => {
//     if (newQuantity <= 0) {
//       handleRemoveItem(itemId)
//       return
//     }

//     setOrderItems(orderItems.map(item =>
//       item.id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
//     ))
//   }

//   const handleUpdateItemPrice = (itemId, newPrice) => {
//     const priceValue = parseFloat(newPrice) || 0
//     setOrderItems(orderItems.map(item =>
//       item.id === itemId ? { ...item, price: priceValue } : item
//     ))
//   }

//   const handleProductChange = (productCode) => {
//     const selectedProduct = products.find(p => p.code === productCode)
//     if (selectedProduct) {
//       setNewItem({
//         ...newItem,
//         productCode: productCode,
//         price: selectedProduct.price || 0
//       })
//     }
//   }

//   const handlePriceInputChange = (e, setterFunction) => {
//     const value = e.target.value
//     if (value === '' || /^\d*\.?\d*$/.test(value)) {
//       setterFunction(value)
//     }
//   }

//   const formatCurrency = (amount) => {
//     if (!amount) return '۰ ریال'
//     return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return 'نامشخص'
//     return new Date(dateString).toLocaleDateString('fa-IR')
//   }

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       PENDING: { label: 'در انتظار', class: 'bg-warning text-dark' },
//       CONFIRMED: { label: 'تایید شده', class: 'bg-info text-white' },
//       PREPARING: { label: 'در حال آماده‌سازی', class: 'bg-primary text-white' },
//       DELIVERING: { label: 'در حال ارسال', class: 'bg-secondary text-white' },
//       DELIVERED: { label: 'تحویل شده', class: 'bg-success text-white' },
//       CANCELLED: { label: 'لغو شده', class: 'bg-danger text-white' }
//     }

//     const config = statusConfig[status] || { label: status, class: 'bg-secondary text-white' }
//     return <span className={`badge ${config.class}`}>{config.label}</span>
//   }

//   const calculateTotal = () => {
//     return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
//   }

//   const isAdmin = currentUser?.role === 'ADMIN'

//   if (isLoading) {
//     return (
//       <div className="container-fluid">
//         <div className="d-flex justify-content-center align-items-center py-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">در حال بارگذاری...</span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error || !order) {
//     return (
//       <div className="container-fluid">
//         <div className="alert alert-danger text-center">
//           <div className="mb-3">
//             <i className="bi bi-exclamation-triangle-fill fs-1"></i>
//           </div>
//           <h4>{error || 'سفارش یافت نشد'}</h4>
//           <div className="mt-3">
//             <Link href="/dashboard/orders" className="btn btn-primary me-2">
//               بازگشت به لیست سفارشات
//             </Link>
//             <button
//               className="btn btn-secondary"
//               onClick={fetchOrder}
//             >
//               تلاش مجدد
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container-fluid">
//       {/* هدر صفحه */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <nav aria-label="breadcrumb">
//             <ol className="breadcrumb">
//               <li className="breadcrumb-item">
//                 <Link href="/dashboard" className="text-decoration-none">
//                   <i className="bi bi-house-door"></i> داشبورد
//                 </Link>
//               </li>
//               <li className="breadcrumb-item">
//                 <Link href="/dashboard/orders" className="text-decoration-none">
//                   سفارشات
//                 </Link>
//               </li>
//               <li className="breadcrumb-item active">
//                 سفارش #{order.id.toString().padStart(4, '0')}
//               </li>
//             </ol>
//           </nav>
//           <h1 className="h3 mb-1 fw-bold">
//             سفارش #{order.id.toString().padStart(4, '0')}
//           </h1>
//           <small className="text-muted">
//             تاریخ ایجاد: {formatDate(order.createdAt)}
//             {currentUser && (
//               <span className="me-2"> | کاربر: {currentUser.role === 'ADMIN' ? 'مدیر سیستم' : 'ویزیتور'}</span>
//             )}
//           </small>
//         </div>

//         <div className="btn-group">
//           <button
//             className="btn btn-success"
//             onClick={() => setShowInvoice(true)}
//           >
//             <i className="bi bi-receipt me-2"></i>
//             فاکتور
//           </button>
//           <button
//             className="btn btn-warning"
//             onClick={() => setEditMode(!editMode)}
//           >
//             <i className="bi bi-pencil me-2"></i>
//             {editMode ? 'لغو ویرایش' : 'ویرایش'}
//           </button>
//           {isAdmin && (
//             <button
//               className="btn btn-danger"
//               onClick={handleDelete}
//             >
//               <i className="bi bi-trash me-2"></i>
//               حذف
//             </button>
//           )}
//           <Link
//             href="/dashboard/orders"
//             className="btn btn-outline-secondary"
//           >
//             <i className="bi bi-arrow-right me-2"></i>
//             بازگشت
//           </Link>
//         </div>
//       </div>

//       {/* محتوای اصلی */}
//       {editMode ? (
//         // حالت ویرایش
//         <div className="card mb-4">
//           <div className="card-header">
//             <h5 className="card-title mb-0">
//               <i className="bi bi-pencil-square me-2"></i>
//               ویرایش سفارش
//             </h5>
//           </div>
//           <div className="card-body">
//             <form onSubmit={handleUpdate}>
//               <div className="row mb-3">
//                 <div className="col-md-4">
//                   <label className="form-label">وضعیت سفارش</label>
//                   <select
//                     className="form-select"
//                     value={formData.status}
//                     onChange={(e) => setFormData({...formData, status: e.target.value})}
//                     required
//                   >
//                     <option value="PENDING">در انتظار</option>
//                     <option value="CONFIRMED">تایید شده</option>
//                     <option value="PREPARING">در حال آماده‌سازی</option>
//                     <option value="DELIVERING">در حال ارسال</option>
//                     <option value="DELIVERED">تحویل شده</option>
//                     <option value="CANCELLED">لغو شده</option>
//                   </select>
//                 </div>

//                 {isAdmin && (
//                   <div className="col-md-4">
//                     <label className="form-label">ویزیتور مسئول</label>
//                     <SalesRepSelector
//                       selectedRep={formData.salesRepId}
//                       onRepChange={(salesRepId) => setFormData({...formData, salesRepId})}
//                     />
//                   </div>
//                 )}

//                 <div className="col-md-4">
//                   <label className="form-label">فروشگاه</label>
//                   <select
//                     className="form-select"
//                     value={formData.storeCode}
//                     onChange={(e) => setFormData({...formData, storeCode: e.target.value})}
//                     required
//                   >
//                     <option value="">انتخاب فروشگاه</option>
//                     {stores.map(store => (
//                       <option key={store.code} value={store.code}>
//                         {store.name} - {store.code}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="row mb-4">
//                 <div className="col-12">
//                   <label className="form-label">یادداشت</label>
//                   <textarea
//                     className="form-control"
//                     rows="3"
//                     value={formData.notes}
//                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
//                     placeholder="یادداشت درباره سفارش..."
//                   />
//                 </div>
//               </div>

//               {/* فرم اضافه کردن آیتم جدید */}
//               <div className="card bg-light mb-4">
//                 <div className="card-header">
//                   <h6 className="card-title mb-0">
//                     <i className="bi bi-plus-circle me-2"></i>
//                     افزودن کالا به سفارش
//                   </h6>
//                 </div>
//                 <div className="card-body">
//                   <div className="row g-2">
//                     <div className="col-md-4">
//                       <select
//                         className="form-select"
//                         value={newItem.productCode}
//                         onChange={(e) => handleProductChange(e.target.value)}
//                       >
//                         <option value="">انتخاب محصول</option>
//                         {products.map(product => (
//                           <option key={product.code} value={product.code}>
//                             {product.name} - {formatCurrency(product.price)}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="col-md-2">
//                       <input
//                         type="number"
//                         className="form-control"
//                         placeholder="تعداد"
//                         value={newItem.quantity}
//                         onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
//                         min="1"
//                       />
//                     </div>
//                     <div className="col-md-3">
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder="قیمت"
//                         value={newItem.price}
//                         onChange={(e) => handlePriceInputChange(e, (value) => setNewItem({...newItem, price: value}))}
//                         inputMode="decimal"
//                       />
//                     </div>
//                     <div className="col-md-3">
//                       <button
//                         type="button"
//                         className="btn btn-primary w-100"
//                         onClick={handleAddItem}
//                       >
//                         <i className="bi bi-plus-circle me-2"></i>
//                         افزودن
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* لیست آیتم‌های سفارش در حالت ویرایش */}
//               <div className="mb-4">
//                 <h6 className="border-bottom pb-2 mb-3">
//                   <i className="bi bi-list-ul me-2"></i>
//                   لیست کالاها
//                 </h6>
//                 {orderItems.length > 0 ? (
//                   <div className="table-responsive">
//                     <table className="table table-striped">
//                       <thead>
//                         <tr>
//                           <th>نام کالا</th>
//                           <th>کد کالا</th>
//                           <th width="100">تعداد</th>
//                           <th width="150">قیمت واحد</th>
//                           <th width="150">مبلغ کل</th>
//                           <th width="80">عملیات</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {orderItems.map((item) => (
//                           <tr key={item.id}>
//                             <td>
//                               <div className="fw-bold">
//                                 {item.productName || 'محصول حذف شده'}
//                               </div>
//                             </td>
//                             <td>
//                               <span className="badge bg-info">{item.productCode}</span>
//                             </td>
//                             <td>
//                               <input
//                                 type="number"
//                                 className="form-control form-control-sm"
//                                 value={item.quantity}
//                                 onChange={(e) => handleUpdateItemQuantity(item.id, e.target.value)}
//                                 min="1"
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="text"
//                                 className="form-control form-control-sm"
//                                 value={item.price}
//                                 onChange={(e) => handlePriceInputChange(e, (value) => handleUpdateItemPrice(item.id, value))}
//                                 inputMode="decimal"
//                               />
//                             </td>
//                             <td className="fw-bold text-primary">
//                               {formatCurrency(item.price * item.quantity)}
//                             </td>
//                             <td>
//                               <button
//                                 type="button"
//                                 className="btn btn-sm btn-outline-danger"
//                                 onClick={() => handleRemoveItem(item.id)}
//                               >
//                                 <i className="bi bi-trash"></i>
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       <tfoot>
//                         <tr className="table-warning">
//                           <td colSpan="4" className="text-end fw-bold">جمع کل:</td>
//                           <td className="fw-bold">
//                             {formatCurrency(calculateTotal())}
//                           </td>
//                           <td></td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-4 text-muted">
//                     <i className="bi bi-inbox display-6"></i>
//                     <p className="mt-2 mb-0">هیچ کالایی به سفارش اضافه نشده است</p>
//                   </div>
//                 )}
//               </div>

//               <div className="d-flex gap-2">
//                 <button type="submit" className="btn btn-success">
//                   <i className="bi bi-check-circle me-2"></i>
//                   ذخیره تغییرات
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setEditMode(false)}
//                 >
//                   <i className="bi bi-x-circle me-2"></i>
//                   انصراف
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       ) : (
//         // حالت نمایش
//         <div className="row">
//           {/* اطلاعات اصلی سفارش */}
//           <div className="col-lg-8">
//             <div className="card mb-4">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">
//                   <i className="bi bi-info-circle me-2"></i>
//                   مشخصات سفارش
//                 </h5>
//                 {getStatusBadge(order.status)}
//               </div>
//               <div className="card-body">
//                 <div className="row">
//                   <div className="col-md-6">
//                     <table className="table table-borderless">
//                       <tbody>
//                         <tr>
//                           <td width="40%" className="fw-bold">شماره سفارش:</td>
//                           <td>#ORD-{order.id.toString().padStart(4, '0')}</td>
//                         </tr>
//                         <tr>
//                           <td className="fw-bold">مبلغ کل:</td>
//                           <td className="text-success fw-bold">
//                             {formatCurrency(order.totalAmount)}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="fw-bold">تاریخ ایجاد:</td>
//                           <td>{formatDate(order.createdAt)}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="col-md-6">
//                     <table className="table table-borderless">
//                       <tbody>
//                         <tr>
//                           <td width="40%" className="fw-bold">ویزیتور:</td>
//                           <td>
//                             {order.salesRep ? (
//                               <span className="text-primary">
//                                 <i className="bi bi-person-badge me-2"></i>
//                                 {order.salesRep.name} ({order.salesRep.code})
//                               </span>
//                             ) : (
//                               <span className="text-muted">تعیین نشده</span>
//                             )}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="fw-bold">فروشگاه:</td>
//                           <td>{order.store?.name}</td>
//                         </tr>
//                         <tr>
//                           <td className="fw-bold">کد فروشگاه:</td>
//                           <td><span className="badge bg-secondary">{order.store?.code}</span></td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {order.notes && (
//                   <div className="alert alert-info mt-3">
//                     <strong>یادداشت:</strong>
//                     <p className="mb-0 mt-1">{order.notes}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* لیست کالاها */}
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="card-title mb-0">
//                   <i className="bi bi-cart-check me-2"></i>
//                   لیست کالاها
//                 </h5>
//               </div>
//               <div className="card-body">
//                 <div className="table-responsive">
//                   <table className="table table-striped">
//                     <thead>
//                       <tr>
//                         <th>نام کالا</th>
//                         <th>کد کالا</th>
//                         <th>تعداد</th>
//                         <th>قیمت واحد</th>
//                         <th>مبلغ کل</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {order.items && order.items.map((item) => (
//                         <tr key={item.id}>
//                           <td>
//                             <div className="fw-bold">{item.product?.name || 'محصول حذف شده'}</div>
//                             {item.product?.category && (
//                               <small className="text-muted">
//                                 {item.product.category}
//                               </small>
//                             )}
//                           </td>
//                           <td>
//                             {item.product?.code ? (
//                               <span className="badge bg-info">{item.product.code}</span>
//                             ) : (
//                               <span className="text-muted">ندارد</span>
//                             )}
//                           </td>
//                           <td>{item.quantity} عدد</td>
//                           <td className="text-success">
//                             {formatCurrency(item.price)}
//                           </td>
//                           <td className="fw-bold text-primary">
//                             {formatCurrency(item.price * item.quantity)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr className="table-warning">
//                         <td colSpan="4" className="text-end fw-bold">جمع کل:</td>
//                         <td className="fw-bold">
//                           {formatCurrency(order.totalAmount)}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* اطلاعات جانبی */}
//           <div className="col-lg-4">
//             {/* اطلاعات ویزیتور */}
//             <div className="card mb-4">
//               <div className="card-header">
//                 <h5 className="card-title mb-0">
//                   <i className="bi bi-person-badge me-2"></i>
//                   اطلاعات ویزیتور
//                 </h5>
//               </div>
//               <div className="card-body">
//                 {order.salesRep ? (
//                   <table className="table table-borderless">
//                     <tbody>
//                       <tr>
//                         <td className="fw-bold">نام:</td>
//                         <td>{order.salesRep.name}</td>
//                       </tr>
//                       <tr>
//                         <td className="fw-bold">کد:</td>
//                         <td><span className="badge bg-primary">{order.salesRep.code}</span></td>
//                       </tr>
//                       <tr>
//                         <td className="fw-bold">تلفن:</td>
//                         <td>{order.salesRep.phone || 'ثبت نشده'}</td>
//                       </tr>
//                       <tr>
//                         <td className="fw-bold">ایمیل:</td>
//                         <td>{order.salesRep.email || 'ثبت نشده'}</td>
//                       </tr>
//                       <tr>
//                         <td className="fw-bold">وضعیت:</td>
//                         <td>
//                           <span className={`badge ${order.salesRep.isActive ? 'bg-success' : 'bg-danger'}`}>
//                             {order.salesRep.isActive ? 'فعال' : 'غیرفعال'}
//                           </span>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 ) : (
//                   <div className="text-center text-muted py-3">
//                     <i className="bi bi-person-x display-6"></i>
//                     <p className="mt-2 mb-0">ویزیتور تعیین نشده است</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* اطلاعات فروشگاه */}
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="card-title mb-0">
//                   <i className="bi bi-shop me-2"></i>
//                   اطلاعات فروشگاه
//                 </h5>
//               </div>
//               <div className="card-body">
//                 <table className="table table-borderless">
//                   <tbody>
//                     <tr>
//                       <td className="fw-bold">نام:</td>
//                       <td>{order.store?.name || 'نامشخص'}</td>
//                     </tr>
//                     <tr>
//                       <td className="fw-bold">کد:</td>
//                       <td><span className="badge bg-secondary">{order.store?.code}</span></td>
//                     </tr>
//                     <tr>
//                       <td className="fw-bold">مالک:</td>
//                       <td>{order.store?.ownerName || 'نامشخص'}</td>
//                     </tr>
//                     <tr>
//                       <td className="fw-bold">تلفن:</td>
//                       <td>{order.store?.phone || 'ثبت نشده'}</td>
//                     </tr>
//                     <tr>
//                       <td className="fw-bold">آدرس:</td>
//                       <td>{order.store?.address || 'ثبت نشده'}</td>
//                     </tr>
//                     <tr>
//                       <td className="fw-bold">نوع:</td>
//                       <td>
//                         <span className="badge bg-info">
//                           {order.store?.storeType === 'SUPERMARKET' ? 'سوپرمارکت' : 'بقالی'}
//                         </span>
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* مودال فاکتور */}
//       {order && (
//         <InvoiceModal
//           order={order}
//           show={showInvoice}
//           onClose={() => setShowInvoice(false)}
//         />
//       )}
//     </div>
//   )
// }

// 📂 src/app/dashboard/orders/[id]/page.js
// 📂 src/app/dashboard/orders/[id]/page.js
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Grid,
  Snackbar,
} from "@mui/material";
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import Link from "next/link";

// کامپوننت‌ها
import OrderDetailHeader from "@/components/orders/OrderDetailHeader";
import OrderInfoCard from "@/components/orders/OrderInfoCard";
import OrderProductsCard from "@/components/orders/OrderProductsCard";
import OrderActions from "@/components/orders/OrderActions";
import OrderSidebar from "@/components/orders/OrderSidebar";
import OrderDeleteDialog from "@/components/orders/OrderDeleteDialog";
import OrderEditForm from "@/components/orders/OrderEditForm";
import InvoiceModal from "@/components/invoice/InvoiceModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // حالت ویرایش
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    salesRepId: null,
    storeCode: "",
  });
  const [products, setProducts] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [stores, setStores] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({
    productCode: "",
    quantity: 1,
    price: 0,
  });

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`);

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // مقداردهی اولیه فرم
        setFormData({
          status: data.status,
          notes: data.notes || "",
          salesRepId: data.salesRepId,
          storeCode: data.storeCode,
        });
        setOrderItems(
          data.items?.map((item) => ({
            id: item.id,
            productCode: item.product?.code,
            productName: item.product?.name,
            quantity: item.quantity,
            price: item.price,
          })) || []
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "خطا در دریافت داده");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSalesReps = async () => {
    try {
      const response = await fetch("/api/sales-reps");
      if (response.ok) {
        const data = await response.json();
        setSalesReps(data);
      }
    } catch (error) {
      console.error("Error fetching sales reps:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchCurrentUser();
      fetchOrder();
      fetchProducts();
      fetchSalesReps();
      fetchStores();
    } else {
      setError("شناسه سفارش وجود ندارد");
      setIsLoading(false);
    }
  }, [orderId]);

  // توابع ویرایش
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        status: formData.status,
        notes: formData.notes,
        salesRepId: formData.salesRepId,
        storeCode: formData.storeCode,
        items: orderItems.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: orderItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      };

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setEditMode(false);
        setSnackbar({
          open: true,
          message: "سفارش با موفقیت به‌روزرسانی شد",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "خطا در به‌روزرسانی سفارش",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setSnackbar({
        open: true,
        message: "خطا در ارتباط با سرور",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "سفارش با موفقیت حذف شد",
          severity: "success",
        });
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 1500);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "خطا در حذف سفارش",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setSnackbar({
        open: true,
        message: "خطا در ارتباط با سرور",
        severity: "error",
      });
    } finally {
      setDeleteDialog(false);
    }
  };

  // توابع مدیریت آیتم‌ها
  const handleAddItem = () => {
    if (!newItem.productCode || newItem.quantity <= 0 || newItem.price <= 0) {
      setSnackbar({
        open: true,
        message: "لطفاً اطلاعات محصول را کامل کنید",
        severity: "warning",
      });
      return;
    }

    const selectedProduct = products.find(
      (p) => p.code === newItem.productCode
    );
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productCode === newItem.productCode
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity);
      setOrderItems(updatedItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: Date.now(),
          productCode: newItem.productCode,
          productName: selectedProduct?.name,
          quantity: parseInt(newItem.quantity),
          price: parseFloat(newItem.price),
        },
      ]);
    }

    setNewItem({
      productCode: "",
      quantity: 1,
      price: 0,
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  const handleUpdateItemPrice = (itemId, newPrice) => {
    const priceValue = parseFloat(newPrice) || 0;
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, price: priceValue } : item
      )
    );
  };

  const handleProductChange = (productCode) => {
    const selectedProduct = products.find((p) => p.code === productCode);
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productCode: productCode,
        price: selectedProduct.price || 0,
      });
    }
  };

  // توابع فرمت
  const formatCurrency = (amount) => {
    if (!amount) return "۰ ریال";
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "نامشخص";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const isAdmin = currentUser?.role === "ADMIN";

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          flexDirection="column"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال بارگذاری سفارش #{orderId}...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {" "}
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {error || "سفارش یافت نشد"}
          </Typography>
        </Alert>
        <Box display="flex" gap={2}>
          <Button
            component={Link}
            href="/dashboard/orders"
            variant="contained"
            startIcon={<ArrowBack />}
          >
            بازگشت به لیست سفارشات
          </Button>
          <Button
            variant="outlined"
            onClick={fetchOrder}
            startIcon={<CheckCircle />}
          >
            تلاش مجدد
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* هدر */}
      <OrderDetailHeader order={order} />

      {/* اکشن‌ها */}
      <OrderActions
        order={order}
        editMode={editMode}
        isAdmin={isAdmin}
        onShowInvoice={() => setShowInvoice(true)}
        onToggleEdit={() => setEditMode(!editMode)}
        onDelete={() => setDeleteDialog(true)}
      />

      {/* محتوای اصلی */}
      {editMode ? (
        // حالت ویرایش
        <OrderEditForm
          order={order}
          formData={formData}
          setFormData={setFormData}
          products={products}
          stores={stores}
          salesReps={salesReps}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          newItem={newItem}
          setNewItem={setNewItem}
          isAdmin={isAdmin}
          onUpdate={handleUpdate}
          onCancel={() => setEditMode(false)}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onUpdateItemPrice={handleUpdateItemPrice}
          onProductChange={handleProductChange}
          formatCurrency={formatCurrency}
          calculateTotal={calculateTotal}
        />
      ) : (
        // حالت نمایش
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <OrderInfoCard
              order={order}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
            <OrderProductsCard order={order} formatCurrency={formatCurrency} />
          </Grid>

          <Grid item xs={12} lg={4}>
            <OrderSidebar order={order} />
          </Grid>
        </Grid>
      )}

      {/* دکمه بازگشت */}
      {!editMode && (
        <Box sx={{ mt: 3 }}>
          <Button
            component={Link}
            href="/dashboard/orders"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            بازگشت به لیست سفارشات
          </Button>
        </Box>
      )}

      {/* مودال‌ها و اسنک بار */}
      <OrderDeleteDialog
        open={deleteDialog}
        order={order}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      <InvoiceModal
        order={order}
        show={showInvoice}
        onClose={() => setShowInvoice(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
