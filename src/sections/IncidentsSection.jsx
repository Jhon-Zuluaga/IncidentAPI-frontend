import { useState, useEffect } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import CommentsModal from "./CommentsModal";
import AttachmentsModal from "./AttachmentsModal";

// Gestiona incidentes. Carga tambien usuarios y categorias
// para mostrarlos en los selects del formulario.
// Delega logica de comentarios a CommentsModal y logica de archivos a AttachmentsModal.

export default function IncidentsSection({ onUnauthorized }) {

  // Lista de Incidentes que se muestran en pantalla
  const [incidents, setIncidents] = useState([]);

  // Para el select de asignar usuario 
  const [users, setUsers] = useState([]);

  // Para el select de asignar categoría
  const [cats, setCats] = useState([]);

  // Controla si el modal de crear/editar incidente está abierto
  const [showForm, setShowForm] = useState(false);

  // Si esta editando, guarda el incidente original, Si es null, esta creando
  const [editing, setEditing] = useState(null);

  // Incidente seleccionado para ver sus comentarios
  const [selected, setSelected] = useState(null);

  // Archivo seleccionado en el input del formulario de crear/Editar
  const [selectedFile, setSelectedFile] = useState(null);

  // Incidente seleccionado para ver sus archivos adjuntos
  const [viewingAttachments, setViewingAttachments] = useState(null);

  // Estado del formulario de incidente
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "abierto",
    userId: "",
    categoryId: "",
  });

  // Carga incidentes, usuarios y categorias en paralelo.
  // Si la API devuelve 401, redirige al login onAunathorized
  const load = () => {
    api.get("/api/incident")
      .then(setIncidents)
      .catch((e) => { if (e.message === "401") onUnauthorized(); });
    api.get("/api/user").then(setUsers).catch(() => {});
    api.get("/api/category").then(setCats).catch(() => {});
  };

  // Se ejecuta una sola vez al montar el componente 
  useEffect(() => { load(); }, []);

  // Crea o edita un incidente si 'editing0 tiene valor o no'.
  // Si hay archivo seleccionado, lo sube después de guardar el incidente.
  const save = async () => {
    // Validaciones basicas antes de llamar a la API
    if (!form.title.trim()) return alert("El título es obligatorio");
    if (!form.userId) return alert("Debes seleccionar un usuario");
    if (!form.categoryId) return alert("Debes seleccionar una categoría");
    
    try {
      // Convierte UserID y cateogryID a numero porque vienen del select como string
      const payload = {
        ...form,
        userId: parseInt(form.userId),
        categoryId: parseInt(form.categoryId),
      };

      let incident;
      if (editing) {
        // PUT - Actualiza el incidente existente
        await api.put(`/api/incident/${editing.id}`, { ...payload, id: editing.id });
        incident = { id: editing.id };
      } else {
        // POST - Crea un nuevo incidente y guarda la respueta para obtener su id
        incident = await api.post("/api/incident", payload);
      }

      // Si el usuario selecciono un archivo, lo sube asociado al incidente recien creado/Editado
      // Se hace despues del save para tener el id del incidente disponible 
      if (selectedFile && incident?.id) {
        try {
          await api.uploadFile(`/api/attachment/incident/${incident.id}`, selectedFile);
        } catch {
          // EL incidente ya se guardo, solo el archivo falló
          alert("Incidente guardado pero hubo un error al subir el archivo.");
        }
      }

      // Cierra el modal y limpia formulario
      setShowForm(false);
      setEditing(null);
      setSelectedFile(null);
      setForm({ title: "", description: "", status: "abierto", userId: "", categoryId: "" });

      // Recarga lista para reflejar el nuevo incidente o los cambios
      load();
    } catch (e) {
      if (e.message === "401") onUnauthorized();
      else console.error("Error al guardar:", e);
    }
  };

  // Elimina un incidente por su id despues de su confirmacion del usuario
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

  // Prepara el formulario con los datos del incidente a editar y abre el modal
  const edit = (i) => {
    setEditing(i);
    setSelectedFile(null); // Limpia cualquier archivo previo al editar
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

        {/* Boton para abrir el modal de creacion limpio */}
        <Btn onClick={() => {
          setEditing(null);
          setSelectedFile(null);
          setForm({ title: "", description: "", status: "abierto", userId: "", categoryId: "" });
          setShowForm(true);
        }}>
          + Nuevo
        </Btn>
      </div>

      {/* Lista de incidentes como tarjetas */}
      <div className="incidents-list">
        {incidents.map((i) => (
          <div key={i.id} className="incidents-card">
            <div className="incident-card__info">
              <div className="incident-card__title-row">
                <span className="incident-card__title">{i.title}</span>
                {/* Badge colorea el estado: abierto, en_progreso, cerrado */}
                <Badge status={i.status} />
              </div>
              <p className="incident-card__desc">{i.description || "Sin descripción"}</p>
              <p className="incident-card__meta">
                Usuario ID: {i.userId} · Categoría ID: {i.categoryId} ·{" "}
                {new Date(i.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="incident-card__actions">
              {/* Abre CommentsModal pasando el incidente seleccionado */}
              <Btn variant="secondary" className="btn--sm" onClick={() => setSelected(i)}>
                Comentarios
              </Btn>

              {/* Abre AttachmentsModal pasando el incidente completo */}
              <Btn variant="secondary" className="btn--sm" onClick={() => setViewingAttachments(i)}>
                📎 Archivos
              </Btn>

              {/* Carga los datos del incidente en el formulario y abre el modal*/}
              <Btn variant="secondary" className="btn--sm" onClick={() => edit(i)}>
                Editar
              </Btn>

              {/* Elimina el incidente tras confirmacion del usuario */}
              <Btn variant="danger" className="btn--sm" onClick={() => del(i.id)}>
                Eliminar
              </Btn>
            </div>
          </div>
        ))}

        {/* Mensaje cuando no hay incidentes */}
        {incidents.length === 0 && <div className="empty-state">Sin incidentes</div>}
      </div>

      {/* Modal de crear/editar - solo se monta cuando showform en true */}
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
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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

          {/* Select dinamico: Opciones vienen del array users cargado del backend */}
          <Select
            label="Usuario"
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
          {/* Select dinamico: Opciones vienen del array cats cargado del backend */}
          <Select
            label="Categoría"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Selecciona una categoría</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          
          {/* Input nativo de archivo - no usa el componente input porque necesita type=File */}
          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "14px" }}>
              Archivo adjunto{" "}
              <span style={{ fontWeight: 400, color: "#888", fontSize: "12px" }}>
                (opcional · jpg, png, gif, pdf, txt · máx 5MB)
              </span>
            </label>

            {/* Al cambiar el archivo, guarda el objeto File en selectedFile */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              style={{ fontSize: "13px" }}
            />

            {/* Confirmacion visual del archivo seleccionado */}
            {selectedFile && (
              <p style={{ marginTop: "4px", fontSize: "12px", color: "#555" }}>
                ✅ {selectedFile.name}
              </p>
            )}
          </div>

          <div className="modal__actions">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal de archivos, solo se monta cuando hay un incidente seleccionado
          Toda la logica de archivos vive dentro de AttachmentModal */}
      {viewingAttachments && (
        <AttachmentsModal
          incident={viewingAttachments}
          onClose={() => setViewingAttachments(null)}
          onUnauthorized={onUnauthorized}
        />
      )}

      {/* Modal de comentarios, solo se monta cuando hay un incidente seleccioando
          Toda la logica de comentarios vive dentro de CommentsModal */}
      {selected && (
        <CommentsModal
          incident={selected}
          onClose={() => { setSelected(null); load(); }}
          onUnauthorized={onUnauthorized}
        />
      )}
    </div>
  );
}