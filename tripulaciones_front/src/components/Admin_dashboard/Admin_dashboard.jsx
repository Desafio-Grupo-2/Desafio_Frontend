import {
  Users,
  Route,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Fuel,
  PieChart,
  Map,
  Settings,
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
} from "recharts";
import { useNavigate } from "react-router-dom";
import "../../styles/layout/adminDashboard.scss";
import "../../styles/layout/adminSidebar.scss";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Datos financieros
  const kpis = {
    totalCAE: "€450,000",
    ahorroCombustible: "€120,000",
    roi: "145%",
  };

  const proyecciones = [
    { mes: "Ene", cae: 35000, ahorro: 9000 },
    { mes: "Feb", cae: 42000, ahorro: 10500 },
    { mes: "Mar", cae: 50000, ahorro: 12000 },
    { mes: "Abr", cae: 47000, ahorro: 11000 },
  ];

  const eficienciaFlota = [
    { mes: "Ene", eficiencia: 68 },
    { mes: "Feb", eficiencia: 72 },
    { mes: "Mar", eficiencia: 75 },
    { mes: "Abr", eficiencia: 78 },
  ];

  // Datos operativos
  const overviewStats = {
    totalDrivers: 25,
    activeRoutes: 8,
    monthlyExpenses: "€12,450",
    completedRoutes: 342,
    avgRouteTime: "4h 25min",
    totalDistance: "45,230 km",
  };

  const recentAlerts = [
    { id: 1, message: "Gasto elevado reportado por Carlos M.", time: "5min" },
    { id: 2, message: "Ruta demorada: Barcelona → Sevilla", time: "15min" },
    { id: 3, message: "3 mensajes sin leer de conductores", time: "1h" },
  ];

  return (
    <div className="admin-layout">
      {/* Contenido principal */}
      <main className="content">
        {/* HEADER */}
        <div className="header flex-between">
          <h1>Dashboard Administrativo</h1>
        </div>

        {/* Stats operativas - Diseño simple y profesional */}
        <div className="stats-grid">
          <div className="stat">
            <Users className="icon text-blue" />
            <div>
              <p className="value">{overviewStats.totalDrivers}</p>
              <p className="label">Conductores</p>
            </div>
          </div>
          <div className="stat">
            <Route className="icon text-green" />
            <div>
              <p className="value">{overviewStats.activeRoutes}</p>
              <p className="label">Rutas Activas</p>
            </div>
          </div>
          <div className="stat">
            <DollarSign className="icon text-yellow" />
            <div>
              <p className="value">{overviewStats.monthlyExpenses}</p>
              <p className="label">Gastos del Mes</p>
            </div>
          </div>
          <div className="stat">
            <TrendingUp className="icon text-purple" />
            <div>
              <p className="value">{overviewStats.completedRoutes}</p>
              <p className="label">Rutas Completadas</p>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="stat">
            <Clock className="icon text-blue" />
            <div>
              <p className="value">{overviewStats.avgRouteTime}</p>
              <p className="label">Tiempo Promedio</p>
            </div>
          </div>
          <div className="stat">
            <MapPin className="icon text-green" />
            <div>
              <p className="value">{overviewStats.totalDistance}</p>
              <p className="label">Kilómetros Totales</p>
            </div>
          </div>
        </div>

        {/* Gráficos financieros */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon">
                <BarChart3 size={20} />
              </div>
              <h2 className="chart-title">Proyección CAEs y Ahorro</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={proyecciones}
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
                      dataKey="cae" 
                      fill="url(#caeGradient)" 
                      name="CAEs Generados (€)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="ahorro" 
                      fill="url(#ahorroGradient)" 
                      name="Ahorro (€)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="caeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="ahorroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
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
              <h2 className="chart-title">Tendencia de Eficiencia</h2>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={eficienciaFlota} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs financieros */}
        <div className="kpis-section">
          <div className="kpi-card financial">
            <div className="kpi-header">
              <DollarSign className="kpi-icon" />
              <div className="kpi-trend positive">+8%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{kpis.totalCAE}</div>
              <div className="kpi-label">Valor Económico CAEs</div>
            </div>
          </div>

          <div className="kpi-card savings">
            <div className="kpi-header">
              <Fuel className="kpi-icon" />
              <div className="kpi-trend positive">+15%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{kpis.ahorroCombustible}</div>
              <div className="kpi-label">Ahorro en Combustible</div>
            </div>
          </div>

          <div className="kpi-card roi">
            <div className="kpi-header">
              <TrendingUp className="kpi-icon" />
              <div className="kpi-trend positive">+12%</div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{kpis.roi}</div>
              <div className="kpi-label">Retorno de Inversión</div>
            </div>
          </div>
        </div>

        {/* Alertas + Acciones rápidas */}
        <div className="actions-section">
          <div className="alerts-card">
            <div className="card-header">
              <div className="header-icon">
                <AlertTriangle size={20} />
              </div>
              <h2 className="card-title">Alertas Recientes</h2>
            </div>
            <div className="alerts-content">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-dot" />
                  <div className="alert-content">
                    <p className="alert-text">{alert.message}</p>
                    <p className="alert-time">Hace {alert.time}</p>
                  </div>
                </div>
              ))}
              <button className="action-button secondary">
                Ver Todas las Alertas
              </button>
            </div>
          </div>

          <div className="quick-actions-card">
            <div className="card-header">
              <div className="header-icon">
                <Settings size={20} />
              </div>
              <h2 className="card-title">Acciones Rápidas</h2>
            </div>
            <div className="actions-content">
              <button className="action-button primary">
                <Users size={18} />
                <span>Gestionar Empleados</span>
              </button>
              <button 
                className="action-button secondary"
                onClick={() => navigate('/admin-hotspots')}
              >
                <Map size={18} />
                <span>Ver Hotspots Gasolineras</span>
              </button>
              <button className="action-button secondary">
                <MessageCircle size={18} />
                <span>Enviar Mensaje Masivo</span>
              </button>
              <button className="action-button secondary">
                <BarChart3 size={18} />
                <span>Generar Análisis</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;