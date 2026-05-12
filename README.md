

#  IncidentAPI — Frontend
 
Aplicación web desarrollada en **React** que consume la [IncidentAPI](https://github.com/Jhon-Zuluaga/IncidentAPI) para gestionar incidentes técnicos. Permite registrar, hacer seguimiento y resolver incidentes con soporte para usuarios, categorías, comentarios y archivos adjuntos.
 
---
 
##  Inicio rápido
 
```bash
git clone https://github.com/Jhon-Zuluaga/IncidentAPI-frontend.git
cd IncidentAPI-frontend
npm install
npm run dev
```
 
Asegúrate de tener el backend corriendo en `http://localhost:5230` antes de iniciar el frontend.
 
---
 
##  Requisitos
 
- Node.js 18+
- npm
- [IncidentAPI backend](github.com/Jhon-Zuluaga/IncidentAPI) corriendo localmente
---
 
##  Instalación
 
```bash
# 1. Clonar el repositorio
git clone https://github.com/Jhon-Zuluaga/IncidentAPI-frontend.git
cd IncidentAPI-frontend
 
# 2. Instalar dependencias
npm install
 
# 3. Correr en modo desarrollo
npm run dev
```
 
> Si el backend corre en un puerto diferente al `5230`, cambia la variable `API_URL` en `src/api/client.js`.
 
---
 
##  Características
 
###  Autenticación
- Login con email y contraseña
- Logout que elimina la sesión
- Recuperación de contraseña con token de 6 dígitos enviado al correo
- Redireccionamiento automático al login cuando el token expira (401)
###  Gestión de Incidentes
- Listado de todos los incidentes como tarjetas
- Crear nuevo incidente con título, descripción, estado, usuario y categoría
- Editar incidente existente
- Eliminar incidente con confirmación
- Control de estado visual: `Abierto`, `En Progreso`, `Cerrado` con colores mediante Badge
###  Archivos Adjuntos
- Subir un archivo al crear o editar un incidente (opcional)
- Ver los archivos adjuntos de un incidente desde el botón 📎 Archivos
- Abrir o descargar el archivo directamente en el navegador (PDF, imagen, txt)
- Subir archivos adicionales desde el modal de archivos
- Eliminar archivos con confirmación
- Mensaje informativo cuando el incidente no tiene archivos adjuntos
- Tipos permitidos: JPG, PNG, GIF, PDF, TXT — máx 5MB
###  Comentarios
- Ver comentarios de un incidente
- Agregar comentarios con autor y contenido
- Eliminar comentarios
###  Gestión de Usuarios
- Listado de usuarios
- Crear, editar y eliminar usuarios
###  Gestión de Categorías
- Listado de categorías
- Crear, editar y eliminar categorías
---
 
##  Arquitectura
 
```
src/
├── api/
│   └── client.js          → Cliente HTTP centralizado con todos los métodos
│                            (get, post, put, delete, uploadFile)
├── components/
│   ├── Badge.jsx           → Chip de color para el estado del incidente
│   ├── Btn.jsx             → Botón reutilizable con variantes (primary, secondary, danger)
│   ├── Input.jsx           → Campo de texto controlado
│   ├── Modal.jsx           → Contenedor modal reutilizable
│   ├── Select.jsx          → Selector desplegable controlado
│   └── Textarea.jsx        → Área de texto controlada
├── constants/
│   └── status.jsx          → Valores fijos de estados de incidente
├── pages/
│   └── LoginPage.jsx       → Página de login y recuperación de contraseña
├── sections/
│   ├── AttachmentsModal.jsx → Modal para ver, subir y eliminar archivos de un incidente
│   ├── CategoriesSection.jsx → CRUD de categorías
│   ├── CommentsModal.jsx    → Modal para ver y agregar comentarios de un incidente
│   ├── IncidentsSection.jsx → CRUD de incidentes con integración de modales
│   └── UsersSection.jsx    → CRUD de usuarios
├── App.css                 → Estilos globales
├── App.jsx                 → Componente raíz con navegación entre secciones
└── main.jsx                → Punto de entrada de la aplicación
```
 
**Flujo de navegación:**
 
```
LoginPage
    ↓ login exitoso → cookie JWT seteada por el backend
App.jsx  →  Incidentes / Usuarios / Categorías
                ↓
        IncidentsSection
            ↓           ↓           ↓
    CommentsModal  AttachmentsModal  Modal crear/editar
```
 
---
 
##  Integración con la API
 
Todas las peticiones al backend pasan por `src/api/client.js`, que centraliza la configuración:
 
```javascript
// Cambiar según el entorno
export const API_URL = "http://localhost:5230";
// export const API_URL = "http://localhost:8080"; // Docker
```
 
### Métodos disponibles
 
| Método | Uso | Content-Type |
|--------|-----|-------------|
| `api.get(path)` | Obtener datos | — |
| `api.post(path, body)` | Crear un recurso | `application/json` |
| `api.put(path, body)` | Actualizar un recurso | `application/json` |
| `api.delete(path)` | Eliminar un recurso | — |
| `api.uploadFile(path, file)` | Subir un archivo | `multipart/form-data` (automático) |
 
> Todos los métodos incluyen `credentials: "include"` para enviar la cookie JWT automáticamente. Si la API responde `401`, lanzan un `Error("401")` que los componentes capturan para redirigir al login.
 
### ¿Por qué `uploadFile` no usa JSON?
 
Los archivos binarios no se pueden serializar a JSON. `uploadFile` usa `FormData` con `multipart/form-data`, que es el estándar para transferir archivos. El `Content-Type` no se setea manualmente — el navegador lo genera automáticamente con el `boundary` correcto que el backend necesita para leer el archivo.
 
---
 
##  Autenticación JWT
 
El frontend **no maneja el token JWT directamente**. El flujo es:
 
```
1. Usuario hace login → POST /api/Auth/login
2. El backend genera el JWT y lo setea en una cookie HttpOnly
3. El navegador almacena la cookie automáticamente
4. Cada petición envía la cookie via credentials: "include"
5. Si el backend responde 401 → React redirige al login
6. Logout → POST /api/Auth/logout → cookie eliminada
```
 
La cookie es `HttpOnly`, lo que significa que JavaScript no puede leerla ni modificarla — protección contra XSS.
 
---
 
##  Construido con
 
- **React 18** — Librería de UI
- **Vite** — Bundler y servidor de desarrollo
- **Fetch API** — Peticiones HTTP nativas del navegador
- **CSS** — Estilos propios sin librerías externas
