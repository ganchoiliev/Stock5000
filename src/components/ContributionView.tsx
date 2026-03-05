
import { MOCK_ASSETS } from '../services/data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#14b8a6', '#8b5cf6', '#34d399', '#3b82f6', '#f59e0b'];

interface ContributionViewProps {
    hoveredAsset?: string | null;
    setHoveredAsset?: (symbol: string | null) => void;
}

export const ContributionView: React.FC<ContributionViewProps> = ({ hoveredAsset, setHoveredAsset }) => {
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY');

    // Mocking equal initial allocation that drifted based on 1M change
    const data = portfolioAssets.map((asset, index) => {
        // base 20% allocation + drift from 1M performance
        const weight = 20 * (1 + (asset.change1M / 100));
        return {
            name: asset.symbol,
            value: Math.max(0.1, weight), // ensure no negative weights in pie
            actualPercent: 0, // will calculate below
            color: COLORS[index % COLORS.length]
        };
    });

    const total = data.reduce((sum, item) => sum + item.value, 0);
    data.forEach(item => {
        item.actualPercent = (item.value / total) * 100;
    });

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 sm:p-6 h-full flex flex-col">
            <h2 className="text-lg font-medium mb-2">Current Allocation</h2>
            <p className="text-sm text-slate-400 mb-6">Estimated drift from equal weight</p>

            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => {
                                const isHovered = hoveredAsset === entry.name;
                                const isOtherHovered = hoveredAsset && !isHovered;

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={isOtherHovered ? 0.3 : 1}
                                        stroke={isHovered ? '#fff' : 'none'}
                                        strokeWidth={isHovered ? 2 : 0}
                                        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredAsset?.(entry.name)}
                                        onMouseLeave={() => setHoveredAsset?.(null)}
                                    />
                                );
                            })}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ fontSize: '14px', color: '#f8fafc' }}
                            formatter={(_value: any, name: any, props: any) => [
                                `${props.payload.actualPercent.toFixed(1)}%`,
                                name
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                    <span className="text-2xl font-semibold text-slate-200">5</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Assets</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mt-4">
                {data.sort((a, b) => b.value - a.value).map(item => {
                    const isHovered = hoveredAsset === item.name;
                    const isOtherHovered = hoveredAsset && !isHovered;

                    return (
                        <div
                            key={item.name}
                            className={`flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer p-1 rounded-md ${isHovered ? 'bg-slate-700/50' : ''} ${isOtherHovered ? 'opacity-40 grayscale' : ''}`}
                            onMouseEnter={() => setHoveredAsset?.(item.name)}
                            onMouseLeave={() => setHoveredAsset?.(null)}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, filter: isHovered ? `drop-shadow(0px 0px 4px ${item.color}80)` : 'none' }} />
                            <span className={`font-medium ${isHovered ? 'text-slate-100' : 'text-slate-300'}`}>{item.name}</span>
                            <span className="text-slate-500 ml-auto">{item.actualPercent.toFixed(1)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
