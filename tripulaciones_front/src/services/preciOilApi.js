// Servicio para la API de PreciOil
// Nota: Necesitarás obtener una API key de https://api.precioil.es/

const PRECIOIL_API_BASE_URL = 'https://api.precioil.es/v1';
const API_KEY = 'YOUR_API_KEY_HERE'; // Cambiar por tu API key real

class PreciOilService {
  constructor() {
    this.apiKey = API_KEY;
  }

  // Obtener gasolineras en un radio específico desde una ubicación
  async getGasStationsNearby(lat, lng, radius = 5000) {
    // Por ahora siempre usamos datos de ejemplo
    // Para usar la API real, configura tu API key y descomenta el código de abajo
    
    /*
    try {
      const response = await fetch(
        `${PRECIOIL_API_BASE_URL}/gas-stations?lat=${lat}&lng=${lng}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching gas stations:', error);
      return this.getMockData(lat, lng);
    }
    */
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getMockData(lat, lng);
  }

  // Obtener precios de una gasolinera específica
  async getGasStationPrices(stationId) {
    // Por ahora retornamos null ya que usamos datos de ejemplo
    // Para usar la API real, configura tu API key y descomenta el código de abajo
    
    /*
    try {
      const response = await fetch(
        `${PRECIOIL_API_BASE_URL}/gas-stations/${stationId}/prices`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching gas station prices:', error);
      return null;
    }
    */
    
    return null;
  }

