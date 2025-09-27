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
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/auth/authSlice';
import "../../styles/layout/adminDashboard.scss";
import { Link } from "react-router-dom";
import { useState } from 'react';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logout());
    navigate('/');
  };

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
          <Link to="/admin-dashboard" className="active">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/Employes" >
            <Users size={18} /> Empleados
          </Link>
     
          <Link to="/analiticas" >
            <BarChart3 size={18} /> Analíticas
          </Link>

          <Link to="/" >
            <MapPin size={18} /> Hotspots
          </Link>

          <Link to="/admin-vehiculos" >
            <Bus size={18} /> Vehiculos
          </Link>

           <Link to="/" >
            <Tickets size={18} /> Tickets
          </Link>
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
  );
};

export default AdminSidebar;