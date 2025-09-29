import { useMemo, useState } from "react";
import { FileText, Calendar, Filter, BarChart3, DollarSign, Fuel, User, Car } from "lucide-react";
import "./tickets.scss";

const mockTickets = [
  { id: "TCK-0001", fecha: "2025-09-20T09:32:00Z", conductor: "Juan Pérez",  vehiculo: "BUS-12", estacion: "Shell Central", litros: 45.2, precioLitro: 1.34, metodoPago: "Tarjeta" },
  { id: "TCK-0002", fecha: "2025-09-10T14:12:00Z", conductor: "María López", vehiculo: "BUS-08", estacion: "Repsol Norte",   litros: 60.0, precioLitro: 1.31, metodoPago: "Efectivo" },
  { id: "TCK-0003", fecha: "2025-08-28T07:55:00Z", conductor: "Carlos Díaz",  vehiculo: "BUS-21", estacion: "PetroSur",       litros: 38.7, precioLitro: 1.29, metodoPago: "Tarjeta" },
  { id: "TCK-0004", fecha: "2025-04-03T17:25:00Z", conductor: "Ana Gómez",    vehiculo: "BUS-05", estacion: "Shell Central",  litros: 52.3, precioLitro: 1.22, metodoPago: "Transferencia" },
];

function isWithin(date, from) {
  return new Date(date).getTime() >= from.getTime();
}

function formatCurrency(v) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", { 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Tickets() {
  const [rango, setRango] = useState("semanal");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConductor, setFilterConductor] = useState("todos");
  const [filterEstacion, setFilterEstacion] = useState("todos");

  const desde = useMemo(() => {
    const now = new Date();
    if (rango === "semanal") return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    if (rango === "mensual")  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }, [rango]);

  const ticketsFiltrados = useMemo(() => {
    let filtered = mockTickets
      .filter(t => isWithin(t.fecha, desde))
      .map(t => ({ ...t, total: t.litros * t.precioLitro }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.estacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterConductor !== "todos") {
      filtered = filtered.filter(t => t.conductor === filterConductor);
    }

    if (filterEstacion !== "todos") {
      filtered = filtered.filter(t => t.estacion === filterEstacion);
    }

    return filtered;
  }, [desde, searchTerm, filterConductor, filterEstacion]);

  const totalPeriodo = useMemo(
    () => ticketsFiltrados.reduce((acc, t) => acc + t.total, 0),
    [ticketsFiltrados]
  );

  const conductores = useMemo(() => {
    return [...new Set(mockTickets.map(t => t.conductor))];
  }, []);

  const estaciones = useMemo(() => {
    return [...new Set(mockTickets.map(t => t.estacion))];
  }, []);

  const getMetodoPagoIcon = (metodo) => {
    switch (metodo) {
      case "Tarjeta":
        return "💳";
      case "Efectivo":
        return "💵";
      case "Transferencia":
        return "🏦";
      default:
        return "💰";
    }
  };

  return (
    <div className="admin-tickets">
          {/* Header - Estilo moderno */}
          <div className="tickets-header">
            <div className="header-content">
              <div className="header-title">
                <FileText className="header-icon" />
                <h1>Tickets de Combustible</h1>
              </div>
              <p className="header-subtitle">Gestiona y analiza los gastos de combustible de la flota</p>
            </div>
            <div className="header-actions">
              <div className="period-selector">
                <Calendar className="icon" />
                <select value={rango} onChange={(e) => setRango(e.target.value)}>
                  <option value="semanal">Última semana</option>
                  <option value="mensual">Último mes</option>
                  <option value="anual">Último año</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas - Estilo del dashboard */}
          <div className="tickets-stats">
            <div className="stat-hero">
              <div className="hero-icon">
                <DollarSign className="icon" />
              </div>
              <div className="hero-content">
                <h2>Gasto Total</h2>
                <div className="hero-value">{formatCurrency(totalPeriodo)}</div>
                <div className="hero-subtitle">En el período seleccionado</div>
              </div>
              <div className="hero-trend">
                <BarChart3 className="trend-icon" />
                <span>+12%</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{ticketsFiltrados.length}</div>
                  <div className="stat-label">Tickets</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Fuel className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{ticketsFiltrados.reduce((acc, t) => acc + t.litros, 0).toFixed(1)}L</div>
                  <div className="stat-label">Litros</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <User className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{new Set(ticketsFiltrados.map(t => t.conductor)).size}</div>
                  <div className="stat-label">Conductores</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Car className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{new Set(ticketsFiltrados.map(t => t.vehiculo)).size}</div>
                  <div className="stat-label">Vehículos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros - Estilo simplificado */}
          <div className="filters-section">
            <div className="search-box">
              <FileText size={20} />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterConductor}
                onChange={(e) => setFilterConductor(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los conductores</option>
                {conductores.map(conductor => (
                  <option key={conductor} value={conductor}>{conductor}</option>
                ))}
              </select>
              <select
                value={filterEstacion}
                onChange={(e) => setFilterEstacion(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todas las estaciones</option>
                {estaciones.map(estacion => (
                  <option key={estacion} value={estacion}>{estacion}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de tickets - Estilo moderno */}
          <div className="tickets-list">
            <div className="section-header">
              <BarChart3 className="section-icon" />
              <h2>Lista de Tickets</h2>
              <div className="section-badge">
                <span>{ticketsFiltrados.length} tickets</span>
              </div>
            </div>

            <div className="tickets-grid">
              {ticketsFiltrados.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="card-header">
                    <div className="ticket-id">
                      <FileText className="icon" />
                      <span>{ticket.id}</span>
                    </div>
                    <div className="ticket-date">{formatDateTime(ticket.fecha)}</div>
                  </div>
                  
                  <div className="card-content">
                    <div className="ticket-info">
                      <div className="info-item">
                        <div className="info-label">Conductor</div>
                        <div className="info-value">
                          <User className="icon" />
                          <span>{ticket.conductor}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Vehículo</div>
                        <div className="info-value">
                          <Car className="icon" />
                          <span>{ticket.vehículo}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Estación</div>
                        <div className="info-value">
                          <Fuel className="icon" />
                          <span>{ticket.estacion}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Litros</div>
                        <div className="info-value">{ticket.litros}L</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Precio/Litro</div>
                        <div className="info-value">{formatCurrency(ticket.precioLitro)}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Método de Pago</div>
                        <div className="info-value">
                          <span className="payment-method">
                            {getMetodoPagoIcon(ticket.metodoPago)} {ticket.metodoPago}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="total-amount">
                      <span className="total-label">Total</span>
                      <span className="total-value">{formatCurrency(ticket.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
}