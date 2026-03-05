import { getActiveAssets, getActiveBenchmark } from '../services/data';
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
    hoveredAsset?: string | null;
    setHoveredAsset?: (symbol: string | null) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ selectedAssets, onToggleAsset, hoveredAsset, setHoveredAsset }) => {
    const portfolioAssets = getActiveAssets();
    const benchmark = getActiveBenchmark();

    return (
        <div className="flex flex-col gap-3">
            {portfolioAssets.map((asset) => {
                const isPositive = asset.change1M >= 0;
                const isActive = selectedAssets.includes(asset.symbol);
                const isHovered = hoveredAsset === asset.symbol;

                // Color mapping matching the chart
                const COLORS: Record<string, string> = { AAPL: '#00f0ff', AMZN: '#818cf8', NVDA: '#00ff9d', MSFT: '#3b82f6', BTC: '#f59e0b' };
                const assetColor = COLORS[asset.symbol] || '#00ff9d';

                // For the relative performance bar vs SPY (just a visual heuristic)
                const relPerf = asset.change1M - (benchmark?.change1M || 0);
                const normalizedWidth = Math.min(100, Math.max(5, Math.abs(relPerf) * 4)); // arbitrary scaling for visual

                return (
                    <div
                        key={asset.symbol}
                        onClick={() => onToggleAsset(asset.symbol)}
                        onMouseEnter={() => setHoveredAsset?.(asset.symbol)}
                        onMouseLeave={() => setHoveredAsset?.(null)}
                        className={`group flex flex-col p-4 rounded-xl cursor-pointer relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${isHovered ? 'bg-slate-800/90 shadow-lg z-10' : isActive ? 'bg-slate-800/60' : 'bg-slate-800/30 grayscale hover:grayscale-0'
                            }`}
                        style={{
                            borderColor: isHovered ? assetColor : (isActive ? `${assetColor}50` : 'rgba(51, 65, 85, 0.5)'),
                            boxShadow: isHovered ? `0 0 20px ${assetColor}40` : (isActive ? `0 0 10px ${assetColor}10` : 'none')
                        }}
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

                        <div className="flex justify-between items-end border-t border-slate-700/30 pt-3 mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <div className="flex-1 mr-4">
                                <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                                    <span>vs {benchmark.name}</span>
                                    <span className={relPerf > 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}>{relPerf > 0 ? '+' : ''}{relPerf.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden flex">
                                    {relPerf < 0 && <div className="flex-1 flex justify-end"><div className="bg-rose-500/80 h-full rounded-l-full" style={{ width: `${normalizedWidth}%` }}></div></div>}
                                    <div className="w-[2px] h-full bg-slate-600 z-10"></div>
                                    {relPerf >= 0 && <div className="flex-1"><div className="bg-emerald-500/80 h-full rounded-r-full" style={{ width: `${normalizedWidth}%` }}></div></div>}
                                </div>
                            </div>
                            <div className="w-24 shrink-0">
                                <AssetSparkline asset={asset} isActive={isActive} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
