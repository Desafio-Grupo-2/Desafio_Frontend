import { useState, useEffect } from "react";
import { Search, Plus, Car, Fuel, Zap, Settings, BarChart3, Filter, Edit, Trash2 } from "lucide-react";
import "./adminVehiculos.scss";

// Datos mock iniciales
const mockVehiculos = [
  {
    id: 1,
    modelo: "Tesla Model 3",
    clasificacion_energetica: "A",
    consumo_min: 0,
    consumo_max: 0,
    emisiones_min: 0,
    emisiones_max: 0,
    motorizacion: "Eléctrico",
    kw_min: 150,
    kw_max: 350,
    estado: "activo",
  },
  {
    id: 2,
    modelo: "Ford Transit Custom",
    clasificacion_energetica: "C",
    consumo_min: 7.2,
    consumo_max: 8.5,
    emisiones_min: 185,
    emisiones_max: 210,
    motorizacion: "Diésel",
    kw_min: 77,
    kw_max: 125,
    estado: "activo",
  },
  {
    id: 3,
    modelo: "Mercedes eSprinter",
    clasificacion_energetica: "A",
    consumo_min: 0,
    consumo_max: 0,
    emisiones_min: 0,
    emisiones_max: 0,
    motorizacion: "Eléctrico",
    kw_min: 85,
    kw_max: 150,
    estado: "mantenimiento",
  },
];

const AdminVehiculos = () => {
  const [vehiculos, setVehiculos] = useState(mockVehiculos);
  const [filteredVehiculos, setFilteredVehiculos] = useState(mockVehiculos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterMotorizacion, setFilterMotorizacion] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let filtered = vehiculos;

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEstado !== "todos") {
      filtered = filtered.filter((v) => v.estado === filterEstado);
    }

    if (filterMotorizacion !== "todos") {
      filtered = filtered.filter((v) => v.motorizacion === filterMotorizacion);
    }

    setFilteredVehiculos(filtered);
  }, [vehiculos, searchTerm, filterEstado, filterMotorizacion]);

  const handleAddVehiculo = () => {
    setIsModalOpen(true);
  };

  const handleDeleteVehiculo = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este vehículo?")) {
      setVehiculos(vehiculos.filter((v) => v.id !== id));
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      activo: "badge-success",
      mantenimiento: "badge-warning",
      inactivo: "badge-danger",
    };
    return <span className={`badge ${variants[estado] || "badge-default"}`}>{estado}</span>;
  };

  const getClasificacionColor = (clasificacion) => {
    const colors = {
      "A+": "text-green-600",
      A: "text-green-500",
      B: "text-yellow-500",
      C: "text-orange-500",
      D: "text-red-500",
    };
    return colors[clasificacion] || "text-gray-500";
  };

  const getMotorizacionIcon = (motorizacion) =>
    motorizacion === "Eléctrico" ? (
      <Zap className="icon" />
    ) : (
      <Fuel className="icon" />
    );

  return (
    <div className="admin-vehiculos">
          {/* Header - Estilo moderno */}
          <div className="vehiculos-header">
            <div className="header-content">
              <div className="header-title">
                <Car className="header-icon" />
                <h1>Gestión de Vehículos</h1>
              </div>
              <p className="header-subtitle">Administra la flota de vehículos y su rendimiento</p>
            </div>
            <button className="btn-primary" onClick={handleAddVehiculo}>
              <Plus size={20} />
              Agregar Vehículo
            </button>
          </div>

          {/* Estadísticas - Estilo del dashboard */}
          <div className="vehiculos-stats">
            <div className="stat-hero">
              <div className="hero-icon">
                <Car className="icon" />
              </div>
              <div className="hero-content">
                <h2>Flota Total</h2>
                <div className="hero-value">{vehiculos.length}</div>
                <div className="hero-subtitle">Vehículos registrados</div>
              </div>
              <div className="hero-trend">
                <BarChart3 className="trend-icon" />
                <span>+2</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Zap className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{vehiculos.filter((v) => v.motorizacion === "Eléctrico").length}</div>
                  <div className="stat-label">Eléctricos</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Fuel className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{vehiculos.filter((v) => v.motorizacion !== "Eléctrico").length}</div>
                  <div className="stat-label">Combustible</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Settings className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{vehiculos.filter((v) => v.estado === "mantenimiento").length}</div>
                  <div className="stat-label">En Mantenimiento</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <BarChart3 className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{vehiculos.filter((v) => v.estado === "activo").length}</div>
                  <div className="stat-label">Activos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros - Estilo simplificado */}
          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar vehículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <select
                value={filterMotorizacion}
                onChange={(e) => setFilterMotorizacion(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todas las motorizaciones</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Diésel">Diésel</option>
                <option value="Gasolina">Gasolina</option>
              </select>
            </div>
          </div>

          {/* Lista de vehículos - Estilo moderno */}
          <div className="vehiculos-list">
            <div className="section-header">
              <BarChart3 className="section-icon" />
              <h2>Lista de Vehículos</h2>
              <div className="section-badge">
                <span>{filteredVehiculos.length} vehículos</span>
              </div>
            </div>

            <div className="vehiculos-grid">
              {filteredVehiculos.map((vehiculo) => (
                <div key={vehiculo.id} className="vehiculo-card">
                  <div className="card-header">
                    <div className="vehiculo-modelo">
                      <Car className="icon" />
                      <h3>{vehiculo.modelo}</h3>
                    </div>
                    {getEstadoBadge(vehiculo.estado)}
                  </div>
                  
                  <div className="card-content">
                    <div className="vehiculo-info">
                      <div className="info-item">
                        <div className="info-label">Motorización</div>
                        <div className="info-value">
                          {getMotorizacionIcon(vehiculo.motorizacion)}
                          <span>{vehiculo.motorizacion}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">Clasificación</div>
                        <div className={`info-value ${getClasificacionColor(vehiculo.clasificacion_energetica)}`}>
                          {vehiculo.clasificacion_energetica}
                        </div>
                      </div>
                      
                      {vehiculo.motorizacion !== "Eléctrico" && (
                        <>
                          <div className="info-item">
                            <div className="info-label">Consumo (L/100km)</div>
                            <div className="info-value">
                              {vehiculo.consumo_min}-{vehiculo.consumo_max}
                            </div>
                          </div>
                          
                          <div className="info-item">
                            <div className="info-label">Emisiones (g/km)</div>
                            <div className="info-value">
                              {vehiculo.emisiones_min}-{vehiculo.emisiones_max}
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="info-item">
                        <div className="info-label">Potencia (kW)</div>
                        <div className="info-value">
                          {vehiculo.kw_min}-{vehiculo.kw_max}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="btn-edit">
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteVehiculo(vehiculo.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};

export default AdminVehiculos;