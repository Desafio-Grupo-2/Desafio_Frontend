import React, { useMemo, useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  MapPin, 
  Clock, 
  Route,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import "../../styles/layout/adminDashboard.scss";
import "./Employees.scss";
import usersService from "../../redux/users/usersService";
import vehiculosService from "../../redux/vehiculos/vehiculosService";
import rutasService from "../../redux/rutas/rutasService";

const SEED = [
  {
    id: "EMP-001",
    nombre: "Ana García",
    cargo: "Operaciones",
    email: "ana@empresa.com",
    telefono: "+34 600 111 222",
    activo: true,
    sede: "Bilbao",
    rutas: [
      { id: "R-1101", origen: "Bilbao", destino: "Vitoria", salida: "2025-09-20 08:30", eta: "2025-09-20 09:35", estado: "Completada" },
      { id: "R-1107", origen: "Bilbao", destino: "Pamplona", salida: "2025-09-22 12:15", eta: "2025-09-22 14:05", estado: "En curso" },
      { id: "R-1110", origen: "Bilbao", destino: "Santander", salida: "2025-09-23 07:45", eta: "2025-09-23 09:10", estado: "Pendiente" },
    ],
  },
  {
    id: "EMP-002",
    nombre: "Luis Pérez",
    cargo: "Logística",
    email: "luis@empresa.com",
    telefono: "+34 600 333 444",
    activo: true,
    sede: "Madrid",
    rutas: [
      { id: "R-2102", origen: "Madrid", destino: "Toledo", salida: "2025-09-21 10:10", eta: "2025-09-21 11:00", estado: "Completada" },
      { id: "R-2109", origen: "Madrid", destino: "Guadalajara", salida: "2025-09-22 15:00", eta: "2025-09-22 15:50", estado: "En curso" },
    ],
  },
  {
    id: "EMP-003",
    nombre: "Marta Ruiz",
    cargo: "Flota",
    email: "mruiz@empresa.com",
    telefono: "+34 600 555 666",
    activo: false,
    sede: "Valencia",
    rutas: [
      { id: "R-3103", origen: "Valencia", destino: "Castellón", salida: "2025-09-18 09:00", eta: "2025-09-18 10:00", estado: "Completada" },
    ],
  },
];

export default function Employees() {
  const [openList, setOpenList] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [filterRole, setFilterRole] = useState("todos");
  const [employeeRoutes, setEmployeeRoutes] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null); // empleado a editar

  // Debug: Monitorear cambios en employeeRoutes

  // Función para cargar las rutas de un empleado específico
  const loadEmployeeRoutes = async (employeeId) => {
    try {
      console.log(`🔍 Cargando rutas para empleado ID: ${employeeId}`);
      
      // Verificar token
      const token = localStorage.getItem('token');
      console.log(`🔑 Token presente:`, token ? 'Sí' : 'No');
      if (token) {
        console.log(`🔑 Token (primeros 50 chars):`, token.substring(0, 50) + '...');
      }
      
      // Agregar delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener vehículos del empleado
      const vehiculosResponse = await vehiculosService.getVehiculosByUsuario(employeeId);
      console.log(`🚗 Vehículos del empleado ${employeeId}:`, vehiculosResponse);
      console.log(`🚗 Success:`, vehiculosResponse.success);
      console.log(`🚗 Data:`, vehiculosResponse.data);
      console.log(`🚗 Data length:`, vehiculosResponse.data?.length);
      
      if (vehiculosResponse.success && vehiculosResponse.data.length > 0) {
        const allRoutes = [];
        
        // Para cada vehículo, obtener sus rutas
        for (const vehiculo of vehiculosResponse.data) {
          try {
            console.log(`🔍 Obteniendo rutas para vehículo: ${vehiculo.matricula}`);
            // Agregar delay entre peticiones para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
            const rutasResponse = await rutasService.getRutasByVehiculo(vehiculo.matricula);
            console.log(`🛣️ Rutas del vehículo ${vehiculo.matricula}:`, rutasResponse);
            
            if (rutasResponse.success && rutasResponse.data) {
              allRoutes.push(...rutasResponse.data);
            }
          } catch (error) {
            console.warn(`❌ Error cargando rutas para vehículo ${vehiculo.matricula}:`, error);
          }
        }
        
        console.log(`✅ Total de rutas encontradas para empleado ${employeeId}:`, allRoutes.length);
        console.log(`📋 Rutas encontradas:`, allRoutes);
        
        // Actualizar el estado con las rutas del empleado
        setEmployeeRoutes(prev => {
          const newState = {
            ...prev,
            [employeeId]: allRoutes
          };
          console.log(`🔄 Estado actualizado para empleado ${employeeId}:`, newState);
          return newState;
        });
      } else {
        console.log(`⚠️ Empleado ${employeeId} no tiene vehículos asignados`);
        // Si no tiene vehículos, no tiene rutas
        setEmployeeRoutes(prev => ({
          ...prev,
          [employeeId]: []
        }));
      }
    } catch (error) {
      console.error(`❌ Error cargando rutas para empleado ${employeeId}:`, error);
      setEmployeeRoutes(prev => ({
        ...prev,
        [employeeId]: []
      }));
    }
  };
  const [confirm, setConfirm] = useState(null); // id a dar de baja
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id a eliminar permanentemente

  // Cargar usuarios del backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Cargando usuarios del backend...');
        
        const response = await usersService.getAllUsers();
        console.log('Usuarios cargados:', response);
        
        if (response.success && response.data) {
          // Transformar datos del backend al formato esperado por el componente
          const transformedUsers = response.data.map(user => ({
            id: user.id?.toString() || user.id_usuario?.toString(),
            nombre: user.nombre || user.nombre_usuario || 'Sin nombre',
            cargo: user.role || user.rol || user.cargo || 'Sin cargo',
            email: user.email || user.correo || 'Sin email',
            telefono: user.telefono || user.telefono_usuario || 'Sin teléfono',
            activo: user.activo !== false, // Por defecto activo si no se especifica
            sede: 'Bilbao', // Todos tienen sede Bilbao
            rutas: [] // Los rutas se cargarían por separado si es necesario
          }));
          
          console.log(`👥 Empleados disponibles:`, transformedUsers.map(u => ({ id: u.id, nombre: u.nombre, cargo: u.cargo })));
          
          setRows(transformedUsers);
          if (transformedUsers.length > 0) {
            // Buscar un conductor para probar
            const conductor = transformedUsers.find(u => u.cargo.toLowerCase().includes('conductor'));
            const empleadoSeleccionado = conductor || transformedUsers[0];
            
            console.log(`🎯 Empleado seleccionado:`, { id: empleadoSeleccionado.id, nombre: empleadoSeleccionado.nombre, cargo: empleadoSeleccionado.cargo });
            
            setSelected(empleadoSeleccionado);
            // Cargar rutas para el empleado seleccionado
            loadEmployeeRoutes(empleadoSeleccionado.id);
          }
        } else {
          console.warn('No se encontraron usuarios, usando datos mock');
          setRows(SEED);
          setSelected(SEED[0]);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        
        // Manejar errores específicos
        if (error.response?.status === 429) {
          setError('Demasiadas peticiones. Espera un momento y recarga la página.');
        } else if (error.code === 'ERR_NETWORK') {
          setError('Error de conexión. Verifica tu conexión a internet.');
        } else {
          setError(error.message);
        }
        
        console.warn('Usando datos mock debido al error');
        setRows(SEED);
        setSelected(SEED[0]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      const passQ =
        !term ||
        [r.nombre, r.cargo, r.email, r.id, r.sede].some(v =>
          String(v).toLowerCase().includes(term)
        );
      const passAct = !onlyActive || r.activo;
      const passRole = filterRole === "todos" || r.cargo.toLowerCase() === filterRole.toLowerCase();
      return passQ && passAct && passRole;
    });
  }, [rows, q, onlyActive, filterRole]);

  async function addEmployee(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    try {
      // Preparar datos para el backend
      const userData = {
        nombre: fd.get("nombre"),
        email: fd.get("email"),
        telefono: fd.get("telefono"),
        role: fd.get("cargo"), // El cargo se mapea a role
        activo: true,
        password: "TempPassword123!", // Contraseña temporal
      };

      // Enviar al backend
      const response = await usersService.createUser(userData);
      
      if (response.success) {
        // Crear objeto para el estado local
        const nuevo = {
          id: response.data.id?.toString() || `EMP-${String(rows.length + 1).padStart(3, "0")}`,
          nombre: userData.nombre,
          cargo: userData.role,
          email: userData.email,
          telefono: userData.telefono,
          sede: 'Bilbao', // Todos en Bilbao
          activo: userData.activo,
          rutas: [],
        };
        
        // Actualizar estado local
        setRows(prev => [nuevo, ...prev]);
        setAdding(false);
        setSelected(nuevo);
        
        console.log('Empleado creado exitosamente:', response.data);
      } else {
        console.error('Error creando empleado:', response.message);
        // Fallback: agregar solo localmente
        const nuevo = {
          id: `EMP-${String(rows.length + 1).padStart(3, "0")}`,
          nombre: userData.nombre,
          cargo: userData.role,
          email: userData.email,
          telefono: userData.telefono,
          sede: 'Bilbao',
          activo: userData.activo,
          rutas: [],
        };
        setRows(prev => [nuevo, ...prev]);
        setAdding(false);
        setSelected(nuevo);
      }
    } catch (error) {
      console.error('Error enviando empleado al backend:', error);
      // Fallback: agregar solo localmente
      const nuevo = {
        id: `EMP-${String(rows.length + 1).padStart(3, "0")}`,
        nombre: fd.get("nombre"),
        cargo: fd.get("cargo"),
        email: fd.get("email"),
        telefono: fd.get("telefono"),
        sede: 'Bilbao',
        activo: true,
        rutas: [],
      };
      setRows(prev => [nuevo, ...prev]);
      setAdding(false);
      setSelected(nuevo);
    }
  }

  async function editEmployee(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    try {
      // Preparar datos para el backend
      const userData = {
        nombre: fd.get("nombre"),
        email: fd.get("email"),
        telefono: fd.get("telefono"),
        role: fd.get("cargo"), // El cargo se mapea a role
        activo: editing.activo,
      };

      // Enviar al backend
      const response = await usersService.updateUser(editing.id, userData);
      
      if (response.success) {
        // Actualizar estado local
        const updatedEmployee = {
          ...editing,
          nombre: userData.nombre,
          cargo: userData.role,
          email: userData.email,
          telefono: userData.telefono,
        };
        
        setRows(prev => prev.map(r => r.id === editing.id ? updatedEmployee : r));
        setSelected(updatedEmployee);
        setEditing(null);
        
        console.log('Empleado actualizado exitosamente:', response.data);
      } else {
        console.error('Error actualizando empleado:', response.message);
        // Fallback: actualizar solo localmente
        const updatedEmployee = {
          ...editing,
          nombre: userData.nombre,
          cargo: userData.role,
          email: userData.email,
          telefono: userData.telefono,
        };
        setRows(prev => prev.map(r => r.id === editing.id ? updatedEmployee : r));
        setSelected(updatedEmployee);
        setEditing(null);
      }
    } catch (error) {
      console.error('Error enviando actualización al backend:', error);
      // Fallback: actualizar solo localmente
      const updatedEmployee = {
        ...editing,
        nombre: fd.get("nombre"),
        cargo: fd.get("cargo"),
        email: fd.get("email"),
        telefono: fd.get("telefono"),
      };
      setRows(prev => prev.map(r => r.id === editing.id ? updatedEmployee : r));
      setSelected(updatedEmployee);
      setEditing(null);
    }
  }

  async function deleteEmployee(id) {
    try {
      // Eliminar del backend
      const response = await usersService.deleteUser(id);
      
      if (response.success) {
        // Eliminar del estado local
        setRows(prev => prev.filter(r => r.id !== id));
        if (selected?.id === id) {
          setSelected(null);
        }
        setDeleteConfirm(null);
        console.log('Empleado eliminado exitosamente:', response.data);
      } else {
        console.error('Error eliminando empleado:', response.message);
        // Fallback: eliminar solo localmente
        setRows(prev => prev.filter(r => r.id !== id));
        if (selected?.id === id) {
          setSelected(null);
        }
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error enviando eliminación al backend:', error);
      // Fallback: eliminar solo localmente
      setRows(prev => prev.filter(r => r.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
      setDeleteConfirm(null);
    }
  }

  function toggleActive(id) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, activo: !r.activo } : r)));
    if (selected?.id === id) setSelected(s => (s ? { ...s, activo: !s.activo } : s));
    setConfirm(null);
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="content">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
              <h3>Cargando empleados...</h3>
              <p>Obteniendo datos del servidor</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <main className="content">
          <div className="error-container">
            <div className="error-content">
              <div className="error-icon">
                <AlertCircle size={48} />
              </div>
              <h3>Error al cargar empleados</h3>
              <p>{error}</p>
              <p>Mostrando datos de ejemplo...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="content">
        {/* Header */}
        <div className="header flex-between">
          <div>
            <h1>Gestión de Empleados</h1>
            <p className="subtitle">Administra el personal y sus asignaciones</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-login-style header-action" 
              onClick={() => setOpenList(o => !o)}
            >
              {openList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {openList ? "Ocultar lista" : "Ver lista"}
            </button>
            <button 
              className="btn-login-style header-action" 
              onClick={() => setAdding(true)}
            >
              <Plus size={18} />
              Añadir empleado
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat">
            <Users className="icon text-blue" />
            <div>
              <p className="value">{rows.length}</p>
              <p className="label">Total Empleados</p>
            </div>
          </div>
          <div className="stat">
            <UserCheck className="icon text-green" />
            <div>
              <p className="value">{rows.filter(r => r.activo).length}</p>
              <p className="label">Activos</p>
            </div>
          </div>
          <div className="stat">
            <Route className="icon text-purple" />
            <div>
              <p className="value">6</p>
              <p className="label">Rutas Asignadas</p>
            </div>
          </div>
          <div className="stat">
            <Building className="icon text-orange" />
            <div>
              <p className="value">{new Set(rows.map(r => r.sede)).size}</p>
              <p className="label">Sedes</p>
            </div>
          </div>
        </div>

        <div className={`employees-grid ${openList ? "is-open" : "is-closed"}`}>
          {/* LISTA */}
          <div className="employees-list">
              <div className="list-header">
                <div className="search-section">
                  <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                <input
                      className="search-input"
                      placeholder="Buscar empleados..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                  </div>
                  <div className="filter-section">
                    <label className="filter-checkbox">
                      <input 
                        type="checkbox" 
                        checked={onlyActive} 
                        onChange={(e) => setOnlyActive(e.target.checked)} 
                      />
                      <span className="checkmark"></span>
                      <span className="filter-label">Solo activos</span>
                    </label>
                    <select 
                      className="filter-select"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="todos">Todos los roles</option>
                      <option value="administrador">Administrador</option>
                      <option value="conductor">Conductor</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="employees-table">
                <div className="table-header">
                  <div className="col-employee">Empleado</div>
                  <div className="col-role">Cargo</div>
                  <div className="col-location">Sede</div>
                  <div className="col-status">Estado</div>
                  <div className="col-actions">Acciones</div>
                </div>
                <div className="table-body">
                  {filtered.length === 0 && (
                    <div className="empty-state">
                      <Users size={48} className="empty-icon" />
                      <h3>No se encontraron empleados</h3>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
                  )}
                  {filtered.map((employee) => (
                    <div
                      key={employee.id}
                      className={`employee-row ${selected?.id === employee.id ? "selected" : ""}`}
                      onClick={() => {
                        console.log(`🔄 Cambiando a empleado: ${employee.id} (${employee.nombre})`);
                        setSelected(employee);
                        // Cargar rutas del empleado seleccionado
                        loadEmployeeRoutes(employee.id);
                      }}
                    >
                      <div className="col-employee">
                        <div className="employee-avatar">
                          {employee.nombre.split(" ").map(p => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="employee-info">
                          <h4>{employee.nombre}</h4>
                          <p>{employee.email}</p>
                        </div>
                      </div>
                      <div className="col-role" data-label="Cargo:">
                        <span className="role-badge">{employee.cargo}</span>
                      </div>
                      <div className="col-location" data-label="Sede:">
                        <div className="location-info">
                          <MapPin size={14} />
                          <span>{employee.sede}</span>
                        </div>
                      </div>
                      <div className="col-status" data-label="Estado:">
                        <span className={`status-badge ${employee.activo ? "active" : "inactive"}`}>
                          {employee.activo ? <UserCheck size={14} /> : <UserX size={14} />}
                          {employee.activo ? "Activo" : "Inactivo"}
                      </span>
                      </div>
                      <div className="col-actions">
                        <button
                          className={`action-btn ${employee.activo ? "deactivate" : "activate"}`}
                          onClick={(e) => { e.stopPropagation(); setConfirm(employee.id); }}
                          title={employee.activo ? "Dar de baja" : "Reactivar"}
                        >
                          {employee.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => { e.stopPropagation(); setEditing(employee); }}
                          title="Editar empleado"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>

          {/* DETALLE */}
          {selected && (
            <div className="employee-detail">
              <div className="detail-card">
                <div className="detail-header">
                  <div className="employee-main-info">
                    <div className="employee-avatar-large">
                    {selected.nombre.split(" ").map(p => p[0]).slice(0, 2).join("")}
                  </div>
                    <div className="employee-details">
                    <h2>{selected.nombre}</h2>
                      <p className="employee-role">{selected.cargo}</p>
                      <div className="employee-location">
                        <MapPin size={16} />
                        <span>{selected.sede}</span>
                      </div>
                    </div>
                  </div>
                  <div className="employee-status">
                    <span className={`status-badge-large ${selected.activo ? "active" : "inactive"}`}>
                      {selected.activo ? <UserCheck size={18} /> : <UserX size={18} />}
                      {selected.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  </div>

                <div className="detail-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon">
                        <Building size={18} />
                      </div>
                      <div className="info-content">
                        <label>ID Empleado</label>
                        <span>{selected.id}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Mail size={18} />
                      </div>
                      <div className="info-content">
                        <label>Email</label>
                        <span>{selected.email}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Phone size={18} />
                      </div>
                      <div className="info-content">
                        <label>Teléfono</label>
                        <span>{selected.telefono}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="info-content">
                        <label>Sede</label>
                        <span>{selected.sede}</span>
                      </div>
                    </div>
                  </div>

                  <div className="routes-section" key={`routes-${selected?.id}-${employeeRoutes[selected?.id]?.length || 0}`}>
                    <div className="section-header">
                      <div className="section-title">
                        <Route size={20} />
                        <h3>Total Rutas</h3>
                      </div>
                      <div className="routes-count" key={`count-${selected?.id}-${employeeRoutes[selected?.id]?.length || 0}`}>
                        {employeeRoutes[selected?.id]?.length || 0}
                      </div>
                    </div>

                  {(!employeeRoutes[selected?.id] || employeeRoutes[selected?.id].length === 0) ? (
                      <div className="empty-routes">
                        <Route size={32} className="empty-icon" />
                        <p>No hay rutas asignadas</p>
                      </div>
                    ) : (
                      <div className="routes-list">
                        {employeeRoutes[selected?.id].map(route => (
                          <div key={route.id} className="route-item">
                            <div className="route-header">
                              <div className="route-id">R-{route.id}</div>
                              <span className={`route-status ${route.fecha_fin ? 'completed' : 'in-progress'}`}>
                                {route.fecha_fin ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {route.fecha_fin ? "Completada" : "En curso"}
                              </span>
                            </div>
                            <div className="route-route">
                              <span className="route-origin">Vehículo: {route.matricula}</span>
                              <span className="route-arrow">→</span>
                              <span className="route-destination">{route.total_km ? `${route.total_km} km` : 'Sin distancia'}</span>
                            </div>
                            <div className="route-times">
                              <div className="time-item">
                                <Clock size={14} />
                                <span>Inicio: {route.fecha_inicio ? new Date(route.fecha_inicio).toLocaleString() : 'Sin fecha'}</span>
                              </div>
                              {route.fecha_fin && (
                                <div className="time-item">
                                  <Calendar size={14} />
                                  <span>Fin: {new Date(route.fecha_fin).toLocaleString()}</span>
                                </div>
                              )}
                              {route.tiempo_total && (
                                <div className="time-item">
                                  <Clock size={14} />
                                  <span>Duración: {route.tiempo_total}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                      </div>
                    </div>

                <div className="detail-actions">
                  <button 
                    className="btn-login-style detail-action" 
                    onClick={() => setSelected(null)}
                  >
                    <Eye size={18} />
                    Cerrar Detalle
                  </button>
                  <button
                    className="btn-login-style detail-action"
                    onClick={() => setConfirm(selected.id)}
                  >
                    {selected.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                    {selected.activo ? "Dar de baja" : "Reactivar"}
                  </button>
                </div>
              </div>
            </div>
            )}
      </div>
      </main>

      {/* MODAL: Añadir */}
      {adding && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} />
                <h3>Añadir Empleado</h3>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setAdding(false)} 
                aria-label="Cerrar"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={addEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input 
                    name="nombre" 
                    required 
                    placeholder="Nombre y apellidos" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input 
                    name="cargo" 
                    required 
                    placeholder="Cargo" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="persona@empresa.com" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    name="telefono" 
                    placeholder="+34 ..." 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Sede</label>
                  <input 
                    name="sede" 
                    placeholder="Bilbao" 
                    className="form-input"
                  />
              </div>
                <div className="form-group">
                  <label>ID (opcional)</label>
                  <input 
                    name="id" 
                    placeholder="EMP-004" 
                    className="form-input"
                  />
              </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setAdding(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={18} />
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar empleado */}
      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">
                  <Edit size={24} />
                </div>
                <div>
                  <h3>Editar Empleado</h3>
                  <p>Modifica los datos del empleado</p>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setEditing(null)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            <div className="modal-form">
              <form onSubmit={editEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input 
                    name="nombre" 
                    defaultValue={editing.nombre}
                    placeholder="Juan Pérez" 
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    name="email" 
                    type="email"
                    defaultValue={editing.email}
                    placeholder="juan@empresa.com" 
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <select 
                    name="cargo" 
                    defaultValue={editing.cargo}
                    className="form-input"
                    required
                  >
                    <option value="administrador">Administrador</option>
                    <option value="conductor">Conductor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    name="telefono" 
                    defaultValue={editing.telefono}
                    placeholder="+34 ..." 
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-login-style btn-danger" 
                  onClick={() => {
                    setDeleteConfirm(editing.id);
                    setEditing(null);
                  }}
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
                <div className="modal-actions-right">
                  <button 
                    type="button" 
                    className="btn-login-style" 
                    onClick={() => setEditing(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-login-style">
                    <Edit size={18} />
                    Actualizar
                  </button>
                </div>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar baja/reactivar */}
      {confirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <AlertCircle size={20} />
                <h3>Confirmar Acción</h3>
              </div>
            </div>
            <div className="modal-content">
              <p>
                ¿Seguro que deseas {rows.find(r=>r.id===confirm)?.activo ? "dar de baja" : "reactivar"} este empleado?
              </p>
              <div className="employee-preview">
                {rows.find(r=>r.id===confirm) && (
                  <>
                    <div className="preview-avatar">
                      {rows.find(r=>r.id===confirm).nombre.split(" ").map(p => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="preview-info">
                      <h4>{rows.find(r=>r.id===confirm).nombre}</h4>
                      <p>{rows.find(r=>r.id===confirm).cargo} · {rows.find(r=>r.id===confirm).sede}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                className={`btn ${rows.find(r=>r.id===confirm)?.activo ? "btn-danger" : "btn-primary"}`}
                onClick={() => toggleActive(confirm)}
              >
                {rows.find(r=>r.id===confirm)?.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                {rows.find(r=>r.id===confirm)?.activo ? "Dar de baja" : "Reactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar eliminación permanente */}
      {deleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon danger">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3>Eliminar Empleado Permanentemente</h3>
                  <p>Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>
            <div className="modal-content">
              <p>
                ¿Estás seguro de que quieres eliminar permanentemente este empleado? 
                Esta acción eliminará todos los datos del empleado y no se puede deshacer.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => deleteEmployee(deleteConfirm)}
              >
                <Trash2 size={18} />
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}
