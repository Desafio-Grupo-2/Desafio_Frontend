import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MapPin,
  Bus,
  Tickets,
  Menu,
  X
} from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../../redux/auth/authSlice';
import { useState } from "react";
import "../../styles/layout/adminSidebar.scss";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {/* Botón hamburguesa */}
      <button 
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div>
          <div className="logo">
            FleetManager
            <p className="text-sm font-normal text-gray-500">Panel Admin</p>
          </div>

          {/* Navegación */}
          <nav>
            <NavLink 
              to="/admin-dashboard" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink 
              to="/Employes" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <Users size={18} /> Empleados
            </NavLink>

            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 size={18} /> Analíticas
            </NavLink>

            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <MapPin size={18} /> Hotspots
            </NavLink>

            <NavLink 
              to="/admin-vehiculos" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <Bus size={18} /> Vehiculos
            </NavLink>

            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "link-active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <Tickets size={18} /> Tickets
            </NavLink>
          </nav>
        </div>

        {/* Perfil de usuario */}
        <div className="profile">
          <div className="info">
            <p>{user?.nombre} {user?.apellido}</p>
            <p className="email">{user?.email}</p>
          </div>
          <div className="actions">
            <button>
              <Settings size={18} />
            </button>
            <button onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;