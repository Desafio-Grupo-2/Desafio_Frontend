import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Fuel,
  TrendingUp,
  Users,
  Euro,
  Clock,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  FileText
} from 'lucide-react';
import EstacionesService from '../../services/estacionesApi';
import { logout } from '../../redux/auth/authSlice';
import AdminSidebar from '../Admin_sidebar/Admin_sidebar';
import './GasStationHotspots.scss';

const GasStationHotspots = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [sortBy, setSortBy] = useState('visits'); // visits, spending, name

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar navegación incluso si hay error
      navigate('/');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update markers when stats change
  useEffect(() => {
    if (mapRef.current && stats) {
      addGasStationMarkers();
    }
  }, [stats, selectedStation]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Cargando datos de gasolineras...');
      const statsData = await EstacionesService.getGasStationStats();
      console.log('Datos cargados:', statsData);
      setStats(statsData);
      
      // Initialize map after data is loaded
      setTimeout(() => {
        initializeMap();
      }, 100);
    } catch (error) {
      console.error('Error loading gas station data:', error);
      console.log('Backend no disponible, usando datos de demostración...');
      
      // Usar datos mock más realistas para demostración
      const mockStats = EstacionesService.getMockGasStationStats();
      setStats(mockStats);
      
      // Initialize map after data is loaded
      setTimeout(() => {
        initializeMap();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (mapRef.current) return;

    const mapContainer = document.getElementById('hotspots-map');
    if (!mapContainer) return;

    // Fix Leaflet default icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map('hotspots-map', {
      attributionControl: false,
      zoomControl: true
    }).setView([43.26271, -2.92528], 12);

    mapRef.current = map;

    // Add tile layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);

    // Add gas station markers after a short delay to ensure map is ready
    setTimeout(() => {
      addGasStationMarkers();
    }, 100);
  };

  const addGasStationMarkers = () => {
    if (!mapRef.current || !stats) {
      console.log('Mapa o stats no disponibles:', { map: !!mapRef.current, stats: !!stats });
      return;
    }

    console.log('Agregando marcadores al mapa...');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    const filteredStations = getFilteredStations();
    console.log('Estaciones filtradas para el mapa:', filteredStations.length);

    if (filteredStations.length === 0) {
      console.warn('No hay estaciones para mostrar en el mapa');
      return;
    }

    filteredStations.forEach((station, index) => {
      console.log(`Agregando marcador ${index + 1}:`, station.name, 'en', station.lat, station.lng);
      
      const isSelected = selectedStation?.id === station.id;
      const markerSize = Math.max(20, 20 + (station.visitCount / 200) * 16);
      
      const ticketCount = station.tickets?.length || 0;
      const hasTickets = ticketCount > 0;
      
      const gasStationIcon = L.divIcon({
        html: `
          <div class="gas-station-marker ${isSelected ? 'selected' : ''}" style="width: ${markerSize}px; height: ${markerSize}px;">
            <div style="width: ${markerSize}px; height: ${markerSize}px; background: ${hasTickets ? '#ff6a3d' : '#94a3b8'}; border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${Math.max(10, markerSize - 16)}px; box-shadow: 0 2px 8px rgba(255, 106, 61, 0.3); position: relative;">
              ⛽
              ${hasTickets ? `<div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white;">${ticketCount}</div>` : ''}
            </div>
            ${index < 3 ? '<div class="popularity-badge">🔥</div>' : ''}
          </div>
        `,
        className: 'custom-gas-station-marker',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      const marker = L.marker([station.lat, station.lng], { icon: gasStationIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a;">${station.name}</h4>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">${station.brand}</p>
            <div style="margin: 0 0 12px 0; color: #475569; font-size: 13px;">${station.address}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 12px;">
              <div>Gasolina 95: <strong style="color: #ff6a3d;">€${station.prices?.gasolina95?.toFixed(3) || 'N/A'}</strong></div>
              <div>Gasolina 98: <strong style="color: #ff6a3d;">€${station.prices?.gasolina98?.toFixed(3) || 'N/A'}</strong></div>
              <div>Diésel: <strong style="color: #ff6a3d;">€${station.prices?.diesel?.toFixed(3) || 'N/A'}</strong></div>
              <div>Diésel Plus: <strong style="color: #ff6a3d;">€${station.prices?.dieselPlus?.toFixed(3) || 'N/A'}</strong></div>
            </div>
            
            <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Visitas:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${station.visitCount || 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Gastado:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">€${(station.totalSpent || 0).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Tickets:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${station.tickets?.length || 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #64748b;">Provincia:</span>
                <strong style="color: #ff6a3d; font-size: 12px;">${station.provincia || 'N/A'}</strong>
              </div>
            </div>
          </div>
        `)
        .on('click', () => {
          setSelectedStation(station);
        });

      markersRef.current.set(station.id, marker);
    });

    console.log('Marcadores agregados:', markersRef.current.size);
  };

  const getFilteredStations = () => {
    if (!stats) return [];

    let filtered = stats.topStations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.provincia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.municipio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by brand
    if (filterBrand !== 'all') {
      filtered = filtered.filter(station => station.brand === filterBrand);
    }

    // Sort stations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'visits':
          return b.visitCount - a.visitCount;
        case 'spending':
          return b.totalSpent - a.totalSpent;
        case 'tickets':
          return (b.tickets?.length || 0) - (a.tickets?.length || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getBrands = () => {
    if (!stats) return [];
    return Object.keys(stats.brandStats);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="content">
          <div className="gas-station-hotspots">
            <div className="loading-top">
        <RefreshCw className="animate-spin" size={24} />
        <span>Cargando datos de gasolineras...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const filteredStations = getFilteredStations();
  const selectedStationTickets = selectedStation ? (selectedStation.tickets || []) : [];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Contenido principal */}
      <main className="content">
    <div className="gas-station-hotspots">
          {/* Header - Híbrido con personalidad única */}
          <div className="hotspots-header">
            <div className="header-content">
              <div className="header-title">
                <MapPin className="header-icon" />
            <h1>Hotspots de Gasolineras</h1>
              </div>
              <p className="header-subtitle">Análisis de rendimiento y popularidad de estaciones de servicio</p>
            </div>
          </div>

          {/* Overview Stats - Híbrido con iconos distintivos */}
          <div className="hotspots-stats">
            <div className="stat-hero">
              <div className="hero-icon">
                <Fuel className="icon" />
              </div>
              <div className="hero-content">
                <h2>Gasolineras Activas</h2>
                <div className="hero-value">{stats?.totalStations || 0}</div>
                <div className="hero-subtitle">Estaciones registradas</div>
              </div>
              <div className="hero-trend">
                <TrendingUp className="trend-icon" />
                <span>+12%</span>
              </div>
            </div>

            <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                  <Users className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.totalVisits || 0}</div>
                <div className="stat-label">Visitas Totales</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                  <Euro className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(stats?.totalSpent || 0)}</div>
                <div className="stat-label">Gasto Total</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                  <FileText className="icon" />
              </div>
              <div className="stat-content">
                  <div className="stat-value">{stats?.topStations?.reduce((total, station) => total + (station.tickets?.length || 0), 0) || 0}</div>
                  <div className="stat-label">Tickets Totales</div>
                </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                  <BarChart3 className="icon" />
              </div>
              <div className="stat-content">
                  <div className="stat-value">{Object.keys(stats?.brandStats || {}).length}</div>
                  <div className="stat-label">Marcas Diferentes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search - Estilo simplificado */}
          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar gasolinera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las marcas</option>
                {getBrands().map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="visits">Ordenar por visitas</option>
                <option value="spending">Ordenar por gasto</option>
                <option value="tickets">Ordenar por tickets</option>
                <option value="name">Ordenar por nombre</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="hotspots-content">
            {/* Stations List - Ranking mejorado */}
            <div className="top-stations">
              <div className="section-header">
                <BarChart3 className="section-icon" />
              <h2>Ranking de Gasolineras</h2>
                <div className="section-badge">
                  <span>{filteredStations.length} estaciones</span>
                </div>
              </div>
              <div className="stations-list">
                {filteredStations.map((station, index) => (
                  <div
                    key={station.id}
                    className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="station-rank">{index + 1}</div>
                    <div className="station-info">
                      <div className="station-name">
                        <MapPin size={16} />
                        {station.name}
                      </div>
                      <div className="station-details">
                        <div className="station-brand">{station.brand}</div>
                        <div className="station-address">{station.address}</div>
                      </div>
                    </div>
                    <div className="station-stats">
                      <div className="stat">
                        <div className="stat-value">{station.visitCount}</div>
                        <div className="stat-label">Visitas</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value">{formatCurrency(station.totalSpent)}</div>
                        <div className="stat-label">Gastado</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value">{station.tickets?.length || 0}</div>
                        <div className="stat-label">Tickets</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map - Sección mejorada */}
            <div className="map-section">
              <div className="section-header">
                <MapPin className="section-icon" />
              <h2>Mapa de Ubicaciones</h2>
                <div className="map-controls">
                  <div className="map-legend">
                    <div className="legend-item">
                      <div className="legend-dot active"></div>
                      <span>Con tickets</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot inactive"></div>
                      <span>Sin tickets</span>
                    </div>
                  </div>
                </div>
              </div>
              <div id="hotspots-map" className="hotspots-map"></div>
            </div>
          </div>

          {/* Selected Station Details - Mejorada */}
          {selectedStation && (
            <div className="selected-station-details">
              <div className="section-header">
                <FileText className="section-icon" />
                <h3>Tickets de {selectedStation.name}</h3>
                <div className="section-badge">
                  <span>{selectedStationTickets.length} tickets</span>
                </div>
              </div>
              <div className="tickets-list">
                {selectedStationTickets.length > 0 ? (
                  selectedStationTickets.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-header">
                        <div className="ticket-id">
                          <FileText size={16} />
                          Ticket #{ticket.id}
                        </div>
                        <div className="ticket-date">
                          <Clock size={16} />
                          {formatDate(ticket.date)}
                        </div>
                      </div>
                      <div className="ticket-details">
                        <div className="ticket-vehicle">
                          <Fuel size={16} />
                          <span>Vehículo: {ticket.vehicle}</span>
                        </div>
                        <div className="ticket-amount">
                          <Euro size={16} />
                          <span>{formatCurrency(ticket.amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tickets">
                    <FileText size={24} />
                    <span>No hay tickets para esta gasolinera</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Brand Statistics - Mejorada */}
          <div className="brand-stats">
            <div className="section-header">
              <Fuel className="section-icon" />
            <h2>Estadísticas por Marca</h2>
              <div className="section-badge">
                <span>{Object.keys(stats?.brandStats || {}).length} marcas</span>
              </div>
            </div>
            <div className="brands-grid">
              {Object.entries(stats?.brandStats || {}).map(([brand, brandData]) => (
                <div key={brand} className="brand-card">
                  <div className="brand-header">
                    <Fuel size={20} />
                    <div className="brand-name">{brand}</div>
                  </div>
                  <div className="brand-stats-grid">
                    <div className="brand-stat">
                      <div className="brand-stat-value">{brandData.stations}</div>
                      <div className="brand-stat-label">Estaciones</div>
                    </div>
                    <div className="brand-stat">
                      <div className="brand-stat-value">{brandData.visits}</div>
                      <div className="brand-stat-label">Visitas</div>
                    </div>
                    <div className="brand-stat">
                      <div className="brand-stat-value">{formatCurrency(brandData.spent)}</div>
                      <div className="brand-stat-label">Gastado</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
        </div>
  );
};

export default GasStationHotspots;

