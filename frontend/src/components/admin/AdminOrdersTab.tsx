import { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Sparkles, SlidersHorizontal, Calendar, ArrowUpDown, CreditCard } from 'lucide-react';
import { AdminOrder } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

interface AdminOrdersTabProps {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  handleOrderStatusUpdate: (orderId: string, newStatus: string, remarks?: string) => void;
  orderSearch?: string;
  setOrderSearch?: (val: string) => void;
}

export default function AdminOrdersTab({
  orders,
  selectedOrder,
  setSelectedOrder,
  handleOrderStatusUpdate,
  orderSearch,
  setOrderSearch,
}: AdminOrdersTabProps) {
  const comingSoon = false; // Set to false to enable orders tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = orderSearch !== undefined ? orderSearch : localSearchQuery;
  const setSearchQuery = setOrderSearch !== undefined ? setOrderSearch : setLocalSearchQuery;
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Status & Remarks update state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarksText, setRemarksText] = useState('');

  // Sync state whenever selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatus(selectedOrder.status);
      setRemarksText(selectedOrder.remarks || '');
    } else {
      setSelectedStatus('');
      setRemarksText('');
    }
  }, [selectedOrder]);

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

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders Report');

    // Title Row
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Village Made Provisions - Detailed Orders Report';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF384401' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtitle Row
    worksheet.mergeCells('A2:K2');
    const subtitleCell = worksheet.getCell('A2');
    const formatExcelDateTime = (date: Date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      let hrs = date.getHours();
      const mins = String(date.getMinutes()).padStart(2, '0');
      const secs = String(date.getSeconds()).padStart(2, '0');
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      return `${d}/${m}/${y}, ${String(hrs).padStart(2, '0')}:${mins}:${secs} ${ampm}`;
    };
    subtitleCell.value = `Generated: ${formatExcelDateTime(new Date())} | Filtered Count: ${sortedOrders.length} orders`;
    subtitleCell.font = { name: 'Segoe UI', size: 10, italic: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Define Columns without headers (keys and widths only) to prevent overwriting Row 1
    worksheet.columns = [
      { key: 'id', width: 15 },
      { key: 'date', width: 14 },
      { key: 'customer', width: 26 },
      { key: 'address', width: 45 },
      { key: 'item', width: 32 },
      { key: 'price', width: 12 },
      { key: 'qty', width: 8 },
      { key: 'subtotal', width: 12 },
      { key: 'total', width: 14 },
      { key: 'status', width: 18 },
      { key: 'payment', width: 18 }
    ];

    // Table Headers Row (Row 4)
    const headers = [
      'Order ID',
      'Order Date',
      'Customer Details',
      'Delivery Address',
      'Item Details',
      'Item Price',
      'Qty',
      'Subtotal',
      'Grand Total',
      'Shipping Status',
      'Payment Status'
    ];
    const headerRow = worksheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF384401' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3C099' } },
        left: { style: 'thin', color: { argb: 'FFD3C099' } },
        bottom: { style: 'thin', color: { argb: 'FFD3C099' } },
        right: { style: 'thin', color: { argb: 'FFD3C099' } }
      };
    });

    let currentRowNum = 5;

    sortedOrders.forEach((o) => {
      const items = o.items || [];
      const rowSpan = Math.max(1, items.length);
      const paymentStatus = o.paymentStatus || (o.status === 'Returned' ? 'refunded' : 'captured');
      const customerStr = `${o.customerName || o.address?.name || 'Guest'}\n(${o.customerMobile || o.address?.phone || 'N/A'})`;
      const addressStr = o.address 
        ? `${o.address.address || ''}, ${o.address.city || ''}, ${o.address.pincode || ''}`
        : 'N/A';

      if (items.length === 0) {
        worksheet.addRow({
          id: o.id,
          date: o.date,
          customer: customerStr,
          address: addressStr,
          item: 'No items listed',
          price: '',
          qty: '',
          subtotal: '',
          total: `Rs. ${o.total}`,
          status: o.status,
          payment: paymentStatus
        });
        worksheet.mergeCells(`E${currentRowNum}:H${currentRowNum}`);
        currentRowNum += 1;
      } else {
        items.forEach((item, wIdx) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          const itemDetails = `${item.name} (${item.weight || 'N/A'})`;

          worksheet.addRow({
            id: o.id,
            date: o.date,
            customer: customerStr,
            address: addressStr,
            item: itemDetails,
            price: `Rs. ${item.price || 0}`,
            qty: item.quantity || 1,
            subtotal: `Rs. ${itemTotal}`,
            total: `Rs. ${o.total}`,
            status: o.status.toUpperCase(),
            payment: paymentStatus.toUpperCase()
          });

          currentRowNum += 1;
        });

        if (rowSpan > 1) {
          const startRow = currentRowNum - rowSpan;
          const endRow = currentRowNum - 1;

          worksheet.mergeCells(`A${startRow}:A${endRow}`);
          worksheet.mergeCells(`B${startRow}:B${endRow}`);
          worksheet.mergeCells(`C${startRow}:C${endRow}`);
          worksheet.mergeCells(`D${startRow}:D${endRow}`);
          worksheet.mergeCells(`I${startRow}:I${endRow}`);
          worksheet.mergeCells(`J${startRow}:J${endRow}`);
          worksheet.mergeCells(`K${startRow}:K${endRow}`);
        }
      }
    });

    // Style data cells & calculate heights dynamically
    for (let r = 5; r < currentRowNum; r++) {
      const row = worksheet.getRow(r);
      const rowBgColor = r % 2 === 0 ? 'FFF9F6F0' : 'FFFFFFFF';
      let maxLinesInRow = 1;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3C099' } },
          left: { style: 'thin', color: { argb: 'FFD3C099' } },
          bottom: { style: 'thin', color: { argb: 'FFD3C099' } },
          right: { style: 'thin', color: { argb: 'FFD3C099' } }
        };

        cell.font = { name: 'Segoe UI', size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor }
        };

        // Align left for column 4 (Delivery Address), center for all other cells
        if (colNumber === 4) {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }

        // Calculate text lines to adjust row height dynamically
        const valStr = cell.value ? cell.value.toString() : '';
        const colWidth = worksheet.columns[colNumber - 1]?.width || 10;
        const paragraphs = valStr.split('\n');
        let cellLines = 0;
        paragraphs.forEach((p) => {
          const maxCharsPerLine = Math.max(10, colWidth - 2);
          cellLines += Math.ceil(p.length / maxCharsPerLine);
        });

        if (cellLines > maxLinesInRow) {
          maxLinesInRow = cellLines;
        }
      });

      // Apply dynamic height with a minimum threshold of 23.25
      row.height = Math.max(23.25, maxLinesInRow * 14.5);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `village_made_detailed_orders_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    // Add Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(56, 68, 1); // #384401
    doc.text('VILLAGE MADE PROVISIONS - DETAILED ORDERS REPORT', 40, 40);

    // Add Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(142, 126, 111); // #8e7e6f
    doc.text(`Generated on: ${new Date().toLocaleString()} | Filtered Count: ${sortedOrders.length} orders`, 40, 55);

    const headers = [
      'S.No',
      'Order ID',
      'Date',
      'Customer',
      'Delivery Address',
      'Item Ordered',
      'Item Price',
      'Qty',
      'Subtotal',
      'Grand Total',
      'Shipping Status',
      'Payment'
    ];

    const body: any[] = [];
    sortedOrders.forEach((o, idx) => {
      const items = o.items || [];
      const rowSpan = Math.max(1, items.length);
      const paymentStatus = o.paymentStatus || (o.status === 'Returned' ? 'refunded' : 'captured');
      
      const customerStr = `${o.customerName || o.address?.name || 'Guest'}\n(${o.customerMobile || o.address?.phone || 'N/A'})`;
      const addressStr = o.address 
        ? `${o.address.address || ''}, ${o.address.city || ''}, ${o.address.pincode || ''}`
        : 'N/A';

      if (items.length === 0) {
        body.push([
          { content: (idx + 1).toString(), rowSpan: 1 },
          { content: o.id, rowSpan: 1, styles: { fontStyle: 'bold', textColor: [56, 68, 1] } },
          { content: o.date, rowSpan: 1 },
          { content: customerStr, rowSpan: 1 },
          { content: addressStr, rowSpan: 1, styles: { fontSize: 7 } },
          { content: 'No items ordered', colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } },
          { content: `Rs. ${o.total}`, rowSpan: 1, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: o.status, rowSpan: 1, styles: { halign: 'center' } },
          { content: paymentStatus, rowSpan: 1, styles: { halign: 'center' } }
        ]);
      } else {
        items.forEach((item, wIdx) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          const weightStr = (item.weight || 'N/A').replace(/\s+/g, '\u00A0');
          const itemDetails = `${item.name} (${weightStr})`;

          if (wIdx === 0) {
            body.push([
              { content: (idx + 1).toString(), rowSpan: rowSpan, styles: { valign: 'middle', halign: 'center' } },
              { content: o.id, rowSpan: rowSpan, styles: { valign: 'middle', fontStyle: 'bold', textColor: [56, 68, 1] } },
              { content: o.date, rowSpan: rowSpan, styles: { valign: 'middle' } },
              { content: customerStr, rowSpan: rowSpan, styles: { valign: 'middle' } },
              { content: addressStr, rowSpan: rowSpan, styles: { valign: 'middle', fontSize: 7 } },
              { content: itemDetails },
              { content: `Rs. ${item.price || 0}`, styles: { halign: 'right' } },
              { content: (item.quantity || 1).toString(), styles: { halign: 'center' } },
              { content: `Rs. ${itemTotal}`, styles: { halign: 'right' } },
              { content: `Rs. ${o.total}`, rowSpan: rowSpan, styles: { valign: 'middle', halign: 'right', fontStyle: 'bold' } },
              { content: o.status.toUpperCase(), rowSpan: rowSpan, styles: { valign: 'middle', halign: 'center', fontSize: 7.5 } },
              { content: paymentStatus.toUpperCase(), rowSpan: rowSpan, styles: { valign: 'middle', halign: 'center', fontSize: 7.5 } }
            ]);
          } else {
            body.push([
              { content: itemDetails },
              { content: `Rs. ${item.price || 0}`, styles: { halign: 'right' } },
              { content: (item.quantity || 1).toString(), styles: { halign: 'center' } },
              { content: `Rs. ${itemTotal}`, styles: { halign: 'right' } }
            ]);
          }
        });
      }
    });

    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: body,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 5, right: 3.5, bottom: 5, left: 3.5 },
        lineColor: [238, 221, 185], // #eeddb9
        lineWidth: 0.5,
        textColor: [28, 25, 23] // #1c1917
      },
      headStyles: {
        fillColor: [56, 68, 1], // #384401
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 }, // S.No
        1: { cellWidth: 58 }, // Order ID
        2: { cellWidth: 55 }, // Date
        3: { cellWidth: 85 }, // Customer
        4: { cellWidth: 165 }, // Delivery Address
        5: { cellWidth: 110 }, // Item Ordered
        6: { halign: 'right', cellWidth: 45 }, // Item Price
        7: { halign: 'center', cellWidth: 25 }, // Qty
        8: { halign: 'right', cellWidth: 48 }, // Subtotal
        9: { halign: 'right', cellWidth: 54 }, // Grand Total
        10: { halign: 'center', cellWidth: 62 }, // Shipping Status
        11: { halign: 'center', cellWidth: 50 } // Payment
      },
      alternateRowStyles: {
        fillColor: [250, 246, 235] // #faf6eb
      },
      margin: { top: 70, right: 40, bottom: 40, left: 40 },
      didParseCell: function (data) {
        if (data.section === 'head') {
          if (data.column.index === 0 || data.column.index === 7 || data.column.index === 10 || data.column.index === 11) {
            data.cell.styles.halign = 'center';
          } else if (data.column.index === 6 || data.column.index === 8 || data.column.index === 9) {
            data.cell.styles.halign = 'right';
          }
        }
      }
    });

    doc.save(`village_made_detailed_orders_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedOrders.length, statusFilter, paymentFilter, dateFilter, searchQuery, customFromDate, customToDate]);

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
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom date range picker sub-panel */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3.5 border-t border-stone-100">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider">From Date</label>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="w-full h-10 px-3.5 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm focus:outline-none font-medium focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider">To Date</label>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="w-full h-10 px-3.5 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm focus:outline-none font-medium focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
            </div>
          </div>
        )}

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
                      let remarks = remarksText;
                      if (!remarks.trim()) {
                        const reason = prompt("Please enter the reason/remarks for accepting this return:");
                        if (reason === null) return;
                        if (!reason.trim()) {
                          alert("Remarks are required to process the return.");
                          return;
                        }
                        remarks = reason;
                      }
                      handleOrderStatusUpdate(selectedOrder.id, 'Returned', remarks.trim());
                      setRemarksText('');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'Returned', remarks: remarks.trim() } : null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide"
                  >
                    Approve Return (Refund Stock)
                  </button>
                  <button
                    onClick={() => {
                      let remarks = remarksText;
                      if (!remarks.trim()) {
                        const reason = prompt("Please enter the reason/remarks for rejecting this return:");
                        if (reason === null) return;
                        if (!reason.trim()) {
                          alert("Remarks are required to process the rejection.");
                          return;
                        }
                        remarks = reason;
                      }
                      handleOrderStatusUpdate(selectedOrder.id, 'Return Rejected', remarks.trim());
                      setRemarksText('');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'Return Rejected', remarks: remarks.trim() } : null);
                    }}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide"
                  >
                    Reject Request / Cancel Request
                  </button>
                </div>
              </div>
            )}

            {/* 1. Customer details and Payment Audit - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Address details */}
              <div className="border border-[#d3c099] rounded-2xl p-4 bg-stone-50/15 font-jakarta text-sm">
                <span className="text-xs font-black uppercase tracking-wider text-[#704632] block mb-3">Customer & Delivery Details</span>
                <div className="space-y-2 text-stone-700">
                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">Name:</span> <span className="font-bold text-stone-855">{selectedOrder.address?.name}</span></div>
                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">Address:</span> <span className="break-all text-stone-600 leading-normal">{selectedOrder.address?.address}</span></div>
                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">City/State:</span> <span className="text-stone-600">{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</span></div>
                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[90px] shrink-0">Phone:</span> <span className="font-bold text-[#384401]">{selectedOrder.address?.phone}</span></div>
                </div>
              </div>

              {/* Payment & Refund Audit */}
              <div className="border border-[#d3c099] rounded-2xl p-4 bg-stone-50/15 font-jakarta text-sm">
                <span className="text-xs font-black uppercase tracking-wider text-[#704632] block mb-3">Payment & Transaction Audit</span>
                <div className="space-y-2 text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 w-[120px] shrink-0">Payment Method:</span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 border border-stone-250 text-stone-700">
                      {selectedOrder.paymentMethod || 'Razorpay (UPI)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 w-[120px] shrink-0">Payment Status:</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                      (selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')) === 'captured' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      (selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')) === 'refunded' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-stone-50 text-stone-600 border-stone-200'
                    }`}>
                      {selectedOrder.paymentStatus || (selectedOrder.status === 'Returned' ? 'refunded' : 'captured')}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono leading-tight space-y-1">
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
            </div>

            {/* 2. DEDICATED STATUS & REMARKS MANAGEMENT BOX */}
            <div className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/20 font-jakarta mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#384401] block mb-3.5">Update Dispatch Status & Audit Remarks</span>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">Select New Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-855 focus:outline-hidden font-bold w-full"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Return Requested">Return Requested</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                
                <div className="flex-[2] space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">Remarks / Audit Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shipped via SpeedPost AWB: IN1039, or refund processed"
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-855 placeholder-stone-400 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    handleOrderStatusUpdate(selectedOrder.id, selectedStatus, remarksText);
                    setRemarksText('');
                  }}
                  className="h-10 px-5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  Save Status
                </button>
              </div>
              {selectedOrder.remarks && (
                <div className="mt-3.5 bg-stone-100/60 border border-stone-200/50 rounded-xl p-3 text-xs">
                  <span className="font-extrabold text-stone-600 block mb-0.5">Active Audit Remark:</span>
                  <p className="text-stone-755 font-medium leading-relaxed italic">"{selectedOrder.remarks}"</p>
                </div>
              )}
            </div>

            {/* 3. STATUS LOG & TIMELINE HISTORY */}
            {selectedOrder.status_history && Array.isArray(selectedOrder.status_history) && selectedOrder.status_history.length > 0 && (
              <div className="border border-[#d3c099] rounded-2xl p-4 bg-stone-50/5 font-jakarta mb-6 text-sm">
                <span className="text-xs font-black uppercase tracking-wider text-[#704632] block mb-3">Status Transit History Log</span>
                <div className="relative pl-5 border-l-2 border-[#eeddb9]/70 space-y-4 ml-1">
                  {selectedOrder.status_history.map((h: any, hIdx: number) => (
                    <div key={hIdx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#384401] border-2 border-white shadow-xs"></span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-[#384401] uppercase text-xs">{h.status}</span>
                          <span className="text-[10px] text-stone-450 font-semibold">{h.date}</span>
                        </div>
                        {h.remarks && (
                          <p className="text-xs text-stone-600 font-medium mt-0.5">{h.remarks}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
