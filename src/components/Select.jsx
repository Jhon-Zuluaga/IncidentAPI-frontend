// Lista desplegable con etiqueta encima.
// Acepta `children` para las opciones y los demás props nativos de <select>.
export default function Select({ label, children, ...props }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <select className="field__select" {...props}>
        {children}
      </select>
    </div>
  );
}