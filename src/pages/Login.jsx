import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, UserSquare2, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const Login = () => {
    const { loginAdmin, loginConsulta } = useAuth();
    const [view, setView] = useState('selection'); // selection, admin, consulta
    const [password, setPassword] = useState('');
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(false);

    // Generar contraseña dinámica: Essalud + ddMM
    const today = new Date();
    const dynamicPassword = `Essalud${format(today, 'ddMM')}`;

    useEffect(() => {
        if (view === 'consulta') {
            cargarServicios();
        }
    }, [view]);

    const cargarServicios = async () => {
        setLoadingServicios(true);
        try {
            const { data, error } = await supabase
                .from('servicios')
                .select('nombre')
                .order('nombre');
            
            if (error) throw error;
            setServicios(data.map(s => s.nombre));
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            toast.error('No se pudieron cargar los servicios');
        } finally {
            setLoadingServicios(false);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (password === dynamicPassword) {
            loginAdmin();
            toast.success('Bienvenido Administrador');
        } else {
            toast.error('Clave incorrecta');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Building2 size={40} color="var(--color-primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Gestión de Referencias</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hospital Lazarte - Virgen de la Puerta</p>
                </div>

                {view === 'selection' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={() => setView('admin')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <KeyRound color="var(--color-primary)" />
                                <span>Ingreso Administrador</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </button>
                        
                        <button onClick={() => setView('consulta')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <UserSquare2 color="var(--color-success)" />
                                <span>Consultar Citas</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </button>
                    </div>
                )}

                {view === 'admin' && (
                    <form onSubmit={handleAdminLogin} style={{ animation: 'fadeIn 0.3s' }}>
                        <div className="form-group">
                            <label className="text-label">Clave de Jefatura (Día)</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="Ingresa la clave dinámica"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Entrar</button>
                        <button type="button" onClick={() => setView('selection')} className="btn btn-secondary" style={{ width: '100%' }}>Volver</button>
                    </form>
                )}

                {view === 'consulta' && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Selecciona tu Servicio</h3>
                        
                        {loadingServicios ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Cargando servicios...</div>
                        ) : servicios.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No hay servicios registrados.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {servicios.map(servicio => (
                                    <button 
                                        key={servicio} 
                                        onClick={() => loginConsulta(servicio)}
                                        className="btn btn-secondary" 
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', padding: '1rem' }}
                                    >
                                        <Activity size={18} color="var(--color-primary)" />
                                        {servicio}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button onClick={() => setView('selection')} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>Volver</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
