import React from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { ExtendedProduct } from './types';

interface AdminProductsTabProps {
  categories: { id: string; name: string }[];
  selectedProductCategory: string;
  setSelectedProductCategory: (val: string) => void;
  productSearch: string;
  setProductSearch: (val: string) => void;
  productViewMode: 'card' | 'table';
  setProductViewMode: (val: 'card' | 'table') => void;
  showAddCategory: boolean;
  setShowAddCategory: (val: boolean) => void;
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatDesc: string;
  setNewCatDesc: (val: string) => void;
  handleAddCategorySubmit: (e: React.FormEvent) => void;
  showAddProduct: boolean;
  setShowAddProduct: (val: boolean) => void;
  newProdCat: string;
  setNewProdCat: (val: string) => void;
  newProdName: string;
  setNewProdName: (val: string) => void;
  newProdPrice: number;
  setNewProdPrice: (val: number) => void;
  newProdDesc: string;
  setNewProdDesc: (val: string) => void;
  newProdBadge: string;
  setNewProdBadge: (val: string) => void;
  newProdStock: number;
  setNewProdStock: (val: number) => void;
  newProdImage: string;
  setNewProdImage: (val: string) => void;
  newProdVideo: string;
  setNewProdVideo: (val: string) => void;
  newProdIngDesktop: string;
  setNewProdIngDesktop: (val: string) => void;
  newProdIngTablet: string;
  setNewProdIngTablet: (val: string) => void;
  newProdIngMobile: string;
  setNewProdIngMobile: (val: string) => void;
  newProdIngSameTab: boolean;
  setNewProdIngSameTab: (val: boolean) => void;
  newProdIngSameMobile: 'desktop' | 'tablet' | 'none';
  setNewProdIngSameMobile: (val: 'desktop' | 'tablet' | 'none') => void;
  newProdBenefits: string;
  setNewProdBenefits: (val: string) => void;
  newProdFaqs: { q: string; a: string }[];
  setNewProdFaqs: React.Dispatch<React.SetStateAction<{ q: string; a: string }[]>>;
  faqInputQ: string;
  setFaqInputQ: (val: string) => void;
  faqInputA: string;
  setFaqInputA: (val: string) => void;
  uploadingImage: boolean;
  setUploadingImage: (val: boolean) => void;
  uploadingVideo: boolean;
  setUploadingVideo: (val: boolean) => void;
  handleFileUpload: (file: File, bucket: 'product-images' | 'product-videos') => Promise<string | null>;
  handleAddProductSubmit: (e: React.FormEvent) => void;
  editingProduct: ExtendedProduct | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<ExtendedProduct | null>>;
  handleUpdateProduct: (e: React.FormEvent) => void;
  handleDeleteProduct: (productId: string) => void;
  filteredProducts: ExtendedProduct[];
  triggerAlert: (msg: string, isError?: boolean) => void;
}

