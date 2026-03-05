import React from 'react';
import type { IntelligenceOutput } from '../lib/intelligence';
import { BarChart2 } from 'lucide-react';

interface AttributionChartProps {
    intel: IntelligenceOutput;
    hoveredAsset?: string | null;
    onHighlightSymbol?: (symbol: string | null) => void;
}

export const AttributionChart: React.FC<AttributionChartProps> = ({ intel, hoveredAsset, onHighlightSymbol }) => {
    // Combine and sort contributors by absolute impact
    const allContributors = [...intel.topContributors, ...intel.bottomContributors]
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, 5); // Show top 5 most impactful

    // Find the max absolute contribution to scale the bars
    const maxAbsContrib = Math.max(...allContributors.map(c => Math.abs(c.contribution)), 0.01);

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-slate-400" />
                Performance Attribution
            </h3>

            <div className="space-y-3">
                {allContributors.map(c => {
                    const isPositive = c.contribution >= 0;
                    const percent = (Math.abs(c.contribution) / maxAbsContrib) * 100;
                    const isHovered = hoveredAsset === c.symbol;
                    const isOtherHovered = hoveredAsset !== null && !isHovered;

                    return (
                        <div
                            key={c.symbol}
                            className={`flex items-center gap-3 text-sm transition-all duration-300 cursor-pointer ${isOtherHovered ? 'opacity-30' : 'opacity-100'}`}
                            onMouseEnter={() => onHighlightSymbol?.(c.symbol)}
                            onMouseLeave={() => onHighlightSymbol?.(null)}
                        >
                            <span className="w-12 font-medium text-slate-300 shrink-0">{c.symbol}</span>

                            <div className="flex-1 grid grid-cols-2 gap-0 relative h-5 items-center">
                                {/* Negative Side */}
                                <div className="flex justify-end pr-1 h-full items-center">
                                    {!isPositive && (
                                        <div
                                            className="h-1.5 rounded-l-full transition-all duration-500 ease-out flex items-center"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: c.color,
                                                boxShadow: isHovered ? `0 0 10px ${c.color}80` : 'none'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Center Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-600/50 -translate-x-1/2 z-10" />

                                {/* Positive Side */}
                                <div className="flex justify-start pl-1 h-full items-center">
                                    {isPositive && (
                                        <div
                                            className="h-1.5 rounded-r-full transition-all duration-500 ease-out flex items-center"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: c.color,
                                                boxShadow: isHovered ? `0 0 10px ${c.color}80` : 'none'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <span className={`w-12 text-right shrink-0 font-medium text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{(c.contribution * 100).toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
