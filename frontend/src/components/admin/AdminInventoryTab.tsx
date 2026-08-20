import { FileSpreadsheet, Sparkles } from 'lucide-react';
import { ExtendedProduct, PurchaseRecord } from './types';

interface AdminInventoryTabProps {
  totalInventoryVal: number;
  lowStockProducts: ExtendedProduct[];
  localProducts: ExtendedProduct[];
  setLocalProducts: React.Dispatch<React.SetStateAction<ExtendedProduct[]>>;
  purchaseProdId: string;
  setPurchaseProdId: (val: string) => void;
  purchaseQty: number;
  setPurchaseQty: (val: number) => void;
  purchaseCost: number;
  setPurchaseCost: (val: number) => void;
  purchaseHistory: PurchaseRecord[];
  handlePurchaseSubmit: (e: React.FormEvent) => void;
}

export default function AdminInventoryTab({
  totalInventoryVal,
  lowStockProducts,
  localProducts,
  setLocalProducts,
  purchaseProdId,
  setPurchaseProdId,
  purchaseQty,
  setPurchaseQty,
  purchaseCost,
  setPurchaseCost,
  purchaseHistory,
  handlePurchaseSubmit,
}: AdminInventoryTabProps) {
  const comingSoon = false; // Set to false to enable inventory tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Inventory and stock tracking tools are currently under construction and will be active shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Reports Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="border border-[#d3c099] rounded-2xl p-5 bg-stone-50/25 font-jakarta">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Total Stock Value (Cost)</span>
          <span className="text-xl font-extrabold text-stone-955">₹{totalInventoryVal.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-stone-400 block mt-0.5">Aggregated purchase valuation</span>
        </div>
        <div className="border border-amber-100 rounded-2xl p-5 bg-amber-50/5 font-jakarta">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Low Stock Alerts</span>
          <span className="text-xl font-extrabold text-amber-800">{lowStockProducts.length} Items</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Needs immediate purchase entries</span>
        </div>
        <div className="border border-emerald-100 rounded-2xl p-5 bg-emerald-50/5 font-jakarta">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Available Varieties</span>
          <span className="text-xl font-extrabold text-emerald-800">{localProducts.length} Skus</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy variety representation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
        {/* Left Column: Purchase Entry Form */}
        <form onSubmit={handlePurchaseSubmit} className="border border-[#d3c099] rounded-2xl p-5 bg-[#FAF4E6]/10 space-y-4 font-jakarta">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            Record Purchase Entry
          </h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-600">Select Product</label>
            <select
              required
              value={purchaseProdId}
              onChange={(e) => {
                setPurchaseProdId(e.target.value);
                const prod = localProducts.find(p => p.id === e.target.value);
                if (prod) setPurchaseCost(prod.purchasePrice || Math.floor(prod.price * 0.6));
              }}
              className="h-10 px-3.5 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900"
            >
              <option value="">Select Item...</option>
              {localProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Quantity Added</label>
              <input
                type="number"
                required
                min="1"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(parseInt(e.target.value) || 0)}
                className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 font-bold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Cost Price / Unit (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(parseInt(e.target.value) || 0)}
                className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Save Purchase Entry
          </button>
        </form>

        {/* Right Column: Inventory Stock Update Listing */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
            Stock Level Updates
          </h3>
          
          <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10">
            <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
              <table className="w-full min-w-[340px] text-left text-xs border border-[#d3c099] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-500 font-extrabold uppercase tracking-wider sticky top-0">
                    <th className="p-3 pl-4 border border-[#d3c099]">Product</th>
                    <th className="p-3 text-center border border-[#d3c099]">Stock</th>
                    <th className="p-3 text-right pr-4 border border-[#d3c099]">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c099]">
                  {localProducts.map(p => {
                    const isLow = p.stock < 10;
                    return (
                      <tr key={p.id} className={`font-semibold ${isLow ? 'bg-amber-50/20' : ''}`}>
                        <td className="p-3 pl-4 font-jakarta border border-[#d3c099]">
                          <span className="font-bold text-stone-855 block">{p.name}</span>
                          <span className="text-[9px] text-stone-400 font-normal">{p.category}</span>
                        </td>
                        <td className="p-3 text-center border border-[#d3c099]">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isLow ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {p.stock} Units
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4 border border-[#d3c099]">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setLocalProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));
                              }}
                              className="w-7 h-7 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              onClick={() => {
                                setLocalProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: item.stock + 1 } : item));
                              }}
                              className="w-7 h-7 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase logs */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
          Purchase Logs History
        </h3>
        <div className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/10 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs border border-[#d3c099] border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-[#d3c099] text-stone-500 font-bold uppercase tracking-wider">
                <th className="p-3 pl-4 border border-[#d3c099]">Entry ID</th>
                <th className="p-3 border border-[#d3c099]">Product Name</th>
                <th className="p-3 text-center border border-[#d3c099]">Qty Added</th>
                <th className="p-3 border border-[#d3c099]">Unit Cost</th>
                <th className="p-3 text-right pr-4 border border-[#d3c099]">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3c099]">
              {purchaseHistory.map(ph => (
                <tr key={ph.id} className="font-semibold text-stone-750 font-jakarta">
                  <td className="p-3 pl-4 font-bold text-[#384401] border border-[#d3c099]">{ph.id}</td>
                  <td className="p-3 text-stone-900 border border-[#d3c099]">{ph.productName}</td>
                  <td className="p-3 text-center font-bold text-stone-900 border border-[#d3c099]">+{ph.quantity}</td>
                  <td className="p-3 border border-[#d3c099]">₹{ph.unitCost}</td>
                  <td className="p-3 text-right pr-4 font-bold text-stone-900 border border-[#d3c099]">₹{ph.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
