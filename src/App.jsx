import { useState } from "react";
import { API_URL } from "./api/client";
import LoginPage from "./pages/LoginPage";
import IncidentsSection from "./sections/IncidentsSection";
import UsersSection from "./sections/UsersSection";
import CategoriesSection from "./sections/CategoriesSection";
import Btn from "./components/Btn";
import "./App.css";

// ─────────────────── DEFINICIÓN DE TABS ───────────────────

// Array que define las pestañas del header.
// El id se usa para comparar con el estado `tab` y decidir qué sección renderizar.
const TABS = [
  { id: "incidents", label: "🚨 Incidentes" },
  { id: "users", label: "👤 Usuarios" },
  { id: "categories", label: "🏷️ Categorías" },
];

// ─────────────────── COMPONENTE RAÍZ ───────────────────

// Punto de entrada de la aplicación. Controla dos cosas:
// 1. Si el usuario está autenticado (isLoggedIn)
// 2. Qué pestaña está activa (tab)

export default function App() {

  // Pestaña activa por defecto
  const [tab, setTab] = useState("incidents");

  // Empieza sin sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Llama al endpoint de logout y regresa a la pantalla de login
  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsLoggedIn(false);
  };

  // Si cualquier sección recibe 401, fuerza el regreso al login
  const handleUnauthorized = () => setIsLoggedIn(false);

  // Guard: si no está logueado, muestra solo la pantalla de login
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // Si está logueado, muestra el layout principal con header, tabs y sección activa
  return (
    <div className="app">
      <div className="header">
        <div className="header__brand">
          <span className="header__icon">⚡</span>
          <span className="header__title">IncidentAPI</span>
          <span className="header__subtitle">Panel de control</span>
        </div>

        {/* Renderiza un botón por cada tab del array TABS */}
        <div className="header__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "tab-btn--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Btn variant="secondary" className="btn--sm" style={{ marginLeft: 16 }} onClick={handleLogout}>
          Cerrar Sesión
        </Btn>
      </div>

      {/* Contenido principal: renderiza la sección según la tab activa */}
      <div className="content">
        <div className="card">
          {tab === "incidents" && <IncidentsSection onUnauthorized={handleUnauthorized} />}
          {tab === "users" && <UsersSection onUnauthorized={handleUnauthorized} />}
          {tab === "categories" && <CategoriesSection onUnauthorized={handleUnauthorized} />}
        </div>
      </div>
    </div>
  );
}