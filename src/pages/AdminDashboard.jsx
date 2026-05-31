import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { LogOut, Upload, Camera, FileText, X, Trash2, Edit2, Calendar, Settings, Plus, Save } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const { logout } = useAuth();
    
    // Tabs: 'registrar' | 'historial' | 'configuracion'
    const [activeTab, setActiveTab] = useState('registrar');
    
    // ==========================================
    // ESTADO PARA SERVICIOS GLOBALES
    // ==========================================
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(false);

    const cargarServicios = async () => {
        setLoadingServicios(true);
        try {
            const { data, error } = await supabase.from('servicios').select('*').order('nombre');
            if (error) throw error;
            setServicios(data || []);
            // Seleccionar por defecto el primero si no hay uno seleccionado
            if (data && data.length > 0 && !servicioDestino) {
                setServicioDestino(data[0].nombre);
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            toast.error('No se pudieron cargar los servicios');
        } finally {
            setLoadingServicios(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, []);

    // ==========================================
    // ESTADO PARA REGISTRAR (UPLOAD)
    // ==========================================
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [servicioDestino, setServicioDestino] = useState('');
    const [observacion, setObservacion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ==========================================
    // ESTADO PARA HISTORIAL
    // ==========================================
    const [citas, setCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(false);
    const [fechaFiltro, setFechaFiltro] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    // Edición Historial
    const [editingCita, setEditingCita] = useState(null);
    const [editServicio, setEditServicio] = useState('');
    const [editObservacion, setEditObservacion] = useState('');
    const [editFile, setEditFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    // ==========================================
    // ESTADO PARA CONFIGURACIÓN (CRUD SERVICIOS)
    // ==========================================
    const [nuevoServicio, setNuevoServicio] = useState('');
    const [editingServicio, setEditingServicio] = useState(null);
    const [editServicioNombre, setEditServicioNombre] = useState('');

    // ==========================================
    // EFECTOS VARIOS
    // ==========================================
    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    useEffect(() => {
        if (!editFile) {
            setEditPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(editFile);
        setEditPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [editFile]);

    useEffect(() => {
        if (activeTab === 'historial') {
            cargarCitas();
        }
    }, [activeTab, fechaFiltro]);

    // ==========================================
    // FUNCIONES HISTORIAL
    // ==========================================
    const cargarCitas = async () => {
        setLoadingCitas(true);
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('fecha_gestion', fechaFiltro)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCitas(data || []);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoadingCitas(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas ELIMINAR esta cita?')) return;
        const toastId = toast.loading('Eliminando...');
        try {
            const { error } = await supabase.from('citas').delete().eq('id', id);
            if (error) throw error;
            toast.success('Cita eliminada', { id: toastId });
            cargarCitas();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar', { id: toastId });
        }
    };

    const abrirEdicion = (cita) => {
        setEditingCita(cita);
        setEditServicio(cita.servicio_destino);
        setEditObservacion(cita.observacion || '');
        setEditFile(null);
        setEditPreviewUrl(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        const toastId = toast.loading('Guardando cambios...');

        try {
            let finalFotoUrl = editingCita.foto_url;
            if (editFile) {
                const fileExt = editFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `citas/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('citas_fotos').upload(filePath, editFile);
                if (uploadError) throw uploadError;
                finalFotoUrl = filePath;
            }

            const { error: dbError } = await supabase
                .from('citas')
                .update({ servicio_destino: editServicio, observacion: editObservacion, foto_url: finalFotoUrl })
                .eq('id', editingCita.id);

            if (dbError) throw dbError;

            toast.success('Cita actualizada', { id: toastId });
            setEditingCita(null);
            cargarCitas(); 
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar: ' + error.message, { id: toastId });
        } finally {
            setSavingEdit(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        const { data } = supabase.storage.from('citas_fotos').getPublicUrl(path);
        return data.publicUrl;
    };

    // ==========================================
    // FUNCIONES REGISTRO
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Debes subir una foto de la cita');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Guardando cita...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `citas/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('citas_fotos').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase.from('citas').insert([{
                servicio_destino: servicioDestino,
                foto_url: filePath,
                observacion: observacion,
                fecha_gestion: format(new Date(), 'yyyy-MM-dd')
            }]);

            if (dbError) throw dbError;

            toast.success('Cita gestionada correctamente', { id: toastId });
            setFile(null);
            setObservacion('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al guardar la cita', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // FUNCIONES CRUD SERVICIOS
    // ==========================================
    const handleCrearServicio = async (e) => {
        e.preventDefault();
        if (!nuevoServicio.trim()) return;
        
        const toastId = toast.loading('Agregando servicio...');
        try {
            const { error } = await supabase.from('servicios').insert([{ nombre: nuevoServicio.trim() }]);
            if (error) throw error;
            toast.success('Servicio agregado', { id: toastId });
            setNuevoServicio('');
            cargarServicios();
        } catch (error) {
            console.error(error);
            toast.error('Error al agregar (Quizás ya existe)', { id: toastId });
        }
    };

    const handleBorrarServicio = async (nombre) => {
        if (!window.confirm(`¿Seguro que deseas ELIMINAR el servicio "${nombre}"?\n\n¡ATENCIÓN! Se borrarán TAMBIÉN todas las fotos e historiales vinculados a este servicio.`)) return;
        
        const toastId = toast.loading('Eliminando...');
        try {
            const { error } = await supabase.from('servicios').delete().eq('nombre', nombre);
            if (error) throw error;
            toast.success('Servicio y sus datos eliminados', { id: toastId });
            cargarServicios();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar', { id: toastId });
        }
    };

    const handleUpdateServicio = async (e) => {
        e.preventDefault();
        if (!editServicioNombre.trim() || editServicioNombre === editingServicio) {
            setEditingServicio(null);
            return;
        }

        const toastId = toast.loading('Actualizando...');
        try {
            const { error } = await supabase.from('servicios')
                .update({ nombre: editServicioNombre.trim() })
                .eq('nombre', editingServicio);
            if (error) throw error;
            
            toast.success('Servicio actualizado', { id: toastId });
            setEditingServicio(null);
            cargarServicios();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar', { id: toastId });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
                <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-primary)' }}>Jefatura de Referencias</h1>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <LogOut size={16} /> Salir
                </button>
            </div>

            <div className="container" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', marginTop: '1rem' }}>
                
                {/* TABS PESTAÑAS */}
                <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.4rem', borderRadius: '12px', marginBottom: '1.5rem', overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('registrar')} style={{ flex: 1, minWidth: '120px', padding: '0.8rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'registrar' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'registrar' ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}>
                        Registrar Cita
                    </button>
                    <button onClick={() => setActiveTab('historial')} style={{ flex: 1, minWidth: '120px', padding: '0.8rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'historial' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'historial' ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}>
                        Historial del Día
                    </button>
                    <button onClick={() => setActiveTab('configuracion')} style={{ flex: 1, minWidth: '120px', padding: '0.8rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'configuracion' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'configuracion' ? 'white' : 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Settings size={18} /> Servicios
                    </button>
                </div>

                {/* ========================================== */}
                {/* VISTA REGISTRAR */}
                {/* ========================================== */}
                {activeTab === 'registrar' && (
                    <div className="glass-panel" style={{ padding: '1.5rem', animation: 'fadeIn 0.3s' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Registrar Cita (H. Lazarte)</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Foto */}
                            <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <label className="text-label" style={{ marginBottom: '0.5rem', display: 'block' }}>1. Foto de la Cita Física</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem' }}>
                                        <Upload size={20} /><span>Galería</span>
                                        <input type="file" accept="image/*" onChange={e => e.target.files[0] && setFile(e.target.files[0])} style={{ display: 'none' }} />
                                    </label>
                                    <label className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem' }}>
                                        <Camera size={20} /><span>Cámara</span>
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
                                            <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><X size={16}/></button>
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
                                {loadingServicios ? (
                                    <div style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>Cargando servicios...</div>
                                ) : (
                                    <select className="input-field" value={servicioDestino} onChange={(e) => setServicioDestino(e.target.value)} required>
                                        {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Observacion */}
                            <div className="form-group">
                                <label className="text-label">Observación (Opcional)</label>
                                <input type="text" className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} placeholder="Anotaciones..." />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting || !file}>
                                {submitting ? 'Enviando...' : 'Enviar a Servicio'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ========================================== */}
                {/* VISTA HISTORIAL */}
                {/* ========================================== */}
                {activeTab === 'historial' && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px' }}>
                            <Calendar size={20} color="var(--color-primary)" />
                            <div style={{ flex: 1 }}>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Filtrar por Fecha</label>
                                <input type="date" className="input-field" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
                            </div>
                        </div>

                        {loadingCitas ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
                        ) : citas.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No has subido citas en esta fecha.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {citas.map(cita => (
                                    <div key={cita.id} className="glass-panel" style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{ width: '80px', height: '80px', background: '#000', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            <a href={getImageUrl(cita.foto_url)} target="_blank" rel="noopener noreferrer">
                                                <img src={getImageUrl(cita.foto_url)} alt="Cita" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>{cita.servicio_destino}</h3>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                {format(new Date(cita.created_at), 'HH:mm')}
                                            </div>
                                            {cita.observacion && (
                                                <p style={{ margin: 0, fontSize: '0.9rem' }}>"{cita.observacion}"</p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <button onClick={() => abrirEdicion(cita)} className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Edit2 size={16} /> <span style={{fontSize: '0.8rem'}}>Editar</span>
                                            </button>
                                            <button onClick={() => handleDelete(cita.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Trash2 size={16} /> <span style={{fontSize: '0.8rem'}}>Borrar</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================== */}
                {/* VISTA CONFIGURACIÓN (CRUD SERVICIOS) */}
                {/* ========================================== */}
                {activeTab === 'configuracion' && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings size={24} color="var(--color-primary)"/> Gestión de Servicios
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Aquí puedes administrar la lista de servicios que aparecen en la aplicación. Si borras un servicio, <strong>también se borrarán todas las citas asociadas a él</strong>.
                            </p>

                            <form onSubmit={handleCrearServicio} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Nombre del nuevo servicio..." 
                                    value={nuevoServicio} 
                                    onChange={(e) => setNuevoServicio(e.target.value)} 
                                />
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} disabled={!nuevoServicio.trim()}>
                                    <Plus size={18} /> Agregar
                                </button>
                            </form>

                            {loadingServicios ? (
                                <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {servicios.map(s => (
                                        <div key={s.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            {editingServicio === s.nombre ? (
                                                <form onSubmit={handleUpdateServicio} style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                                                    <input 
                                                        type="text" 
                                                        className="input-field" 
                                                        value={editServicioNombre} 
                                                        onChange={(e) => setEditServicioNombre(e.target.value)} 
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}><Save size={16}/></button>
                                                    <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingServicio(null)}><X size={16}/></button>
                                                </form>
                                            ) : (
                                                <>
                                                    <span style={{ fontWeight: '500' }}>{s.nombre}</span>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button 
                                                            onClick={() => { setEditingServicio(s.nombre); setEditServicioNombre(s.nombre); }} 
                                                            className="btn btn-secondary" 
                                                            style={{ padding: '0.5rem' }}
                                                            title="Editar nombre"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleBorrarServicio(s.nombre)} 
                                                            className="btn btn-secondary" 
                                                            style={{ padding: '0.5rem', color: 'var(--color-danger)' }}
                                                            title="Borrar servicio"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL DE EDICIÓN HISTORIAL */}
            {editingCita && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Editar Registro</h2>
                            <button onClick={() => setEditingCita(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <label className="text-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Cambiar Foto (Opcional)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem' }}>
                                        <Upload size={20} /><span>Subir Nueva</span>
                                        <input type="file" accept="image/*" onChange={e => e.target.files[0] && setEditFile(e.target.files[0])} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                {(editPreviewUrl || editingCita.foto_url) && (
                                    <div style={{ textAlign: 'center', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center', height: '150px' }}>
                                        <img src={editPreviewUrl || getImageUrl(editingCita.foto_url)} alt="Foto Actual" style={{ maxWidth: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="text-label">Servicio Destino</label>
                                <select className="input-field" value={editServicio} onChange={(e) => setEditServicio(e.target.value)} required>
                                    {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="text-label">Observación</label>
                                <input type="text" className="input-field" value={editObservacion} onChange={(e) => setEditObservacion(e.target.value)} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setEditingCita(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar Cambios'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
