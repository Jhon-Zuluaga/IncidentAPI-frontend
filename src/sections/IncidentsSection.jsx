import { useState, useEffect } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import CommentsModal from "./CommentsModal";

// Gestiona incidentes. Carga también usuarios y categorías
// para mostrarlos en los selects del formulario.
export default function IncidentsSection({ onUnauthorized }) {
  const [incidents, setIncidents] = useState([]);

  // Para el select de "asignar usuario"
  const [users, setUsers] = useState([]);

  // Para el select de "categoría"
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Incidente seleccionado para ver sus comentarios
  const [selected, setSelected] = useState(null);

  // Estado del formulario de incidente
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "abierto",
    userId: "",
    categoryId: "",
  });

  // Carga incidentes, usuarios y categorías en paralelo
  const load = () => {
    api
      .get("/api/incident")
      .then(setIncidents)
      .catch((e) => {
        if (e.message === "401") onUnauthorized();
      });
    api
      .get("/api/user")
      .then(setUsers)
      .catch(() => {});
    api
      .get("/api/category")
      .then(setCats)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.title.trim()) return alert("El título es obligatorio");
    if (!form.userId) return alert("Debes seleccionar un usuario");
    if (!form.categoryId) return alert("Debes seleccionar una categoría");

    try {
      const payload = {
        ...form,
        userId: parseInt(form.userId),
        categoryId: parseInt(form.categoryId),
      };

      if (editing)
        await api.put(`/api/incident/${editing.id}`, {
          ...payload,
          id: editing.id,
        });
      else await api.post("/api/incident", payload);

      setShowForm(false);
      setEditing(null);
      setForm({
        title: "",
        description: "",
        status: "abierto",
        userId: "",
        categoryId: "",
      });
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
      else console.error("Error al guardar:", e);
    }
  };

  const del = async (id) => {
    if (confirm("¿Eliminar incidente?")) {
      try {
        await api.delete(`/api/incident/${id}`);
        load();
      } catch (e) {
        if (e.message === "401") onUnauthorized();
      }
    }
  };

  const edit = (i) => {
    setEditing(i);
    setForm({
      title: i.title,
      description: i.description,
      status: i.status,
      userId: i.userId,
      categoryId: i.categoryId,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Incidentes</h2>
        <Btn
          onClick={() => {
            setEditing(null);
            setForm({
              title: "",
              description: "",
              status: "abierto",
              userId: "",
              categoryId: "",
            });
            setShowForm(true);
          }}
        >
          + Nuevo
        </Btn>
      </div>

      {/* Los incidentes se muestran como tarjetas, no como tabla */}
      <div className="incidents-list">
        {incidents.map((i) => (
          <div key={i.id} className="incidents-card">
            <div className="incident-card__info">
              <div className="incident-card__title-row">
                <span className="incident-card__title">{i.title}</span>
                <Badge status={i.status} />
              </div>
              <p className="incident-card__desc">
                {i.description || "Sin descripción"}
              </p>
              <p className="incident-card__meta">
                Usuario ID: {i.userId} · Categoría ID: {i.categoryId} ·{" "}
                {new Date(i.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="incident-card__actions">
              {/* Al hacer click en Comentarios, guarda el incidente en `selected` */}
              <Btn
                variant="secondary"
                className="btn--sm"
                onClick={() => setSelected(i)}
              >
                Comentarios
              </Btn>
              <Btn
                variant="secondary"
                className="btn--sm"
                onClick={() => edit(i)}
              >
                Editar
              </Btn>
              <Btn
                variant="danger"
                className="btn--sm"
                onClick={() => del(i.id)}
              >
                Eliminar
              </Btn>
            </div>
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="empty-state">Sin incidentes</div>
        )}
      </div>

      {showForm && (
        <Modal
          title={editing ? "Editar Incidente" : "Nuevo Incidente"}
          onClose={() => setShowForm(false)}
        >
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Título del incidente"
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Descripción del incidente"
          />

          {/* Select de estado: valores fijos definidos en el backend */}
          <Select
            label="Estado"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="cerrado">Cerrado</option>
          </Select>

          {/* Select dinámico: opciones vienen del array `users` cargado del backend */}
          <Select
            label="Usuario"
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>

          {/* Select dinámico: opciones vienen del array `cats` cargado del backend */}
          <Select
            label="Categoría"
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }
          >
            <option value="">Selecciona una categoría</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal de comentarios: solo se monta cuando hay un incidente seleccionado */}
      {selected && (
        <CommentsModal
          incident={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
          onUnauthorized={onUnauthorized}
        />
      )}
    </div>
  );
}
