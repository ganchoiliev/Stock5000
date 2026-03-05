import { getActiveAssets } from '../services/data';
import { Calendar } from 'lucide-react';

export const PerformanceHeatmap = () => {
    const portfolioAssets = getActiveAssets();

    // We mock 4 weeks of data based on the total 1M change to provide a realistic-looking heatmap trend.
    const generateWeeklyBlocks = (totalChange: number) => {
        // Simple heuristic: if total change is very positive, mostly green. If very negative, mostly red.
        const blocks = [];
        let remaining = totalChange;

        for (let i = 0; i < 4; i++) {
            // Add some randomness, but loosely follow the trend
            const isLast = i === 3;
            const weekChange = isLast ? remaining : (totalChange / 4) + (Math.random() * 4 - 2);
            remaining -= weekChange;

            blocks.push(weekChange);
        }
        return blocks;
    };

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50 overflow-hidden">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                4-Week Performance Heat Map
            </h2>

            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="min-w-[400px]">
                    <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 mb-3 text-xs font-medium text-slate-500 text-center">
                        <div className="text-left pl-2">Asset</div>
                        <div>Week 1</div>
                        <div>Week 2</div>
                        <div>Week 3</div>
                        <div>Week 4</div>
                    </div>

                    <div className="space-y-3">
                        {portfolioAssets.map(asset => {
                            const weeks = generateWeeklyBlocks(asset.change1M);
                            return (
                                <div key={asset.symbol} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 items-center group">
                                    <div className="font-medium text-sm text-slate-300 group-hover:text-slate-100 transition-colors pl-2">
                                        {asset.symbol}
                                    </div>
                                    {weeks.map((val, i) => {
                                        // Color logic: strong positive -> bright green, slight positive -> dull green, etc.
                                        let bgColor = 'bg-slate-700'; // neutral
                                        if (val > 3) bgColor = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                                        else if (val > 0) bgColor = 'bg-emerald-500/50';
                                        else if (val < -3) bgColor = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
                                        else if (val < 0) bgColor = 'bg-rose-500/50';

                                        return (
                                            <div
                                                key={i}
                                                className={`h-8 rounded-[4px] ${bgColor} transition-all duration-300 group-hover:scale-[1.02] flex items-center justify-center text-[10px] font-medium text-white/90 opacity-90 group-hover:opacity-100`}
                                                title={`${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
                                            >
                                                {val > 0 ? '+' : ''}{val.toFixed(1)}%
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
