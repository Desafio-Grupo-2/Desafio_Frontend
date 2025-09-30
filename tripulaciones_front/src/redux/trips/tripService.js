import axios from 'axios';

// Configuración base de axios para trips
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const tripsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
tripsApi.interceptors.request.use(
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
tripsApi.interceptors.response.use(
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

class TripsService {
  // Obtener todas las rutas (trips)
  async getAllTrips() {
    try {
      //console.log('TripsService: Obteniendo trips...');
      const response = await tripsApi.get('/rutas');
      //console.log('TripsService: Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error fetching trips:', error);
      throw error;
    }
  }

  // Obtener trip por ID
  async getTripById(tripId) {
    try {
      const response = await tripsApi.get(`/rutas/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error fetching trip by id:', error);
      throw error;
    }
  }

  // Obtener trips por vehículo
  async getTripsByVehiculo(matricula) {
    try {
      const response = await tripsApi.get(`/rutas/vehiculo/${matricula}`);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error fetching trips by vehiculo:', error);
      throw error;
    }
  }

  // Crear nuevo trip
  async createTrip(tripData) {
    try {
      //console.log('TripsService: Creando trip...', tripData);
      const response = await tripsApi.post('/rutas', tripData);
      //console.log('TripsService: Trip creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error creating trip:', error);
      throw error;
    }
  }

  // Actualizar trip
  async updateTrip(tripId, tripData) {
    try {
      //console.log('TripsService: Actualizando trip...', { tripId, tripData });
      const response = await tripsApi.put(`/rutas/${tripId}`, tripData);
      //console.log('TripsService: Trip actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error updating trip:', error);
      throw error;
    }
  }

  // Eliminar trip
  async deleteTrip(tripId) {
    try {
      //console.log('TripsService: Eliminando trip...', tripId);
      const response = await tripsApi.delete(`/rutas/${tripId}`);
      //console.log('TripsService: Trip eliminado:', response.data);
      return response.data;
    } catch (error) {
      console.error('TripsService: Error deleting trip:', error);
      throw error;
    }
  }
}

export default new TripsService();
