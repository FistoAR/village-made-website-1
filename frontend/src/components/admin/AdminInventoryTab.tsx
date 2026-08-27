import { useState, useMemo } from 'react';
import { FileSpreadsheet, Plus, Trash2, X, Barcode, Hash, Coins, History, ShieldAlert, PackageCheck, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { ExtendedProduct, PurchaseRecord } from './types';

interface BatchItemInput {
  category: string;
  productId: string;
  weight: string;
  quantity: number;
}

interface AdminInventoryTabProps {
  lowStockProducts: ExtendedProduct[];
  localProducts: ExtendedProduct[];
  purchaseHistory: PurchaseRecord[];
  handlePurchaseSubmit: (
    batchNumber: string,
    items: { productId: string; weight: string | null; quantity: number }[]
  ) => Promise<boolean>;
}

export default function AdminInventoryTab({
  lowStockProducts,
  localProducts,
  purchaseHistory,
  handlePurchaseSubmit,
}: AdminInventoryTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [batchItems, setBatchItems] = useState<BatchItemInput[]>([
    { category: '', productId: '', weight: '', quantity: 1 }
  ]);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state variables
  const [stockSearch, setStockSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedStockCategoryFilter, setSelectedStockCategoryFilter] = useState('All');
  const [historySearch, setHistorySearch] = useState('');

  // Stock Adjustment Modal states
  const [subTab, setSubTab] = useState<'stock' | 'history'>('stock');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjCategory, setAdjCategory] = useState('');
  const [adjProductId, setAdjProductId] = useState('');
  const [adjWeight, setAdjWeight] = useState('');
  const [adjQuantity, setAdjQuantity] = useState(1);
  const [adjType, setAdjType] = useState('Deduct'); // 'Add' or 'Deduct'
  const [adjReason, setAdjReason] = useState('Physical Count Correction'); // Reasons: 'Physical Count Correction', 'Damaged Stock', 'Expired Stock', 'Stock Inflow'
  const [adjError, setAdjError] = useState('');
  const [isAdjSubmitting, setIsAdjSubmitting] = useState(false);

  // Retrieve unique categories from products list
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    localProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [localProducts]);

  // Filter products by selected category
  const getProductsByCategory = (category: string) => {
    if (!category) return [];
    return localProducts.filter(p => p.category === category);
  };

  // Helper to retrieve variants of a product
  const getProductWeights = (productId: string) => {
    const prod = localProducts.find(p => p.id === productId);
    if (!prod) return [];
    if (Array.isArray(prod.weights)) {
      return prod.weights.map((w: any) => typeof w === 'object' && w !== null ? w.weight : w);
    }
    return [];
  };

  // Add a new product row to the batch list
  const addBatchRow = () => {
    setBatchItems(prev => [
      ...prev,
      { category: '', productId: '', weight: '', quantity: 1 }
    ]);
  };

  // Remove a product row from the batch list
  const removeBatchRow = (index: number) => {
    if (batchItems.length <= 1) return;
    setBatchItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handle category dropdown changes
  const handleCategoryChange = (index: number, category: string) => {
    setBatchItems(prev => prev.map((item, idx) => 
      idx === index 
        ? { ...item, category, productId: '', weight: '', quantity: 1 }
        : item
    ));
  };

  // Handle product dropdown changes to prefill variant weight
  const handleProductChange = (index: number, prodId: string) => {
    const weights = getProductWeights(prodId);
    const defaultWeight = weights.length > 0 ? weights[0] : 'Default';

    setBatchItems(prev => prev.map((item, idx) => 
      idx === index 
        ? { ...item, productId: prodId, weight: defaultWeight }
        : item
    ));
  };

  // Compute batch quantity dynamically
  const batchStats = useMemo(() => {
    let totalQty = 0;
    batchItems.forEach(item => {
      totalQty += Number(item.quantity) || 0;
    });
    return { totalQty };
  }, [batchItems]);

  // Flatten products and variants to list individual stock levels in table
  const variantStockRows = useMemo(() => {
    const rows: { id: string; name: string; category: string; weight: string; stock: number }[] = [];
    localProducts.forEach(p => {
      if (Array.isArray(p.weights) && p.weights.length > 0) {
        p.weights.forEach((w: any) => {
          const wName = typeof w === 'object' && w !== null ? w.weight : w;
          const wStock = typeof w === 'object' && w !== null && typeof w.stock === 'number' ? w.stock : p.stock;
          rows.push({
            id: p.id,
            name: p.name,
            category: p.category,
            weight: wName,
            stock: wStock
          });
        });
      } else {
        rows.push({
          id: p.id,
          name: p.name,
          category: p.category,
          weight: 'Default',
          stock: p.stock
        });
      }
    });
    return rows;
  }, [localProducts]);

  // Filtered variant stock rows
  const filteredVariantStockRows = useMemo(() => {
    return variantStockRows.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
        row.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
        row.weight.toLowerCase().includes(stockSearch.toLowerCase());
      const matchesCategory = selectedStockCategoryFilter === 'All' || row.category === selectedStockCategoryFilter;
      const matchesLow = !showLowStockOnly || row.stock < 10;
      return matchesSearch && matchesCategory && matchesLow;
    });
  }, [variantStockRows, stockSearch, selectedStockCategoryFilter, showLowStockOnly]);

  // Group by product rows for table display
  const productStockRows = useMemo(() => {
    const map = new Map<string, { id: string; name: string; category: string; variants: { weight: string; stock: number }[] }>();
    variantStockRows.forEach(row => {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          name: row.name,
          category: row.category,
          variants: []
        });
      }
      map.get(row.id)!.variants.push({ weight: row.weight, stock: row.stock });
    });
    return Array.from(map.values());
  }, [variantStockRows]);

  // Filtered product stock rows
  const filteredProductStockRows = useMemo(() => {
    return productStockRows.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                            row.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
                            row.variants.some(v => v.weight.toLowerCase().includes(stockSearch.toLowerCase()));
      const matchesCategory = selectedStockCategoryFilter === 'All' || row.category === selectedStockCategoryFilter;
      const matchesLowStock = !showLowStockOnly || row.variants.some(v => v.stock < 10);
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [productStockRows, stockSearch, selectedStockCategoryFilter, showLowStockOnly]);

  // Filtered purchase/adjustment logs history
  const filteredPurchaseHistory = useMemo(() => {
    if (!purchaseHistory) return [];
    return purchaseHistory.filter(ph => {
      const s = historySearch.toLowerCase();
      const matchesName = ph.productName.toLowerCase().includes(s);
      const matchesBatch = (ph.batchNumber || '').toLowerCase().includes(s);
      const matchesId = ph.id.toLowerCase().includes(s);
      return matchesName || matchesBatch || matchesId;
    });
  }, [purchaseHistory, historySearch]);

  // Compute total active stock units currently in store
  const totalStockUnits = useMemo(() => {
    return variantStockRows.reduce((sum, row) => sum + row.stock, 0);
  }, [variantStockRows]);

  // CSV Export utility
  const exportToCSV = (data: any[], headers: string[], keys: string[], filename: string) => {
    const csvRows = [];
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

    for (const row of data) {
      const values = keys.map(key => {
        const val = row[key] !== undefined && row[key] !== null ? row[key] : '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStock = () => {
    const dataToExport = filteredProductStockRows.map(row => ({
      name: row.name,
      category: row.category,
      stock: row.variants.map(v => `${v.weight}: ${v.stock} Units`).join(' | ')
    }));
    exportToCSV(dataToExport, ['Product Name', 'Category', 'Stock Level (by Variant)'], ['name', 'category', 'stock'], 'village_made_stock_levels.csv');
  };

  const handleExportHistory = () => {
    const dataToExport = filteredPurchaseHistory.map(ph => ({
      id: ph.id,
      name: `${ph.productName} (${ph.weight || 'Default'})`,
      batch: ph.batchNumber || 'N/A',
      qty: ph.quantity >= 0 ? `+${ph.quantity}` : `${ph.quantity}`,
      date: ph.date
    }));
    exportToCSV(dataToExport, ['Entry ID', 'Product & Variant', 'Batch/Adjustment Code', 'Qty Added/Deducted', 'Date'], ['id', 'name', 'batch', 'qty', 'date'], 'village_made_inventory_history.csv');
  };

  // Handle form submission for batch additions
  const onSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!batchNumber.trim()) {
      setModalError('Batch number/code is required.');
      return;
    }

    const formattedItems = [];
    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (!item.category) {
        setModalError(`Please select a category for Item #${i + 1}.`);
        return;
      }
      if (!item.productId) {
        setModalError(`Please select a product for Item #${i + 1}.`);
        return;
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        setModalError(`Please enter a valid stock quantity for Item #${i + 1}.`);
        return;
      }
      formattedItems.push({
        productId: item.productId,
        weight: item.weight === 'Default' ? null : item.weight,
        quantity: qty
      });
    }

    try {
      setIsSubmitting(true);
      const success = await handlePurchaseSubmit(batchNumber, formattedItems);
      if (success) {
        // Reset states and close modal
        setBatchNumber('');
        setBatchItems([{ category: '', productId: '', weight: '', quantity: 1 }]);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setModalError(err.message || 'Error processing batch upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual adjustment submission (support deductions and additions with reasons)
  const onSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError('');

    if (!adjCategory) {
      setAdjError('Please select a category.');
      return;
    }
    if (!adjProductId) {
      setAdjError('Please select a product.');
      return;
    }
    if (!adjQuantity || adjQuantity <= 0) {
      setAdjError('Please enter a valid quantity.');
      return;
    }

    const finalQty = adjType === 'Deduct' ? -adjQuantity : adjQuantity;
    const dateStr = new Date().toISOString().slice(0, 10);
    const reasonSlug = adjReason.toUpperCase().replace(/\s+/g, '-');
    const adjustmentCode = `ADJ-${reasonSlug}-${dateStr}`;

    try {
      setIsAdjSubmitting(true);
      const success = await handlePurchaseSubmit(adjustmentCode, [
        {
          productId: adjProductId,
          weight: adjWeight === 'Default' ? null : adjWeight,
          quantity: finalQty
        }
      ]);
      if (success) {
        // Reset states and close modal
        setIsAdjustmentModalOpen(false);
        setAdjCategory('');
        setAdjProductId('');
        setAdjWeight('');
        setAdjQuantity(1);
        setAdjType('Deduct');
        setAdjReason('Physical Count Correction');
      }
    } catch (err: any) {
      setAdjError(err.message || 'Error processing adjustment.');
    } finally {
      setIsAdjSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-jakarta">
      {/* Top Reports Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="border border-[#d3c099] rounded-xl p-4 bg-[#FAF4EE]/25 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Total Stock Units</span>
            <span className="text-xl font-black text-[#384401]">{totalStockUnits.toLocaleString('en-IN')} Units</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Aggregated store inventory count</span>
          </div>
          <Coins className="w-8 h-8 text-[#C56C4F]/60" />
        </div>
        <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Low Stock Alerts</span>
            <span className="text-xl font-black text-amber-800">{lowStockProducts.length} Items</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Needs immediate purchase entries</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-amber-600/50" />
        </div>
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Total Active SKUs</span>
            <span className="text-xl font-black text-emerald-800">{variantStockRows.length} SKUs</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy variety representation</span>
          </div>
          <PackageCheck className="w-8 h-8 text-emerald-600/50" />
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[#eeddb9]/50 font-jakarta gap-2 select-none">
        <button
          onClick={() => setSubTab('stock')}
          className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
            subTab === 'stock'
              ? 'text-[#384401] border-b-2 border-[#384401]'
              : 'text-stone-600 hover:text-[#384401]'
          }`}
        >
          Stock Level Updates
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-extrabold transition-all relative cursor-pointer ${
            subTab === 'history'
              ? 'text-[#384401] border-b-2 border-[#384401]'
              : 'text-stone-600 hover:text-[#384401]'
          }`}
        >
          Purchase & Adjustment History
        </button>
      </div>

      {subTab === 'stock' ? (
        /* Stock Levels Section Header with Action Buttons */
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeddb9] pb-4">
            <h3 className="text-base font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
              <Barcode className="w-5 h-5 text-[#C56C4F]" />
              Stock Level Updates (by Variant)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="border border-[#384401] hover:bg-stone-50 text-[#384401] text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <RefreshCw className="w-4.5 h-4.5" />
                Adjust Stock
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#384401] hover:bg-[#252d00] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4.5 h-4.5" />
                Receive New Batch
              </button>
            </div>
          </div>

          {/* Search, Filter, and Export Controls for Stock Levels */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/60 p-4 border border-[#eeddb9] rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 flex-grow max-w-3xl">
              {/* Search Input */}
              <div className="relative flex-grow max-w-sm">
                <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search product or variant..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="h-10 pl-9 pr-4 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none w-full"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedStockCategoryFilter}
                onChange={(e) => setSelectedStockCategoryFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold min-w-[150px]"
              >
                <option value="All">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Low Stock Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded border-[#d3c099] text-[#384401] focus:ring-[#384401] w-4.5 h-4.5"
                />
                Show Low Stock Only (&lt; 10 Units)
              </label>
            </div>

            <button
              onClick={handleExportStock}
              className="border border-[#d3c099] hover:bg-white text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-750" />
              Export CSV
            </button>
          </div>

          {/* Table: Stock Level Updates */}
          <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto overflow-y-auto max-h-[460px]">
              <table className="w-full min-w-[340px] text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-[#d3c099] text-[#3E2C1C] font-extrabold uppercase tracking-wider sticky top-0 backdrop-blur-md">
                    <th className="p-4 pl-5 border-r border-b border-[#d3c099] w-16 text-center bg-[#FAF4EE] rounded-tl-[15px]">S.No</th>
                    <th className="p-4 pl-5 border-r border-b border-[#d3c099] w-48 bg-[#FAF4EE]">Category</th>
                    <th className="p-4 pl-5 border-r border-b border-[#d3c099] bg-[#FAF4EE]">Product Name</th>
                    <th className="p-4 border-r border-b border-[#d3c099] w-32 bg-[#FAF4EE]">Variant</th>
                    <th className="p-4 text-center border-b border-[#d3c099] w-40 bg-[#FAF4EE] rounded-tr-[15px]">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c099]">
                  {filteredProductStockRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400 font-bold">
                        No matching products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProductStockRows.flatMap((row, pIdx) => {
                      const rowSpan = row.variants.length;
                      return row.variants.map((v, vIdx) => {
                        const isLow = v.stock < 10;
                        return (
                          <tr key={`${row.id}-${v.weight}`} className="font-semibold hover:bg-stone-50/30 transition-colors">
                            {vIdx === 0 && (
                              <>
                                <td rowSpan={rowSpan} className="p-4 pl-5 border-r border-b border-[#d3c099] text-center text-stone-500 font-bold w-16 align-middle">
                                  {pIdx + 1}
                                </td>
                                <td rowSpan={rowSpan} className="p-4 pl-5 border-r border-b border-[#d3c099] text-stone-600 font-bold uppercase tracking-wider text-xs align-middle">
                                  {row.category}
                                </td>
                                <td rowSpan={rowSpan} className="p-4 pl-5 border-r border-b border-[#d3c099] text-stone-900 font-extrabold text-sm align-middle">
                                  {row.name}
                                </td>
                              </>
                            )}
                            <td className="p-4 border-r border-b border-[#d3c099] text-stone-705 font-bold text-xs">
                              {v.weight === 'Default' ? 'Default' : v.weight}
                            </td>
                            <td className="p-4 border-b border-[#d3c099] text-center">
                              <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold inline-block ${
                                isLow ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {v.stock} Units
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Purchase logs */
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeddb9] pb-4">
            <h3 className="text-base font-black uppercase tracking-wider text-stone-955 flex items-center gap-2">
              <History className="w-5 h-5 text-[#C56C4F]" />
              Purchase & Adjustment History
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="h-10 pl-9 pr-4 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none min-w-[200px]"
                />
              </div>
              {/* Export button */}
              <button
                onClick={handleExportHistory}
                className="border border-[#d3c099] hover:bg-white text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-750" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-white shadow-2xs overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-[#d3c099] text-[#3E2C1C] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-5 border-r border-b border-[#d3c099] w-16 text-center bg-[#FAF4EE] rounded-tl-[15px]">S.No</th>
                  <th className="p-4 border-r border-b border-[#d3c099] w-36 bg-[#FAF4EE]">Date</th>
                  <th className="p-4 pl-5 border-r border-b border-[#d3c099] w-32 bg-[#FAF4EE]">Entry ID</th>
                  <th className="p-4 border-r border-b border-[#d3c099] bg-[#FAF4EE]">Product & Variant</th>
                  <th className="p-4 border-r border-b border-[#d3c099] w-48 bg-[#FAF4EE]">Batch / Adjustment Code</th>
                  <th className="p-4 text-center border-r border-b border-[#d3c099] w-32 bg-[#FAF4EE]">Qty Delta</th>
                  <th className="p-4 pl-5 border-b border-[#d3c099] bg-[#FAF4EE] rounded-tr-[15px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3c099]">
                {filteredPurchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400 font-bold">
                      No history logs matching filter recorded in database.
                    </td>
                  </tr>
                ) : (
                  filteredPurchaseHistory.map((ph, idx) => {
                    const isDeduction = ph.quantity < 0;
                    return (
                      <tr key={`${ph.id}-${idx}`} className="font-semibold text-stone-850 hover:bg-stone-50/40 transition-colors">
                        <td className="p-4 pl-5 border-r border-[#d3c099] text-center text-stone-500 font-bold w-16">
                          {idx + 1}
                        </td>
                        <td className="p-4 border-r border-[#d3c099] text-xs font-bold text-stone-600">
                          {ph.date}
                        </td>
                        <td className="p-4 pl-5 font-extrabold text-[#384401] border-r border-[#d3c099]">{ph.id}</td>
                        <td className="p-4 text-stone-900 border-r border-[#d3c099]">
                          <span className="font-extrabold block text-sm">{ph.productName}</span>
                          <span className="text-[10px] bg-[#FAF4EE] text-[#C56C4F] px-2 py-0.5 rounded-md font-bold mt-1 inline-block">{ph.weight || 'Default'}</span>
                        </td>
                        <td className="p-4 border-r border-[#d3c099] font-mono text-stone-700 font-bold text-xs">
                          {ph.batchNumber || 'N/A'}
                        </td>
                        <td className={`p-4 text-center font-extrabold border-r border-[#d3c099] ${isDeduction ? 'text-red-700' : 'text-emerald-800'}`}>
                          {ph.quantity > 0 ? `+${ph.quantity}` : ph.quantity}
                        </td>
                        <td className="p-4 pl-5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isDeduction ? 'text-red-800 bg-red-50' : 'text-emerald-800 bg-emerald-50'}`}>
                            {isDeduction ? 'Adjusted & Deducted' : 'Received & Synced'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popup Modal: Receive New Inventory Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#d3c099] w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eeddb9] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
                  <FileSpreadsheet className="w-5.5 h-5.5 text-[#C56C4F]" />
                  Receive New Batch
                </h3>
                <p className="text-xs text-stone-500 mt-1">Select category, product, and variant, then enter the stock quantity to add.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {modalError && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 text-sm text-red-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-red-650 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={onSubmitBatch} className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Batch Code Field */}
              <div className="flex flex-col gap-2 max-w-sm">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-stone-450" />
                  Batch Number / Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BATCH-2026-08"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                  className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none"
                />
              </div>

              {/* Items Card List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 border-b border-stone-200 pb-1.5 flex items-center justify-between">
                  <span>Batch Product Items ({batchItems.length})</span>
                </h4>
                
                {batchItems.map((item, idx) => {
                  const filteredProducts = getProductsByCategory(item.category);
                  const weightsList = getProductWeights(item.productId);
                  return (
                    <div key={idx} className="bg-white border border-[#eeddb9] rounded-2xl p-5 space-y-4 relative shadow-xs">
                      
                      {/* Item Row Header */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <span className="text-xs font-black text-[#C56C4F] uppercase tracking-wider">Item #{idx + 1}</span>
                        {batchItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBatchRow(idx)}
                            className="text-stone-400 hover:text-red-755 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Dropdown Selections */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Category Dropdown */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Category</label>
                          <select
                            required
                            value={item.category}
                            onChange={(e) => handleCategoryChange(idx, e.target.value)}
                            className="h-11 px-3 bg-[#FAF8F5] border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                          >
                            <option value="">Select Category...</option>
                            {categoriesList.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Product Dropdown (Filtered by selected Category) */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Product</label>
                          <select
                            required
                            disabled={!item.category}
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="h-11 px-3 bg-[#FAF8F5] border border-[#d3c099] rounded-xl text-sm text-stone-900 disabled:bg-stone-50 disabled:text-stone-450 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                          >
                            <option value="">Select Product...</option>
                            {filteredProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Variant Dropdown */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Variant</label>
                          <select
                            required
                            disabled={!item.productId || weightsList.length === 0}
                            value={item.weight}
                            onChange={(e) => setBatchItems(prev => prev.map((it, i) => i === idx ? { ...it, weight: e.target.value } : it))}
                            className="h-11 px-3 bg-[#FAF8F5] border border-[#d3c099] rounded-xl text-sm text-stone-900 disabled:bg-stone-50 disabled:text-stone-455 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                          >
                            {!item.productId ? (
                              <option value="">Select product first</option>
                            ) : weightsList.length === 0 ? (
                              <option value="Default">Default</option>
                            ) : (
                              weightsList.map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Stock Value Entry Input */}
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Stock Value to Add</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 10"
                          value={item.quantity || ''}
                          onChange={(e) => setBatchItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: parseInt(e.target.value) || 0 } : it))}
                          className="h-11 px-4 bg-[#FAF8F5] border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none"
                        />
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Add row action button */}
              <button
                type="button"
                onClick={addBatchRow}
                className="w-full py-3 border border-dashed border-[#d3c099] rounded-2xl flex items-center justify-center gap-2 text-[#384401] hover:bg-stone-50 text-sm font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5 text-[#C56C4F]" />
                Add Another Product to Batch
              </button>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#eeddb9] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              {/* Batch Totals Summary */}
              <div className="flex items-center gap-6 text-sm font-bold text-stone-700">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Quantity to Add</span>
                  <span className="text-stone-900 font-extrabold text-base">{batchStats.totalQty} Units</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmitBatch}
                  disabled={batchStats.totalQty === 0 || isSubmitting}
                  className="h-11 px-6 bg-[#384401] hover:bg-[#252d00] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      Receiving Batch...
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-5 h-5" />
                      Receive Batch & Update Stock
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Popup Modal: Manual Stock Adjustment */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#d3c099] w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eeddb9] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
                  <RefreshCw className="w-5.5 h-5.5 text-[#C56C4F]" />
                  Adjust Stock / Correction
                </h3>
                <p className="text-xs text-stone-500 mt-1">Deduct damaged/expired inventory, or update counts manually.</p>
              </div>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {adjError && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 text-sm text-red-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-red-650 shrink-0" />
                <span>{adjError}</span>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={onSubmitAdjustment} className="flex-grow overflow-y-auto p-6 space-y-5">
              
              {/* Adjustment Type Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjType('Deduct')}
                    className={`h-11 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      adjType === 'Deduct'
                        ? 'border-red-600 bg-red-50 text-red-800 ring-1 ring-red-600'
                        : 'border-[#d3c099] bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Deduct Stock (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('Add')}
                    className={`h-11 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      adjType === 'Add'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                        : 'border-[#d3c099] bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Add Stock (+)
                  </button>
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Category</label>
                <select
                  required
                  value={adjCategory}
                  onChange={(e) => {
                    setAdjCategory(e.target.value);
                    setAdjProductId('');
                    setAdjWeight('');
                  }}
                  className="h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                >
                  <option value="">Select Category...</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Product</label>
                <select
                  required
                  disabled={!adjCategory}
                  value={adjProductId}
                  onChange={(e) => {
                    const prodId = e.target.value;
                    setAdjProductId(prodId);
                    const weights = getProductWeights(prodId);
                    const defaultWeight = weights.length > 0 ? weights[0] : 'Default';
                    setAdjWeight(defaultWeight);
                  }}
                  className="h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 disabled:bg-stone-50 disabled:text-stone-450 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                >
                  <option value="">Select Product...</option>
                  {getProductsByCategory(adjCategory).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Variant Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Variant</label>
                  <select
                    required
                    disabled={!adjProductId}
                    value={adjWeight}
                    onChange={(e) => setAdjWeight(e.target.value)}
                    className="h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 disabled:bg-stone-50 disabled:text-stone-455 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                  >
                    {!adjProductId ? (
                      <option value="">Select product</option>
                    ) : getProductWeights(adjProductId).length === 0 ? (
                      <option value="Default">Default</option>
                    ) : (
                      getProductWeights(adjProductId).map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Quantity input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjQuantity}
                    onChange={(e) => setAdjQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none"
                  />
                </div>
              </div>

              {/* Adjustment Reason */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Reason for Adjustment</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="h-11 px-3 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:ring-1 focus:ring-[#384401] focus:border-[#384401] outline-none font-bold"
                >
                  <option value="Physical Count Correction">Physical Count Correction</option>
                  <option value="Damaged Stock">Damaged Stock</option>
                  <option value="Expired Stock">Expired Stock</option>
                  <option value="Stock Inflow">Stock Inflow</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#eeddb9] bg-white flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="h-11 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitAdjustment}
                disabled={isAdjSubmitting}
                className={`h-11 px-6 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjType === 'Deduct' ? 'bg-red-650 hover:bg-red-750' : 'bg-emerald-650 hover:bg-emerald-750'
                }`}
              >
                {isAdjSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Applying Adjustment...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin-once" />
                    Apply {adjType}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
