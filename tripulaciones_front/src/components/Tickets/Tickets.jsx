import { useMemo, useState, useEffect } from "react";
import { FileText, Calendar, Filter, BarChart3, DollarSign, Fuel, User, Car, Download } from "lucide-react";
import "./tickets.scss";
import ticketsService from "../../redux/tickets/ticketsService";
import usersService from "../../redux/users/usersService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const mockTickets = [
  { id: "TCK-0001", fecha: "2025-09-20T09:32:00Z", conductor: "Juan Pérez",  vehiculo: "BUS-12", estacion: "Shell Central", litros: 45.2, precioLitro: 1.34, metodoPago: "Tarjeta" },
  { id: "TCK-0002", fecha: "2025-09-10T14:12:00Z", conductor: "María López", vehiculo: "BUS-08", estacion: "Repsol Norte",   litros: 60.0, precioLitro: 1.31, metodoPago: "Efectivo" },
  { id: "TCK-0003", fecha: "2025-08-28T07:55:00Z", conductor: "Carlos Díaz",  vehiculo: "BUS-21", estacion: "PetroSur",       litros: 38.7, precioLitro: 1.29, metodoPago: "Tarjeta" },
  { id: "TCK-0004", fecha: "2025-04-03T17:25:00Z", conductor: "Ana Gómez",    vehiculo: "BUS-05", estacion: "Shell Central",  litros: 52.3, precioLitro: 1.22, metodoPago: "Transferencia" },
];

function isWithin(date, from) {
  const ticketDate = new Date(date);
  const fromDate = new Date(from);
  return ticketDate.getTime() >= fromDate.getTime();
}

