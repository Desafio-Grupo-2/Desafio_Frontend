import { useState } from 'react';
import { useSelector } from 'react-redux';
import { authService } from '../../redux/auth/authService';
import ConsumoVehiculos from './ConsumoVehiculos';
import MetricasConductor from './MetricasConductor';
import '../../assets/styles/components/_analiticas.scss';

export default function Analiticas() {
  const [activeTab, setActiveTab] = useState('consumo');
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Obtener token del localStorage
  const token = authService.getToken();

  if (!isAuthenticated || !token) {
    return (
      <div className="analiticas">
        <div className="analiticas__container">
          <div className="analiticas__error">
            <h2>Acceso denegado</h2>
            <p>Necesitas iniciar sesión para acceder a las métricas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analiticas">
      <div className="analiticas__container">
        {/* Header principal */}
        <div className="analiticas__header">
          <h1>Métricas y Análisis</h1>
          <p>Análisis de consumo de vehículos y métricas de conductores</p>
        </div>

        {/* Navegación por pestañas */}
        <div className="analiticas__tabs">
          <button 
            className={`analiticas__tab-btn ${activeTab === 'consumo' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumo')}
          >
            📊 Consumo de Vehículos
          </button>
          <button 
            className={`analiticas__tab-btn ${activeTab === 'conductores' ? 'active' : ''}`}
            onClick={() => setActiveTab('conductores')}
          >
            👥 Métricas de Conductores
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="analiticas__tab-content">
          {activeTab === 'consumo' && <ConsumoVehiculos />}
          {activeTab === 'conductores' && <MetricasConductor />}
        </div>
      </div>
    </div>
  );
}
