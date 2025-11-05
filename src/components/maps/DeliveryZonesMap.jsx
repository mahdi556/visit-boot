// src/components/maps/DeliveryZonesMap.jsx - نسخه اصلاح شده
"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const DeliveryZonesContent = dynamic(
  () => Promise.resolve(DeliveryZonesContentComponent),
  {
    ssr: false,
    loading: () => (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "600px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری نقشه...</span>
        </div>
      </div>
    ),
  }
);

function DeliveryZonesContentComponent({
  zones,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  stores,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [activeZone, setActiveZone] = useState(null);

  // آرایه رنگ‌های پیش‌فرض برای مناطق
  const zoneColors = [
    "#6C63FF",
    "#36D1DC",
    "#FF6584",
    "#4A44C6",
    "#FF9A3D",
    "#6BD425",
    "#E83F6F",
    "#32936F",
    "#FF6B6B",
    "#48BFE3",
    "#9B5DE5",
    "#00BBF9",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeMap = async () => {
      try {
        // بارگذاری Leaflet
        const L = await import("leaflet");
        require("leaflet/dist/leaflet.css");

        // حل مشکل آیکون‌های پیش‌فرض
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // موقعیت پیش‌فرض (تهران)
        const centerLat = 32.66074;
        const centerLng = 51.67344;

        // ایجاد نقشه
        const map = L.map("deliveryZonesMap").setView(
          [centerLat, centerLng],
          11
        );
        mapInstanceRef.current = map;

        // اضافه کردن لایه نقشه
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // ایجاد لایه برای اشکال کشیده شده
        drawnItemsRef.current = new L.FeatureGroup();
        map.addLayer(drawnItemsRef.current);

        // اضافه کردن کنترل رسم ساده
        addSimpleDrawingControls(map, L);

        // اضافه کردن مناطق موجود با استایل‌های زیبا
        addExistingZones(map, L, zones);

        // اضافه کردن فروشگاه‌ها
        addStoresToMap(map, L, stores);

        console.log("Delivery zones map initialized successfully");
      } catch (error) {
        console.error("Error initializing delivery zones map:", error);
      }
    };

    const addExistingZones = (map, L, zones) => {
      zones.forEach((zone, index) => {
        if (zone.coordinates && zone.coordinates.length > 0) {
          // انتخاب رنگ از آرایه یا استفاده از رنگ تعریف شده
          const zoneColor = zone.color || zoneColors[index % zoneColors.length];

          const polygon = L.polygon(zone.coordinates, {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.4,
            weight: 3,
            opacity: 0.8,
            className: "delivery-zone-polygon",
          }).addTo(drawnItemsRef.current);

          polygon.zoneData = zone;

          // پاپ‌آپ زیباتر
          polygon.bindPopup(createZonePopup(zone));

          // hover effects
          polygon.on("mouseover", function () {
            this.setStyle({
              fillOpacity: 0.6,
              weight: 4,
            });
          });

          polygon.on("mouseout", function () {
            this.setStyle({
              fillOpacity: 0.4,
              weight: 3,
            });
          });
        }
      });
    };

    // تابع ایجاد پاپ‌آپ زیبا برای مناطق
    const createZonePopup = (zone) => {
      const popupContent = `
        <div style="font-family: Vazirmatn, sans-serif; min-width: 280px; background: linear-gradient(135deg, ${
          zone.color
        }20, #ffffff); border-radius: 10px; padding: 15px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 20px; height: 20px; background: ${
              zone.color
            }; border-radius: 50%; margin-left: 10px;"></div>
            <h6 style="margin: 0; color: #2d3748; font-weight: 600;">${
              zone.name
            }</h6>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div>
                <strong>💰 هزینه:</strong>
                <div style="color: #38a169; font-weight: 600;">${zone.deliveryCost?.toLocaleString(
                  "fa-IR"
                )} تومان</div>
              </div>
              <div>
                <strong>⏱️ زمان:</strong>
                <div style="color: #3182ce; font-weight: 600;">${
                  zone.deliveryTime
                } ساعت</div>
              </div>
              <div>
                <strong>📐 مساحت:</strong>
                <div style="color: #6C63FF; font-weight: 600;">${(
                  zone.area || 0
                ).toFixed(2)} کیلومتر</div>
              </div>
              <div>
                <strong>🏪 فروشگاه:</strong>
                <div style="color: #dd6b20; font-weight: 600;">${
                  zone.storeCount
                } عدد</div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="editZone('${zone.id}')"
              style="flex: 1; background: linear-gradient(135deg, #ffc107, #ffb300); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
            >
              ✏️ ویرایش
            </button>
            <button 
              onclick="deleteZone('${zone.id}')"
              style="flex: 1; background: linear-gradient(135deg, #dc3545, #c53030); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
            >
              🗑️ حذف
            </button>
          </div>
        </div>
      `;
      return popupContent;
    };

    const addStoresToMap = (map, L, stores) => {
      const hasLocationStores = stores.filter(
        (store) => store.latitude && store.longitude
      );

      hasLocationStores.forEach((store) => {
        // آیکون سفارشی برای فروشگاه‌ها
        const storeIcon = L.divIcon({
          className: "custom-store-icon",
          html: `
            <div style="
              background: linear-gradient(135deg, #10b981, #059669);
              width: 32px;
              height: 32px;
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
              🏪
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([store.latitude, store.longitude], {
          icon: storeIcon,
        }).addTo(map).bindPopup(`
            <div style="font-family: Vazirmatn, sans-serif; min-width: 220px;">
              <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 10px; border-radius: 8px 8px 0 0; margin: -10px -10px 10px -10px;">
                <h6 style="margin: 0; font-weight: 600;">${store.name}</h6>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${store.address}</p>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${store.storeType}</span>
                <span style="background: #fed7d7; color: #c53030; padding: 4px 8px; border-radius: 4px;">${store.phone}</span>
              </div>
            </div>
          `);
      });
    };

    // در بخش addSimpleDrawingControls - اصلاح event listeners
    const addSimpleDrawingControls = (map, L) => {
      // ایجاد کنترل‌های ساده برای رسم
      const drawControl = L.control({ position: "topright" });

      drawControl.onAdd = function (map) {
        const div = L.DomUtil.create("div", "draw-control");
        div.innerHTML = `
      <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0;">
        <h6 style="margin: 0 0 8px 0; font-size: 14px; color: #2d3748; text-align: center;">ابزار رسم</h6>
        <button id="startDrawing" style="background: linear-gradient(135deg, #6C63FF, #4A44C6); color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; margin-bottom: 8px; width: 100%; font-weight: 500; transition: all 0.3s;">
          📐 شروع رسم منطقه
        </button>
        <button id="clearDrawing" style="background: linear-gradient(135deg, #e53e3e, #c53030); color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 500; transition: all 0.3s;">
          🗑️ پاک کردن
        </button>
      </div>
    `;

        // جلوگیری از انتشار event‌ها به نقشه
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);

        // اضافه کردن استایل‌های hover
        const startBtn = div.querySelector("#startDrawing");
        const clearBtn = div.querySelector("#clearDrawing");

        // جلوگیری از انتشار event برای دکمه‌ها
        L.DomEvent.on(startBtn, "click", L.DomEvent.stop);
        L.DomEvent.on(clearBtn, "click", L.DomEvent.stop);

        startBtn.addEventListener("mouseover", () => {
          startBtn.style.transform = "translateY(-2px)";
          startBtn.style.boxShadow = "0 6px 20px rgba(108, 99, 255, 0.4)";
        });

        startBtn.addEventListener("mouseout", () => {
          startBtn.style.transform = "translateY(0)";
          startBtn.style.boxShadow = "none";
        });

        clearBtn.addEventListener("mouseover", () => {
          clearBtn.style.transform = "translateY(-2px)";
          clearBtn.style.boxShadow = "0 6px 20px rgba(229, 62, 62, 0.4)";
        });

        clearBtn.addEventListener("mouseout", () => {
          clearBtn.style.transform = "translateY(0)";
          clearBtn.style.boxShadow = "none";
        });

        // event listeners برای دکمه‌ها
        startBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // جلوگیری از انتشار event
          startDrawing();
        });

        clearBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // جلوگیری از انتشار event
          clearDrawing();
        });

        return div;
      };

      drawControl.addTo(map);

      // متغیرهای مدیریت رسم
      let isDrawing = false;
      let currentPolygon = null;
      let points = [];
      let currentColorIndex = 0;

      const startDrawing = () => {
        isDrawing = true;
        points = [];
        if (currentPolygon) {
          map.removeLayer(currentPolygon);
          currentPolygon = null;
        }

        // انتخاب رنگ جدید
        const zoneColor = zoneColors[currentColorIndex % zoneColors.length];
        currentColorIndex++;

        alert(
          'حالت رسم فعال شد! روی نقشه کلیک کنید تا نقاط منطقه را مشخص کنید. برای تکمیل منطقه، روی اولین نقطه کلیک کنید یا دکمه "تکمیل رسم" را بزنید.'
        );

        // اضافه کردن کنترل تکمیل رسم
        addFinishControl(map, L, zoneColor);
      };

      const clearDrawing = () => {
        isDrawing = false;
        points = [];
        if (currentPolygon) {
          map.removeLayer(currentPolygon);
          currentPolygon = null;
        }
        removeFinishControl();
        alert("منطقه رسم شده پاک شد.");
      };

      // رویداد کلیک روی نقشه
      map.on("click", function (e) {
        if (!isDrawing) return;

        const point = e.latlng;
        points.push(point);

        // ایجاد یا آپدیت پلیگان
        if (currentPolygon) {
          map.removeLayer(currentPolygon);
        }

        const zoneColor =
          zoneColors[(currentColorIndex - 1) % zoneColors.length];

        if (points.length >= 3) {
          currentPolygon = L.polygon(points, {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.4,
            weight: 3,
            opacity: 0.8,
            className: "delivery-zone-polygon new-zone",
          }).addTo(drawnItemsRef.current);

          // بررسی بسته شدن پلیگان (کلیک روی نقطه اول)
          if (points.length > 3) {
            const firstPoint = points[0];
            const distance = map.distance(firstPoint, point);
            if (distance < 50) {
              // اگر نزدیک نقطه اول باشد
              finishDrawing();
              return;
            }
          }
        } else if (points.length === 2) {
          // رسم خط موقت بین نقاط
          currentPolygon = L.polyline(points, {
            color: zoneColor,
            weight: 2,
            dashArray: "5, 5",
            opacity: 0.6,
          }).addTo(map);
        } else if (points.length === 1) {
          // نمایش نقطه اول
          currentPolygon = L.circleMarker(points[0], {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.8,
            radius: 6,
          }).addTo(map);
        }
      });

      const addFinishControl = (map, L, zoneColor) => {
        const finishControl = L.control({ position: "bottomright" });

        finishControl.onAdd = function (map) {
          const div = L.DomUtil.create("div", "finish-control");
          div.innerHTML = `
        <button id="finishDrawing" style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s;">
          ✅ تکمیل رسم منطقه
        </button>
      `;

          // جلوگیری از انتشار event‌ها
          L.DomEvent.disableClickPropagation(div);
          L.DomEvent.disableScrollPropagation(div);

          const finishBtn = div.querySelector("#finishDrawing");
          L.DomEvent.on(finishBtn, "click", L.DomEvent.stop);

          finishBtn.addEventListener("mouseover", () => {
            finishBtn.style.transform = "translateY(-2px)";
            finishBtn.style.boxShadow = "0 6px 20px rgba(72, 187, 120, 0.4)";
          });

          finishBtn.addEventListener("mouseout", () => {
            finishBtn.style.transform = "translateY(0)";
            finishBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          });

          finishBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            finishDrawing();
          });

          return div;
        };

        finishControl.addTo(map);
        window.finishControl = finishControl;
      };

      const removeFinishControl = () => {
        if (window.finishControl) {
          mapInstanceRef.current.removeControl(window.finishControl);
          window.finishControl = null;
        }
      };

      const finishDrawing = () => {
        if (points.length >= 3 && currentPolygon) {
          // محاسبه مساحت
          const area = calculatePolygonArea(points);
          const zoneColor =
            zoneColors[(currentColorIndex - 1) % zoneColors.length];

          // نمایش فرم ایجاد منطقه
          showZoneCreationForm(currentPolygon, area, points, zoneColor);
          isDrawing = false;
          removeFinishControl();
        } else {
          alert("لطفاً حداقل ۳ نقطه روی نقشه مشخص کنید.");
        }
      };

      // تابع محاسبه مساحت
      const calculatePolygonArea = (points) => {
        let area = 0;
        const n = points.length;

        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += points[i].lng * points[j].lat;
          area -= points[j].lng * points[i].lat;
        }

        return Math.abs(area / 2) * 111.32 * 111.32; // تبدیل به کیلومتر مربع
      };
    };

    const showZoneCreationForm = (polygon, area, coordinates, zoneColor) => {
      const popupContent = `
        <div style="font-family: Vazirmatn, sans-serif; min-width: 320px; background: linear-gradient(135deg, ${zoneColor}20, #ffffff); border-radius: 12px; padding: 20px; border: 2px solid ${zoneColor}40;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 24px; height: 24px; background: ${zoneColor}; border-radius: 50%; margin-left: 10px;"></div>
            <h6 style="margin: 0; color: #2d3748; font-weight: 600;">ایجاد منطقه پخش جدید</h6>
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #4a5568;">نام منطقه:</label>
            <input 
              id="newZoneName" 
              type="text" 
              placeholder="مثلاً: منطقه ۱، مرکز شهر" 
              style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border 0.3s;"
              onfocus="this.style.borderColor='${zoneColor}'"
            />
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #4a5568;">هزینه (تومان):</label>
              <input 
                id="newZoneCost" 
                type="number" 
                value="20000" 
                style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #4a5568;">زمان (ساعت):</label>
              <input 
                id="newZoneTime" 
                type="number" 
                value="2" 
                min="1" 
                max="24"
                style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
              />
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #4a5568;">رنگ منطقه:</label>
            <input 
              id="newZoneColor" 
              type="color" 
              value="${zoneColor}"
              style="width: 100%; height: 45px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer;"
            />
          </div>
          
          <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center;">
            <div style="font-size: 13px; color: #718096;">
              <strong>📐 مساحت تقریبی:</strong>
              <div style="color: ${zoneColor}; font-weight: 600; font-size: 16px; margin-top: 4px;">${area.toFixed(
        2
      )} کیلومتر مربع</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="saveNewZone()"
              style="flex: 1; background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              💾 ذخیره منطقه
            </button>
            <button 
              onclick="cancelNewZone()"
              style="flex: 1; background: linear-gradient(135deg, #a0aec0, #718096); color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              ❌ انصراف
            </button>
          </div>
        </div>
      `;

      const popup = L.popup()
        .setLatLng(polygon.getBounds().getCenter())
        .setContent(popupContent)
        .openOn(mapInstanceRef.current);

      // تابع‌های global برای ذخیره و انصراف
      window.saveNewZone = () => {
        const name = document.getElementById("newZoneName").value;
        const cost = parseInt(document.getElementById("newZoneCost").value);
        const time = parseInt(document.getElementById("newZoneTime").value);
        const color = document.getElementById("newZoneColor").value;

        if (!name) {
          alert("لطفاً نام منطقه را وارد کنید");
          return;
        }

        const newZone = {
          id: Date.now().toString(),
          name: name,
          coordinates: coordinates.map((coord) => [coord.lat, coord.lng]),
          deliveryCost: cost,
          deliveryTime: time,
          color: color,
          area: area,
          storeCount: 0,
        };

        onZoneCreate(newZone);

        // آپدیت استایل پلیگان با رنگ نهایی
        polygon.setStyle({
          fillColor: color,
          color: color,
        });

        polygon.zoneData = newZone;
        mapInstanceRef.current.closePopup();
      };

      window.cancelNewZone = () => {
        drawnItemsRef.current.removeLayer(polygon);
        mapInstanceRef.current.closePopup();
      };
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      // پاک کردن تابع‌های global
      if (window.editZone) delete window.editZone;
      if (window.deleteZone) delete window.deleteZone;
      if (window.finishDrawing) delete window.finishDrawing;
      if (window.saveNewZone) delete window.saveNewZone;
      if (window.cancelNewZone) delete window.cancelNewZone;
      if (window.finishControl) delete window.finishControl;
    };
  }, [zones, stores, onZoneCreate, onZoneUpdate, onZoneDelete]);

  return (
    <div
      id="deliveryZonesMap"
      style={{
        height: "600px",
        width: "100%",
        borderRadius: "12px",
        border: "1px solid #dee2e6",
      }}
    />
  );
}

// بقیه کد کامپوننت اصلی بدون تغییر
export default function DeliveryZonesMap() {
  const [zones, setZones] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchZones();
    fetchStores();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await fetch("/api/delivery-zones");
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      } else {
        console.error("Error fetching zones");
        // استفاده از داده‌های نمونه در صورت خطا
        const mockZones = [
          {
            id: "1",
            name: "منطقه مرکزی",
            coordinates: [
              [35.7, 51.35],
              [35.7, 51.45],
              [35.75, 51.45],
              [35.75, 51.35],
            ],
            deliveryCost: 15000,
            deliveryTime: 1,
            color: "#6C63FF",
            area: 45.2,
            storeCount: 12,
            createdAt: new Date().toISOString(),
          },
        ];
        setZones(mockZones);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoneCreate = async (newZone) => {
    try {
      const response = await fetch("/api/delivery-zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newZone),
      });

      if (response.ok) {
        const createdZone = await response.json();
        setZones((prev) => [...prev, createdZone]);
        alert(`منطقه "${newZone.name}" با موفقیت ایجاد شد`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در ایجاد منطقه");
      }
    } catch (error) {
      console.error("Error creating zone:", error);
      alert("خطا در ایجاد منطقه");
    }
  };

  const handleZoneUpdate = async (zoneId, updatedZone) => {
    try {
      const response = await fetch(`/api/delivery-zones/${zoneId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedZone),
      });

      if (response.ok) {
        const updatedZoneData = await response.json();
        setZones((prev) =>
          prev.map((zone) => (zone.id === zoneId ? updatedZoneData : zone))
        );
        alert("منطقه با موفقیت بروزرسانی شد");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در بروزرسانی منطقه");
      }
    } catch (error) {
      console.error("Error updating zone:", error);
      alert("خطا در بروزرسانی منطقه");
    }
  };

  const handleZoneDelete = async (zoneId) => {
    try {
      const response = await fetch(`/api/delivery-zones/${zoneId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
        alert("منطقه با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف منطقه");
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
      alert("خطا در حذف منطقه");
    }
  };
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-map text-primary me-2"></i>
            مدیریت مناطق پخش
          </h5>
        </div>
        <div className="card-body">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "600px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DeliveryZonesContent
      zones={zones}
      stores={stores}
      onZoneCreate={handleZoneCreate}
      onZoneUpdate={handleZoneUpdate}
      onZoneDelete={handleZoneDelete}
    />
  );
}
 