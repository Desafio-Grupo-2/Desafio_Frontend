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
import "./Employes.scss";
import usersService from "../../redux/users/usersService";

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

export default function Employes() {
  const [openList, setOpenList] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null); // id a dar de baja

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
            cargo: user.rol || user.cargo || 'Sin cargo',
            email: user.email || user.correo || 'Sin email',
            telefono: user.telefono || user.telefono_usuario || 'Sin teléfono',
            activo: user.activo !== false, // Por defecto activo si no se especifica
            sede: user.sede || user.ubicacion || 'Sin sede',
            rutas: [] // Los rutas se cargarían por separado si es necesario
          }));
          
          setRows(transformedUsers);
          if (transformedUsers.length > 0) {
            setSelected(transformedUsers[0]);
          }
        } else {
          console.warn('No se encontraron usuarios, usando datos mock');
          setRows(SEED);
          setSelected(SEED[0]);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        setError(error.message);
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
      return passQ && passAct;
    });
  }, [rows, q, onlyActive]);

  function addEmployee(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nuevo = {
      id: fd.get("id") || `EMP-${String(rows.length + 1).padStart(3, "0")}`,
      nombre: fd.get("nombre"),
      cargo: fd.get("cargo"),
      email: fd.get("email"),
      telefono: fd.get("telefono"),
      sede: fd.get("sede"),
      activo: true,
      rutas: [],
    };
    setRows(prev => [nuevo, ...prev]);
    setAdding(false);
    setSelected(nuevo);
  }

  function toggleActive(id) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, activo: !r.activo } : r)));
    if (selected?.id === id) setSelected(s => (s ? { ...s, activo: !s.activo } : s));
    setConfirm(null);
  }

  if (loading) {
    return (
      <main className="emp">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando empleados...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="emp">
        <div className="error-container">
          <h3>Error al cargar empleados</h3>
          <p>{error}</p>
          <p>Mostrando datos de ejemplo...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <main className="content">
        {/* Header */}
        <div className="header flex-between">
          <div className="header-content">
            <div className="header-icon">
              <Users size={24} />
            </div>
            <div>
              <h1>Gestión de Empleados</h1>
              <p>Administra el personal y sus asignaciones</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => setOpenList(o => !o)}
            >
              {openList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {openList ? "Ocultar lista" : "Ver lista"}
            </button>
            <button 
              className="btn btn-primary" 
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
              <p className="value">{rows.reduce((acc, r) => acc + (r.rutas?.length || 0), 0)}</p>
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
                      onClick={() => setSelected(employee)}
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
                      <div className="col-role">
                        <span className="role-badge">{employee.cargo}</span>
                      </div>
                      <div className="col-location">
                        <div className="location-info">
                          <MapPin size={14} />
                          <span>{employee.sede}</span>
                        </div>
                      </div>
                      <div className="col-status">
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
                          onClick={(e) => { e.stopPropagation(); }}
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

                  <div className="routes-section">
                    <div className="section-header">
                      <div className="section-title">
                        <Route size={20} />
                        <h3>Rutas Asignadas</h3>
                      </div>
                      <div className="routes-count">
                        {selected.rutas?.length || 0}
                      </div>
                  </div>

                  {(!selected.rutas || selected.rutas.length === 0) ? (
                      <div className="empty-routes">
                        <Route size={32} className="empty-icon" />
                        <p>No hay rutas asignadas</p>
                      </div>
                    ) : (
                      <div className="routes-list">
                        {selected.rutas.map(route => (
                          <div key={route.id} className="route-item">
                            <div className="route-header">
                              <div className="route-id">{route.id}</div>
                              <span className={`route-status ${route.estado.toLowerCase().replace(' ', '-')}`}>
                                {route.estado === "Completada" && <CheckCircle size={14} />}
                                {route.estado === "En curso" && <Clock size={14} />}
                                {route.estado === "Pendiente" && <AlertCircle size={14} />}
                                {route.estado}
                              </span>
                            </div>
                            <div className="route-route">
                              <span className="route-origin">{route.origen}</span>
                              <span className="route-arrow">→</span>
                              <span className="route-destination">{route.destino}</span>
                            </div>
                            <div className="route-times">
                              <div className="time-item">
                                <Clock size={14} />
                                <span>Salida: {route.salida}</span>
                              </div>
                              <div className="time-item">
                                <Calendar size={14} />
                                <span>ETA: {route.eta}</span>
                        </div>
                      </div>
                          </div>
                        ))}
                      </div>
                    )}
                      </div>
                    </div>

                <div className="detail-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setSelected(null)}
                  >
                    <Eye size={18} />
                    Cerrar Detalle
                  </button>
                  <button
                    className={`btn ${selected.activo ? "btn-danger" : "btn-primary"}`}
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
    </div>
  );
}
