"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get('/user');
                setUser(res.data);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkUser();

        // Listen for storage changes across tabs (e.g. login/logout in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === null) {
                if (e.newValue) {
                    checkUser();
                } else {
                    setUser(null);
                }
            }
        };

        // Listen for custom logout event triggered by 401 interceptor
        const handleAuthLogout = () => {
            setUser(null);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-logout', handleAuthLogout);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-logout', handleAuthLogout);
        };
    }, [checkUser]);

    const login = async (email, password) => {
        const res = await axios.post('/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        const userRes = await axios.get('/user');
        setUser(userRes.data);
        router.push('/dashboard');
    };

    const register = async (name, email, password) => {
        const res = await axios.post('/register', { name, email, password });
        localStorage.setItem('token', res.data.access_token);
        const userRes = await axios.get('/user');
        setUser(userRes.data);
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (err) {
            // Ignore error if already logged out on backend
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8E7C9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#064E3B] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#064E3B] font-semibold text-sm tracking-wider uppercase">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
