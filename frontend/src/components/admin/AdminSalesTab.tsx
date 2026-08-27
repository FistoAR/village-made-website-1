import { useState, useEffect } from 'react';
import { Sparkles, DollarSign, Calendar, CreditCard, MapPin, TrendingUp, ShoppingBag, BarChart3, SlidersHorizontal, Tag, ArrowUpDown } from 'lucide-react';
import { AdminOrder } from './types';

interface AdminSalesTabProps {
  categorySales: { category: string; amount: number }[];
  leaderboard: { name: string; quantity: number }[];
  totalSales: number;
  orders: AdminOrder[];
}

export default function AdminSalesTab({
  categorySales,
  leaderboard,
  totalSales,
  orders,
}: AdminSalesTabProps) {
  const comingSoon = false; // Set to false to enable sales tab
  const [dateFilter, setDateFilter] = useState('All');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  
  // Breakdown switcher tab
  const [breakdownTab, setBreakdownTab] = useState<'products' | 'categories' | 'payments' | 'locations'>('products');

  // Retrieve unique filter options from database
  const uniqueCities = Array.from(new Set(orders.map(o => o.address?.city).filter(Boolean))) as string[];
  const uniquePaymentMethods = Array.from(new Set(orders.map(o => o.paymentMethod || 'COD').filter(Boolean))) as string[];

  // Helper to parse DD/MM/YYYY dates
  const parseOrderDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Filter orders based on selected criteria
  const filteredOrders = orders.filter(o => {
    // 1. Date Filter
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const orderDate = parseOrderDate(o.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        const checkDate = new Date(orderDate);
        checkDate.setHours(0, 0, 0, 0);
        matchesDate = checkDate.getTime() === today.getTime();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      } else if (dateFilter === 'custom') {
        const checkDate = new Date(orderDate);
        checkDate.setHours(0, 0, 0, 0);
        let startMatch = true;
        let endMatch = true;
        if (customFromDate) {
          const from = new Date(customFromDate);
          from.setHours(0, 0, 0, 0);
          startMatch = checkDate >= from;
        }
        if (customToDate) {
          const to = new Date(customToDate);
          to.setHours(23, 59, 59, 999);
          endMatch = checkDate <= to;
        }
        matchesDate = startMatch && endMatch;
      }
    }

    // 2. Payment Method Filter
    let matchesPayment = true;
    if (paymentFilter !== 'All') {
      const payMethod = o.paymentMethod || 'COD';
      matchesPayment = payMethod.toLowerCase() === paymentFilter.toLowerCase();
    }

    // 3. Location/City Filter
    let matchesCity = true;
    if (cityFilter !== 'All') {
      const city = o.address?.city || 'Unknown';
      matchesCity = city.toLowerCase() === cityFilter.toLowerCase();
    }

    return matchesDate && matchesPayment && matchesCity;
  });

  // Summary Metrics Computation
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalRefunds = 0;
  let itemsSold = 0;

  filteredOrders.forEach(o => {
    if (o.status !== 'Cancelled') {
      grossSales += (o.subtotal || o.total || 0);
      const calculatedDiscount = Math.max(0, (o.subtotal || 0) - (o.total || 0));
      totalDiscounts += calculatedDiscount;
    }

    if (o.status === 'Returned' || o.refundStatus === 'refunded' || o.paymentStatus === 'refunded') {
      totalRefunds += (o.total || 0);
    }

    if (o.status !== 'Cancelled' && o.status !== 'Returned') {
      const items = o.items || [];
      items.forEach(item => {
        itemsSold += (item.quantity || 1);
      });
    }
  });

  const netSales = grossSales - totalRefunds;
  const totalOrdersCount = filteredOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? (netSales / totalOrdersCount) : 0;

  // Breakdown by Category
  const categoryBreakdown: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'Cancelled' || o.status === 'Returned') return;
    const items = o.items || [];
    items.forEach(item => {
      const cat = item.category || 'Malt';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Breakdown by Product
  const productBreakdown: Record<string, { qty: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'Cancelled' || o.status === 'Returned') return;
    const items = o.items || [];
    items.forEach(item => {
      const name = item.name || 'Unknown Product';
      if (!productBreakdown[name]) {
        productBreakdown[name] = { qty: 0, revenue: 0 };
      }
      productBreakdown[name].qty += (item.quantity || 1);
      productBreakdown[name].revenue += (item.price * item.quantity);
    });
  });

  // Breakdown by Payment Method
  const paymentBreakdown: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'Cancelled') return;
    const method = o.paymentMethod || 'COD';
    paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (o.total || 0);
  });

  // Breakdown by Location
  const locationBreakdown: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'Cancelled') return;
    const city = o.address?.city || 'Unknown';
    locationBreakdown[city] = (locationBreakdown[city] || 0) + (o.total || 0);
  });

  // Trend Grouping (By Date)
  const trendData: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'Cancelled' || o.status === 'Returned') return;
    const dateKey = o.date;
    trendData[dateKey] = (trendData[dateKey] || 0) + (o.total || 0);
  });

  const sortedTrend = Object.entries(trendData).sort((a, b) => {
    return parseOrderDate(a[0]).getTime() - parseOrderDate(b[0]).getTime();
  });
  
  const maxTrendVal = Math.max(1, ...Object.values(trendData));

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-6 font-jakarta">
        <div className="w-12 h-12 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Revenue analytics and exportable financial logs will be active shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-jakarta">
      
      {/* 1. Header Filters Panel */}
      <div className="flex flex-col gap-4 bg-white border border-[#d3c099] rounded-2xl p-4.5">
        <div className="flex items-center gap-2.5 text-stone-850 border-b border-stone-100 pb-2.5 mb-0.5">
          <SlidersHorizontal className="w-4 h-4 text-[#384401]" />
          <span className="text-sm font-extrabold uppercase tracking-wider text-[#384401]">Configure Analytics Metrics Range</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Date range filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#384401]" /> Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-bold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#384401]" /> Payment Method
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-bold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Methods</option>
              {uniquePaymentMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#384401]" /> Delivery Location
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-bold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom date range picker sub-panel */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 border-t border-stone-100">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider">From Date</label>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="w-full h-11 px-3.5 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm focus:outline-none font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider">To Date</label>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="w-full h-11 px-3.5 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm focus:outline-none font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Overview Grid */}
      <div className="bg-white border border-[#d3c099] rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-stone-800 pb-2 border-b border-stone-100 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#384401]" /> Sales Performance Overview
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Gross Sales */}
          <div className="bg-[#FAF4EE]/40 border border-[#eeddb9]/70 rounded-xl p-4">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-1">Gross Sales</span>
            <span className="text-xl lg:text-2xl font-black text-stone-900">₹{grossSales.toLocaleString('en-IN')}</span>
          </div>

          {/* Refunds */}
          <div className="bg-[#FAF4EE]/40 border border-[#eeddb9]/70 rounded-xl p-4">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-1">Refunds</span>
            <span className="text-xl lg:text-2xl font-black text-stone-900">₹{totalRefunds.toLocaleString('en-IN')}</span>
          </div>

          {/* Net Sales */}
          <div className="bg-[#FAF4EE]/60 border border-[#eeddb9] rounded-xl p-4">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-1">Net Sales</span>
            <span className="text-xl lg:text-2xl font-black text-[#384401]">₹{netSales.toLocaleString('en-IN')}</span>
          </div>

          {/* Average Order Value */}
          <div className="bg-[#FAF4EE]/40 border border-[#eeddb9]/70 rounded-xl p-4">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-1">Avg. Order Value</span>
            <span className="text-xl lg:text-2xl font-black text-stone-900">₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Secondary parameters */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center py-3 bg-stone-50/50 border border-stone-200 rounded-xl">
            <span className="text-xs font-extrabold uppercase text-stone-500 tracking-wider block mb-1">Total Orders</span>
            <span className="text-base font-black text-stone-900">{totalOrdersCount}</span>
          </div>
          <div className="text-center py-3 bg-stone-50/50 border border-stone-200 rounded-xl">
            <span className="text-xs font-extrabold uppercase text-stone-500 tracking-wider block mb-1">Items Sold</span>
            <span className="text-base font-black text-stone-900">{itemsSold} units</span>
          </div>
          <div className="text-center py-3 bg-stone-50/50 border border-stone-200 rounded-xl">
            <span className="text-xs font-extrabold uppercase text-stone-500 tracking-wider block mb-1">Discounts</span>
            <span className="text-base font-black text-stone-900">₹{totalDiscounts.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Combined Trends & Breakdown Switcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Trends Over Time */}
        <div className="lg:col-span-5 border border-[#d3c099] rounded-2xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> Sales Trends
            </h4>
            <span className="text-xs text-stone-500 font-bold">Total by date</span>
          </div>

          {sortedTrend.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm font-semibold">No data logged.</div>
          ) : (
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {sortedTrend.map(([date, val]) => {
                const percentage = Math.max(8, (val / maxTrendVal) * 100);
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-xs text-stone-600 font-bold w-[75px] shrink-0 text-center">{date}</span>
                    <div className="flex-grow h-6 bg-stone-50 rounded-lg overflow-hidden relative border border-stone-200/50">
                      <div 
                        className="h-full bg-linear-to-r from-[#FAF4EE] to-[#eeddb9] rounded-r-lg transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-850">
                        ₹{val.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Tabbed breakdown panels */}
        <div className="lg:col-span-7 bg-white border border-[#d3c099] rounded-2xl p-5 space-y-4">
          
          {/* Navigation Selector Tabs for Breakdowns */}
          <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-none pb-2 gap-2">
            {[
              { id: 'products', label: 'Products', icon: ShoppingBag },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'locations', label: 'Locations', icon: MapPin }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = breakdownTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBreakdownTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-1.5 border-b-2 font-extrabold uppercase tracking-wider text-xs lg:text-[13px] whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'border-[#384401] text-[#384401]' 
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="max-h-[320px] overflow-y-auto pr-1">
            {/* A. Product Breakdown */}
            {breakdownTab === 'products' && (
              <div className="border border-[#d3c099] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm border-collapse font-jakarta">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#d3c099] text-[#3E2C1C] font-extrabold uppercase text-xs tracking-wider">
                      <th className="p-3.5 pl-4">Rank</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5 text-center">Qty</th>
                      <th className="p-3.5 text-right pr-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3c099]">
                    {Object.keys(productBreakdown).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-stone-400 italic font-bold">No sales logs.</td>
                      </tr>
                    ) : (
                      Object.entries(productBreakdown)
                        .sort((a, b) => b[1].revenue - a[1].revenue)
                        .map(([name, data], idx) => (
                          <tr key={name} className="hover:bg-stone-50/40 font-semibold text-stone-850">
                            <td className="p-3.5 pl-4 font-extrabold text-stone-500">#{idx+1}</td>
                            <td className="p-3.5 font-bold text-stone-900 truncate max-w-[200px]" title={name}>{name}</td>
                            <td className="p-3.5 text-center font-extrabold text-stone-600">{data.qty}</td>
                            <td className="p-3.5 text-right font-black text-[#384401] pr-4">₹{data.revenue.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* B. Category Breakdown */}
            {breakdownTab === 'categories' && (
              <div className="space-y-4 pt-1">
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <div className="text-center py-8 text-stone-400 italic font-bold text-sm">No category logs.</div>
                ) : (
                  Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, rev]) => {
                      const percentage = Math.max(3, Math.round((rev / (netSales || 1)) * 100));
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between text-sm font-extrabold text-stone-850">
                            <span className="font-jakarta">{cat}</span>
                            <span className="text-[#384401]">₹{rev.toLocaleString('en-IN')} ({percentage}%)</span>
                          </div>
                          <div className="h-2.5 bg-stone-100 border border-stone-200/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#384401] rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {/* C. Payment breakdown */}
            {breakdownTab === 'payments' && (
              <div className="border border-[#d3c099] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm border-collapse font-jakarta">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#d3c099] text-[#3E2C1C] font-extrabold uppercase text-xs tracking-wider">
                      <th className="p-3.5 pl-4">Payment Method</th>
                      <th className="p-3.5 text-right pr-4">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3c099]">
                    {Object.keys(paymentBreakdown).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-stone-400 italic font-bold">No transaction records.</td>
                      </tr>
                    ) : (
                      Object.entries(paymentBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([method, rev]) => (
                          <tr key={method} className="hover:bg-stone-50/40 font-semibold text-stone-850">
                            <td className="p-3.5 pl-4 font-bold text-stone-800 uppercase tracking-wider">{method}</td>
                            <td className="p-3.5 text-right font-black text-[#384401] pr-4">₹{rev.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* D. Location breakdown */}
            {breakdownTab === 'locations' && (
              <div className="border border-[#d3c099] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm border-collapse font-jakarta">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#d3c099] text-[#3E2C1C] font-extrabold uppercase text-xs tracking-wider">
                      <th className="p-3.5 pl-4">Delivery City</th>
                      <th className="p-3.5 text-right pr-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3c099]">
                    {Object.keys(locationBreakdown).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-stone-400 italic font-bold">No records.</td>
                      </tr>
                    ) : (
                      Object.entries(locationBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([city, rev]) => (
                          <tr key={city} className="hover:bg-stone-50/40 font-semibold text-stone-850">
                            <td className="p-3.5 pl-4 font-bold text-stone-800">{city}</td>
                            <td className="p-3.5 text-right font-black text-[#384401] pr-4">₹{rev.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
