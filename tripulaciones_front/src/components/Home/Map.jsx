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

  const [tracking, setTracking] = useState(false);
  const [paradasState, setParadasState] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [locationStatus, setLocationStatus] = useState("Esperando...");
  const [demoMode, setDemoMode] = useState(false);

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

    // Ubicación simulada cerca de las paradas
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
    } else {
      vehicleMarkerRef.current.setLatLng([simulatedLat, simulatedLng]);
    }

    // Actualizar marcadores de paradas
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
            generarRuta(simulatedLat, simulatedLng, newParadas.filter(pp => !pp.completed));
          });
        markersRef.current.set(p.id, marker);
      } else {
        markersRef.current.get(p.id).setIcon(icon);
      }

      return { ...p };
    });

    setParadasState(updatedParadas);
    generarRuta(simulatedLat, simulatedLng, updatedParadas.filter(p => !p.completed));
  };

  // Inicializa mapa
  useEffect(() => {
    if (mapRef.current) return;

    // Verificar que el contenedor del mapa existe
    const mapContainer = document.getElementById("transport-map");
    if (!mapContainer) {
      console.error("Contenedor del mapa no encontrado");
      return;
    }

    // Fix para iconos de Leaflet
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

    setParadasState(paradasIniciales.map(p => ({ ...p, completed: false, estimatedTime: "5 min" })));

    // Usar requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (watchIdRef.current) {
        if (watchIdRef.current.clearInterval) {
          clearInterval(watchIdRef.current);
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
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
    if (!map) return;
    
    if (vehicleMarkerRef.current) {
      map.setView(vehicleMarkerRef.current.getLatLng(), 16);
      return;
    }

    // Si no hay marcador, intentar obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          map.setView([latitude, longitude], 16);
          
          // Crear marcador temporal si no existe
          if (!vehicleMarkerRef.current) {
            vehicleMarkerRef.current = L.marker([latitude, longitude], { 
              icon: arrowIcon, 
              rotationAngle: 0, 
              rotationOrigin: "center" 
            }).addTo(map);
          }
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          alert("No se pudo obtener tu ubicación actual. Asegúrate de permitir el acceso a la ubicación.");
        },
        { 
          enableHighAccuracy: false,
          maximumAge: 60000,
          timeout: 10000
        }
      );
    } else {
      alert("Geolocalización no soportada en este navegador.");
    }
  };

  const handleTracking = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!tracking) {
      setTracking(true);
      let prevPos = null;

      // Intentar geolocalización real primero
      if (navigator.geolocation && !demoMode) {
        watchIdRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const { latitude, longitude, speed } = coords;
          setCurrentSpeed(speed ? Math.round(speed * 3.6) : 0);
          setLocationStatus("Ubicación obtenida");

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
        (error) => {
          console.error("Error de geolocalización:", error);
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
        { 
          enableHighAccuracy: false, // Cambiado a false para evitar timeouts
          maximumAge: 60000, // Usar ubicación cacheada por 60 segundos
          timeout: 10000 // Reducido a 10 segundos
        }
      );
      } else {
        // Modo demo o geolocalización no disponible
        setLocationStatus("Iniciando modo demo...");
        simulateLocation();
        
        // Simular movimiento cada 3 segundos
        const demoInterval = setInterval(() => {
          if (tracking && demoMode) {
            simulateLocation();
          } else {
            clearInterval(demoInterval);
          }
        }, 3000);
        
        // Guardar referencia para limpiar
        watchIdRef.current = { clearInterval };
      }
    } else {
      setTracking(false);
      if (watchIdRef.current) {
        if (watchIdRef.current.clearInterval) {
          clearInterval(watchIdRef.current);
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      }
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
        <div className="location-status">
          <strong>Estado GPS:</strong> {locationStatus}
        </div>
        <button className="tracking-btn" onClick={handleTracking}>
          {tracking ? "Finalizar Ruta" : "Iniciar Seguimiento"}
        </button>
        <button className="tracking-btn" onClick={handleLocateUser} style={{ marginTop: "10px", background: "#10b981" }}>
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
