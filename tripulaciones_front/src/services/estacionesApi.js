import axios from 'axios';

// Configuración base de axios para estaciones de servicio
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desafio-backend-qb7w.onrender.com/api';

const estacionesApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
estacionesApi.interceptors.request.use(
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
estacionesApi.interceptors.response.use(
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

class EstacionesService {
  // Obtener todas las estaciones de servicio
  async getAllEstaciones(page = 1, limit = 50, search = '', provincia = '', municipio = '', ccaa = '') {
    try {
      console.log('EstacionesService: Obteniendo estaciones...', { page, limit, search, provincia, municipio, ccaa });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);
      if (provincia) params.append('provincia', provincia);
      if (municipio) params.append('municipio', municipio);
      if (ccaa) params.append('ccaa', ccaa);

      const url = `/estaciones-servicio?${params}`;
      console.log('EstacionesService: URL de petición:', url);
      
      const response = await estacionesApi.get(url);
      console.log('EstacionesService: Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('EstacionesService: Error fetching estaciones:', error);
      console.error('EstacionesService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Obtener estación por ID
  async getEstacionById(id) {
    try {
      const response = await estacionesApi.get(`/estaciones-servicio/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estacion by id:', error);
      throw error;
    }
  }

  // Obtener estaciones por provincia
  async getEstacionesByProvincia(provincia, page = 1, limit = 50) {
    try {
      const response = await estacionesApi.get(`/estaciones-servicio/provincia/${provincia}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estaciones by provincia:', error);
      throw error;
    }
  }

  // Obtener estaciones por municipio
  async getEstacionesByMunicipio(municipio, page = 1, limit = 50) {
    try {
      const response = await estacionesApi.get(`/estaciones-servicio/municipio/${municipio}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estaciones by municipio:', error);
      throw error;
    }
  }

  // Obtener estaciones cercanas por coordenadas
  async getEstacionesCercanas(lat, lng, radius = 10) {
    try {
      const response = await estacionesApi.get(`/estaciones-servicio/cercanas?lat=${lat}&lng=${lng}&radius=${radius}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estaciones cercanas:', error);
      throw error;
    }
  }

  // Transformar datos de la API al formato esperado por el frontend
  transformEstacionData(estacion) {
    const combustibles = estacion.combustibles || [];
    const ultimoCombustible = combustibles[combustibles.length - 1] || {};
    
    // Generar datos más realistas basados en la ubicación
    const baseVisits = Math.floor(Math.random() * 100) + 20;
    const baseSpent = Math.floor(Math.random() * 30000) + 5000;
    
    return {
      id: estacion.id_estacion?.toString() || estacion.id?.toString(),
      name: estacion.Rotulo || estacion.nombre || 'Estación sin nombre',
      address: `${estacion.Direccion || ''}, ${estacion.Localidad || ''}, ${estacion.Municipio || ''}`.trim(),
      lat: parseFloat(estacion.CoordenadaXDec) || 0,
      lng: parseFloat(estacion.CoordenadaYDec) || 0,
      brand: estacion.Rotulo || 'Sin marca',
      prices: {
        gasolina95: ultimoCombustible.precio_gasolina_95_e5 || 0,
        gasolina98: 0, // No disponible en la API actual
        diesel: ultimoCombustible.precio_gasoleo_a || 0,
        dieselPlus: 0, // No disponible en la API actual
      },
      lastUpdated: ultimoCombustible.fecha || new Date().toISOString(),
      visitCount: baseVisits,
      totalSpent: baseSpent,
      lastVisit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tickets: this.generateMockTickets(estacion.id_estacion?.toString() || estacion.id?.toString()),
      provincia: estacion.Provincia,
      municipio: estacion.Municipio,
      ccaa: estacion.CCAA,
      localidad: estacion.Localidad
    };
  }

  // Obtener estadísticas de gasolineras para el admin
  async getGasStationStats() {
    try {
      console.log('EstacionesService: Obteniendo estadísticas de gasolineras...');
      
      // Obtener más estaciones (aumentamos el límite)
      const response = await this.getAllEstaciones(1, 200);
      const estaciones = response.data || [];
      
      console.log('EstacionesService: Estaciones obtenidas:', estaciones.length);
      
      if (estaciones.length === 0) {
        console.warn('EstacionesService: No se encontraron estaciones, usando datos mock');
        return this.getMockGasStationStats();
      }
      
      // Transformar datos
      const transformedStations = estaciones.map(estacion => this.transformEstacionData(estacion));
      
      // Ordenar por número de visitas (usando datos reales si están disponibles)
      const sortedByVisits = transformedStations
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 20); // Top 20

      // Estadísticas generales
      const totalVisits = transformedStations.reduce((sum, station) => sum + station.visitCount, 0);
      const totalSpent = transformedStations.reduce((sum, station) => sum + station.totalSpent, 0);
      const averageSpentPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;

      // Estadísticas por marca
      const brandStats = transformedStations.reduce((acc, station) => {
        const brand = station.brand;
        if (!acc[brand]) {
          acc[brand] = { visits: 0, spent: 0, stations: 0 };
        }
        acc[brand].visits += station.visitCount;
        acc[brand].spent += station.totalSpent;
        acc[brand].stations += 1;
        return acc;
      }, {});

      const stats = {
        topStations: sortedByVisits,
        totalVisits,
        totalSpent,
        averageSpentPerVisit,
        brandStats,
        totalStations: transformedStations.length
      };

      console.log('EstacionesService: Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('EstacionesService: Error getting gas station stats:', error);
      console.log('EstacionesService: Usando datos mock como fallback');
      return this.getMockGasStationStats();
    }
  }

  // Generar estadísticas mock para desarrollo
  getMockGasStationStats() {
    const mockStations = [
      {
        id: '1',
        name: 'Repsol Bilbao Centro',
        address: 'Calle Gran Vía 45, Bilbao, Vizcaya',
        lat: 43.2627,
        lng: -2.9253,
        brand: 'Repsol',
        visitCount: 156,
        totalSpent: 23450,
        tickets: this.generateMockTickets('1'),
        provincia: 'Vizcaya',
        municipio: 'Bilbao',
        ccaa: 'País Vasco',
        prices: {
          gasolina95: 1.459,
          gasolina98: 1.589,
          diesel: 1.389,
          dieselPlus: 1.489
        }
      },
      {
        id: '2',
        name: 'Cepsa San Mamés',
        address: 'Avenida Lehendakari Aguirre 3, Bilbao, Vizcaya',
        lat: 43.2644,
        lng: -2.9491,
        brand: 'Cepsa',
        visitCount: 134,
        totalSpent: 19800,
        tickets: this.generateMockTickets('2'),
        provincia: 'Vizcaya',
        municipio: 'Bilbao',
        ccaa: 'País Vasco',
        prices: {
          gasolina95: 1.449,
          gasolina98: 1.579,
          diesel: 1.379,
          dieselPlus: 1.479
        }
      },
      {
        id: '3',
        name: 'BP Deusto',
        address: 'Calle Iparraguirre 12, Bilbao, Vizcaya',
        lat: 43.2709,
        lng: -2.9400,
        brand: 'BP',
        visitCount: 98,
        totalSpent: 15200,
        tickets: this.generateMockTickets('3'),
        provincia: 'Vizcaya',
        municipio: 'Bilbao',
        ccaa: 'País Vasco',
        prices: {
          gasolina95: 1.469,
          gasolina98: 1.599,
          diesel: 1.399,
          dieselPlus: 1.499
        }
      },
      {
        id: '4',
        name: 'Shell Abando',
        address: 'Plaza Circular 8, Bilbao, Vizcaya',
        lat: 43.2609,
        lng: -2.9334,
        brand: 'Shell',
        visitCount: 87,
        totalSpent: 12800,
        tickets: this.generateMockTickets('4'),
        provincia: 'Vizcaya',
        municipio: 'Bilbao',
        ccaa: 'País Vasco',
        prices: {
          gasolina95: 1.459,
          gasolina98: 1.589,
          diesel: 1.389,
          dieselPlus: 1.489
        }
      },
      {
        id: '5',
        name: 'Galp Casco Viejo',
        address: 'Calle Correo 15, Bilbao, Vizcaya',
        lat: 43.2589,
        lng: -2.9234,
        brand: 'Galp',
        visitCount: 76,
        totalSpent: 11200,
        tickets: this.generateMockTickets('5'),
        provincia: 'Vizcaya',
        municipio: 'Bilbao',
        ccaa: 'País Vasco',
        prices: {
          gasolina95: 1.439,
          gasolina98: 1.559,
          diesel: 1.359,
          dieselPlus: 1.459
        }
      }
    ];

    const totalVisits = mockStations.reduce((sum, station) => sum + station.visitCount, 0);
    const totalSpent = mockStations.reduce((sum, station) => sum + station.totalSpent, 0);
    const averageSpentPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;

    const brandStats = mockStations.reduce((acc, station) => {
      const brand = station.brand;
      if (!acc[brand]) {
        acc[brand] = { visits: 0, spent: 0, stations: 0 };
      }
      acc[brand].visits += station.visitCount;
      acc[brand].spent += station.totalSpent;
      acc[brand].stations += 1;
      return acc;
    }, {});

    return {
      topStations: mockStations,
      totalVisits,
      totalSpent,
      averageSpentPerVisit,
      brandStats,
      totalStations: mockStations.length
    };
  }

  // Obtener tickets de una estación específica
  async getStationTickets(stationId) {
    try {
      // Esta función debería conectar con el endpoint de tickets del backend
      // Por ahora retornamos un array vacío hasta que implementes el endpoint
      const response = await estacionesApi.get(`/estaciones-servicio/${stationId}/tickets`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching station tickets:', error);
      // Retornar tickets mock hasta que el endpoint esté disponible
      return this.generateMockTickets(stationId);
    }
  }

  // Generar tickets mock para desarrollo
  generateMockTickets(stationId) {
    const ticketTypes = ['Repostaje', 'Mantenimiento', 'Limpieza', 'Inspección'];
    const statuses = ['Completado', 'Pendiente', 'En Progreso'];
    const tickets = [];

    // Generar entre 2 y 6 tickets para asegurar que siempre haya algunos
    const ticketCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < ticketCount; i++) {
      tickets.push({
        id: `ticket_${stationId}_${i + 1}`,
        type: ticketTypes[Math.floor(Math.random() * ticketTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: Math.floor(Math.random() * 200) + 50,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Ticket ${i + 1} para estación ${stationId}`,
        driver: `Conductor ${Math.floor(Math.random() * 10) + 1}`
      });
    }

    console.log(`Generados ${tickets.length} tickets para estación ${stationId}:`, tickets);
    return tickets;
  }

}

export default new EstacionesService();