function formatCurrency(v) {
  if (isNaN(v) || v === null || v === undefined) {
    return 'N/A';
  }
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

// Función para exportar tickets a PDF
function exportTicketsToPDF(tickets, rango, totalPeriodo) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const x = 40;
  let y = 40;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Tickets de combustible — ${rango[0].toUpperCase() + rango.slice(1)}`, x, y);
  y += 12;

  // Información del período
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total período: ${formatCurrency(totalPeriodo)}  •  Registros: ${tickets.length}`, x, y);
  y += 12;

  // Tabla de tickets
  autoTable(doc, {
    startY: y,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [255, 245, 240], textColor: [15, 23, 42] },
    head: [
      [
        "ID",
        "Fecha",
        "Conductor",
        "Vehículo",
        "Estación",
        "Litros",
        "€/L",
        "Total",
        "Método"
      ]
    ],
    body: tickets.map(ticket => [
      ticket.id,
      formatDate(ticket.fecha),
      ticket.conductor,
      ticket.vehiculo,
      ticket.estacion,
      ticket.litros ? ticket.litros.toFixed(2) : "N/A",
      ticket.precioLitro ? ticket.precioLitro.toFixed(2) : "N/A",
      formatCurrency(ticket.total || 0),
      ticket.metodoPago || "Sin especificar"
    ]),
    margin: { left: x, right: x }
  });

  // Guardar archivo
  doc.save(`tickets_${rango}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export default function Tickets() {
  const [rango, setRango] = useState("mensual");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConductor, setFilterConductor] = useState("todos");
  const [filterEstacion, setFilterEstacion] = useState("todos");
  const [tickets, setTickets] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar conductores del backend
  useEffect(() => {
    const loadConductores = async () => {
      try {
        console.log('Cargando conductores del backend...');
        const response = await usersService.getAllUsers(1, 100, '');
        
        if (response.success && response.data) {
          // Filtrar solo conductores (role: 'conductor')
          const conductoresData = response.data.filter(user => user.role === 'conductor');
          console.log('Conductores cargados:', conductoresData);
          setConductores(conductoresData);
        }
      } catch (error) {
        console.error('Error cargando conductores:', error);
        // Usar conductores mock si falla
        setConductores([
          { id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', role: 'conductor' },
          { id_usuario: 2, nombre: 'María', apellido: 'López', role: 'conductor' },
          { id_usuario: 3, nombre: 'Carlos', apellido: 'Díaz', role: 'conductor' },
          { id_usuario: 4, nombre: 'Ana', apellido: 'Gómez', role: 'conductor' }
        ]);
      }
    };

    loadConductores();
  }, []);

  // Cargar tickets del backend
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Cargando tickets del backend...');
        
        const response = await ticketsService.getAllTickets(1, 200);
        console.log('Tickets cargados del backend:', response);
        
        if (response.success && response.data) {
          // Transformar datos del backend al formato esperado por el componente
          const transformedTickets = response.data.map(ticket => {
            // Calcular litros totales (coche + bus)
            const litrosCoche = ticket.litroscoche ? parseFloat(ticket.litroscoche) : null;
            const litrosBus = ticket.litrosbus ? parseFloat(ticket.litrosbus) : null;
            const litrosTotal = (litrosCoche || 0) + (litrosBus || 0);
            
            // Calcular importe total (coche + bus)
            const importeCoche = parseFloat(ticket.importecoche_euros || 0);
            const importeBus = parseFloat(ticket.importebus_euros || 0);
            const importeTotal = importeCoche + importeBus;
            
            // Calcular precio por litro si hay litros
            const precioLitro = litrosTotal > 0 ? importeTotal / litrosTotal : 0;
            
            // Buscar conductor real por ID de ruta (asumiendo que id_ruta corresponde a un conductor)
            const conductorReal = conductores.find(c => c.id_usuario === ticket.id_ruta);
            const nombreConductor = conductorReal 
              ? `${conductorReal.nombre} ${conductorReal.apellido}`
              : `Conductor Ruta ${ticket.id_ruta}`;
            
            return {
              id: ticket.id?.toString() || 'Sin ID',
              fecha: ticket.fecha || new Date().toISOString(),
              conductor: nombreConductor,
              vehiculo: `Vehículo Ruta ${ticket.id_ruta}`, // Usar ID de ruta como vehículo temporal
              estacion: `Estación ${ticket.coordenadas}`, // Usar coordenadas como estación temporal
              litros: litrosTotal,
              precioLitro: precioLitro,
              metodoPago: ticket.tipocarburante || 'Sin especificar',
              total: importeTotal,
              // Datos adicionales del backend
              id_ruta: ticket.id_ruta,
              id_conductor: conductorReal?.id_usuario || ticket.id_ruta,
              coordenadas: ticket.coordenadas,
              latitud: ticket.latitud,
              longitud: ticket.longitud,
              litrosCoche: litrosCoche,
              litrosBus: litrosBus,
              importeCoche: importeCoche,
              importeBus: importeBus
            };
          });
          console.log('Tickets transformados:', transformedTickets);
          
          // Log para ver las fechas disponibles
          if (transformedTickets.length > 0) {
            const fechas = transformedTickets.map(t => new Date(t.fecha)).sort((a, b) => a - b);
            console.log('📅 Fechas de tickets disponibles:', {
              primera: fechas[0].toISOString(),
              ultima: fechas[fechas.length - 1].toISOString(),
              total: fechas.length
            });
          }
          
          setTickets(transformedTickets);
        } else {
          console.warn('No se encontraron tickets, usando datos mock');
          setTickets(mockTickets);
        }
      } catch (error) {
        console.error('Error cargando tickets:', error);
        setError(error.message);
        console.warn('Usando datos mock debido al error');
        setTickets(mockTickets);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [conductores]); // Depender de conductores para que se ejecute después de cargarlos

  const desde = useMemo(() => {
    if (tickets.length === 0) {
      return new Date(2024, 9, 1); // Octubre 2024 por defecto
    }
    
    // Usar la fecha más reciente de los tickets como referencia
    const fechaMasReciente = new Date(Math.max(...tickets.map(t => new Date(t.fecha).getTime())));
    const ahora = new Date();
    
    // Si los tickets son históricos (más de 6 meses atrás), usar la fecha más reciente
    // Si los tickets son recientes (menos de 6 meses), usar la fecha actual
    const esHistorico = (ahora.getTime() - fechaMasReciente.getTime()) > (6 * 30 * 24 * 60 * 60 * 1000);
    const fechaReferencia = esHistorico ? fechaMasReciente : ahora;
    
    let fechaDesde;
    
    if (rango === "mensual") {
      // Último mes completo (desde el día 1 del mes anterior)
      fechaDesde = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() - 1, 1);
    } else if (rango === "semestral") {
      // Últimos 6 meses completos
      fechaDesde = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() - 6, 1);
    } else if (rango === "anual") {
      // Último año completo
      fechaDesde = new Date(fechaReferencia.getFullYear() - 1, fechaReferencia.getMonth(), 1);
    } else {
      fechaDesde = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() - 1, 1);
    }
    
    console.log(`🔍 Filtro ${rango} (${esHistorico ? 'histórico' : 'actual'}):`, {
      ahora: ahora.toISOString(),
      fechaMasReciente: fechaMasReciente.toISOString(),
      fechaReferencia: fechaReferencia.toISOString(),
      desde: fechaDesde.toISOString(),
      totalTickets: tickets.length,
      esHistorico
    });
    
    return fechaDesde;
  }, [rango, tickets]);

  const ticketsFiltrados = useMemo(() => {
    let filtered = tickets
      .filter(t => isWithin(t.fecha, desde))
      .map(t => ({ 
        ...t, 
        // Calcular total si no está definido
        total: t.total || (t.litros * t.precioLitro) || 0
      }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Debug: console.log(`Filtro ${rango}: ${filtered.length} tickets de ${tickets.length} total`);

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
  }, [tickets, desde, searchTerm, filterConductor, filterEstacion]);

  const totalPeriodo = useMemo(
    () => ticketsFiltrados.reduce((acc, t) => acc + t.total, 0),
    [ticketsFiltrados]
  );

  // conductores ahora viene del estado cargado desde el backend

  const estaciones = useMemo(() => {
    return [...new Set(tickets.map(t => t.estacion))];
  }, [tickets]);

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

  if (loading) {
    return (
      <div className="admin-tickets">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-tickets">
        <div className="error-container">
          <h3>Error al cargar tickets</h3>
          <p>{error}</p>
          <p>Mostrando datos de ejemplo...</p>
        </div>
      </div>
    );
  }

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
                  <option value="mensual">Último mes</option>
                  <option value="semestral">Últimos 6 meses</option>
                  <option value="anual">Último año</option>
                </select>
              </div>
              <button 
                className="btn-download-pdf"
                onClick={() => exportTicketsToPDF(ticketsFiltrados, rango, totalPeriodo)}
                title="Descargar tickets en PDF"
              >
                <Download className="icon" />
                Descargar PDF
              </button>
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
                <div className="hero-subtitle">
                  En el período seleccionado ({rango === "mensual" ? "último mes" : rango === "semestral" ? "últimos 6 meses" : "último año"})
                </div>
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
                  <div className="stat-value">{ticketsFiltrados.reduce((acc, t) => acc + (t.litros || 0), 0).toFixed(1)}L</div>
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
                  <option key={conductor.id_usuario} value={`${conductor.nombre} ${conductor.apellido}`}>
                    {conductor.nombre} {conductor.apellido}
                  </option>
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
            
            <div className="info-notice">
              <p><strong>Nota:</strong> Los datos de litros no están disponibles en los tickets actuales del backend. Se muestran los importes reales de cada ticket.</p>
              <p><strong>Período:</strong> Mostrando tickets desde {formatDate(desde)} hasta hoy ({rango === "mensual" ? "último mes" : rango === "semestral" ? "últimos 6 meses" : "último año"}).</p>
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
                        <div className="info-label">Ruta ID</div>
                        <div className="info-value">
                          <User className="icon" />
                          <span>{ticket.id_ruta}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Coordenadas</div>
                        <div className="info-value">
                          <Car className="icon" />
                          <span>{ticket.coordenadas}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Tipo Combustible</div>
                        <div className="info-value">
                          <Fuel className="icon" />
                          <span>{ticket.metodoPago}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Litros Total</div>
                        <div className="info-value">{ticket.litros > 0 ? `${ticket.litros}L` : 'No disponible'}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Litros Coche</div>
                        <div className="info-value">{ticket.litrosCoche !== null ? `${ticket.litrosCoche}L` : 'No disponible'}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Litros Bus</div>
                        <div className="info-value">{ticket.litrosBus !== null ? `${ticket.litrosBus}L` : 'No disponible'}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Precio/Litro</div>
                        <div className="info-value">{ticket.precioLitro > 0 ? formatCurrency(ticket.precioLitro) : 'N/A'}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Importe Coche</div>
                        <div className="info-value">{ticket.importeCoche > 0 ? formatCurrency(ticket.importeCoche) : 'N/A'}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Importe Bus</div>
                        <div className="info-value">{ticket.importeBus > 0 ? formatCurrency(ticket.importeBus) : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="total-amount">
                      <span className="total-label">Total</span>
                      <span className="total-value">{ticket.total > 0 ? formatCurrency(ticket.total) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
}