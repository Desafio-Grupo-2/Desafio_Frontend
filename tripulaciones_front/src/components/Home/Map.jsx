import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet-rotatedmarker";
import { Clock, CheckCircle, Navigation, Route, Menu, X, Leaf, ChevronRight, LogOut, Car, Fuel, Phone } from "lucide-react";
import PreciOilService from "../../services/preciOilApi";
import MapThemeToggle from '../MapThemeToggle/MapThemeToggle';
import { useMapTheme } from '../../contexts/MapThemeContext';
import 'leaflet/dist/leaflet.css';
import "../../assets/styles/components/home/map.scss";
import "./GasStationPopup.scss";
import { logout } from "../../redux/auth/authSlice";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useMapTheme();
  const mapRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef(new Map());
  const watchIdRef = useRef(null);
  const paradasRef = useRef([]);
  const gasStationMarkersRef = useRef(new Map());
  const tileLayerRef = useRef(null);

  const [tracking, setTracking] = useState(false);
  const [paradasState, setParadasState] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [locationStatus, setLocationStatus] = useState("Esperando...");
  const [demoMode, setDemoMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFollowMode, setIsFollowMode] = useState(false);
  const [isRouteFinished, setIsRouteFinished] = useState(false);
  const [isParked, setIsParked] = useState(false);
  const [routeStartTime, setRouteStartTime] = useState(null);
  const [routeEndTime, setRouteEndTime] = useState(null);
  const [gasStations, setGasStations] = useState([]);
  const [showGasStations, setShowGasStations] = useState(false);

  // Efecto para cambiar el mapa SOLO en modo oscuro
  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      // Remover la capa actual
      mapRef.current.removeLayer(tileLayerRef.current);
      
      // Crear nueva capa según el tema
      const newTileLayer = isDarkMode 
        ? L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            maxZoom: 19,
            className: 'dark-map-tiles'
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          });
      
      // Agregar la nueva capa
      tileLayerRef.current = newTileLayer.addTo(mapRef.current);
    }
  }, [isDarkMode]);

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

  // El mapa siempre usa OpenStreetMap original, no cambia con el tema

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const handleFuelClick = async () => {
    console.log('=== BOTÓN DE GASOLINA CLICKEADO ===');
    console.log('showGasStations actual:', showGasStations);
    
    const map = mapRef.current;
    if (!map) {
      console.error('Mapa no disponible');
      return;
    }

    if (showGasStations) {
      console.log('Ocultando gasolineras...');
      // Ocultar gasolineras
      setShowGasStations(false);
      clearGasStationMarkers();
    } else {
      console.log('Mostrando gasolineras...');
      // Mostrar gasolineras
      setShowGasStations(true);
      const center = map.getCenter();
      console.log('Centro del mapa:', center);
      await loadGasStations(center.lat, center.lng);
    }
  };

  const handleCallClick = () => {
    // Función para llamada - puedes implementar lógica específica
    console.log('Llamada clicked');
  };


  // Cargar gasolineras desde la API de PreciOil
  const loadGasStations = async (lat, lng) => {
    console.log('=== INICIANDO CARGA DE GASOLINERAS ===');
    console.log('Coordenadas:', { lat, lng });
    
    try {
      console.log('Cargando gasolineras desde PreciOil API...', { lat, lng });
      
      // Intentar cargar estaciones de Bilbao específicamente
      try {
        console.log('Intentando cargar estaciones de Bilbao...');
        const bilbaoData = await PreciOilService.getEstacionesByMunicipio('Bilbao', 1, 50);
        console.log('Respuesta de estaciones de Bilbao:', bilbaoData);
        const bilbaoStations = bilbaoData.data || bilbaoData || [];
        console.log('Gasolineras de Bilbao encontradas:', bilbaoStations.length);
        
        if (bilbaoStations.length > 0) {
          console.log('Usando estaciones de Bilbao');
          setGasStations(bilbaoStations);
          addGasStationMarkers(bilbaoStations);
          return;
        }
      } catch (bilbaoError) {
        console.warn('Error cargando estaciones de Bilbao:', bilbaoError);
        console.warn('Intentando estaciones cercanas...');
      }

      // Si no hay estaciones de Bilbao, intentar estaciones cercanas
      try {
        console.log('Intentando cargar estaciones cercanas...');
        const nearbyData = await PreciOilService.getEstacionesCercanas(lat, lng, 10); // 10km de radio
        console.log('Respuesta de estaciones cercanas:', nearbyData);
        const nearbyStations = nearbyData.data || nearbyData || [];
        console.log('Gasolineras cercanas encontradas:', nearbyStations.length);
        
        if (nearbyStations.length > 0) {
          console.log('Usando estaciones cercanas');
          setGasStations(nearbyStations);
          addGasStationMarkers(nearbyStations);
          return;
        }
      } catch (nearbyError) {
        console.warn('Error cargando estaciones cercanas:', nearbyError);
        console.warn('Intentando estaciones de Vizcaya...');
      }

      // Si no hay estaciones cercanas, cargar estaciones de Vizcaya
      console.log('Cargando estaciones de Vizcaya desde PreciOil...');
      try {
        const vizcayaData = await PreciOilService.getEstacionesByProvincia('Vizcaya', 1, 100);
        console.log('Respuesta de estaciones de Vizcaya:', vizcayaData);
        const vizcayaStations = vizcayaData.data || vizcayaData || [];
        console.log('Estaciones de Vizcaya cargadas:', vizcayaStations.length);
        
        if (vizcayaStations.length > 0) {
          console.log('Usando estaciones de Vizcaya');
          setGasStations(vizcayaStations);
          addGasStationMarkers(vizcayaStations);
          return;
        }
      } catch (vizcayaError) {
        console.warn('Error cargando estaciones de Vizcaya:', vizcayaError);
      }

      // Si no hay datos de la API, usar datos realistas de Bilbao
      console.log('API no disponible, usando datos realistas de Bilbao');
      const bilbaoStationsData = {
        data: [
          {
            id: '1',
            rotulo: 'Repsol Alto de Enekuri',
            direccion: 'Av. Alto de Enekuri, 5',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.28663,
            lng: -2.95859,
            combustibles: [{
              precio_gasolina_95_e5: 1.559,
              precio_gasoleo_a: 1.499,
              precio_gasolina_98_e5: 1.729,
              precio_gasoleo_b: 1.599,
              fecha: new Date().toISOString()
            }]
          },
          {
            id: '2',
            rotulo: 'Repsol Viaducto Miraflores',
            direccion: 'Viaducto Miraflores Larreagaburu, 2',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.248472,
            lng: -2.924778,
            combustibles: [{
              precio_gasolina_95_e5: 1.548,
              precio_gasoleo_a: 1.488,
              precio_gasolina_98_e5: 1.718,
              precio_gasoleo_b: 1.588,
              fecha: new Date().toISOString()
            }]
          },
          {
            id: '3',
            rotulo: 'Cepsa Juan de Garay',
            direccion: 'Calle Juan de Garay, 9',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.25601887,
            lng: -2.93318476,
            combustibles: [{
              precio_gasolina_95_e5: 1.542,
              precio_gasoleo_a: 1.482,
              precio_gasolina_98_e5: 1.712,
              precio_gasoleo_b: 1.582,
              fecha: new Date().toISOString()
            }]
          },
          {
            id: '4',
            rotulo: 'BP San Mamés',
            direccion: 'Avenida Lehendakari Aguirre, 3',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.2644,
            lng: -2.9335,
            combustibles: [{
              precio_gasolina_95_e5: 1.545,
              precio_gasoleo_a: 1.485,
              precio_gasolina_98_e5: 1.715,
              precio_gasoleo_b: 1.585,
              fecha: new Date().toISOString()
            }]
          },
          {
            id: '5',
            rotulo: 'Shell Casco Viejo',
            direccion: 'Calle Correo, 12',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.2627,
            lng: -2.9253,
            combustibles: [{
              precio_gasolina_95_e5: 1.550,
              precio_gasoleo_a: 1.490,
              precio_gasolina_98_e5: 1.720,
              precio_gasoleo_b: 1.590,
              fecha: new Date().toISOString()
            }]
          },
          {
            id: '6',
            rotulo: 'Galp Deusto',
            direccion: 'Calle Iparraguirre, 12',
            localidad: 'Bilbao',
            municipio: 'Bilbao',
            provincia: 'Vizcaya',
            lat: 43.2689,
            lng: -2.9201,
            combustibles: [{
              precio_gasolina_95_e5: 1.535,
              precio_gasoleo_a: 1.475,
              precio_gasolina_98_e5: 1.705,
              precio_gasoleo_b: 1.575,
              fecha: new Date().toISOString()
            }]
          }
        ]
      };
      setGasStations(bilbaoStationsData.data);
      addGasStationMarkers(bilbaoStationsData.data);
      console.log('Datos realistas de Bilbao cargados');
      
    } catch (error) {
      console.error('Error cargando gasolineras:', error);
      // En caso de error total, mostrar mensaje
      console.log('No se pudieron cargar gasolineras desde la API');
    }
    
    console.log('=== FIN DE CARGA DE GASOLINERAS ===');
  };

  // Añadir marcadores de gasolineras al mapa
  const addGasStationMarkers = (stations) => {
    const map = mapRef.current;
    if (!map) {
      console.log('Mapa no disponible para agregar marcadores');
      return;
    }

    console.log('Agregando marcadores de gasolineras:', stations.length);

    // Limpiar marcadores existentes
    clearGasStationMarkers();

    // Filtrar solo gasolineras de Bilbao y con coordenadas válidas
    const bilbaoStations = stations.filter(station => {
      const transformedStation = PreciOilService.transformEstacionData(station);
      const isInBilbao = transformedStation.municipio?.toLowerCase().includes('bilbao') || 
                        transformedStation.localidad?.toLowerCase().includes('bilbao') ||
                        transformedStation.address?.toLowerCase().includes('bilbao');
      const hasValidCoords = transformedStation.lat !== 0 && transformedStation.lng !== 0;
      
      // Verificar que esté dentro del área de Bilbao (coordenadas aproximadas)
      const isInBilbaoArea = transformedStation.lat >= 43.20 && transformedStation.lat <= 43.35 &&
                            transformedStation.lng >= -2.98 && transformedStation.lng <= -2.90;
      
      return (isInBilbao || isInBilbaoArea) && hasValidCoords;
    });

    console.log(`Gasolineras filtradas para Bilbao: ${bilbaoStations.length} de ${stations.length}`);

    if (bilbaoStations.length === 0) {
      console.log('No hay gasolineras de Bilbao para mostrar');
      return;
    }

    bilbaoStations.forEach((station, index) => {
      console.log(`Procesando gasolinera ${index + 1}:`, station.Rotulo || station.name);
      
      // Transformar datos de la API al formato esperado
      const transformedStation = PreciOilService.transformEstacionData(station);
      console.log('Estación transformada:', transformedStation);

      // Usar icono personalizado de gasolinera
      const gasStationIcon = L.divIcon({
        html: `
          <div style="
            width: 30px; 
            height: 30px; 
            background: #ff6a3d; 
            border: 3px solid #fff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 2px 8px rgba(255, 106, 61, 0.4);
            color: white;
            font-weight: bold;
          ">
            ⛽
          </div>
        `,
        className: 'custom-gas-station-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      console.log(`Creando marcador para ${transformedStation.name} en [${transformedStation.lat}, ${transformedStation.lng}]`);
      
      // Verificar que las coordenadas sean válidas
      if (transformedStation.lat === 0 || transformedStation.lng === 0) {
        console.warn(`Coordenadas inválidas para ${transformedStation.name}: [${transformedStation.lat}, ${transformedStation.lng}]`);
        return;
      }

      const marker = L.marker([transformedStation.lat, transformedStation.lng], { icon: gasStationIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 220px;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a;">${transformedStation.name}</h4>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">${transformedStation.brand}</p>
            <div style="margin: 0 0 12px 0; color: #475569; font-size: 13px;">${transformedStation.address}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 12px;">
              <div>Gasolina 95: <strong style="color: #ff6a3d;">€${transformedStation.prices.gasolina95?.toFixed(3) || 'N/A'}</strong></div>
              <div>Gasolina 98: <strong style="color: #ff6a3d;">€${transformedStation.prices.gasolina98?.toFixed(3) || 'N/A'}</strong></div>
              <div>Diésel: <strong style="color: #ff6a3d;">€${transformedStation.prices.diesel?.toFixed(3) || 'N/A'}</strong></div>
              <div>Diésel Plus: <strong style="color: #ff6a3d;">€${transformedStation.prices.dieselPlus?.toFixed(3) || 'N/A'}</strong></div>
            </div>
            
            <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Provincia:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${transformedStation.provincia || 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Municipio:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${transformedStation.municipio || 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">CCAA:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${transformedStation.ccaa || 'N/A'}</strong>
              </div>
            </div>
          </div>
        `);

      gasStationMarkersRef.current.set(transformedStation.id, marker);
      console.log(`Marcador agregado para ${transformedStation.name}`);
    });

    console.log('Marcadores de gasolineras agregados:', gasStationMarkersRef.current.size);
    
    // Los marcadores de gasolineras se han agregado correctamente
    console.log('Marcadores de gasolineras agregados correctamente');
    
    // Verificar que los marcadores estén en el mapa
    const mapBounds = map.getBounds();
    console.log('Límites del mapa:', mapBounds);
    
    // Solo ajustar el mapa si es la primera vez que se cargan las gasolineras
    if (gasStationMarkersRef.current.size > 0 && !showGasStations) {
      const group = new L.featureGroup(Array.from(gasStationMarkersRef.current.values()));
      map.fitBounds(group.getBounds().pad(0.1));
      console.log('Mapa ajustado a los marcadores (primera carga)');
    } else {
      console.log('Marcadores agregados sin ajustar el mapa');
    }
  };

  // Limpiar marcadores de gasolineras
  const clearGasStationMarkers = () => {
    gasStationMarkersRef.current.forEach((marker) => {
      marker.remove();
    });
    gasStationMarkersRef.current.clear();
    
    // Limpiar elementos de prueba si existen
    if (window.testMarker) {
      window.testMarker.remove();
      window.testMarker = null;
    }
    
    if (window.redCircle) {
      window.redCircle.remove();
      window.redCircle = null;
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '--:--';
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
    html: `
      <div style="
        width: 0; 
        height: 0; 
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 20px solid #10b981;
        position: relative;
        filter: drop-shadow(0 2px 6px rgba(16, 185, 129, 0.4));
      ">
        <div style="
          position: absolute;
          top: 15px;
          left: -8px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #10b981;
        "></div>
      </div>
    `,
    className: "custom-arrow-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 24], // Ancla en la punta de la flecha
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
      // Forzar actualización del icono para asegurar que se use la flecha
      vehicleMarkerRef.current.setIcon(arrowIcon);
      
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

    // Agregar capa inicial según el tema
    const initialTileLayer = isDarkMode 
      ? L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
          className: 'dark-map-tiles'
        })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        });
    tileLayerRef.current = initialTileLayer.addTo(map);

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
      setIsRouteFinished(false);
      setIsParked(false);
      setRouteStartTime(new Date());

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
              // Forzar actualización del icono para asegurar que se use la flecha
              vehicleMarkerRef.current.setIcon(arrowIcon);
              
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
      // Finalizar seguimiento. Si no quedan paradas, marcar ruta como finalizada
      setTracking(false);
      if (watchIdRef.current?.clearInterval) clearInterval(watchIdRef.current.clearInterval);
      else if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      routeLayerRef.current?.clearLayers();
      setIsFollowMode(false);
      if (isParked) {
        setRouteEndTime(new Date());
        setIsRouteFinished(true);
      }
    }
  };

  return (
    <div className={`transport-map-wrapper${isRouteFinished ? " finished" : ""}`}>
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
        <button
          className="tracking-btn"
          onClick={handleTracking}
          disabled={tracking && !isParked}
          title={tracking && !isParked ? (remainingStops > 0 ? "Completa todas las paradas para finalizar" : "Marca 'Vehículo aparcado' para finalizar") : undefined}
        >
          {tracking ? "Finalizar Ruta" : "Iniciar Seguimiento"}
        </button>
        {tracking && remainingStops === 0 && !isParked && (
          <button className="park-btn" onClick={() => setIsParked(true)}>
            <Car size={18} />
            <span>Vehículo aparcado</span>
          </button>
        )}
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
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
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
        
        {/* Iconos flotantes en la esquina inferior derecha */}
        <div className="floating-icons">
          <MapThemeToggle className="floating-icon theme-icon" />
          <button 
            className={`floating-icon fuel-icon ${showGasStations ? 'active' : ''}`}
            onClick={handleFuelClick}
            title={showGasStations ? "Ocultar gasolineras" : "Mostrar gasolineras"}
          >
            <Fuel size={20} />
          </button>
          <button 
            className="floating-icon call-icon" 
            onClick={handleCallClick}
            title="Llamada"
          >
            <Phone size={20} />
          </button>
        </div>
      </div>
      {isRouteFinished && (
        <>
          <div className="finish-backdrop" />
          <div className="finish-modal" role="dialog" aria-modal="true" aria-labelledby="finish-title">
            <div className="finish-header">
              <h2 id="finish-title">Ruta Completada</h2>
              <p>Has completado todas las paradas correctamente</p>
            </div>
            
            <div className="finish-stats">
              {/* Columna izquierda */}
              <div className="stat-card">
                <Navigation />
                <div>
                  <div className="stat-value">{totalDistance} km</div>
                  <div className="stat-label">Recorridos</div>
                </div>
              </div>
              <div className="stat-card">
                <Clock />
                <div>
                  <div className="stat-value">{formatTime(routeStartTime)}</div>
                  <div className="stat-label">Inicio</div>
                </div>
              </div>
              {/* Columna derecha */}
              <div className="stat-card">
                <CheckCircle />
                <div>
                  <div className="stat-value">{completedStops}</div>
                  <div className="stat-label">Paradas</div>
                </div>
              </div>
              <div className="stat-card">
                <Clock />
                <div>
                  <div className="stat-value">{formatTime(routeEndTime)}</div>
                  <div className="stat-label">Finalización</div>
                </div>
              </div>
            </div>

            <button className="tracking-btn" onClick={handleLogout}>
              Abandonar
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default MapComponent;