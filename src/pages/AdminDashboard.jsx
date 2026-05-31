import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SERVICIOS } from './Login';
import toast from 'react-hot-toast';
import { LogOut, Upload, Camera, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const { logout } = useAuth();
    
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [servicioDestino, setServicioDestino] = useState(SERVICIOS[0]);
    const [observacion, setObservacion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Debes subir una foto de la cita');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Guardando cita...');

        try {
            // Subir foto
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `citas/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('citas_fotos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Guardar en BD
            const { error: dbError } = await supabase
                .from('citas')
                .insert([{
                    servicio_destino: servicioDestino,
                    foto_url: filePath,
                    observacion: observacion,
                    fecha_gestion: format(new Date(), 'yyyy-MM-dd')
                }]);

            if (dbError) throw dbError;

            toast.success('Cita gestionada correctamente', { id: toastId });
            
            // Limpiar
            setFile(null);
            setObservacion('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al guardar la cita', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-primary)' }}>Jefatura de Referencias</h1>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <LogOut size={16} /> Salir
                </button>
            </div>

            <div className="container" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Registrar Cita (H. Lazarte)</h2>
                    
                    <form onSubmit={handleSubmit}>
                        
                        {/* Foto */}
                        <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                            <label className="text-label" style={{ marginBottom: '0.5rem', display: 'block' }}>1. Foto de la Cita Física</label>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem' }}>
                                    <Upload size={20} />
                                    <span>Galería</span>
                                    <input type="file" accept="image/*" onChange={e => e.target.files[0] && setFile(e.target.files[0])} style={{ display: 'none' }} />
                                </label>
                                <label className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem' }}>
                                    <Camera size={20} />
                                    <span>Cámara</span>
                                    <input type="file" accept="image/*" capture="environment" onChange={e => e.target.files[0] && setFile(e.target.files[0])} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {file && (
                                <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                            <FileText size={16} color="var(--color-primary)" />
                                            <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)' }}><X size={16}/></button>
                                    </div>
                                    {previewUrl && (
                                        <div style={{ textAlign: 'center', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                                            <img src={previewUrl} alt="Vista Previa" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Servicio */}
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label className="text-label">2. Servicio Destino (H. Virgen de la Puerta)</label>
                            <select 
                                className="input-field" 
                                value={servicioDestino} 
                                onChange={(e) => setServicioDestino(e.target.value)}
                                required
                            >
                                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Observacion */}
                        <div className="form-group">
                            <label className="text-label">Observación (Opcional)</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                value={observacion} 
                                onChange={(e) => setObservacion(e.target.value)} 
                                placeholder="Anotaciones..." 
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting || !file}>
                            {submitting ? 'Enviando...' : 'Enviar a Servicio'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
