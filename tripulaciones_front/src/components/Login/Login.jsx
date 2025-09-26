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

                    {/* tarjeta */}
                    <section
                        className="card"
                        role="region"
                        aria-labelledby="login-title"
                    >
                        <div className="card__icon-wrapper">
                        <img
                            src={LogoFull}
                            alt="Deivibus Gestión de Flotas Corporativas"
                            className="brand__logo"
                        />
                        </div>
                        {/* <h2 id="login-title" className="card__title">
                            Iniciar Sesión
                        </h2> */}

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

                            <button
                                type="submit"
                                className="btn"
                                disabled={isLoading}
                            >
                                <span>Acceder</span>
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}
