import { useState } from "react";
import { Car, PlusCircle, Trash2, X } from "lucide-react";
import AdminSidebar from '../Admin_sidebar/Admin_sidebar';
import '../../styles/layout/adminVehiculos.scss'

const AdminVehiculos = () => {
    const [vehiculos, setVehiculos] = useState([
        { id: 1, marca: "Mercedes", modelo: "Actros", matricula: "1234-ABC" },
        { id: 2, marca: "Volvo", modelo: "FH16", matricula: "5678-XYZ" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({
        marca: "",
        modelo: "",
        matricula: "",
    });

    const handleChange = (e) => {
        setNuevoVehiculo({
            ...nuevoVehiculo,
            [e.target.name]: e.target.value,
        });
    };

    const addVehiculo = (e) => {
        e.preventDefault();
        if (!nuevoVehiculo.marca || !nuevoVehiculo.modelo || !nuevoVehiculo.matricula) return;

        const vehiculoConId = { id: Date.now(), ...nuevoVehiculo };
        setVehiculos([...vehiculos, vehiculoConId]);
        setNuevoVehiculo({ marca: "", modelo: "", matricula: "" });
        setShowModal(false);
    };

    const removeVehiculo = (id) => {
        setVehiculos(vehiculos.filter((v) => v.id !== id));
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-vehiculos-page">
                <div className="vehiculos">
                <div className="vehiculos-header flex-between mb-4">
                    <h2 className="flex items-center gap-2">
                        <Car size={18} /> Vehículos
                    </h2>
                    <button className="button solid" onClick={() => setShowModal(true)}>
                        <PlusCircle size={16} /> Añadir Vehículo
                    </button>
                </div>

                {vehiculos.length === 0 ? (
                    <p>No hay vehículos registrados</p>
                ) : (
                    <div className="vehiculos-cards">
                        {vehiculos.map((v) => (
                            <div className="vehiculo-card card" key={v.id}>
                                <div><strong>Marca:</strong> {v.marca}</div>
                                <div><strong>Modelo:</strong> {v.modelo}</div>
                                <div><strong>Matrícula:</strong> {v.matricula}</div>
                                <div className="actions mt-2">
                                    <button
                                        className="button outline w-full"
                                        onClick={() => removeVehiculo(v.id)}
                                    >
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-backdrop">
                        <div className="modal">
                            <div className="modal-header flex-between">
                                <h2>Añadir Vehículo</h2>
                            </div>
                            <form onSubmit={addVehiculo} className="modal-content">
                                <label>
                                    Marca:
                                    <input
                                        type="text"
                                        name="marca"
                                        value={nuevoVehiculo.marca}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Modelo:
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={nuevoVehiculo.modelo}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Matrícula:
                                    <input
                                        type="text"
                                        name="matricula"
                                        value={nuevoVehiculo.matricula}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="button solid w-full">
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        className="button outline w-full cancel-button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AdminVehiculos;