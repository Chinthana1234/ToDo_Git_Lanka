"use client";
import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleUpdate = () => {
        onUpdate(todo.id, { title: editTitle });
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-3">
                <input type="checkbox" checked={todo.is_completed} onChange={() => onUpdate(todo.id, { is_completed: !todo.is_completed })} className="h-5 w-5" />
                {isEditing ? (
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border p-1 text-black" />
                ) : (
                    <span className={`text-black ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>{todo.title}</span>
                )}
            </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <button onClick={handleUpdate} className="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                )}
                <button onClick={() => onDelete(todo.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
        </div>
    );
}
