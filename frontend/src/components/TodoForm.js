"use client";
import { useState } from 'react';
import axios from '../lib/axios';

export default function TodoForm({ onTodoAdded }) {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('/todos', { title });
            onTodoAdded(res.data);
            setTitle('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                placeholder="What do you need to accomplish?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#064E3B] transition-all outline-none"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-[#064E3B] hover:bg-[#04382a] text-white px-6 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98] disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
                {loading ? 'Adding...' : '+ Add Task'}
            </button>
        </form>
    );
}
