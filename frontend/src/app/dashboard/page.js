"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import TodoForm from '../../components/TodoForm';
import TodoItem from '../../components/TodoItem';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [todos, setTodos] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchTodos = useCallback(async () => {
        try {
            const res = await axios.get(`/todos?search=${search}&status=${filter}`);
            setTodos(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [search, filter]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchTodos();
        }
    }, [user, loading, router, fetchTodos]);

    const handleAdd = (newTodo) => setTodos([newTodo, ...todos]);

    const handleUpdate = async (id, data) => {
        try {
            let res;
            if (data instanceof FormData) {
                // Use POST route for multipart form data (file uploads)
                res = await axios.post(`/todos/${id}/update`, data);
            } else {
                // Use PUT route for simple JSON updates (e.g. toggle completion)
                res = await axios.put(`/todos/${id}`, data);
            }
            setTodos(todos.map((t) => (t.id === id ? res.data : t)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/todos/${id}`);
            setTodos(todos.filter((t) => t.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    const completedCount = todos.filter(t => t.is_completed).length;
    const pendingCount = todos.filter(t => !t.is_completed).length;
    const totalCount = todos.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F8E7C9]/40 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
                {/* Top Banner Card */}
                <div className="bg-gradient-to-r from-[#064E3B] to-[#0a6c52] text-[#F8E7C9] rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-[#F8E7C9]/70 font-bold block mb-1">
                                Workspace
                            </span>
                            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
                                Welcome back, {user.name}!
                            </h1>
                            <p className="text-sm text-[#F8E7C9]/80">
                                You have <span className="font-bold text-white">{pendingCount}</span> pending tasks today.
                            </p>
                        </div>

                        {/* Progress Badge */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 self-stretch sm:self-auto min-w-[180px] justify-between sm:justify-start">
                            <div>
                                <div className="text-2xl font-bold text-white">{progressPercent}%</div>
                                <div className="text-xs text-[#F8E7C9]/70">Completed</div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-[#F8E7C9]/40 border-t-white flex items-center justify-center font-bold text-xs">
                                {completedCount}/{totalCount}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Container Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#064E3B]/10 mb-12">

                    {/* Stats summary pill items */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div 
                            onClick={() => setFilter('all')}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${filter === 'all' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#064E3B]/40'}`}
                        >
                            <div className="text-xl sm:text-2xl font-bold">{totalCount}</div>
                            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">All Tasks</div>
                        </div>
                        <div 
                            onClick={() => setFilter('pending')}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${filter === 'pending' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:border-amber-400'}`}
                        >
                            <div className="text-xl sm:text-2xl font-bold">{pendingCount}</div>
                            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Pending</div>
                        </div>
                        <div 
                            onClick={() => setFilter('completed')}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${filter === 'completed' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:border-emerald-400'}`}
                        >
                            <div className="text-xl sm:text-2xl font-bold">{completedCount}</div>
                            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Completed</div>
                        </div>
                    </div>

                    {/* Todo Add Form */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Add New Task</h2>
                        <TodoForm onTodoAdded={handleAdd} />
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8 pt-4 border-t border-gray-100">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by task name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#064E3B] transition-all outline-none"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:border-[#064E3B] transition-all outline-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending Only</option>
                            <option value="completed">Completed Only</option>
                        </select>
                    </div>

                    {/* Todo Items Grid */}
                    <div>
                        {todos.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-[#064E3B]/10 text-[#064E3B] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    📋
                                </div>
                                <h3 className="text-base font-bold text-gray-800 mb-1">No tasks found</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                    {search ? `No tasks match "${search}". Try clearing your search.` : 'You have no tasks yet. Create one above to get started!'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {todos.map((todo) => (
                                    <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
