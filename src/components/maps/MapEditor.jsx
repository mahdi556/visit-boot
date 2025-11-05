"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  CircleMarker,
  useMapEvent,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
  MapEditor.jsx
  - نمایش فروشگاه‌ها
  - نمایش مسیرها (zones)
  - انتخاب مسیر از منو و رسم منطقه جدید
  - ویرایش / حذف / ذخیره مسیر
*/

const DEFAULT_CENTER = [32.6637,  51.70160];
const DEFAULT_ZOOM = 11;

function MapClickHandler({
  isDrawingRef,
  pointsRef,
  setPoints,
  currentRouteRef,
  onPointsChange,
}) {
  // ثبت کلیک‌های نقشه تنها وقتی drawing فعال است
  useMapEvent("click", (e) => {
    if (!isDrawingRef.current) return;
    const latlng = e.latlng;
    pointsRef.current = [...pointsRef.current, latlng];
    setPoints(pointsRef.current.slice()); // force update state
    if (onPointsChange) onPointsChange(pointsRef.current);
  });
  return null;
}

function CursorStyle({ isDrawingRef }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (isDrawingRef.current) {
      container.style.cursor = "crosshair";
    } else {
      container.style.cursor = "";
    }
    // keep cursor in sync on changes
    const observer = new MutationObserver(() => {
      container.style.cursor = isDrawingRef.current ? "crosshair" : "";
    });
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      observer.disconnect();
      container.style.cursor = "";
    };
  }, [map, isDrawingRef]);
  return null;
}

