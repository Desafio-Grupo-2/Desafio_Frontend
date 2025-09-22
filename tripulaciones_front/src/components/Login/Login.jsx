import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, reset } from "../../redux/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message, user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isSuccess && user) navigate("/");
    return () => { dispatch(reset()); };
  }, [isSuccess, user, navigate, dispatch]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(form));
  };

  return (
    <main className="lp">
      {/* fondo con retícula + halos */}
      <div className="lp__bg" aria-hidden />

      {/* contenedor principal */}
      <div className="lp__wrap">
        {/* encabezado marca */}
        <header className="brand">
          <h1 className="brand__name">Deiviator</h1>
          <p className="brand__tag">Gestión de flotas corporativas</p>
        </header>

        {/* tarjeta */}
        <section className="card" role="region" aria-labelledby="login-title">
          <h2 id="login-title" className="card__title">Iniciar Sesión</h2>
          <p className="card__subtitle">Accede a tu dashboard de gestión empresarial</p>

          {isError && (
            <div className="card__error" role="alert">
              {message || "Credenciales inválidas"}
            </div>
          )}

          <form className="form" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <label className="form__label" htmlFor="email">Email</label>
            <div className="field">
              <input
                id="email"
                name="email"
                type="email"
                className="field__input"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <label className="form__label" htmlFor="password">Contraseña</label>
            <div className="field">
              <input
                id="password"
                name="password"
                type={show ? "text" : "password"}
                className="field__input"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="field__iconbtn"
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShow((v) => !v)}
              >
                {/* ojo */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7C21.27 8.11 17 5 12 5Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="#64748b"/>
                </svg>
              </button>
            </div>

            <a className="form__link" href="/forgot-password">¿Olvidaste tu contraseña?</a>

            <button type="submit" className="btn" disabled={isLoading}>
              <span>Acceder</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 5l7 7-7 7M5 12h14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {/* <p className="card__alt">
            ¿No tienes cuenta? <a href="/register" className="card__altLink">Crear cuenta</a>
          </p> */}

          <p className="card__ssl">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z" fill="#64748b"/>
            </svg>
            Conexión segura <span>SSL</span>
          </p>
        </section>
      </div>
    </main>
  );
}
