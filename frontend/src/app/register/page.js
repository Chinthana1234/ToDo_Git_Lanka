"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, loading: authLoading, register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await register(name, email, password);
        } catch (err) {
            if (err.response?.data?.errors) {
                const messages = Object.values(err.response.data.errors).flat().join(' ');
                setError(messages);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Cannot connect to backend server. Please ensure the Laravel backend is running on http://localhost:8000.');
            } else {
                setError('Registration failed. Please check your connection and details.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-gray-800">
            {/* Left Column - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20">
                {/* Brand Logo */}
                <div>
                    <Link href="/" className="inline-block text-xl font-bold tracking-tight text-[#064E3B]">
                        Todo App
                    </Link>
                </div>

                {/* Form Container */}
                <div className="my-auto max-w-md w-full mx-auto py-8">
                    <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">
                        Please enter your details to register a new account.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#064E3B] transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#064E3B] transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#064E3B] transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#064E3B] hover:bg-black text-white py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200 shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
                        >
                            {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-gray-900 hover:text-[#064E3B] transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Footer copyright note */}
                <div className="text-xs text-gray-400 text-center sm:text-left">
                    &copy; {new Date().getFullYear()} Todo App. All rights reserved.
                </div>
            </div>

            {/* Right Column - Luxury Visual Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#064E3B] overflow-hidden items-center justify-center p-12">
                {/* Background Image with Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: "url('/todo_auth_bg.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] via-[#064E3B]/50 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 text-center max-w-lg px-6 py-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-widest text-[#F8E7C9] uppercase leading-tight mb-4 drop-shadow">
                        NATURE&apos;S MASTERPIECE
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 my-6">
                        <span className="w-12 h-[1px] bg-[#F8E7C9]/60"></span>
                        <span className="text-[#F8E7C9] text-xs">✦</span>
                        <span className="w-12 h-[1px] bg-[#F8E7C9]/60"></span>
                    </div>

                    <p className="text-lg sm:text-xl font-serif italic text-[#F8E7C9]/90 tracking-wide">
                        &ldquo;Crafted by time, perfected by clarity.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
