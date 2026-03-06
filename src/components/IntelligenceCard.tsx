import React from 'react';
import type { IntelligenceOutput } from '../lib/intelligence';
import { Info, Activity, AlertTriangle, Filter, Target } from 'lucide-react';
import type { Timeframe } from '../services/data';

interface IntelligenceCardProps {
    intel: IntelligenceOutput;
    timeframe: Timeframe;
    hoveredAsset?: string | null;
    onHighlightSymbol?: (symbol: string | null) => void;
}

const getPulseColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    if (score >= 40) return 'text-sky-400 border-sky-500/30 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.2)]';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
};

const getPulseLabel = (score: number) => {
    if (score >= 70) return 'Hot';
    if (score >= 40) return 'Normal';
    return 'Calm';
};

const TooltipIcon = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info size={12} className="text-slate-500 cursor-help" />
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700 shadow-xl z-50 pointer-events-none">
            {text}
            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
        </div>
    </div>
);

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({ intel, timeframe, hoveredAsset, onHighlightSymbol }) => {
    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50 relative overflow-hidden group/card mt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 pointer-events-none" />

            {/* Top Row: Pulse Score & Timeframe */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Target className="text-slate-400" size={18} />
                        <h2 className="text-lg font-medium text-slate-100">Portfolio Pulse</h2>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 text-xs font-semibold border border-slate-600/30">
                        {timeframe}
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getPulseColor(intel.pulseScore)} transition-colors duration-500`}>
                    <Activity size={14} className={intel.pulseScore >= 70 ? 'animate-pulse' : ''} />
                    <span className="font-bold text-sm tracking-wide">
                        {intel.pulseScore} <span className="opacity-60 text-xs font-normal ml-1">{getPulseLabel(intel.pulseScore)}</span>
                    </span>
                </div>
            </div>

            {/* Middle: Summary */}
            <div className="mb-6 relative z-10">
                <p className="text-slate-300 leading-relaxed text-[15px] font-medium tracking-wide">
                    {intel.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                    <span className="flex items-center">
                        Alpha: {(intel.alpha * 100).toFixed(1)}% <TooltipIcon text="Portfolio return minus benchmark (S&P 500) return." />
                    </span>
                    <span className="flex items-center">
                        Volatility: {(intel.vol * 100).toFixed(1)}% <TooltipIcon text="Standard deviation of daily returns, representing risk." />
                    </span>
                    <span className="flex items-center">
                        Max DD: {(intel.maxDrawdown * 100).toFixed(1)}% <TooltipIcon text="Maximum peak-to-trough drop in the period." />
                    </span>
                    <span className="flex items-center">
                        Sharpe: {intel.sharpeRatio.toFixed(2)} <TooltipIcon text="Risk-adjusted return (calculated using 4% annualized risk-free rate)." />
                    </span>
                    <span className="flex items-center">
                        Sortino: <span className={`ml-1 font-semibold ${intel.sortinoRatio > 2 ? 'text-emerald-400' : intel.sortinoRatio > 1 ? 'text-sky-400' : 'text-slate-300'}`}>{intel.sortinoRatio.toFixed(2)}</span> <TooltipIcon text="Like Sharpe, but only penalizes downside volatility. More relevant for portfolios with crypto." />
                    </span>
                    <span className="flex items-center">
                        Beta: <span className={`ml-1 font-semibold ${intel.beta > 1.5 ? 'text-rose-400' : intel.beta > 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>{intel.beta.toFixed(2)}</span> <TooltipIcon text="Sensitivity to benchmark moves. Beta > 1 means the portfolio swings more than the market." />
                    </span>
                </div>
            </div>

            {/* Bottom: Drivers & Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 border-t border-slate-700/50 pt-4">
                {/* Drivers */}
                <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                        <Filter size={12} /> Key Drivers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {intel.topContributors.map(c => (
                            <div
                                key={c.symbol}
                                onMouseEnter={() => onHighlightSymbol?.(c.symbol)}
                                onMouseLeave={() => onHighlightSymbol?.(null)}
                                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${hoveredAsset === c.symbol ? 'scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'} bg-slate-900 border`}
                                style={{
                                    borderColor: hoveredAsset === c.symbol ? c.color : `${c.color}40`,
                                    color: c.color,
                                    boxShadow: hoveredAsset === c.symbol ? `0 0 12px ${c.color}40` : 'none'
                                }}
                            >
                                {c.symbol} +{(c.contribution * 100).toFixed(1)}%
                            </div>
                        ))}
                        {intel.bottomContributors.map(c => (
                            <div
                                key={c.symbol}
                                onMouseEnter={() => onHighlightSymbol?.(c.symbol)}
                                onMouseLeave={() => onHighlightSymbol?.(null)}
                                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${hoveredAsset === c.symbol ? 'scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'} bg-slate-900 border`}
                                style={{
                                    borderColor: hoveredAsset === c.symbol ? c.color : `${c.color}40`,
                                    color: c.color,
                                    boxShadow: hoveredAsset === c.symbol ? `0 0 12px ${c.color}40` : 'none'
                                }}
                            >
                                {c.symbol} {(c.contribution * 100).toFixed(1)}%
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flags */}
                {intel.flags.length > 0 && (
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={12} /> Active Flags
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            {intel.flags.map((flag, idx) => {
                                let colorClass = 'text-amber-400 bg-amber-400/10 border-amber-500/30'; // warn
                                if (flag.level === 'risk') colorClass = 'text-rose-400 bg-rose-400/10 border-rose-500/30';

                                return (
                                    <div key={idx} className={`flex items-center gap-2 px-2 py-1 rounded border text-[11px] font-medium w-fit ${colorClass}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${flag.level === 'risk' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                        <span>{flag.type}: {flag.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
