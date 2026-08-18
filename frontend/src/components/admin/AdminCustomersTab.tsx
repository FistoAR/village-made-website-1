import { Search, Sparkles } from 'lucide-react';
import { AdminCustomer } from './types';

interface AdminCustomersTabProps {
  filteredCustomers: AdminCustomer[];
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
}

export default function AdminCustomersTab({
  filteredCustomers,
  customerSearch,
  setCustomerSearch,
}: AdminCustomersTabProps) {
  const comingSoon = false; // Set to false to enable customers tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Customer file management and verification databases are currently under construction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
          System Registered Customers ({filteredCustomers.length})
        </h3>
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, mobile, email..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-stone-50/50 border border-[#d3c099] rounded-xl text-xs sm:text-sm placeholder-stone-400 focus:outline-none font-jakarta"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#d3c099] border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-500 font-extrabold uppercase tracking-wider">
                <th className="p-3.5 pl-5 border border-[#d3c099]">Client ID</th>
                <th className="p-3.5 border border-[#d3c099]">Name</th>
                <th className="p-3.5 border border-[#d3c099]">Registered Number</th>
                <th className="p-3.5 border border-[#d3c099]">Email</th>
                <th className="p-3.5 pr-5 border border-[#d3c099]">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-455 font-medium font-jakarta border border-[#d3c099]">No matching customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/40 font-medium">
                    <td className="p-3.5 pl-5 font-bold text-stone-800 font-jakarta border border-[#d3c099]">#{c.id}</td>
                    <td className="p-3.5 text-stone-900 font-bold font-jakarta border border-[#d3c099]">{c.name || 'Anonymous Member'}</td>
                    <td className="p-3.5 font-bold text-[#384401] border border-[#d3c099]">{c.mobile || c.phone}</td>
                    <td className="p-3.5 text-stone-500 font-jakarta border border-[#d3c099]">{c.email || 'No email attached'}</td>
                    <td className="p-3.5 pr-5 text-stone-455 border border-[#d3c099]">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '12/08/2026'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
