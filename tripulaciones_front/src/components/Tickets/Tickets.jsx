import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------- MOCK ---------- */
const mockTickets = [
  { id:"TCK-0001", fecha:"2025-09-27T09:32:00Z", conductor:"Juan Pérez",  vehiculo:"BUS-12", estacion:"Shell Central", litros:45.2, precioLitro:1.34, metodoPago:"Tarjeta" },
  { id:"TCK-0002", fecha:"2025-09-25T14:12:00Z", conductor:"María López", vehiculo:"BUS-08", estacion:"Repsol Norte",   litros:60.0, precioLitro:1.31, metodoPago:"Efectivo" },
  { id:"TCK-0003", fecha:"2025-09-23T07:55:00Z", conductor:"Carlos Díaz",  vehiculo:"BUS-21", estacion:"PetroSur",       litros:38.7, precioLitro:1.29, metodoPago:"Tarjeta" },
  { id:"TCK-0004", fecha:"2025-04-03T17:25:00Z", conductor:"Ana Gómez",    vehiculo:"BUS-05", estacion:"Shell Central",  litros:52.3, precioLitro:1.22, metodoPago:"Transferencia" },
];

/* ---------- utils ---------- */
function isWithin(date, from){ return new Date(date).getTime() >= from.getTime(); }
function formatCurrency(v){ return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(v); }
function formatDate(iso){ const d=new Date(iso); return d.toLocaleDateString("es-ES",{year:"numeric",month:"2-digit",day:"2-digit"}); }

/* Breakpoint móvil */
function useIsMobile(query="(max-width: 900px)") {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = e => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return isMobile;
}

/* Columnas declarativas */
const ALL_COLUMNS = [
  { id: "fecha",      label: "Fecha",     cell: (t) => formatDate(t.fecha) },
  { id: "conductor",  label: "Conductor", cell: (t) => t.conductor },
  { id: "vehiculo",   label: "Vehículo",  cell: (t) => t.vehiculo },
  { id: "estacion",   label: "Estación",  cell: (t) => t.estacion },
  { id: "litros",     label: "Litros",    cell: (t) => t.litros.toFixed(2), align: "right" },
  { id: "precio",     label: "€/L",       cell: (t) => t.precioLitro.toFixed(2), align: "right" },
  { id: "total",      label: "Total",     cell: (t) => formatCurrency(t.total), align: "right" },
  { id: "metodo",     label: "Método",    cell: (t) => t.metodoPago },
];

