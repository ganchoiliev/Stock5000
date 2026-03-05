import { MOCK_ASSETS } from '../services/data';
import { Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const PortfolioSummary = () => {
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY');
    const spy = MOCK_ASSETS.find(a => a.symbol === 'SPY');

    // Calculations
    const avgChange = portfolioAssets.reduce((sum, a) => sum + a.change1M, 0) / portfolioAssets.length;
    const spyChange = spy?.change1M || 0;
    const outperformance = (avgChange - spyChange).toFixed(1);
    const isOutperforming = avgChange > spyChange;

    // Sort to find best and worst
    const sorted = [...portfolioAssets].sort((a, b) => b.change1M - a.change1M);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    // Pulse Score (Out of 100) - Basic heuristic based on outperformance and positive overall
    const baseScore = 50;
    const performanceBonus = isOutperforming ? Math.min(30, Number(outperformance) * 2) : Math.max(-20, Number(outperformance) * 2);
    const positiveBonus = avgChange > 0 ? 10 : -10;
    const bestPerformerBonus = best.change1M > 10 ? 10 : 0;
    const pulseScore = Math.min(100, Math.max(0, Math.round(baseScore + performanceBonus + positiveBonus + bestPerformerBonus)));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Pulse Score Panel */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/50 transition-colors duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-all"></div>
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-1">
                            <Target size={14} className="text-teal-500" />
                            Pulse Score
                        </h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">
                                {pulseScore}
                            </span>
                            <span className="text-slate-500 text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${isOutperforming ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {isOutperforming ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isOutperforming ? '+' : ''}{outperformance}% vs S&P
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm relative z-10">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                        <span className="text-slate-500 text-xs block mb-0.5">Best Performer</span>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="font-semibold">{best.symbol}</span>
                            <span className="text-xs">+{best.change1M.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                        <span className="text-slate-500 text-xs block mb-0.5">Weakest Link</span>
                        <div className="flex items-center gap-1.5 text-rose-400">
                            <span className="font-semibold">{worst.symbol}</span>
                            <span className="text-xs">{worst.change1M > 0 ? '+' : ''}{worst.change1M.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Insight Panel */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10 group-hover:bg-indigo-500/20 transition-all"></div>
                <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3 relative z-10">
                    <Zap size={14} className="text-indigo-400" />
                    Pulse Insight
                </h2>
                <div className="relative z-10 space-y-3">
                    <p className="text-slate-200 text-sm leading-relaxed">
                        Your portfolio <span className={`font-medium ${isOutperforming ? 'text-emerald-400' : 'text-rose-400'}`}>{isOutperforming ? 'outperformed' : 'underperformed'}</span> the S&P 500 by <span className="font-semibold">{Math.abs(Number(outperformance))}%</span> this month.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                            <span><strong className="text-slate-300">{best.symbol}</strong> drove the majority of portfolio gains with a stellar {best.change1M.toFixed(1)}% return.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-500 mt-1.5 shrink-0"></span>
                            <span><strong className="text-slate-300">{worst.symbol}</strong> {worst.change1M < 0 ? 'dragged down performance' : 'lagged behind other assets'} but maintained allocation.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
