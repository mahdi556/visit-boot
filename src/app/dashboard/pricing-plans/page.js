// 📂 src/app/dashboard/pricing-plans/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PricingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pricing-plans');
      if (!response.ok) {
        throw new Error('خطا در دریافت طرح‌ها');
      }
      const data = await response.json();
      // مطمئن شویم data یک آرایه است و هر آیتم معتبر باشد
      const validPlans = Array.isArray(data) 
        ? data.filter(plan => plan && typeof plan === 'object' && plan.id)
        : [];
      setPlans(validPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/pricing-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: ''
        });
        fetchPlans();
        alert('طرح قیمت‌گذاری با موفقیت ایجاد شد');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'خطا در ایجاد طرح');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('خطا در ایجاد طرح');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'تعیین نشده';
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch {
      return 'نامعتبر';
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <span className="ms-3">در حال بارگذاری طرح‌ها...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">مدیریت طرح‌های قیمت‌گذاری</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          طرح جدید
        </button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="row">
          {plans.map(plan => {
            // بررسی معتبر بودن هر plan
            if (!plan || !plan.id) {
              console.warn('Invalid plan found:', plan);
              return null; // از نمایش آیتم‌های نامعتبر صرف‌نظر کن
            }
            
            return (
              <div key={plan.id} className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{plan.name || 'بدون نام'}</h5>
                    <span className={`badge ${plan.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {plan.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                  <div className="card-body">
                    {plan.description && (
                      <p className="card-text">{plan.description}</p>
                    )}
                    
                    <div className="mb-3">
                      <small className="text-muted">
                        تاریخ شروع: {formatDate(plan.startDate)}
                      </small>
                      {plan.endDate && (
                        <small className="text-muted d-block">
                          تاریخ پایان: {formatDate(plan.endDate)}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <h6>وضعیت:</h6>
                      <div className="text-sm">
                        {plan.isActive ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            فعال
                          </span>
                        ) : (
                          <span className="text-secondary">
                            <i className="bi bi-x-circle me-1"></i>
                            غیرفعال
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        شناسه: {plan.id}
                      </small>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link 
                      href={`/dashboard/products?pricingPlan=${plan.id}`}
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="bi bi-tags me-1"></i>
                      مدیریت محصولات
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-tags display-1 text-muted mb-3"></i>
          <h5 className="text-muted">هیچ طرح قیمت‌گذاری یافت نشد</h5>
          <p className="text-muted mb-4">برای شروع، اولین طرح قیمت‌گذاری را ایجاد کنید.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            ایجاد اولین طرح
          </button>
        </div>
      )}

      {/* مودال ایجاد طرح جدید */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ایجاد طرح قیمت‌گذاری جدید</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">نام طرح *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="مثال: طرح تخفیف پلکانی"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">توضیحات</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      placeholder="توضیحات اختیاری درباره طرح..."
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">تاریخ شروع *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">تاریخ پایان</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                        <small className="text-muted">خالی بگذارید برای نامحدود</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    انصراف
                  </button>
                  <button type="submit" className="btn btn-primary">
                    ایجاد طرح
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}