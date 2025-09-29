import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { authService } from '../../redux/auth/authService';

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
      console.log(`Fetching empleados metrics for periodo: ${periodo}`);
      const empleadosRes = await fetch(`https://desafio-fullback.onrender.com/api/tickets/metrics/empleados?periodo=${periodo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (empleadosRes.ok) {
        const empleadosData = await empleadosRes.json();
        if (empleadosData.success) {
          console.log(`Empleados metrics for ${periodo}:`, empleadosData.data.totalesGenerales);
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
      <div className="analiticas__error">
        <h2>Acceso denegado</h2>
        <p>Necesitas iniciar sesión para acceder a las métricas de conductores.</p>
      </div>
    );
  }

  return (
    <div className="analiticas__conductores">
      {/* Header del componente */}
      <div className="analiticas__header">
        <h2>Métricas de Conductores</h2>
        <p>Análisis de rendimiento y actividad de los conductores</p>
      </div>

      {/* Controles de período */}
      <div className="analiticas__controls">
        <h3>Seleccionar Período</h3>
        <div className="analiticas__periodo-selector">
          <button 
            className={`analiticas__periodo-btn ${periodoEmpleados === '30dias' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('30dias');
              fetchEmpleadosMetrics('30dias');
            }}
          >
            1 Mes
          </button>
          <button 
            className={`analiticas__periodo-btn ${periodoEmpleados === 'semestre' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('semestre');
              fetchEmpleadosMetrics('semestre');
            }}
          >
            6 Meses
          </button>
          <button 
            className={`analiticas__periodo-btn ${periodoEmpleados === 'todos' ? 'active' : ''}`}
            onClick={() => {
              setPeriodoEmpleados('todos');
              fetchEmpleadosMetrics('todos');
            }}
          >
            Anual
          </button>
        </div>
        <div className="analiticas__periodo-info">
          Período seleccionado: {periodoEmpleados === 'todos' ? 'Anual' : periodoEmpleados === 'semestre' ? '6 Meses' : '1 Mes'}
        </div>
      </div>

      {/* Métricas de Empleados */}
      {!loading && empleadosMetrics && totalesGenerales && (
        <div key={`empleados-${periodoEmpleados}-${refreshKey}`} className="analiticas__empleados">
          <div className="analiticas__stats-grid">
            <div className="analiticas__stats-card analiticas__stats-card--blue">
              <div className="analiticas__stats-card-icon">👥</div>
              <div className="analiticas__stats-card-content">
                <div className="analiticas__stats-card-value">{empleadosMetrics.length}</div>
                <div className="analiticas__stats-card-label">Total Empleados</div>
                <div className="analiticas__stats-card-sublabel">Conductores activos</div>
              </div>
            </div>
            
            <div className="analiticas__stats-card analiticas__stats-card--green">
              <div className="analiticas__stats-card-icon">🛣️</div>
              <div className="analiticas__stats-card-content">
                <div className="analiticas__stats-card-value">{(parseFloat(totalesGenerales.totalKm) || 0).toLocaleString()} km</div>
                <div className="analiticas__stats-card-label">Total Km Recorridos</div>
                <div className="analiticas__stats-card-sublabel">En el período seleccionado</div>
              </div>
            </div>
            
            <div className="analiticas__stats-card analiticas__stats-card--purple">
              <div className="analiticas__stats-card-icon">🎫</div>
              <div className="analiticas__stats-card-content">
                <div className="analiticas__stats-card-value">{totalesGenerales.totalTickets}</div>
                <div className="analiticas__stats-card-label">Total Tickets</div>
                <div className="analiticas__stats-card-sublabel">Tickets procesados</div>
              </div>
            </div>
          </div>
          
          {/* Top 3 empleados con más actividad */}
          <div className="analiticas__top-empleados">
            <h3 className="analiticas__top-empleados-title">Top 3 Empleados Más Activos</h3>
            <div className="analiticas__top-empleados-list">
              {empleadosMetrics
                .sort((a, b) => b.totalTickets - a.totalTickets)
                .slice(0, 3)
                .map((empleado, index) => (
                  <div key={empleado.usuarioId} className="analiticas__empleado-card">
                    <div className="analiticas__empleado-rank">#{index + 1}</div>
                    <div className="analiticas__empleado-info">
                      <div className="analiticas__empleado-name">{empleado.nombre} {empleado.apellido}</div>
                      <div className="analiticas__empleado-email">{empleado.email}</div>
                    </div>
                    <div className="analiticas__empleado-stats">
                      <div className="analiticas__empleado-stat">
                        <span className="analiticas__empleado-stat-value">{empleado.totalTickets}</span>
                        <span className="analiticas__empleado-stat-label">tickets</span>
                      </div>
                      <div className="analiticas__empleado-stat">
                        <span className="analiticas__empleado-stat-value">{parseFloat(empleado.totalKm).toLocaleString()}</span>
                        <span className="analiticas__empleado-stat-label">km</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="analiticas__loading">
          Cargando métricas de conductores...
        </div>
      )}
    </div>
  );
}
