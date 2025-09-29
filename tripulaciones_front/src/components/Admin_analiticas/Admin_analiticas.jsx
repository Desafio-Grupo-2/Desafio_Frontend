import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Route,
  Fuel,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

import '../../styles/layout/adminAnalytics.scss';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDriver, setSelectedDriver] = useState('all');

  // Datos de ejemplo para las analíticas
  const routeEfficiency = [
    { name: 'Ene', efficiency: 85, fuel: 120, time: 4.2 },
    { name: 'Feb', efficiency: 88, fuel: 115, time: 4.0 },
    { name: 'Mar', efficiency: 92, fuel: 110, time: 3.8 },
    { name: 'Abr', efficiency: 89, fuel: 118, time: 4.1 },
    { name: 'May', efficiency: 94, fuel: 105, time: 3.6 },
    { name: 'Jun', efficiency: 91, fuel: 112, time: 3.9 }
  ];

  const driverPerformance = [
    { name: 'Carlos M.', routes: 45, efficiency: 92, fuel: 98 },
    { name: 'Ana L.', routes: 38, efficiency: 88, fuel: 102 },
    { name: 'Miguel R.', routes: 42, efficiency: 90, fuel: 95 },
    { name: 'Sofia P.', routes: 35, efficiency: 85, fuel: 108 },
    { name: 'Luis G.', routes: 40, efficiency: 87, fuel: 105 }
  ];

  const fuelConsumption = [
    { name: 'Gasolina', value: 65, color: '#3b82f6' },
    { name: 'Diésel', value: 30, color: '#10b981' },
    { name: 'Híbrido', value: 5, color: '#f59e0b' }
  ];

  const monthlyExpenses = [
    { month: 'Ene', fuel: 4500, maintenance: 800, other: 300 },
    { month: 'Feb', fuel: 4200, maintenance: 1200, other: 250 },
    { month: 'Mar', fuel: 4800, maintenance: 600, other: 400 },
    { month: 'Abr', fuel: 4100, maintenance: 900, other: 350 },
    { month: 'May', fuel: 4600, maintenance: 700, other: 280 },
    { month: 'Jun', fuel: 4400, maintenance: 1100, other: 320 }
  ];

  const kpis = {
    totalRoutes: 342,
    avgEfficiency: 89.5,
    fuelSavings: 12500,
    costReduction: 18.2
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Simular exportación de datos
    console.log('Exportando analíticas...');
  };

  return (
    <div className="admin-layout">
      {/* Contenido principal */}
      <main className="content">
        {/* Header */}
        <div className="header flex-between">
          <div>
            <h1>Analíticas y Reportes</h1>
            <p className="subtitle">Análisis detallado del rendimiento de la flota</p>
          </div>
          <div className="header-actions">
            <button className="button outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button className="button solid" onClick={handleExport}>
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Período:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Conductor:</label>
            <select 
              value={selectedDriver} 
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los conductores</option>
              <option value="carlos">Carlos M.</option>
              <option value="ana">Ana L.</option>
              <option value="miguel">Miguel R.</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="stats-grid">
          <div className="card stat">
            <Route className="icon text-blue" />
            <div>
              <p className="value">{kpis.totalRoutes}</p>
              <p className="label">Rutas Totales</p>
            </div>
          </div>
          <div className="card stat">
            <TrendingUp className="icon text-green" />
            <div>
              <p className="value">{kpis.avgEfficiency}%</p>
              <p className="label">Eficiencia Promedio</p>
            </div>
          </div>
          <div className="card stat">
            <Fuel className="icon text-yellow" />
            <div>
              <p className="value">€{kpis.fuelSavings.toLocaleString()}</p>
              <p className="label">Ahorro en Combustible</p>
            </div>
          </div>
          <div className="card stat">
            <DollarSign className="icon text-purple" />
            <div>
              <p className="value">{kpis.costReduction}%</p>
              <p className="label">Reducción de Costos</p>
            </div>
          </div>
        </div>

        {/* Gráficos principales */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <BarChart3 size={18} /> Eficiencia de Rutas
              </h2>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={routeEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Eficiencia (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Fuel size={18} /> Consumo de Combustible
              </h2>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fuelConsumption}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fuelConsumption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de gastos mensuales */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <DollarSign size={18} /> Gastos Mensuales por Categoría
            </h2>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fuel" stackId="a" fill="#3b82f6" name="Combustible" />
                <Bar dataKey="maintenance" stackId="a" fill="#10b981" name="Mantenimiento" />
                <Bar dataKey="other" stackId="a" fill="#f59e0b" name="Otros" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de rendimiento de conductores */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={18} /> Rendimiento por Conductor
            </h2>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Conductor</th>
                    <th>Rutas</th>
                    <th>Eficiencia</th>
                    <th>Consumo Combustible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {driverPerformance.map((driver, index) => (
                    <tr key={index}>
                      <td className="driver-name">{driver.name}</td>
                      <td>{driver.routes}</td>
                      <td>
                        <div className="efficiency-bar">
                          <div 
                            className="efficiency-fill" 
                            style={{ width: `${driver.efficiency}%` }}
                          ></div>
                          <span>{driver.efficiency}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="fuel-consumption">
                          <span className={driver.fuel <= 100 ? 'good' : 'warning'}>
                            {driver.fuel}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="button-small outline">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
