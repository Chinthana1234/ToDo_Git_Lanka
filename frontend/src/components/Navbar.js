"use client";
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">TodoApp</Link>
            <div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span>{user.name}</span>
                        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link>
                        <Link href="/register" className="bg-white text-blue-600 px-3 py-1 rounded">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
