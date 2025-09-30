import axios from 'axios';

// Configuración base de axios para rutas
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const rutasApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
rutasApi.interceptors.request.use(
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
rutasApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

class RutasService {
  // Obtener todas las rutas
  async getAllRutas(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);

      const url = `/rutas?${params}`;
      const response = await rutasApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching rutas:', error);
      throw error;
    }
  }

  // Obtener ruta por ID
  async getRutaById(rutaId) {
    try {
      const response = await rutasApi.get(`/rutas/${rutaId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ruta by id:', error);
      throw error;
    }
  }

  // Obtener rutas por vehículo
  async getRutasByVehiculo(matricula) {
    try {
      const response = await rutasApi.get(`/rutas/vehiculo/${matricula}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rutas by vehiculo:', error);
      throw error;
    }
  }

  // Crear nueva ruta
  async createRuta(rutaData) {
    try {
      const response = await rutasApi.post('/rutas', rutaData);
      return response.data;
    } catch (error) {
      console.error('Error creating ruta:', error);
      throw error;
    }
  }

  // Actualizar ruta
  async updateRuta(rutaId, rutaData) {
    try {
      const response = await rutasApi.put(`/rutas/${rutaId}`, rutaData);
      return response.data;
    } catch (error) {
      console.error('Error updating ruta:', error);
      throw error;
    }
  }

  // Eliminar ruta
  async deleteRuta(rutaId) {
    try {
      const response = await rutasApi.delete(`/rutas/${rutaId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ruta:', error);
      throw error;
    }
  }
}

export default new RutasService();
