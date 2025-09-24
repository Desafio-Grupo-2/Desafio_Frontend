import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet-rotatedmarker";
import { Clock, CheckCircle, Navigation, Route, Menu, X, Leaf, ChevronRight } from "lucide-react";
import "../../assets/styles/components/home/map.scss";

const paradasIniciales = [
  { id: "1", nombre: "Centro Escolar San Patricio", lat: 43.26271, lon: -2.92528 },
  { id: "2", nombre: "Colegio Sagrado Corazón", lat: 43.267, lon: -2.93 },
  { id: "3", nombre: "Instituto Tecnológico", lat: 43.272, lon: -2.915 },
  { id: "4", nombre: "Escuela Municipal Norte", lat: 43.278, lon: -2.94 },
  { id: "5", nombre: "Colegio Bilingüe Europa", lat: 43.28, lon: -2.92 },
  { id: "6", nombre: "Centro Educativo Valle", lat: 43.285, lon: -2.925 },
  { id: "7", nombre: "Instituto Internacional", lat: 43.29, lon: -2.935 },
];

const baseLat = 43.25587105216759;
const baseLng = -2.92265084981231;
const CO2_PER_KM = 0.12; // kg CO₂ por km

const MapComponent = () => {
  const mapRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef(new Map());
  const watchIdRef = useRef(null);
  const paradasRef = useRef([]);

  const [tracking, setTracking] = useState(false);
  const [paradasState, setParadasState] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [locationStatus, setLocationStatus] = useState("Esperando...");
  const [demoMode, setDemoMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFollowMode, setIsFollowMode] = useState(false);

  const completedStops = useMemo(() => paradasState.filter(p => p.completed).length, [paradasState]);
  const remainingStops = useMemo(() => paradasState.filter(p => !p.completed).length, [paradasState]);
  const progressPercent = useMemo(() => {
    const total = paradasState.length || 1;
    return Math.min(100, Math.round((completedStops / total) * 100));
  }, [completedStops, paradasState.length]);

  const estimatedMinutesRemaining = useMemo(() => remainingStops * 5, [remainingStops]);

  const formatMinutes = (mins) => {
    if (mins <= 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const applyMarkersAndMaybeRoute = (originLat, originLng, paradas) => {
    const map = mapRef.current;
    if (!map) return;

    paradas.forEach((p, idx) => {
      const completed = p.completed;

      // determinar parada actual: primera pendiente
      const firstPendingIdx = paradas.findIndex(s => !s.completed);
      const isCurrent = !completed && idx === firstPendingIdx;
      const status = completed ? 'completed' : isCurrent ? 'current' : 'future';

      const icon = createStopIcon(status, `${idx + 1}`);

      if (!markersRef.current.has(p.id)) {
        const marker = L.marker([p.lat, p.lon], { icon })
          .addTo(map)
          .bindTooltip(`${idx+1}. ${p.nombre}`, { permanent: false, direction: "top" })
          .on("click", () => {
            setParadasState(prev => {
              const i = prev.findIndex(s => s.id === p.id);
              if (i === -1) return prev;
              const isCompleted = prev[i].completed;
              if (isCompleted) {
                const updated = prev.map(s => s.id === p.id ? { ...s, completed: false } : s);
                const currentPos = vehicleMarkerRef.current?.getLatLng();
                if (currentPos) { applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated); }
                else { applyMarkersAndMaybeRoute(undefined, undefined, updated); }
                return updated;
              }
              const firstPending = prev.findIndex(s => !s.completed);
              const activeOk = firstPending !== -1 && prev[firstPending].id === p.id;
              if (!activeOk) return prev;
              const updated = prev.map(s => s.id === p.id ? { ...s, completed: true } : s);
              const currentPos = vehicleMarkerRef.current?.getLatLng();
              if (currentPos) { applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated); }
              else { applyMarkersAndMaybeRoute(undefined, undefined, updated); }
              return updated;
            });
          });
        markersRef.current.set(p.id, marker);
      } else {
        markersRef.current.get(p.id).setIcon(icon);
      }
    });

    if (originLat !== undefined && originLng !== undefined) {
      generarRuta(originLat, originLng, paradas);
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) / 1000; // km
  };

  const arrowIcon = L.divIcon({
    html: `<svg width="30" height="30" viewBox="0 0 24 24">
      <polygon points="12,0 24,24 12,18 0,24" fill="#22c55e"/>
    </svg>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const createStopIcon = (status, label) => {
    const size = 28; // 24-48px range, readable
    const border = status === 'future' ? '2px solid #FF7A00' : '0';
    const bg = status === 'future' ? '#FFFFFF' : status === 'current' ? '#FF7A00' : '#22C55E';
    const color = status === 'future' ? '#0F172A' : '#FFFFFF';
    const content = status === 'completed' ? '&#10003;' : label; // check for completed
    return L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};display:flex;align-items:center;justify-content:center;font-weight:700;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:${color};font-size:13px;">${content}</div>`,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // --- Helpers ---
  const startDemoTracking = () => {
    setDemoMode(true);
    setLocationStatus("Iniciando modo demo...");
    setIsFollowMode(true);
    simulateLocation();
    const demoInterval = setInterval(() => {
      if (tracking) simulateLocation(); else clearInterval(demoInterval);
    }, 3000);
    watchIdRef.current = { clearInterval: demoInterval };
  };

  const simulateLocation = () => {
    const map = mapRef.current;
    if (!map) return;

    const simulatedLat = 43.26271 + (Math.random() - 0.5) * 0.01;
    const simulatedLng = -2.92528 + (Math.random() - 0.5) * 0.01;
    const simulatedSpeed = Math.random() * 50 + 10;

    setCurrentSpeed(Math.round(simulatedSpeed));
    setLocationStatus("Modo Demo - Ubicación simulada");

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker([simulatedLat, simulatedLng], { 
        icon: arrowIcon, rotationAngle: 0, rotationOrigin: "center" 
      }).addTo(map);
      map.setView([simulatedLat, simulatedLng], 16);
      vehicleMarkerRef.current.prevPos = { lat: simulatedLat, lon: simulatedLng };
    } else {
      const prevPos = vehicleMarkerRef.current.prevPos;
      if (prevPos) {
        const dist = haversineDistance(prevPos.lat, prevPos.lon, simulatedLat, simulatedLng);
        setTotalDistance(prev => (parseFloat(prev) + dist).toFixed(2));
        setCo2Saved(prev => ((parseFloat(prev) + dist) * CO2_PER_KM).toFixed(2));
      }
      vehicleMarkerRef.current.setLatLng([simulatedLat, simulatedLng]);
      vehicleMarkerRef.current.prevPos = { lat: simulatedLat, lon: simulatedLng };
    }

    applyMarkersAndMaybeRoute(simulatedLat, simulatedLng, paradasRef.current);
    generarRuta(simulatedLat, simulatedLng, paradasRef.current);
  };

  useEffect(() => {
    if (mapRef.current) return;
    const mapContainer = document.getElementById("transport-map");
    if (!mapContainer) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map("transport-map", { attributionControl: false, zoomControl: false }).setView([baseLat, baseLng], 13);
    mapRef.current = map;
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add locate button inside zoom control container (third button)
    const zoomContainer = mapRef.current._controlCorners.topright.querySelector('.leaflet-control-zoom');
    if (zoomContainer) {
      const locateBtn = L.DomUtil.create('a', 'leaflet-control-locate', zoomContainer);
      locateBtn.href = '#';
      locateBtn.title = 'Ir a mi ubicación';
      locateBtn.setAttribute('aria-label', 'Ir a mi ubicación');
      locateBtn.innerHTML = '<span class="locate-dot"></span>';
      L.DomEvent.on(locateBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        const map = mapRef.current;
        if (!map) return;
        const current = vehicleMarkerRef.current?.getLatLng();
        map.setView(current || [baseLat, baseLng], Math.max(map.getZoom(), 16), { animate: true });
        setIsFollowMode(true);
      });
    }

    // Disable follow mode only on explicit user interaction
    const containerEl = map.getContainer();
    const stopFollow = () => setIsFollowMode(false);
    containerEl.addEventListener('mousedown', stopFollow, { passive: true });
    containerEl.addEventListener('touchstart', stopFollow, { passive: true });
    containerEl.addEventListener('wheel', stopFollow, { passive: true });
    map.on('dragstart', stopFollow);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap contributors © CARTO", subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    const initParadas = paradasIniciales.map(p => ({ ...p, completed: false, estimatedTime: "5 min" }));
    setParadasState(initParadas);
    paradasRef.current = initParadas;

    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    const handleResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      if (watchIdRef.current?.clearInterval) clearInterval(watchIdRef.current.clearInterval);
      else if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      containerEl.removeEventListener('mousedown', stopFollow);
      containerEl.removeEventListener('touchstart', stopFollow);
      containerEl.removeEventListener('wheel', stopFollow);
      map.off('dragstart', stopFollow);
      mapRef.current?.remove();
      mapRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => { paradasRef.current = paradasState; }, [paradasState]);
  useEffect(() => {
    const timer = setTimeout(() => { mapRef.current?.invalidateSize(); }, 280);
    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  const generarRuta = (origenLat, origenLng, puntos) => {
    const map = mapRef.current;
    if (!map || origenLat === undefined || origenLng === undefined) return;

    const remainingStopsLocal = puntos.filter(p => !p.completed);
    let waypoints = [[origenLat, origenLng]];
    if (remainingStopsLocal.length > 0) {
      waypoints = [[origenLat, origenLng], ...remainingStopsLocal.map(p => [p.lat, p.lon])];
    } else {
      waypoints = [[origenLat, origenLng], [baseLat, baseLng]];
    }

    const coordsStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&steps=false&alternatives=false`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const route = data?.routes?.[0]?.geometry;
        if (!route) return;
        if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); }
        routeLayerRef.current = L.geoJSON(route, { style: { color: "#FF7A00", weight: 4 } }).addTo(map);
      })
      .catch(err => console.error("Error al calcular la ruta:", err));
  };

  const handleTracking = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!tracking) {
      setTracking(true);
      setIsFollowMode(true);

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          ({ coords }) => {
            const { latitude, longitude, speed } = coords;
            setCurrentSpeed(speed ? Math.round(speed * 3.6) : 0);
            setLocationStatus("Ubicación obtenida");

            if (!vehicleMarkerRef.current) {
              vehicleMarkerRef.current = L.marker([latitude, longitude], { icon: arrowIcon, rotationAngle: 0, rotationOrigin: "center" }).addTo(map);
              map.setView([latitude, longitude], 16);
              vehicleMarkerRef.current.prevPos = { lat: latitude, lon: longitude };
            } else {
              const prevPos = vehicleMarkerRef.current.prevPos;
              if (prevPos) {
                const dist = haversineDistance(prevPos.lat, prevPos.lon, latitude, longitude);
                setTotalDistance(prev => (parseFloat(prev) + dist).toFixed(2));
                setCo2Saved(prev => ((parseFloat(prev) + dist) * CO2_PER_KM).toFixed(2));
                const dx = longitude - prevPos.lon; const dy = latitude - prevPos.lat; const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                vehicleMarkerRef.current.setRotationAngle(angle);
              }
              vehicleMarkerRef.current.setLatLng([latitude, longitude]);
              vehicleMarkerRef.current.prevPos = { lat: latitude, lon: longitude };
            }

            if (isFollowMode) {
              const currentZoom = map.getZoom();
              map.setView([latitude, longitude], currentZoom, { animate: true });
            }

            applyMarkersAndMaybeRoute(latitude, longitude, paradasRef.current);
            generarRuta(latitude, longitude, paradasRef.current);
          },
          (error) => {
            // Si falla el GPS, activamos automáticamente el modo demo
            setLocationStatus("GPS no disponible. Activando modo demo...");
            startDemoTracking();
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
        );
      } else {
        // Si el navegador no soporta geolocalización, arrancar demo
        startDemoTracking();
      }
    } else {
      setTracking(false);
      if (watchIdRef.current?.clearInterval) clearInterval(watchIdRef.current.clearInterval);
      else if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      routeLayerRef.current?.clearLayers();
      setIsFollowMode(false);
    }
  };

  return (
    <div className="transport-map-wrapper">
      <div className={`sidebar ${isDrawerOpen ? "open" : ""}`}>
        <h1>Control de Flota</h1>
        <p>Ruta escolar - Vehículo #001</p>
        <div className="stats">
          <div className="stat-card"><CheckCircle /><div>{completedStops} Paradas</div></div>
          <div className="stat-card"><Route /><div>{totalDistance} km recorridos</div></div>
          <div className="stat-card"><Navigation /><div>{currentSpeed} km/h</div></div>
          <div className="stat-card"><Route /><div>{co2Saved} kg CO₂ ahorrado</div></div>
        </div>
        <div className="location-status">
          <strong>Estado GPS:</strong> {locationStatus}
        </div>
        <button className="tracking-btn" onClick={handleTracking}>
          {tracking ? "Finalizar Ruta" : "Iniciar Seguimiento"}
        </button>
        <div className="stops-list">
          <h3>Paradas Programadas</h3>
          <div className="stops">
            {(() => {
              const firstPendingIndex = paradasState.findIndex(p => !p.completed);
              return paradasState.map((parada, index) => (
                <div
                  key={parada.id}
                  className={`stop-card ${parada.completed ? "completed" : ""} ${!parada.completed && index === firstPendingIndex ? "active" : ""}`}
                  onClick={() => {
                    setParadasState(prev => {
                      const idx = prev.findIndex(s => s.id === parada.id);
                      if (idx === -1) return prev;
                      const isCompleted = prev[idx].completed;

                      // Si ya está completada, permitir desmarcarla
                      if (isCompleted) {
                        const updated = prev.map(s => s.id === parada.id ? { ...s, completed: false } : s);
                        const currentPos = vehicleMarkerRef.current?.getLatLng();
                        if (currentPos) { applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated); }
                        else { applyMarkersAndMaybeRoute(undefined, undefined, updated); }
                        return updated;
                      }

                      // Si está pendiente, solo permitir completar si es la activa (primera pendiente)
                      const activeIdx = prev.findIndex(s => !s.completed);
                      if (activeIdx !== index) return prev;

                      const updated = prev.map(s => s.id === parada.id ? { ...s, completed: true } : s);
                      const currentPos = vehicleMarkerRef.current?.getLatLng();
                      if (currentPos) { applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated); }
                      else { applyMarkersAndMaybeRoute(undefined, undefined, updated); }
                      return updated;
                    });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="stop-index">{parada.completed ? "✓" : index + 1}</div>
                  <div className="stop-info">
                    <div>{parada.nombre}</div>
                    <div className="eta"><Clock /> {parada.estimatedTime}</div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      <div className={`drawer-overlay ${isDrawerOpen ? "visible" : ""}`} onClick={() => setIsDrawerOpen(false)} />
      <div className="map-area">
        <button
          className="drawer-toggle-button"
          onClick={() => setIsDrawerOpen(prev => !prev)}
          aria-label={isDrawerOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isDrawerOpen ? <X size={20} /> : <ChevronRight size={20} />}
        </button>
        <div id="transport-map"></div>
        {!isDrawerOpen && (
          <div className="mobile-stats-card">
            <div className="msc-header">
              <Navigation />
              <span>Progreso de Ruta</span>
            </div>
            <div className="msc-row msc-row-top">
              <span className="msc-label">Progreso</span>
              <span className="msc-sub">{completedStops}/{paradasState.length} paradas</span>
            </div>
            <div className="msc-progress">
              <div className="msc-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="msc-meta">
              <div className="msc-meta-item">
                <Clock />
                <span>{formatMinutes(estimatedMinutesRemaining)} restantes</span>
              </div>
              <div className="msc-meta-item">
                <Navigation />
                <span>{totalDistance} km total</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
