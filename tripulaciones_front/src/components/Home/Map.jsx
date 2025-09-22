import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

  const [tracking, setTracking] = useState(false);
  const [paradasState, setParadasState] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

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

  // Inicializa mapa
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("transport-map", { attributionControl: false, zoomControl: true }).setView([baseLat, baseLng], 13);
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap contributors © CARTO", subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    setParadasState(paradasIniciales.map(p => ({ ...p, completed: false, estimatedTime: "5 min" })));

    setTimeout(() => map.invalidateSize(), 200);
    window.addEventListener("resize", () => map.invalidateSize());

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapRef.current) mapRef.current.remove();
      window.removeEventListener("resize", () => map.invalidateSize());
    };
  }, []);

  const generarRuta = (origenLat, origenLng, puntos) => {
    const map = mapRef.current;
    if (!map || puntos.length === 0) return;

    const waypoints = [[origenLat, origenLng], ...puntos.map(p => [p.lat, p.lon])];
    const coordsStr = waypoints.map(p => `${p[1]},${p[0]}`).join(";");
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordsStr}?source=first&roundtrip=false&overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.trips || !data.trips.length) return;
        const route = data.trips[0].geometry;

        if (routeLayerRef.current) routeLayerRef.current.clearLayers();
        routeLayerRef.current = L.geoJSON(route, { style: { color: "blue", weight: 4 } }).addTo(map);

        // Calcular distancia total
        let dist = 0;
        const coords = route.coordinates;
        for (let i = 1; i < coords.length; i++) {
          dist += haversineDistance(coords[i-1][1], coords[i-1][0], coords[i][1], coords[i][0]);
        }
        setTotalDistance(dist.toFixed(2));
      })
      .catch(err => console.error("Error al calcular la ruta:", err));
  };

  const handleLocateUser = () => {
    const map = mapRef.current;
    if (!map || !vehicleMarkerRef.current) return alert("Ubicación aún no detectada.");
    map.setView(vehicleMarkerRef.current.getLatLng(), 16);
  };

  const handleTracking = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!tracking) {
      setTracking(true);
      let prevPos = null;

      watchIdRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const { latitude, longitude, speed } = coords;
          setCurrentSpeed(speed ? Math.round(speed * 3.6) : 0);

          if (!vehicleMarkerRef.current) {
            vehicleMarkerRef.current = L.marker([latitude, longitude], { icon: arrowIcon, rotationAngle: 0, rotationOrigin: "center" }).addTo(map);
            map.setView([latitude, longitude], 16);
          } else {
            vehicleMarkerRef.current.setLatLng([latitude, longitude]);
            if (prevPos) {
              const dx = longitude - prevPos.lon;
              const dy = latitude - prevPos.lat;
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              vehicleMarkerRef.current.setRotationAngle(angle);
            }
          }
          prevPos = { lat: latitude, lon: longitude };

          const updatedParadas = paradasState.map((p, idx) => {
            const completed = p.completed;
            const icon = L.divIcon({
              html: `<div style="background-color:${completed ? "green" : "red"}; color:white; border-radius:50%; width:25px; height:25px; display:flex; align-items:center; justify-content:center;">${idx+1}</div>`,
              className: "",
              iconSize: [25, 25],
              iconAnchor: [12, 12],
            });

            if (!markersRef.current.has(p.id)) {
              const marker = L.marker([p.lat, p.lon], { icon })
                .addTo(map)
                .bindTooltip(`${idx+1}. ${p.nombre}`, { permanent: false, direction: "top" })
                .on("click", () => {
                  const newParadas = paradasState.map(par => par.id === p.id ? { ...par, completed: !par.completed } : par);
                  setParadasState(newParadas);
                  generarRuta(latitude, longitude, newParadas.filter(pp => !pp.completed));
                });
              markersRef.current.set(p.id, marker);
            } else {
              markersRef.current.get(p.id).setIcon(icon);
            }

            return { ...p };
          });

          setParadasState(updatedParadas);
          generarRuta(latitude, longitude, updatedParadas.filter(p => !p.completed));
        },
        console.error,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } else {
      setTracking(false);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (routeLayerRef.current) routeLayerRef.current.clearLayers();
    }
  };

  const completedStops = paradasState.filter(p => p.completed).length;
  const co2Saved = (totalDistance * CO2_PER_KM).toFixed(2);

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
        <button className="tracking-btn" onClick={handleTracking}>
          {tracking ? "Finalizar Ruta" : "Iniciar Seguimiento"}
        </button>
        <button className="tracking-btn" onClick={handleLocateUser} style={{ marginTop: "10px", background: "#10b981" }}>
          📍 Ir a mi ubicación
        </button>
        <div className="stops-list">
          <h3>Paradas Programadas</h3>
          <div className="stops">
            {paradasState.map((parada, index) => (
              <div key={parada.id} className={`stop-card ${parada.completed ? "completed" : ""}`}>
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
