import { createContext, useContext, useState, useEffect } from 'react';

const MapThemeContext = createContext();

export const useMapTheme = () => {
  const context = useContext(MapThemeContext);
  if (!context) {
    throw new Error('useMapTheme must be used within a MapThemeProvider');
  }
  return context;
};

export const MapThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar si hay una preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('mapTheme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    localStorage.setItem('mapTheme', newTheme ? 'dark' : 'light');
    // Recargar la página para aplicar el cambio de tema
    window.location.reload();
  };

  useEffect(() => {
    // Aplicar la clase al body solo para el mapa
    if (isDarkMode) {
      document.body.classList.add('map-dark-mode');
    } else {
      document.body.classList.remove('map-dark-mode');
    }
  }, [isDarkMode]);

  return (
    <MapThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </MapThemeContext.Provider>
  );
};
