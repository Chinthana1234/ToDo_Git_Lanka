"use client";
import { useState, useRef } from 'react';
import axios from '../lib/axios';

export default function TodoForm({ onTodoAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            if (description.trim()) formData.append('description', description);
            if (dueDate) formData.append('due_date', dueDate);
            if (image) formData.append('image', image);

            const res = await axios.post('/todos', formData);
            onTodoAdded(res.data);
            setTitle('');
            setDescription('');
            setDueDate('');
            removeImage();
            setExpanded(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="What do you need to accomplish?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setExpanded(true)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/10 transition-all outline-none"
                    required
                />
                {!expanded && (
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setExpanded(true)}
                            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border border-slate-200"
                        >
                            + Details
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#064E3B] hover:bg-[#04382a] text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                        >
                            {loading ? 'Adding...' : '+ Add Task'}
                        </button>
                    </div>
                )}
            </div>

            {expanded && (
                <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 animate-in">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            placeholder="Add more details about this task..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#064E3B] transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                Due Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 focus:border-[#064E3B] transition-all outline-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                Attachment
                            </label>
                            {imagePreview ? (
                                <div className="relative group inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-20 w-28 object-cover rounded-xl border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center gap-2 w-full h-20 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/5 transition-all">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-gray-500 font-medium">Upload Image</span>
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
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setExpanded(false);
                                setDescription('');
                                setDueDate('');
                                removeImage();
                            }}
                            className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Collapse
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#064E3B] hover:bg-[#04382a] text-white px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? 'Adding...' : '+ Add Task'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
