import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../../redux/auth/authSlice';
import { Bus, User } from 'lucide-react';
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

    const handleDemoLogin = async (email, password) => {
        setForm({ email, password });
        await dispatch(login({ email, password }));
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
                    
                    .demo-section {
                        margin-top: 2.5rem;
                        padding-top: 2rem;
                        border-top: 1px solid #e5e7eb;
                    }
                    
                    .demo-header {
                        margin-bottom: 1.5rem;
                    }
                    
                    .demo-divider {
                        text-align: center;
                        margin-bottom: 0.75rem;
                        position: relative;
                    }
                    
                    .demo-divider span {
                        background: #ffffff;
                        color: #374151;
                        font-size: 1rem;
                        font-weight: 600;
                        padding: 0 1rem;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .demo-divider::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        height: 1px;
                        background: #e5e7eb;
                        z-index: 0;
                    }
                    
                    .demo-description {
                        text-align: center;
                        color: #6b7280;
                        font-size: 0.875rem;
                        margin: 0;
                        font-weight: 500;
                    }
                    
                    .demo-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .demo-btn {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 1.25rem 1.5rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        text-align: left;
                        width: 100%;
                        font-family: inherit;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .demo-btn::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                        transition: left 0.5s;
                    }
                    
                    .demo-btn:hover:not(:disabled)::before {
                        left: 100%;
                    }
                    
                    .demo-btn:hover:not(:disabled) {
                        border-color: #3b82f6;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
                    }
                    
                    .demo-btn:active:not(:disabled) {
                        transform: translateY(-1px);
                    }
                    
                    .demo-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .demo-conductor:hover:not(:disabled) {
                        border-color: #10b981;
                        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
                        background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                    }
                    
                    .demo-admin:hover:not(:disabled) {
                        border-color: #8b5cf6;
                        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
                        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                    }
                    
                    .demo-icon-wrapper {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        background: #f8fafc;
                        flex-shrink: 0;
                        transition: all 0.3s ease;
                    }
                    
                    .demo-conductor .demo-icon-wrapper {
                        background: #f0fdf4;
                    }
                    
                    .demo-admin .demo-icon-wrapper {
                        background: #faf5ff;
                    }
                    
                    .demo-conductor:hover .demo-icon-wrapper {
                        background: #dcfce7;
                        transform: scale(1.05);
                    }
                    
                    .demo-admin:hover .demo-icon-wrapper {
                        background: #f3e8ff;
                        transform: scale(1.05);
                    }
                    
                    .demo-icon {
                        color: #6b7280;
                        transition: all 0.3s ease;
                    }
                    
                    .demo-conductor:hover .demo-icon {
                        color: #10b981;
                    }
                    
                    .demo-admin:hover .demo-icon {
                        color: #8b5cf6;
                    }
                    
                    .demo-content {
                        display: flex;
                        flex-direction: column;
                        gap: 0.25rem;
                        flex: 1;
                    }
                    
                    .demo-title {
                        font-weight: 700;
                        color: #1f2937;
                        font-size: 1rem;
                    }
                    
                    .demo-subtitle {
                        font-size: 0.875rem;
                        color: #6b7280;
                        font-weight: 500;
                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    }
                    
                    .demo-arrow {
                        font-size: 1.25rem;
                        color: #9ca3af;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                    }
                    
                    .demo-btn:hover .demo-arrow {
                        color: #3b82f6;
                        transform: translateX(4px);
                    }
                    
                    .demo-conductor:hover .demo-arrow {
                        color: #10b981;
                    }
                    
                    .demo-admin:hover .demo-arrow {
                        color: #8b5cf6;
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
                                {isLoading ? (
                                    <div className="loader"></div>
                                ) : (
                                    <span>Acceder</span>
                                )}
                            </button>
                        </form>

                        {/* Botones de Demo */}
                        <div className="demo-section">
                            <div className="demo-header">
                                <div className="demo-divider">
                                    <span>Cuentas demo</span>
                                </div>
                                <p className="demo-description">
                                    Prueba la aplicación con cuentas preconfiguradas
                                </p>
                            </div>
                            
                            <div className="demo-buttons">
                                <button
                                    type="button"
                                    className="demo-btn demo-conductor"
                                    onClick={() => handleDemoLogin('arantza.bridge@sanmillanbus.com', 'Conductor123!')}
                                    disabled={isLoading}
                                >
                                    <div className="demo-icon-wrapper">
                                        <Bus className="demo-icon" size={24} />
                                    </div>
                                    <div className="demo-content">
                                        <span className="demo-title">Demo Conductor</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="demo-btn demo-admin"
                                    onClick={() => handleDemoLogin('luismi.kuna@sanmillanbus.com', 'Admin123!')}
                                    disabled={isLoading}
                                >
                                    <div className="demo-icon-wrapper">
                                        <User className="demo-icon" size={24} />
                                    </div>
                                    <div className="demo-content">
                                        <span className="demo-title">Demo Admin</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
