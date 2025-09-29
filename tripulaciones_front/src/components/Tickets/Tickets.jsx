import { useMemo, useState } from "react";

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

export default function Tickets() {
  const [rango, setRango] = useState("semanal");

  const desde = useMemo(() => {
    const now = new Date();
    if (rango === "semanal") return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    if (rango === "mensual")  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }, [rango]);

  const ticketsFiltrados = useMemo(() => {
    return mockTickets
      .filter(t => isWithin(t.fecha, desde))
      .map(t => ({ ...t, total: t.litros * t.precioLitro }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [desde]);

  const totalPeriodo = useMemo(
    () => ticketsFiltrados.reduce((acc, t) => acc + t.total, 0),
    [ticketsFiltrados]
  );

  return (
    <div className="page-container">
      <section className="tickets">
        {/* HEADER (ocupa 1 → 12 y ancho completo) */}
        <header className="tickets__header card">
          <div><h1>Tickets de combustible</h1></div>
          <div className="tickets__filters">
            <button className={rango === "semanal" ? "active" : ""} onClick={() => setRango("semanal")}>Semanal</button>
            <button className={rango === "mensual" ? "active" : ""} onClick={() => setRango("mensual")}>Mensual</button>
            <button className={rango === "anual" ? "active" : ""} onClick={() => setRango("anual")}>Anual</button>
          </div>
        </header>

        {/* RESUMEN (dos cards: 1–6 y 7–12) */}
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

        {/* TABLA (ocupa 1 → 12 y ancho completo) */}
        <div className="tickets__table card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Conductor</th>
                  <th>Vehículo</th>
                  <th>Estación</th>
                  <th>Litros</th>
                  <th>€/L</th>
                  <th>Total</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.length === 0 && (
                  <tr><td colSpan={8} className="empty">No hay tickets en el rango seleccionado.</td></tr>
                )}
                {ticketsFiltrados.map(t => (
                  <tr key={t.id}>
                    <td>{formatDate(t.fecha)}</td>
                    <td>{t.conductor}</td>
                    <td>{t.vehiculo}</td>
                    <td>{t.estacion}</td>
                    <td>{t.litros.toFixed(2)}</td>
                    <td>{t.precioLitro.toFixed(2)}</td>
                    <td>{formatCurrency(t.total)}</td>
                    <td>{t.metodoPago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
