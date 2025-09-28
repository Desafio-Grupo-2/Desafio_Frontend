import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/auth/authSlice';
import "../../styles/layout/adminDashboard.scss";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      console.log('Logout ya en progreso, ignorando clic...');
      return;
    }
    
    setIsLoggingOut(true);
    console.log('Iniciando logout...');
    
    try {
      console.log('Dispatch logout...');
      await dispatch(logout());
      console.log('Logout dispatch completado');
      // Forzar navegación incluso si hay error
      navigate('/');
      console.log('Navegación a / completada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar localStorage manualmente si es necesario
      localStorage.clear();
      sessionStorage.clear();
      console.log('Storage limpiado manualmente');
      navigate('/');
      console.log('Navegación forzada completada');
    } finally {
      setIsLoggingOut(false);
    }
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
          <a href="#" className="active">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#">
            <Users size={18} /> Empleados
          </a>
          <a href="#">
            <BarChart3 size={18} /> Analíticas
          </a>
          <a href="#" onClick={() => navigate('/admin-hotspots')}>
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
          <p>{user?.nombre} {user?.apellido}</p>
          <p className="email">{user?.email}</p>
        </div>
        <div className="actions">
          <button>
            <Settings size={18} />
          </button>
          <button 
            onClick={handleLogout} 
            title="Cerrar sesión"
            disabled={isLoggingOut}
            style={{ opacity: isLoggingOut ? 0.6 : 1, cursor: isLoggingOut ? 'not-allowed' : 'pointer' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;