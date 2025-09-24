import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MapPin,
  Bus,
  Tickets
} from "lucide-react";
import "../../styles/layout/adminDashboard.scss";

const AdminSidebar = () => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div>
        <div className="logo">
          FleetManager
          <p className="text-sm font-normal text-gray-500">Panel Admin</p>
        </div>

        {/* Navegación */}
        <nav>
          <a href="#" className="active">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#">
            <Users size={18} /> Empleados
          </a>
          <a href="#">
            <BarChart3 size={18} /> Analíticas
          </a>
          <a href="#">
            <MapPin size={18} /> Hotspots
          </a>
          <a href="#">
            <Bus size={18} /> Vehiculos
          </a>
          <a href="#">
            <Tickets size={18} /> Tickets
          </a>
        </nav>
      </div>

      {/* Perfil de usuario */}
      <div className="profile">
        <div className="info">
          <p>Ana Rodriguez</p>
          <p className="email">ana@fleetmanager.com</p>
        </div>
        <div className="actions">
          <button>
            <Settings size={18} />
          </button>
          <button>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;