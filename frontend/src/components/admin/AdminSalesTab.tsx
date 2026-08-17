import { Sparkles } from 'lucide-react';

interface AdminSalesTabProps {
  categorySales: { category: string; amount: number }[];
  leaderboard: { name: string; quantity: number }[];
  totalSales: number;
}

export default function AdminSalesTab({
  categorySales,
  leaderboard,
  totalSales,
}: AdminSalesTabProps) {
  const comingSoon = true; // Set to false to enable sales tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Revenue analytics, distribution breakdowns, and exportable financial logs will be active shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta mb-4">
        Financial Sales Distribution
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Revenue Distribution */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#384401] font-jakarta">Revenue by Provision Category</h4>
          <div className="border border-[#d3c099] rounded-2xl p-5 space-y-4 bg-stone-50/20 font-jakarta">
            {categorySales.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs font-semibold">No category data recorded yet. Place orders to generate reports.</div>
            ) : (
              categorySales.map((c, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-855">
                    <span>{c.category}</span>
                    <span>₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#384401] rounded-full" 
                      style={{ width: `${Math.min(100, (c.amount / (totalSales || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products Leaderboard */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#C56C4F] font-jakarta">Top Selling Products</h4>
          <div className="border border-[#d3c099] rounded-2xl p-5 space-y-4 bg-stone-50/20 font-jakarta">
            {leaderboard.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs font-semibold">No sales recorded yet.</div>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#C56C4F]/10 text-[#C56C4F] flex items-center justify-center text-[10px] font-extrabold">#{idx+1}</span>
                    <span className="text-stone-800 font-jakarta">{item.name}</span>
                  </div>
                  <span className="text-stone-500 font-jakarta">{item.quantity} Units</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
