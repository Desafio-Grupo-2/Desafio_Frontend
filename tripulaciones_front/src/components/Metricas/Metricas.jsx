import { useSelector } from 'react-redux';
import { authService } from '../../redux/auth/authService';
import MetricasConductor from './MetricasConductor';
import './Metricas.scss';

export default function Metricas() {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Obtener token del localStorage
  const token = authService.getToken();

  if (!isAuthenticated || !token) {
    return (
      <div className="metricas">
        <div className="metricas__container">
          <div className="metricas__error">
            <h2>Acceso denegado</h2>
            <p>Necesitas iniciar sesión para acceder a las métricas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metricas">
      <div className="metricas__container">
        {/* Header principal */}
        <div className="metricas__header">
          <h1>Métricas de Conductores</h1>
          <p>Análisis de rendimiento y actividad</p>
        </div>

        {/* Contenido de métricas de conductores */}
        <div className="metricas__content">
          <MetricasConductor />
        </div>
      </div>
    </div>
  );
}