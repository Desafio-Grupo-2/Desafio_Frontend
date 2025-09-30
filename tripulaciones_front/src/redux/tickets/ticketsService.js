import axios from 'axios';

// Configuración base de axios para tickets
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';

const ticketsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
ticketsApi.interceptors.request.use(
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
ticketsApi.interceptors.response.use(
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

class TicketsService {
  // Obtener todos los tickets
  async getAllTickets(page = 1, limit = 100) {
    try {
      const response = await ticketsApi.get(`/tickets?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Obtener ticket por ID
  async getTicketById(id) {
    try {
      const response = await ticketsApi.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket by id:', error);
      throw error;
    }
  }

  // Obtener tickets por ruta
  async getTicketsByRuta(rutaId) {
    try {
      const response = await ticketsApi.get(`/tickets/ruta/${rutaId}`);
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching tickets by ruta:', error);
      throw error;
    }
  }

  // Obtener tickets por usuario
  async getTicketsByUsuario(usuarioId) {
    try {
      const response = await ticketsApi.get(`/tickets/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching tickets by usuario:', error);
      throw error;
    }
  }

  // Obtener suma total de tickets
  async getTotalTicketsSum() {
    try {
      const response = await ticketsApi.get('/tickets/sum');
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching total tickets sum:', error);
      throw error;
    }
  }

  // Obtener métricas de usuario
  async getUsuarioMetrics(usuarioId) {
    try {
      const response = await ticketsApi.get(`/tickets/metrics/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching usuario metrics:', error);
      throw error;
    }
  }

  // Obtener métricas de todos los empleados
  async getAllEmpleadosMetrics() {
    try {
      const response = await ticketsApi.get('/tickets/metrics/empleados');
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching empleados metrics:', error);
      throw error;
    }
  }

  // Obtener coordenadas de tickets para mapas
  async getTicketsCoordenadas() {
    try {
      const response = await ticketsApi.get('/tickets/coordenadas');
      return response.data;
    } catch (error) {
      console.error('TicketsService: Error fetching tickets coordenadas:', error);
      throw error;
    }
  }
}

export default new TicketsService();
