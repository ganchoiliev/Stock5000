import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';

export const ReviewNoteInput: React.FC = () => {
    const [note, setNote] = useState('');
    const [saved, setSaved] = useState(false);

    // Get current week identifier (e.g., "2023-W42")
    const getWeekId = () => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    };

    const weekId = getWeekId();
    const storageKey = `portfolio-review-note-${weekId}`;

    useEffect(() => {
        const savedNote = localStorage.getItem(storageKey);
        if (savedNote) {
            setNote(savedNote);
        }
    }, [storageKey]);

    const handleSave = () => {
        localStorage.setItem(storageKey, note);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-slate-300">
                    Weekly Synthesis Note
                </h3>
                <span className="text-xs text-slate-500 font-mono tracking-wider">{weekId}</span>
            </div>

            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What drove performance this week? Any adjustments needed? Trust the process."
                className="w-full h-32 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all resize-none mb-4"
            />

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!note.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${saved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : note.trim()
                                ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                >
                    {saved ? (
                        <>
                            <Check size={16} /> Saved
                        </>
                    ) : (
                        <>
                            <Save size={16} /> Save Note
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
