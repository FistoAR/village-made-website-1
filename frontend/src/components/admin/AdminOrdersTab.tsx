import { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Sparkles, SlidersHorizontal, Calendar, ArrowUpDown, CreditCard } from 'lucide-react';
import { AdminOrder } from './types';
import { jsPDF } from 'jspdf';

interface AdminOrdersTabProps {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  handleOrderStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function AdminOrdersTab({
  orders,
  selectedOrder,
  setSelectedOrder,
  handleOrderStatusUpdate,
}: AdminOrdersTabProps) {
  const comingSoon = false; // Set to false to enable orders tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Parse order date helper ("DD/MM/YYYY" -> Date object)
  const parseOrderDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed month
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    // 1. Search Query (ID, customer name, mobile, item names, address details)
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerMobile || '').includes(searchQuery) ||
      (o.address?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.address?.phone || '').includes(searchQuery) ||
      (o.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items?.some(item => (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Status Filter
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;

    // 3. Payment Status Filter
    let matchesPayment = true;
    if (paymentFilter !== 'All') {
      const pStatus = o.paymentStatus || (o.status === 'Returned' ? 'refunded' : 'captured');
      matchesPayment = pStatus.toLowerCase() === paymentFilter.toLowerCase();
    }

    // 4. Date Filter
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
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return parseOrderDate(b.date).getTime() - parseOrderDate(a.date).getTime();
    } else if (sortBy === 'oldest') {
      return parseOrderDate(a.date).getTime() - parseOrderDate(b.date).getTime();
    } else if (sortBy === 'amount_desc') {
      return b.total - a.total;
    } else if (sortBy === 'amount_asc') {
      return a.total - b.total;
    }
    return 0;
  });

  const handleExportExcel = () => {
    const rowsHTML = sortedOrders.flatMap((o) => {
      const items = o.items || [];
      const rowSpan = Math.max(1, items.length);
      const paymentStatus = o.paymentStatus || (o.status === 'Returned' ? 'refunded' : 'captured');
      const customerStr = `${o.customerName || o.address?.name || 'Guest'} (${o.customerMobile || o.address?.phone || 'N/A'})`;
      const addressStr = o.address 
        ? `${o.address.address || ''}, ${o.address.city || ''}, ${o.address.pincode || ''}`
        : 'N/A';

      if (items.length === 0) {
        return `
          <tr>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${o.id}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${o.date}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${customerStr}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${addressStr}</td>
            <td style="border: 1px solid #d3c099; padding: 6px;" colspan="4">No items listed</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle; font-weight: bold; text-align: right;">₹${o.total}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${o.status}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${paymentStatus}</td>
          </tr>
        `;
      }

      return items.map((item, wIdx) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        const itemDetails = `${item.name} (${item.weight || 'N/A'})`;
        
        return `
          <tr>
            ${wIdx === 0 ? `
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle; font-weight: bold;">${o.id}</td>
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${o.date}</td>
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${customerStr}</td>
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle;">${addressStr}</td>
            ` : ''}
            
            <td style="border: 1px solid #d3c099; padding: 6px;">${itemDetails}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; text-align: right;">₹${item.price || 0}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; text-align: center;">${item.quantity || 1}</td>
            <td style="border: 1px solid #d3c099; padding: 6px; text-align: right;">₹${itemTotal}</td>
            
            ${wIdx === 0 ? `
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle; font-weight: bold; text-align: right;">₹${o.total}</td>
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle; text-transform: uppercase;">${o.status}</td>
              <td rowspan="${rowSpan}" style="border: 1px solid #d3c099; padding: 6px; vertical-align: middle; text-transform: uppercase;">${paymentStatus}</td>
            ` : ''}
          </tr>
        `;
      }).join('');
    }).join('');

