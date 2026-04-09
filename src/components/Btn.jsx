// Botón reutilizable con variantes de estilo.
// variant: "primary" | "secondary" | "danger"
export default function Btn({ variant = "primary", className = "", children, ...props }) {
  return (
    <button className={`btn btn--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}