import { useState, useEffect } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Btn from "../components/Btn";

// Gestiona las categorías que se usan para clasificar incidentes.
// Igual que UsersSection pero más simple: solo maneja el campo "name".
export default function CategoriesSection({ onUnauthorized }) {
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "" });

  const load = () =>
    api.get("/api/category").then(setCats).catch((e) => {
      if (e.message === "401") onUnauthorized();
    });

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/api/category/${editing.id}`, { ...form, id: editing.id });
      else await api.post("/api/category", form);
      setShowForm(false);
      setEditing(null);
      setForm({ name: "" });
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
    }
  };

  const del = async (id) => {
    if (confirm("¿Eliminar categoría?")) {
      try {
        await api.delete(`/api/category/${id}`);
        load();
      } catch (e) {
        if (e.message === "401") onUnauthorized();
      }
    }
  };

  const edit = (c) => {
    setEditing(c);
    setForm({ name: c.name });
    setShowForm(true);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Categorías</h2>
        <Btn onClick={() => { setEditing(null); setForm({ name: "" }); setShowForm(true); }}>
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
                <Btn variant="secondary" className="btn--sm" style={{ marginRight: 6 }} onClick={() => edit(c)}>Editar</Btn>
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
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Nombre de la categoría" />
          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}