import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Crear instancia de axios para el backend
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token añadido a la petición:', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error en la respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado o inválido, limpiando localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // Manejar errores de red
    if (!error.response) {
      console.error('🌐 Error de red - Backend no disponible');
    }

    return Promise.reject(error);
  }
);

// Servicio principal de la API
class ApiService {
  // Verificar conexión con el backend
  async checkConnection() {
    try {
      console.log('🔍 Verificando conexión con el backend...');
      const response = await api.get('/health');
      console.log('✅ Backend conectado:', response.data);
      return { connected: true, data: response.data };
    } catch (error) {
      console.error('❌ Error de conexión con el backend:', error);
      return { 
        connected: false, 
        error: error.message,
        status: error.response?.status 
      };
    }
  }

  // Autenticación
  async login(credentials) {
    try {
      console.log('🔐 Iniciando sesión...');
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login exitoso');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('📝 Registrando usuario...');
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ Error en logout (continuando):', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Sesión cerrada');
    }
  }

  // Usuarios
  async getUsers(page = 1, limit = 10, search = '') {
    try {
      console.log('👥 Obteniendo usuarios...', { page, limit, search });
      const response = await api.get('/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }

  // Vehículos
  async getVehiculos(page = 1, limit = 10, search = '') {
    try {
      console.log('🚗 Obteniendo vehículos...', { page, limit, search });
      const response = await api.get('/vehiculos', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo vehículos:', error);
      throw error;
    }
  }

  async getVehiculoById(id) {
    try {
      const response = await api.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo vehículo:', error);
      throw error;
    }
  }

  async createVehiculo(vehiculoData) {
    try {
      const response = await api.post('/vehiculos', vehiculoData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando vehículo:', error);
      throw error;
    }
  }

  async updateVehiculo(id, vehiculoData) {
    try {
      const response = await api.put(`/vehiculos/${id}`, vehiculoData);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando vehículo:', error);
      throw error;
    }
  }

  async deleteVehiculo(id) {
    try {
      const response = await api.delete(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando vehículo:', error);
      throw error;
    }
  }

  // Tickets
  async getTickets(page = 1, limit = 10, search = '') {
    try {
      console.log('🎫 Obteniendo tickets...', { page, limit, search });
      const response = await api.get('/tickets', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo tickets:', error);
      throw error;
    }
  }

  async getTicketById(id) {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo ticket:', error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando ticket:', error);
      throw error;
    }
  }

  async updateTicket(id, ticketData) {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando ticket:', error);
      throw error;
    }
  }

  async deleteTicket(id) {
    try {
      const response = await api.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando ticket:', error);
      throw error;
    }
  }

  // Rutas
  async getRutas(page = 1, limit = 10, search = '') {
    try {
      console.log('🛣️ Obteniendo rutas...', { page, limit, search });
      const response = await api.get('/rutas', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo rutas:', error);
      throw error;
    }
  }

  async getRutaById(id) {
    try {
      const response = await api.get(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo ruta:', error);
      throw error;
    }
  }

  async createRuta(rutaData) {
    try {
      const response = await api.post('/rutas', rutaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando ruta:', error);
      throw error;
    }
  }

  async updateRuta(id, rutaData) {
    try {
      const response = await api.put(`/rutas/${id}`, rutaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando ruta:', error);
      throw error;
    }
  }

  async deleteRuta(id) {
    try {
      const response = await api.delete(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando ruta:', error);
      throw error;
    }
  }

  // Estadísticas del dashboard
  async getDashboardStats() {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      // Retornar datos mock si el backend no está disponible
      return this.getMockDashboardStats();
    }
  }

  // Datos mock para desarrollo
  getMockDashboardStats() {
    console.log('📊 Usando datos mock para el dashboard');
    return {
      totalUsers: 156,
      totalVehicles: 89,
      totalTickets: 234,
      totalRoutes: 45,
      recentTickets: [
        { id: 1, type: 'Repostaje', status: 'Completado', amount: 120, date: new Date().toISOString() },
        { id: 2, type: 'Mantenimiento', status: 'Pendiente', amount: 300, date: new Date().toISOString() },
        { id: 3, type: 'Limpieza', status: 'En Progreso', amount: 50, date: new Date().toISOString() }
      ],
      topRoutes: [
        { id: 1, name: 'Ruta Madrid-Barcelona', distance: 621, duration: 6.5, vehicles: 12 },
        { id: 2, name: 'Ruta Bilbao-San Sebastián', distance: 100, duration: 1.2, vehicles: 8 },
        { id: 3, name: 'Ruta Valencia-Alicante', distance: 166, duration: 1.8, vehicles: 6 }
      ]
    };
  }
}

// Exportar instancia única del servicio
export default new ApiService();
export { api };
