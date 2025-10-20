'use client'

import { useEffect, useState, useRef } from 'react'

export default function StoreMap() {
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      const data = await response.json()
      setStores(data)
      initializeMap(data)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeMap = (storesData) => {
    if (typeof window !== 'undefined' && window.L && storesData.length > 0) {
      const L = window.L
      
      // پیدا کردن مرکز نقشه بر اساس فروشگاه‌ها
      const hasLocationStores = storesData.filter(store => store.latitude && store.longitude)
      
      if (hasLocationStores.length > 0) {
        const centerLat = hasLocationStores.reduce((sum, store) => sum + parseFloat(store.latitude), 0) / hasLocationStores.length
        const centerLng = hasLocationStores.reduce((sum, store) => sum + parseFloat(store.longitude), 0) / hasLocationStores.length
        
        const map = L.map('storesMap').setView([centerLat, centerLng], 12)
        mapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // اضافه کردن مارکر برای هر فروشگاه
        hasLocationStores.forEach(store => {
          const markerColor = getMarkerColor(store.storeType)
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: ${markerColor};
                width: 32px;
                height: 32px;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                <i class="bi bi-shop" style="font-size: 14px;"></i>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })

          const marker = L.marker([store.latitude, store.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h6 style="margin: 0 0 8px 0; color: #6C63FF;">${store.name}</h6>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                  <i class="bi bi-person"></i> ${store.ownerName}
                </p>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                  <i class="bi bi-telephone"></i> ${store.phone}
                </p>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                  <i class="bi bi-geo-alt"></i> ${store.address}
                </p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                  <i class="bi bi-cart"></i> ${store._count?.orders || 0} سفارش
                </p>
              </div>
            `)

          marker.on('click', () => {
            setSelectedStore(store)
          })
        })
      }
    }
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

  // بقیه کد...
}