// ─────────────────── CONFIGURACIÓN DE LA API ───────────────────

// URL base del backend. Se cambia entre dotnet run o Docker
export const API_URL = "http://localhost:5230";
//export const API_URL = "http://localhost:8080";

// ─────────────────── CLIENTE HTTP ───────────────────

// Objeto con métodos reutilizables para peticiones al backend.
// credentials: "include" -> envía la cookie JWT automáticamente en cada petición

export const api = {
  get: (path) =>
    fetch(`${API_URL}${path}`, { credentials: "include" }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),

  post: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      if (!r.ok) throw new Error(`Error ${r.status}`);
      const ct = r.headers.get("content-type");

      if (ct && ct.includes("application/json")) return r.json();
      return null;
    }),

  put: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      if (!r.ok) throw new Error(`Error ${r.status}`);
      const ct = r.headers.get("content-type");

      if (ct && ct.includes("application/json")) return r.json();
      return null;
    }),

  delete: (path) =>
    fetch(`${API_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      if (!r.ok) throw new Error(`Error ${r.status}`);
      return r;
    }),

  uploadFile: (path, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_URL}${path}`, {
      method: "POST",
      credentials: "include",
      body: formData, // Sin cotent-type header, el browser lo pone
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      if (!r.ok) throw new Error(`Error ${r.status}`);
      return r.json();
    });
  },
};
