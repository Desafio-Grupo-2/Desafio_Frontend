import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró, limpiar localStorage y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user,
          token
        };
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      throw new Error(message);
    }
  },

  // Logout
  logout: async () => {
    console.log('AuthService: Iniciando logout...');
    
    // Limpiar inmediatamente el localStorage para evitar bucles
    localStorage.clear();
    sessionStorage.clear();
    console.log('AuthService: Storage limpiado inmediatamente');
    
    try {
      // Llamar al endpoint de logout del backend con timeout
      console.log('AuthService: Llamando al endpoint de logout...');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      await Promise.race([
        api.post('/auth/logout'),
        timeoutPromise
      ]);
      
      console.log('AuthService: Logout en servidor exitoso');
    } catch (error) {
      // Incluso si falla, ya limpiamos el localStorage arriba
      console.warn('AuthService: Error o timeout en logout del servidor:', error.message);
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener perfil');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      throw new Error(message);
    }
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      throw new Error(message);
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      throw new Error(message);
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obtener token del localStorage
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;