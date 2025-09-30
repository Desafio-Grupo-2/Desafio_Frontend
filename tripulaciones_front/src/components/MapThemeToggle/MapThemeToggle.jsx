import { Sun, Moon } from 'lucide-react';
import { useMapTheme } from '../../contexts/MapThemeContext';
import './MapThemeToggle.scss';

const MapThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useMapTheme();

  return (
    <button
      className={`map-theme-toggle ${className}`}
      onClick={toggleTheme}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? (
        <Sun size={20} className="theme-icon" />
      ) : (
        <Moon size={20} className="theme-icon" />
      )}
      <span className="theme-text">
        {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
    </button>
  );
};

export default MapThemeToggle;
