import axios from 'axios';

// Configuración base de axios para usuarios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';

const usersApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
usersApi.interceptors.request.use(
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
usersApi.interceptors.response.use(
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

class UsersService {
  // Obtener todos los usuarios (solo admin)
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);

      const url = `/users?${params}`;
      const response = await usersApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    try {
      const response = await usersApi.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by id:', error);
      throw error;
    }
  }

  // Crear nuevo usuario (solo admin)
  async createUser(userData) {
    try {
      const response = await usersApi.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Actualizar usuario (solo admin)
  async updateUser(userId, userData) {
    try {
      const response = await usersApi.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Eliminar usuario (solo admin)
  async deleteUser(userId) {
    try {
      const response = await usersApi.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Cambiar contraseña de usuario (solo admin)
  async changeUserPassword(userId, passwordData) {
    try {
      const response = await usersApi.post(`/users/${userId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing user password:', error);
      throw error;
    }
  }

  // Obtener usuarios por empresa
  async getUsersByEmpresa(empresaId, page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const url = `/users/empresa/${empresaId}?${params}`;
      const response = await usersApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by empresa:', error);
      throw error;
    }
  }
}

export default new UsersService();
