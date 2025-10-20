'use client'

import { useEffect, useRef, useState } from 'react'

export default function LocationPickerMap({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !isMapInitialized) {
      initializeMap()
    }

    return () => {
      // Cleanup when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [isMapInitialized])

  useEffect(() => {
    // اگر موقعیت اولیه تغییر کرد و نقشه initialize شده، مارکر را آپدیت کن
    if (isMapInitialized && initialLocation && mapInstanceRef.current) {
      const L = window.L
      placeMarker(initialLocation.lat, initialLocation.lng, mapInstanceRef.current, L)
    }
  }, [initialLocation, isMapInitialized])

  const initializeMap = async () => {
    try {
      const L = await import('leaflet')
      require('leaflet/dist/leaflet.css')

      // موقعیت پیش‌فرض (تهران)
      const defaultLocation = initialLocation || { lat: 35.6892, lng: 51.3890 }
      
      // بررسی کن که آیا نقشه قبلاً initialize شده
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // ایجاد نقشه
      const map = L.map('locationPickerMap', {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([defaultLocation.lat, defaultLocation.lng], 13)
      
      mapInstanceRef.current = map
      setIsMapInitialized(true)

      // اضافه کردن لایه نقشه
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map)

      // اگر موقعیت اولیه وجود دارد، مارکر قرار بده
      if (initialLocation) {
        placeMarker(initialLocation.lat, initialLocation.lng, map, L)
      }

      // اضافه کردن event listener برای کلیک روی نقشه
      map.on('click', function(e) {
        const { lat, lng } = e.latlng
        placeMarker(lat, lng, map, L)
        setSelectedLocation({ lat, lng })
      })

      // اضافه کردن کنترل جستجو
      addSearchControl(map, L)

    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  const addSearchControl = (map, L) => {
    const searchControl = L.control({ position: 'topright' })
    
    searchControl.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'search-control')
      // جلوگیری از event bubbling برای کلیک
      L.DomEvent.disableClickPropagation(div)
      
      div.innerHTML = `
        <div class="input-group input-group-sm">
          <input type="text" class="form-control" placeholder="جستجوی آدرس..." id="addressSearch">
          <button class="btn btn-outline-secondary" type="button" id="searchButton">
            <i class="bi bi-search"></i>
          </button>
        </div>
      `
      return div
    }
    
    searchControl.addTo(map)

    // هندل کردن جستجوی آدرس
    setTimeout(() => {
      const searchInput = document.getElementById('addressSearch')
      const searchButton = document.getElementById('searchButton')

      if (searchInput && searchButton) {
        const handleSearch = () => {
          searchAddress(searchInput.value, map, L)
        }

        searchButton.addEventListener('click', handleSearch)
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            searchAddress(searchInput.value, map, L)
          }
        })

        // Cleanup function
        return () => {
          searchButton.removeEventListener('click', handleSearch)
        }
      }
    }, 100)
  }

  const placeMarker = (lat, lng, map, L) => {
    // حذف مارکر قبلی اگر وجود دارد
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
    }

    // ایجاد آیکون سفارشی
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: #6C63FF;
          width: 30px;
          height: 30px;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">
          <i class="bi bi-shop" style="font-size: 12px;"></i>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })

    // ایجاد مارکر جدید
    markerRef.current = L.marker([lat, lng], { 
      icon: customIcon,
      draggable: true 
    }).addTo(map)

    // popup اطلاعات موقعیت
    markerRef.current.bindPopup(`
      <div class="text-center" style="font-family: 'Vazirmatn', sans-serif;">
        <h6 style="margin-bottom: 10px;">موقعیت انتخاب شده</h6>
        <p style="margin: 5px 0; font-size: 12px;">عرض: ${lat.toFixed(6)}</p>
        <p style="margin: 5px 0; font-size: 12px;">طول: ${lng.toFixed(6)}</p>
        <button onclick="window.confirmSelectedLocation()" 
          style="
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            margin-top: 8px;
          ">
          تایید موقعیت
        </button>
      </div>
    `).openPopup()

    // اضافه کردن تابع confirm به window
    window.confirmSelectedLocation = () => {
      onLocationSelect(lat, lng)
    }

    // امکان جابجایی مارکر
    markerRef.current.on('dragend', function(event) {
      const marker = event.target
      const position = marker.getLatLng()
      setSelectedLocation({ lat: position.lat, lng: position.lng })
      markerRef.current.setLatLng(position)
    })
  }

  const searchAddress = async (query, map, L) => {
    if (!query.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=fa`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        map.setView([lat, lng], 16)
        placeMarker(lat, lng, map, L)
        setSelectedLocation({ lat, lng })
      } else {
        alert('آدرس یافت نشد')
      }
    } catch (error) {
      console.error('Error searching address:', error)
      alert('خطا در جستجوی آدرس')
    }
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng)
    }
  }

  const handleReset = () => {
    if (mapInstanceRef.current && initialLocation) {
      const L = window.L
      mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], 13)
      placeMarker(initialLocation.lat, initialLocation.lng, mapInstanceRef.current, L)
      setSelectedLocation(initialLocation)
    }
  }

  return (
    <div className="location-picker">
      <div className="p-3 border-bottom bg-light">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h6 className="mb-0">انتخاب موقعیت روی نقشه</h6>
            <small className="text-muted">
              روی نقشه کلیک کنید یا آدرس را جستجو کنید
            </small>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={handleReset}
            >
              بازنشانی
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={handleConfirm}
              disabled={!selectedLocation}
            >
              تایید موقعیت
            </button>
          </div>
        </div>
      </div>

      <div 
        id="locationPickerMap" 
        style={{ 
          height: '400px', 
          width: '100%',
          minHeight: '400px'
        }}
      />
      
      <div className="p-3 border-top">
        <div className="row align-items-center">
          <div className="col-md-8">
            {selectedLocation ? (
              <div>
                <strong>موقعیت انتخاب شده:</strong>
                <div className="text-muted small mt-1">
                  عرض جغرافیایی: <code>{selectedLocation.lat.toFixed(6)}</code>
                </div>
                <div className="text-muted small">
                  طول جغرافیایی: <code>{selectedLocation.lng.toFixed(6)}</code>
                </div>
              </div>
            ) : (
              <div className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                لطفا روی نقشه کلیک کنید تا موقعیت را انتخاب کنید
              </div>
            )}
          </div>
          <div className="col-md-4 text-end">
            <small className="text-muted">
              برای جابجایی مارکر، آن را بکشید
            </small>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .search-control {
          background: white;
          padding: 8px;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
          direction: rtl;
        }
        
        .search-control .form-control {
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          font-family: 'Vazirmatn', sans-serif;
        }
        
        .search-control .btn {
          border: 1px solid #ced4da;
          border-right: none;
          border-radius: 0.375rem 0 0 0.375rem;
        }
        
        .leaflet-popup-content {
          margin: 12px 16px;
          font-family: 'Vazirmatn', sans-serif;
          direction: rtl;
          text-align: right;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}