    const excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Orders Log Report</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; }
            th { background-color: #384401; color: #ffffff; font-weight: bold; border: 1px solid #d3c099; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Village Made Provisions - Detailed Orders Report</h2>
          <p>Generated: ${new Date().toLocaleString()} | Filtered Count: ${sortedOrders.length} orders</p>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Customer Details</th>
                <th>Delivery Address</th>
                <th>Item Details</th>
                <th>Item Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Grand Total</th>
                <th>Shipping Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `village_made_detailed_orders_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const element = document.createElement('div');
    element.style.width = '800px';
    element.style.padding = '20px';
    element.style.fontFamily = 'Helvetica, Arial, sans-serif';

    const rowsHTML = sortedOrders.flatMap((o, idx) => {
      const items = o.items || [];
      const rowSpan = Math.max(1, items.length);
      const paymentStatus = o.paymentStatus || (o.status === 'Returned' ? 'refunded' : 'captured');
      
      const customerStr = `${o.customerName || o.address?.name || 'Guest'} (${o.customerMobile || o.address?.phone || 'N/A'})`;
      const addressStr = o.address 
        ? `${o.address.address || ''}, ${o.address.city || ''}, ${o.address.pincode || ''}`
        : 'N/A';

      if (items.length === 0) {
        return `
          <tr style="background-color: ${idx % 2 === 0 ? '#fafaf9' : '#ffffff'};">
            <td style="text-align: center; padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${idx + 1}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-weight: bold; color: #384401; vertical-align: middle;">${o.id}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${o.date}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${customerStr}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle; font-size: 8px;">${addressStr}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9;" colspan="4">No items ordered</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-weight: bold; vertical-align: middle; text-align: right;">₹${o.total}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; text-transform: uppercase; font-size: 8px; vertical-align: middle; text-align: center;">${o.status}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-size: 8px; text-transform: uppercase; vertical-align: middle; text-align: center;">${paymentStatus}</td>
          </tr>
        `;
      }

      return items.map((item, wIdx) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        const itemDetails = `${item.name} (${item.weight || 'N/A'})`;

        return `
          <tr style="background-color: ${idx % 2 === 0 ? '#fafaf9' : '#ffffff'};">
            ${wIdx === 0 ? `
              <td rowspan="${rowSpan}" style="text-align: center; padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${idx + 1}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; font-weight: bold; color: #384401; vertical-align: middle;">${o.id}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${o.date}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle;">${customerStr}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; vertical-align: middle; font-size: 8px; color: #555;">${addressStr}</td>
            ` : ''}

            <td style="padding: 6px; border: 1px solid #eeddb9; font-size: 9px;">${itemDetails}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-size: 9px; text-align: right;">₹${item.price || 0}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-size: 9px; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 6px; border: 1px solid #eeddb9; font-size: 9px; text-align: right;">₹${itemTotal}</td>

            ${wIdx === 0 ? `
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; font-weight: bold; vertical-align: middle; text-align: right;">₹${o.total}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; text-transform: uppercase; font-size: 8px; vertical-align: middle; text-align: center;">${o.status}</td>
              <td rowspan="${rowSpan}" style="padding: 6px; border: 1px solid #eeddb9; font-size: 8px; text-transform: uppercase; vertical-align: middle; text-align: center;">${paymentStatus}</td>
            ` : ''}
          </tr>
        `;
      }).join('');
    }).join('');

    element.innerHTML = `
      <h1 style="color: #384401; font-size: 16px; margin: 0 0 5px 0; text-transform: uppercase;">Village Made Provisions - Detailed Orders Report</h1>
      <div style="font-size: 10px; color: #8e7e6f; margin-bottom: 15px;">
        Generated on: ${new Date().toLocaleString()} | Filtered Count: ${sortedOrders.length} orders
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
        <thead>
          <tr style="background-color: #faf6eb; color: #384401;">
            <th style="width: 30px; text-align: center; border: 1px solid #eeddb9; padding: 6px;">S.No</th>
            <th style="border: 1px solid #eeddb9; padding: 6px;">Order ID</th>
            <th style="border: 1px solid #eeddb9; padding: 6px;">Date</th>
            <th style="border: 1px solid #eeddb9; padding: 6px;">Customer</th>
            <th style="border: 1px solid #eeddb9; padding: 6px;">Delivery Address</th>
            <th style="border: 1px solid #eeddb9; padding: 6px;">Item Ordered</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: right;">Item Price</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: center;">Qty</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: right;">Subtotal</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: right;">Grand Total</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: center;">Shipping Status</th>
            <th style="border: 1px solid #eeddb9; padding: 6px; text-align: center;">Payment</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    `;

    document.body.appendChild(element);

    doc.html(element, {
      callback: function (doc) {
        doc.save(`village_made_detailed_orders_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.removeChild(element);
      },
      x: 20,
      y: 20,
      width: 800, // Landscape width constraint
      windowWidth: 840
    });
  };

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedOrders.length, statusFilter, paymentFilter, dateFilter, searchQuery]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

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
      <div className="flex flex-col gap-4 bg-white border border-[#d3c099] rounded-2xl p-4 sm:p-5 font-jakarta">
        <div className="flex items-center gap-2 text-stone-850 border-b border-stone-100 pb-3 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-[#384401]" />
          <span className="text-sm font-extrabold uppercase tracking-wider">Search & Filter Orders Log</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Global Search */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-[#384401]" /> Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-455 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, name, mobile, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-9 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm placeholder-stone-400 focus:outline-none font-medium focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">Shipping Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-semibold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Payment Status filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#384401]" /> Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-semibold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Transactions</option>
              <option value="captured">Paid / Captured</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#384401]" /> Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-semibold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Sorting row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 border-t border-stone-100 mt-2 text-xs font-semibold text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>Showing</span>
            <span className="text-[#384401] font-black">{sortedOrders.length}</span>
            <span>matched orders</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#384401]" /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-755 font-bold focus:outline-none focus:border-[#384401] cursor-pointer"
              >
                <option value="newest">Order Date (Newest First)</option>
                <option value="oldest">Order Date (Oldest First)</option>
                <option value="amount_desc">Grand Total (High to Low)</option>
                <option value="amount_asc">Grand Total (Low to High)</option>
              </select>
            </div>

            <div className="flex gap-1.5 shrink-0 ml-auto sm:ml-0">
              <button
                onClick={handleExportExcel}
                className="h-8 px-3 bg-white border border-[#d3c099] text-[#704632] hover:bg-stone-50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Export to CSV / Excel"
              >
                <span>Export Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="h-8 px-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Save as PDF / Print Summary"
              >
                <span>Export PDF</span>
              </button>
            </div>
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
                <th className="p-3.5 border border-[#d3c099]">Customer Name</th>
                <th className="p-3.5 border border-[#d3c099]">Customer Mobile</th>
                <th className="p-3.5 border border-[#d3c099]">Total Amount</th>
                <th className="p-3.5 border border-[#d3c099]">Status</th>
                <th className="p-3.5 pr-5 border border-[#d3c099] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-455 font-medium border border-[#d3c099]">No matching orders found.</td>
                </tr>
              ) : (
                paginatedOrders.map((o, index) => (
                  <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                    <td className="p-3.5 pl-5 text-center font-bold text-stone-550 border border-[#d3c099]">{startIndex + index + 1}</td>
                    <td className="p-3.5 font-bold text-stone-850 border border-[#d3c099]">{o.id}</td>
                    <td className="p-3.5 text-stone-600 border border-[#d3c099]">{o.date}</td>
                    <td className="p-3.5 text-stone-800 border border-[#d3c099]">{o.customerName || o.address?.name || 'Guest'}</td>
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
