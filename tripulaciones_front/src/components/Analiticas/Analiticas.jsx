import ConsumoVehiculos from "../ModelosPrediccion/ConsumoVehiculos";
import "../../styles/components/_analiticas.scss";

export default function Analiticas() {
  return (
    <div className="analiticas-container">
      <div className="analiticas-header">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analíticas</h1>
        <p className="text-gray-600 mb-8">Análisis y predicciones de la flota de San Millán Bus</p>
      </div>

      <div className="analiticas-content">
        {/* Sección de Consumo de Vehículos */}
        <div className="analiticas-section">
          <ConsumoVehiculos totalKm={200} />
        </div>

        {/* Espacio para futuras analíticas */}
        <div className="analiticas-placeholder">
          <div className="placeholder-card">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Más Analíticas</h3>
            <p className="text-gray-500">Espacio para futuras analíticas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
