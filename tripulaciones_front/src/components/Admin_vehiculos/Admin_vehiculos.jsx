import { useState, useEffect } from "react";
import { Search, Plus, Car, Fuel, Zap, Settings, BarChart3, Filter, Edit, Trash2, Leaf, TreePine, Battery, Sun, Wind, Recycle, Bus } from "lucide-react";
import "./adminVehiculos.scss";
import vehiculosService from "../../redux/vehiculos/vehiculosService";
import usersService from "../../redux/users/usersService";

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
  const [vehiculos, setVehiculos] = useState([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterMotorizacion, setFilterMotorizacion] = useState("todos");
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    matricula: '',
    id_usuario: '',
    marca: '',
    modelo: '',
    etiqueta: '',
    tipo: '',
    motorizacion: '',
    km: '',
    consumo_min: '',
    consumo_max: '',
    emisiones_min: '',
    emisiones_max: '',
    kw_minimo: '',
    kw_maximo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cargar usuarios para el dropdown
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const response = await usersService.getAllUsers();
        if (response.success && response.data) {
          setUsuarios(response.data);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };
    loadUsuarios();
  }, []);

  // Cargar vehículos del backend
  useEffect(() => {
    const loadVehiculos = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Cargando vehículos del backend...');
        
        const response = await vehiculosService.getAllVehiculos();
        console.log('Respuesta del backend:', response);
        
        if (response.success && response.data) {
          // Log de la estructura de datos para debug
          console.log('Primer vehículo de la BD:', response.data[0]);
          
          // Transformar datos del backend al formato esperado por el componente
          const transformedVehiculos = response.data.map(vehiculo => ({
            ...vehiculo,
            modelo: vehiculo.marca && vehiculo.modelo 
              ? `${vehiculo.marca} ${vehiculo.modelo}` 
              : vehiculo.modelo || vehiculo.marca || 'Sin modelo',
            // Mapear clasificacion_energetica desde el campo correcto de la BD
            clasificacion_energetica: vehiculo.clasificacion_energetica || vehiculo.clasificacion || vehiculo.etiqueta || 'N/A',
            // Mantener campos originales para compatibilidad
            marca: vehiculo.marca || 'Sin marca',
            modelo_original: vehiculo.modelo || 'Sin modelo'
          }));
          console.log('Vehículos transformados:', transformedVehiculos);
          setVehiculos(transformedVehiculos);
        } else {
          console.warn('No se encontraron vehículos, usando datos mock');
          setVehiculos(mockVehiculos);
        }
      } catch (error) {
        console.error('Error cargando vehículos:', error);
        
        // Manejar diferentes tipos de errores
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          setError('Error de conexión. Verifica tu conexión a internet.');
        } else if (error.response?.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.response?.status === 403) {
          setError('No tienes permisos para acceder a esta información.');
        } else if (error.response?.status >= 500) {
          setError('Error del servidor. Inténtalo más tarde.');
        } else {
          setError('Error al cargar vehículos: ' + (error.message || 'Error desconocido'));
        }
        
        console.warn('Usando datos mock debido al error');
        setVehiculos(mockVehiculos);
      } finally {
        setLoading(false);
      }
    };

    loadVehiculos();
  }, []);

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
    setFormData({
      matricula: '',
      id_usuario: '',
      marca: '',
      modelo: '',
      etiqueta: '',
      tipo: '',
      motorizacion: '',
      km: '',
      consumo_min: '',
      consumo_max: '',
      emisiones_min: '',
      emisiones_max: '',
      kw_minimo: '',
      kw_maximo: ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitVehiculo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Preparar datos para el backend
      const vehiculoData = {
        matricula: formData.matricula,
        id_usuario: parseInt(formData.id_usuario),
        marca: formData.marca,
        modelo: formData.modelo,
        etiqueta: formData.etiqueta || null,
        tipo: formData.tipo,
        motorizacion: formData.motorizacion || null,
        km: formData.km ? parseInt(formData.km) : null,
        consumo_min: formData.consumo_min ? parseInt(formData.consumo_min) : null,
        consumo_max: formData.consumo_max ? parseInt(formData.consumo_max) : null,
        emisiones_min: formData.emisiones_min ? parseInt(formData.emisiones_min) : null,
        emisiones_max: formData.emisiones_max ? parseInt(formData.emisiones_max) : null,
        kw_minimo: formData.kw_minimo ? parseInt(formData.kw_minimo) : null,
        kw_maximo: formData.kw_maximo ? parseInt(formData.kw_maximo) : null
      };

      const response = await vehiculosService.createVehiculo(vehiculoData);
      
      if (response.success) {
        // Recargar la lista de vehículos
        const vehiculosResponse = await vehiculosService.getAllVehiculos();
        if (vehiculosResponse.success && vehiculosResponse.data) {
          const transformedVehiculos = vehiculosResponse.data.map(vehiculo => ({
            ...vehiculo,
            modelo: vehiculo.marca && vehiculo.modelo 
              ? `${vehiculo.marca} ${vehiculo.modelo}` 
              : vehiculo.modelo || vehiculo.marca || 'Sin modelo',
            clasificacion_energetica: vehiculo.clasificacion_energetica || vehiculo.clasificacion || vehiculo.etiqueta || 'N/A',
            marca: vehiculo.marca || 'Sin marca',
            modelo_original: vehiculo.modelo || 'Sin modelo'
          }));
          setVehiculos(transformedVehiculos);
        }
        
        setIsModalOpen(false);
        alert('Vehículo creado exitosamente');
      }
    } catch (error) {
      console.error('Error creando vehículo:', error);
      alert('Error al crear vehículo: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehiculo = async (matricula) => {
    if (window.confirm("¿Seguro que quieres borrar este vehículo?")) {
      try {
        const response = await vehiculosService.deleteVehiculo(matricula);
        
        if (response.success) {
          // Recargar la lista de vehículos
          const vehiculosResponse = await vehiculosService.getAllVehiculos();
          if (vehiculosResponse.success && vehiculosResponse.data) {
            const transformedVehiculos = vehiculosResponse.data.map(vehiculo => ({
              ...vehiculo,
              modelo: vehiculo.marca && vehiculo.modelo 
                ? `${vehiculo.marca} ${vehiculo.modelo}` 
                : vehiculo.modelo || vehiculo.marca || 'Sin modelo',
              clasificacion_energetica: vehiculo.clasificacion_energetica || vehiculo.clasificacion || vehiculo.etiqueta || 'N/A',
              marca: vehiculo.marca || 'Sin marca',
              modelo_original: vehiculo.modelo || 'Sin modelo'
            }));
            setVehiculos(transformedVehiculos);
          }
          alert('Vehículo eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error eliminando vehículo:', error);
        alert('Error al eliminar vehículo: ' + (error.response?.data?.message || error.message));
      }
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
      "ECO": "text-green-600",
      "CERO": "text-blue-600",
    };
    return colors[clasificacion] || "text-gray-500";
  };

  const getMotorizacionIcon = (motorizacion) =>
    motorizacion === "Eléctrico" ? (
      <Zap className="icon" />
    ) : (
      <Fuel className="icon" />
    );

  const getClasificacionIcon = (clasificacion) => {
    const iconMap = {
      "A+": <Sun className="icon" />,
      "A": <Leaf className="icon" />,
      "B": <TreePine className="icon" />,
      "C": <Recycle className="icon" />,
      "D": <Fuel className="icon" />,
      "ECO": <Leaf className="icon" />,
      "CERO": <Battery className="icon" />,
    };
    return iconMap[clasificacion] || <Bus className="icon" />;
  };

  if (loading) {
    return (
      <div className="admin-vehiculos">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-vehiculos">
        <div className="error-container">
          <h3>Error al cargar vehículos</h3>
          <p>{error}</p>
          <p>Mostrando datos de ejemplo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-vehiculos">
          {/* Header - Estilo moderno */}
          <div className="vehiculos-header">
            <div className="header-content">
              <div className="header-title">
                <Bus className="header-icon" />
                <h1>Gestión de Vehículos</h1>
              </div>
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
                <Bus className="icon" />
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
                placeholder="Buscar"
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

          {/* Mensaje de error */}
          {error && (
            <div className="error-message">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <div className="error-text">
                  <h3>Error al cargar vehículos</h3>
                  <p>{error}</p>
                  <p className="error-note">Mostrando datos de ejemplo...</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de vehículos - Estilo moderno */}
          <div className="vehiculos-list">
            <div className="section-header">
              <BarChart3 className="section-icon" />
              <h2>Lista de Vehículos</h2>
              <div className="section-badge">
                <span>{filteredVehiculos.length} vehículos</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="vehiculos-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap: isMobile ? '1.5rem' : '2rem',
                maxWidth: isMobile ? '100%' : '1200px',
                width: '100%'
              }}>
              {filteredVehiculos.map((vehiculo) => (
                <div key={vehiculo.matricula} className="vehiculo-card" style={{ 
                  padding: isMobile ? '1.5rem' : '2rem',
                  backgroundColor: 'white',
                  borderRadius: '16px'
                }}>
                  <div className="card-header" style={{ paddingBottom: '1rem' }}>
                    <div className="vehiculo-modelo">
                      <Bus className="icon" />
                      <h3>{vehiculo.modelo}</h3>
                    </div>
                    {getEstadoBadge(vehiculo.estado)}
                  </div>
                  
                  <div className="card-content" style={{ paddingBottom: '1rem' }}>
                    <div className="vehiculo-info" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: isMobile ? '1rem' : '1.5rem'
                    }}>
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
                          {getClasificacionIcon(vehiculo.clasificacion_energetica)}
                          <span>{vehiculo.clasificacion_energetica}</span>
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
                        <div className="info-label">Kilometraje</div>
                        <div className="info-value">
                          {vehiculo.km ? `${vehiculo.km.toLocaleString()} km` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions" style={{ paddingTop: '1rem' }}>
                    <button className="btn-edit">
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteVehiculo(vehiculo.matricula)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Modal Agregar Vehículo */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-title">
                    <Bus className="modal-icon" />
                    <div>
                      <h3>Agregar Nuevo Vehículo</h3>
                      <p>Completa la información del vehículo</p>
                    </div>
                  </div>
                  <button 
                    className="modal-close"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body">
                  <form className="modal-form" onSubmit={handleSubmitVehiculo}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Matrícula *</label>
                        <input 
                          type="text" 
                          name="matricula"
                          value={formData.matricula}
                          onChange={handleInputChange}
                          placeholder="Ej: 1234-ABC" 
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Usuario *</label>
                        <select 
                          name="id_usuario"
                          value={formData.id_usuario}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccionar usuario</option>
                          {usuarios.map(usuario => (
                            <option key={usuario.id_usuario} value={usuario.id_usuario}>
                              {usuario.nombre} {usuario.apellido} ({usuario.username})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Marca *</label>
                        <input 
                          type="text" 
                          name="marca"
                          value={formData.marca}
                          onChange={handleInputChange}
                          placeholder="Ej: Mercedes" 
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Modelo *</label>
                        <input 
                          type="text" 
                          name="modelo"
                          value={formData.modelo}
                          onChange={handleInputChange}
                          placeholder="Ej: Sprinter" 
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo *</label>
                        <input 
                          type="text" 
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleInputChange}
                          placeholder="Ej: Furgoneta" 
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Motorización</label>
                        <select 
                          name="motorizacion"
                          value={formData.motorizacion}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar motorización</option>
                          <option value="Diésel">Diésel</option>
                          <option value="Gasolina">Gasolina</option>
                          <option value="Eléctrico">Eléctrico</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Etiqueta (Clasificación)</label>
                        <select 
                          name="etiqueta"
                          value={formData.etiqueta}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar clasificación</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="ECO">ECO</option>
                          <option value="CERO">CERO</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kilometraje</label>
                        <input 
                          type="text" 
                          name="km"
                          value={formData.km}
                          onChange={handleInputChange}
                          placeholder="Ej: 50000" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>Consumo Mínimo (L/100km)</label>
                        <input 
                          type="text" 
                          name="consumo_min"
                          value={formData.consumo_min}
                          onChange={handleInputChange}
                          placeholder="Ej: 7.2" 
                          pattern="[0-9.]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>Consumo Máximo (L/100km)</label>
                        <input 
                          type="text" 
                          name="consumo_max"
                          value={formData.consumo_max}
                          onChange={handleInputChange}
                          placeholder="Ej: 8.5" 
                          pattern="[0-9.]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>Emisiones Mínimas (g/km)</label>
                        <input 
                          type="text" 
                          name="emisiones_min"
                          value={formData.emisiones_min}
                          onChange={handleInputChange}
                          placeholder="Ej: 185" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>Emisiones Máximas (g/km)</label>
                        <input 
                          type="text" 
                          name="emisiones_max"
                          value={formData.emisiones_max}
                          onChange={handleInputChange}
                          placeholder="Ej: 210" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>kW Mínimo</label>
                        <input 
                          type="text" 
                          name="kw_minimo"
                          value={formData.kw_minimo}
                          onChange={handleInputChange}
                          placeholder="Ej: 77" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="form-group">
                        <label>kW Máximo</label>
                        <input 
                          type="text" 
                          name="kw_maximo"
                          value={formData.kw_maximo}
                          onChange={handleInputChange}
                          placeholder="Ej: 125" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    onClick={handleSubmitVehiculo}
                    disabled={isSubmitting}
                  >
                    <Plus size={16} />
                    {isSubmitting ? 'Creando...' : 'Agregar Vehículo'}
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default AdminVehiculos;