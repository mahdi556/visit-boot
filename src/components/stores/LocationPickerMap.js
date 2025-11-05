"use client";

import { useEffect, useRef, useState } from "react";

export default function LocationPickerMap({
  onLocationSelect,
  onLocationConfirm,
  initialLocation,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let map;
    let L;

    const initializeMap = async () => {
      try {
        // بارگذاری Leaflet
        L = await import("leaflet");
        require("leaflet/dist/leaflet.css");

        // حل مشکل آیکون‌ها
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // موقعیت پیش‌فرض
        const defaultLocation = initialLocation || {
          lat: 35.6892,
          lng: 51.389,
        };

        // ایجاد نقشه
        map = L.map(mapContainerRef.current).setView(
          [defaultLocation.lat, defaultLocation.lng],
          13
        );
        mapInstanceRef.current = map;

        // اضافه کردن لایه نقشه
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // ایجاد آیکون سفارشی
        const storeIcon = new L.Icon({
          iconUrl:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
              <path fill="#6C63FF" d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.5 12.5 41 12.5 41S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0Z"/>
              <path fill="white" d="M12.5 7C9.5 7 7 9.5 7 12.5C7 15.5 9.5 18 12.5 18C15.5 18 18 15.5 18 12.5C18 9.5 15.5 7 12.5 7Z"/>
              <rect fill="#6C63FF" x="10" y="12" width="5" height="2"/>
              <rect fill="#6C63FF" x="12" y="10" width="1" height="6"/>
            </svg>
          `),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        // اگر موقعیت اولیه وجود دارد
        if (initialLocation) {
          placeMarker(
            initialLocation.lat,
            initialLocation.lng,
            map,
            L,
            storeIcon
          );
        }

        // رویداد کلیک روی نقشه
        map.on("click", function (e) {
          const { lat, lng } = e.latlng;
          placeMarker(lat, lng, map, L, storeIcon);
          setSelectedLocation({ lat, lng });
          onLocationSelect(lat, lng);
        });

        // اضافه کردن دکمه موقعیت فعلی
        addLocationButton(map, L, storeIcon);

        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    const addLocationButton = (map, L, storeIcon) => {
      const locateControl = L.control({ position: "topright" });

      locateControl.onAdd = function (map) {
        const div = L.DomUtil.create("div", "locate-control");
        const button = L.DomUtil.create("button", "", div);
        button.innerText = "📍 موقعیت من";

        Object.assign(button.style, {
          background: "white",
          border: "none",
          borderRadius: "4px",
          padding: "8px 12px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          fontFamily: "Vazirmatn, sans-serif",
        });

        // جلوگیری از تداخل با تعامل نقشه
        L.DomEvent.disableClickPropagation(button);

        // اضافه کردن eventListener امن‌تر از inline onclick
        button.addEventListener("click", () => {
          if (!navigator.geolocation) {
            alert("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند");
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              map.setView([lat, lng], 16);
              placeMarker(lat, lng, map, L, storeIcon);
              setSelectedLocation({ lat, lng });
              onLocationSelect(lat, lng);
            },
            (error) => {
              alert("خطا در دریافت موقعیت: " + error.message);
            }
          );
        });

        return div;
      };

      locateControl.addTo(map);
    };

    const placeMarker = (lat, lng, map, L, storeIcon) => {
      // حذف مارکر قبلی
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // ایجاد مارکر جدید
      markerRef.current = L.marker([lat, lng], {
        icon: storeIcon,
        draggable: true,
      }).addTo(map);

      // پاپ‌آپ
      markerRef.current
        .bindPopup(
          `
        <div style="font-family: Vazirmatn, sans-serif; text-align: center; min-width: 200px;">
          <h6 style="margin: 0 0 10px 0;">🏪 موقعیت فروشگاه</h6>
          <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #666;">
              <div>عرض: ${lat.toFixed(6)}</div>
              <div>طول: ${lng.toFixed(6)}</div>
            </div>
          </div>
          <button 
            onclick="confirmLocation(${lat}, ${lng})"
            style="
              background: #28a745; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 4px; 
              cursor: pointer; 
              width: 100%;
            "
          >
            تایید موقعیت
          </button>
        </div>
      `
        )
        .openPopup();

      // رویداد کشیدن مارکر
      markerRef.current.on("dragend", function (e) {
        const marker = e.target;
        const position = marker.getLatLng();
        setSelectedLocation({ lat: position.lat, lng: position.lng });
        onLocationSelect(position.lat, position.lng);
      });

      // تابع تایید موقعیت
      window.confirmLocation = (lat, lng) => {
        onLocationConfirm(lat, lng);
      };
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
      if (window.locateUser) {
        delete window.locateUser;
      }
      if (window.confirmLocation) {
        delete window.confirmLocation;
      }
    };
  }, [isClient, initialLocation, onLocationSelect, onLocationConfirm]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationConfirm(selectedLocation.lat, selectedLocation.lng);
    }
  };

  if (!isClient) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "500px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری نقشه...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="location-picker">
      <div
        ref={mapContainerRef}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "8px",
          border: "2px solid #dee2e6",
        }}
      />

      <div className="p-3 border-top bg-light">
        <div className="row align-items-center">
          <div className="col-md-8">
            {selectedLocation ? (
              <div>
                <strong>موقعیت انتخاب شده:</strong>
                <div className="text-muted small mt-1">
                  عرض: {selectedLocation.lat.toFixed(6)} | طول:{" "}
                  {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="text-muted">
                لطفا روی نقشه کلیک کنید تا موقعیت را انتخاب کنید
              </div>
            )}
          </div>
          <div className="col-md-4 text-end">
            <button
              className="btn btn-success"
              onClick={handleConfirm}
              disabled={!selectedLocation}
            >
              تایید و بستن نقشه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
