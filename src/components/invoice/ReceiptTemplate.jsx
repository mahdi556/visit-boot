'use client'

export default function ReceiptTemplate({ order }) {
  const printDate = new Date().toLocaleDateString('fa-IR')
  const printTime = new Date().toLocaleTimeString('fa-IR')
  
  // محاسبات
  const totalAmount = order.totalAmount || 0
  const taxAmount = Math.round(totalAmount * 0.09)
  const finalAmount = totalAmount + taxAmount

  return (
    <div className="receipt-container" style={{
      fontFamily: 'Courier New, monospace',
      direction: 'rtl',
      backgroundColor: 'white',
      width: '280px',
      margin: '0 auto',
      padding: '10px',
      fontSize: '12px',
      lineHeight: '1.2',
      border: '1px dashed #ccc'
    }}>
      
      {/* هدر فیش */}
      <div className="text-center mb-2">
        <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>صورت حساب فروش کالا</div>
          <div style={{ fontSize: '11px' }}>فروشگاه زنجیره ای جانبو</div>
        </div>
      </div>

      {/* اطلاعات فروشگاه */}
      <div className="store-info mb-2" style={{ borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
        <div><strong>آدرس:</strong> تهران - خیابان امام - ورودی بانک ملی</div>
        <div><strong>تلفن:</strong> 22422296</div>
        <div><strong>کد پستی:</strong> 4448785220</div>
        <div><strong>کد اقتصادی:</strong> 86647884533</div>
        <div style={{ fontStyle: 'italic', fontSize: '10px' }}>کیفیت درجه یک همراه با قیمت پایین</div>
      </div>

      {/* اطلاعات سفارش */}
      <div className="order-info mb-2" style={{ borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
        <div><strong>فروشگاه:</strong> شعبه مرکزی</div>
        <div><strong>مشتری:</strong> {order.user?.firstName || 'محمد'} {order.user?.lastName || 'سید'}</div>
        <div><strong>پژوهشی:</strong> {order.id.toString().padStart(4, '0')}</div>
        <div><strong>شماره دوم:</strong> 33</div>
        <div><strong>تاریخ:</strong> {printDate}</div>
        <div><strong>ساعت:</strong> {printTime}</div>
        <div><strong>شماره فاکتور:</strong> {order.id}-1402</div>
      </div>

      {/* جدول کالاها */}
      <div className="products-table mb-2">
        <div style={{ borderBottom: '1px dashed #000', paddingBottom: '2px', marginBottom: '2px' }}>
          <strong>مشخصات کالا</strong>
        </div>
        
        {/* هدر جدول */}
        <div className="row mb-1" style={{ 
          display: 'flex', 
          borderBottom: '1px dotted #666',
          paddingBottom: '2px',
          fontSize: '10px'
        }}>
          <div style={{ width: '20%', textAlign: 'center' }}>قیمت</div>
          <div style={{ width: '20%', textAlign: 'center' }}>تعداد</div>
          <div style={{ width: '40%', textAlign: 'right' }}>نام کالا</div>
          <div style={{ width: '20%', textAlign: 'center' }}>مبلغ کل</div>
        </div>

        {/* آیتم‌های کالا */}
        {order.items?.map((item, index) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1)
          return (
            <div key={item.id} className="row mb-1" style={{ 
              display: 'flex',
              fontSize: '10px',
              borderBottom: '0.5px dotted #ccc',
              paddingBottom: '1px'
            }}>
              <div style={{ width: '20%', textAlign: 'center' }}>
                {(item.price || 0).toLocaleString('fa-IR')}
              </div>
              <div style={{ width: '20%', textAlign: 'center' }}>
                {item.quantity || 1}
              </div>
              <div style={{ width: '40%', textAlign: 'right', paddingLeft: '5px' }}>
                {item.product?.name || 'کالا'}
              </div>
              <div style={{ width: '20%', textAlign: 'center' }}>
                {itemTotal.toLocaleString('fa-IR')}
              </div>
            </div>
          )
        })}

        {/* خط جداکننده */}
        <div style={{ 
          borderTop: '1px dashed #000', 
          margin: '3px 0',
          paddingTop: '3px' 
        }}></div>

        {/* جمع‌های جزئی */}
        <div className="row mb-1" style={{ display: 'flex', fontSize: '10px' }}>
          <div style={{ width: '60%', textAlign: 'left' }}>تعداد کالا:</div>
          <div style={{ width: '40%', textAlign: 'left' }}>
            {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          </div>
        </div>
      </div>

      {/* محاسبات نهایی */}
      <div className="calculations mb-2" style={{ borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
        <div className="row mb-1" style={{ display: 'flex', fontSize: '11px' }}>
          <div style={{ width: '60%', textAlign: 'left' }}>جمع کل (ریال):</div>
          <div style={{ width: '40%', textAlign: 'left' }}>{totalAmount.toLocaleString('fa-IR')}</div>
        </div>
        <div className="row mb-1" style={{ display: 'flex', fontSize: '11px' }}>
          <div style={{ width: '60%', textAlign: 'left' }}>مالیات (ریال):</div>
          <div style={{ width: '40%', textAlign: 'left' }}>{taxAmount.toLocaleString('fa-IR')}</div>
        </div>
        <div className="row mb-1" style={{ display: 'flex', fontSize: '12px', fontWeight: 'bold' }}>
          <div style={{ width: '60%', textAlign: 'left' }}>قابل پرداخت:</div>
          <div style={{ width: '40%', textAlign: 'left' }}>{finalAmount.toLocaleString('fa-IR')}</div>
        </div>
      </div>

      {/* پیام‌های پایانی */}
      <div className="footer-messages text-center" style={{ fontSize: '9px', lineHeight: '1.3' }}>
        <div style={{ marginBottom: '3px' }}>یک نماینده و پتانسیل و سه موثر</div>
        <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>
          با مصرف کمتر کیسه پلاستیکی، با طبیعت آشتی کنیم
        </div>
        <div style={{ borderTop: '1px dashed #000', paddingTop: '3px' }}>
          با تشکر از خرید شما
        </div>
        <div style={{ fontSize: '8px', marginTop: '3px' }}>
          {printDate} - {printTime}
        </div>
      </div>

      {/* خط برش */}
      <div style={{ 
        borderTop: '2px dashed #000', 
        marginTop: '10px',
        textAlign: 'center',
        fontSize: '8px',
        paddingTop: '2px'
      }}>
        *** خط برش ***
      </div>
    </div>
  )
}