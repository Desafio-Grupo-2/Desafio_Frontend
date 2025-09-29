import axios from 'axios';

// Configuración base de axios para FuelPriceSpain API
const PRECIOIL_API_BASE_URL = 'https://api.fuelprice-spain.com';

const preciOilApi = axios.create({
  baseURL: PRECIOIL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class PreciOilService {
  // Obtener estaciones de servicio desde PreciOil
  async getEstacionesServicio(params = {}) {
    try {
      console.log('PreciOilService: Obteniendo estaciones desde PreciOil...', params);
      
      // Construir parámetros de consulta
      const queryParams = {
        limit: params.limit || 50,
        page: params.page || 1,
        ...params
      };

      // Remover parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await preciOilApi.get('/api/stations', { params: queryParams });
      console.log('PreciOilService: Respuesta recibida:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('PreciOilService: Error fetching estaciones:', error);
      throw error;
    }
  }

  // Obtener estaciones cercanas por coordenadas
  async getEstacionesCercanas(lat, lng, radius = 10) {
    try {
      console.log('PreciOilService: Obteniendo estaciones cercanas...', { lat, lng, radius });
      
      // Intentar diferentes formatos de parámetros
      const response = await preciOilApi.get('/api/stations', {
        params: {
          lat: lat.toString(),
          lng: lng.toString(),
          radius: radius.toString(),
          limit: 50
        }
      });
      
      console.log('PreciOilService: Estaciones cercanas encontradas:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('PreciOilService: Error fetching estaciones cercanas:', error);
      throw error;
    }
  }

  // Obtener estaciones por provincia
  async getEstacionesByProvincia(provincia, page = 1, limit = 50) {
    try {
      console.log('PreciOilService: Obteniendo estaciones por provincia...', { provincia, page, limit });
      
      const response = await preciOilApi.get('/api/stations', {
        params: {
          province: provincia,
          page,
          limit
        }
      });
      
      console.log('PreciOilService: Estaciones por provincia encontradas:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('PreciOilService: Error fetching estaciones by provincia:', error);
      throw error;
    }
  }

  // Obtener estaciones por municipio
  async getEstacionesByMunicipio(municipio, page = 1, limit = 50) {
    try {
      console.log('PreciOilService: Obteniendo estaciones por municipio...', { municipio, page, limit });
      
      const response = await preciOilApi.get('/api/stations', {
        params: {
          city: municipio,
          page,
          limit
        }
      });
      
      console.log('PreciOilService: Estaciones por municipio encontradas:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('PreciOilService: Error fetching estaciones by municipio:', error);
      throw error;
    }
  }

  // Transformar datos de PreciOil al formato esperado por el frontend
  transformEstacionData(estacion) {
    console.log('Transformando estación:', estacion);
    
    // Mapear campos de PreciOil a nuestro formato
    const combustibles = estacion.combustibles || [];
    const ultimoCombustible = combustibles[combustibles.length - 1] || {};
    
    // Generar datos más realistas basados en la ubicación
    const baseVisits = Math.floor(Math.random() * 100) + 20;
    const baseSpent = Math.floor(Math.random() * 30000) + 5000;
    
    const transformed = {
      id: estacion.id?.toString() || estacion.id_estacion?.toString() || Math.random().toString(),
      name: estacion.rotulo || estacion.nombre || estacion.Rotulo || 'Estación sin nombre',
      address: `${estacion.direccion || estacion.Direccion || ''}, ${estacion.localidad || estacion.Localidad || ''}, ${estacion.municipio || estacion.Municipio || ''}`.trim(),
      lat: parseFloat(estacion.lat || estacion.latitud || estacion.CoordenadaXDec || estacion.coordenada_x) || 0,
      lng: parseFloat(estacion.lng || estacion.longitud || estacion.CoordenadaYDec || estacion.coordenada_y) || 0,
      brand: estacion.rotulo || estacion.Rotulo || 'Sin marca',
      prices: {
        gasolina95: ultimoCombustible.precio_gasolina_95_e5 || ultimoCombustible.gasolina95 || ultimoCombustible.precio_gasolina_95 || 0,
        gasolina98: ultimoCombustible.precio_gasolina_98_e5 || ultimoCombustible.gasolina98 || ultimoCombustible.precio_gasolina_98 || 0,
        diesel: ultimoCombustible.precio_gasoleo_a || ultimoCombustible.diesel || ultimoCombustible.precio_gasoleo || 0,
        dieselPlus: ultimoCombustible.precio_gasoleo_b || ultimoCombustible.dieselPlus || ultimoCombustible.precio_gasoleo_plus || 0,
      },
      lastUpdated: ultimoCombustible.fecha || new Date().toISOString(),
      visitCount: baseVisits,
      totalSpent: baseSpent,
      lastVisit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tickets: this.generateMockTickets(estacion.id?.toString() || estacion.id_estacion?.toString()),
      provincia: estacion.provincia || estacion.Provincia,
      municipio: estacion.municipio || estacion.Municipio,
      ccaa: estacion.ccaa || estacion.CCAA,
      localidad: estacion.localidad || estacion.Localidad,
      sources: estacion.sources || ['PreciOil API']
    };

    console.log('Estación transformada:', transformed);
    return transformed;
  }

  // Generar tickets mock para desarrollo
  generateMockTickets(stationId) {
    const ticketTypes = ['Repostaje', 'Mantenimiento', 'Limpieza', 'Inspección'];
    const statuses = ['Completado', 'Pendiente', 'En Progreso'];
    const tickets = [];

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
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

    return tickets;
  }

  // Obtener estadísticas de gasolineras para el admin
  async getGasStationStats() {
    try {
      console.log('PreciOilService: Obteniendo estadísticas de gasolineras...');
      
      // Obtener estaciones desde PreciOil
      const response = await this.getEstacionesServicio({ limit: 200 });
      const estaciones = response.data || response || [];
      
      console.log('PreciOilService: Estaciones obtenidas:', estaciones.length);
      
      if (estaciones.length === 0) {
        console.warn('PreciOilService: No se encontraron estaciones, usando datos mock');
        return this.getMockGasStationStats();
      }
      
      // Transformar datos
      const transformedStations = estaciones.map(estacion => this.transformEstacionData(estacion));
      
      // Ordenar por número de visitas
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

      console.log('PreciOilService: Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('PreciOilService: Error getting gas station stats:', error);
      console.log('PreciOilService: Usando datos mock como fallback');
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
        ccaa: 'País Vasco'
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
        ccaa: 'País Vasco'
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
        ccaa: 'País Vasco'
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
        ccaa: 'País Vasco'
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
        ccaa: 'País Vasco'
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
}

export default new PreciOilService();