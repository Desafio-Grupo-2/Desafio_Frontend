import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-rotatedmarker";
import { Clock, CheckCircle, Navigation, Route } from "lucide-react";
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

  const applyMarkersAndMaybeRoute = (originLat, originLng, paradas) => {
    const map = mapRef.current;
    if (!map) return;

    paradas.forEach((p, idx) => {
      const completed = p.completed;

      if (completed) {
        const existing = markersRef.current.get(p.id);
        if (existing) {
          existing.remove();
          markersRef.current.delete(p.id);
        }
        return;
      }

      const icon = L.divIcon({
        html: `<div style="background-color:red; color:white; border-radius:50%; width:25px; height:25px; display:flex; align-items:center; justify-content:center;">${idx+1}</div>`,
        className: "",
        iconSize: [25, 25],
        iconAnchor: [12, 12],
      });

      if (!markersRef.current.has(p.id)) {
        const marker = L.marker([p.lat, p.lon], { icon })
          .addTo(map)
          .bindTooltip(`${idx+1}. ${p.nombre}`, { permanent: false, direction: "top" })
          .on("click", () => {
            setParadasState(prev => {
              const updated = prev.map(par => par.id === p.id ? { ...par, completed: !par.completed } : par);
              const currentPos = vehicleMarkerRef.current?.getLatLng();
              if (currentPos) {
                applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated);
              } else {
                applyMarkersAndMaybeRoute(undefined, undefined, updated);
              }
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
      <polygon points="12,0 24,24 12,18 0,24" fill="blue"/>
    </svg>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Función para simular ubicación en modo demo
  const simulateLocation = () => {
    const map = mapRef.current;
    if (!map) return;

    const simulatedLat = 43.26271 + (Math.random() - 0.5) * 0.01;
    const simulatedLng = -2.92528 + (Math.random() - 0.5) * 0.01;
    const simulatedSpeed = Math.random() * 50 + 10; // 10-60 km/h

    setCurrentSpeed(Math.round(simulatedSpeed));
    setLocationStatus("Modo Demo - Ubicación simulada");

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker([simulatedLat, simulatedLng], { 
        icon: arrowIcon, 
        rotationAngle: 0, 
        rotationOrigin: "center" 
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

    // Actualizar marcadores de paradas y ruta con estado actual
    applyMarkersAndMaybeRoute(simulatedLat, simulatedLng, paradasRef.current);
    generarRuta(simulatedLat, simulatedLng, paradasRef.current);
  };

  // Inicializa mapa
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

    const map = L.map("transport-map", { attributionControl: false, zoomControl: true }).setView([baseLat, baseLng], 13);
    mapRef.current = map;

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
      if (watchIdRef.current?.clearInterval) clearInterval(watchIdRef.current);
      else if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

      mapRef.current?.remove();
      mapRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    paradasRef.current = paradasState;
  }, [paradasState]);

  const generarRuta = (origenLat, origenLng, puntos) => {
    const map = mapRef.current;
    if (!map || origenLat === undefined || origenLng === undefined) return;

    const remainingStops = puntos.filter(p => !p.completed);

    let waypoints = [[origenLat, origenLng]];
    if (remainingStops.length > 0) {
      waypoints = [[origenLat, origenLng], ...remainingStops.map(p => [p.lat, p.lon])];
    } else {
      // Todas completadas: volver a casa
      waypoints = [[origenLat, origenLng], [baseLat, baseLng]];
    }

    // Utilizamos el servicio route de OSRM
    const coordsStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&steps=false&alternatives=false`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const route = data?.routes?.[0]?.geometry;
        if (!route) return;

        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }
        routeLayerRef.current = L.geoJSON(route, { style: { color: "blue", weight: 4 } }).addTo(map);
      })
      .catch(err => console.error("Error al calcular la ruta:", err));
  };

  const handleTracking = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!tracking) {
      setTracking(true);

      if (navigator.geolocation && !demoMode) {
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

                const dx = longitude - prevPos.lon;
                const dy = latitude - prevPos.lat;
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                vehicleMarkerRef.current.setRotationAngle(angle);
              }
              vehicleMarkerRef.current.setLatLng([latitude, longitude]);
              vehicleMarkerRef.current.prevPos = { lat: latitude, lon: longitude };
            }

            applyMarkersAndMaybeRoute(latitude, longitude, paradasRef.current);
            generarRuta(latitude, longitude, paradasRef.current);
          },
          (error) => {
            let errorMessage = "Error desconocido";
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Permisos de ubicación denegados. ¿Quieres usar el modo demo?";
                setLocationStatus("Permisos denegados");
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Ubicación no disponible. ¿Quieres usar el modo demo?";
                setLocationStatus("Ubicación no disponible");
                break;
              case error.TIMEOUT:
                errorMessage = "Tiempo de espera agotado. ¿Quieres usar el modo demo?";
                setLocationStatus("Timeout - Cambiando a modo demo");
                break;
            }
            if (confirm(errorMessage)) {
              setDemoMode(true);
              setLocationStatus("Iniciando modo demo...");
              simulateLocation();
            } else {
              setTracking(false);
            }
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
        );
      } else {
        setLocationStatus("Iniciando modo demo...");
        simulateLocation();
        const demoInterval = setInterval(() => {
          if (tracking && demoMode) simulateLocation();
          else clearInterval(demoInterval);
        }, 3000);
        watchIdRef.current = { clearInterval: demoInterval };
      }
    } else {
      setTracking(false);
      if (watchIdRef.current?.clearInterval) clearInterval(watchIdRef.current.clearInterval);
      else if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      routeLayerRef.current?.clearLayers();
    }
  };

  const completedStops = paradasState.filter(p => p.completed).length;

  return (
    <div className="transport-map-wrapper">
      <div className="sidebar">
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
        <button className="tracking-btn" onClick={() => mapRef.current && mapRef.current.setView(vehicleMarkerRef.current?.getLatLng() || [baseLat, baseLng], 16)} style={{ marginTop: "10px", background: "#10b981" }}>
          📍 Ir a mi ubicación
        </button>
        <button 
          className="tracking-btn" 
          onClick={() => {
            setDemoMode(!demoMode);
            setLocationStatus(demoMode ? "Modo GPS activado" : "Modo Demo activado");
          }} 
          style={{ marginTop: "10px", background: demoMode ? "#f59e0b" : "#8b5cf6" }}
        >
          {demoMode ? "🎯 Activar GPS" : "🎮 Modo Demo"}
        </button>
        <div className="stops-list">
          <h3>Paradas Programadas</h3>
          <div className="stops">
            {paradasState.map((parada, index) => (
              <div
                key={parada.id}
                className={`stop-card ${parada.completed ? "completed" : ""}`}
                onClick={() => {
                  setParadasState(prev => {
                    const updated = prev.map(p => p.id === parada.id ? { ...p, completed: !p.completed } : p);
                    const currentPos = vehicleMarkerRef.current?.getLatLng();
                    if (currentPos) {
                      applyMarkersAndMaybeRoute(currentPos.lat, currentPos.lng, updated);
                    } else {
                      applyMarkersAndMaybeRoute(undefined, undefined, updated);
                    }
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
            ))}
          </div>
        </div>
      </div>
      <div className="map-area">
        <div id="transport-map"></div>
      </div>
    </div>
  );
};

export default MapComponent;
