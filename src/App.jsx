import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ConsultaDashboard from './pages/ConsultaDashboard';
import { supabase } from './lib/supabase';

function ConfigError() {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: 'white', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Error de Configuración</h1>
            <p>La aplicación no detecta las llaves de Supabase.</p>
            <p style={{ marginTop: '1rem', background: '#333', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                Verifica que el archivo <strong>.env.local</strong> exista en la raíz del proyecto<br />
                y contenga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
            </p>
        </div>
    );
}

const ProtectedRoute = ({ children, allowedRole }) => {
    const { role } = useAuth();
    
    if (!role) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRole && role !== allowedRole) {
        // Si es admin y trata de ir a consulta, mandalo a admin
        return <Navigate to={role === 'admin' ? '/admin' : '/consulta'} replace />;
    }

    return children;
};

function AppRoutes() {
    const { role } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!role ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/consulta'} replace />} />
            
            <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/consulta" element={
                <ProtectedRoute allowedRole="consulta">
                    <ConsultaDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    if (supabase.isMock) {
        return <ConfigError />;
    }

    return (
        <AuthProvider>
            <AppRoutes />
            <Toaster 
                position="top-center" 
                toastOptions={{ 
                    style: { background: '#333', color: '#fff' }
                }} 
            />
        </AuthProvider>
    );
}

export default App;
