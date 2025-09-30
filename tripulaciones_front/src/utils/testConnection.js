import axios from 'axios';

// Función para probar la conexión con el backend
export const testBackendConnection = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';
  
  try {
    console.log('Probando conexión con el backend...');
    console.log('URL del backend:', API_BASE_URL);
    
    // Probar endpoint de health
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('Health check exitoso:', healthResponse.data);
    
    // Probar endpoint raíz de la API
    const apiResponse = await axios.get(API_BASE_URL.replace('/api', ''));
    console.log('API root exitoso:', apiResponse.data);
    
    return {
      success: true,
      health: healthResponse.data,
      api: apiResponse.data
    };
  } catch (error) {
    console.error('Error en la conexión con el backend:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.response?.statusText
    };
  }
};

// Función para probar autenticación
export const testAuthConnection = async (credentials) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';
  
  try {
    console.log('Probando autenticación...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    console.log('Autenticación exitosa:', response.data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.response?.statusText
    };
  }
};
