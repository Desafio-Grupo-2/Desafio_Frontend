import { useState, useEffect } from "react";
import { Search, Plus, Car, Fuel, Zap, Settings } from "lucide-react";
import "../../styles/layout/adminVehiculos.scss";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehiculo, setNewVehiculo] = useState({
    modelo: "",
    motorizacion: "Eléctrico",
    clasificacion_energetica: "A",
    consumo_min: 0,
    consumo_max: 0,
    emisiones_min: 0,
    emisiones_max: 0,
    kw_min: 0,
    kw_max: 0,
    estado: "activo",
  });

  useEffect(() => {
    const filtered = vehiculos.filter(
      (vehiculo) =>
        vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.motorizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.clasificacion_energetica
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredVehiculos(filtered);
  }, [searchTerm, vehiculos]);

  const handleAddVehiculo = () => {
    const nuevo = {
      ...newVehiculo,
      id: vehiculos.length + 1,
    };
    setVehiculos([...vehiculos, nuevo]);
    setIsModalOpen(false);

    // Reiniciar formulario
    setNewVehiculo({
      modelo: "",
      motorizacion: "Eléctrico",
      clasificacion_energetica: "A",
      consumo_min: 0,
      consumo_max: 0,
      emisiones_min: 0,
      emisiones_max: 0,
      kw_min: 0,
      kw_max: 0,
      estado: "activo",
    });
  };

  const handleDeleteVehiculo = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este vehículo?")) {
      setVehiculos(vehiculos.filter((v) => v.id !== id));
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      activo: "badge badge-solid",
      mantenimiento: "badge badge-outline",
      inactivo: "badge badge-danger",
    };
    return <span className={variants[estado] || "badge"}>{estado}</span>;
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
    <div className="admin-vehiculos-page">
      <h1>Gestión de Vehículos</h1>
      <p>Administra la flota de vehículos y sus especificaciones técnicas</p>

      {/* Estadísticas rápidas */}
      <div className="vehiculos-cards">
        <div className="vehiculo-card">
          <div className="card-header">
            <h3 className="card-title">
              <Car className="icon" /> Total Vehículos
            </h3>
          </div>
          <div className="card-content">{vehiculos.length}</div>
        </div>

        <div className="vehiculo-card">
          <div className="card-header">
            <h3 className="card-title">Vehículos Activos</h3>
          </div>
          <div className="card-content">
            {vehiculos.filter((v) => v.estado === "activo").length}
          </div>
        </div>

        <div className="vehiculo-card">
          <div className="card-header">
            <h3 className="card-title">
              <Zap className="icon" /> Vehículos Eléctricos
            </h3>
          </div>
          <div className="card-content">
            {vehiculos.filter((v) => v.motorizacion === "Eléctrico").length}
          </div>
        </div>

        <div className="vehiculo-card">
          <div className="card-header">
            <h3 className="card-title">
              <Settings className="icon" /> En Mantenimiento
            </h3>
          </div>
          <div className="card-content">
            {vehiculos.filter((v) => v.estado === "mantenimiento").length}
          </div>
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="vehiculos">
        <div className="vehiculos-header">
          <h2>Lista de Vehículos</h2>
          <button className="button solid" onClick={() => setIsModalOpen(true)}>
            <Plus className="icon" /> Agregar Vehículo
          </button>
        </div>

        <div className="search-bar">
          <Search className="icon" />
          <input
            type="text"
            placeholder="Buscar por modelo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Motorización</th>
                <th>Clasificación</th>
                <th>Consumo (L/100km)</th>
                <th>Emisiones (g/km)</th>
                <th>Potencia (kW)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehiculos.map((vehiculo) => (
                <tr key={vehiculo.id}>
                  <td data-label="Modelo">{vehiculo.modelo}</td>
                  <td data-label="Motorización">
                    <div className="flex items-center">
                      {getMotorizacionIcon(vehiculo.motorizacion)}
                      <span>{vehiculo.motorizacion}</span>
                    </div>
                  </td>
                  <td data-label="Clasificación">
                    <span
                      className={`font-semibold ${getClasificacionColor(
                        vehiculo.clasificacion_energetica
                      )}`}
                    >
                      {vehiculo.clasificacion_energetica}
                    </span>
                  </td>
                  <td data-label="Consumo (L/100km)">
                    {vehiculo.motorizacion === "Eléctrico" ? (
                      <span className="text-green-600">0 L/100km</span>
                    ) : (
                      <span>
                        {vehiculo.consumo_min} - {vehiculo.consumo_max}
                      </span>
                    )}
                  </td>
                  <td data-label="Emisiones (g/km)">
                    {vehiculo.motorizacion === "Eléctrico" ? (
                      <span className="text-green-600">0 g/km</span>
                    ) : (
                      <span>
                        {vehiculo.emisiones_min} - {vehiculo.emisiones_max}
                      </span>
                    )}
                  </td>
                  <td data-label="Potencia (kW)">
                    {vehiculo.kw_min} - {vehiculo.kw_max} kW
                  </td>
                  <td data-label="Estado">{getEstadoBadge(vehiculo.estado)}</td>
                  <td data-label="Acciones">
                    <button
                      className="button danger"
                      onClick={() => handleDeleteVehiculo(vehiculo.id)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar vehículo */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Agregar Vehículo</h3>
            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddVehiculo();
              }}
            >
              <label>
                Modelo:
                <input
                  type="text"
                  value={newVehiculo.modelo}
                  onChange={(e) =>
                    setNewVehiculo({ ...newVehiculo, modelo: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Motorización:
                <select
                  value={newVehiculo.motorizacion}
                  onChange={(e) =>
                    setNewVehiculo({
                      ...newVehiculo,
                      motorizacion: e.target.value,
                    })
                  }
                >
                  <option>Eléctrico</option>
                  <option>Gasolina</option>
                  <option>Diésel</option>
                </select>
              </label>

              <label>
                Clasificación energética:
                <select
                  value={newVehiculo.clasificacion_energetica}
                  onChange={(e) =>
                    setNewVehiculo({
                      ...newVehiculo,
                      clasificacion_energetica: e.target.value,
                    })
                  }
                >
                  <option>A+</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </label>

              <label>
                Potencia mínima (kW):
                <input
                  type="number"
                  value={newVehiculo.kw_min}
                  onChange={(e) =>
                    setNewVehiculo({ ...newVehiculo, kw_min: +e.target.value })
                  }
                />
              </label>

              <label>
                Potencia máxima (kW):
                <input
                  type="number"
                  value={newVehiculo.kw_max}
                  onChange={(e) =>
                    setNewVehiculo({ ...newVehiculo, kw_max: +e.target.value })
                  }
                />
              </label>

              <label>
                Estado:
                <select
                  value={newVehiculo.estado}
                  onChange={(e) =>
                    setNewVehiculo({ ...newVehiculo, estado: e.target.value })
                  }
                >
                  <option>activo</option>
                  <option>mantenimiento</option>
                  <option>inactivo</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehiculos;