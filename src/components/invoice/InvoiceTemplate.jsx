'use client'

export default function InvoiceTemplate({ order }) {
  const printDate = new Date().toLocaleDateString('fa-IR')
  const printTime = new Date().toLocaleTimeString('fa-IR')

  // محاسبات مالی
  const totalWithoutTax = order.totalAmount || 0
  const taxAmount = Math.round(totalWithoutTax * 0.09)
  const totalWithTax = totalWithoutTax + taxAmount

  // تابع برای فرمت کردن وزن
  const formatWeight = (weight, unit) => {
    if (!weight) return ''
    if (unit === 'کیلوگرم') {
      return `${weight} کیلوگرم`
    } else if (unit === 'گرم') {
      return `${weight} گرم`
    } else if (unit === 'لیتر') {
      return `${weight} لیتر`
    } else if (unit === 'میلی‌لیتر') {
      return `${weight} میلی‌لیتر`
    }
    return `${weight} ${unit || ''}`
  }

  return (
    <div className="invoice-container" style={{ 
      fontFamily: 'Tahoma, Arial, sans-serif',
      padding: '20px',
      direction: 'rtl',
      backgroundColor: 'white',
      maxWidth: '800px',
      margin: '0 auto',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      
      {/* هدر اصلی فاکتور */}
      <div className="invoice-header text-center border-bottom pb-3 mb-4">
        <h2 className="text-dark mb-2" style={{ fontSize: '20px', fontWeight: 'bold' }}>فاکتور فروش</h2>
        <div className="row">
          <div className="col-4">
            <strong>شماره فاکتور:</strong> #ORD-{order.id.toString().padStart(4, '0')}
          </div>
          <div className="col-4">
            <strong>تاریخ چاپ:</strong> {printDate}
          </div>
          <div className="col-4">
            <strong>زمان چاپ:</strong> {printTime}
          </div>
        </div>
      </div>

      {/* بخش مشخصات شرکت */}
      <div className="company-info mb-4">
        <h4 className="text-dark mb-2" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
          مشخصات شرکت
        </h4>
        <div className="table-responsive">
          <table className="table table-bordered table-sm" style={{ fontSize: '11px', marginBottom: '0' }}>
            <tbody>
              <tr>
                <td width="15%"><strong>کد اقتصادی</strong></td>
                <td width="15%">۷۸۹۹</td>
                <td width="15%"><strong>کد پستی</strong></td>
                <td width="15%">۹۷۵۷۸۹۰۰۹۸۷</td>
                <td width="15%"><strong>شماره موبایل</strong></td>
                <td width="25%">۰۹۰۲۴۱۵۳۸۵۵</td>
              </tr>
              <tr>
                <td><strong>آدرس شرکت</strong></td>
                <td colSpan="3">تهران - مترو نواب برج گردون همگف یانک ۱۲۵</td>
                <td><strong>آدرس انبار</strong></td>
                <td>همان آدرس شرکت</td>
              </tr>
              <tr>
                <td><strong>ایمیل</strong></td>
                <td>info@visitboot.com</td>
                <td><strong>شماره تماس</strong></td>
                <td>۰۲۶۷۵۸۶۰۰۰</td>
                <td><strong>شماره موبایل</strong></td>
                <td>۰۹۰۲۴۱۵۳۸۵۵</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* بخش مشخصات مشتری */}
      <div className="customer-info mb-4">
        <h4 className="text-dark mb-2" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
          مشخصات مشتری
        </h4>
        <div className="table-responsive">
          <table className="table table-bordered table-sm" style={{ fontSize: '11px', marginBottom: '0' }}>
            <tbody>
              <tr>
                <td width="15%"><strong>نام و نام خانوادگی</strong></td>
                <td width="20%">{order.user?.firstName || 'آرش'} {order.user?.lastName || 'رفیعی'}</td>
                <td width="12%"><strong>کد ملی</strong></td>
                <td width="15%">۰۰۰۰۰۰۰۰۰۰</td>
                <td width="10%"><strong>موبایل</strong></td>
                <td width="18%">۰۹۳۳۰۹۴۴۷۵</td>
                <td width="10%"><strong>تلفن</strong></td>
                <td width="10%">۰۹۳۳۰۹۴۴۷۵</td>
              </tr>
              <tr>
                <td><strong>استان</strong></td>
                <td>اصفهان</td>
                <td><strong>شهر</strong></td>
                <td>اصفهان</td>
                <td><strong>منطقه</strong></td>
                <td colSpan="3">منطقه ۳</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 p-2 bg-light rounded">
          <strong>نشانی فروشگاه: </strong>
          {order.store?.address || 'اصفهان خیابان بزرگمهر خیابان بیستم غربی'}
        </div>
      </div>

      {/* بخش مشخصات سفارش */}
      <div className="order-details mb-4">
        <h4 className="text-dark mb-2" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
          مشخصات سفارشی
        </h4>
        <div className="table-responsive">
          <table className="table table-bordered table-sm" style={{ fontSize: '10px' }}>
            <thead className="table-light">
              <tr>
                <th width="6%" className="text-center">ردیف</th>
                <th width="8%" className="text-center">کد کالا</th>
                <th width="22%" className="text-center">نام کالا</th>
                <th width="8%" className="text-center">وزن/واحد</th>
                <th width="8%" className="text-center">تعداد</th>
                <th width="12%" className="text-center">مبلغ واحد</th>
                <th width="12%" className="text-center">مبلغ کل</th>
                <th width="12%" className="text-center">مبلغ تخفیف</th>
                <th width="12%" className="text-center">مالیات و عوارض</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 1)
                const itemTax = Math.round(itemTotal * 0.09)
                const itemTotalWithTax = itemTotal + itemTax
                
                return (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{item.product?.code || item.id}</td>
                    <td>
                      <div>
                        <strong>{item.product?.name || 'محصول حذف شده'}</strong>
                        {item.product?.description && (
                          <div style={{ fontSize: '9px', color: '#666' }}>
                            {item.product.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {formatWeight(item.product?.weight, item.product?.unit)}
                    </td>
                    <td className="text-center">{item.quantity || 1}</td>
                    <td className="text-left">{(item.price || 0).toLocaleString('fa-IR')} تومان</td>
                    <td className="text-left">{itemTotal.toLocaleString('fa-IR')} تومان</td>
                    <td className="text-left">۰ تومان</td>
                    <td className="text-left">{itemTax.toLocaleString('fa-IR')} تومان</td>
                  </tr>
                )
              })}
              
              {/* ردیف مجموع */}
              <tr className="table-warning fw-bold">
                <td colSpan="5" className="text-center">
                  جمع کل ({order.items?.length || 0} قلم کالا)
                </td>
                <td className="text-left">-</td>
                <td className="text-left">{totalWithoutTax.toLocaleString('fa-IR')} تومان</td>
                <td className="text-left">۰ تومان</td>
                <td className="text-left">{taxAmount.toLocaleString('fa-IR')} تومان</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* بخش محاسبات نهایی */}
      <div className="final-calculations mb-4">
        <div className="row">
          <div className="col-8">
            <div className="table-responsive">
              <table className="table table-bordered table-sm" style={{ fontSize: '11px' }}>
                <tbody>
                  <tr>
                    <td width="60%" className="fw-bold">جمع مبلغ کل با احتساب تخفیف و مالیات</td>
                    <td width="40%" className="text-left fw-bold">{totalWithTax.toLocaleString('fa-IR')} تومان</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">تخفیف</td>
                    <td className="text-left">۰ تومان</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">تخفیف پایا</td>
                    <td className="text-left">۰ تومان</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">کرایه انبار</td>
                    <td className="text-left">۰ تومان</td>
                  </tr>
                  <tr className="table-success">
                    <td className="fw-bold">مبلغ نهایی فاکتور</td>
                    <td className="text-left fw-bold">{totalWithTax.toLocaleString('fa-IR')} تومان</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">حساب قبلی</td>
                    <td className="text-left">۰ تومان</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">اعمال حساب قبلی</td>
                    <td className="text-left">۰ تومان</td>
                  </tr>
                  <tr className="table-primary">
                    <td className="fw-bold">مبلغ قابل پرداخت با اعمال حساب قبلی</td>
                    <td className="text-left fw-bold">{totalWithTax.toLocaleString('fa-IR')} تومان</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-4">
            <div className="p-3 bg-light rounded border">
              <h6 className="border-bottom pb-2">اطلاعات پرداخت</h6>
              <div className="mb-2">
                <strong>وضعیت سفارش:</strong>
                <span className={`badge ${order.status === 'DELIVERED' ? 'bg-success' : 'bg-warning'} me-2`}>
                  {order.status === 'DELIVERED' ? 'تحویل شده' : 
                   order.status === 'PENDING' ? 'در انتظار' : order.status}
                </span>
              </div>
              <div className="mb-2">
                <strong>تاریخ سفارش:</strong>
                <br />
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </div>
              <div>
                <strong>ساعت سفارش:</strong>
                <br />
                {new Date(order.createdAt).toLocaleTimeString('fa-IR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بخش امضاها */}
      <div className="signatures mt-4">
        <div className="row text-center">
          <div className="col-3">
            <div className="border-top border-dark pt-2">
              <small className="fw-bold">امضای خریدار</small>
              <div style={{ height: '50px', marginTop: '5px', borderBottom: '1px dashed #000' }}></div>
              <small>{order.user?.firstName || 'آرش'} {order.user?.lastName || 'رفیعی'}</small>
            </div>
          </div>
          <div className="col-3">
            <div className="border-top border-dark pt-2">
              <small className="fw-bold">امضای انباردار</small>
              <div style={{ height: '50px', marginTop: '5px', borderBottom: '1px dashed #000' }}></div>
              <small>علی رحیمی</small>
            </div>
          </div>
          <div className="col-3">
            <div className="border-top border-dark pt-2">
              <small className="fw-bold">امضای تحصیلدار</small>
              <div style={{ height: '50px', marginTop: '5px', borderBottom: '1px dashed #000' }}></div>
              <small>علی رحیمی</small>
            </div>
          </div>
          <div className="col-3">
            <div className="border-top border-dark pt-2">
              <small className="fw-bold">امضای مسئول</small>
              <div style={{ height: '50px', marginTop: '5px', borderBottom: '1px dashed #000' }}></div>
              <small>ویزیت</small>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات چاپ */}
      <div className="print-info mt-4 pt-3 border-top text-center">
        <small className="text-muted">
          چاپ شده در تاریخ: {printDate} - ساعت: {printTime} | 
          شماره فاکتور: #ORD-{order.id.toString().padStart(4, '0')} |
          سیستم مدیریت فروشگاه‌ها - Visit Boot
        </small>
      </div>

      {/* خط جداکننده صفحات */}
      <div className="page-break" style={{ pageBreakAfter: 'always', marginTop: '20px' }}></div>

      {/* صفحه دوم - توضیحات */}
      <div className="second-page mt-4">
        <h4 className="text-dark mb-3 text-center" style={{ fontSize: '16px', fontWeight: 'bold' }}>
          شرایط و ضوابط
        </h4>
        
        <div className="border p-3 rounded" style={{ fontSize: '11px', lineHeight: '1.6' }}>
          <h5 className="border-bottom pb-2 mb-3">شرایط عمومی</h5>
          
          <div className="row">
            <div className="col-6">
              <div className="mb-3">
                <strong>بازگشت کالا:</strong>
                <ul style={{ paddingRight: '15px', margin: '10px 0' }}>
                  <li>مهلت بازگشت کالا: ۷ روز کاری</li>
                  <li>کالا باید در شرایط سالم و دست نخورده باشد</li>
                  <li>برچسب و بسته‌بندی اصلی باید سالم باشد</li>
                </ul>
              </div>

              <div className="mb-3">
                <strong>ضمانت کالا:</strong>
                <ul style={{ paddingRight: '15px', margin: '10px 0' }}>
                  <li>ضمانت اصالت کالا</li>
                  <li>ضمانت سلامت فیزیکی کالا</li>
                  <li>پشتیبانی فنی ۲۴ ساعته</li>
                </ul>
              </div>
            </div>

            <div className="col-6">
              <div className="mb-3">
                <strong>تحویل کالا:</strong>
                <ul style={{ paddingRight: '15px', margin: '10px 0' }}>
                  <li>تحویل درب منزل</li>
                  <li>زمان تحویل: ۲۴ تا ۴۸ ساعت کاری</li>
                  <li>هزینه حمل به عهده خریدار</li>
                </ul>
              </div>

              <div className="mb-3">
                <strong>پرداخت:</strong>
                <ul style={{ paddingRight: '15px', margin: '10px 0' }}>
                  <li>پرداخت نقدی در محل</li>
                  <li>پرداخت آنلاین</li>
                  <li>پرداخت اقساطی (با شرایط خاص)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-light p-3 rounded mt-3">
            <h6 className="border-bottom pb-2">راه‌های ارتباطی</h6>
            <div className="row">
              <div className="col-4">
                <strong>پشتیبانی:</strong><br />
                ۰۲۶۷۵۸۶۰۰۰
              </div>
              <div className="col-4">
                <strong>ایمیل:</strong><br />
                info@visitboot.com
              </div>
              <div className="col-4">
                <strong>ساعات کاری:</strong><br />
                ۸:۰۰ تا ۱۷:۰۰
              </div>
            </div>
            <div className="mt-2">
              <strong>آدرس:</strong> تهران - مترو نواب برج گردون همگف یانک ۱۲۵
            </div>
          </div>

          <div className="mt-3 p-2 bg-warning rounded text-center">
            <strong>تذکر مهم:</strong> این فاکتور به منزله رسید رسمی پرداخت می‌باشد. لطفاً آن را تا دریافت کالا نگهداری نمایید.
          </div>
        </div>

        {/* خلاصه سفارش در صفحه دوم */}
        <div className="order-summary mt-4 p-3 border rounded">
          <h5 className="border-bottom pb-2 mb-3">خلاصه سفارش</h5>
          <div className="row">
            <div className="col-6">
              <strong>شماره فاکتور:</strong> #ORD-{order.id.toString().padStart(4, '0')}
            </div>
            <div className="col-6">
              <strong>تاریخ سفارش:</strong> {new Date(order.createdAt).toLocaleDateString('fa-IR')}
            </div>
            <div className="col-6 mt-2">
              <strong>تعداد کالاها:</strong> {order.items?.length || 0} قلم
            </div>
            <div className="col-6 mt-2">
              <strong>مبلغ کل:</strong> {totalWithTax.toLocaleString('fa-IR')} تومان
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}