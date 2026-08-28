import { 
  BarChart3, Users, ShoppingBag, DollarSign, Activity, AlertCircle, Sparkles 
} from 'lucide-react';
import { ExtendedProduct, AdminOrder } from './types';

interface AdminDashboardTabProps {
  stats: {
    totalCustomers: number;
    totalOrders: number;
    pendingOrders: number;
    totalSales: number;
  };
  recentOrders: AdminOrder[];
  lowStockProducts: ExtendedProduct[];
  setActiveTab: (tab: any) => void;
}

export default function AdminDashboardTab({
  stats,
  recentOrders,
  lowStockProducts,
  setActiveTab,
}: AdminDashboardTabProps) {
  const comingSoon = false; // Set to false to enable dashboard tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">This dashboard is currently under construction and will be active in the coming weeks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-jakarta">
      {/* Welcome Banner */}
      <div className="bg-[#FAF4EE]/25 border border-[#d3c099] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#384401]">Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">Real-time summaries of your store performance, orders, and system health.</p>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              {lowStockProducts.length} Low Stock SKUs
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Manage Stock
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Sales', val: `₹${stats.totalSales.toLocaleString('en-IN')}`, icon: DollarSign, sub: 'Consolidated revenue', color: 'text-[#C56C4F]', bg: 'bg-[#FAF4EE]/25' },
          { label: 'Total Customers', val: stats.totalCustomers, icon: Users, sub: 'Registered users', color: 'text-blue-700', bg: 'bg-blue-55/5' },
          { label: 'Placed Orders', val: stats.totalOrders, icon: ShoppingBag, sub: 'Lifetime volume', color: 'text-[#384401]', bg: 'bg-[#FAF4EE]/20' },
          { label: 'Pending Processing', val: stats.pendingOrders, icon: Activity, sub: 'Awaiting dispatch', color: 'text-rose-700', bg: 'bg-rose-55/5' }
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="border border-[#d3c099] rounded-xl p-5 flex items-center justify-between bg-white shadow-2xs hover:shadow-xs transition-all duration-300">
              <div>
                <span className="text-[11px] sm:text-xs font-extrabold text-stone-500 uppercase tracking-wider block mb-1">{s.label}</span>
                <span className="text-2xl sm:text-3xl font-black text-stone-900">{s.val}</span>
                <span className="text-xs text-stone-400 block mt-0.5">{s.sub}</span>
              </div>
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main section: System Log & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6">
        {/* Recent Orders List */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C56C4F]" />
            Recent Placed Orders
          </h3>
          <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-[#d3c099] text-[#3E2C1C] font-extrabold uppercase tracking-wider text-xs">
                    <th className="p-3.5 pl-5 border-r border-[#d3c099] bg-[#FAF4EE] w-24">Order ID</th>
                    <th className="p-3.5 border-r border-[#d3c099] bg-[#FAF4EE]">Customer</th>
                    <th className="p-3.5 border-r border-[#d3c099] bg-[#FAF4EE] w-24">Total</th>
                    <th className="p-3.5 pr-5 bg-[#FAF4EE] w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c099]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400 font-bold border-r border-[#d3c099]">No orders recorded yet.</td>
                    </tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id} className="hover:bg-[#FAF4EE]/10 font-semibold text-stone-700">
                        <td className="p-3.5 pl-5 font-bold text-[#384401] border-r border-[#d3c099]">{o.id}</td>
                        <td className="p-3.5 border-r border-[#d3c099]">
                          <div className="font-extrabold text-stone-900">{o.customerName || 'Walk-in User'}</div>
                          <div className="text-xs text-stone-500 font-bold mt-0.5">{o.customerMobile}</div>
                        </td>
                        <td className="p-3.5 font-black text-stone-900 border-r border-[#d3c099]">₹{o.total}</td>
                        <td className="p-3.5 pr-5">
                          <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            o.status === 'Cancelled' || o.status === 'Return Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            o.status === 'Returned' ? 'bg-stone-100 text-stone-700 border-stone-300' :
                            'bg-amber-50 text-amber-850 border-amber-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#384401]" />
            Warehouse Diagnostics
          </h3>
          <div className="border border-[#d3c099] rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
            {[
              { label: 'Postgres Connection', status: 'Healthy', ping: '12ms', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
              { label: 'Express Router Server', status: 'Online', ping: 'port 5001', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
              { label: 'Active Low Stock Flags', status: 'Triggered', ping: `${lowStockProducts.length} flags`, dot: lowStockProducts.length > 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2 text-sm font-semibold pb-3 border-b border-[#eeddb9]/30 last:pb-0 last:border-none">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                  <span className="text-stone-700 font-bold">{item.label}</span>
                </div>
                <span className="text-stone-450 text-xs font-extrabold uppercase tracking-wider bg-stone-50 border border-[#d3c099]/30 px-2 py-0.5 rounded-md">{item.ping}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
