import { MOCK_ASSETS } from '../services/data';
import type { AssetData } from '../services/data';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

const AssetSparkline = ({ asset, isActive }: { asset: AssetData, isActive: boolean }) => {
    const isPositive = asset.change1M >= 0;
    const color = isPositive ? '#00ff9d' : '#ff2a5f';

    return (
        <div className={`h-10 w-24 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}>
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
                        style={{ filter: isActive ? `drop-shadow(0px 0px 4px ${color}80)` : 'none' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AssetListProps {
    selectedAssets: string[];
    onToggleAsset: (symbol: string) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ selectedAssets, onToggleAsset }) => {
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY');

    return (
        <div className="flex flex-col gap-3">
            {portfolioAssets.map((asset) => {
                const isPositive = asset.change1M >= 0;
                const isActive = selectedAssets.includes(asset.symbol);

                return (
                    <div
                        key={asset.symbol}
                        onClick={() => onToggleAsset(asset.symbol)}
                        className={`group flex flex-col p-4 rounded-xl cursor-pointer relative overflow-hidden transition-all duration-300 ${isActive
                                ? 'bg-slate-800/80 border-teal-500/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60'
                            } border`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className={`font-semibold flex items-center gap-2 ${isActive ? 'text-teal-400' : 'text-slate-300'}`}>
                                    {asset.symbol}
                                    {isActive ? (
                                        <Eye size={14} className="text-teal-500/80" />
                                    ) : (
                                        <EyeOff size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </h3>
                                <p className="text-xs text-slate-400">{asset.name}</p>
                            </div>
                            <div className={`text-right ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
                                <p className="font-medium text-slate-100">${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <div className={`text-xs flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(asset.change1M).toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-700/30 pt-3 opacity-90 group-hover:opacity-100 transition-opacity">
                            <AssetSparkline asset={asset} isActive={isActive} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
