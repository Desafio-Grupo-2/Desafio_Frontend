import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { authService } from '../../redux/auth/authService';
import './MetricasConductor.scss';

export default function MetricasConductor() {
  const [loading, setLoading] = useState(true);
  const [periodoEmpleados, setPeriodoEmpleados] = useState('30dias');
  const [empleadosMetrics, setEmpleadosMetrics] = useState(null);
  const [totalesGenerales, setTotalesGenerales] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Obtener token del localStorage
  const token = authService.getToken();
  
  // Función para obtener métricas de empleados
  const fetchEmpleadosMetrics = useCallback(async (periodo = '30dias') => {
    try {
      //console.log(`Fetching empleados metrics for periodo: ${periodo}`);
      const empleadosRes = await fetch(`https://desafio-fullback.onrender.com/api/tickets/metrics/empleados?periodo=${periodo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (empleadosRes.ok) {
        const empleadosData = await empleadosRes.json();
        if (empleadosData.success) {
          //console.log(`Empleados metrics for ${periodo}:`, empleadosData.data.totalesGenerales);
          setEmpleadosMetrics(empleadosData.data.empleados);
          setTotalesGenerales(empleadosData.data.totalesGenerales);
          setRefreshKey(prev => prev + 1); // Forzar re-render
        }
      }
    } catch (error) {
      console.error('Error obteniendo métricas de empleados:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchEmpleadosMetrics('30dias');
      setLoading(false);
    }
  }, [fetchEmpleadosMetrics, token, isAuthenticated]);

  if (!isAuthenticated || !token) {
    return (
      <div className="metricas-conductor__error">
        <h2>Acceso denegado</h2>
        <p>Necesitas iniciar sesión para acceder a las métricas de conductores.</p>
      </div>
    );
  }

  return (
    <div className="metricas-conductor">
      {/* Header del componente */}
      <div className="metricas-conductor__header">
        <h2>Desglose de Conductores</h2>
      </div>

      {/* Controles de período */}
      <div className="metricas-conductor__controls">
        <h3>Seleccionar Período</h3>
        <div className="metricas-conductor__periodo-selector">
          <button 
            className={`metricas-conductor__periodo-btn ${periodoEmpleados === '30dias' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('30dias');
              fetchEmpleadosMetrics('30dias');
            }}
          >
            1 Mes
          </button>
          <button 
            className={`metricas-conductor__periodo-btn ${periodoEmpleados === 'semestre' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('semestre');
              fetchEmpleadosMetrics('semestre');
            }}
          >
            6 Meses
          </button>
          <button 
            className={`metricas-conductor__periodo-btn ${periodoEmpleados === 'todos' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('todos');
              fetchEmpleadosMetrics('todos');
            }}
          >
            Anual
          </button>
        </div>
        <div className="metricas-conductor__periodo-info">
          Período seleccionado: {periodoEmpleados === 'todos' ? 'Anual' : periodoEmpleados === 'semestre' ? '6 Meses' : '1 Mes'}
        </div>
      </div>

      {/* Métricas de Empleados */}
      {!loading && empleadosMetrics && totalesGenerales && (
        <div key={`empleados-${periodoEmpleados}-${refreshKey}`} className="metricas-conductor__empleados">
          <div className="metricas-conductor__stats-grid">
            <div className="metricas-conductor__stats-card metricas-conductor__stats-card--blue">
              <div className="metricas-conductor__stats-card-icon">👥</div>
              <div className="metricas-conductor__stats-card-content">
                <div className="metricas-conductor__stats-card-value">{empleadosMetrics.length}</div>
                <div className="metricas-conductor__stats-card-label">Total Empleados</div>
                <div className="metricas-conductor__stats-card-sublabel">Conductores activos</div>
              </div>
            </div>
            
            <div className="metricas-conductor__stats-card metricas-conductor__stats-card--green">
              <div className="metricas-conductor__stats-card-icon">🛣️</div>
              <div className="metricas-conductor__stats-card-content">
                <div className="metricas-conductor__stats-card-value">{(parseFloat(totalesGenerales.totalKm) || 0).toLocaleString()} km</div>
                <div className="metricas-conductor__stats-card-label">Total Km Recorridos</div>
                <div className="metricas-conductor__stats-card-sublabel">En el período seleccionado</div>
              </div>
            </div>
            
            <div className="metricas-conductor__stats-card metricas-conductor__stats-card--purple">
              <div className="metricas-conductor__stats-card-icon">🎫</div>
              <div className="metricas-conductor__stats-card-content">
                <div className="metricas-conductor__stats-card-value">{totalesGenerales.totalTickets}</div>
                <div className="metricas-conductor__stats-card-label">Total Tickets</div>
                <div className="metricas-conductor__stats-card-sublabel">Tickets procesados</div>
              </div>
            </div>
          </div>
          
          {/* Top 3 empleados con más actividad */}
          <div className="metricas-conductor__top-empleados">
            <h3 className="metricas-conductor__top-empleados-title">Top 3 Empleados Más Activos</h3>
            <div className="metricas-conductor__top-empleados-list">
              {empleadosMetrics
                .sort((a, b) => b.totalTickets - a.totalTickets)
                .slice(0, 3)
                .map((empleado, index) => (
                  <div key={empleado.usuarioId} className="metricas-conductor__empleado-card">
                    <div className="metricas-conductor__empleado-rank">#{index + 1}</div>
                    <div className="metricas-conductor__empleado-info">
                      <div className="metricas-conductor__empleado-name">{empleado.nombre} {empleado.apellido}</div>
                      <div className="metricas-conductor__empleado-email">{empleado.email}</div>
                    </div>
                    <div className="metricas-conductor__empleado-stats">
                      <div className="metricas-conductor__empleado-stat">
                        <span className="metricas-conductor__empleado-stat-value">{empleado.totalTickets}</span>
                        <span className="metricas-conductor__empleado-stat-label">tickets</span>
                      </div>
                      <div className="metricas-conductor__empleado-stat">
                        <span className="metricas-conductor__empleado-stat-value">{parseFloat(empleado.totalKm).toLocaleString()}</span>
                        <span className="metricas-conductor__empleado-stat-label">km</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="metricas-conductor__loading">
          Cargando métricas de conductores...
        </div>
      )}
    </div>
  );
}