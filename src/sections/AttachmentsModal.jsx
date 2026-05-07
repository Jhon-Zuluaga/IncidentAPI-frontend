import { useState, useEffect } from "react";
import { api, API_URL } from "../api/client";
import Modal from "../components/Modal";
import Btn from "../components/Btn";

// Se abre desde IncidentsSection cuando el usuario hace click en "Archivos".
// Recibe el incidente completo como prop para mostrar su título y cargar sus archivos.
// Maneja toda la logica de archivos: listar, subir, ver y editar
export default function AttachmentsModal({
  incident,
  onClose,
  onUnauthorized,
}) {

  // Lista de archivos adjuntos del incidente
  const [attachments, setAttachments] = useState([]);

  // Archivo seleccionado en el input para subir
  const [selectedFile, setSelectedFile] = useState(null);

  // Controla el estado de carga mientras se sube un archivo
  const [uploading, setUploading] = useState(false);

  // Carga los archivos del Incidente desde la API
  // Si la respuesta no es un array (ejempl: "no hay archivos")
  // setea un array vacio para que el .map() no falle
  const load = () =>
    api
      .get(`/api/attachment/incident/${incident.id}`)
      .then((data) => setAttachments(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e.message === "401") onUnauthorized();
        else setAttachments([]); // Si falla por otro error, muestra lista vacia
      });

  // Carga archivos al abrir el modal
  useEffect(() => {
    load();
  }, []);

  // Sube el archivo seleccionado asociado al incidente actual.
  // Usa multiplart/form-data, via api.uploadFile(No JSON como el resto)
  const upload = async () => {

    // Evita llamar a la API si no hay archivo seleccionado
    if (!selectedFile) return alert("Selecciona un archivo primero");
    setUploading(true); // Desectiva el boton y muestra "subiendo"...
    try {
      await api.uploadFile(
        `/api/attachment/incident/${incident.id}`,
        selectedFile,
      );
      setSelectedFile(null); // Limipia el input despues de subir
      load(); // Recarga la lista para mostrar el nuevo archivo
    } catch (e) {
      if (e.message === "401") onUnauthorized();
      else
        alert(
          "Error al subir el archivo. Verifica el tipo y tamaño (máx 5MB).",
        );
    } finally {
      setUploading(false); // Reactiva el boton siempre, haya error o no
    }
  };

  // Elimina un archivo por su id
  // Borra tanto el registro en postgreSQL como el archivo fisico del disco (Lo hace el service)
  const del = async (id) => {
    if (confirm("¿Eliminar este archivo?")) {
      try {
        await api.delete(`/api/attachment/${id}`);
        load(); // Recarga la lista para reflejar la eliminación
      } catch (e) {
        if (e.message === "401") onUnauthorized();
      }
    }
  };

  return (
    <Modal title={`Archivos adjuntos — ${incident.title}`} onClose={onClose}>

      {/* Lista de archivos existentes del incidente */}
      <div className="comments-list">
        {attachments.map((a) => (
          <div key={a.id} className="comment">

            {/* Nombre original del archivo tal como se subio*/}
            <p className="comment__content">📄 {a.fileName}</p>

            {/* Tamaño en KB y fecha de subida */}
            <p className="comment__meta">
              {(a.fileSize / 1024).toFixed(1)} KB ·{" "}
              {new Date(a.uploadedAt).toLocaleDateString()}
            </p>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>

              {/* Abre el archivo en una pestaña nueva usando el endpoint de descarga
                  El navegador decide como mostrarlo segun el content-type:
                  PDF -> lo muestra en el visor, img -> la muestra, txt -> lo muestra como texto */}
              <Btn
                variant="secondary"
                className="btn--sm"
                onClick={() =>
                  window.open(
                    `${API_URL}/api/attachment/${a.id}/download`,
                    "_blank",
                  )
                }
              >
                Ver
              </Btn>

              {/* Boton x para eliminar, mismo estilo que en CommentsModal*/}
              <button className="comment__delete" onClick={() => del(a.id)}>
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Mensaje cuando el incidente no tiene archivos adjuntos */}
        {attachments.length === 0 && (
          <p className="comments-empty">
            Este incidente no tiene archivos adjuntos
          </p>
        )}
      </div>




      {/* Formulario para subir un archivo nuevo al incidente */}
      <div className="comments-form">
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: 500,
            fontSize: "14px",
          }}
        >
          Subir archivo
          <span
            style={{
              fontWeight: 400,
              color: "#888",
              fontSize: "12px",
              marginLeft: "6px",
            }}
          >
            (jpg, png, gif, pdf, txt · máx 5MB)
          </span>
        </label>

        {/* Input nativo de archivo - acepta solo los tipos permitidos ór el backend */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
          onChange={(e) => setSelectedFile(e.target.files[0] || null)}
          style={{ fontSize: "13px", marginBottom: "10px" }}
        />

        {/* Confirmación visual del archivo seleccionado antes de subir */}
        {selectedFile && (
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
            ✅ {selectedFile.name}
          </p>
        )}

        {/* Boton de subida - se desactiva mientras esta subiendo para evitar multiples envios*/}
        <Btn className="btn--full" onClick={upload} disabled={uploading}>
          {uploading ? "Subiendo..." : "Subir archivo"}
        </Btn>
      </div>
    </Modal>
  );
}