export default function Tickets() {
  const [rango, setRango] = useState("semanal");
  const isMobile = useIsMobile();
  const MOBILE_LIMIT = 3;

  /* Fechas */
  const desde = useMemo(() => {
    const now = new Date();
    if (rango === "semanal") return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    if (rango === "mensual") return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }, [rango]);

  /* Datos + total */
  const ticketsFiltrados = useMemo(() => (
    mockTickets
      .filter(t => isWithin(t.fecha, desde))
      .map(t => ({ ...t, total: t.litros * t.precioLitro }))
      .sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
  ), [desde]);

  const totalPeriodo = useMemo(
    () => ticketsFiltrados.reduce((acc, t) => acc + t.total, 0),
    [ticketsFiltrados]
  );

  /* Visibilidad de columnas */
  const defaultMobile = ["fecha","conductor","total"];
  const [visibleCols, setVisibleCols] = useState(() => new Set(ALL_COLUMNS.map(c => c.id)));

  useEffect(() => {
    if (isMobile) setVisibleCols(new Set(defaultMobile));
    else setVisibleCols(new Set(ALL_COLUMNS.map(c => c.id)));
  }, [isMobile]);

  const visibleColumns = ALL_COLUMNS.filter(c => visibleCols.has(c.id));

  const toggleCol = (id) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        if (isMobile && next.size >= MOBILE_LIMIT) return next;
        next.add(id);
      }
      return next;
    });
  };

  /* Exportar PDF respetando columnas visibles */
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const x = 40;
    let y = 40;

    doc.setFont("helvetica","bold"); doc.setFontSize(16);
    doc.text(`Tickets de combustible — ${rango[0].toUpperCase()+rango.slice(1)}`, x, y);
    y += 12;
    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    doc.text(`Total periodo: ${formatCurrency(totalPeriodo)}  •  Registros: ${ticketsFiltrados.length}`, x, y);
    y += 12;

    autoTable(doc, {
      startY: y,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [255,245,240], textColor: [15,23,42] },
      head: [visibleColumns.map(c => c.label)],
      body: ticketsFiltrados.map(t => visibleColumns.map(c => c.cell(t))),
      margin: { left: x, right: x }
    });

    doc.save(`tickets_${rango}.pdf`);
  };

  /* Dropdown de columnas */
  const [openCols, setOpenCols] = useState(false);
  const colsRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (colsRef.current && !colsRef.current.contains(e.target)) setOpenCols(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Bloquear scroll de fondo cuando panel está abierto en móvil
  useEffect(() => {
    if (isMobile) {
      const original = document.body.style.overflow;
      document.body.style.overflow = openCols ? "hidden" : original || "";
      return () => { document.body.style.overflow = original; };
    }
  }, [openCols, isMobile]);

  return (
    <div className="page-container">
      <section className="tickets">
        {/* HEADER */}
        <header className="tickets__header card">
          <div><h1>Tickets de combustible</h1></div>
          <div className="tickets__filters">
            <button className={rango==="semanal" ? "active" : ""} onClick={()=>setRango("semanal")}>Semanal</button>
            <button className={rango==="mensual" ? "active" : ""} onClick={()=>setRango("mensual")}>Mensual</button>
            <button className={rango==="anual"   ? "active" : ""} onClick={()=>setRango("anual")}>Anual</button>
            <button className="btn-pdf" onClick={exportPDF}>Descargar PDF</button>
          </div>
        </header>

        {/* RESUMEN */}
        <div className="tickets__summary">
          <div className="card">
            <span className="badge period">Resumen {rango}</span>
            <p className="label">Total periodo</p>
            <p className="value">{formatCurrency(totalPeriodo)}</p>
          </div>
          <div className="card">
            <p className="label">Tickets</p>
            <p className="value">{ticketsFiltrados.length}</p>
          </div>
        </div>

        {/* TABLA */}
        <div className="tickets__table card">
          <div className="table-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-title">Listado</span>
            </div>

            {/* Backdrop en móvil */}
            {openCols && isMobile && (
              <div
                className="columns-backdrop"
                onClick={() => setOpenCols(false)}
                aria-hidden="true"
              />
            )}

            <div className="toolbar-right" ref={colsRef}>
              <button
                className="columns-btn"
                title="Elegir columnas"
                aria-label="Elegir columnas"
                onClick={() => setOpenCols((v) => !v)}
                aria-expanded={openCols}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M19.14,12.94c.04-.31,.06-.63,.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14,.23-.39,.12-.6l-1.92-3.32c-.11-.2-.35-.28-.56-.22l-2.39,.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.22-.23-.38-.45-.38h-3.84c-.22,0-.41,.16-.45,.38l-.36,2.54c-.59,.24-1.13,.56-1.62,.94l-2.39-.96c-.21-.06-.45,.02-.56,.22l-1.92,3.32c-.11,.2-.06,.45,.12,.6l2.03,1.58c-.04,.31-.06,.63-.06,.94s.02,.63,.06,.94l-2.03,1.58c-.18,.14-.23,.39-.12,.6l1.92,3.32c.11,.2,.35,.28,.56,.22l2.39-.96c.5,.38,1.03,.7,1.62,.94l.36,2.54c.04,.22,.23,.38,.45,.38h3.84c.22,0,.41-.16,.45-.38l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39,.96c.21,.06,.45-.02,.56-.22l1.92-3.32c.11-.2,.06-.45-.12-.6l-2.03-1.58Zm-7.14,2.56c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5s-1.57,3.5-3.5,3.5Z"
                  />
                </svg>
              </button>

              {openCols && (
                <div className={`columns-panel ${isMobile ? "columns-panel--mobile" : ""}`} role="dialog">
                  {ALL_COLUMNS.map((col) => {
                    const checked = visibleCols.has(col.id);
                    const disabled = !checked && (isMobile && visibleCols.size >= MOBILE_LIMIT);
                    return (
                      <label key={col.id} className={`columns-item ${disabled ? "is-disabled" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleCol(col.id)}
                        />
                        <span>{col.label}</span>
                      </label>
                    );
                  })}
                  {isMobile && <div className="columns-hint">Elige hasta 3 columnas.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Tabla o lista según dispositivo */}
          {!isMobile ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {visibleColumns.map(col => (
                      <th key={col.id} style={{ textAlign: col.align || "left" }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ticketsFiltrados.length === 0 ? (
                    <tr><td colSpan={visibleColumns.length} className="empty">No hay tickets en el rango seleccionado.</td></tr>
                  ) : ticketsFiltrados.map(t => (
                    <tr key={t.id}>
                      {visibleColumns.map(col => (
                        <td key={col.id} style={{ textAlign: col.align || "left" }}>{col.cell(t)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="mobile-list">
              {ticketsFiltrados.length === 0 ? (
                <li className="mobile-empty">No hay tickets en el rango seleccionado.</li>
              ) : ticketsFiltrados.map(t => (
                <li key={t.id} className="mobile-row">
                  {visibleColumns.map(col => (
                    <div key={col.id} className="mobile-cell">
                      <span className="m-label">{col.label}</span>
                      <span className="m-value">{col.cell(t)}</span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
