// ─────────────────── CONFIGURACIÓN DE LA API ───────────────────

// URL base del backend. Se cambia entre dotnet run o Docker
export const API_URL = "http://localhost:5230";
// export const API_URL = "http://localhost:8080";


// ─────────────────── CLIENTE HTTP ───────────────────

// Objeto con métodos reutilizables para peticiones al backend.
// credentials: "include" -> envía la cookie JWT automáticamente en cada petición

export const api = {

  // GET: obtener datos
  get: (path) =>
    fetch(`${API_URL}${path}`, { credentials: "include" }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),

  // POST: crear un nuevo recurso (envía body en JSON)
  post: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),

  // PUT: actualizar un recurso existente (envía body en JSON)
  put: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),

  // DELETE: eliminar un recurso (no envía body)
  delete: (path) =>
    fetch(`${API_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r;
    }),
};