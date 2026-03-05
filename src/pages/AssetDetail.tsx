
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getAssetBySymbol } from '../services/data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AssetDetail = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();

    const asset = getAssetBySymbol(symbol?.toUpperCase() || '');

    if (!asset) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-2xl font-semibold mb-4 text-slate-300">Asset not found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        );
    }

    const isPositive1M = asset.change1M >= 0;
    const isPositive12M = asset.change12M >= 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 text-sm font-medium w-max"
            >
                <ArrowLeft size={16} /> Portfolio
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{asset.symbol}</h1>
                            <p className="text-slate-400">{asset.name}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-bold tracking-tight mb-1">
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex gap-4 items-center justify-end text-sm">
                        <div className={`flex items-center gap-1 ${isPositive1M ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className="text-slate-500 mr-1">1M</span>
                            {isPositive1M ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(asset.change1M).toFixed(2)}%
                        </div>
                        <div className={`flex items-center gap-1 ${isPositive12M ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className="text-slate-500 mr-1">1Y</span>
                            {isPositive12M ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(asset.change12M).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mt-8">
                <h2 className="text-lg font-medium mb-6">12 Month Price History</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={asset.history12M} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                                }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#14b8a6' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
