import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, Activity } from 'lucide-react';

// Common services list
export const SERVICIOS = [
    'Cardiología',
    'Neurología',
    'Cirugía',
    'Pediatría',
    'Ginecología',
    'Oncología',
    'Traumatología',
    'Medicina General'
];

const Login = () => {
    const { loginAdmin, loginConsulta } = useAuth();
    const [view, setView] = useState('selection'); // selection, admin, consulta
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = (e) => {
        e.preventDefault();
        setError('');
        const success = loginAdmin(password);
        if (!success) {
            setError('Contraseña incorrecta');
        }
    };

    const handleConsultaLogin = (servicio) => {
        loginConsulta(servicio);
    };

    if (view === 'selection') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '1rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Activity />
                        CITASREF
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Portal de Citas y Referencias Hospitalarias</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={() => setView('admin')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
                            <LogIn size={20} />
                            Ingreso Administrador (Jefatura)
                        </button>
                        <button onClick={() => setView('consulta')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
                            <Eye size={20} />
                            Ingreso de Consulta (Servicios)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'admin') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '1rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
                    <button onClick={() => setView('selection')} className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.5rem', fontSize: '0.9rem' }}>
                        &larr; Volver
                    </button>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Acceso Administrativo</h2>
                    
                    <form onSubmit={handleAdminLogin}>
                        <div className="form-group">
                            <label className="text-label">Contraseña de Hoy</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Essalud..." 
                                required 
                            />
                        </div>
                        {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'consulta') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '1rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
                    <button onClick={() => setView('selection')} className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.5rem', fontSize: '0.9rem' }}>
                        &larr; Volver
                    </button>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Selecciona tu Servicio</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {SERVICIOS.map(serv => (
                            <button 
                                key={serv} 
                                onClick={() => handleConsultaLogin(serv)} 
                                className="btn btn-secondary"
                                style={{ textAlign: 'left', padding: '1rem', background: 'var(--bg-surface)' }}
                            >
                                {serv}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Login;
