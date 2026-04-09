// Ventana emergente con overlay oscuro, título y botón de cerrar.
// Acepta `children` para mostrar cualquier contenido dentro.
export default function Modal({ title, onClose, children }) {
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