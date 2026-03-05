import { MOCK_ASSETS } from '../services/data';
import type { AssetData } from '../services/data';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssetSparkline = ({ asset }: { asset: AssetData }) => {
    const isPositive = asset.change1M >= 0;
    const color = isPositive ? '#34d399' : '#fb7185';

    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asset.history1M}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const AssetList = () => {
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY');

    return (
        <div className="flex flex-col gap-3">
            {portfolioAssets.map((asset) => {
                const isPositive = asset.change1M >= 0;

                return (
                    <Link
                        key={asset.symbol}
                        to={`/asset/${asset.symbol.toLowerCase()}`}
                        className="group flex flex-col p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                                    {asset.symbol}
                                    <ChevronRight size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                                </h3>
                                <p className="text-xs text-slate-400">{asset.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <div className={`text-xs flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(asset.change1M).toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-700/30 pt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <AssetSparkline asset={asset} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
