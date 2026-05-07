import { useState, useEffect } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Btn from "../components/Btn";

// Se abre desde IncidentsSection cuando el usuario hace click en "Comentarios".
// Recibe el incidente completo como prop para mostrar su título y cargar sus comentarios.
export default function CommentsModal({ incident, onClose, onUnauthorized }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ content: "", author: "" });

  // Carga los comentarios filtrados por incidente usando su id
  const load = () =>
    api
      .get(`/api/comment/incident/${incident.id}`)
      .then(setComments)
      .catch((e) => {
        if (e.message === "401") onUnauthorized();
      });

  useEffect(() => {
    load();
  }, []);

  // Agrega un nuevo comentario vinculado al incidente actual
  const save = async () => {
    try {
      await api.post("/api/comment", { ...form, incidentId: incident.id });
      setForm({ content: "", author: "" });
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/api/comment/${id}`);
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
    }
  };

  return (
    <Modal title={`Comentarios - ${incident.title}`} onClose={onClose}>
      {/* Lista de comentarios existentes */}
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <p className="comment__content">{c.content}</p>
            <p className="comment__meta">
              {c.author} · {new Date(c.createdAt).toLocaleDateString()}
            </p>
            <button className="comment__delete" onClick={() => del(c.id)}>
              ×
            </button>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="comments-empty">Sin comentarios aún</p>
        )}
      </div>

      {/* Formulario para agregar un comentario nuevo */}
      <div className="comments-form">
        <Input
          label="Autor"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          placeholder="Tu nombre"
        />
        <Textarea
          label="Comentario"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Escribe tu comentario..."
        />
        <Btn className="btn--full" onClick={save}>
          Agregar Comentario
        </Btn>
      </div>
    </Modal>
  );
}
