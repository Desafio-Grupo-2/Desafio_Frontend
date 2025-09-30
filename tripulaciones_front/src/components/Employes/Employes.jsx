import React, { useMemo, useState, useEffect } from "react";
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
    <main className="emp">
      <div className="emp__shell">
        <header className="emp__bar">
          <div className="emp__title">
            <div className="emp__logo" aria-hidden>🚚</div>
            <div>
              <h1>Empleados</h1>
              <p>Panel de administración</p>
            </div>
          </div>

          <div className="emp__actions">
            <button className="btn btn--ghost" onClick={() => setOpenList(o => !o)}>
              {openList ? "Ocultar lista" : "Ver lista"}
            </button>
            <button className="btn btn--primary" onClick={() => setAdding(true)}>
              Añadir empleado
            </button>
          </div>
        </header>

        <section className={`emp__grid ${openList ? "is-open" : "is-closed"}`}>
          {/* LISTA */}
          {openList && (
            <aside className="emp__list">
              <div className="toolbar">
                <input
                  className="input"
                  placeholder="Buscar por nombre, cargo, email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <label className="check">
                  <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                  <span>Solo activos</span>
                </label>
              </div>

              <div className="table">
                <div className="thead">
                  <span>Empleado</span>
                  <span>Cargo</span>
                  <span>Estado</span>
                  <span className="right">Acciones</span>
                </div>
                <ul className="tbody">
                  {filtered.length === 0 && <li className="empty">Sin resultados</li>}
                  {filtered.map((r) => (
                    <li
                      key={r.id}
                      className={`row ${selected?.id === r.id ? "is-selected" : ""}`}
                      onClick={() => setSelected(r)}
                    >
                      <span className="empcol">
                        <b>{r.nombre}</b>
                        <small>{r.email}</small>
                      </span>
                      <span>{r.cargo}</span>
                      <span>
                        <span className={`badge ${r.activo ? "ok" : "off"}`}>{r.activo ? "Activo" : "De baja"}</span>
                      </span>
                      <span className="right">
                        <button
                          className={`chip ${r.activo ? "warn" : "ok"}`}
                          onClick={(e) => { e.stopPropagation(); setConfirm(r.id); }}
                          title={r.activo ? "Dar de baja" : "Reactivar"}
                        >
                          {r.activo ? "Dar de baja" : "Reactivar"}
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* DETALLE */}
          <section className="emp__detail">
            {!selected ? (
              <div className="placeholder">
                <h3>Selecciona un empleado</h3>
                <p>Haz clic en un elemento de la lista para ver su ficha.</p>
              </div>
            ) : (
              <article className="card">
                <header className="card__head">
                  <div className={`avatar ${selected.nombre.charAt(0).toLowerCase()}`}>
                    {selected.nombre.split(" ").map(p => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h2>{selected.nombre}</h2>
                    <p>{selected.cargo} · {selected.sede}</p>
                  </div>
                  <span className={`badge ${selected.activo ? "ok" : "off"}`}>{selected.activo ? "Activo" : "De baja"}</span>
                </header>

                <dl className="meta">
                  <div><dt>ID</dt><dd>{selected.id}</dd></div>
                  <div><dt>Email</dt><dd>{selected.email}</dd></div>
                  <div><dt>Teléfono</dt><dd>{selected.telefono}</dd></div>
                  <div><dt>Sede</dt><dd>{selected.sede}</dd></div>
                </dl>

                <section className="routes">
                  <div className="routes__head">
                    <h3>Rutas asignadas</h3>
                    <span className="counter">{selected.rutas?.length || 0}</span>
                  </div>

                  {(!selected.rutas || selected.rutas.length === 0) ? (
                    <p className="routes__empty">No hay rutas asignadas.</p>
                  ) : (
                    <div className="rtable" role="table" aria-label="Rutas">
                      <div className="rthead" role="rowgroup">
                        <div className="rrow rrow--head" role="row">
                          <span role="columnheader">Ruta</span>
                          <span role="columnheader">Origen → Destino</span>
                          <span role="columnheader">Salida</span>
                          <span role="columnheader">ETA</span>
                          <span role="columnheader" className="right">Estado</span>
                        </div>
                      </div>
                      <div className="rtbody" role="rowgroup">
                        {selected.rutas.map(rt => (
                          <div className="rrow" role="row" key={rt.id}>
                            <span role="cell"><b>{rt.id}</b></span>
                            <span role="cell">{rt.origen} → {rt.destino}</span>
                            <span role="cell">{rt.salida}</span>
                            <span role="cell">{rt.eta}</span>
                            <span role="cell" className="right">
                              <span
                                className={
                                  "badge " +
                                  (rt.estado === "En curso" ? "info" :
                                   rt.estado === "Completada" ? "ok" : "warn")
                                }
                              >
                                {rt.estado}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <div className="card__actions">
                  <button className="btn btn--ghost" onClick={() => setSelected(null)}>Volver</button>
                  <button
                    className={`btn ${selected.activo ? "btn--danger" : "btn--primary"}`}
                    onClick={() => setConfirm(selected.id)}
                  >
                    {selected.activo ? "Dar de baja" : "Reactivar"}
                  </button>
                </div>
              </article>
            )}
          </section>
        </section>
      </div>

      {/* MODAL: Añadir */}
      {adding && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__card">
            <header className="modal__head">
              <h3>Añadir empleado</h3>
              <button className="iconbtn" onClick={() => setAdding(false)} aria-label="Cerrar">✕</button>
            </header>
            <form className="form" onSubmit={addEmployee}>
              <div className="grid2">
                <label><span>Nombre</span><input name="nombre" required placeholder="Nombre y apellidos" /></label>
                <label><span>Cargo</span><input name="cargo" required placeholder="Cargo" /></label>
              </div>
              <div className="grid2">
                <label><span>Email</span><input type="email" name="email" required placeholder="persona@empresa.com" /></label>
                <label><span>Teléfono</span><input name="telefono" placeholder="+34 ..." /></label>
              </div>
              <div className="grid2">
                <label><span>Sede</span><input name="sede" placeholder="Bilbao" /></label>
                <label><span>ID (opcional)</span><input name="id" placeholder="EMP-004" /></label>
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar baja/reactivar */}
      {confirm && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__card">
            <header className="modal__head">
              <h3>Confirmar acción</h3>
            </header>
            <p>¿Seguro que deseas {rows.find(r=>r.id===confirm)?.activo ? "dar de baja" : "reactivar"} este empleado?</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => toggleActive(confirm)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
