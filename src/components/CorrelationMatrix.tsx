import { useMemo } from 'react';
import type { Timeframe } from '../services/data';
import { computeCorrelationMatrix } from '../services/data';

interface Props {
    timeframe: Timeframe;
}

// Interpolate background color: rose (-1) → slate (0) → teal (+1)
const corrBg = (val: number): string => {
    if (val >= 0) {
        const t = val;
        const r = Math.round(51 * (1 - t) + 20 * t);
        const g = Math.round(65 * (1 - t) + 184 * t);
        const b = Math.round(85 * (1 - t) + 166 * t);
        return `rgba(${r},${g},${b},${0.12 + t * 0.65})`;
    } else {
        const t = -val;
        const r = Math.round(51 * (1 - t) + 239 * t);
        const g = Math.round(65 * (1 - t) + 68 * t);
        const b = Math.round(85 * (1 - t) + 68 * t);
        return `rgba(${r},${g},${b},${0.12 + t * 0.65})`;
    }
};

const corrTextClass = (val: number, isDiag: boolean): string => {
    if (isDiag) return 'text-slate-500';
    if (Math.abs(val) >= 0.7) return 'text-white font-semibold';
    return 'text-slate-300';
};

export const CorrelationMatrix = ({ timeframe }: Props) => {
    const { symbols, names, matrix } = useMemo(
        () => computeCorrelationMatrix(timeframe),
        [timeframe]
    );

    if (symbols.length === 0) return null;

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
            <h2 className="text-lg font-medium mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
                Correlation Matrix
            </h2>
            <p className="text-xs text-slate-400 mb-5">
                Pairwise return correlation ·{' '}
                <span className="text-rose-400">red = move opposite</span>{' '}·{' '}
                <span className="text-teal-400">teal = move together</span>
            </p>

            <div className="overflow-x-auto">
                <table className="border-collapse text-xs mx-auto">
                    <thead>
                        <tr>
                            {/* Empty corner */}
                            <th className="w-12 pb-2" />
                            {symbols.map(sym => (
                                <th key={sym} className="text-center pb-2 px-1 min-w-[52px]">
                                    <span
                                        className="font-mono font-semibold text-[11px] text-slate-300"
                                        title={names[sym]}
                                    >
                                        {sym}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {symbols.map((rowSym, i) => (
                            <tr key={rowSym}>
                                <td className="pr-2 py-0.5 text-right">
                                    <span
                                        className="font-mono font-semibold text-[11px] text-slate-300"
                                        title={names[rowSym]}
                                    >
                                        {rowSym}
                                    </span>
                                </td>
                                {symbols.map((colSym, j) => {
                                    const val = matrix[i][j];
                                    const isDiag = i === j;
                                    return (
                                        <td key={colSym} className="p-0.5">
                                            <div
                                                className="rounded px-2 py-1.5 text-center transition-colors cursor-default"
                                                style={{
                                                    backgroundColor: isDiag
                                                        ? 'rgba(30,41,59,0.8)'
                                                        : corrBg(val),
                                                    minWidth: '48px',
                                                }}
                                                title={isDiag ? rowSym : `${rowSym} / ${colSym}: ${val.toFixed(3)}`}
                                            >
                                                <span className={`font-mono text-[11px] ${corrTextClass(val, isDiag)}`}>
                                                    {isDiag ? '—' : val.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="text-rose-400 font-mono">−1.0</span>
                <div
                    className="flex-1 h-2 rounded-full"
                    style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.7), rgba(51,65,85,0.5), rgba(20,184,166,0.7))' }}
                />
                <span className="text-teal-400 font-mono">+1.0</span>
            </div>
        </div>
    );
};
