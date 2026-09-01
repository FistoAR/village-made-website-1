'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee, 
  Building2, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  X, 
  Edit3, 
  Gift, 
  Send,
  FileText,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface BulkInquiry {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  purpose: string;
  needed_by_date?: string;
  city?: string;
  pincode?: string;
  estimated_qty: number;
  selected_products: any[];
  customizations?: any;
  notes?: string;
  quoted_price?: number;
  admin_notes?: string;
  status: string;
  is_sample_request?: boolean;
  created_at: string;
  updated_at?: string;
}

export default function AdminBulkInquiriesTab() {
  const { showConfirm, showToast } = useApp();
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sampleFilter, setSampleFilter] = useState<'all' | 'samples_only' | 'bulk_only'>('all');

  // Selected Inquiry Modal
  const [selectedInquiry, setSelectedInquiry] = useState<BulkInquiry | null>(null);
  
  // Quote Edit Form
  const [quotedPriceInput, setQuotedPriceInput] = useState<string>('');
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<string>('Pending');
  const [savingQuote, setSavingQuote] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/bulk/inquiries`);
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
      } else {
        setError(data.error || 'Failed to load bulk inquiries.');
      }
    } catch (err) {
      console.error('Failed to fetch bulk inquiries:', err);
      setError('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openInquiryDetails = (inquiry: BulkInquiry) => {
    setSelectedInquiry(inquiry);
    setQuotedPriceInput(inquiry.quoted_price ? inquiry.quoted_price.toString() : '');
    setAdminNotesInput(inquiry.admin_notes || '');
    setStatusInput(inquiry.status || 'Pending');
  };

  const handleUpdateStatusAndQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSavingQuote(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/bulk/inquiries/${selectedInquiry.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusInput,
          quotedPrice: quotedPriceInput,
          adminNotes: adminNotesInput
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Bulk inquiry updated successfully.', 'success');
        setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? data.inquiry : item));
        setSelectedInquiry(data.inquiry);
      } else {
        showToast(data.error || 'Failed to update inquiry.', 'error');
      }
    } catch (err) {
      showToast('Network error while updating inquiry.', 'error');
    } finally {
      setSavingQuote(false);
    }
  };

  const handleDeleteInquiry = (id: string) => {
    showConfirm(
      'Delete Bulk Inquiry',
      `Are you sure you want to delete inquiry ${id}? This action cannot be undone.`,
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/bulk/inquiries/${id}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            showToast('Inquiry deleted successfully.', 'success');
            setInquiries(prev => prev.filter(item => item.id !== id));
            if (selectedInquiry?.id === id) {
              setSelectedInquiry(null);
            }
          } else {
            showToast(data.error || 'Failed to delete inquiry.', 'error');
          }
        } catch (err) {
          showToast('Network error deleting inquiry.', 'error');
        }
      }
    );
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      // Sample filter
      if (sampleFilter === 'samples_only' && !item.is_sample_request) return false;
      if (sampleFilter === 'bulk_only' && item.is_sample_request) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchCompany = (item.company_name || '').toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchPhone = item.phone.toLowerCase().includes(q);
        const matchPurpose = item.purpose.toLowerCase().includes(q);
        return matchId || matchName || matchCompany || matchEmail || matchPhone || matchPurpose;
      }

      return true;
    });
  }, [inquiries, searchQuery, statusFilter, sampleFilter]);

  // Metrics
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'Pending').length;
  const approvedCount = inquiries.filter(i => i.status === 'Approved' || i.status === 'Completed').length;
  const totalQuotedValue = inquiries.reduce((acc, curr) => acc + (Number(curr.quoted_price) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">Pending Quote</span>;
      case 'Quote Sent':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider border border-blue-200">Quote Sent</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">Approved</span>;
      case 'In Production':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider border border-purple-200">In Production</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider border border-green-200">Completed</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider border border-red-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#eeddb9]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#384401]" />
            <h2 className="text-2xl font-black text-[#384401] font-poetsen tracking-wide">
              Bulk Orders & B2B Inquiries
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage custom event return gifts, corporate hampers, and wholesale quotations.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="px-4 py-2 bg-[#FAF4E6] border border-[#eeddb9] text-[#384401] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#eeddb9]/50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#eeddb9]/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-extrabold uppercase">
            <span>Total Requests</span>
            <FileText className="w-4 h-4 text-[#384401]" />
          </div>
          <p className="text-2xl font-black text-[#384401] font-poetsen">{totalCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eeddb9]/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700 text-xs font-extrabold uppercase">
            <span>Pending Quotes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-poetsen">{pendingCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eeddb9]/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-extrabold uppercase">
            <span>Approved Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-poetsen">{approvedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eeddb9]/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#A45338] text-xs font-extrabold uppercase">
            <span>Total Quoted Value</span>
            <IndianRupee className="w-4 h-4 text-[#A45338]" />
          </div>
          <p className="text-2xl font-black text-[#A45338] font-poetsen">₹{totalQuotedValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eeddb9]/60 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client, company, phone or ID..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#384401]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <Filter className="w-3.5 h-3.5 text-[#384401]" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Quote</option>
            <option value="Quote Sent">Quote Sent</option>
            <option value="Approved">Approved</option>
            <option value="In Production">In Production</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={sampleFilter}
            onChange={e => setSampleFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401]"
          >
            <option value="all">All Inquiries</option>
            <option value="bulk_only">Bulk Orders Only</option>
            <option value="samples_only">Sample Requests Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-[#eeddb9]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs font-bold animate-pulse">
            Loading bulk inquiries...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-xs font-bold">
            {error}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <Boxes className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">No bulk inquiries found.</p>
            <p className="text-xs text-stone-400">Submissions from the /bulk-orders page will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF4E6] border-b border-[#eeddb9] text-[#384401] font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Ref ID</th>
                  <th className="py-3.5 px-4">Client & Company</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Est. Qty</th>
                  <th className="py-3.5 px-4">Quoted Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800 font-medium">
                {filteredInquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF4E6]/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#A45338]">
                      {item.id}
                      {item.is_sample_request && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold uppercase">
                          Sample
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#384401]">{item.name}</div>
                      {item.company_name && (
                        <div className="text-[10px] text-stone-500 font-bold">{item.company_name}</div>
                      )}
                      <div className="text-[10px] text-stone-400">{item.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[160px] truncate" title={item.purpose}>
                      {item.purpose}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-center sm:text-left">
                      {item.estimated_qty} units
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#384401]">
                      {item.quoted_price ? `₹${Number(item.quoted_price).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openInquiryDetails(item)}
                          className="px-2.5 py-1.5 bg-[#FAF4E6] hover:bg-[#eeddb9] text-[#384401] rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInquiry(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF9F5] border-2 border-[#eeddb9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#A45338] text-base">{selectedInquiry.id}</span>
                {getStatusBadge(selectedInquiry.status)}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#384401] font-poetsen">
                {selectedInquiry.name} {selectedInquiry.company_name ? `(${selectedInquiry.company_name})` : ''}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Submitted on {new Date(selectedInquiry.created_at).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Contact Quick Action Bar */}
            <div className="p-3 bg-white rounded-2xl border border-[#eeddb9]/70 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-stone-400">Direct Contact Details</p>
                <p className="text-xs font-extrabold text-[#384401]">{selectedInquiry.phone} • {selectedInquiry.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedInquiry.name)},%20regarding%20your%20Village%20Made%20bulk%20inquiry%20(${selectedInquiry.id})...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="px-3 py-1.5 bg-white border border-[#eeddb9] text-[#384401] rounded-xl text-[11px] font-extrabold flex items-center gap-1 hover:bg-stone-50 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Village%20Made%20Bulk%20Quotation%20(${selectedInquiry.id})`}
                  className="px-3 py-1.5 bg-white border border-[#eeddb9] text-[#384401] rounded-xl text-[11px] font-extrabold flex items-center gap-1 hover:bg-stone-50 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Inquiry Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[#eeddb9]/60 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">Occasion / Purpose</span>
                <span className="font-extrabold text-[#384401] text-sm block">{selectedInquiry.purpose}</span>
                {selectedInquiry.needed_by_date && (
                  <span className="text-stone-500 font-medium block">Target Date: {selectedInquiry.needed_by_date}</span>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#eeddb9]/60 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">Delivery Location</span>
                <span className="font-extrabold text-[#384401] text-sm block">
                  {selectedInquiry.city || 'Not specified'} {selectedInquiry.pincode ? `(${selectedInquiry.pincode})` : ''}
                </span>
                <span className="text-stone-500 font-medium block">Est. Total Quantity: {selectedInquiry.estimated_qty} units</span>
              </div>
            </div>

            {/* Requested Products List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#A45338]">Requested Products</h4>
              <div className="bg-white rounded-2xl border border-[#eeddb9]/70 p-3 space-y-2 max-h-48 overflow-y-auto">
                {Array.isArray(selectedInquiry.selected_products) && selectedInquiry.selected_products.length > 0 ? (
                  selectedInquiry.selected_products.map((prod: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF4E6]/50 text-xs font-bold text-[#384401]">
                      <span>{prod.name} ({prod.weight || '500g'})</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#eeddb9] font-black">{prod.qty || 1} units</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 font-medium italic">No specific products itemized.</p>
                )}
              </div>
            </div>

            {/* Customizations & Notes */}
            {selectedInquiry.notes && (
              <div className="p-3.5 bg-white rounded-2xl border border-[#eeddb9]/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400 block">Client Notes</span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed">{selectedInquiry.notes}</p>
              </div>
            )}

            {/* Update Quote & Status Form */}
            <form onSubmit={handleUpdateStatusAndQuote} className="p-5 bg-white rounded-2xl border border-[#384401]/30 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#A45338]" />
                <span>Admin Quote & Status Management</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-stone-700 mb-1">Update Status</label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-extrabold text-[#384401]"
                  >
                    <option value="Pending">Pending Quote</option>
                    <option value="Quote Sent">Quote Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="In Production">In Production</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-stone-700 mb-1">Quoted Total Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quotedPriceInput}
                    onChange={e => setQuotedPriceInput(e.target.value)}
                    placeholder="e.g. 15400"
                    className="w-full px-3 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-black text-[#A45338]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-stone-700 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={e => setAdminNotesInput(e.target.value)}
                  placeholder="Notes about custom discount, box packaging arrangements, shipping vendor..."
                  className="w-full px-3 py-2 bg-[#FAF4E6]/50 border border-[#eeddb9] rounded-xl text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={savingQuote}
                className="w-full py-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{savingQuote ? 'Saving Changes...' : 'Save Quote & Update Status'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
