"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/user');
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
        };
        checkUser();
    }, []);

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
        await axios.post('/logout');
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
