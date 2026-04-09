// ─────────────────── MAPAS DE ESTADO PARA INCIDENTES ───────────────────

// Relacionan el valor interno del estado con la clase CSS visible en el badge
export const STATUS_CLASS = {
  abierto: "badge--abierto",
  "en progreso": "badge--en-progreso",
  cerrado: "badge--cerrado",
};

// Etiquetas visibles para el usuario según el estado del incidente
export const STATUS_LABEL = {
  abierto: "Abierto",
  "en progreso": "En progreso",
  cerrado: "Cerrado",
};