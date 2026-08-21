'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Search, Star, MessageSquare, AlertCircle, X, Eye } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function AdminReviewsTab() {
  const { showConfirm, showToast, fetchProducts } = useApp();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters state
  const [ratingFilter, setRatingFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');
  
  // Selected review details modal
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${baseUrl}/products/reviews/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError(data.error || 'Failed to load reviews.');
      }
    } catch (err: any) {
      console.error('Error fetching admin reviews:', err);
      setError('Could not fetch reviews. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = (reviewId: string) => {
    showConfirm(
      'Delete Review',
      'Are you sure you want to permanently delete this review? This action cannot be undone.',
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const response = await fetch(`${baseUrl}/admin/reviews/${reviewId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            showToast('Review deleted successfully.', 'success');
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            if (selectedReview && selectedReview.id === reviewId) {
              setSelectedReview(null);
            }
            if (fetchProducts) {
              await fetchProducts(); // Sync catalog rating averages
            }
          } else {
            showToast(data.error || 'Failed to delete review.', 'error');
          }
        } catch (err) {
          console.error('Error deleting review:', err);
          showToast('Could not delete review. Try again later.', 'error');
        }
      }
    );
  };

  // Get list of unique products for the dropdown filter
  const productOptions = useMemo(() => {
    const productsSet = new Set<string>();
    reviews.forEach(r => {
      if (r.productName) productsSet.add(r.productName);
    });
    return Array.from(productsSet).sort();
  }, [reviews]);

  // Combined filters logic
  const filteredReviews = reviews.filter(r => {
    // 1. Text Search Filter
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (r.author || '').toLowerCase().includes(term) ||
      (r.authorEmail || '').toLowerCase().includes(term) ||
      (r.authorMobile || '').toLowerCase().includes(term) ||
      (r.productName || '').toLowerCase().includes(term) ||
      (r.comment || '').toLowerCase().includes(term) ||
      (r.title || '').toLowerCase().includes(term);

    // 2. Rating Threshold Filter
    let matchesRating = true;
    if (ratingFilter !== 'All') {
      const minRating = parseFloat(ratingFilter);
      matchesRating = r.rating >= minRating;
    }

    // 3. Product Dropdown Filter
    const matchesProduct = productFilter === 'All' || r.productName === productFilter;

    return matchesSearch && matchesRating && matchesProduct;
  });

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header card with statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/25">
        <div>
          <h2 className="text-base font-extrabold text-[#3E2C1C] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C56C4F]" />
            Customer Reviews
          </h2>
          <p className="text-xs text-[#704632] mt-1">Audit, filter and manage feedback left by buyers on the pantry products.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-[#eeddb9]/60 px-4 py-2 rounded-xl shadow-xs text-center min-w-[100px]">
            <span className="block text-xl font-black text-[#384401]">{reviews.length}</span>
            <span className="text-xs text-[#704632] font-bold uppercase">Total Reviews</span>
          </div>
          <div className="bg-white border border-[#eeddb9]/60 px-4 py-2 rounded-xl shadow-xs text-center min-w-[100px]">
            <span className="block text-xl font-black text-amber-500">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </span>
            <span className="text-xs text-[#704632] font-bold uppercase">Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Filters and Search row (matching Products tab style) */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Rating threshold Filter Dropdown */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-[#3E2C1C] text-sm font-bold focus:outline-none flex-shrink-0"
        >
          <option value="All">All Ratings</option>
          <option value="4.5">4.5★ & Above</option>
          <option value="4.0">4.0★ & Above</option>
          <option value="3.0">3.0★ & Above</option>
          <option value="2.0">2.0★ & Above</option>
          <option value="1.0">1.0★ & Above</option>
        </select>

        {/* Product Filter Dropdown */}
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-[#3E2C1C] text-sm font-bold focus:outline-none max-w-xs truncate flex-shrink-0"
        >
          <option value="All">All Products</option>
          {productOptions.map((prodName) => (
            <option key={prodName} value={prodName}>{prodName}</option>
          ))}
        </select>

        {/* Search input bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#704632]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, email, phone, title, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9.5 pr-3 bg-white border border-[#eeddb9] rounded-xl text-sm placeholder-[#704632]/50 text-[#3E2C1C] focus:outline-none"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#384401]/20 border-t-[#384401] rounded-full animate-spin"></div>
          <span className="text-xs text-[#704632] mt-3 font-bold">Loading reviews...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-red-200 rounded-2xl bg-red-50/20">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-xs font-bold text-red-800">{error}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#eeddb9] rounded-2xl bg-[#FAF4E6]/10 text-center">
          <MessageSquare className="w-8 h-8 text-[#704632]/50 mb-2" />
          <p className="text-xs font-bold text-[#3E2C1C]">No reviews found matching your search.</p>
        </div>
      ) : (
        /* Reviews Table View */
        <div className="border border-[#eeddb9] rounded-2xl overflow-hidden bg-white shadow-2xs overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm border-collapse font-jakarta">
            <thead>
              <tr className="bg-[#FAF4E6]/30 border-b border-[#eeddb9] text-[#704632] font-bold uppercase tracking-wider text-xs">
                <th className="p-4 pl-5 border-r border-[#eeddb9] w-16 text-center">SNo</th>
                <th className="p-4 border-r border-[#eeddb9] w-52">Customer Name & Number</th>
                <th className="p-4 border-r border-[#eeddb9] w-48">Product Name</th>
                <th className="p-4 border-r border-[#eeddb9] w-28">Star Rating</th>
                <th className="p-4 border-r border-[#eeddb9] w-[350px]">Title & Message</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeddb9]">
              {filteredReviews.map((rev, index) => (
                <tr 
                  key={rev.id} 
                  className="font-medium text-[#3E2C1C] hover:bg-[#FAF4E6]/10 transition-colors text-xs"
                >
                  {/* SNo */}
                  <td className="p-4 pl-5 border-r border-[#eeddb9] text-center font-bold text-[#704632]">
                    {index + 1}
                  </td>
                  
                  {/* Customer Name & Number */}
                  <td className="p-4 border-r border-[#eeddb9] leading-tight">
                    <span className="font-extrabold text-[#3E2C1C] block text-sm">{rev.author}</span>
                    {rev.authorMobile && (
                      <span className="text-xs text-[#704632]/85 font-semibold block mt-1 select-all">+91 {rev.authorMobile}</span>
                    )}
                  </td>
                  
                  {/* Product Name */}
                  <td className="p-4 border-r border-[#eeddb9] font-extrabold text-[#3E2C1C] text-sm">
                    {rev.productName}
                  </td>
                  
                  {/* Star Rating */}
                  <td className="p-4 border-r border-[#eeddb9]">
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-250/50 px-2 py-0.5 rounded-lg w-fit">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                      <span className="text-xs font-black text-amber-850">{rev.rating}</span>
                    </div>
                  </td>

                  {/* Title & Message */}
                  <td className="p-4 border-r border-[#eeddb9] leading-normal">
                    <span className="font-black text-[#3E2C1C] block text-xs">
                      {rev.title || 'Verified Purchase Review'}
                    </span>
                    <p className="text-sm text-[#704632] mt-1 font-semibold line-clamp-3 overflow-hidden italic">
                      "{rev.comment}"
                    </p>
                  </td>
                  
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedReview(rev)}
                        className="p-2 text-[#384401] hover:bg-[#384401]/10 rounded-full transition-all duration-300 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-2 text-[#C56C4F] hover:text-red-700 hover:bg-red-50/60 rounded-full transition-all duration-300 cursor-pointer active:scale-95"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Review Details Modal popup */}
      {selectedReview && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px] z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#eeddb9] w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-[#eeddb9] flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
                  <MessageSquare className="w-5.5 h-5.5 text-[#C56C4F]" />
                  Review details
                </h3>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="w-9 h-9 rounded-full bg-[#FAF4E6]/40 border border-[#eeddb9]/30 flex items-center justify-center text-[#704632] hover:text-[#3E2C1C] hover:bg-[#FAF4E6]/80 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content details */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#3d2b1f] font-jakarta leading-relaxed">
              
              {/* Product block */}
              <div className="bg-[#FAF4E6]/50 border border-[#eeddb9]/45 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-black text-[#704632]/80 uppercase tracking-widest block">Product Reviewed</span>
                <h4 className="text-sm sm:text-base font-extrabold text-[#3E2C1C]">{selectedReview.productName}</h4>
                <span className="text-xs text-[#704632] font-semibold block">ID: {selectedReview.productId}</span>
              </div>

              {/* Reviewer Details */}
              <div className="border border-[#eeddb9]/45 rounded-2xl p-4 bg-white space-y-3 shadow-3xs">
                <span className="text-xs font-black text-[#704632]/80 uppercase tracking-widest block">Reviewer Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-xs text-[#704632] block font-bold">Author Name</span>
                    <span className="font-extrabold text-[#384401] text-xs sm:text-sm">{selectedReview.author}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#704632] block font-bold">User ID</span>
                    <span className="font-mono font-bold text-[#3E2C1C] text-xs">{selectedReview.userId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#704632] block font-bold">Email address</span>
                    <span className="font-extrabold text-[#3E2C1C] text-xs select-all">{selectedReview.authorEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#704632] block font-bold">Mobile Phone</span>
                    <span className="font-extrabold text-[#3E2C1C] text-xs select-all">
                      {selectedReview.authorMobile ? `+91 ${selectedReview.authorMobile}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content block */}
              <div className="border border-[#eeddb9]/45 rounded-2xl p-4 bg-white space-y-3.5 shadow-3xs">
                <span className="text-xs font-black text-[#704632]/80 uppercase tracking-widest block">Feedback Summary</span>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-205/55 px-2.5 py-0.5 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black text-amber-750">{selectedReview.rating} Stars</span>
                  </div>
                  <span className="text-xs font-bold text-[#704632]/80">{selectedReview.date}</span>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-black text-[#3E2C1C] text-xs sm:text-sm leading-tight">
                    {selectedReview.title || 'Verified Purchase Review'}
                  </h5>
                  <p className="text-xs sm:text-sm text-[#3E2C1C] bg-[#FAF4E6]/10 border border-[#eeddb9]/30 p-3 rounded-xl italic leading-relaxed">
                    "{selectedReview.comment}"
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer actions */}
            <div className="p-4 border-t border-[#eeddb9] bg-[#FAF4E6]/20 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 border border-[#eeddb9] bg-white hover:bg-[#FAF4E6]/40 text-[#704632] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="px-4 py-2 bg-[#C56C4F] hover:bg-[#8B5A3C] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Feedback
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
