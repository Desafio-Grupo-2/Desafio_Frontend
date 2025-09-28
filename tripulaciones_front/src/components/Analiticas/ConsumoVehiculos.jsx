import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { authService } from '../../redux/auth/authService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

// precios de energía estimados (mock, obtener de una API real)
const preciosEnergia = {
  Gasolina: 1.7,   // €/litro
  Híbrido: 1.4,    // €/litro equivalente
  Eléctrico: 0.25, // €/kWh
};

export default function ConsumoVehiculos({ totalKm = 100 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [periodoActual, setPeriodoActual] = useState('30dias');
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Obtener token del localStorage
  const token = authService.getToken();

  const fetchVehiculos = useCallback(async (periodo = '30dias') => {
      try {
        setPeriodoActual(periodo);
        setLoading(true);
        
        const vehiculosRes = await fetch(`https://desafio-fullback.onrender.com/api/vehiculos?periodo=${periodo}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!vehiculosRes.ok) {
          if (vehiculosRes.status === 401) {
            setAuthError(true);
            return;
          }
          throw new Error('Error en la respuesta del servidor');
        }
        
        const vehiculosData = await vehiculosRes.json();
        const vehiculos = vehiculosData.data || [];
        
        console.log('Datos de vehículos recibidos:', vehiculos);
        console.log('Número de vehículos:', vehiculos.length);
        
        if (vehiculos.length === 0) {
          console.log('No hay vehículos en la base de datos para el período:', periodo);
          setData([]);
          setLoading(false);
          return;
        }

        // Preparar datos para la predicción IA según el formato de la API externa
        const datosPrediccion = vehiculos.map(v => ({
          coste_energetico_vehiculo: v.coste_real || 0,
          total_km: totalKm
        }));

        // Llamar directamente a la API externa de predicción
        let predictionData = null;
        try {
          console.log('Enviando datos a API externa de predicción:', datosPrediccion);
          const predictionRes = await fetch('https://desafio-reto2.onrender.com/predict_batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: datosPrediccion })
          });

          if (predictionRes.ok) {
            predictionData = await predictionRes.json();
            console.log('Respuesta de API de predicción:', predictionData);
          } else {
            console.log('API de predicción no disponible (404), usando predicción local');
          }
        } catch (error) {
          console.error('Error con API de predicción:', error);
        }

        // Si no hay respuesta de la API externa, usar predicción local
        if (!predictionData || !predictionData.success) {
          console.log('Usando predicción local inteligente');
          // Crear predicción local más inteligente como fallback
          predictionData = {
            predictions: vehiculos.map((v, index) => {
              // Factor de ajuste basado en datos históricos y características del vehículo
              let factorPrediccion = 0.9; // Base
              
              // Ajustar según el tipo de motorización
              if (v.motorizacion === 'Eléctrico') {
                factorPrediccion = 0.85; // Los eléctricos suelen ser más eficientes
              } else if (v.motorizacion === 'Híbrido') {
                factorPrediccion = 0.92; // Híbridos moderadamente eficientes
              } else {
                factorPrediccion = 0.95; // Gasolina tradicional
              }
              
              // Ajustar según el período
              if (periodo === 'anual') {
                factorPrediccion *= 1.05; // Más variabilidad en períodos largos
              } else if (periodo === 'semestre') {
                factorPrediccion *= 1.02; // Ligera variabilidad
              }
              
              // Ajustar según la cantidad de tickets (más datos = más confianza)
              const ticketsCount = v.tickets_count || 0;
              if (ticketsCount > 50) {
                factorPrediccion *= 0.98; // Más datos históricos = predicción más conservadora
              } else if (ticketsCount < 10) {
                factorPrediccion *= 1.1; // Menos datos = más incertidumbre
              }
              
              return {
                matricula: v.matricula,
                prediction: (v.coste_real || 0) * factorPrediccion,
                confidence: Math.min(0.95, 0.7 + (ticketsCount / 100))
              };
            })
          };
        }

        const resultados = vehiculos.map((v, index) => {
          // Usar coste real de la base de datos si está disponible
          let coste = v.coste_real || 0;
          
          // Si no hay coste real, calcular usando datos específicos del vehículo
          if (coste === 0) {
            const consumoMedio = (v.consumo_min + v.consumo_max) / 2;
            const precio = preciosEnergia[v.motorizacion] || 1.5;
            coste = (totalKm / 100) * consumoMedio * precio;
            
            // Para vehículos eléctricos, calcular coste basado en kWh
            if (v.motorizacion === 'Eléctrico') {
              const kwhPorKm = 0.3; // Consumo típico de autobús eléctrico
              const precioKwh = 0.25; // €/kWh
              coste = totalKm * kwhPorKm * precioKwh;
            }
          }
          
          // Obtener predicción de la API - específica por vehículo
          let prediccion = coste * 0.9; // Fallback por defecto
          
          // Verificar si tenemos predicciones de la API externa
          if (predictionData && predictionData.predictions && predictionData.predictions[index]) {
            const predictionItem = predictionData.predictions[index];
            prediccion = predictionItem.prediction || predictionItem;
          }
          
          // Convertir a número y redondear
          const prediccionNumero = typeof prediccion === 'number' ? prediccion : parseFloat(prediccion) || 0;
          
          return {
            name: `${v.marca} ${v.modelo}`,
            coste: Number(coste.toFixed(2)),
            prediction: Number(prediccionNumero.toFixed(2)),
          };
        });

        console.log('Resultados finales para el gráfico:', resultados);
        setData(resultados);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
        setData([]); // No mostrar datos mockeados, solo datos reales
      } finally {
        setLoading(false);
      }
    }, [token, totalKm]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchVehiculos('30dias');
    }
  }, [fetchVehiculos, token, isAuthenticated]);

  if (authError) {
    return (
      <div className="analiticas__error">
        <h2>Error de autenticación</h2>
        <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="analiticas__consumo">
      {/* Header del componente */}
      <div className="analiticas__header">
        <h2>Análisis de Consumo de Vehículos</h2>
        <p>Comparación entre coste real y predicción IA</p>
      </div>

      {/* Controles de período */}
      <div className="analiticas__controls">
        <h3>Seleccionar Período</h3>
        <div className="analiticas__controls-periods">
          <button 
            className={`analiticas__controls-period-btn ${periodoActual === '30dias' ? 'active' : ''}`}
            onClick={() => fetchVehiculos('30dias')}
          >
            30 Días
          </button>
          <button 
            className={`analiticas__controls-period-btn ${periodoActual === 'semestre' ? 'active' : ''}`}
            onClick={() => fetchVehiculos('semestre')}
          >
            6 Meses
          </button>
          <button 
            className={`analiticas__controls-period-btn ${periodoActual === 'anual' ? 'active' : ''}`}
            onClick={() => fetchVehiculos('anual')}
          >
            1 Año
          </button>
        </div>
        <div className="analiticas__periodo-info">
          Período seleccionado: {periodoActual === '30dias' ? '30 Días' : periodoActual === 'semestre' ? '6 Meses' : '1 Año'}
        </div>
      </div>

      {/* Gráfico */}
      <div className="analiticas__chart">
        <h2>Comparación de Consumo por Vehículo</h2>
        <div className="analiticas__chart-container">
          {loading ? (
            <div className="analiticas__loading">Cargando datos...</div>
          ) : data.length === 0 ? (
            <div className="analiticas__warning">
              <h3>⚠️ Sin datos disponibles</h3>
              <p>No se encontraron tickets reales para el período seleccionado. Los datos mostrados son estimaciones basadas en las características de los vehículos.</p>
              <p>Para obtener predicciones más precisas, asegúrate de que hay tickets registrados en el sistema.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  label={{ value: 'Coste (€)', angle: -90, position: 'insideLeft' }}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}€`, 
                    name === 'coste' ? 'Coste Real (€)' : 'Predicción IA (€)'
                  ]}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Bar dataKey="coste" fill="#ff7a59" name="Coste Real" />
                <Bar dataKey="prediction" fill="#64748b" name="Predicción IA" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {!loading && data.length > 0 && (
        <div className="analiticas__stats">
          <div className="analiticas__stats-card">
            <h3>Total Vehículos</h3>
            <div className="analiticas__stats-card-value">{data.length}</div>
            <p className="analiticas__stats-card-label">Vehículos analizados</p>
          </div>
          <div className="analiticas__stats-card">
            <h3>Coste Total Real</h3>
            <div className="analiticas__stats-card-value">
              {data.reduce((sum, item) => sum + item.coste, 0).toFixed(2)}€
            </div>
            <p className="analiticas__stats-card-label">Suma de costes reales</p>
          </div>
          <div className="analiticas__stats-card">
            <h3>Predicción Total IA</h3>
            <div className="analiticas__stats-card-value">
              {data.reduce((sum, item) => sum + item.prediction, 0).toFixed(2)}€
            </div>
            <p className="analiticas__stats-card-label">Suma de predicciones IA</p>
          </div>
          <div className="analiticas__stats-card">
            <h3>Variación Promedio</h3>
            <div className="analiticas__stats-card-value">
              {((data.reduce((sum, item) => sum + (item.prediction - item.coste), 0) / data.length)).toFixed(2)}€
            </div>
            <p className="analiticas__stats-card-label">Variación entre real y predicho</p>
          </div>
        </div>
      )}
    </div>
  );
}
