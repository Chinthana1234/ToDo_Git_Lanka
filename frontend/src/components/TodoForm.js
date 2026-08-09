"use client";
import { useState } from 'react';
import axios from '../lib/axios';

export default function TodoForm({ onTodoAdded }) {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            const res = await axios.post('/todos', { title });
            onTodoAdded(res.data);
            setTitle('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input type="text" placeholder="Add a new todo..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 p-2 border rounded text-black" required />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
        </form>
    );
}
