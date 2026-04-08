import { useState, useEffect } from "react";
import "./App.css";


// URL CON DOTNET RUN 
const API_URL = "http://localhost:5230";

// URL CON DOCKER IMAGE
//const API_URL = "http://localhost:8080";

const api = {
  get: (path) =>
    fetch(`${API_URL}${path}`, { credentials: "include" }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),
  post: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ← enviar la cookie en cada petición
      body: JSON.stringify(body),
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r.json();
    }),
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
  delete: (path) =>
    fetch(`${API_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => {
      if (r.status === 401) throw new Error("401");
      return r;
    }),
};

const STATUS_CLASS = {
  abierto: "badge--abierto",
  "en progreso": "badge--en-progreso",
  cerrado: "badge--cerrado",
};

const STATUS_LABEL = {
  abierto: "Abierto",
  "en progreso": "En progreso",
  cerrado: "Cerrado",
};

// ─── COMPONENTES BASE ──────

function Badge({ status }){
  const key = status?.toLowerCase() || "abierto";
  return (
    <span className={`badge ${STATUS_CLASS[key] || "badge--abierto"}`}>
      {STATUS_LABEL[key] || "Abierto"}
    </span>
  );
}

function Modal({ title, onClose, children}){
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props}){
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <input className="field__input" {...props} />
    </div>
  );
}

function Select({ label, children, ...props}){
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <select className="field__select" {...props}>
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, ...props}){
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <textarea className="field__textarea" {...props} />
    </div>
  );
}

function Btn({ variant = "primary", className = "", children, ...props}){
  return (
    <button className={`btn btn--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── LOGIN PAGE ──────

function  LoginPage({ onLogin }){
  const [form, setForm] = useState({ email: "", password: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(form),
      });

      if(res.ok){
        onLogin();
      }else{
        setError("Credenciales inválidas. Verifica tu email y contraseña");
      }
    } catch  {
      setError("No se pudo conectar al servidor");
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card"> 
        <div className="login-brand">
            <span className="header__icon">⚡</span>
            <span className="header__title">IncidentAPI</span>
        </div>
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">Ingresa tus Crendenciales para continuar</p>

        {error && <div className="login-error"> {error} </div>}

        <Input 
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="correo@example.com"
        />

        <Input 
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <Btn className="btn--full" onClick={handleLogin} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Btn>
      </div>
    </div>
  );
}


// ─── USUARIOS ──────

function UsersSection({ onUnauthorized }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: ""});

  const load = () => api.get("/api/user").then(setUsers).catch((e) => {
    if(e.message === "401") onUnauthorized();
  });
  useEffect(() => { load(); }, []);

  const save = async () => {
   try {
     if(editing) await api.put(`/api/user/${editing.id}`, 
      { ...form, id: editing.id});
      else await api.post("/api/user", form);
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", email: ""});
      load();
   } catch (e) {
      if(e.message === "401")  onUnauthorized();
   }
  };

  const del = async (id) => {
    try {
      if(confirm("¿Eliminar usuario?")){
      await api.delete(`/api/user/${id}`);
      load();
    }
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };


const edit = (u) => {
  setEditing(u);
  setForm({ name: u.name, email: u.email});
  setShowForm(true);
};

return (
  <div>
    <div className="section-header">
      <h2 className="section-title">Usuarios</h2>
      <Btn onClick={() => {setEditing(null); setForm({name: "", email: ""}); 
      setShowForm(true);}}>+ Nuevo</Btn>
    </div>

    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <Btn variant="secondary" className="btn--sm" style={{ marginRight: 6}}
              onClick={() => edit(u)}>Editar</Btn>
              <Btn variant="danger" className="btn--sm" onClick={() =>del(u.id)}>Eliminar</Btn>
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr className="empty-row">
            <td colSpan={4}>Sin usuarios</td>
          </tr>
        )}
      </tbody>
    </table>

    {showForm && (
      <Modal
        title={editing ? "Editar Usuario" : "Nuevo Usuario"}
        onClose={() => setShowForm(false)}
      >
        <Input label="Nombre" value={form.name} onChange={(e) => 
          setForm((f) => ({ ...f, name: e.target.value}))} placeholder="Nombre Completo" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => 
          setForm((f) => ({ ...f, email: e.target.value}))} placeholder="correo@example.com"/>
        <div className="modal__actions">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={save}>Guardar</Btn>
        </div>
      </Modal>
    )}
  </div>
  );
}


