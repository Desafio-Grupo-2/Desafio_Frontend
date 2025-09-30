import ConsumoVehiculos from "./ConsumoVehiculos";
import "../../styles/layout/adminDashboard.scss";
import "../../styles/layout/adminSidebar.scss";

export default function Metricas() {
  return (
    <div className="admin-layout">
      {/* Contenido principal */}
      <main className="content">
        {/* HEADER */}
        <div className="header flex-between">
          <div className="header-content">
            <div className="header-title">
              <div className="header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <h1>Métricas</h1>
            </div>
            <p className="header-subtitle">Análisis detallado de rendimiento y consumo</p>
          </div>
        </div>

        {/* Sección de Consumo de Vehículos */}
        <div className="metricas-section">
          <ConsumoVehiculos totalKm={200} />
        </div>

        {/* Espacio para futuras métricas */}
        <div className="metricas-placeholder">
          <div className="card">
            <h3 className="card-title">Más Métricas</h3>
            <p className="card-content">Espacio para futuras métricas y análisis</p>
          </div>
        </div>
      </main>
    </div>
  );
}
