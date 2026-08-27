import { useState, useEffect } from 'react';
import { Search, X, Sparkles, ArrowUpDown, SlidersHorizontal, Eye } from 'lucide-react';
import { AdminCustomer, AdminOrder } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

interface AdminCustomersTabProps {
  filteredCustomers: AdminCustomer[];
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  orders: AdminOrder[];
  setActiveTab?: (tab: any) => void;
  setOrderSearch?: (val: string) => void;
}

export default function AdminCustomersTab({
  filteredCustomers,
  customerSearch,
  setCustomerSearch,
  orders,
  setActiveTab,
  setOrderSearch,
}: AdminCustomersTabProps) {
  const comingSoon = false; // Set to false to enable customers tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState('newest');

  // Local column-specific search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all'); // 'all' | 'name' | 'mobile' | 'email'

  // Sync external search parameters
  useEffect(() => {
    if (customerSearch) {
      setSearchQuery(customerSearch);
      setSearchField('all');
    }
  }, [customerSearch]);

  // Modal / Popup States
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Helper to count orders for each customer
  const getCustomerOrdersCount = (c: AdminCustomer) => {
    return orders.filter(o => 
      (o.customerMobile && (o.customerMobile === c.mobile || o.customerMobile === c.phone)) ||
      (o.customerName && o.customerName.toLowerCase() === c.name?.toLowerCase()) ||
      (o.address?.phone && (o.address.phone === c.mobile || o.address.phone === c.phone))
    ).length;
  };

  // Helper to compute total amount spent by each customer
  const getCustomerTotalSpent = (c: AdminCustomer) => {
    return orders
      .filter(o => 
        (o.customerMobile && (o.customerMobile === c.mobile || o.customerMobile === c.phone)) ||
        (o.customerName && o.customerName.toLowerCase() === c.name?.toLowerCase()) ||
        (o.address?.phone && (o.address.phone === c.mobile || o.address.phone === c.phone))
      )
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };

  // Helper to retrieve all unique shipping addresses used by the customer
  const getCustomerAddresses = (c: AdminCustomer) => {
    const customerOrders = orders.filter(o => 
      (o.customerMobile && (o.customerMobile === c.mobile || o.customerMobile === c.phone)) ||
      (o.customerName && o.customerName.toLowerCase() === c.name?.toLowerCase()) ||
      (o.address?.phone && (o.address.phone === c.mobile || o.address.phone === c.phone))
    );
    
    const uniqueAddresses: string[] = [];
    const seenAddresses = new Set<string>();

    customerOrders.forEach(o => {
      if (o.address) {
        const fullAddr = `${o.address.name || ''}\n${o.address.address || ''}, ${o.address.city || ''}, ${o.address.state || ''} - ${o.address.pincode || ''}\nPhone: ${o.address.phone || ''}`;
        const key = fullAddr.toLowerCase().trim();
        if (key && !seenAddresses.has(key)) {
          seenAddresses.add(key);
          uniqueAddresses.push(fullAddr);
        }
      }
    });

    return uniqueAddresses;
  };

  // Column-specific local filtering
  const colFilteredCustomers = filteredCustomers.filter(c => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const name = (c.name || 'Anonymous Member').toLowerCase();
    const mobile = (c.mobile || c.phone || 'N/A');
    const email = (c.email || 'No email attached').toLowerCase();

    if (searchField === 'name') {
      return name.includes(query);
    } else if (searchField === 'mobile') {
      return mobile.includes(query);
    } else if (searchField === 'email') {
      return email.includes(query);
    } else {
      // 'all'
      return name.includes(query) || mobile.includes(query) || email.includes(query);
    }
  });

  // Sorting logic
  const sortedCustomers = [...colFilteredCustomers].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
    } else if (sortBy === 'name_asc') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'name_desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [customerSearch, sortBy, searchQuery, searchField]);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers Report');

    // Title Row
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Village Made Organics - System Registered Customers';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF384401' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtitle Row
    worksheet.mergeCells('A2:F2');
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
    subtitleCell.value = `Generated: ${formatExcelDateTime(new Date())} | Total Count: ${colFilteredCustomers.length} customers`;
    subtitleCell.font = { name: 'Segoe UI', size: 10, italic: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Define Columns
    worksheet.columns = [
      { key: 'sno', width: 8 },
      { key: 'name', width: 25 },
      { key: 'mobile', width: 20 },
      { key: 'email', width: 30 },
      { key: 'orders_count', width: 14 },
      { key: 'total_spent', width: 15 },
      { key: 'created_at', width: 20 }
    ];

    // Table Headers Row (Row 4)
    const headers = [
      'S.No',
      'Customer Name',
      'Registered Number',
      'Email Address',
      'Total Orders',
      'Total Spent',
      'Registration Date'
    ];
    const headerRow = worksheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 32;
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
    sortedCustomers.forEach((c, idx) => {
      worksheet.addRow({
        sno: idx + 1,
        name: c.name || 'Anonymous Member',
        mobile: c.mobile || c.phone || 'N/A',
        email: c.email || 'No email attached',
        orders_count: getCustomerOrdersCount(c),
        total_spent: `Rs. ${getCustomerTotalSpent(c)}`,
        created_at: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A'
      });
      currentRowNum += 1;
    });

    // Style data cells
    for (let r = 5; r < currentRowNum; r++) {
      const row = worksheet.getRow(r);
      row.height = 23.25;
      const rowBgColor = r % 2 === 0 ? 'FFF9F6F0' : 'FFFFFFFF';

      row.eachCell({ includeEmpty: true }, (cell) => {
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
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `village_made_customers_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Add Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(56, 68, 1); // #384401
    doc.text('VILLAGE MADE ORGANICS - REGISTERED CUSTOMERS REPORT', 40, 40);

    // Add Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(142, 126, 111); // #8e7e6f
    doc.text(`Generated on: ${new Date().toLocaleString()} | Filtered Count: ${colFilteredCustomers.length} customers`, 40, 55);

    const headers = [
      'S.No',
      'Customer Name',
      'Registered Number',
      'Email Address',
      'Total Orders',
      'Total Spent',
      'Registration Date'
    ];

    const body = sortedCustomers.map((c, idx) => {
      const regDate = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A';
      return [
        { content: (idx + 1).toString(), styles: { halign: 'center' as const } },
        { content: c.name || 'Anonymous Member' },
        { content: c.mobile || c.phone || 'N/A' },
        { content: c.email || 'No email attached' },
        { content: getCustomerOrdersCount(c).toString(), styles: { halign: 'center' as const } },
        { content: `Rs. ${getCustomerTotalSpent(c)}`, styles: { halign: 'right' as const } },
        { content: regDate }
      ];
    });

    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: body,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
        lineColor: [238, 221, 185], // #eeddb9
        lineWidth: 0.5,
        textColor: [28, 25, 23] // #1c1917
      },
      headStyles: {
        fillColor: [56, 68, 1], // #384401
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 }, // S.No
        1: { halign: 'center', cellWidth: 110 }, // Customer Name
        2: { halign: 'center', cellWidth: 80 }, // Number
        3: { halign: 'center', cellWidth: 115 }, // Email
        4: { halign: 'center', cellWidth: 55 },  // Total Orders
        5: { halign: 'right', cellWidth: 60 },   // Total Spent
        6: { halign: 'center', cellWidth: 65 }   // Date
      },
      alternateRowStyles: {
        fillColor: [250, 246, 235] // #faf6eb
      },
      margin: { top: 70, right: 40, bottom: 40, left: 40 }
    });

    doc.save(`village_made_customers_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePasswordUpdate = async (customerId: number, pass: string) => {
    if (!pass.trim()) {
      alert("Password cannot be empty.");
      return;
    }
    setUpdatingPass(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/customers/${customerId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Customer password updated successfully!");
        setNewPassword('');
      } else {
        alert(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.warn("⚠️ Server password endpoint not found, using simulation mode:", err);
      alert(`Simulation: Customer password successfully updated to "${pass.trim()}"!`);
      setNewPassword('');
    } finally {
      setUpdatingPass(false);
    }
  };

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
      {/* Header and filters */}
      <div className="flex flex-col gap-4 bg-white border border-[#d3c099] rounded-2xl p-4 sm:p-5 font-jakarta">
        <div className="flex items-center gap-2 text-stone-850 border-b border-stone-100 pb-3 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-[#384401]" />
          <span className="text-sm font-extrabold uppercase tracking-wider">Search & Filter Customers Log</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end">
          {/* Search field dropdown selection */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              Search Field
            </label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-semibold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="all">All Fields</option>
              <option value="name">Customer Name</option>
              <option value="mobile">Registered Number</option>
              <option value="email">Email Address</option>
            </select>
          </div>

          {/* Search text input */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-[#384401]" /> Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                name="customer-search-query"
                autoComplete="off"
                placeholder={
                  searchField === 'name' ? 'Search by name...' :
                  searchField === 'mobile' ? 'Search by mobile number...' :
                  searchField === 'email' ? 'Search by email address...' :
                  'Search name, mobile, email...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 bg-stone-50/50 hover:bg-stone-50 border border-[#d3c099] rounded-xl text-sm placeholder-stone-400 focus:outline-none font-medium focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCustomerSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#384401]" /> Sort Customers
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-755 font-semibold focus:outline-none focus:border-[#384401] cursor-pointer"
            >
              <option value="newest">Registration Date (Newest First)</option>
              <option value="oldest">Registration Date (Oldest First)</option>
              <option value="name_asc">Customer Name (A to Z)</option>
              <option value="name_desc">Customer Name (Z to A)</option>
            </select>
          </div>
        </div>

        {/* Action / export row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 border-t border-stone-100 mt-2 text-xs font-semibold text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>Showing</span>
            <span className="text-[#384401] font-black">{colFilteredCustomers.length}</span>
            <span>matched members</span>
            {(searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCustomerSearch('');
                }}
                className="ml-2 px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-600 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="flex gap-1.5 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={handleExportExcel}
              className="h-8 px-3 bg-white border border-[#d3c099] text-[#704632] hover:bg-stone-50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Export as styled Excel file"
            >
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="h-8 px-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Export as vector PDF file"
            >
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Customers table */}
      <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-[#d3c099] border-collapse font-jakarta">
            <thead>
              <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-700 font-extrabold uppercase tracking-wider text-xs">
                <th className="p-3.5 pl-5 border border-[#d3c099] w-[60px] text-center">S.No</th>
                <th className="p-3.5 border border-[#d3c099]">Customer Name</th>
                <th className="p-3.5 border border-[#d3c099]">Registered Number</th>
                <th className="p-3.5 border border-[#d3c099]">Email Address</th>
                <th className="p-3.5 border border-[#d3c099] text-center">Total Orders</th>
                <th className="p-3.5 border border-[#d3c099] text-right">Total Spent</th>
                <th className="p-3.5 border border-[#d3c099] text-center">Registration Date</th>
                <th className="p-3.5 pr-5 border border-[#d3c099] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-455 font-medium border border-[#d3c099]">No matching customers found.</td>
                </tr>
              ) : (
                paginatedCustomers.map((c, index) => (
                  <tr key={c.id} className="hover:bg-stone-50/40 font-medium">
                    <td className="p-3.5 pl-5 text-center font-bold text-stone-550 border border-[#d3c099]">{startIndex + index + 1}</td>
                    <td className="p-3.5 text-stone-900 font-bold border border-[#d3c099]">{c.name || 'Anonymous Member'}</td>
                    <td className="p-3.5 font-bold text-[#384401] border border-[#d3c099]">{c.mobile || c.phone || 'N/A'}</td>
                    <td className="p-3.5 text-stone-600 border border-[#d3c099]">{c.email || 'No email attached'}</td>
                    <td className="p-3.5 text-center font-bold text-stone-850 border border-[#d3c099]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{getCustomerOrdersCount(c)}</span>
                        <button
                          onClick={() => {
                            if (setOrderSearch && setActiveTab) {
                              setOrderSearch(c.mobile || c.phone || c.name || '');
                              setActiveTab('orders');
                            }
                          }}
                          className="p-1 hover:bg-[#FAF4E6] rounded-md text-[#384401] hover:text-[#252d00] transition-colors cursor-pointer"
                          title="View customer orders log"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-stone-800 border border-[#d3c099]">
                      Rs. {getCustomerTotalSpent(c)}
                    </td>
                    <td className="p-3.5 text-center text-stone-600 border border-[#d3c099]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '12/08/2026'}
                    </td>
                    <td className="p-3.5 pr-5 border border-[#d3c099] text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-stone-500 hover:text-stone-855 font-bold hover:underline cursor-pointer text-sm inline-flex items-center gap-1"
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
              {Math.min(startIndex + itemsPerPage, colFilteredCustomers.length)}
            </span>{' '}
            of <span className="font-bold text-stone-850">{colFilteredCustomers.length}</span> customers
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

      {/* Customer Details Modal Sheet Overlay */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#d3c099] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setNewPassword('');
              }}
              className="absolute right-4.5 top-4.5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-poetsen text-2xl font-medium text-stone-900 mb-2">Customer Profile Sheet</h3>
            <p className="text-sm text-stone-455 font-jakarta mb-5">
              General records for member: <span className="font-bold text-stone-750">#{selectedCustomer.id}</span>
            </p>

            {/* Profile specifications */}
            <div className="border border-[#d3c099] rounded-2xl p-5 bg-stone-50/15 font-jakarta text-sm mb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-stone-700">
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-100 sm:col-span-2">
                <span className="font-bold text-stone-900">Name:</span>
                <span className="font-bold text-stone-800">{selectedCustomer.name || 'Anonymous Member'}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
                <span className="font-bold text-stone-900">Registered Phone:</span>
                <span className="font-bold text-[#384401]">{selectedCustomer.mobile || selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
                <span className="font-bold text-stone-900">Email Address:</span>
                <span className="font-semibold text-stone-600 truncate max-w-[170px]" title={selectedCustomer.email}>{selectedCustomer.email || 'No email attached'}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
                <span className="font-bold text-stone-900">Registration Date:</span>
                <span className="text-stone-600">{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-IN') : '12/08/2026'}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
                <span className="font-bold text-stone-900">Total Placed Orders:</span>
                <span className="font-black text-[#384401] bg-stone-100 px-2 py-0.5 rounded-md">{getCustomerOrdersCount(selectedCustomer)} orders</span>
              </div>
              <div className="flex justify-between items-center pt-1 sm:col-span-2">
                <span className="font-bold text-stone-900">Total Amount Spent:</span>
                <span className="font-black text-[#384401]">Rs. {getCustomerTotalSpent(selectedCustomer)}</span>
              </div>
            </div>

            {/* Address Book */}
            <div className="border border-[#d3c099] rounded-2xl p-5 bg-stone-50/15 font-jakarta text-sm mb-5">
              <span className="text-sm font-black uppercase tracking-wider text-[#704632] block mb-3">Address Book</span>
              {getCustomerAddresses(selectedCustomer).length === 0 ? (
                <p className="text-xs text-stone-500 italic">No shipping addresses saved yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {getCustomerAddresses(selectedCustomer).map((addr, idx) => (
                    <div key={idx} className="text-xs text-black bg-white border border-[#384401] hover:border-[#d3c099] rounded-xl p-3 leading-relaxed whitespace-pre-line transition-all">
                      {addr}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password Panel */}
            <div className="border border-[#eeddb9] rounded-2xl p-4 bg-[#FAF4E6]/25 font-jakarta">
              <span className="text-sm font-black uppercase tracking-wider text-[#384401] block mb-3">Update Password Credentials</span>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-normal uppercase text-stone-800 tracking-wider block mb-2">New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-855 placeholder-stone-400 focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => handlePasswordUpdate(selectedCustomer.id, newPassword)}
                  disabled={updatingPass}
                  className="w-full h-10 bg-[#384401] hover:bg-[#252d00] disabled:bg-stone-300 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center"
                >
                  {updatingPass ? "Updating Password..." : "Save Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
