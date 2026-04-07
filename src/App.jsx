import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8080";

const api = {
  get: (path) => fetch(`${API_URL}${path}`).then((r) => r.json()),
  post: (path, body) => 
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  put: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (path) => fetch(`${API_URL}${path}`, { method: "DELETE"}),
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

// ─── USUARIOS ──────

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: ""});

  const load = () => api.get("/api/user").then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if(editing) await api.put(`/api/user/${editing.id}`, 
      { ...form, id: editing.id});
    else await api.post("/api/user", form);
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", email: ""});
    load();
  };

  const del = async (id) => {
    if(confirm("¿Eliminar usuario?")){
      await api.delete(`/api/user/${id}`);
      load();
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
              <Btn variant="senconday" className="btn--sn" style={{ marginRight: 6}}
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

function CategoriesSection() {
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: ""});

  const load = () => api.get("/api/category").then(setCats).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if(editing) await api.put(`/api/category/${editing.id}`, { ...form, id: editing.id});
    else await api.post("/api/category", form);
    setShowForm(false);
    setEditing(null);
    setForm({ name: ""})
    load();
  };

  const del = async (id) => {
    if(confirm("¿Eliminar categoría?")) {
      await api.delete(`/api/category/${id}`);
      load();
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


function IncidentsSection () {
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "abierto", userId: "", categoryId: "" });

  const load = () => {
    api.get("/api/incident").then(setIncidents).catch(() => {});
    api.get("/api/user").then(setUsers).catch(() => {});
    api.get("/api/category").then(setCats).catch(() => {});
  };
  useEffect(() => {load (); }, []);

  const save = async () =>{
    const payload = { ...form, userId: parseInt(form.userId), categoryId: parseInt(form.categoryId)};
    if (editing) await api.put(`/api/incident/${editing.id}`, {...payload, id: editing.id});
    else await api.post("/api/incident", payload);
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", description: "", status: "abierto", userId: "", categoryId: ""});
    load();
  };

  const del = async (id) => {
    if(confirm("¿Eliminar incidente")){
      await api.delete(`/api/incident/${id}`);
      load();
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
        <CommentsModal incident={selected} onClose={() => {setSelected(null); load(); }} />
      )}
    </div>
  );
}


// ── COMENTARIOS ─────────────────────────────────────────── 

function CommentsModal({ incident, onClose}){
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ content: "", author: ""});

  const load = () => api.get(`/api/comment/incident/${incident.id}`).then(setComments).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post("/api/comment", {...form, incidentId: incident.id});
    setForm({ content: "", author: ""});
    load();
  };

  const del = async (id) => {
    await api.delete(`/api/comment/${id}`);
    load();
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
      </div>

      <div className="content">
          <div className="card">
            {tab === "incidents" && <IncidentsSection />}
            {tab === "users" && <UsersSection/>}
            {tab === "categories" && <CategoriesSection />}
          </div>
      </div>
    </div>
  );
}


