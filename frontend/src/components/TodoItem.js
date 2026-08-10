"use client";
import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleUpdate = () => {
        if (!editTitle.trim()) return;
        onUpdate(todo.id, { title: editTitle });
        setIsEditing(false);
    };

    return (
        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${todo.is_completed ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-[#064E3B]/30 hover:shadow-md'}`}>
            <div className="flex items-start gap-3.5 mb-4">
                <button
                    onClick={() => onUpdate(todo.id, { is_completed: !todo.is_completed })}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${todo.is_completed ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-gray-300 bg-white hover:border-[#064E3B]'}`}
                >
                    {todo.is_completed && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {isEditing ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-[#064E3B] rounded-lg text-sm text-gray-900 outline-none"
                        autoFocus
                    />
                ) : (
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed break-words ${todo.is_completed ? 'line-through text-gray-400 font-normal' : 'text-gray-900 font-semibold'}`}>
                            {todo.title}
                        </p>
                        <span className={`inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${todo.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {todo.is_completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200/60 justify-end">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleUpdate}
                            className="px-3 py-1.5 bg-[#064E3B] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#04382a] transition-colors cursor-pointer"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setEditTitle(todo.title); }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 text-gray-600 hover:text-[#064E3B] hover:bg-[#064E3B]/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(todo.id)}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