export default function AdminProductsTab({
  categories,
  selectedProductCategory,
  setSelectedProductCategory,
  productSearch,
  setProductSearch,
  productViewMode,
  setProductViewMode,
  showAddCategory,
  setShowAddCategory,
  newCatName,
  setNewCatName,
  newCatDesc,
  setNewCatDesc,
  handleAddCategorySubmit,
  showAddProduct,
  setShowAddProduct,
  newProdCat,
  setNewProdCat,
  newProdName,
  setNewProdName,
  newProdPrice,
  setNewProdPrice,
  newProdDesc,
  setNewProdDesc,
  newProdBadge,
  setNewProdBadge,
  newProdStock,
  setNewProdStock,
  newProdImage,
  setNewProdImage,
  newProdVideo,
  setNewProdVideo,
  newProdIngDesktop,
  setNewProdIngDesktop,
  newProdIngTablet,
  setNewProdIngTablet,
  newProdIngMobile,
  setNewProdIngMobile,
  newProdIngSameTab,
  setNewProdIngSameTab,
  newProdIngSameMobile,
  setNewProdIngSameMobile,
  newProdBenefits,
  setNewProdBenefits,
  newProdFaqs,
  setNewProdFaqs,
  faqInputQ,
  setFaqInputQ,
  faqInputA,
  setFaqInputA,
  uploadingImage,
  setUploadingImage,
  uploadingVideo,
  setUploadingVideo,
  handleFileUpload,
  handleAddProductSubmit,
  editingProduct,
  setEditingProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  filteredProducts,
  triggerAlert,
}: AdminProductsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters and Add row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedProductCategory}
            onChange={(e) => setSelectedProductCategory(e.target.value)}
            className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-stone-900 text-xs font-bold"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-stone-455 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full h-10 pl-8.5 pr-3 bg-white border border-[#eeddb9] rounded-xl text-xs placeholder-stone-400 focus:outline-none"
            />
          </div>

          <div className="flex bg-stone-100 rounded-xl p-0.5 border border-stone-200 select-none items-center">
            <button
              type="button"
              onClick={() => setProductViewMode('card')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-jakarta transition-all cursor-pointer ${
                productViewMode === 'card' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setProductViewMode('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-jakarta transition-all cursor-pointer ${
                productViewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setShowAddProduct(false);
              setEditingProduct(null);
              setShowAddCategory(!showAddCategory);
            }}
            className="flex items-center justify-center gap-1.5 bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Category
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowAddCategory(false);
              setShowAddProduct(!showAddProduct);
            }}
            className="flex items-center justify-center gap-1.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Product
          </button>
        </div>
      </div>

      {/* Add Category Modal/Form */}
      {showAddCategory && (
        <form onSubmit={handleAddCategorySubmit} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/20 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#704632] font-jakarta">Add New Provision Category</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Natural Sugar"
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Category Description</label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short description of category..."
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
              Save Category
            </button>
            <button type="button" onClick={() => setShowAddCategory(false)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add Product Modal/Form */}
      {showAddProduct && (
        <form onSubmit={handleAddProductSubmit} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/20 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#384401] font-jakarta">Add New Provision Product</h4>
          <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr] gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Category</label>
              <select
                value={newProdCat}
                onChange={(e) => setNewProdCat(e.target.value)}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Name</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="e.g. MULTI GRAIN COOKIES"
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Base Price (₹)</label>
              <input
                type="number"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(Number(e.target.value))}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
            <div className="flex flex-col gap-1 sm:col-span-3">
              <label className="text-[10px] font-bold text-stone-600">Description</label>
              <textarea
                rows={3}
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Detailed product explanation..."
                className="p-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 resize-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Ribbon Badge (Optional)</label>
              <input
                type="text"
                value={newProdBadge}
                onChange={(e) => setNewProdBadge(e.target.value)}
                placeholder="e.g. BEST SELLER"
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Initial Stock</label>
              <input
                type="number"
                value={newProdStock}
                onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Banner Image (Upload directly to Supabase storage)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingImage(true);
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) setNewProdImage(url);
                      setUploadingImage(false);
                    }
                  }}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                />
                {uploadingImage && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
              </div>
              {newProdImage && (
                <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">Uploaded: {newProdImage}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Video (Upload directly to Supabase storage)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingVideo(true);
                      const url = await handleFileUpload(file, 'product-videos');
                      if (url) setNewProdVideo(url);
                      setUploadingVideo(false);
                    }
                  }}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                />
                {uploadingVideo && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
              </div>
              {newProdVideo && (
                <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">Uploaded: {newProdVideo}</span>
              )}
            </div>
          </div>
          
          {/* Ingredients Infographic Setup */}
          <div className="border border-[#eeddb9]/60 rounded-xl p-4 bg-amber-50/5 space-y-3 font-jakarta">
            <span className="text-xs font-bold text-[#704632] block uppercase tracking-wider">Ingredients Infographics Image Configuration</span>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Desktop Ingredients Image URL / Upload</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newProdIngDesktop}
                  onChange={(e) => setNewProdIngDesktop(e.target.value)}
                  placeholder="e.g. /images/products/ingredients-image.webp"
                  className="flex-grow h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) setNewProdIngDesktop(url);
                    }
                  }}
                  className="text-xs w-48 file:py-1 file:px-3 file:rounded-lg file:bg-stone-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newProdIngSameTab"
                  checked={newProdIngSameTab}
                  onChange={(e) => setNewProdIngSameTab(e.target.checked)}
                  className="cursor-pointer rounded border-[#eeddb9]"
                />
                <label htmlFor="newProdIngSameTab" className="text-[10px] font-bold text-stone-650 cursor-pointer select-none">Use same ingredients image for tablet</label>
              </div>
              {!newProdIngSameTab && (
                <div className="flex flex-col gap-1 pl-5">
                  <label className="text-[9px] font-bold text-stone-500">Tablet Ingredients Image URL</label>
                  <input
                    type="text"
                    value={newProdIngTablet}
                    onChange={(e) => setNewProdIngTablet(e.target.value)}
                    placeholder="Tablet specific ingredients image URL..."
                    className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
              <div className="flex items-center gap-4">
                <label className="text-[10px] font-bold text-stone-650">Mobile Option:</label>
                <select
                  value={newProdIngSameMobile}
                  onChange={(e: any) => setNewProdIngSameMobile(e.target.value)}
                  className="h-8 px-2 bg-white border border-[#eeddb9] rounded-lg text-xs"
                >
                  <option value="desktop">Use the same as desktop</option>
                  <option value="tablet">Use the same as tablet</option>
                  <option value="none">Use separate mobile image</option>
                </select>
              </div>
              {newProdIngSameMobile === 'none' && (
                <div className="flex flex-col gap-1 pl-5">
                  <label className="text-[9px] font-bold text-stone-500">Mobile Ingredients Image URL</label>
                  <input
                    type="text"
                    value={newProdIngMobile}
                    onChange={(e) => setNewProdIngMobile(e.target.value)}
                    placeholder="Mobile specific ingredients image URL..."
                    className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Benefits (Comma separated)</label>
              <input
                type="text"
                value={newProdBenefits}
                onChange={(e) => setNewProdBenefits(e.target.value)}
                placeholder="e.g. Traditional Nutrition, Easy to Digest"
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              />
            </div>
          </div>

          {/* FAQ section creator */}
          <div className="border border-[#eeddb9]/60 rounded-xl p-4 bg-stone-50/5 space-y-4.5 font-jakarta">
            <span className="text-xs font-bold text-[#384401] block uppercase tracking-wider">Product FAQ Editor</span>
            
            {/* Active FAQs list */}
            {newProdFaqs.length > 0 && (
              <div className="space-y-2 border-b border-stone-200 pb-3">
                {newProdFaqs.map((faq, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 bg-white border border-[#eeddb9]/45 rounded-lg p-2.5 text-[11px]">
                    <div>
                      <span className="font-bold text-stone-850 block">Q: {faq.q}</span>
                      <span className="text-stone-550 block mt-0.5">A: {faq.a}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewProdFaqs(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 font-bold shrink-0 cursor-pointer text-[10px] uppercase"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add FAQ form controls */}
            <div className="flex flex-col gap-2 bg-stone-100/50 p-3 rounded-lg border border-stone-200/50">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-stone-500">Question</label>
                <input
                  type="text"
                  value={faqInputQ}
                  onChange={(e) => setFaqInputQ(e.target.value)}
                  placeholder="e.g. Is this gluten-free?"
                  className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs text-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-stone-500">Answer</label>
                <textarea
                  rows={2}
                  value={faqInputA}
                  onChange={(e) => setFaqInputA(e.target.value)}
                  placeholder="e.g. Yes, fingermillet is naturally gluten-free..."
                  className="p-2.5 bg-white border border-[#eeddb9] rounded-lg text-xs text-stone-900 resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (faqInputQ.trim() && faqInputA.trim()) {
                    setNewProdFaqs(prev => [...prev, { q: faqInputQ.trim(), a: faqInputA.trim() }]);
                    setFaqInputQ('');
                    setFaqInputA('');
                  } else {
                    triggerAlert('Please enter both FAQ Question and Answer.', true);
                  }
                }}
                className="self-end bg-[#384401] hover:bg-[#252d00] text-white text-[10px] font-bold py-1.5 px-4 rounded-lg cursor-pointer"
              >
                Add Q&A Pair
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
              Save Product
            </button>
            <button type="button" onClick={() => setShowAddProduct(false)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit Product Inline Form */}
      {editingProduct && (
        <form onSubmit={handleUpdateProduct} className="border border-amber-200 rounded-2xl p-5 bg-amber-50/10 space-y-4 font-jakarta">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 font-jakarta">Edit Provision Product Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr] gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Category</label>
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Name</label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Base Price (₹)</label>
              <input
                type="number"
                required
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
            <div className="flex flex-col gap-1 sm:col-span-3">
              <label className="text-[10px] font-bold text-stone-600">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="p-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 resize-none font-jakarta"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Ribbon Badge (Optional)</label>
              <input
                type="text"
                value={editingProduct.badge || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value || undefined })}
                placeholder="e.g. BEST SELLER"
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Stock</label>
              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Image (Change file)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingImage(true);
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) setEditingProduct({ ...editingProduct, image: url });
                      setUploadingImage(false);
                    }
                  }}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                />
                {uploadingImage && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
              </div>
              {editingProduct.image && (
                <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">URL: {editingProduct.image}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Product Video (Change file)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingVideo(true);
                      const url = await handleFileUpload(file, 'product-videos');
                      if (url) setEditingProduct({ ...editingProduct, video: url });
                      setUploadingVideo(false);
                    }
                  }}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                />
                {uploadingVideo && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
              </div>
              {editingProduct.video && (
                <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">URL: {editingProduct.video}</span>
              )}
            </div>
          </div>

          {/* Ingredients Infographic Setup */}
          <div className="border border-[#eeddb9]/60 rounded-xl p-4 bg-amber-50/5 space-y-3 font-jakarta text-xs text-stone-900">
            <span className="text-xs font-bold text-[#704632] block uppercase tracking-wider">Ingredients Infographics Image Configuration</span>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600 font-jakarta">Desktop Ingredients Image URL / Upload</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.desktop || '') : ''}
                  onChange={(e) => {
                    const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                    setEditingProduct({
                      ...editingProduct,
                      ingredients: { ...(prevIng as any), desktop: e.target.value }
                    });
                  }}
                  placeholder="e.g. /images/products/ingredients-image.webp"
                  className="flex-grow h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) {
                        const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                        setEditingProduct({
                          ...editingProduct,
                          ingredients: { ...(prevIng as any), desktop: url }
                        });
                      }
                    }
                  }}
                  className="text-xs w-48 file:py-1 file:px-3 file:rounded-lg file:bg-stone-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editProdIngSameTab"
                  checked={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? !!((editingProduct.ingredients as any)?.useSameForTab) : true}
                  onChange={(e) => {
                    const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                    setEditingProduct({
                      ...editingProduct,
                      ingredients: { ...(prevIng as any), useSameForTab: e.target.checked }
                    });
                  }}
                  className="cursor-pointer rounded border-[#eeddb9]"
                />
                <label htmlFor="editProdIngSameTab" className="text-[10px] font-bold text-stone-650 cursor-pointer select-none">Use same ingredients image for tablet</label>
              </div>
              {!(typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? !!((editingProduct.ingredients as any)?.useSameForTab) : true) && (
                <div className="flex flex-col gap-1 pl-5">
                  <label className="text-[9px] font-bold text-stone-500 font-jakarta">Tablet Ingredients Image URL</label>
                  <input
                    type="text"
                    value={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.tablet || '') : ''}
                    onChange={(e) => {
                      const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                      setEditingProduct({
                        ...editingProduct,
                        ingredients: { ...(prevIng as any), tablet: e.target.value }
                      });
                    }}
                    placeholder="Tablet specific ingredients image URL..."
                    className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
              <div className="flex items-center gap-4">
                <label className="text-[10px] font-bold text-stone-655 font-jakarta">Mobile Option:</label>
                <select
                  value={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.useSameForMobile || 'desktop') : 'desktop'}
                  onChange={(e: any) => {
                    const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                    setEditingProduct({
                      ...editingProduct,
                      ingredients: { ...(prevIng as any), useSameForMobile: e.target.value }
                    });
                  }}
                  className="h-8 px-2 bg-white border border-[#eeddb9] rounded-lg text-xs"
                >
                  <option value="desktop">Use the same as desktop</option>
                  <option value="tablet">Use the same as tablet</option>
                  <option value="none">Use separate mobile image</option>
                </select>
              </div>
              {(typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.useSameForMobile || 'desktop') : 'desktop') === 'none' && (
                <div className="flex flex-col gap-1 pl-5">
                  <label className="text-[9px] font-bold text-stone-500 font-jakarta">Mobile Ingredients Image URL</label>
                  <input
                    type="text"
                    value={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.mobile || '') : ''}
                    onChange={(e) => {
                      const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                      setEditingProduct({
                        ...editingProduct,
                        ingredients: { ...(prevIng as any), mobile: e.target.value }
                      });
                    }}
                    placeholder="Mobile specific ingredients image URL..."
                    className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 font-jakarta">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600 font-jakarta">Benefits (Comma separated)</label>
              <input
                type="text"
                value={editingProduct.benefits ? editingProduct.benefits.join(', ') : ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, benefits: e.target.value.split(',').map(s => s.trim()) })}
                className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
              />
            </div>
          </div>

          {/* FAQ section creator */}
          <div className="border border-[#eeddb9]/60 rounded-xl p-4 bg-stone-50/5 space-y-4.5 font-jakarta">
            <span className="text-xs font-bold text-[#384401] block uppercase tracking-wider font-jakarta">Product FAQ Editor</span>
            
            {/* Active FAQs list */}
            {editingProduct.faqs && editingProduct.faqs.length > 0 && (
              <div className="space-y-2 border-b border-stone-200 pb-3 text-xs text-stone-900">
                {editingProduct.faqs.map((faq: { q: string; a: string }, idx: number) => (
                  <div key={idx} className="flex justify-between items-start gap-2 bg-white border border-[#eeddb9]/45 rounded-lg p-2.5">
                    <div>
                      <span className="font-bold text-stone-850 block">Q: {faq.q}</span>
                      <span className="text-stone-555 block mt-0.5 font-jakarta font-medium">A: {faq.a}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFaqs = editingProduct.faqs.filter((_: any, i: number) => i !== idx);
                        setEditingProduct({ ...editingProduct, faqs: updatedFaqs });
                      }}
                      className="text-red-500 hover:text-red-700 font-bold shrink-0 cursor-pointer text-[10px] uppercase font-jakarta"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add FAQ form controls */}
            <div className="flex flex-col gap-2 bg-stone-100/50 p-3 rounded-lg border border-stone-200/50 text-xs text-stone-900 font-jakarta">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-stone-500">Question</label>
                <input
                  type="text"
                  value={faqInputQ}
                  onChange={(e) => setFaqInputQ(e.target.value)}
                  placeholder="e.g. Is this gluten-free?"
                  className="h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-stone-500">Answer</label>
                <textarea
                  rows={2}
                  value={faqInputA}
                  onChange={(e) => setFaqInputA(e.target.value)}
                  placeholder="e.g. Yes, fingermillet is naturally gluten-free..."
                  className="p-2.5 bg-white border border-[#eeddb9] rounded-lg text-xs resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (faqInputQ.trim() && faqInputA.trim()) {
                    const prevFaqs = editingProduct.faqs || [];
                    setEditingProduct({
                      ...editingProduct,
                      faqs: [...prevFaqs, { q: faqInputQ.trim(), a: faqInputA.trim() }]
                    });
                    setFaqInputQ('');
                    setFaqInputA('');
                  } else {
                    triggerAlert('Please enter both FAQ Question and Answer.', true);
                  }
                }}
                className="self-end bg-[#384401] hover:bg-[#252d00] text-white text-[10px] font-bold py-1.5 px-4 rounded-lg cursor-pointer font-jakarta"
              >
                Add Q&A Pair
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
              Update Product
            </button>
            <button type="button" onClick={() => setEditingProduct(null)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List (Grid or Table View) */}
      {productViewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => {
                setShowAddProduct(false);
                setShowAddCategory(false);
                setEditingProduct(p);
              }}
              className="border border-[#eeddb9]/50 hover:border-[#384401]/60 rounded-2xl p-4.5 bg-stone-50/20 flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-stone-400 font-jakarta">{p.category}</span>
                  {p.badge && (
                    <span className="bg-[#C56C4F]/10 text-[#C56C4F] text-[9px] font-extrabold px-2 py-0.5 rounded-full font-jakarta">{p.badge}</span>
                  )}
                </div>
                <h4 className="font-extrabold text-stone-850 group-hover:text-[#384401] text-sm font-jakarta mt-1.5 transition-colors">{p.name}</h4>
                <p className="text-[11px] text-stone-500 font-jakarta mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-stone-150">
                <div className="flex flex-col">
                  <span className="font-bold text-stone-955">₹{p.price}</span>
                  <span className="text-[10px] text-stone-455 font-jakarta">Stock: {p.stock}</span>
                </div>
                <div className="flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(p);
                    }}
                    className="flex items-center gap-1 text-stone-600 hover:text-[#384401] text-xs font-bold cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Modify
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="flex items-center gap-1 text-red-650 hover:text-red-800 text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse font-jakarta">
              <thead>
                <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                  <th className="p-3.5 pl-5 border border-[#eeddb9]">SKU/ID</th>
                  <th className="p-3.5 border border-[#eeddb9]">Product Name</th>
                  <th className="p-3.5 border border-[#eeddb9]">Category</th>
                  <th className="p-3.5 border border-[#eeddb9]">Price</th>
                  <th className="p-3.5 border border-[#eeddb9]">Stock</th>
                  <th className="p-3.5 pr-5 border border-[#eeddb9] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeddb9]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-455 font-medium border border-[#eeddb9]">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => {
                        setShowAddProduct(false);
                        setShowAddCategory(false);
                        setEditingProduct(p);
                      }}
                      className="hover:bg-stone-50/60 font-semibold cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 pl-5 text-stone-900 border border-[#eeddb9]">#{p.id}</td>
                      <td className="p-3.5 text-[#384401] font-bold border border-[#eeddb9]">{p.name}</td>
                      <td className="p-3.5 text-stone-500 border border-[#eeddb9]">{p.category}</td>
                      <td className="p-3.5 text-stone-900 border border-[#eeddb9]">₹{p.price}</td>
                      <td className="p-3.5 border border-[#eeddb9]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 border border-[#eeddb9] text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-3.5">
                          <button
                            onClick={() => {
                              setShowAddProduct(false);
                              setEditingProduct(p);
                            }}
                            className="text-stone-600 hover:text-[#384401] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Modify
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
