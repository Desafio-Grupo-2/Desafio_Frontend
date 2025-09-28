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
import logo from "../../assets/logos/logo.svg";
import iconoSinFondo from "../../assets/logos/icono_sin_fondo.svg";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
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
        {/* Logo - Solo visible en desktop */}
        <div className="logo-container desktop-only">
          <div className="logo">
            <img src={logo} alt="Logo de la empresa" className="logo-image" />
            <div className="logo-text">
              <h2>San Millán Bus</h2>
              <p className="text-sm font-normal text-gray-500">Jefe de flota</p>
            </div>
          </div>
        </div>

        {/* Icono móvil - Solo visible en móvil/tablet */}
        <div className="mobile-logo mobile-only">
          <img src={iconoSinFondo} alt="Logo de la empresa" className="mobile-logo-icon" />
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
              to="/analiticas" 
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
            <button onClick={handleLogout} title="Cerrar sesión" disabled={isLoggingOut}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Loader de logout */}
        {isLoggingOut && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div className="logout-loader"></div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;