"use client";
import { useState, useRef } from 'react';

function getDueDateInfo(dueDateStr) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffMs = due - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    const formatted = due.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    const timeStr = due.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    if (diffMs < 0) {
        return { text: `Overdue · ${formatted} ${timeStr}`, color: 'text-red-600 bg-red-50', icon: '⚠️' };
    } else if (diffHours < 24) {
        return { text: `Due today · ${timeStr}`, color: 'text-amber-700 bg-amber-50', icon: '⏰' };
    } else if (diffDays < 3) {
        return { text: `${formatted} · ${timeStr}`, color: 'text-orange-600 bg-orange-50', icon: '📅' };
    } else {
        return { text: `${formatted} · ${timeStr}`, color: 'text-emerald-700 bg-emerald-50', icon: '📅' };
    }
}

export default function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);
    const [editDescription, setEditDescription] = useState(todo.description || '');
    const [editDueDate, setEditDueDate] = useState(
        todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : ''
    );
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fileInputRef = useRef(null);

    const dueDateInfo = getDueDateInfo(todo.due_date);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
        }
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('description', editDescription);
        if (editDueDate) {
            formData.append('due_date', editDueDate);
        } else {
            formData.append('due_date', '');
        }
        formData.append('is_completed', todo.is_completed ? '1' : '0');
        if (editImage) {
            formData.append('image', editImage);
        }
        if (removeImage && !editImage) {
            formData.append('remove_image', '1');
        }
        onUpdate(todo.id, formData);
        setIsEditing(false);
        setEditImage(null);
        setEditImagePreview(null);
        setRemoveImage(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditTitle(todo.title);
        setEditDescription(todo.description || '');
        setEditDueDate(todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '');
        setEditImage(null);
        setEditImagePreview(null);
        setRemoveImage(false);
    };

    const currentImageUrl = editImagePreview || (!removeImage ? todo.image_url : null);

    return (
        <>
            <div className={`rounded-none border transition-all overflow-hidden ${todo.is_completed ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-[#064E3B]/30 hover:shadow-md'}`}>
                {/* Image Banner */}
                {!isEditing && todo.image_url && (
                    <button
                        type="button"
                        onClick={() => setShowFullImage(true)}
                        className="w-full block cursor-pointer border-0 p-0 bg-transparent rounded-none"
                    >
                        <img
                            src={todo.image_url}
                            alt={todo.title}
                            className="w-full h-36 object-cover rounded-none"
                        />
                    </button>
                )}

                <div className="p-5">
                    {isEditing ? (
                        /* ===== EDIT MODE ===== */
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-[#064E3B] rounded-none text-sm text-gray-900 outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Add a description..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#064E3B] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Due Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-none text-sm text-gray-900 outline-none focus:border-[#064E3B] cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Image</label>
                                {currentImageUrl ? (
                                    <div className="relative group">
                                        <img src={currentImageUrl} alt="Preview" className="w-full h-24 object-cover rounded-none border border-slate-200" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditImage(null);
                                                setEditImagePreview(null);
                                                setRemoveImage(true);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-none flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 w-full h-20 bg-white border-2 border-dashed border-slate-300 rounded-none cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/5 transition-all">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-gray-500">Upload Image</span>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-[#064E3B] text-white rounded-none text-xs font-bold uppercase tracking-wider hover:bg-[#04382a] transition-colors cursor-pointer"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ===== VIEW MODE ===== */
                        <>
                            <div className="flex items-start gap-3.5 mb-3">
                                <button
                                    onClick={() => onUpdate(todo.id, { is_completed: !todo.is_completed })}
                                    className={`w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${todo.is_completed ? 'bg-[#064E3B] border-[#064E3B] text-white' : 'border-gray-300 bg-white hover:border-[#064E3B]'}`}
                                >
                                    {todo.is_completed && (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed break-words ${todo.is_completed ? 'line-through text-gray-400 font-normal' : 'text-gray-900 font-semibold'}`}>
                                        {todo.title}
                                    </p>

                                    {todo.description && (
                                        <p className={`text-xs mt-1.5 leading-relaxed ${todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                            {todo.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                        <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none ${todo.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {todo.is_completed ? 'Completed' : 'Pending'}
                                        </span>

                                        {dueDateInfo && !todo.is_completed && (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-none ${dueDateInfo.color}`}>
                                                <span>{dueDateInfo.icon}</span>
                                                {dueDateInfo.text}
                                            </span>
                                        )}

                                        {dueDateInfo && todo.is_completed && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-none text-gray-400 bg-gray-100">
                                                📅 {dueDateInfo.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200/60 justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 text-gray-600 hover:text-[#064E3B] hover:bg-[#064E3B]/10 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Edit
                                </button>
                                {confirmDelete ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-red-600 font-medium">Sure?</span>
                                        <button
                                            onClick={() => onDelete(todo.id)}
                                            className="px-2.5 py-1.5 bg-red-500 text-white rounded-none text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors cursor-pointer"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className="px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors cursor-pointer"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Full-size Image Modal */}
            {showFullImage && todo.image_url && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-pointer"
                    onClick={() => setShowFullImage(false)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] w-full">
                        <img
                            src={todo.image_url}
                            alt={todo.title}
                            className="w-full h-full object-contain rounded-none"
                        />
                        <button
                            onClick={() => setShowFullImage(false)}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-none flex items-center justify-center text-lg font-bold hover:bg-white/40 transition-all cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
