import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/auth/authSlice';

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector(state => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/');
    };

    if (!isAuthenticated || !user) {
        navigate('/');
        return null;
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 20px auto'
                }}>
                    ✓
                </div>
                
                <h1 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: '#1F2937'
                }}>
                    Dashboard Conductor
                </h1>
                
                <p style={{ 
                    margin: '0 0 20px 0', 
                    color: '#6B7280', 
                    fontSize: '1.1rem',
                    fontWeight: '500'
                }}>
                    Bienvenido, <span style={{ color: '#374151', fontWeight: '600' }}>{user.nombre} {user.apellido}</span>
                </p>

                <div style={{
                    background: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    border: '1px solid #E2E8F0'
                }}>
                    <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#6B7280', 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Rol: <span style={{ color: '#374151', fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</span>
                    </p>
                    <p style={{ 
                        margin: '0', 
                        color: '#6B7280', 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Email: <span style={{ color: '#374151', fontWeight: '600' }}>{user.email}</span>
                    </p>
                </div>

                <p style={{ 
                    margin: '0 0 30px 0', 
                    color: '#6B7280', 
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                }}>
                    Vista temporal para conductores - Dashboard en desarrollo
                </p>

                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
