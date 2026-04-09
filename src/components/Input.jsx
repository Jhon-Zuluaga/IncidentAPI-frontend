// Campo de texto con etiqueta encima.
// Acepta todos los props nativos de <input> via spread.
export default function Input({ label, ...props }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <input className="field__input" {...props} />
    </div>
  );
}