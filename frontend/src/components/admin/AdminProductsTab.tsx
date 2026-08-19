import React, { useState, useRef } from 'react';
import { Search, Plus, Edit, Trash2, X, Check, Upload } from 'lucide-react';
import { ExtendedProduct, ProductBenefit } from './types';

interface UploadBoxProps {
  accept: string;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  label: string;
  currentValue?: string;
  isUploading?: boolean;
}

function UploadBox({ accept, onFileSelect, onClear, label, currentValue, isUploading }: UploadBoxProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-stone-650 font-jakarta">{label}</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          isDragOver 
            ? 'border-[#384401] bg-[#384401]/5' 
            : currentValue 
              ? 'border-emerald-500/50 bg-emerald-50/5' 
              : 'border-[#eeddb9] bg-white hover:bg-[#FAF4E6]/20'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-1.5 animate-pulse">
            <span className="text-xs text-[#C56C4F] font-bold">Uploading File...</span>
          </div>
        ) : currentValue ? (
          <div className="flex flex-col items-center gap-1 text-center w-full">
            <span className="text-xs font-bold text-emerald-800 truncate max-w-[250px]">
              Uploaded Successfully
            </span>
            <div className="flex gap-2 items-center mt-1" onClick={(e) => e.stopPropagation()}>
              <a 
                href={currentValue} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-[#384401] hover:underline font-bold"
              >
                Preview Link
              </a>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold ml-2 border border-red-200 px-1.5 py-0.5 rounded bg-red-50"
                >
                  Remove File
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-stone-400 text-center">
            <Upload className="w-5 h-5 text-stone-450" />
            <span className="text-xs font-bold font-jakarta text-stone-600">Drag & Drop or Click to Upload</span>
            <span className="text-[10px] text-stone-400">Supports images & videos</span>
          </div>
        )}
      </div>
    </div>
  );
}

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
  newProdBenefits: ProductBenefit[];
  setNewProdBenefits: React.Dispatch<React.SetStateAction<ProductBenefit[]>>;
  newProdFaqs: { q: string; a: string }[];
  setNewProdFaqs: React.Dispatch<React.SetStateAction<{ q: string; a: string }[]>>;
  newProdShelfLife: string;
  setNewProdShelfLife: (val: string) => void;
  newProdShelfLifeDetails: string;
  setNewProdShelfLifeDetails: (val: string) => void;
  newProdSuitableFor: { label: string; value: string }[];
  setNewProdSuitableFor: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
  newProdRecipes: any[];
  setNewProdRecipes: React.Dispatch<React.SetStateAction<any[]>>;
  newProdDescImage: string;
  setNewProdDescImage: (val: string) => void;
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
  newProdWeights: any[];
  setNewProdWeights: (val: any[]) => void;
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
  newProdShelfLife,
  setNewProdShelfLife,
  newProdShelfLifeDetails,
  setNewProdShelfLifeDetails,
  newProdSuitableFor,
  setNewProdSuitableFor,
  newProdRecipes,
  setNewProdRecipes,
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
  newProdWeights,
  setNewProdWeights,
  newProdDescImage,
  setNewProdDescImage,
}: AdminProductsTabProps) {
  const [customWeightAdd, setCustomWeightAdd] = React.useState('');
  const [customWeightEdit, setCustomWeightEdit] = React.useState('');
  const [addActiveTab, setAddActiveTab] = React.useState<'basic' | 'description' | 'ingredients' | 'faqs' | 'recipes'>('basic');
  const [editActiveTab, setEditActiveTab] = React.useState<'basic' | 'description' | 'ingredients' | 'faqs' | 'recipes'>('basic');
  const [renamingWeightAdd, setRenamingWeightAdd] = React.useState<string | null>(null);
  const [renameValueAdd, setRenameValueAdd] = React.useState('');
  const [renamingWeightEdit, setRenamingWeightEdit] = React.useState<string | null>(null);
  const [renameValueEdit, setRenameValueEdit] = React.useState('');

  const groupedProducts = React.useMemo(() => {
    const groups: { [key: string]: ExtendedProduct[] } = {};
    filteredProducts.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const sortedCategoryNames = React.useMemo(() => {
    const categoryOrder = categories.map((c) => c.name);
    return Object.keys(groupedProducts).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedProducts, categories]);

  return (
    <div className="space-y-6">
      {/* Filters and Add row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between font-jakarta">
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedProductCategory}
            onChange={(e) => setSelectedProductCategory(e.target.value)}
            className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-stone-900 text-xs font-bold focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold font-jakarta transition-all cursor-pointer ${
                productViewMode === 'card' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setProductViewMode('table')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold font-jakarta transition-all cursor-pointer ${
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
        <div className="fixed h-full inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleAddCategorySubmit} className="bg-[#FAF6EB] border border-[#eeddb9] rounded-2xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative space-y-4 font-jakarta text-[#3d2b1f]">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-extrabold uppercase tracking-wider text-[#704632] font-jakarta">Add New Provision Category</h4>
              <button
                type="button"
                onClick={() => setShowAddCategory(false)}
                className="text-stone-600 hover:text-stone-900 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 font-jakarta">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-stone-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Natural Sugar"
                  className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-stone-700">Category Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description of category..."
                  className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2 justify-end">
              <button type="button" onClick={() => setShowAddCategory(false)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Product Modal/Form */}
      {showAddProduct && (
        <div className="fixed h-full inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleAddProductSubmit} className="bg-[#FAF6EB] border border-[#eeddb9] rounded-2xl p-6 shadow-2xl max-w-4xl w-full font-jakarta text-[#3d2b1f]">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-extrabold uppercase tracking-wider text-[#384401] font-jakarta">Add New Provision Product</h4>
              <button
                type="button"
                onClick={() => { setShowAddProduct(false); setAddActiveTab('basic'); }}
                className="text-stone-600 hover:text-stone-900 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-[#eeddb9]/50 mb-4 font-jakarta gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAddActiveTab('basic')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  addActiveTab === 'basic' 
                    ? 'text-[#384401] border-b-2 border-[#384401]' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Basic Details
              </button>
              <button
                type="button"
                onClick={() => setAddActiveTab('description')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  addActiveTab === 'description' 
                    ? 'text-[#384401] border-b-2 border-[#384401]' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setAddActiveTab('ingredients')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  addActiveTab === 'ingredients' 
                    ? 'text-[#384401] border-b-2 border-[#384401]' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Ingredients
              </button>
              <button
                type="button"
                onClick={() => setAddActiveTab('faqs')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  addActiveTab === 'faqs' 
                    ? 'text-[#384401] border-b-2 border-[#384401]' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                FAQs
              </button>
              <button
                type="button"
                onClick={() => setAddActiveTab('recipes')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  addActiveTab === 'recipes' 
                    ? 'text-[#384401] border-b-2 border-[#384401]' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Recipes
              </button>
            </div>

            <div className="mt-2 max-h-[70vh] overflow-y-auto relative space-y-6 pr-1">

              {addActiveTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Category</label>
                      <select
                        value={newProdCat}
                        onChange={(e) => setNewProdCat(e.target.value)}
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. MULTI GRAIN COOKIES"
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-jakarta focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-sm font-bold text-stone-700">Description</label>
                      <textarea
                        rows={3}
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Detailed product explanation..."
                        className="p-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 resize-none focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Ribbon Badge (Optional)</label>
                      <input
                        type="text"
                        value={newProdBadge}
                        onChange={(e) => setNewProdBadge(e.target.value)}
                        placeholder="e.g. BEST SELLER"
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Initial Stock</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Add Product Weights */}
                  <div className="flex flex-col gap-2.5 border border-[#eeddb9]/60 rounded-xl p-4 bg-stone-50/15 font-jakarta animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 border-b border-[#eeddb9]/45 pb-2.5">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider">Available Weight Variants & Custom Prices</span>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="e.g. 750 g or 2 kg"
                          value={customWeightAdd}
                          onChange={(e) => setCustomWeightAdd(e.target.value)}
                          className="h-8 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs placeholder-stone-400 focus:outline-none focus:border-[#384401] w-36 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cleanName = customWeightAdd.trim();
                            if (!cleanName) return;
                            
                            const currentNewProdWeights = newProdWeights as any[];
                            const exists = currentNewProdWeights.some(w => {
                              const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                              return name.toLowerCase().replace(/\s+/g, '') === cleanName.toLowerCase().replace(/\s+/g, '');
                            });
                            if (exists) {
                              alert('This variant already exists!');
                              return;
                            }
                            
                            const basePrice = newProdPrice || 0;
                            setNewProdWeights([...currentNewProdWeights, { weight: cleanName, price: basePrice }]);
                            setCustomWeightAdd('');
                          }}
                          className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(() => {
                        const defaultSizes = ['250 g', '500 g', '1 kg'];
                        const currentNewProdWeights = newProdWeights as any[];
                        const existingNames = currentNewProdWeights.map((w: any) => typeof w === 'object' && w !== null && w.weight ? w.weight : w);
                        const allSizes = Array.from(new Set([...defaultSizes, ...existingNames]));
                        return allSizes.map(weight => {
                          const matchingItem = currentNewProdWeights.find((w: any) => {
                            const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                            return name === weight;
                          });
                          const hasWeight = !!matchingItem;
                          
                          let currentPriceValue = 0;
                          let currentStockValue = 0;
                          if (hasWeight) {
                            if (typeof matchingItem === 'object' && matchingItem !== null) {
                              currentPriceValue = typeof matchingItem.price === 'number' ? matchingItem.price : 0;
                              currentStockValue = typeof matchingItem.stock === 'number' ? matchingItem.stock : (newProdStock || 50);
                            } else {
                              const basePrice = newProdPrice || 0;
                              currentPriceValue = weight === '250 g' ? Math.round(basePrice * 0.6) : weight === '1 kg' ? Math.round(basePrice * 1.8) : basePrice;
                              currentStockValue = newProdStock || 50;
                            }
                          } else {
                            const basePrice = newProdPrice || 0;
                            currentPriceValue = weight === '250 g' ? Math.round(basePrice * 0.6) : weight === '1 kg' ? Math.round(basePrice * 1.8) : basePrice;
                            currentStockValue = newProdStock || 50;
                          }

                          return (
                            <div key={weight} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#eeddb9] rounded-xl animate-fade-in shadow-2xs">
                              <div className="flex items-center gap-2.5 flex-grow">
                                <input
                                  type="checkbox"
                                  checked={hasWeight}
                                  onChange={(e) => {
                                    let newWeights = [...currentNewProdWeights];
                                    if (e.target.checked) {
                                      newWeights.push({ weight, price: currentPriceValue, stock: currentStockValue });
                                    } else {
                                      newWeights = newWeights.filter((w: any) => {
                                        const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                        return name !== weight;
                                      });
                                    }
                                    setNewProdWeights(newWeights);
                                  }}
                                  className="rounded border-[#d3c099] text-[#384401] focus:ring-[#384401] cursor-pointer"
                                />
                                
                                {renamingWeightAdd === weight ? (
                                  <div className="flex items-center gap-1.5 flex-grow max-w-[200px]">
                                    <input
                                      type="text"
                                      value={renameValueAdd}
                                      onChange={(e) => setRenameValueAdd(e.target.value)}
                                      className="h-8 px-2 bg-white border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401] w-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cleanRename = renameValueAdd.trim();
                                        if (!cleanRename) return;
                                        const updated = currentNewProdWeights.map((w: any) => {
                                          const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                          if (name === weight) {
                                            return typeof w === 'object' && w !== null ? { ...w, weight: cleanRename } : { weight: cleanRename, price: newProdPrice, stock: newProdStock || 50 };
                                          }
                                          return w;
                                        });
                                        setNewProdWeights(updated);
                                        setRenamingWeightAdd(null);
                                      }}
                                      className="p-1 bg-[#384401] text-white rounded-md hover:bg-[#252d00] cursor-pointer shrink-0"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRenamingWeightAdd(null)}
                                      className="p-1 border border-stone-250 text-stone-500 rounded-md hover:bg-stone-50 cursor-pointer shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-stone-750">{weight} Variant</span>
                                    {!defaultSizes.includes(weight) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRenamingWeightAdd(weight);
                                            setRenameValueAdd(weight);
                                          }}
                                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                                          title="Rename Variant"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = currentNewProdWeights.filter((w: any) => {
                                              const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                              return name !== weight;
                                            });
                                            setNewProdWeights(updated);
                                          }}
                                          className="p-1 text-red-400 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                          title="Delete Variant"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {hasWeight && (
                                <div className="flex flex-wrap items-center gap-4 shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-stone-505 font-bold">Price:</span>
                                    <div className="relative w-20">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-505">₹</span>
                                      <input
                                        type="number"
                                        value={currentPriceValue}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          const newWeights = currentNewProdWeights.map((w: any) => {
                                            const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                            if (name === weight) {
                                              return { ...w, weight, price: val };
                                            }
                                            return w;
                                          });
                                          setNewProdWeights(newWeights);
                                        }}
                                        className="w-full h-7 pl-5 pr-1 bg-stone-50 border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-stone-500 font-bold">Stock:</span>
                                    <input
                                      type="number"
                                      value={currentStockValue}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const newWeights = currentNewProdWeights.map((w: any) => {
                                          const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                          if (name === weight) {
                                            return { ...w, weight, stock: val };
                                          }
                                          return w;
                                        });
                                        setNewProdWeights(newWeights);
                                      }}
                                      className="w-16 h-7 px-1.5 bg-stone-50 border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401]"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <UploadBox
                      accept="image/*"
                      label="Product Banner Image"
                      currentValue={newProdImage}
                      isUploading={uploadingImage}
                      onClear={() => setNewProdImage('')}
                      onFileSelect={async (file) => {
                        setUploadingImage(true);
                        const url = await handleFileUpload(file, 'product-images');
                        if (url) setNewProdImage(url);
                        setUploadingImage(false);
                      }}
                    />
                    <UploadBox
                      accept="video/*"
                      label="Product Video (Optional)"
                      currentValue={newProdVideo}
                      isUploading={uploadingVideo}
                      onClear={() => setNewProdVideo('')}
                      onFileSelect={async (file) => {
                        setUploadingVideo(true);
                        const url = await handleFileUpload(file, 'product-videos');
                        if (url) setNewProdVideo(url);
                        setUploadingVideo(false);
                      }}
                    />
                  </div>
                </>
              )}

              {addActiveTab === 'description' && (
                <>
                  <UploadBox
                    accept="image/*"
                    label="Description Centre Image (shown in Description tab of product page)"
                    currentValue={newProdDescImage}
                    onClear={() => setNewProdDescImage('')}
                    onFileSelect={async (file) => {
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) setNewProdDescImage(url);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Shelf Life (e.g. 6 Months)</label>
                      <input
                        type="text"
                        value={newProdShelfLife}
                        onChange={(e) => setNewProdShelfLife(e.target.value)}
                        placeholder="e.g. 6 Months"
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Shelf Life Details</label>
                      <input
                        type="text"
                        value={newProdShelfLifeDetails}
                        onChange={(e) => setNewProdShelfLifeDetails(e.target.value)}
                        placeholder="e.g. Best before 6 months from the date of manufacturing."
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Benefits Configuration */}
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Benefits Configuration</span>
                      <button
                        type="button"
                        onClick={() => setNewProdBenefits(prev => [...prev, { title: '', description: '' }])}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Benefit
                      </button>
                    </div>
                    {newProdBenefits.length > 0 ? (
                      <div className="space-y-4">
                        {newProdBenefits.map((benefit, idx) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-bold text-amber-850 uppercase tracking-wider font-jakarta">Benefit #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setNewProdBenefits(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Title</label>
                                <input
                                  type="text"
                                  value={benefit.title}
                                  onChange={(e) => {
                                    const updated = [...newProdBenefits];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setNewProdBenefits(updated);
                                  }}
                                  placeholder="e.g. Traditional Nutrition"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Description</label>
                                <textarea
                                  rows={2}
                                  value={benefit.description}
                                  onChange={(e) => {
                                    const updated = [...newProdBenefits];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setNewProdBenefits(updated);
                                  }}
                                  placeholder="e.g. Made with ancient grains passed down through generations."
                                  className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium">No benefits added yet. Click "Add Benefit" to begin.</p>
                      </div>
                    )}
                  </div>

                  {/* Suitable For Configuration */}
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Suitable For Configuration</span>
                      <button
                        type="button"
                        onClick={() => setNewProdSuitableFor(prev => [...prev, { label: '', value: '' }])}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Target Group
                      </button>
                    </div>
                    {newProdSuitableFor && newProdSuitableFor.length > 0 ? (
                      <div className="space-y-4">
                        {newProdSuitableFor.map((target, idx) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-bold text-amber-850 uppercase tracking-wider font-jakarta">Target Group #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setNewProdSuitableFor(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Group Label (e.g. Babies)</label>
                                <input
                                  type="text"
                                  value={target.label}
                                  onChange={(e) => {
                                    const updated = [...newProdSuitableFor];
                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                    setNewProdSuitableFor(updated);
                                  }}
                                  placeholder="e.g. Babies"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Age Range (e.g. 6+ Months*)</label>
                                <input
                                  type="text"
                                  value={target.value}
                                  onChange={(e) => {
                                    const updated = [...newProdSuitableFor];
                                    updated[idx] = { ...updated[idx], value: e.target.value };
                                    setNewProdSuitableFor(updated);
                                  }}
                                  placeholder="e.g. 6+ Months*"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium">No target groups configured. Falls back to defaults.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Ingredients Infographic Setup */}
              {addActiveTab === 'ingredients' && (
                <>
                  <div className="border border-[#d3c099] rounded-xl p-4 bg-amber-50/5 space-y-3 font-jakarta">
                    <span className="text-base font-extrabold text-[#704632] block uppercase tracking-wider font-jakarta">Ingredients Infographics Image Configuration</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Desktop Ingredients Image URL / Upload</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newProdIngDesktop}
                          onChange={(e) => setNewProdIngDesktop(e.target.value)}
                          placeholder="e.g. /images/products/ingredients-image.webp"
                          className="flex-grow h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
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
                          className="text-xs w-48 file:py-2 file:px-3 file:rounded-lg file:bg-stone-100"
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
                          className="cursor-pointer rounded border-[#d3c099]"
                        />
                        <label htmlFor="newProdIngSameTab" className="text-sm font-bold text-stone-700 cursor-pointer select-none">Use same ingredients image for tablet</label>
                      </div>
                      {!newProdIngSameTab && (
                        <div className="flex flex-col gap-1.5 pl-5">
                          <label className="text-xs font-bold text-stone-505">Tablet Ingredients Image URL</label>
                          <input
                            type="text"
                            value={newProdIngTablet}
                            onChange={(e) => setNewProdIngTablet(e.target.value)}
                            placeholder="Tablet specific ingredients image URL..."
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-stone-700">Mobile Option:</label>
                        <select
                          value={newProdIngSameMobile}
                          onChange={(e: any) => setNewProdIngSameMobile(e.target.value)}
                          className="h-9 px-3 bg-white border border-[#d3c099] rounded-lg text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                        >
                          <option value="desktop">Use the same as desktop</option>
                          <option value="tablet">Use the same as tablet</option>
                          <option value="none">Use separate mobile image</option>
                        </select>
                      </div>
                      {newProdIngSameMobile === 'none' && (
                        <div className="flex flex-col gap-1.5 pl-5">
                          <label className="text-xs font-bold text-stone-500">Mobile Ingredients Image URL</label>
                          <input
                            type="text"
                            value={newProdIngMobile}
                            onChange={(e) => setNewProdIngMobile(e.target.value)}
                            placeholder="Mobile specific ingredients image URL..."
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* FAQ Section */}
              {addActiveTab === 'faqs' && (
                <>
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Product FAQ Editor</span>
                      <button
                        type="button"
                        onClick={() => setNewProdFaqs(prev => [...prev, { q: '', a: '' }])}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add FAQ Pair
                      </button>
                    </div>
                    {newProdFaqs.length > 0 ? (
                      <div className="space-y-4">
                        {newProdFaqs.map((faq, idx) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-sm font-bold text-amber-850 uppercase tracking-wider font-jakarta">FAQ Pair #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setNewProdFaqs(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Question</label>
                                <input
                                  type="text"
                                  value={faq.q}
                                  onChange={(e) => {
                                    const updated = [...newProdFaqs];
                                    updated[idx] = { ...updated[idx], q: e.target.value };
                                    setNewProdFaqs(updated);
                                  }}
                                  placeholder="e.g. Is this product gluten-free?"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Answer</label>
                                <textarea
                                  rows={2}
                                  value={faq.a}
                                  onChange={(e) => {
                                    const updated = [...newProdFaqs];
                                    updated[idx] = { ...updated[idx], a: e.target.value };
                                    setNewProdFaqs(updated);
                                  }}
                                  placeholder="e.g. Yes, it is made of natural gluten-free grains..."
                                  className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium">No FAQs added yet. Click "Add FAQ Pair" to begin.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Recipes Tab */}
              {addActiveTab === 'recipes' && (
                <>
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Product Recipes</span>
                      <button
                        type="button"
                        onClick={() => setNewProdRecipes(prev => [...prev, { title: '', prepTime: '', cookTime: '', ingredients: '', instructions: '' }])}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Recipe
                      </button>
                    </div>

                    {newProdRecipes.length > 0 ? (
                      <div className="space-y-6">
                        {newProdRecipes.map((recipe, idx) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-4 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-sm font-bold text-amber-850 uppercase tracking-wider">Recipe #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setNewProdRecipes(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="flex flex-col gap-1.5 sm:col-span-1">
                                <label className="text-xs font-bold text-stone-700">Recipe Title</label>
                                <input
                                  type="text"
                                  value={recipe.title}
                                  onChange={(e) => {
                                    const updated = [...newProdRecipes];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setNewProdRecipes(updated);
                                  }}
                                  placeholder="e.g. Delicious Porridge"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700">Prep Time</label>
                                <input
                                  type="text"
                                  value={recipe.prepTime || ''}
                                  onChange={(e) => {
                                    const updated = [...newProdRecipes];
                                    updated[idx] = { ...updated[idx], prepTime: e.target.value };
                                    setNewProdRecipes(updated);
                                  }}
                                  placeholder="e.g. 5 mins"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700">Cook Time</label>
                                <input
                                  type="text"
                                  value={recipe.cookTime || ''}
                                  onChange={(e) => {
                                    const updated = [...newProdRecipes];
                                    updated[idx] = { ...updated[idx], cookTime: e.target.value };
                                    setNewProdRecipes(updated);
                                  }}
                                  placeholder="e.g. 10 mins"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-stone-700">Ingredients (Comma separated)</label>
                              <input
                                type="text"
                                value={recipe.ingredients || ''}
                                onChange={(e) => {
                                  const updated = [...newProdRecipes];
                                  updated[idx] = { ...updated[idx], ingredients: e.target.value };
                                  setNewProdRecipes(updated);
                                }}
                                placeholder="e.g. 2 tbsp Health Mix, 1 cup milk"
                                className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-stone-700">Instructions (One step per line)</label>
                              <textarea
                                rows={4}
                                value={recipe.instructions}
                                onChange={(e) => {
                                  const updated = [...newProdRecipes];
                                  updated[idx] = { ...updated[idx], instructions: e.target.value };
                                  setNewProdRecipes(updated);
                                }}
                                placeholder="e.g. Mix mix with water.&#10;Boil for 5 mins."
                                className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium">No recipes added yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => { setShowAddProduct(false); setAddActiveTab('basic'); }} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal/Form */}
      {editingProduct && (
        <div className="fixed h-full inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleUpdateProduct} className="bg-[#FAF6EB] border border-[#eeddb9] rounded-2xl p-6 shadow-2xl max-w-4xl w-full font-jakarta text-[#3d2b1f]">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-extrabold uppercase tracking-wider text-[#704632] font-jakarta">Edit Provision Product Details</h4>
              <button
                type="button"
                onClick={() => { setEditingProduct(null); setEditActiveTab('basic'); }}
                className="text-stone-600 hover:text-stone-900 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-[#eeddb9]/50 mb-4 font-jakarta gap-2 mt-4">
              <button
                type="button"
                onClick={() => setEditActiveTab('basic')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  editActiveTab === 'basic' 
                    ? 'text-amber-805 border-b-2 border-amber-805' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Basic Details
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('description')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  editActiveTab === 'description' 
                    ? 'text-amber-805 border-b-2 border-amber-805' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('ingredients')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  editActiveTab === 'ingredients' 
                    ? 'text-amber-805 border-b-2 border-amber-805' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Ingredients
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('faqs')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  editActiveTab === 'faqs' 
                    ? 'text-amber-805 border-b-2 border-amber-805' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                FAQs
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('recipes')}
                className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
                  editActiveTab === 'recipes' 
                    ? 'text-amber-805 border-b-2 border-amber-805' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Recipes
              </button>
            </div>

            <div className="mt-2 max-h-[70vh] overflow-y-auto relative space-y-7 pr-1">

              {editActiveTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Category</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Product Name</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-jakarta focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-sm font-bold text-stone-700">Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="p-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 resize-none font-jakarta focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Ribbon Badge (Optional)</label>
                      <input
                        type="text"
                        value={editingProduct.badge || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value || undefined })}
                        placeholder="e.g. BEST SELLER"
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-jakarta focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Stock</label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-jakarta focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Edit Product Weights */}
                  <div className="flex flex-col gap-2.5 border border-[#eeddb9]/60 rounded-xl p-4 bg-stone-50/15 font-jakarta animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 border-b border-[#eeddb9]/45 pb-2.5">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider">Available Weight Variants & Custom Prices</span>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="e.g. 750 g or 2 kg"
                          value={customWeightEdit}
                          onChange={(e) => setCustomWeightEdit(e.target.value)}
                          className="h-8 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs placeholder-stone-400 focus:outline-none focus:border-[#384401] w-36 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cleanName = customWeightEdit.trim();
                            if (!cleanName) return;
                            
                            const currentWeights = (editingProduct.weights || []) as any[];
                            const exists = currentWeights.some(w => {
                              const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                              return name.toLowerCase().replace(/\s+/g, '') === cleanName.toLowerCase().replace(/\s+/g, '');
                            });
                            if (exists) {
                              alert('This variant already exists!');
                              return;
                            }
                            
                            const basePrice = editingProduct.price || 0;
                            setEditingProduct({
                              ...editingProduct,
                              weights: [...currentWeights, { weight: cleanName, price: basePrice }]
                            });
                            setCustomWeightEdit('');
                          }}
                          className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(() => {
                        const defaultSizes = ['250 g', '500 g', '1 kg'];
                        const currentWeights = (editingProduct.weights || []) as any[];
                        const existingNames = currentWeights.map((w: any) => typeof w === 'object' && w !== null && w.weight ? w.weight : w);
                        const allSizes = Array.from(new Set([...defaultSizes, ...existingNames]));
                        return allSizes.map(weight => {
                          const matchingItem = currentWeights.find((w: any) => {
                            const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                            return name === weight;
                          });
                          const hasWeight = !!matchingItem;
                          
                          let currentPriceValue = 0;
                          let currentStockValue = 0;
                          if (hasWeight) {
                            if (typeof matchingItem === 'object' && matchingItem !== null) {
                              currentPriceValue = typeof matchingItem.price === 'number' ? matchingItem.price : 0;
                              currentStockValue = typeof matchingItem.stock === 'number' ? matchingItem.stock : (editingProduct.stock || 50);
                            } else {
                              const basePrice = editingProduct.price || 0;
                              currentPriceValue = weight === '250 g' ? Math.round(basePrice * 0.6) : weight === '1 kg' ? Math.round(basePrice * 1.8) : basePrice;
                              currentStockValue = editingProduct.stock || 50;
                            }
                          } else {
                            const basePrice = editingProduct.price || 0;
                            currentPriceValue = weight === '250 g' ? Math.round(basePrice * 0.6) : weight === '1 kg' ? Math.round(basePrice * 1.8) : basePrice;
                            currentStockValue = editingProduct.stock || 50;
                          }

                          return (
                            <div key={weight} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#eeddb9] rounded-xl animate-fade-in shadow-2xs">
                              <div className="flex items-center gap-2.5 flex-grow">
                                <input
                                  type="checkbox"
                                  checked={hasWeight}
                                  onChange={(e) => {
                                    let newWeights = [...currentWeights];
                                    if (e.target.checked) {
                                      newWeights.push({ weight, price: currentPriceValue, stock: currentStockValue });
                                    } else {
                                      newWeights = newWeights.filter((w: any) => {
                                        const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                        return name !== weight;
                                      });
                                    }
                                    setEditingProduct({ ...editingProduct, weights: newWeights });
                                  }}
                                  className="rounded border-[#d3c099] text-[#384401] focus:ring-[#384401] cursor-pointer"
                                />
                                
                                {renamingWeightEdit === weight ? (
                                  <div className="flex items-center gap-1.5 flex-grow max-w-[200px]">
                                    <input
                                      type="text"
                                      value={renameValueEdit}
                                      onChange={(e) => setRenameValueEdit(e.target.value)}
                                      className="h-8 px-2 bg-white border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401] w-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cleanRename = renameValueEdit.trim();
                                        if (!cleanRename) return;
                                        const updated = currentWeights.map((w: any) => {
                                          const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                          if (name === weight) {
                                            return typeof w === 'object' && w !== null ? { ...w, weight: cleanRename } : { weight: cleanRename, price: editingProduct.price, stock: editingProduct.stock || 50 };
                                          }
                                          return w;
                                        });
                                        setEditingProduct({ ...editingProduct, weights: updated });
                                        setRenamingWeightEdit(null);
                                      }}
                                      className="p-1 bg-[#384401] text-white rounded-md hover:bg-[#252d00] cursor-pointer shrink-0"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRenamingWeightEdit(null)}
                                      className="p-1 border border-stone-250 text-stone-500 rounded-md hover:bg-stone-50 cursor-pointer shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-stone-755">{weight} Variant</span>
                                    {!defaultSizes.includes(weight) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRenamingWeightEdit(weight);
                                            setRenameValueEdit(weight);
                                          }}
                                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                                          title="Rename Variant"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = currentWeights.filter((w: any) => {
                                              const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                              return name !== weight;
                                            });
                                            setEditingProduct({ ...editingProduct, weights: updated });
                                          }}
                                          className="p-1 text-red-400 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                          title="Delete Variant"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {hasWeight && (
                                <div className="flex flex-wrap items-center gap-4 shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-stone-500 font-bold">Price:</span>
                                    <div className="relative w-20">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-505">₹</span>
                                      <input
                                        type="number"
                                        value={currentPriceValue}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          const newWeights = currentWeights.map((w: any) => {
                                            const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                            if (name === weight) {
                                              return { ...w, weight, price: val };
                                            }
                                            return w;
                                          });
                                          setEditingProduct({ ...editingProduct, weights: newWeights });
                                        }}
                                        className="w-full h-7 pl-5 pr-1 bg-stone-50 border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401]"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-stone-500 font-bold">Stock:</span>
                                    <input
                                      type="number"
                                      value={currentStockValue}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const newWeights = currentWeights.map((w: any) => {
                                          const name = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                                          if (name === weight) {
                                            return { ...w, weight, stock: val };
                                          }
                                          return w;
                                        });
                                        setEditingProduct({ ...editingProduct, weights: newWeights });
                                      }}
                                      className="w-16 h-7 px-1.5 bg-stone-50 border border-[#eeddb9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#384401]"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <UploadBox
                      accept="image/*"
                      label="Product Image"
                      currentValue={editingProduct.image}
                      isUploading={uploadingImage}
                      onClear={() => setEditingProduct({ ...editingProduct, image: '' })}
                      onFileSelect={async (file) => {
                        setUploadingImage(true);
                        const url = await handleFileUpload(file, 'product-images');
                        if (url) setEditingProduct({ ...editingProduct, image: url });
                        setUploadingImage(false);
                      }}
                    />
                    <UploadBox
                      accept="video/*"
                      label="Product Video"
                      currentValue={editingProduct.video}
                      isUploading={uploadingVideo}
                      onClear={() => setEditingProduct({ ...editingProduct, video: '' })}
                      onFileSelect={async (file) => {
                        setUploadingVideo(true);
                        const url = await handleFileUpload(file, 'product-videos');
                        if (url) setEditingProduct({ ...editingProduct, video: url });
                        setUploadingVideo(false);
                      }}
                    />
                  </div>
                </>
              )}

              {editActiveTab === 'description' && (
                <>
                  <UploadBox
                    accept="image/*"
                    label="Description Centre Image (shown in Description tab of product page)"
                    currentValue={(editingProduct as any).descriptionImage || ''}
                    onClear={() => setEditingProduct({ ...editingProduct, descriptionImage: '' } as any)}
                    onFileSelect={async (file) => {
                      const url = await handleFileUpload(file, 'product-images');
                      if (url) setEditingProduct({ ...editingProduct, descriptionImage: url } as any);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Shelf Life (e.g. 6 Months)</label>
                      <input
                        type="text"
                        value={(editingProduct as any).shelfLife || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                        placeholder="e.g. 6 Months"
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-stone-700">Shelf Life Details</label>
                      <input
                        type="text"
                        value={(editingProduct as any).shelfLifeDetails || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, shelfLifeDetails: e.target.value })}
                        placeholder="e.g. Best before 6 months from the date of manufacturing."
                        className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Benefits Configuration */}
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Benefits Configuration</span>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = editingProduct.benefits || [];
                          setEditingProduct({ ...editingProduct, benefits: [...prev, { title: '', description: '' }] } as any);
                        }}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Benefit
                      </button>
                    </div>
                    {editingProduct.benefits && editingProduct.benefits.length > 0 ? (
                      <div className="space-y-4">
                        {editingProduct.benefits.map((benefit: any, idx: number) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-bold text-amber-850 uppercase tracking-wider font-jakarta">Benefit #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editingProduct.benefits!.filter((_: any, i: number) => i !== idx);
                                  setEditingProduct({ ...editingProduct, benefits: updated });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 font-jakarta"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Title</label>
                                <input
                                  type="text"
                                  value={benefit.title || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.benefits as any[])];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setEditingProduct({ ...editingProduct, benefits: updated } as any);
                                  }}
                                  placeholder="e.g. Traditional Nutrition"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Description</label>
                                <textarea
                                  rows={2}
                                  value={benefit.description || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.benefits as any[])];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setEditingProduct({ ...editingProduct, benefits: updated } as any);
                                  }}
                                  placeholder="e.g. Made with ancient grains passed down through generations."
                                  className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all resize-none font-jakarta"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium font-jakarta">No benefits added yet. Click "Add Benefit" to begin.</p>
                      </div>
                    )}
                  </div>

                  {/* Suitable For Configuration */}
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Suitable For Configuration</span>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = (editingProduct as any).suitableFor || [];
                          setEditingProduct({ ...editingProduct, suitableFor: [...prev, { label: '', value: '' }] });
                        }}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-jakarta"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Target Group
                      </button>
                    </div>
                    {(editingProduct as any).suitableFor && (editingProduct as any).suitableFor.length > 0 ? (
                      <div className="space-y-4">
                        {(editingProduct as any).suitableFor.map((target: { label: string, value: string }, idx: number) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-bold text-amber-850 uppercase tracking-wider font-jakarta">Target Group #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProduct as any).suitableFor.filter((_: any, i: number) => i !== idx);
                                  setEditingProduct({ ...editingProduct, suitableFor: updated });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 font-jakarta"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider font-jakarta">Group Label (e.g. Babies)</label>
                                <input
                                  type="text"
                                  value={target.label}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct as any).suitableFor];
                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                    setEditingProduct({ ...editingProduct, suitableFor: updated });
                                  }}
                                  placeholder="e.g. Babies"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider font-jakarta">Age Range (e.g. 6+ Months*)</label>
                                <input
                                  type="text"
                                  value={target.value}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct as any).suitableFor];
                                    updated[idx] = { ...updated[idx], value: e.target.value };
                                    setEditingProduct({ ...editingProduct, suitableFor: updated });
                                  }}
                                  placeholder="e.g. 6+ Months*"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium font-jakarta">No target groups configured. Falls back to defaults.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Ingredients Tab */}
              {editActiveTab === 'ingredients' && (
                <>
                  <div className="border border-[#d3c099] rounded-2xl p-6 bg-amber-50/5 space-y-5 font-jakarta text-sm text-stone-900">
                    <span className="text-base font-extrabold text-[#704632] block uppercase tracking-wider font-jakarta">Ingredients Infographics Image Configuration</span>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-stone-700 font-jakarta">Desktop Ingredients Image URL / Upload</label>
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
                            className="flex-grow h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
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
                            className="text-xs w-48 file:py-2 file:px-3 file:rounded-lg file:bg-stone-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 border-t border-[#eeddb9]/30 pt-4 mt-3">
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
                          className="cursor-pointer rounded border-[#d3c099]"
                        />
                        <label htmlFor="editProdIngSameTab" className="text-xs font-bold text-stone-755 cursor-pointer select-none">Use same ingredients image for tablet</label>
                      </div>
                      {!(typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? !!((editingProduct.ingredients as any)?.useSameForTab) : true) && (
                        <div className="flex flex-col gap-1.5 pl-5">
                          <label className="text-xs font-bold text-stone-505 font-jakarta">Tablet Ingredients Image URL</label>
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
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-stone-200/50 pt-2">
                      <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-stone-750 font-jakarta">Mobile Option:</label>
                        <select
                          value={typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.useSameForMobile || 'desktop') : 'desktop'}
                          onChange={(e: any) => {
                            const prevIng = typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : {};
                            setEditingProduct({
                              ...editingProduct,
                              ingredients: { ...(prevIng as any), useSameForMobile: e.target.value }
                            });
                          }}
                          className="h-9 px-3 bg-white border border-[#d3c099] rounded-lg text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                        >
                          <option value="desktop">Use the same as desktop</option>
                          <option value="tablet">Use the same as tablet</option>
                          <option value="none">Use separate mobile image</option>
                        </select>
                      </div>
                      {(typeof editingProduct.ingredients === 'object' && !Array.isArray(editingProduct.ingredients) ? ((editingProduct.ingredients as any)?.useSameForMobile || 'desktop') : 'desktop') === 'none' && (
                        <div className="flex flex-col gap-1.5 pl-5">
                          <label className="text-xs font-bold text-stone-500 font-jakarta">Mobile Ingredients Image URL</label>
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
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* FAQs Tab */}
              {editActiveTab === 'faqs' && (
                <>
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Product FAQ Editor</span>
                      <button
                        type="button"
                        onClick={() => {
                          const prevFaqs = editingProduct.faqs || [];
                          setEditingProduct({ ...editingProduct, faqs: [{ q: '', a: '' }, ...prevFaqs] });
                        }}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-jakarta"
                      >
                        <Plus className="w-3 h-3" /> Add FAQ Pair
                      </button>
                    </div>
                    {editingProduct.faqs && editingProduct.faqs.length > 0 ? (
                      <div className="space-y-4">
                        {editingProduct.faqs.map((faq: { q: string; a: string }, idx: number) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-3 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-sm font-bold text-amber-850 uppercase tracking-wider font-jakarta">FAQ Pair #{editingProduct.faqs.length - idx}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedFaqs = editingProduct.faqs.filter((_: any, i: number) => i !== idx);
                                  setEditingProduct({ ...editingProduct, faqs: updatedFaqs });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 font-jakarta"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider font-jakarta">Question</label>
                                <input
                                  type="text"
                                  value={faq.q}
                                  onChange={(e) => {
                                    const updatedFaqs = [...editingProduct.faqs];
                                    updatedFaqs[idx] = { ...updatedFaqs[idx], q: e.target.value };
                                    setEditingProduct({ ...editingProduct, faqs: updatedFaqs });
                                  }}
                                  placeholder="e.g. Is this product gluten-free?"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider font-jakarta">Answer</label>
                                <textarea
                                  rows={2}
                                  value={faq.a}
                                  onChange={(e) => {
                                    const updatedFaqs = [...editingProduct.faqs];
                                    updatedFaqs[idx] = { ...updatedFaqs[idx], a: e.target.value };
                                    setEditingProduct({ ...editingProduct, faqs: updatedFaqs });
                                  }}
                                  placeholder="e.g. Yes, it is made of natural gluten-free grains..."
                                  className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all resize-none font-jakarta"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium font-jakarta">No FAQs added yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Recipes Tab */}
              {editActiveTab === 'recipes' && (
                <>
                  <div className="border border-[#eeddb9]/60 rounded-xl p-5 bg-[#FAF4E6]/10 space-y-5 font-jakarta shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eeddb9]/30 pb-3">
                      <span className="text-base font-extrabold text-[#384401] uppercase tracking-wider font-jakarta">Product Recipes</span>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = (editingProduct as any).recipes || [];
                          setEditingProduct({ ...editingProduct, recipes: [...prev, { title: '', prepTime: '', cookTime: '', ingredients: '', instructions: '' }] });
                        }}
                        className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-jakarta"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Recipe
                      </button>
                    </div>

                    {(editingProduct as any).recipes && (editingProduct as any).recipes.length > 0 ? (
                      <div className="space-y-6">
                        {(editingProduct as any).recipes.map((recipe: any, idx: number) => (
                          <div key={idx} className="bg-white border border-[#eeddb9]/40 rounded-xl p-4 space-y-4 relative shadow-xs">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-sm font-bold text-amber-850 uppercase tracking-wider">Recipe #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProduct as any).recipes.filter((_: any, i: number) => i !== idx);
                                  setEditingProduct({ ...editingProduct, recipes: updated });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 font-jakarta"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="flex flex-col gap-1.5 sm:col-span-1">
                                <label className="text-xs font-bold text-stone-700">Recipe Title</label>
                                <input
                                  type="text"
                                  value={recipe.title}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct as any).recipes];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setEditingProduct({ ...editingProduct, recipes: updated });
                                  }}
                                  placeholder="e.g. Delicious Porridge"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700">Prep Time</label>
                                <input
                                  type="text"
                                  value={recipe.prepTime || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct as any).recipes];
                                    updated[idx] = { ...updated[idx], prepTime: e.target.value };
                                    setEditingProduct({ ...editingProduct, recipes: updated });
                                  }}
                                  placeholder="e.g. 5 mins"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-700">Cook Time</label>
                                <input
                                  type="text"
                                  value={recipe.cookTime || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct as any).recipes];
                                    updated[idx] = { ...updated[idx], cookTime: e.target.value };
                                    setEditingProduct({ ...editingProduct, recipes: updated });
                                  }}
                                  placeholder="e.g. 10 mins"
                                  className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-stone-700">Ingredients (Comma separated)</label>
                              <input
                                type="text"
                                value={recipe.ingredients || ''}
                                onChange={(e) => {
                                  const updated = [...(editingProduct as any).recipes];
                                  updated[idx] = { ...updated[idx], ingredients: e.target.value };
                                  setEditingProduct({ ...editingProduct, recipes: updated });
                                }}
                                placeholder="e.g. 2 tbsp Health Mix, 1 cup milk"
                                className="h-10 px-3 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-stone-700">Instructions (One step per line)</label>
                              <textarea
                                rows={4}
                                value={recipe.instructions}
                                onChange={(e) => {
                                  const updated = [...(editingProduct as any).recipes];
                                  updated[idx] = { ...updated[idx], instructions: e.target.value };
                                  setEditingProduct({ ...editingProduct, recipes: updated });
                                }}
                                placeholder="e.g. Mix health mix with cold milk.&#10;Cook for 5 mins."
                                className="p-2.5 bg-stone-50 border border-[#d3c099]/60 rounded-lg text-sm text-stone-900 focus:bg-white focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all font-jakarta"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-450 border border-dashed border-[#eeddb9]/50 rounded-xl bg-stone-50/50">
                        <p className="text-xs font-medium font-jakarta">No recipes added yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => { setEditingProduct(null); setEditActiveTab('basic'); }} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer">
                Update Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List (Grid or Table View) */}
      {filteredProducts.length === 0 ? (
        <div className="border border-[#eeddb9]/50 rounded-2xl p-8 text-center text-stone-455 font-medium bg-stone-50/10">
          No products found.
        </div>
      ) : productViewMode === 'card' ? (
        <div className="space-y-8 animate-fade-in">
          {sortedCategoryNames.map((catName) => (
            <div key={catName} className="space-y-4">
              <h3 className="sticky top-[76px] bg-[#fdfbf7] z-10 text-sm font-extrabold text-[#384401] uppercase tracking-wider font-jakarta border-b border-[#eeddb9]/45 py-2">
                {catName} ({groupedProducts[catName].length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupedProducts[catName].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setShowAddProduct(false);
                      setShowAddCategory(false);
                      setEditingProduct(p);
                    }}
                    className="border border-[#d3c099] hover:border-[#384401] rounded-2xl p-4.5 bg-stone-50/20 flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex justify-end items-start gap-2">
                        {p.badge && (
                          <span className="bg-[#C56C4F]/10 text-[#C56C4F] text-sm font-extrabold px-2 py-0.5 rounded-full font-jakarta">{p.badge}</span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-stone-850 group-hover:text-[#384401] text-sm font-jakarta mt-1.5 transition-colors">{p.name}</h4>
                      <p className="text-sm text-stone-500 font-jakarta mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>
                    <div className="flex flex-col gap-3 pt-3 border-t border-stone-150">
                      {p.weights && p.weights.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-600 font-jakarta">
                          {((p.weights || []) as any[]).map((w: any, idx: number) => {
                            const wName = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                            const wPrice = typeof w === 'object' && w !== null && typeof w.price === 'number' ? w.price : (
                              wName === '250 g' ? Math.round(p.price * 0.6) : wName === '1 kg' ? Math.round(p.price * 1.8) : p.price
                            );
                            return (
                              <span key={idx} className="flex items-center gap-2 whitespace-nowrap">
                                <span>{wName}: <span className="font-bold text-stone-850">₹{wPrice}</span></span>
                                {idx < (p.weights?.length ?? 0) - 1 && <span className="text-stone-300 font-normal">|</span>}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex justify-between items-center w-full">
                        {p.weights && p.weights.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                            <span className="font-bold text-stone-700">Stock:</span>
                            {((p.weights || []) as any[]).map((w: any, idx: number) => {
                              const wName = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                              const wStock = typeof w === 'object' && w !== null && typeof w.stock === 'number' ? w.stock : p.stock;
                              return (
                                <span key={idx} className="whitespace-nowrap font-medium text-stone-650">
                                  {wName}: <span className="font-bold text-stone-850">{wStock}</span>
                                  {idx < (p.weights?.length || 0) - 1 && <span className="mx-1 text-stone-300">|</span>}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-455 font-jakarta">Stock: {p.stock} units</span>
                        )}
                        <div className="flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setShowAddProduct(false);
                              setEditingProduct(p);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-1 text-stone-600 hover:text-[#384401] text-sm font-bold cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="flex items-center gap-1 text-red-655 hover:text-red-800 text-sm font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {sortedCategoryNames.map((catName) => (
            <div key={catName} className="space-y-4">
              <h3 className="sticky top-[76px] bg-[#fdfbf7] z-10 text-sm font-extrabold text-[#384401] uppercase tracking-wider font-jakarta border-b border-[#eeddb9]/45 py-2">
                {catName} ({groupedProducts[catName].length})
              </h3>
              <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border border-[#eeddb9] border-collapse font-jakarta">
                    <thead>
                      <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                        <th className="p-3.5 pl-5 border border-[#eeddb9]">S.No</th>
                        <th className="p-3.5 border border-[#eeddb9]">Product Name</th>
                        <th className="p-3.5 border border-[#eeddb9]">Variant</th>
                        <th className="p-3.5 border border-[#eeddb9]">Price</th>
                        <th className="p-3.5 border border-[#eeddb9]">Stock</th>
                        <th className="p-3.5 pr-5 border border-[#eeddb9] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeddb9]">
                      {groupedProducts[catName].flatMap((p, pIdx) => {
                        const weightsList = (p.weights && p.weights.length > 0) ? p.weights : [{ weight: 'Default', price: p.price, stock: p.stock }];
                        const rowSpan = weightsList.length;

                        return weightsList.map((w: any, wIdx: number) => {
                          const wName = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
                          const wPrice = typeof w === 'object' && w !== null && typeof w.price === 'number' ? w.price : (
                            wName === '250 g' ? Math.round(p.price * 0.6) : wName === '1 kg' ? Math.round(p.price * 1.8) : p.price
                          );
                          const wStock = typeof w === 'object' && w !== null && typeof w.stock === 'number' ? w.stock : p.stock;

                          return (
                            <tr
                              key={`${p.id}-${wName}`}
                              onClick={() => {
                                setShowAddProduct(false);
                                setShowAddCategory(false);
                                setEditingProduct(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="hover:bg-stone-50/60 font-semibold cursor-pointer transition-colors"
                            >
                              {wIdx === 0 && (
                                <>
                                  <td rowSpan={rowSpan} className="p-3.5 pl-5 text-stone-900 border border-[#eeddb9] align-middle">{pIdx + 1}</td>
                                  <td rowSpan={rowSpan} className="p-3.5 text-[#384401] font-bold border border-[#eeddb9] align-middle">{p.name}</td>
                                </>
                              )}
                              
                              <td className="p-3.5 text-stone-700 border border-[#eeddb9]">{wName}</td>
                              <td className="p-3.5 text-stone-900 border border-[#eeddb9] font-bold">₹{wPrice}</td>
                              <td className="p-3.5 border border-[#eeddb9]">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${wStock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>
                                  {wStock} units
                                </span>
                              </td>

                              {wIdx === 0 && (
                                <td rowSpan={rowSpan} className="p-3.5 pr-5 border border-[#eeddb9] text-right align-middle" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-3.5">
                                    <button
                                      onClick={() => {
                                        setShowAddProduct(false);
                                        setEditingProduct(p);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="text-stone-600 hover:text-[#384401] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
