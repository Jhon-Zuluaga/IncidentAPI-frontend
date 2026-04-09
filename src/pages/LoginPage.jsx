import { useState } from "react";
import { API_URL } from "../api/client";
import Input from "../components/Input";
import Btn from "../components/Btn";

// ─────────────────── PAGINA DE LOGIN ───────────────────

// Se muestra cuando el usuario NO está autenticado.
// Tiene dos vistas: login normal y recuperación de contraseña.
// Al hacer login exitoso llama a `onLogin` para que App sepa que ya entró.

export default function LoginPage({ onLogin }) {

  // Controla qué vista se muestra: "login" | "forgot" | "reset"
  const [view, setView] = useState("login");

  // ── ESTADO LOGIN ──
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── ESTADO FORGOT PASSWORD ──
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── ESTADO RESET PASSWORD ──
  const [resetForm, setResetForm] = useState({ email: "", token: "", newPassword: "" });
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // ── HANDLER LOGIN ──
  const handleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });

      if (res.ok) {
        onLogin(); // Notifica a App que el login fue exitoso
      } else {
        setLoginError("Credenciales inválidas. Verifica tu email y contraseña.");
      }
    } catch {
      setLoginError("No se pudo conectar al servidor.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── HANDLER FORGOT PASSWORD ──
  // Envía el email al backend para generar el token y enviarlo por correo
  const handleForgot = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      // Siempre muestra el mismo mensaje para no revelar si el email existe
      setForgotMsg("Si el correo existe recibirás un email con el token.");

      // Pre-rellena el email en el formulario de reset para comodidad
      setResetForm((f) => ({ ...f, email: forgotEmail }));
    } catch {
      setForgotMsg("No se pudo conectar al servidor.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── HANDLER RESET PASSWORD ──
  // Envía email + token + nueva contraseña al backend para actualizarla
  const handleReset = async () => {
    setResetError("");
    setResetMsg("");
    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetForm),
      });

      if (res.ok) {
        setResetMsg("Contraseña actualizada. Ya puedes iniciar sesión.");
        // Vuelve al login después de 2 segundos
        setTimeout(() => setView("login"), 2000);
      } else {
        setResetError("Token inválido o expirado. Solicita uno nuevo.");
      }
    } catch {
      setResetError("No se pudo conectar al servidor.");
    } finally {
      setResetLoading(false);
    }
  };

  // ── VISTA LOGIN ──
  if (view === "login") {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <span className="header__icon">⚡</span>
            <span className="header__title">IncidentAPI</span>
          </div>
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

          {/* Solo se muestra si hay un mensaje de error */}
          {loginError && <div className="login-error">{loginError}</div>}

          <Input
            label="Email"
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="correo@example.com"
          />
          <Input
            label="Contraseña"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            // Permite hacer login presionando Enter
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <Btn className="btn--full" onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? "Ingresando..." : "Ingresar"}
          </Btn>

          {/* Link para ir a la vista de recuperación de contraseña */}
          <p className="login-forgot" onClick={() => setView("forgot")}>
            ¿Olvidaste tu contraseña?
          </p>
        </div>
      </div>
    );
  }

  // ── VISTA FORGOT PASSWORD ──
  if (view === "forgot") {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <span className="header__icon">⚡</span>
            <span className="header__title">IncidentAPI</span>
          </div>
          <h2 className="login-title">Recuperar Contraseña</h2>
          <p className="login-subtitle">Te enviaremos un token de 6 dígitos a tu correo</p>

          {forgotMsg && <div className="login-success">{forgotMsg}</div>}

          <Input
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="correo@example.com"
          />

          <Btn className="btn--full" onClick={handleForgot} disabled={forgotLoading}>
            {forgotLoading ? "Enviando..." : "Enviar token"}
          </Btn>

          {/* Si ya recibió el mensaje, muestra el botón para ir al reset */}
          {forgotMsg && (
            <Btn
              variant="secondary"
              className="btn--full"
              style={{ marginTop: 10 }}
              onClick={() => setView("reset")}
            >
              Tengo mi token →
            </Btn>
          )}

          {/* Link para volver al login */}
          <p className="login-forgot" onClick={() => setView("login")}>
            ← Volver al login
          </p>
        </div>
      </div>
    );
  }

  // ── VISTA RESET PASSWORD ──
  if (view === "reset") {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <span className="header__icon">⚡</span>
            <span className="header__title">IncidentAPI</span>
          </div>
          <h2 className="login-title">Nueva Contraseña</h2>
          <p className="login-subtitle">Ingresa el token recibido y tu nueva contraseña</p>

          {resetMsg && <div className="login-success">{resetMsg}</div>}
          {resetError && <div className="login-error">{resetError}</div>}

          <Input
            label="Email"
            type="email"
            value={resetForm.email}
            onChange={(e) => setResetForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="correo@example.com"
          />
          <Input
            label="Token"
            type="text"
            value={resetForm.token}
            onChange={(e) => setResetForm((f) => ({ ...f, token: e.target.value }))}
            placeholder="123456"
          />
          <Input
            label="Nueva Contraseña"
            type="password"
            value={resetForm.newPassword}
            onChange={(e) => setResetForm((f) => ({ ...f, newPassword: e.target.value }))}
            placeholder="••••••••"
          />

          <Btn className="btn--full" onClick={handleReset} disabled={resetLoading}>
            {resetLoading ? "Actualizando..." : "Cambiar contraseña"}
          </Btn>

          <p className="login-forgot" onClick={() => setView("forgot")}>
            ← Solicitar nuevo token
          </p>
        </div>
      </div>
    );
  }
}