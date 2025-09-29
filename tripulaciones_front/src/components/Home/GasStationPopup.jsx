import React from 'react';
import { Fuel, MapPin, Clock, Star } from 'lucide-react';
import './GasStationPopup.scss';

const GasStationPopup = ({ station, onClose }) => {
  if (!station) return null;

  const { name, address, brand, prices, lastUpdated, visitCount, totalSpent, lastVisit, tickets } = station;

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `€${price.toFixed(3)}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="gas-station-popup">
      <div className="popup-header">
        <div className="station-info">
          <div className="station-name">
            <Fuel size={16} />
            <span>{name}</span>
          </div>
          <div className="station-brand">{brand}</div>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="popup-content">
        <div className="address">
          <MapPin size={14} />
          <span>{address}</span>
        </div>

        <div className="prices-section">
          <h4>Precios</h4>
          <div className="prices-grid">
            <div className="price-item">
              <span className="fuel-type">Gasolina 95</span>
              <span className="price">{formatPrice(prices.gasolina95)}</span>
            </div>
            <div className="price-item">
              <span className="fuel-type">Gasolina 98</span>
              <span className="price">{formatPrice(prices.gasolina98)}</span>
            </div>
            <div className="price-item">
              <span className="fuel-type">Diésel</span>
              <span className="price">{formatPrice(prices.diesel)}</span>
            </div>
            <div className="price-item">
              <span className="fuel-type">Diésel Plus</span>
              <span className="price">{formatPrice(prices.dieselPlus)}</span>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h4>Estadísticas de la Flota</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Visitas</span>
              <span className="stat-value">{visitCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Gastado</span>
              <span className="stat-value">€{(totalSpent || 0).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Última Visita</span>
              <span className="stat-value">{lastVisit ? formatTime(new Date(lastVisit)) : 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tickets</span>
              <span className="stat-value">{tickets?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="last-updated">
          <Clock size={12} />
          <span>Precios actualizados: {formatTime(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

export default GasStationPopup;
