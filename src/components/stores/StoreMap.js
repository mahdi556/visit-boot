'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// بارگذاری نقشه فقط در سمت کلاینت
const StoreMapContent = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">در حال بارگذاری نقشه...</span>
      </div>
    </div>
  )
})

function MapContent({ stores, selectedStore, setSelectedStore }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeMap = async () => {
      try {
        // بارگذاری Leaflet
        const L = await import('leaflet')
        require('leaflet/dist/leaflet.css')

        // حل مشکل آیکون‌های پیش‌فرض
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // پیدا کردن مرکز نقشه
        const hasLocationStores = stores.filter(store => store.latitude && store.longitude)
        
        let centerLat = 35.6892 // تهران
        let centerLng = 51.3890
        let zoom = 10

        if (hasLocationStores.length > 0) {
          centerLat = hasLocationStores.reduce((sum, store) => sum + parseFloat(store.latitude), 0) / hasLocationStores.length
          centerLng = hasLocationStores.reduce((sum, store) => sum + parseFloat(store.longitude), 0) / hasLocationStores.length
          zoom = 11
        }
        
        // ایجاد نقشه
        const map = L.map('storesMap').setView([centerLat, centerLng], zoom)
        mapInstanceRef.current = map

        // اضافه کردن لایه نقشه
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // اضافه کردن مارکر برای هر فروشگاه
        addStoreMarkers(map, L, hasLocationStores, setSelectedStore)

        // اگر هیچ فروشگاهی موقعیت ندارد
        if (hasLocationStores.length === 0) {
          L.marker([centerLat, centerLng]).addTo(map)
            .bindPopup('هیچ فروشگاهی با موقعیت جغرافیایی یافت نشد')
            .openPopup()
        }

        // اضافه کردن event listener برای فیلترها
        setupFilterButtons(map, L, hasLocationStores, setSelectedStore)

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    const addStoreMarkers = (map, L, stores, setSelectedStore) => {
      // پاک کردن مارکرهای قبلی
      markersRef.current.forEach(marker => map.removeLayer(marker))
      markersRef.current = []

      stores.forEach(store => {
        const markerColor = getMarkerColor(store.storeType)
        
        const customIcon = L.divIcon({
          className: `custom-store-marker marker-${store.storeType?.toLowerCase()}`,
          html: `
            <div style="
              background: ${markerColor};
              width: 36px;
              height: 36px;
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              box-shadow: 0 3px 10px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <i class="bi bi-shop"></i>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })

        const marker = L.marker([store.latitude, store.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px; font-family: Vazirmatn, sans-serif; text-align: center;">
              <h6 style="margin: 0 0 8px 0; color: #6C63FF;">${store.name}</h6>
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${store.address}</p>
              <small style="color: #888;">${store._count?.orders || 0} سفارش</small>
            </div>
          `)

        marker.storeData = store
        markersRef.current.push(marker)

        marker.on('click', () => {
          setSelectedStore(store)
          // نمایش اطلاعات فروشگاه
          const storeInfo = document.getElementById('storeInfo')
          if (storeInfo) {
            document.getElementById('storeName').textContent = store.name
            document.getElementById('storeAddress').textContent = store.address
            document.getElementById('storePhone').textContent = store.phone
            document.getElementById('storeOwner').textContent = store.ownerName
            document.getElementById('storeSales').textContent = `فروش ماه: ${store._count?.orders || 0} سفارش`
            document.getElementById('storeRating').textContent = `امتیاز: 4.5/5`
            storeInfo.style.display = 'block'
          }
        })
      })
    }

    const setupFilterButtons = (map, L, stores, setSelectedStore) => {
      const filterButtons = document.querySelectorAll('.filter-btn')
      
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          const type = this.getAttribute('data-store-type')
          
          // Update active button
          filterButtons.forEach(btn => {
            btn.classList.remove('active')
          })
          this.classList.add('active')
          
          // Show/hide markers based on type
          markersRef.current.forEach(marker => {
            if (type === 'all' || marker.storeData.storeType?.toLowerCase() === type) {
              map.addLayer(marker)
            } else {
              map.removeLayer(marker)
            }
          })
        })
      })
    }

    const getMarkerColor = (type) => {
      const colors = {
        SUPERMARKET: '#6C63FF',
        GROCERY: '#36D1DC',
        CONVENIENCE: '#FF6584',
        HYPERMARKET: '#4A44C6'
      }
      return colors[type] || '#6C63FF'
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [stores, setSelectedStore])

  return (
    <div 
      id="storesMap" 
      style={{ 
        height: '500px', 
        width: '100%',
        borderRadius: '12px'
      }}
    />
  )
}

export default function StoreMap() {
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      const data = await response.json()
      setStores(data)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = () => {
    if (selectedStore) {
      // هدایت به صفحه جزئیات فروشگاه
      window.location.href = `/stores/${selectedStore.id}`
    }
  }

  if (isLoading) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                نقشه فروشگاه‌ها
              </h5>
              <div className="btn-group btn-group-sm">
                <button className="btn filter-btn active" data-store-type="all">همه</button>
                <button className="btn filter-btn" data-store-type="supermarket">سوپرمارکت</button>
                <button className="btn filter-btn" data-store-type="grocery">بقالی</button>
                <button className="btn filter-btn" data-store-type="convenience">مینی‌مارکت</button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="map-container">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">در حال بارگذاری نقشه...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-geo-alt-fill text-primary me-2"></i>
              نقشه فروشگاه‌ها
            </h5>
            <div className="btn-group btn-group-sm">
              <button className="btn filter-btn active" data-store-type="all">همه</button>
              <button className="btn filter-btn" data-store-type="supermarket">سوپرمارکت</button>
              <button className="btn filter-btn" data-store-type="grocery">بقالی</button>
              <button className="btn filter-btn" data-store-type="convenience">مینی‌مارکت</button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="map-container">
              <StoreMapContent 
                stores={stores} 
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
              />
              <div className="store-info" id="storeInfo">
                <h5 id="storeName">نام فروشگاه</h5>
                <div className="store-details">
                  <div className="mb-2">
                    <i className="bi bi-geo-alt"></i>
                    <span id="storeAddress">آدرس فروشگاه</span>
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-telephone"></i>
                    <span id="storePhone">شماره تماس</span>
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-person"></i>
                    <span id="storeOwner">نام مالک</span>
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-cart"></i>
                    <span id="storeSales">فروش ماه: 12,450,000 تومان</span>
                  </div>
                  <div>
                    <i className="bi bi-star"></i>
                    <span id="storeRating">امتیاز: 4.5/5</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary mt-3 w-100"
                  onClick={handleViewDetails}
                >
                  مشاهده جزئیات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}