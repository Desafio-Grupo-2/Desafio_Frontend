import axios from 'axios';

// Configuración base de axios para vehículos
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';

const vehiculosApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
vehiculosApi.interceptors.request.use(
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
vehiculosApi.interceptors.response.use(
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

class VehiculosService {
  // Obtener todos los vehículos (solo admin)
  async getAllVehiculos(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);

      const url = `/vehiculos?${params}`;
      const response = await vehiculosApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos:', error);
      throw error;
    }
  }

  // Obtener vehículo por matrícula
  async getVehiculoByMatricula(matricula) {
    try {
      const response = await vehiculosApi.get(`/vehiculos/${matricula}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculo by matricula:', error);
      throw error;
    }
  }

  // Crear nuevo vehículo (solo admin)
  async createVehiculo(vehiculoData) {
    try {
      const response = await vehiculosApi.post('/vehiculos', vehiculoData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehiculo:', error);
      throw error;
    }
  }

  // Actualizar vehículo (solo admin)
  async updateVehiculo(matricula, vehiculoData) {
    try {
      const response = await vehiculosApi.put(`/vehiculos/${matricula}`, vehiculoData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehiculo:', error);
      throw error;
    }
  }

  // Eliminar vehículo (solo admin)
  async deleteVehiculo(matricula) {
    try {
      const response = await vehiculosApi.delete(`/vehiculos/${matricula}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehiculo:', error);
      throw error;
    }
  }

  // Obtener vehículos por usuario
  async getVehiculosByUsuario(usuarioId) {
    try {
      const response = await vehiculosApi.get(`/vehiculos/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos by usuario:', error);
      throw error;
    }
  }

  // Obtener vehículos por empresa
  async getVehiculosByEmpresa(empresaId, page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const url = `/vehiculos/empresa/${empresaId}?${params}`;
      const response = await vehiculosApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos by empresa:', error);
      throw error;
    }
  }

  // Obtener vehículos con costes reales
  async getVehiculosConCostesReales(empresaId) {
    try {
      const response = await vehiculosApi.get(`/vehiculos/empresa/${empresaId}/costes-reales`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos con costes reales:', error);
      throw error;
    }
  }
}

export default new VehiculosService();
