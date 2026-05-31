import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Image as ImageIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ConsultaDashboard = () => {
    const { service, logout } = useAuth();
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtro de fecha (por defecto hoy)
    const [fechaFiltro, setFechaFiltro] = useState(format(new Date(), 'yyyy-MM-dd'));

    const cargarCitas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('servicio_destino', service)
                .eq('fecha_gestion', fechaFiltro)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCitas(data || []);
        } catch (error) {
            console.error('Error al cargar citas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCitas();
        
        // Suscripción en tiempo real (opcional pero muy útil)
        const subscription = supabase
            .channel('citas_channel')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'citas',
                filter: `servicio_destino=eq.${service}`
            }, (payload) => {
                // Solo agregar si es de la fecha que estamos viendo
                if (payload.new.fecha_gestion === fechaFiltro) {
                    setCitas(prev => [payload.new, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [service, fechaFiltro]);

    const getImageUrl = (path) => {
        if (!path) return '';
        const { data } = supabase.storage.from('citas_fotos').getPublicUrl(path);
        return data.publicUrl;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div>
                    <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-primary)' }}>Servicio: {service}</h1>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital V. de la Puerta</span>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <LogOut size={16} /> Salir
                </button>
            </div>

            <div className="container" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px' }}>
                    <Calendar size={20} color="var(--color-primary)" />
                    <div style={{ flex: 1 }}>
                        <label className="text-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Filtrar por Fecha</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={fechaFiltro} 
                            onChange={(e) => setFechaFiltro(e.target.value)} 
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando citas...</div>
                ) : citas.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <ImageIcon size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No hay citas gestionadas</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No se encontraron citas para {service} en la fecha seleccionada.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {citas.map(cita => (
                            <div key={cita.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <a href={getImageUrl(cita.foto_url)} target="_blank" rel="noopener noreferrer">
                                        <img 
                                            src={getImageUrl(cita.foto_url)} 
                                            alt="Foto de cita" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </a>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Registrado: {format(new Date(cita.created_at), 'HH:mm')}
                                    </div>
                                    {cita.observacion && (
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '2px solid var(--color-primary)', paddingLeft: '0.5rem' }}>
                                            "{cita.observacion}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultaDashboard;