  // Datos de ejemplo para desarrollo/testing
  getMockData(centerLat, centerLng) {
    const mockStations = [
      {
        id: '1',
        name: 'Repsol Casco Viejo',
        address: 'Calle Correo 12, Bilbao',
        lat: centerLat + 0.01,
        lng: centerLng + 0.01,
        brand: 'Repsol',
        prices: {
          gasolina95: 1.45,
          gasolina98: 1.55,
          diesel: 1.35,
          dieselPlus: 1.42
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 127,
        totalSpent: 15420.50,
        lastVisit: '2024-01-15T10:30:00Z',
        tickets: [
          { id: 'T001', vehicle: 'VH-001', amount: 45.20, date: '2024-01-15T10:30:00Z' },
          { id: 'T002', vehicle: 'VH-003', amount: 52.80, date: '2024-01-14T16:45:00Z' },
          { id: 'T003', vehicle: 'VH-005', amount: 38.90, date: '2024-01-13T09:15:00Z' }
        ]
      },
      {
        id: '2',
        name: 'Cepsa Deusto',
        address: 'Avenida Lehendakari Aguirre 45, Bilbao',
        lat: centerLat - 0.008,
        lng: centerLng + 0.012,
        brand: 'Cepsa',
        prices: {
          gasolina95: 1.42,
          gasolina98: 1.52,
          diesel: 1.32,
          dieselPlus: 1.38
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 89,
        totalSpent: 10890.30,
        lastVisit: '2024-01-14T14:20:00Z',
        tickets: [
          { id: 'T004', vehicle: 'VH-002', amount: 41.50, date: '2024-01-14T14:20:00Z' },
          { id: 'T005', vehicle: 'VH-004', amount: 47.30, date: '2024-01-13T11:30:00Z' }
        ]
      },
      {
        id: '3',
        name: 'BP Abando',
        address: 'Plaza Circular 8, Bilbao',
        lat: centerLat + 0.005,
        lng: centerLng - 0.015,
        brand: 'BP',
        prices: {
          gasolina95: 1.48,
          gasolina98: 1.58,
          diesel: 1.38,
          dieselPlus: 1.45
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 156,
        totalSpent: 18920.75,
        lastVisit: '2024-01-15T08:45:00Z',
        tickets: [
          { id: 'T006', vehicle: 'VH-001', amount: 43.20, date: '2024-01-15T08:45:00Z' },
          { id: 'T007', vehicle: 'VH-003', amount: 49.80, date: '2024-01-14T13:15:00Z' },
          { id: 'T008', vehicle: 'VH-006', amount: 55.40, date: '2024-01-13T15:30:00Z' },
          { id: 'T009', vehicle: 'VH-002', amount: 42.10, date: '2024-01-12T10:20:00Z' }
        ]
      },
      {
        id: '4',
        name: 'Shell Santutxu',
        address: 'Calle Zabalbide 23, Bilbao',
        lat: centerLat - 0.012,
        lng: centerLng - 0.008,
        brand: 'Shell',
        prices: {
          gasolina95: 1.50,
          gasolina98: 1.60,
          diesel: 1.40,
          dieselPlus: 1.47
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 73,
        totalSpent: 8920.40,
        lastVisit: '2024-01-13T17:10:00Z',
        tickets: [
          { id: 'T010', vehicle: 'VH-004', amount: 44.60, date: '2024-01-13T17:10:00Z' },
          { id: 'T011', vehicle: 'VH-005', amount: 39.80, date: '2024-01-12T12:45:00Z' }
        ]
      },
      {
        id: '5',
        name: 'Repsol Zorrotza',
        address: 'Carretera de Santander 156, Bilbao',
        lat: centerLat + 0.015,
        lng: centerLng - 0.02,
        brand: 'Repsol',
        prices: {
          gasolina95: 1.43,
          gasolina98: 1.53,
          diesel: 1.33,
          dieselPlus: 1.40
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 201,
        totalSpent: 24560.80,
        lastVisit: '2024-01-15T12:30:00Z',
        tickets: [
          { id: 'T012', vehicle: 'VH-001', amount: 46.70, date: '2024-01-15T12:30:00Z' },
          { id: 'T013', vehicle: 'VH-002', amount: 51.20, date: '2024-01-14T09:45:00Z' },
          { id: 'T014', vehicle: 'VH-003', amount: 48.90, date: '2024-01-13T16:20:00Z' },
          { id: 'T015', vehicle: 'VH-004', amount: 44.30, date: '2024-01-12T11:15:00Z' },
          { id: 'T016', vehicle: 'VH-005', amount: 50.60, date: '2024-01-11T14:30:00Z' }
        ]
      },
      {
        id: '6',
        name: 'Cepsa Zorrotzaurre',
        address: 'Polígono Industrial Zorrotzaurre, Bilbao',
        lat: centerLat - 0.02,
        lng: centerLng + 0.005,
        brand: 'Cepsa',
        prices: {
          gasolina95: 1.40,
          gasolina98: 1.50,
          diesel: 1.30,
          dieselPlus: 1.37
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 94,
        totalSpent: 11250.60,
        lastVisit: '2024-01-14T18:00:00Z',
        tickets: [
          { id: 'T017', vehicle: 'VH-006', amount: 47.80, date: '2024-01-14T18:00:00Z' },
          { id: 'T018', vehicle: 'VH-001', amount: 43.50, date: '2024-01-13T08:30:00Z' },
          { id: 'T019', vehicle: 'VH-003', amount: 49.20, date: '2024-01-12T15:45:00Z' }
        ]
      },
      {
        id: '7',
        name: 'BP Aeropuerto',
        address: 'Terminal Loiu, Bilbao',
        lat: centerLat + 0.025,
        lng: centerLng + 0.018,
        brand: 'BP',
        prices: {
          gasolina95: 1.52,
          gasolina98: 1.62,
          diesel: 1.42,
          dieselPlus: 1.49
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 45,
        totalSpent: 5420.30,
        lastVisit: '2024-01-12T20:15:00Z',
        tickets: [
          { id: 'T020', vehicle: 'VH-002', amount: 52.40, date: '2024-01-12T20:15:00Z' },
          { id: 'T021', vehicle: 'VH-004', amount: 48.90, date: '2024-01-11T16:30:00Z' }
        ]
      },
      {
        id: '8',
        name: 'Shell Universidad',
        address: 'Campus de Leioa, Bilbao',
        lat: centerLat - 0.005,
        lng: centerLng - 0.025,
        brand: 'Shell',
        prices: {
          gasolina95: 1.47,
          gasolina98: 1.57,
          diesel: 1.37,
          dieselPlus: 1.44
        },
        lastUpdated: new Date().toISOString(),
        visitCount: 67,
        totalSpent: 7890.20,
        lastVisit: '2024-01-13T19:30:00Z',
        tickets: [
          { id: 'T022', vehicle: 'VH-005', amount: 45.60, date: '2024-01-13T19:30:00Z' },
          { id: 'T023', vehicle: 'VH-006', amount: 41.80, date: '2024-01-12T13:20:00Z' }
        ]
      }
    ];

    return {
      stations: mockStations,
      total: mockStations.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Formatear precio para mostrar
  formatPrice(price) {
    if (!price) return 'N/A';
    return `€${price.toFixed(3)}`;
  }

  // Obtener el precio más bajo de un tipo de combustible
  getLowestPrice(stations, fuelType) {
    const validPrices = stations
      .map(station => station.prices[fuelType])
      .filter(price => price && price > 0);
    
    if (validPrices.length === 0) return null;
    
    return Math.min(...validPrices);
  }

  // Obtener estadísticas de gasolineras para el admin
  getGasStationStats() {
    const allStations = this.getAllStations();
    
    // Ordenar por número de visitas
    const sortedByVisits = allStations
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 10); // Top 10

    // Estadísticas generales
    const totalVisits = allStations.reduce((sum, station) => sum + station.visitCount, 0);
    const totalSpent = allStations.reduce((sum, station) => sum + station.totalSpent, 0);
    const averageSpentPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;

    // Estadísticas por marca
    const brandStats = allStations.reduce((acc, station) => {
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
      topStations: sortedByVisits,
      totalVisits,
      totalSpent,
      averageSpentPerVisit,
      brandStats,
      totalStations: allStations.length
    };
  }

  // Obtener todas las gasolineras (para estadísticas)
  getAllStations() {
    // En un caso real, esto vendría de una base de datos
    // Por ahora usamos datos de ejemplo centrados en Bilbao
    const bilbaoLat = 43.26271;
    const bilbaoLng = -2.92528;
    return this.getMockData(bilbaoLat, bilbaoLng).stations;
  }

  // Obtener tickets de una gasolinera específica
  getStationTickets(stationId) {
    const allStations = this.getAllStations();
    const station = allStations.find(s => s.id === stationId);
    return station ? station.tickets : [];
  }

  // Obtener tickets de todos los vehículos
  getAllTickets() {
    const allStations = this.getAllStations();
    const allTickets = [];
    
    allStations.forEach(station => {
      station.tickets.forEach(ticket => {
        allTickets.push({
          ...ticket,
          stationName: station.name,
          stationBrand: station.brand,
          stationAddress: station.address
        });
      });
    });

    return allTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

export default new PreciOilService();
