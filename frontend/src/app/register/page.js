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
        <div className="min-h-screen w-full flex bg-white font-sans text-emerald-950">
            <div className="w-full lg:w-1/2 flex flex-col justify-between items-center p-8 sm:p-14 lg:p-20 min-h-screen bg-white">
                <div className="w-full max-w-lg flex justify-start">
                    <Link href="/" className="inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-emerald-900">
                        <span className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                            ✓
                        </span>
                        <span>Todo App</span>
                    </Link>
                </div>

                <div className="my-auto max-w-lg w-full py-8 space-y-8">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-950 mb-3 tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-base sm:text-lg text-emerald-700 font-medium">
                            Please enter your details to register a new account.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 px-5 py-4 rounded-2xl text-base font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-bold tracking-wider text-emerald-900 uppercase mb-2.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-emerald-300 rounded-2xl text-base sm:text-lg text-emerald-950 font-medium placeholder-emerald-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-bold tracking-wider text-emerald-900 uppercase mb-2.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-emerald-300 rounded-2xl text-base sm:text-lg text-emerald-950 font-medium placeholder-emerald-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-bold tracking-wider text-emerald-900 uppercase mb-2.5">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-emerald-300 rounded-2xl text-base sm:text-lg text-emerald-950 font-medium placeholder-emerald-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 px-6 rounded-2xl text-base sm:text-lg font-bold tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                        >
                            {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <div className="pt-4 text-center text-sm sm:text-base text-emerald-800 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="font-extrabold text-emerald-950 underline hover:text-emerald-700 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className="w-full max-w-lg text-sm text-emerald-700 text-center font-medium">
                    &copy; {new Date().getFullYear()} Todo App. All rights reserved.
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 items-center justify-center p-12">
                <div className="relative z-10 text-center max-w-lg px-6 py-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest text-white uppercase leading-tight mb-4">
                        PRODUCTIVITY MASTERPIECE
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 my-6">
                        <span className="w-16 h-[2px] bg-emerald-300"></span>
                        <span className="text-emerald-200 text-sm">✦</span>
                        <span className="w-16 h-[2px] bg-emerald-300"></span>
                    </div>

                    <p className="text-lg sm:text-2xl font-medium text-emerald-100 tracking-wide">
                        Crafted with intention, perfected with focus.
                    </p>
                </div>
            </div>
        </div>
    );
}
