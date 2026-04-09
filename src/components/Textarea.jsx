// Campo de texto largo con etiqueta encima.
// Acepta todos los props nativos de <textarea> via spread.
export default function Textarea({ label, ...props }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <textarea className="field__textarea" {...props} />
    </div>
  );
}