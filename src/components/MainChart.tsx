import type { Timeframe } from '../services/data';
import { getNormalizedChartData, MOCK_ASSETS } from '../services/data';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';

interface MainChartProps {
    timeframe: Timeframe;
    selectedAssets: string[];
    hoveredAsset?: string | null;
}

const COLORS = {
    SPY: '#64748b',   // muted slate for benchmark
    AAPL: '#00f0ff',  // neon cyan
    AMZN: '#818cf8',  // neon indigo
    NVDA: '#00ff9d',  // neon green
    MSFT: '#3b82f6',  // blue
    BTC: '#f59e0b',   // amber
};

const CustomTooltip = ({ active, payload, label, timeframe }: any) => {
    if (active && payload && payload.length) {
        // Sort payload by value descending
        const sorted = [...payload].sort((a, b) => b.value - a.value);

        const formatDate = (val: string) => {
            const d = new Date(val);
            return timeframe === '1M'
                ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        };

        return (
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-4 shadow-2xl backdrop-blur-md min-w-[180px]">
                <p className="text-slate-400 text-xs font-medium mb-3 pb-2 border-b border-slate-700/50">
                    {formatDate(label)}
                </p>
                <div className="space-y-2.5">
                    {sorted.map((entry, index) => {
                        const isLeader = index === 0 && entry.value > 100;
                        const isPositive = entry.value >= 100;
                        // Since chart is base 100, (value - 100) is the % change
                        const pctChange = (entry.value - 100).toFixed(1);

                        return (
                            <div key={entry.name} className={`flex items-center justify-between gap-4 text-sm ${isLeader ? 'font-semibold' : ''}`} style={{ color: entry.color }}>
                                <div className="flex items-center gap-1.5">
                                    {isLeader && <Trophy size={13} className="text-amber-400" />}
                                    <span>{entry.name}</span>
                                </div>
                                <div className={`flex items-center gap-1 opacity-90`}>
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span>{isPositive ? '+' : ''}{pctChange}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export const MainChart: React.FC<MainChartProps> = ({ timeframe, selectedAssets, hoveredAsset }) => {
    const data = getNormalizedChartData(timeframe);
    const benchmark = MOCK_ASSETS.find(a => a.symbol === 'SPY');
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY' && selectedAssets.includes(a.symbol));

    return (
        <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
                        tickFormatter={(val) => {
                            const d = new Date(val);
                            if (timeframe === '1M') {
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }
                            return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                        }}
                        minTickGap={timeframe === '1M' ? 5 : 30}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
                    />
                    <Tooltip
                        content={<CustomTooltip timeframe={timeframe} />}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '14px', color: '#cbd5e1', fontFamily: 'Poppins, sans-serif' }}
                    />

                    {/* Benchmark Line */}
                    {benchmark && (
                        <Line
                            key={benchmark.symbol}
                            type="monotone"
                            dataKey={benchmark.symbol}
                            stroke={COLORS[benchmark.symbol as keyof typeof COLORS]}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6, fill: COLORS[benchmark.symbol as keyof typeof COLORS], stroke: '#0a0a0f', strokeWidth: 2 }}
                            strokeOpacity={hoveredAsset && hoveredAsset !== benchmark.symbol ? 0.2 : 1}
                            isAnimationActive={true}
                            animationDuration={1000}
                        />
                    )}

                    {/* Portfolio Asset Lines */}
                    {portfolioAssets.map((asset) => {
                        const color = COLORS[asset.symbol as keyof typeof COLORS];
                        const isHovered = hoveredAsset === asset.symbol;
                        const isOtherHovered = hoveredAsset !== null && !isHovered;

                        return (
                            <Line
                                key={asset.symbol}
                                type="monotone"
                                dataKey={asset.symbol}
                                stroke={color}
                                strokeWidth={isHovered ? 4 : 3}
                                dot={false}
                                activeDot={{ r: 6, fill: color, stroke: '#0a0a0f', strokeWidth: 2 }}
                                strokeOpacity={isOtherHovered ? 0.15 : 1}
                                style={{
                                    filter: isOtherHovered ? 'none' : `drop-shadow(0px 0px ${isHovered ? '12px' : '8px'} ${color}80)`,
                                    transition: 'all 0.3s ease'
                                }}
                                isAnimationActive={true}
                                animationDuration={1000}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
