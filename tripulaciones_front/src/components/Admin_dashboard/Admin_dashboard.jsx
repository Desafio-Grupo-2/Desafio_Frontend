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

        {/* Stats operativas */}
        <div className="stats-grid">
          <div className="card stat">
            <Users className="icon text-blue" />
            <div>
              <p className="value">{overviewStats.totalDrivers}</p>
              <p className="label">Conductores</p>
            </div>
          </div>
          <div className="card stat">
            <Route className="icon text-green" />
            <div>
              <p className="value">{overviewStats.activeRoutes}</p>
              <p className="label">Rutas Activas</p>
            </div>
          </div>
          <div className="card stat">
            <DollarSign className="icon text-yellow" />
            <div>
              <p className="value">{overviewStats.monthlyExpenses}</p>
              <p className="label">Gastos Mes</p>
            </div>
          </div>
          <div className="card stat">
            <TrendingUp className="icon text-purple" />
            <div>
              <p className="value">{overviewStats.completedRoutes}</p>
              <p className="label">Rutas Completas</p>
            </div>
          </div>
          <div className="card stat">
            <Clock className="icon text-indigo" />
            <div>
              <p className="value">{overviewStats.avgRouteTime}</p>
              <p className="label">Tiempo Promedio</p>
            </div>
          </div>
          <div className="card stat">
            <MapPin className="icon text-pink" />
            <div>
              <p className="value">{overviewStats.totalDistance}</p>
              <p className="label">Km Totales</p>
            </div>
          </div>
        </div>

        {/* Gráficos financieros */}
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">
              <BarChart3 size={18} /> Proyección CAEs y Ahorro
            </h2>
            <div style={{ width: "100%", height: 300, paddingBottom: "1.5rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={proyecciones}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="cae" fill="#4f46e5" name="CAEs Generados (€)" />
                  <Bar dataKey="ahorro" fill="#22c55e" name="Ahorro (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              <PieChart size={18} /> Tendencia de Eficiencia
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eficienciaFlota}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="eficiencia"
                  stroke="#3b82f6"
                  name="Eficiencia (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPIs financieros */}
        <div className="stats-grid">
          <div className="card stat">
            <DollarSign className="icon text-green" />
            <div>
              <p className="value">{kpis.totalCAE}</p>
              <p className="label">Valor Económico CAEs</p>
            </div>
          </div>
          <div className="card stat">
            <Fuel className="icon text-blue" />
            <div>
              <p className="value">{kpis.ahorroCombustible}</p>
              <p className="label">Ahorro en Combustible</p>
            </div>
          </div>
          <div className="card stat">
            <TrendingUp className="icon text-purple" />
            <div>
              <p className="value">{kpis.roi}</p>
              <p className="label">Retorno de Inversión</p>
            </div>
          </div>
        </div>

        {/* Alertas + Acciones rápidas */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <AlertTriangle size={18} /> Alertas Recientes
              </h2>
            </div>
            <div className="card-content">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="dot" />
                  <div>
                    <p className="text">{alert.message}</p>
                    <p className="time">Hace {alert.time}</p>
                  </div>
                </div>
              ))}
              <button className="button outline w-full">
                Ver Todas las Alertas
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Acciones Rápidas</h2>
            </div>
            <div className="card-content">
              <button className="button solid w-full">
                <Users size={16} /> Gestionar Empleados
              </button>
              <button 
                className="button outline w-full"
                onClick={() => navigate('/admin-hotspots')}
              >
                <Map size={16} /> Ver Hotspots Gasolineras
              </button>
              <button className="button outline w-full">
                <MessageCircle size={16} /> Enviar Mensaje Masivo
              </button>
              <button className="button outline w-full">
                <BarChart3 size={16} /> Generar Análisis
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;