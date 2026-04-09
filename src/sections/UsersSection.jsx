import { useState, useEffect } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Btn from "../components/Btn";

// Muestra la tabla de usuarios y permite crear, editar y eliminar.
// `onUnauthorized` se llama si el backend responde 401 -> regresa al login.
export default function UsersSection({ onUnauthorized }) {

  // Lista de usuarios del backend
  const [users, setUsers] = useState([]);

  // Controla si el modal está abierto
  const [showForm, setShowForm] = useState(false);

  // Usuario que se está editando (null = modo crear)
  const [editing, setEditing] = useState(null);

  // Datos del formulario
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Carga la lista de usuarios desde el backend
  const load = () =>
    api.get("/api/user").then(setUsers).catch((e) => {
      if (e.message === "401") onUnauthorized();
    });

  useEffect(() => { load(); }, []);

  // Guarda: si hay un usuario en edición hace PUT, si no hace POST
  const save = async () => {
    try {
      if (editing) await api.put(`/api/user/${editing.id}`, { ...form, id: editing.id });
      else await api.post("/api/user", form);

      // Limpia el estado y recarga la tabla
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
    }
  };

  // Elimina un usuario por ID tras confirmación
  const del = async (id) => {
    if (confirm("¿Eliminar usuario?")) {
      try {
        await api.delete(`/api/user/${id}`);
        load();
      } catch (e) {
        if (e.message === "401") onUnauthorized();
      }
    }
  };

  // Precarga el formulario con los datos del usuario a editar y abre el modal
  const edit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "" });
    setShowForm(true);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Usuarios</h2>
        {/* Al hacer click limpia el formulario (modo crear) y abre el modal */}
        <Btn onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "" }); setShowForm(true); }}>
          + Nuevo
        </Btn>
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
                <Btn variant="secondary" className="btn--sm" style={{ marginRight: 6 }} onClick={() => edit(u)}>Editar</Btn>
                <Btn variant="danger" className="btn--sm" onClick={() => del(u.id)}>Eliminar</Btn>
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

      {/* Modal de crear/editar: solo se renderiza si showForm es true */}
      {showForm && (
        <Modal
          title={editing ? "Editar Usuario" : "Nuevo Usuario"}
          onClose={() => setShowForm(false)}
        >
          <Input label="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre Completo" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="correo@example.com" />
          {/* Solo pide contraseña al crear, no al editar */}
          {!editing && (
            <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          )}
          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}