import { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Sparkles } from 'lucide-react';
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
  const comingSoon = false; // Set to false to enable orders tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length, orderStatusFilter, orderSearch]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Order tracking and dispatch pipeline management will be online shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-medium"
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
              className="w-full h-10 pl-8.5 pr-3 bg-white border border-[#d3c099] rounded-xl text-sm placeholder-stone-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Main Log Table */}
      <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-[#d3c099] border-collapse font-jakarta">
            <thead>
              <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-700 font-extrabold uppercase tracking-wider text-xs">
                <th className="p-3.5 pl-5 border border-[#d3c099] w-[60px] text-center">S.No</th>
                <th className="p-3.5 border border-[#d3c099]">Order ID</th>
                <th className="p-3.5 border border-[#d3c099]">Order Date</th>
                <th className="p-3.5 border border-[#d3c099]">Customer Mobile</th>
                <th className="p-3.5 border border-[#d3c099]">Total Amount</th>
                <th className="p-3.5 border border-[#d3c099]">Status</th>
                <th className="p-3.5 pr-5 border border-[#d3c099] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-455 font-medium border border-[#d3c099]">No matching orders found.</td>
                </tr>
              ) : (
                paginatedOrders.map((o, index) => (
                  <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                    <td className="p-3.5 pl-5 text-center font-bold text-stone-550 border border-[#d3c099]">{startIndex + index + 1}</td>
                    <td className="p-3.5 font-bold text-stone-850 border border-[#d3c099]">{o.id}</td>
                    <td className="p-3.5 text-stone-600 border border-[#d3c099]">{o.date}</td>
                    <td className="p-3.5 font-bold text-[#384401] border border-[#d3c099]">{o.customerMobile}</td>
                    <td className="p-3.5 font-bold text-stone-900 border border-[#d3c099]">₹{o.total}</td>
                    <td className="p-3.5 border border-[#d3c099]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide border ${
                        o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        o.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        o.status === 'Returned' ? 'bg-stone-100 text-stone-700 border-stone-300' :
                        'bg-amber-50 text-amber-850 border-amber-200'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 border border-[#d3c099] text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="text-stone-500 hover:text-stone-855 font-bold hover:underline cursor-pointer text-sm"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#d3c099] rounded-2xl p-4 bg-stone-50/10 font-jakarta text-xs">
          <span className="text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-850">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-stone-850">
              {Math.min(startIndex + itemsPerPage, filteredOrders.length)}
            </span>{' '}
            of <span className="font-bold text-stone-850">{filteredOrders.length}</span> orders
          </span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 bg-white border border-[#d3c099] rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg border font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#384401] text-white border-[#384401]'
                    : 'bg-white text-stone-700 border-[#d3c099] hover:bg-stone-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 bg-white border border-[#d3c099] rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Details Sheet Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#d3c099] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4.5 top-4.5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-poetsen text-2xl font-medium text-stone-900 mb-2">Order Dispatch Profile</h3>
            <p className="text-sm text-stone-455 font-jakarta mb-5">Detail sheet for logs matching: <span className="font-bold text-stone-750">{selectedOrder.id}</span></p>

            {/* Return Request Banner */}
            {selectedOrder.status === 'Return Requested' && (
              <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 flex flex-col gap-2 mb-6 font-jakarta">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
                  <span className="font-extrabold text-stone-900 text-sm">Return & Refund Request Pending</span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed font-semibold">
                  This user has submitted a return request for their items. Verify that goods have been received or confirm policies before issuing credit refunds.
                </p>
                <div className="flex gap-2.5 mt-2 flex-wrap">
                  <button
                    onClick={() => {
                      handleOrderStatusUpdate(selectedOrder.id, 'Returned');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'Returned' } : null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide"
                  >
                    Approve Return (Refund Stock)
                  </button>
                  <button
                    onClick={() => {
                      handleOrderStatusUpdate(selectedOrder.id, 'Delivered');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'Delivered' } : null);
                    }}
                    className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-sm font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Status controls */}
              <div className="border border-[#d3c099] rounded-2xl p-4 bg-stone-50/20 font-jakarta">
                <span className="text-xs font-extrabold uppercase tracking-wide text-stone-455 block mb-2">Change Shipping Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                  className="h-10.5 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-800 focus:outline-hidden font-bold w-full"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Return Requested">Return Requested</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              
              {/* Address controls */}
              <div className="space-y-1.5 text-stone-700 text-sm">
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">Name:</span> <span className="font-bold text-stone-855">{selectedOrder.address?.name}</span></div>
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">Address:</span> <span className="break-all text-stone-600">{selectedOrder.address?.address}</span></div>
                <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">City/State:</span> <span className="text-stone-600">{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</span></div>
                <div className="flex items-start mt-0.5"><span className="font-bold text-stone-900 w-[90px] shrink-0">Phone:</span> <span className="font-bold text-[#384401]">{selectedOrder.address?.phone}</span></div>
              </div>
            </div>

            {/* Payment & Refund Audit */}
            <div className="border border-[#d3c099] rounded-2xl p-4 mb-6 bg-stone-50/10 font-jakarta text-sm">
              <span className="text-xs font-extrabold uppercase tracking-wide text-stone-455 block mb-3">Payment & Transaction Audit</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-700">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 w-[120px] shrink-0">Payment Method:</span>
                    <span className="uppercase text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 border border-stone-250 text-stone-700">
                      {selectedOrder.paymentMethod || 'Razorpay (UPI)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 w-[120px] shrink-0">Payment Status:</span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${
                      (selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')) === 'captured' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      (selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')) === 'refunded' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-stone-50 text-stone-600 border-stone-200'
                    }`}>
                      {selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div>
                    <span className="font-sans font-semibold text-stone-900 w-[120px] inline-block">Razorpay Order ID:</span>
                    <span className="text-stone-600">{selectedOrder.razorpayOrderId || `order_VM_${selectedOrder.id.replace('VM-', '')}`}</span>
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-stone-900 w-[120px] inline-block">Payment ID:</span>
                    <span className="text-stone-600">{selectedOrder.razorpayPaymentId || `pay_VM_98327103`}</span>
                  </div>
                  {(selectedOrder.status === 'Returned' || selectedOrder.refundId) && (
                    <div>
                      <span className="font-sans font-semibold text-stone-900 w-[120px] inline-block">Refund ID:</span>
                      <span className="text-[#384401] font-bold">{selectedOrder.refundId || `rfnd_VM_49103859`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10 font-jakarta">
              <table className="w-full text-left text-sm border border-[#d3c099] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-455 font-bold uppercase tracking-wider text-xs">
                    <th className="p-3 pl-4 border border-[#d3c099] w-[60px] text-center">S.No</th>
                    <th className="p-3 border border-[#d3c099]">Item Name</th>
                    <th className="p-3 text-center border border-[#d3c099]">Qty</th>
                    <th className="p-3 text-right pr-4 border border-[#d3c099]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c099]">
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} className="font-semibold text-stone-755">
                      <td className="p-3 pl-4 text-center font-bold text-stone-550 border border-[#d3c099]">{idx + 1}</td>
                      <td className="p-3 border border-[#d3c099]">
                        <span>{item.name}</span>
                        {item.weight && <span className="text-xs text-stone-700 block font-normal">{item.weight}</span>}
                      </td>
                      <td className="p-3 text-center font-bold text-stone-900 border border-[#d3c099]">{item.quantity}</td>
                      <td className="p-3 text-right pr-4 font-bold text-stone-900 border border-[#d3c099]">₹{(item.price || 0) * (item.quantity || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-150 mt-6 font-jakarta text-sm">
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
