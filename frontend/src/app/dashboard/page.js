"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import TodoForm from '../../components/TodoForm';
import TodoItem from '../../components/TodoItem';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
    const { user } = useAuth();
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
        if (!user) {
            router.push('/login');
            return;
        }
        fetchTodos();
    }, [user, router, fetchTodos]);

    const handleAdd = (newTodo) => setTodos([...todos, newTodo]);

    const handleUpdate = async (id, data) => {
        try {
            const res = await axios.put(`/todos/${id}`, data);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-black">My Todos</h1>
                <TodoForm onTodoAdded={handleAdd} />
                <div className="flex gap-4 mb-6">
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded text-black flex-1" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded text-black">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    {todos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
                    ))}
                </div>
            </div>
        </div>
    );
}
