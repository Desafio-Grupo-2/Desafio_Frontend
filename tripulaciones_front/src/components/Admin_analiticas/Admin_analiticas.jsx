import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Fuel,
  PieChart,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import ConsumoVehiculos from "../Metricas/ConsumoVehiculos";
import VehiculosService from "../../redux/vehiculos/vehiculosService";
import "../../styles/layout/adminDashboard.scss";
import "../../styles/layout/adminSidebar.scss";

const AdminAnaliticas = () => {
  const [kpis, setKpis] = useState({
    totalVehiculos: 0,
    eficienciaPromedio: "0%",
    ahorroMensual: "€0",
    reduccionCO2: "0%",
  });
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para las analíticas (mantener para gráficos)
  const consumoData = [
    { mes: "Ene", consumo: 45, eficiencia: 78 },
    { mes: "Feb", consumo: 52, eficiencia: 82 },
    { mes: "Mar", consumo: 48, eficiencia: 85 },
    { mes: "Abr", consumo: 55, eficiencia: 88 },
    { mes: "May", consumo: 50, eficiencia: 90 },
    { mes: "Jun", consumo: 47, eficiencia: 92 },
  ];

  const eficienciaData = [
    { name: "Excelente", value: 35, color: "#10b981" },
    { name: "Buena", value: 45, color: "#3b82f6" },
    { name: "Regular", value: 15, color: "#f59e0b" },
    { name: "Mala", value: 5, color: "#ef4444" },
  ];

  const gastosData = [
    { categoria: "Combustible", monto: 45000, porcentaje: 60 },
    { categoria: "Mantenimiento", monto: 15000, porcentaje: 20 },
    { categoria: "Peajes", monto: 12000, porcentaje: 16 },
    { categoria: "Otros", monto: 3000, porcentaje: 4 },
  ];

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos reales de vehículos
        const vehiculosResponse = await VehiculosService.getVehiculosConCostesReales(1);
        const vehiculos = vehiculosResponse.data || [];
        
        // Calcular KPIs reales
        const totalVehiculos = vehiculos.length;
        
        // Calcular eficiencia promedio basada en costes reales
        let eficienciaPromedio = 0;
        if (vehiculos.length > 0) {
          const costesReales = vehiculos.map(v => v.coste_real || 0).filter(c => c > 0);
          if (costesReales.length > 0) {
            const promedioCoste = costesReales.reduce((sum, coste) => sum + coste, 0) / costesReales.length;
            // Simular eficiencia basada en coste promedio (menor coste = mayor eficiencia)
            eficienciaPromedio = Math.max(60, Math.min(95, 100 - (promedioCoste / 100)));
          }
        }
        
        // Calcular ahorro mensual estimado
        const ahorroMensual = vehiculos.length * 500; // €500 por vehículo
        
        // Calcular reducción CO2 basada en tipo de motorización
        const vehiculosElectricos = vehiculos.filter(v => v.motorizacion === 'Eléctrico').length;
        const reduccionCO2 = vehiculos.length > 0 ? (vehiculosElectricos / vehiculos.length) * 30 : 0;
        
        setKpis({
          totalVehiculos,
          eficienciaPromedio: `${Math.round(eficienciaPromedio)}%`,
          ahorroMensual: `€${ahorroMensual.toLocaleString()}`,
          reduccionCO2: `${Math.round(reduccionCO2)}%`,
        });
        
        console.log('Datos reales cargados:', {
          totalVehiculos,
          vehiculos: vehiculos.map(v => ({ matricula: v.matricula, motorizacion: v.motorizacion, coste_real: v.coste_real }))
        });
        
      } catch (error) {
        console.error('Error cargando datos reales:', error);
        // Usar datos por defecto si hay error
        setKpis({
          totalVehiculos: 4, // Datos mock del ConsumoVehiculos
          eficienciaPromedio: "87%",
          ahorroMensual: "€2,000",
          reduccionCO2: "15%",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="admin-layout">
      <main className="content">
        {/* Header */}
        <div className="header flex-between">
          <h1>Analíticas Avanzadas</h1>
        </div>

        {/* KPIs principales */}
        <div className="stats-grid">
          <div className="stat">
            <Users className="icon text-blue" />
            <div>
              <p className="value">{loading ? "..." : kpis.totalVehiculos}</p>
              <p className="label">Vehículos Monitoreados</p>
            </div>
          </div>
          <div className="stat">
            <Target className="icon text-green" />
            <div>
              <p className="value">{loading ? "..." : kpis.eficienciaPromedio}</p>
              <p className="label">Eficiencia Promedio</p>
            </div>
          </div>
          <div className="stat">
            <Fuel className="icon text-yellow" />
            <div>
              <p className="value">{loading ? "..." : kpis.ahorroMensual}</p>
              <p className="label">Ahorro Mensual</p>
            </div>
          </div>
          <div className="stat">
            <Activity className="icon text-purple" />
            <div>
              <p className="value">{loading ? "..." : kpis.reduccionCO2}</p>
              <p className="label">Reducción CO₂</p>
            </div>
          </div>
        </div>

        {/* Gráficos principales */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon">
                <BarChart3 size={20} />
              </div>
              <h2 className="chart-title">Consumo y Eficiencia</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={consumoData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                    />
                    <Bar 
                      dataKey="consumo" 
                      fill="url(#consumoGradient)" 
                      name="Consumo (L/100km)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="eficiencia" 
                      fill="url(#eficienciaGradient)" 
                      name="Eficiencia (%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="consumoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="eficienciaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon">
                <PieChart size={20} />
              </div>
              <h2 className="chart-title">Distribución de Eficiencia</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={eficienciaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eficienciaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de gastos */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon">
                <TrendingUp size={20} />
              </div>
              <h2 className="chart-title">Análisis de Gastos</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={gastosData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="categoria" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`€${value.toLocaleString()}`, 'Gasto']}
                    />
                    <Bar 
                      dataKey="monto" 
                      fill="url(#gastosGradient)" 
                      name="Gasto (€)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="gastosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon">
                <Zap size={20} />
              </div>
              <h2 className="chart-title">Tendencia de Optimización</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={consumoData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="eficiencia"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      name="Eficiencia (%)"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de insights */}
        <div className="kpis-section">
          <div className="kpi-card financial">
            <div className="kpi-header">
              <TrendingUp className="kpi-icon" />
              <div className="kpi-trend positive">+12%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">Mejora Continua</div>
              <div className="kpi-label">Eficiencia en aumento constante</div>
            </div>
          </div>

          <div className="kpi-card savings">
            <div className="kpi-header">
              <Fuel className="kpi-icon" />
              <div className="kpi-trend positive">-8%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">Reducción Consumo</div>
              <div className="kpi-label">Menor consumo de combustible</div>
            </div>
          </div>

          <div className="kpi-card roi">
            <div className="kpi-header">
              <Activity className="kpi-icon" />
              <div className="kpi-trend positive">+15%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">Sostenibilidad</div>
              <div className="kpi-label">Impacto ambiental positivo</div>
            </div>
          </div>
        </div>

        {/* Sección de Consumo de Vehículos */}
        <div className="analiticas-section">
          <ConsumoVehiculos />
        </div>
      </main>
    </div>
  );
};

export default AdminAnaliticas;
