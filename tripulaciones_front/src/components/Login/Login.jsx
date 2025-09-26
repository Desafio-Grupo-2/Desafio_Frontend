import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../../redux/auth/authSlice';
import LogoFull from '../../assets/logos/logo.svg';
import IconoDB from '../../assets/logos/icono_sin_fondo.svg';
import OpenEye from '../../assets/logos/openEye.svg';
import CloseEye from '../../assets/logos/closedEye.svg';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, isError, isSuccess, message, user, isAuthenticated } =
        useSelector(s => s.auth);

    const [form, setForm] = useState({ email: '', password: '' });
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirigir según el rol del usuario
            if (user.role === 'administrador') {
                navigate('/admin-dashboard');
            } else if (user.role === 'conductor') {
                navigate('/dashboard');
            }
        }
        return () => {
            dispatch(reset());
        };
    }, [isAuthenticated, user, navigate, dispatch]);

    const onChange = e =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async e => {
        e.preventDefault();
        await dispatch(login(form));
    };

    return (
        <>
            <style>
                {`
                    .field__input {
                        color: #000000 !important;
                        -webkit-text-fill-color: #000000 !important;
                        background-color: #ffffff !important;
                    }
                    .field__input::placeholder {
                        color: #94a3b8 !important;
                        -webkit-text-fill-color: #94a3b8 !important;
                    }
                `}
            </style>
            <main className="lp">
                {/* fondo con retícula + halos */}
                <div className="lp__bg" aria-hidden />

                {/* contenedor principal */}
                <div className="lp__wrap">
                    {/* encabezado marca */}
                    <header className="brand">
                        <img
                            src={LogoFull}
                            alt="Deivibus Gestión de Flotas Corporativas"
                            className="brand__logo"
                        />
                    </header>

                    {/* tarjeta */}
                    <section
                        className="card"
                        role="region"
                        aria-labelledby="login-title"
                    >
                        <div className="card__icon-wrapper">
                            <img
                                src={IconoDB}
                                alt="Icono DB"
                                className="card__icon"
                            />
                        </div>
                        <h2 id="login-title" className="card__title">
                            Iniciar Sesión
                        </h2>

                        {isError && (
                            <div className="card__error" role="alert">
                                {message || 'Credenciales inválidas'}
                            </div>
                        )}

                        <form className="form" onSubmit={onSubmit} noValidate>
                            {/* Email */}
                            <label className="form__label" htmlFor="email">
                                Email
                            </label>
                            <div className="field">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="field__input"
                                    placeholder="tu@deivibus.com"
                                    value={form.email}
                                    onChange={onChange}
                                    autoComplete="email"
                                    required
                                    style={{
                                        color: '#000000',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        WebkitTextFillColor: '#000000',
                                    }}
                                />
                            </div>

                            {/* Password */}
                            <label className="form__label" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="field">
                                <input
                                    id="password"
                                    name="password"
                                    type={show ? 'text' : 'password'}
                                    className="field__input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={onChange}
                                    autoComplete="current-password"
                                    required
                                    style={{
                                        color: '#000000',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        WebkitTextFillColor: '#000000',
                                    }}
                                />
                                <button
                                    type="button"
                                    className="field__iconbtn"
                                    aria-label={
                                        show
                                            ? 'Ocultar contraseña'
                                            : 'Mostrar contraseña'
                                    }
                                    onClick={() => setShow(v => !v)}
                                >
                                    {show ? <img src={OpenEye} alt="Open Eye" /> : <img src={CloseEye} alt="Close Eye" />}
                                </button>
                            </div>
                            {/* 
                        <a className="form__link" href="/forgot-password">
                            ¿Olvidaste tu contraseña?
                        </a> */}

                            <button
                                type="submit"
                                className="btn"
                                disabled={isLoading}
                            >
                                <span>Acceder</span>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M13 5l7 7-7 7M5 12h14"
                                        stroke="white"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </form>

                        {/* <p className="card__ssl">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z"
                                    fill="#64748b"
                                />
                            </svg>
                            Conexión segura <span>SSL</span>
                        </p> */}
                    </section>
                </div>
            </main>
        </>
    );
}
