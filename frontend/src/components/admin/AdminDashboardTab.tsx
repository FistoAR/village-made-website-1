import React from 'react';
import { 
  BarChart3, Users, ShoppingBag, DollarSign, Activity, AlertCircle 
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
  return (
    <div className="space-y-8">
      {/* Low Stock Banner Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-250 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-jakarta">
          <div className="flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-850 text-xs sm:text-sm block">Low Stock Alert ({lowStockProducts.length} Items)</span>
              <span className="text-[10px] text-amber-700 font-medium">Certain provisions have inventory stock under 10 units. Check stock logs immediately.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Update Stock
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Sales', val: `₹${stats.totalSales.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Customers', val: stats.totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Placed Orders', val: stats.totalOrders, icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending Processing', val: stats.pendingOrders, icon: Activity, color: 'text-rose-600 bg-rose-50' }
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="border border-[#d3c099] rounded-2xl p-5 flex items-center justify-between bg-stone-50/20">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1 font-jakarta">{s.label}</span>
                <span className="text-xl sm:text-2xl font-black text-stone-900">{s.val}</span>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main section: System Log & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8">
        {/* Recent Orders List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
            <ShoppingBag className="w-4.5 h-4.5 text-[#C56C4F]" />
            Recent Placed Orders
          </h3>
          <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#d3c099] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-500 font-extrabold uppercase tracking-wider">
                    <th className="p-3.5 pl-5 border border-[#d3c099]">Order ID</th>
                    <th className="p-3.5 border border-[#d3c099]">Customer</th>
                    <th className="p-3.5 border border-[#d3c099]">Total</th>
                    <th className="p-3.5 pr-5 border border-[#d3c099]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c099]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400 font-medium font-jakarta border border-[#d3c099]">No orders recorded yet.</td>
                    </tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                        <td className="p-3.5 pl-5 font-bold text-stone-850 font-jakarta border border-[#d3c099]">{o.id}</td>
                        <td className="p-3.5 text-stone-600 border border-[#d3c099]">
                          <div className="font-semibold">{o.customerName || 'Walk-in User'}</div>
                          <div className="text-[10px] text-stone-455">{o.customerMobile}</div>
                        </td>
                        <td className="p-3.5 font-bold text-stone-850 border border-[#d3c099]">₹{o.total}</td>
                        <td className="p-3.5 pr-5 border border-[#d3c099]">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                            o.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
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
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-[#384401]" />
            Warehouse Diagnostics
          </h3>
          <div className="border border-[#d3c099] rounded-2xl p-5 space-y-4.5 bg-stone-50/20 font-jakarta">
            {[
              { label: 'Postgres Connection', status: 'Healthy', ping: '12ms', dot: 'bg-green-500' },
              { label: 'Express Router Server', status: 'Online', ping: 'port 5001', dot: 'bg-green-500' },
              { label: 'Active Low Stock Flags', status: 'Triggered', ping: `${lowStockProducts.length} flags`, dot: lowStockProducts.length > 0 ? 'bg-amber-500' : 'bg-green-500' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                  <span className="text-stone-750">{item.label}</span>
                </div>
                <span className="text-stone-500 text-[11px] font-bold">{item.ping}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
