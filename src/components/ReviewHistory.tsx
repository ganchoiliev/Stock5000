import { useState, useEffect, useCallback } from 'react';
import { Clock, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface WeekNote {
    weekId: string;
    note: string;
    dateRange: string;
}

const getWeekDateRange = (weekId: string): string => {
    const [yearStr, weekStr] = weekId.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    if (isNaN(year) || isNaN(week)) return weekId;

    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const mondayW1 = new Date(jan4);
    mondayW1.setDate(jan4.getDate() - dayOfWeek + 1);

    const monday = new Date(mondayW1);
    monday.setDate(mondayW1.getDate() + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const sameYear = monday.getFullYear() === sunday.getFullYear();
    return sameYear
        ? `${fmt(monday)} – ${fmt(sunday)}, ${monday.getFullYear()}`
        : `${fmt(monday)} ${monday.getFullYear()} – ${fmt(sunday)} ${sunday.getFullYear()}`;
};

const getCurrentWeekId = (): string => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

const loadHistory = (currentWeekId: string): WeekNote[] => {
    const notes: WeekNote[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('portfolio-review-note-')) continue;
        const weekId = key.replace('portfolio-review-note-', '');
        if (weekId === currentWeekId) continue;
        const note = localStorage.getItem(key) || '';
        if (note.trim()) {
            notes.push({ weekId, note, dateRange: getWeekDateRange(weekId) });
        }
    }
    return notes.sort((a, b) => b.weekId.localeCompare(a.weekId));
};

export const ReviewHistory = () => {
    const currentWeekId = getCurrentWeekId();
    const [history, setHistory] = useState<WeekNote[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        setHistory(loadHistory(currentWeekId));
    }, [currentWeekId]);

    const toggleExpand = (weekId: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(weekId) ? next.delete(weekId) : next.add(weekId);
            return next;
        });
    };

    const handleDelete = useCallback((weekId: string) => {
        if (deleteConfirm === weekId) {
            localStorage.removeItem(`portfolio-review-note-${weekId}`);
            setHistory(prev => prev.filter(n => n.weekId !== weekId));
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(weekId);
            setTimeout(() => setDeleteConfirm(prev => prev === weekId ? null : prev), 3000);
        }
    }, [deleteConfirm]);

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-500">
                <BookOpen size={32} className="opacity-40" />
                <p className="text-sm">No past reviews yet.</p>
                <p className="text-xs text-slate-600">Write your first synthesis note above and it will appear here next week.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-4 border-l border-slate-700/50 space-y-3">
            {history.map((entry, idx) => {
                const isExpanded = expanded.has(entry.weekId);
                const isLong = entry.note.length > 200;
                const isFirst = idx === 0;

                return (
                    <div
                        key={entry.weekId}
                        className={`relative rounded-xl border p-4 transition-all duration-200 ${isFirst ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-700/40 bg-slate-800/30'}`}
                    >
                        {/* Timeline dot */}
                        <div className={`absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full border-2 ${isFirst ? 'bg-indigo-400 border-indigo-500' : 'bg-slate-600 border-slate-500'}`} />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono text-xs font-semibold ${isFirst ? 'text-indigo-400' : 'text-slate-400'}`}>
                                        {entry.weekId}
                                    </span>
                                    {isFirst && (
                                        <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                                            Most Recent
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500">
                                    <Clock size={10} />
                                    <span>{entry.dateRange}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(entry.weekId)}
                                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border transition-all ${
                                    deleteConfirm === entry.weekId
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-medium'
                                        : 'text-slate-600 border-slate-700/50 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10'
                                }`}
                                title="Delete this note"
                            >
                                <Trash2 size={11} />
                                {deleteConfirm === entry.weekId ? 'Confirm?' : 'Delete'}
                            </button>
                        </div>

                        {/* Note body */}
                        <p className={`text-sm text-slate-300 leading-relaxed whitespace-pre-wrap ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                            {entry.note}
                        </p>

                        {isLong && (
                            <button
                                onClick={() => toggleExpand(entry.weekId)}
                                className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {isExpanded ? (
                                    <><ChevronUp size={12} /> Show less</>
                                ) : (
                                    <><ChevronDown size={12} /> Show more</>
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
