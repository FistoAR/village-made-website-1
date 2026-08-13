import React from 'react';
import { Search, X } from 'lucide-react';
import { AdminOrder } from './types';

interface AdminOrdersTabProps {
  orderStatusFilter: string;
  setOrderStatusFilter: (val: string) => void;
  orderSearch: string;
  setOrderSearch: (val: string) => void;
  filteredOrders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  handleOrderStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function AdminOrdersTab({
  orderStatusFilter,
  setOrderStatusFilter,
  orderSearch,
  setOrderSearch,
  filteredOrders,
  selectedOrder,
  setSelectedOrder,
  handleOrderStatusUpdate,
}: AdminOrdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-755 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-455 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID or phone..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full h-10 pl-8.5 pr-3 bg-white border border-[#eeddb9] rounded-xl text-xs placeholder-stone-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Main Log Table */}
      <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse font-jakarta">
            <thead>
              <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                <th className="p-3.5 pl-5 border border-[#eeddb9]">Order ID</th>
                <th className="p-3.5 border border-[#eeddb9]">Date</th>
                <th className="p-3.5 border border-[#eeddb9]">Customer Mobile</th>
                <th className="p-3.5 border border-[#eeddb9]">Total Amount</th>
                <th className="p-3.5 border border-[#eeddb9]">Status</th>
                <th className="p-3.5 pr-5 border border-[#eeddb9] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeddb9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-455 font-medium border border-[#eeddb9]">No matching orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                    <td className="p-3.5 pl-5 font-bold text-stone-850 border border-[#eeddb9]">{o.id}</td>
                    <td className="p-3.5 text-stone-600 border border-[#eeddb9]">{o.date}</td>
                    <td className="p-3.5 font-bold text-[#384401] border border-[#eeddb9]">{o.customerMobile}</td>
                    <td className="p-3.5 font-bold text-stone-900 border border-[#eeddb9]">₹{o.total}</td>
                    <td className="p-3.5 border border-[#eeddb9]">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                        o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                        o.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 border border-[#eeddb9] text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="text-stone-500 hover:text-stone-850 font-bold hover:underline cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Sheet Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#eeddb9] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4.5 top-4.5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-2xl font-black text-stone-900 mb-2">Order Dispatch Profile</h3>
            <p className="text-xs text-stone-450 font-jakarta mb-5">Detail sheet for logs matching: <span className="font-bold text-stone-750">{selectedOrder.id}</span></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Status controls */}
              <div className="border border-[#eeddb9]/50 rounded-2xl p-4 bg-stone-50/20 font-jakarta">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-stone-455 block mb-2">Change Shipping Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                  className="h-10.5 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-800 focus:outline-hidden font-bold w-full"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Address controls */}
              <div className="space-y-1 text-stone-700">
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">Name:</span> <span className="font-bold text-stone-855">{selectedOrder.address?.name}</span></div>
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">Address:</span> <span className="break-all text-stone-600">{selectedOrder.address?.address}</span></div>
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">City/State:</span> <span className="text-stone-600">{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</span></div>
                <div className="flex items-start mt-0.5"><span className="font-bold text-stone-900 w-[70px] shrink-0">Phone:</span> <span className="font-bold text-[#384401]">{selectedOrder.address?.phone}</span></div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10 font-jakarta">
              <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-450 font-bold uppercase tracking-wider">
                    <th className="p-3 pl-4 border border-[#eeddb9]">Item Name</th>
                    <th className="p-3 text-center border border-[#eeddb9]">Qty</th>
                    <th className="p-3 text-right pr-4 border border-[#eeddb9]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeddb9]">
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} className="font-semibold text-stone-750">
                      <td className="p-3 pl-4 border border-[#eeddb9]">
                        <span>{item.name}</span>
                        {item.weight && <span className="text-[10px] text-stone-400 block font-normal">{item.weight}</span>}
                      </td>
                      <td className="p-3 text-center font-bold text-stone-900 border border-[#eeddb9]">{item.quantity}</td>
                      <td className="p-3 text-right pr-4 font-bold text-stone-900 border border-[#eeddb9]">₹{(item.price || 0) * (item.quantity || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-150 mt-6 font-jakarta text-xs">
              <div className="text-right">
                <span className="text-stone-455">Grand Total: </span>
                <span className="font-black text-stone-955 text-base ml-1">₹{selectedOrder.total}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
