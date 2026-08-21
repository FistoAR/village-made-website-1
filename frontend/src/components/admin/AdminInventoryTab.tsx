import { useState, useMemo } from 'react';
import { FileSpreadsheet, Plus, Trash2, X, Barcode, Hash, Coins, History, ShieldAlert, PackageCheck, AlertCircle } from 'lucide-react';
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

  // Compute total active stock units currently in store
  const totalStockUnits = useMemo(() => {
    return variantStockRows.reduce((sum, row) => sum + row.stock, 0);
  }, [variantStockRows]);

  // Handle form submission
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

  return (
    <div className="space-y-8 animate-fade-in font-jakarta">
      {/* Top Reports Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="border border-[#d3c099] rounded-2xl p-6 bg-[#FAF4EE]/25 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Total Stock Units</span>
            <span className="text-3xl font-black text-[#384401]">{totalStockUnits.toLocaleString('en-IN')} Units</span>
            <span className="text-xs text-stone-400 block mt-1">Aggregated store inventory count</span>
          </div>
          <Coins className="w-10 h-10 text-[#C56C4F]/60" />
        </div>
        <div className="border border-amber-200 rounded-2xl p-6 bg-amber-50/5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1.5">Low Stock Alerts</span>
            <span className="text-3xl font-black text-amber-800">{lowStockProducts.length} Items</span>
            <span className="text-xs text-amber-600 block mt-1">Needs immediate purchase entries</span>
          </div>
          <ShieldAlert className="w-10 h-10 text-amber-600/50" />
        </div>
        <div className="border border-emerald-200 rounded-2xl p-6 bg-emerald-50/5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1.5">Total Active SKUs</span>
            <span className="text-3xl font-black text-emerald-800">{variantStockRows.length} SKUs</span>
            <span className="text-xs text-emerald-600 block mt-1">Healthy variety representation</span>
          </div>
          <PackageCheck className="w-10 h-10 text-emerald-600/50" />
        </div>
      </div>

      {/* Stock Levels Section Header with Action Button */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeddb9] pb-4">
          <h3 className="text-base font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
            <Barcode className="w-5 h-5 text-[#C56C4F]" />
            Stock Level Updates (by Variant)
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#384401] hover:bg-[#252d00] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4.5 h-4.5" />
            Receive New Batch
          </button>
        </div>

        {/* Table: Stock Level Updates */}
        <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto overflow-y-auto max-h-[460px]">
            <table className="w-full min-w-[340px] text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-[#d3c099] text-stone-500 font-extrabold uppercase tracking-wider sticky top-0 backdrop-blur-md">
                  <th className="p-4 pl-5 border-r border-[#d3c099]">Product & Variant</th>
                  <th className="p-4 border-r border-[#d3c099] w-56">Category</th>
                  <th className="p-4 text-center w-40">Stock Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3c099]">
                {variantStockRows.map((row, index) => {
                  const isLow = row.stock < 10;
                  return (
                    <tr key={`${row.id}-${row.weight}-${index}`} className={`font-semibold hover:bg-stone-50/30 transition-colors ${isLow ? 'bg-amber-50/10' : ''}`}>
                      <td className="p-4 pl-5 border-r border-[#d3c099]">
                        <span className="text-sm font-extrabold text-stone-900 block">{row.name}</span>
                        <span className="text-[10px] bg-[#FAF4EE] text-[#C56C4F] px-2 py-0.5 rounded-md font-black border border-[#d3c099]/30 mt-1.5 inline-block">{row.weight}</span>
                      </td>
                      <td className="p-4 border-r border-[#d3c099] text-stone-600 font-bold uppercase tracking-wider text-xs">
                        {row.category}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold inline-block ${
                          isLow ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {row.stock} Units
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purchase logs */}
      <div className="space-y-4">
        <h3 className="text-base font-black uppercase tracking-wider text-stone-955 flex items-center gap-2">
          <History className="w-5 h-5 text-[#C56C4F]" />
          Purchase Logs History
        </h3>
        <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-white shadow-2xs overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-500 font-bold uppercase tracking-wider">
                <th className="p-4 pl-5 border-r border-[#d3c099] w-32">Entry ID</th>
                <th className="p-4 border-r border-[#d3c099]">Product & Variant</th>
                <th className="p-4 border-r border-[#d3c099] w-40">Batch Code</th>
                <th className="p-4 text-center border-r border-[#d3c099] w-28">Qty Added</th>
                <th className="p-4 pl-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {purchaseHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 font-bold">
                    No purchase logs recorded in database.
                  </td>
                </tr>
              ) : (
                purchaseHistory.map((ph, idx) => (
                  <tr key={`${ph.id}-${idx}`} className="font-semibold text-stone-850 hover:bg-stone-50/40 transition-colors">
                    <td className="p-4 pl-5 font-extrabold text-[#384401] border-r border-[#d3c099]">{ph.id}</td>
                    <td className="p-4 text-stone-900 border-r border-[#d3c099]">
                      <span className="font-extrabold block text-sm">{ph.productName}</span>
                      <span className="text-[10px] bg-[#FAF4EE] text-[#C56C4F] px-2 py-0.5 rounded-md font-bold mt-1 inline-block">{ph.weight || 'Default'}</span>
                    </td>
                    <td className="p-4 border-r border-[#d3c099] font-mono text-stone-700 font-bold text-xs">
                      {ph.batchNumber || 'N/A'}
                    </td>
                    <td className="p-4 text-center font-extrabold text-stone-900 border-r border-[#d3c099]">+{ph.quantity}</td>
                    <td className="p-4 pl-5">
                      <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full font-bold">Received & Synced</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
}