export default function MapEditor() {
  const [routes, setRoutes] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // انتخاب/رسم
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [points, setPoints] = useState([]); // [{lat,lng}, ...] for current drawing preview
  const isDrawingRef = useRef(false);
  const selectedRouteRef = useRef(null);
  const pointsRef = useRef([]);
  const mapRef = useRef(null);

  // UI state
  const [statusTitle, setStatusTitle] = useState("منتظر انتخاب مسیر");
  const [statusDetails, setStatusDetails] = useState("");

  // load data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, sRes] = await Promise.all([
          fetch("/api/routes"),
          fetch("/api/stores"),
        ]);
        if (rRes.ok) {
          const rdata = await rRes.json();
          setRoutes(rdata);
        } else {
          setRoutes([]);
        }
        if (sRes.ok) {
          const sdata = await sRes.json();
          setStores(sdata);
        } else {
          setStores([]);
        }
      } catch (e) {
        console.error("fetch error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // sync refs when selectedRouteId changes
  useEffect(() => {
    const route =
      routes.find((r) => String(r.id) === String(selectedRouteId)) || null;
    selectedRouteRef.current = route;
    if (route) {
      setStatusTitle(`مسیر انتخاب شده: ${route.name}`);
      setStatusDetails(
        'برای رسم "شروع رسم" را بزنید یا "ویرایش" را انتخاب کنید'
      );
    } else {
      setStatusTitle("منتظر انتخاب مسیر");
      setStatusDetails("");
    }
    // reset drawing preview when switch route
    pointsRef.current = [];
    setPoints([]);
    isDrawingRef.current = false;
  }, [selectedRouteId, routes]);

  const startDrawing = () => {
    if (!selectedRouteRef.current) {
      alert("ابتدا یک مسیر انتخاب کنید.");
      return;
    }
    pointsRef.current = [];
    setPoints([]);
    isDrawingRef.current = true;
    setStatusTitle(`رسم منطقه برای "${selectedRouteRef.current.name}"`);
    setStatusDetails(
      "روی نقشه کلیک کنید تا نقاط اضافه شوند؛ برای ذخیره حداقل ۳ نقطه لازم است."
    );
  };

  const cancelDrawing = () => {
    isDrawingRef.current = false;
    pointsRef.current = [];
    setPoints([]);
    setStatusTitle("رسم متوقف شد");
    setStatusDetails("می‌توانید مجدداً شروع کنید یا مسیر دیگری انتخاب کنید");
    // remove any open temp polygon by React render (points empty)
  };

  const finishDrawing = async () => {
    if (!selectedRouteRef.current) return alert("مسیر انتخاب نشده");
    if (pointsRef.current.length < 3) return alert("حداقل ۳ نقطه لازم است.");

    const coords = pointsRef.current.map((p) => [p.lat, p.lng]);
    const area = calculatePolygonArea(pointsRef.current);

    try {
      // PUT to update route (api should accept coordinates and area)
      const res = await fetch(`/api/routes/${selectedRouteRef.current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: coords, area }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "خطا در ذخیره‌سازی");
      }
      const updated = await res.json();
      // update local routes
      setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      alert("✅ منطقه با موفقیت ذخیره شد");
      cancelDrawing();
    } catch (e) {
      console.error(e);
      alert("خطا در ذخیره منطقه");
    }
  };

  const deleteRoute = async (routeId) => {
    if (!confirm("آیا از حذف این مسیر اطمینان دارید؟")) return;

    try {
      // ابتدا اطلاعات مسیر را بگیریم تا ببینیم فروشگاه دارد یا نه
      const route = routes.find((r) => r.id === routeId);

      if (route && route._count?.stores > 0) {
        alert(
          "❌ امکان حذف مسیر دارای فروشگاه وجود ندارد. لطفاً ابتدا فروشگاه‌های این مسیر را به مسیر دیگری منتقل کنید."
        );
        return;
      }

      const res = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "خطا در حذف مسیر");
      }

      // حذف از state
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));

      // اگر مسیر انتخاب شده حذف شده، انتخاب را پاک کن
      if (String(routeId) === String(selectedRouteId)) {
        setSelectedRouteId("");
      }

      alert("✅ مسیر با موفقیت حذف شد");
    } catch (e) {
      console.error("Delete error:", e);
      alert(`❌ ${e.message || "خطا در حذف مسیر"}`);
    }
  };
  // help: area approx (very rough) — same algorithm as before
  const calculatePolygonArea = (pts) => {
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += pts[i].lng * pts[j].lat;
      area -= pts[j].lng * pts[i].lat;
    }
    return Math.abs(area / 2) * 111.32 * 111.32;
  };

  // when points state flips, also update pointsRef
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // render loading
  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 420 }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  // custom icon (simple)
  const storeIcon = new L.DivIcon({
    className: "store-marker",
    html: `<div style="background: #10b981; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.15)">🏪</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Control panel (simple UI top-right) */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          right: 16,
          top: 16,
          width: 320,
          background: "white",
          padding: 12,
          borderRadius: 10,
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          border: "1px solid #e6e6e6",
          fontFamily: "Vazirmatn, sans-serif",
        }}
      >
        <div style={{ marginBottom: 8, textAlign: "center" }}>
          <strong>🗺️ مدیریت مسیرها</strong>
        </div>

        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #e6e6e6",
            marginBottom: 8,
          }}
        >
          <option value="">-- انتخاب مسیر --</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} {r.coordinates?.length ? "✅" : ""}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={startDrawing}
            disabled={!selectedRouteId}
            style={{
              flex: 1,
              padding: 10,
              background: selectedRouteRef.current?.color || "#6C63FF",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: selectedRouteId ? "pointer" : "not-allowed",
            }}
          >
            📐 شروع رسم
          </button>

          <button
            onClick={cancelDrawing}
            style={{
              padding: 10,
              background: "#a0aec0",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ✖️ لغو
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => {
              if (!selectedRouteId) return alert("ابتدا مسیر را انتخاب کنید");
              // load existing coords into drawing for editing
              const route = routes.find(
                (r) => String(r.id) === String(selectedRouteId)
              );
              if (!route || !route.coordinates || route.coordinates.length < 3)
                return alert("مسیر انتخاب‌شده منطقه‌ای برای ویرایش ندارد");
              // convert [lat,lng] arrays to objects
              pointsRef.current = route.coordinates.map(([lat, lng]) => ({
                lat,
                lng,
              }));
              setPoints(pointsRef.current.slice());
              isDrawingRef.current = true;
              setStatusTitle(`ویرایش منطقه "${route.name}"`);
              setStatusDetails(
                "نقاط را ویرایش کنید (با کلیک جایگزین کنید) و سپس ذخیره کنید"
              );
            }}
            style={{
              flex: 1,
              padding: 10,
              background: "#f6ad55",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            ✏️ ویرایش
          </button>

          <button
            onClick={() => {
              if (!selectedRouteId) return alert("ابتدا مسیر را انتخاب کنید");
              deleteRoute(selectedRouteId);
            }}
            style={{
              padding: 10,
              background: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            🗑 حذف
          </button>
        </div>

        <div
          style={{
            background: "#f8f9fa",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #eee",
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 700 }}>{statusTitle}</div>
          <div style={{ color: "#666", marginTop: 6 }}>{statusDetails}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#333" }}>
            نقاط فعلی: <strong>{points.length}</strong>
            {points.length >= 3 && (
              <button
                onClick={finishDrawing}
                style={{
                  marginLeft: 8,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                }}
              >
                💾 ذخیره
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: 680, borderRadius: 12 }}
        whenCreated={(map) => {
          mapRef.current = map;
          // ensure global L available (some code expects window.L)
          if (!window.L) window.L = L;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* stores markers */}
        {stores.map((s) =>
          s.latitude && s.longitude ? (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={storeIcon}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <h6 style={{ margin: 0 }}>{s.name}</h6>
                  <div style={{ fontSize: 13, color: "#666" }}>{s.address}</div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>{s.phone}</div>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* existing route polygons */}
        {routes.map((r) =>
          r.coordinates && r.coordinates.length > 0 ? (
            <Polygon
              key={`route-${r.id}`}
              positions={r.coordinates}
              pathOptions={{
                color: r.color || "#6C63FF",
                fillOpacity: 0.2,
                weight: 2,
              }}
            ></Polygon>
          ) : null
        )}

        {/* preview: if points length 1 -> circle; 2 -> polyline; >=3 -> polygon */}
        {points.length === 1 && (
          <CircleMarker
            center={points[0]}
            radius={6}
            pathOptions={{
              color: selectedRouteRef.current?.color || "#6C63FF",
              fillColor: selectedRouteRef.current?.color || "#6C63FF",
              fillOpacity: 1,
            }}
          />
        )}

        {points.length === 2 && (
          <Polyline
            positions={points}
            pathOptions={{
              color: selectedRouteRef.current?.color || "#6C63FF",
              dashArray: "6,6",
            }}
          />
        )}

        {points.length >= 3 && (
          <Polygon
            positions={points}
            pathOptions={{
              color: selectedRouteRef.current?.color || "#6C63FF",
              fillOpacity: 0.25,
            }}
          />
        )}

        {/* click handler */}
        <MapClickHandler
          isDrawingRef={isDrawingRef}
          pointsRef={pointsRef}
          setPoints={setPoints}
          currentRouteRef={selectedRouteRef}
        />

        {/* cursor style when drawing */}
        <CursorStyle isDrawingRef={isDrawingRef} />
      </MapContainer>
    </div>
  );
}