// ─── CATEGORIAS ──────

function CategoriesSection({ onUnauthorized}) {
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: ""});

  const load = () => api.get("/api/category").then(setCats).catch((e) => {
    if(e.message === "401") onUnauthorized();
  });
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if(editing) await api.put(`/api/category/${editing.id}`, { ...form, id: editing.id});
      else await api.post("/api/category", form);
      setShowForm(false);
      setEditing(null);
      setForm({ name: ""})
      load();
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };

  const del = async (id) => {
    try {
      if(confirm("¿Eliminar categoría?")) {
      await api.delete(`/api/category/${id}`);
      load();
    }
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };

  const edit = (c) => {
    setEditing(c);
    setForm({ name: c.name});
    setShowForm(true);
  };

  return(
    <div>
      <div className="section-header">
        <h2 className="section-title">Categorías</h2>
        <Btn onClick={() =>{ setEditing(null); setForm({ name: ""}); setShowForm(true); }}>
          + Nueva
        </Btn>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>
                <Btn variant="secondary" className="btn--sm" style={{marginRight: 6}} 
                onClick={() => edit(c)}>Editar</Btn>
                <Btn variant="danger" className="btn--sm" onClick={() => del(c.id)}>Eliminar</Btn>
              </td>
            </tr>
          ))}
          {cats.length === 0 && (
            <tr className="empty-row">
              <td colSpan={3}>Sin categorías</td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <Modal
          title={editing ? "Editar Categoría" : "Nueva Categoría"}
          onClose={() => setShowForm(false)}
        >
          <Input label="Nombre" value={form.name} onChange={(e) => 
            setForm({ name: e.target.value})} placeholder="Nombre de la categoría" />
          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── INCIDENTES ────────────────────────────────────────────


function IncidentsSection ({ onUnauthorized }) {
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "abierto", userId: "", categoryId: "" });

  const load = () => {
    api.get("/api/incident").then(setIncidents).catch((e) => {if(e.message === "401") onUnauthorized(); });
    api.get("/api/user").then(setUsers).catch(() => {});
    api.get("/api/category").then(setCats).catch(() => {});
  };
  useEffect(() => {load (); }, []);

  const save = async () =>{
    try {
      const payload = { ...form, userId: parseInt(form.userId), categoryId: parseInt(form.categoryId)};
      if (editing) await api.put(`/api/incident/${editing.id}`, {...payload, id: editing.id});
      else await api.post("/api/incident", payload);
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", description: "", status: "abierto", userId: "", categoryId: ""});
      load();
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };

  const del = async (id) => {
    if(confirm("¿Eliminar incidente")){
      try {
        await api.delete(`/api/incident/${id}`);
        load();
      } catch (e) {
        if(e.message === "401") onUnauthorized(); 
      }
    }
  };

  const edit = (i) => {
    setEditing(i);
    setForm({ title: i.title, description: i.description, status: i.status, userId: i.userId, categoryId: i.categoryId});
    setShowForm(true);
  };

  return (
    <div>
      <div className="section-header">
         <h2 className="section-title">Incidentes</h2>
         <Btn onClick={() =>{ setEditing(null); setForm({ title: "", description: "", status: "abierto", userId: "", categoryId: ""}); setShowForm(true)}} >
          + Nuevo
          </Btn>
      </div>

      <div className="incidents-list">
        {incidents.map((i) => (
          <div key={i.id} className="incidents-card">
            <div className="incident-card__info">
              <div className="incident-card__title-row">
                <span className="incident-card__title">{i.title}</span>
                <Badge status={i.status}/>
              </div>
              <p className="incident-card__desc">{i.description || "Sin descripción"}</p>
              <p className="incident-card__meta">
                Usuario ID: {i.userId} · Categoría ID: {i.categoryId} · {new Date(i.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="incident-card__actions">
              <Btn variant="secondary" className="btn--sm" onClick={() => setSelected(i)}>Comentarios</Btn>
              <Btn variant="secondary" className="btn--sm" onClick={() => edit(i)}>Editar</Btn>
              <Btn variant="danger" className="btn--sm" onClick={() => del(i.id)}>Eliminar</Btn>
            </div>
          </div>
        ))}
        { incidents.length === 0 && (
          <div className="empty-state">Sin incidentes</div>
        )}
      </div>


      {showForm && (
        <Modal
          title={editing ? "Editar Incidente" : "Nuevo Incidente"}
          onClose={() => setShowForm(false)}
        >
          <Input label="Título" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del incidente" />
          <Textarea label="Descripción" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción del incidente" />
          <Select label="Estado" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="abierto">Abierto</option>
            <option value="en progreso">En Progreso</option>
            <option value="cerrado">Cerrado</option>
          </Select>
          <Select label="Usuario" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
            <option value="">Selecciona un usuario</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Select label="Categoría" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
            <option value="">Selecciona una categoría</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
      {selected && (
        <CommentsModal incident={selected} onClose={() => {setSelected(null); load(); }} onUnauthorized={onUnauthorized}/>
      )}
    </div>
  );
}


// ── COMENTARIOS ─────────────────────────────────────────── 

function CommentsModal({ incident, onClose, onUnauthorized}){
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ content: "", author: ""});

  const load = () => 
    api.get(`/api/comment/incident/${incident.id}`).then(setComments).catch((e) => {
      if(e.message === "401") onUnauthorized();
    });
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post("/api/comment", {...form, incidentId: incident.id});
      setForm({ content: "", author: ""});
      load();
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/api/comment/${id}`);
      load();
    } catch (e) {
      if(e.message === "401") onUnauthorized();
    }
  };

  return (
    <Modal title={`Comentarios - ${incident.title}`} onClose={onClose}>
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <p className="comment__content">{c.content}</p>
            <p className="comment__meta">
              {c.author} · {new Date(c.createdAt).toLocaleDateString()}
            </p>
            <button className="comment__delete" onClick={() => del(c.id)}>×</button>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="comments-empty">Sin comentarios aún</p>
        )}
      </div>
      <div className="comments-form">
        <Input label="Autor" value={form.author} onChange={(e) =>
          setForm((f) => ({ ...f, author: e.target.value}))} placeholder="Tu nombre" />
        <Textarea label="Comentario" value={form.content} onChange={(e) =>
          setForm((f) => ({ ...f, content: e.target.value}))} placeholder="Escribe tu comentario..."/>
        <Btn className="btn--full" onClick={save}>Agregar Comentario</Btn>
      </div>
    </Modal>
  );
}

// TABS ──────────────────────────────────────────────────

const TABS = [
  { id: "incidents", label: "🚨 Incidentes" },
  { id: "users", label: "👤 Usuarios" },
  { id: "categories", label: "🏷️ Categorías" },
]


// APP PRINCIPAL ─────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("incidents");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsLoggedIn(false);
  };

  const handleUnauthorized = () => setIsLoggedIn(false);

  if(!isLoggedIn){
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header__brand">
          <span className="header__icon">⚡</span>
          <span className="header__title">IncidentAPI</span>
          <span className="header_subtitle">Panel de control</span>
        </div>
        <div className="header__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "tab-btn--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Btn variant="secondary" className="btn--sm" style={{ marginLeft: 16}} onClick={handleLogout}>
            Cerrar Sesión
        </Btn>
      </div>

      <div className="content">
          <div className="card">
            {tab === "incidents" && <IncidentsSection onUnauthorized={handleUnauthorized}/>}
            {tab === "users" && <UsersSection onUnauthorized={handleUnauthorized}/>}
            {tab === "categories" && <CategoriesSection onUnauthorized={handleUnauthorized}/>}
          </div>
      </div>
    </div>
  );
}


