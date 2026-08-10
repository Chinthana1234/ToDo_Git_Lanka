"use client";
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-[#064E3B] text-white shadow-md border-b border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#F8E7C9] text-[#064E3B] flex items-center justify-center font-bold text-sm">
                        ✓
                    </span>
                    Todo App
                </Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-[#F8E7C9]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>{user.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-[#F8E7C9] hover:underline px-3 py-2">
                            Login
                        </Link>
                        <Link href="/register" className="bg-[#F8E7C9] text-[#064E3B] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
