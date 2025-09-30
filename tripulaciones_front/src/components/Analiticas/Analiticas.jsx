import ConsumoVehiculos from "../Metricas/ConsumoVehiculos";
import "../../styles/layout/adminDashboard.scss";
import "../../styles/layout/adminSidebar.scss";

export default function Analiticas() {
  return (
    <div className="admin-layout">
      {/* Contenido principal */}
      <main className="content">
        {/* HEADER */}
        <div className="header flex-between">
          <h1>Analíticas</h1>
        </div>

        {/* Sección de Consumo de Vehículos */}
        <div className="analiticas-section">
          <ConsumoVehiculos totalKm={200} />
        </div>

        {/* Espacio para futuras analíticas */}
        <div className="analiticas-placeholder">
          <div className="card">
            <h3 className="card-title">Más Analíticas</h3>
            <p className="card-content">Espacio para futuras analíticas</p>
          </div>
        </div>
      </main>
    </div>
  );
}
