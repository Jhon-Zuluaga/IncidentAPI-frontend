import { STATUS_CLASS, STATUS_LABEL } from "../constants/status";

// Muestra el estado de un incidente como una etiqueta con color
export default function Badge({ status }) {
  const key = status?.toLowerCase() || "abierto";
  return (
    <span className={`badge ${STATUS_CLASS[key] || "badge--abierto"}`}>
      {STATUS_LABEL[key] || "Abierto"}
    </span>
  );
}