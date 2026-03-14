import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Run once on mount to check if user is in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('dreamgo_client');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem('dreamgo_client');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('dreamgo_client', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dreamgo_client');
    };

    if (loading) {
        return null; // or a tiny spinner
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
