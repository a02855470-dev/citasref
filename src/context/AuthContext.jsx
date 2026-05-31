import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // role can be: 'admin', 'consulta', or null
    const [role, setRole] = useState(null);
    const [service, setService] = useState(null); // only used for 'consulta'

    // Load from local storage on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('citasref_role');
        const savedService = localStorage.getItem('citasref_service');
        if (savedRole) {
            setRole(savedRole);
            if (savedRole === 'consulta' && savedService) {
                setService(savedService);
            }
        }
    }, []);

    const loginAdmin = (password) => {
        const today = new Date();
        const correctPassword = `Essalud${format(today, 'ddMM')}`;

        if (password === correctPassword) {
            setRole('admin');
            localStorage.setItem('citasref_role', 'admin');
            return true;
        }
        return false;
    };

    const loginConsulta = (selectedService) => {
        setRole('consulta');
        setService(selectedService);
        localStorage.setItem('citasref_role', 'consulta');
        localStorage.setItem('citasref_service', selectedService);
    };

    const logout = () => {
        setRole(null);
        setService(null);
        localStorage.removeItem('citasref_role');
        localStorage.removeItem('citasref_service');
    };

    return (
        <AuthContext.Provider value={{ role, service, loginAdmin, loginConsulta, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
