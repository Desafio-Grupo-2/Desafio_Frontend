import React, { useState, useEffect } from 'react';
import { Fuel, TrendingUp, DollarSign, MapPin, Calendar, Car } from 'lucide-react';
import PreciOilService from '../../services/preciOilApi';
import './GasStationHotspots.scss';

const GasStationHotspots = () => {
  const [stats, setStats] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const gasStationStats = PreciOilService.getGasStationStats();
    setStats(gasStationStats);
  };

  const loadStationTickets = (stationId) => {
    const stationTickets = PreciOilService.getStationTickets(stationId);
    setTickets(stationTickets);
    setSelectedStation(stationId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!stats) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="gas-station-hotspots">
      <div className="hotspots-header">
        <h1>Hotspots de Gasolineras</h1>
        <p>Análisis de uso de gasolineras por la flota</p>
      </div>

      {/* Estadísticas generales */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Fuel />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStations}</div>
            <div className="stat-label">Gasolineras</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalVisits}</div>
            <div className="stat-label">Visitas Totales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
            <div className="stat-label">Total Gastado</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Car />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.averageSpentPerVisit)}</div>
            <div className="stat-label">Promedio por Visita</div>
          </div>
        </div>
      </div>

      <div className="hotspots-content">
        {/* Top Gasolineras */}
        <div className="top-stations">
          <h2>Top 10 Gasolineras Más Visitadas</h2>
          <div className="stations-list">
            {stats.topStations.map((station, index) => (
              <div 
                key={station.id} 
                className={`station-card ${selectedStation === station.id ? 'selected' : ''}`}
                onClick={() => loadStationTickets(station.id)}
              >
                <div className="station-rank">#{index + 1}</div>
                <div className="station-info">
                  <div className="station-name">
                    <Fuel size={16} />
                    <span>{station.name}</span>
                  </div>
                  <div className="station-details">
                    <span className="station-brand">{station.brand}</span>
                    <span className="station-address">{station.address}</span>
                  </div>
                </div>
                <div className="station-stats">
                  <div className="stat">
                    <span className="stat-value">{station.visitCount}</span>
                    <span className="stat-label">visitas</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatCurrency(station.totalSpent)}</span>
                    <span className="stat-label">gastado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets de la gasolinera seleccionada */}
        {selectedStation && (
          <div className="station-tickets">
            <h3>
              Tickets de {stats.topStations.find(s => s.id === selectedStation)?.name}
            </h3>
            <div className="tickets-list">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      <span className="ticket-id">{ticket.id}</span>
                      <span className="ticket-date">{formatDate(ticket.date)}</span>
                    </div>
                    <div className="ticket-details">
                      <div className="ticket-vehicle">
                        <Car size={14} />
                        <span>Vehículo: {ticket.vehicle}</span>
                      </div>
                      <div className="ticket-amount">
                        {formatCurrency(ticket.amount)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tickets">No hay tickets para esta gasolinera</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas por marca */}
      <div className="brand-stats">
        <h2>Estadísticas por Marca</h2>
        <div className="brands-grid">
          {Object.entries(stats.brandStats).map(([brand, data]) => (
            <div key={brand} className="brand-card">
              <div className="brand-header">
                <Fuel size={20} />
                <span className="brand-name">{brand}</span>
              </div>
              <div className="brand-stats-grid">
                <div className="brand-stat">
                  <span className="brand-stat-value">{data.stations}</span>
                  <span className="brand-stat-label">Estaciones</span>
                </div>
                <div className="brand-stat">
                  <span className="brand-stat-value">{data.visits}</span>
                  <span className="brand-stat-label">Visitas</span>
                </div>
                <div className="brand-stat">
                  <span className="brand-stat-value">{formatCurrency(data.spent)}</span>
                  <span className="brand-stat-label">Gastado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GasStationHotspots;
