# Configuración del Frontend - Desafío Tripulaciones

## Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp env.example .env

# Edita el archivo .env con tu configuración
```

### 3. Variables de entorno disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL del backend API | `https://desafio-backend-qb7w.onrender.com/api` |

### 4. Configuraciones por entorno

#### Desarrollo Local
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Producción (Render)
```env
VITE_API_BASE_URL=https://desafio-backend-qb7w.onrender.com/api
```

## Scripts disponibles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build
npm run preview

# Linting
npm run lint
```

## Conexión con el Backend

El frontend está configurado para conectarse automáticamente al backend desplegado en Render:

- **Backend URL:** https://desafio-backend-qb7w.onrender.com/
- **API Documentation:** https://desafio-backend-qb7w.onrender.com/api-docs

### Endpoints principales:
- **Autenticación:** `/api/auth/*`
- **Usuarios:** `/api/users/*`
- **Vehículos:** `/api/vehiculos/*`
- **Rutas:** `/api/rutas/*`
- **Tickets:** `/api/tickets/*`

## Tecnologías utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool y dev server
- **Redux Toolkit** - Gestión de estado
- **Axios** - Cliente HTTP
- **React Router** - Navegación
- **Ant Design** - Componentes UI
- **Sass** - Estilos

## Notas importantes

1. **Variables de entorno:** Todas las variables deben empezar con `VITE_` para ser accesibles en el frontend
2. **CORS:** El backend está configurado para aceptar requests desde el frontend
3. **Autenticación:** Se usa JWT con almacenamiento en localStorage
4. **Interceptores:** Axios está configurado para manejar automáticamente tokens y errores

## Solución de problemas

### Error de CORS
Si encuentras errores de CORS, verifica que:
- El backend esté desplegado y funcionando
- La URL en `VITE_API_BASE_URL` sea correcta
- El backend tenga configurado CORS para tu dominio

### Error de autenticación
Si hay problemas con la autenticación:
- Verifica que el token se esté guardando en localStorage
- Comprueba que el backend esté devolviendo el token correctamente
- Revisa la consola del navegador para errores específicos
