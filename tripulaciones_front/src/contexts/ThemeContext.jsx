import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Siempre iniciar en modo claro por defecto
    return false;
  });

  const toggleTheme = () => {
    if (!isDarkMode) {
      // Si está en modo claro, cambiar a oscuro y refrescar
      localStorage.setItem('theme', 'dark');
      window.location.reload();
    } else {
      // Si está en modo oscuro, cambiar a claro y refrescar
      localStorage.setItem('theme', 'light');
      window.location.reload();
    }
  };

  useEffect(() => {
    // Verificar si hay una preferencia guardada en localStorage al cargar
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    
    // Aplicar la clase al body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
