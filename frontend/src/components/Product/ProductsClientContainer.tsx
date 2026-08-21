'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/Product/ProductCard';
import { useApp } from '@/lib/context/AppContext';
import MusicToggleButton from '@/components/MusicToggleButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: number;
  weights?: string[];
  category: string;
  badge?: string;
  video?: string;
  stock?: number;
}

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'price-asc', label: 'Price: Low \u2192 High' },
  { id: 'price-desc', label: 'Price: High \u2192 Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'newest', label: 'New Arrivals' },
];

interface FilterState {
  priceMin: number;
  priceMax: number;
  tags: string[];
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 500,
  tags: [],
  inStockOnly: false,
};

// Highlight matching substring in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#D4E47A]/60 text-[#384401] font-semibold rounded-[2px] px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/** Search input with autocomplete suggestions */
function SearchInput({
  value,
  onChange,
  allProducts,
}: {
  value: string;
  onChange: (v: string) => void;
  allProducts: { id: string; name: string; category: string; description: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = value.trim().toLowerCase();

  // Build suggestion list — max 8
  const suggestions = q.length < 1 ? [] : allProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
    .slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setOpen(true);
      setActiveIdx(-1);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (name: string) => {
      onChange(name);
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx].name);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-[180px] max-w-sm" id="products-search-wrapper">
      {/* Magnifier */}
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#A18A6A] z-10">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>
      </span>

      <input
        ref={inputRef}
        id="products-search-input"
        type="text"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onFocus={() => q.length >= 1 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products…"
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#DBCFB0] bg-white text-sm font-jakarta text-[#3E2C1C] placeholder-[#B5A48A] focus:outline-none focus:border-[#384401] focus:ring-2 focus:ring-[#384401]/15 transition-all duration-200"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => { onChange(''); setOpen(false); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A18A6A] hover:text-[#384401] transition-colors cursor-pointer z-10"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[260px] bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-50 overflow-hidden"
          style={{ transformOrigin: 'top left', animation: 'dropdown-in 0.15s ease-out both' }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#F0E8D4] bg-[#FDFBF7] flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A18A6A] font-jakarta">
              Suggestions
            </span>
            <span className="text-[10px] font-semibold text-[#A18A6A] font-jakarta">
              {suggestions.length} found
            </span>
          </div>

          <ul role="listbox" className="py-1.5 max-h-72 overflow-y-auto">
            {suggestions.map((p, i) => (
              <li key={p.id}>
                <button
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => handleSelect(p.name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 cursor-pointer ${
                    i === activeIdx ? 'bg-[#EEF2E0]' : 'hover:bg-[#F6F3EC]'
                  }`}
                >
                  {/* Search icon */}
                  <span className="w-7 h-7 rounded-lg bg-[#F0E8D4] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#A18A6A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
                    </svg>
                  </span>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-jakarta text-[#3E2C1C] font-medium truncate leading-snug">
                      <Highlight text={p.name} query={value} />
                    </span>
                    <span className="text-[11px] font-jakarta text-[#A18A6A] truncate">
                      <Highlight text={p.category} query={value} />
                    </span>
                  </div>

                  {/* Arrow */}
                  {i === activeIdx && (
                    <svg className="w-3.5 h-3.5 text-[#384401] ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: scale(0.97) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/** Sort By dropdown */
function SortByDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.id === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative" id="sort-by-dropdown">
      <button onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 h-11 pl-4 pr-3 rounded-xl border text-sm font-jakarta font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
          open || value !== 'default' ? 'bg-[#704632] text-white border-[#704632] shadow-md' : 'bg-white text-[#3E2C1C] border-[#DBCFB0] hover:border-[#704632] hover:bg-[#FAF4EE]'
        }`}>
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="9" y1="18" x2="15" y2="18" />
        </svg>
        <span>{value !== 'default' ? selected.label : 'Sort By'}</span>
        <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-50 overflow-hidden animate-dropdown" style={{ transformOrigin: 'top left' }}>
          <div className="px-4 py-3 border-b border-[#F0E8D4] bg-[#FDFBF7]">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A18A6A] font-jakarta">Sort Products</span>
          </div>
          <ul className="py-2">
            {SORT_OPTIONS.map((opt) => {
              const active = opt.id === value;
              return (
                <li key={opt.id}>
                  <button onClick={() => { onChange(opt.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-jakarta transition-colors cursor-pointer ${active ? 'bg-[#FBF1EA] text-[#704632] font-semibold' : 'text-[#3E2C1C] hover:bg-[#F6F3EC]'}`}>
                    {active
                      ? <svg className="w-3.5 h-3.5 text-[#704632] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      : <span className="w-3.5 h-3.5 shrink-0" />
                    }
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Advanced Filters dropdown */
function FiltersDropdown({ filters, onChange, productPriceRange }: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  productPriceRange: { min: number; max: number };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasPriceFilter = filters.priceMin > productPriceRange.min || filters.priceMax < productPriceRange.max;
  const isActive = hasPriceFilter || filters.tags.length > 0 || filters.inStockOnly;
  const activeCount = (hasPriceFilter ? 1 : 0) + filters.tags.length + (filters.inStockOnly ? 1 : 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  return (
    <div ref={ref} className="relative" id="advanced-filters-dropdown">
      <button onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 h-11 pl-4 pr-3 rounded-xl border text-sm font-jakarta font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
          isActive || open ? 'bg-[#C56C4F] text-white border-[#C56C4F] shadow-md' : 'bg-white text-[#3E2C1C] border-[#DBCFB0] hover:border-[#C56C4F] hover:bg-[#FEF4F0]'
        }`}>
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
          <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">{activeCount}</span>
        )}
        <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-50 overflow-hidden animate-dropdown" style={{ transformOrigin: 'top left' }}>
          <div className="px-4 py-3 border-b border-[#F0E8D4] bg-[#FDFBF7] flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A18A6A] font-jakarta">Advanced Filters</span>
            {isActive && (
              <button onClick={() => onChange({ ...DEFAULT_FILTERS, priceMin: productPriceRange.min, priceMax: productPriceRange.max })}
                className="text-[11px] font-semibold text-[#C56C4F] hover:text-[#9e4e37] transition-colors font-jakarta cursor-pointer">Reset All</button>
            )}
          </div>
          <div className="p-4 flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-jakarta text-[#3E2C1C] uppercase tracking-wide">Price Range</span>
                <span className="text-xs font-semibold font-jakarta text-[#704632] bg-[#FBF1EA] px-2 py-0.5 rounded-full">&#8377;{filters.priceMin} &#8211; &#8377;{filters.priceMax}</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-[11px] text-[#A18A6A] font-jakarta w-6 shrink-0">Min</label>
                  <input type="range" min={productPriceRange.min} max={productPriceRange.max} step={10} value={filters.priceMin}
                    onChange={(e) => { const v = Number(e.target.value); if (v <= filters.priceMax - 10) onChange({ ...filters, priceMin: v }); }}
                    className="flex-1 h-1.5 accent-[#384401] cursor-pointer" />
                  <span className="text-[11px] font-semibold font-jakarta text-[#3E2C1C] w-10 text-right">&#8377;{filters.priceMin}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[11px] text-[#A18A6A] font-jakarta w-6 shrink-0">Max</label>
                  <input type="range" min={productPriceRange.min} max={productPriceRange.max} step={10} value={filters.priceMax}
                    onChange={(e) => { const v = Number(e.target.value); if (v >= filters.priceMin + 10) onChange({ ...filters, priceMax: v }); }}
                    className="flex-1 h-1.5 accent-[#384401] cursor-pointer" />
                  <span className="text-[11px] font-semibold font-jakarta text-[#3E2C1C] w-10 text-right">&#8377;{filters.priceMax}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#F0E8D4]" />
            <div>
              <span className="text-xs font-bold font-jakarta text-[#3E2C1C] uppercase tracking-wide block mb-3">Product Tags</span>
              <div className="flex flex-wrap gap-2">
                {[{ id: 'best-seller', label: '\u{1F3C6} Best Seller' }, { id: 'kids-favourite', label: '\u2B50 Kids Favourite' }].map((tag) => {
                  const active = filters.tags.includes(tag.id);
                  return (
                    <button key={tag.id} onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-jakarta border transition-all duration-150 cursor-pointer ${
                        active ? 'bg-[#384401] text-white border-[#384401] shadow-sm' : 'bg-white text-[#3E2C1C] border-[#DBCFB0] hover:border-[#384401] hover:bg-[#EEF2E0]'
                      }`}>{tag.label}</button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-[#F0E8D4]" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold font-jakarta text-[#3E2C1C] uppercase tracking-wide block">In Stock Only</span>
                <span className="text-[11px] text-[#A18A6A] font-jakarta">Hide out-of-stock products</span>
              </div>
              <button onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
                role="switch" aria-checked={filters.inStockOnly}
                className={`relative w-10 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${filters.inStockOnly ? 'bg-[#384401]' : 'bg-stone-200'}`}
                style={{ height: '22px' }}>
                <span className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${filters.inStockOnly ? 'translate-x-[18px]' : 'translate-x-0'}`}
                  style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Active filter pill bar */
function ActiveFilterBar({ searchQuery, selectedCategoryId, selectedCategoryName, sortBy, filters, productPriceRange, onClearSearch, onClearCategory, onClearSort, onClearPriceRange, onClearTag, onClearInStock, onClearAll }: {
  searchQuery: string; selectedCategoryId: string; selectedCategoryName: string; sortBy: string; filters: FilterState; productPriceRange: { min: number; max: number };
  onClearSearch: () => void; onClearCategory: () => void; onClearSort: () => void; onClearPriceRange: () => void;
  onClearTag: (tag: string) => void; onClearInStock: () => void; onClearAll: () => void;
}) {
  const hasPriceFilter = filters.priceMin > productPriceRange.min || filters.priceMax < productPriceRange.max;
  const pills: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchQuery) pills.push({ key: 'search', label: `"${searchQuery}"`, onRemove: onClearSearch });
  if (selectedCategoryId) pills.push({ key: 'cat', label: selectedCategoryName || selectedCategoryId, onRemove: onClearCategory });
  if (sortBy !== 'default') pills.push({ key: 'sort', label: SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? sortBy, onRemove: onClearSort });
  if (hasPriceFilter) pills.push({ key: 'price', label: `\u20B9${filters.priceMin}\u2013\u20B9${filters.priceMax}`, onRemove: onClearPriceRange });
  filters.tags.forEach((tag) => pills.push({ key: `tag-${tag}`, label: tag === 'best-seller' ? '\u{1F3C6} Best Seller' : '\u2B50 Kids Favourite', onRemove: () => onClearTag(tag) }));
  if (filters.inStockOnly) pills.push({ key: 'stock', label: 'In Stock Only', onRemove: onClearInStock });
  if (pills.length === 0) return null;
  return (
    <div className="px-6 md:px-12 lg:px-18 py-2.5 bg-[#FDFBF7] border-b border-[#eeddb9]/40 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold text-[#A18A6A] font-jakarta uppercase tracking-wider shrink-0">Active:</span>
      {pills.map((pill) => (
        <span key={pill.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2E0] border border-[#C9D98A]/60 text-xs font-semibold font-jakarta text-[#384401]">
          {pill.label}
          <button onClick={pill.onRemove} className="text-[#384401]/60 hover:text-[#384401] transition-colors cursor-pointer leading-none" aria-label={`Remove ${pill.label} filter`}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      {pills.length > 1 && (
        <button onClick={onClearAll} className="text-[11px] font-semibold text-[#C56C4F] hover:text-[#9e4e37] font-jakarta transition-colors cursor-pointer ml-1">Clear all</button>
      )}
    </div>
  );
}

/** Custom dropdown component */
function CategoryDropdown({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (id: string) => void;
  categories: { id: string; name: string; count: number }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative" id="category-dropdown">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2.5 h-11 pl-4 pr-3 rounded-xl border text-sm font-jakarta font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
          open
            ? 'bg-[#384401] text-white border-[#384401] shadow-md'
            : 'bg-white text-[#3E2C1C] border-[#DBCFB0] hover:border-[#384401] hover:bg-[#F6F3EC]'
        }`}
      >
        {/* Grid / filter icon */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        <span>{selected ? selected.name : 'All Categories'}</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E8DFC8] shadow-xl z-50 overflow-hidden animate-dropdown"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F0E8D4] bg-[#FDFBF7]">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A18A6A] font-jakarta">Filter by Category</span>
          </div>

          {/* Options */}
          <ul className="py-2 max-h-72 overflow-y-auto">
            {categories.map((cat) => {
              const active = cat.id === value;
              return (
                <li key={cat.id}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => { onChange(cat.id); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-jakarta transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-[#EEF2E0] text-[#384401] font-semibold'
                        : 'text-[#3E2C1C] hover:bg-[#F6F3EC]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {active && (
                        <svg className="w-3.5 h-3.5 text-[#384401] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {!active && <span className="w-3.5 h-3.5 shrink-0" />}
                      {cat.name}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      active ? 'bg-[#384401] text-white' : 'bg-[#F0E8D4] text-[#8B7355]'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Clear footer */}
          {value && (
            <div className="border-t border-[#F0E8D4] px-4 py-2.5 bg-[#FDFBF7]">
              <button
                onClick={() => { onChange(''); setOpen(false); }}
                className="text-xs font-semibold text-[#A18A6A] hover:text-[#384401] transition-colors font-jakarta cursor-pointer"
              >
                ✕ Clear filter
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-dropdown { animation: dropdown-in 0.18s ease-out both; }
      `}</style>
    </div>
  );
}

export default function ProductsClientContainer({ initialProducts }: { initialProducts: Product[] }) {
  const { products: dbProducts, categories: dbCategories } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const productsList = useMemo(() => {
    return dbProducts && dbProducts.length > 0 ? dbProducts : initialProducts;
  }, [dbProducts, initialProducts]);

  // Dynamically compute categories and counts from actual products list
  const dynamicCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    productsList.forEach((p) => {
      const cat = p.category || 'Malt';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const list = Object.entries(counts).map(([name, count]) => {
      const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const dbCat = dbCategories?.find((c) => c.id === id);
      return { 
        id, 
        name, 
        count, 
        displayOrder: dbCat?.display_order !== undefined ? dbCat.display_order : (dbCat?.displayOrder !== undefined ? dbCat.displayOrder : 999) 
      };
    });
    return list.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }, [productsList, dbCategories]);

  const dynamicCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    dynamicCategories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [dynamicCategories]);

  const matchesCategory = useCallback((product: Product, catId: string): boolean => {
    return product.category === dynamicCategoryMap[catId];
  }, [dynamicCategoryMap]);

  const productPriceRange = useMemo(() => {
    if (productsList.length === 0) return { min: 0, max: 500 };
    const prices = productsList.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices) / 10) * 10, max: Math.ceil(Math.max(...prices) / 10) * 10 };
  }, [productsList]);

  useEffect(() => {
    setFilters((f) => ({ ...f, priceMin: productPriceRange.min, priceMax: productPriceRange.max }));
  }, [productPriceRange.min, productPriceRange.max]);

  const totalCount = productsList.length;
  const searchScopeProducts = selectedCategoryId ? productsList.filter((p) => matchesCategory(p, selectedCategoryId)) : productsList;

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCat = selectedCategoryId === '' || matchesCategory(p, selectedCategoryId);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === '' || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesPrice = p.price >= filters.priceMin && p.price <= filters.priceMax;
      const matchesTags = filters.tags.length === 0 || filters.tags.every((tag) => {
        if (tag === 'best-seller') return p.badge === 'BEST SELLER' || p.badge === 'Bestseller';
        return true;
      });
      const matchesStock = !filters.inStockOnly || (p.stock !== undefined ? p.stock > 0 : true);
      return matchesCat && matchesSearch && matchesPrice && matchesTags && matchesStock;
    });
  }, [selectedCategoryId, searchQuery, productsList, filters]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price-desc': return arr.sort((a, b) => b.price - a.price);
      case 'rating':     return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'newest':     return arr.reverse();
      default:           return arr;
    }
  }, [filteredProducts, sortBy]);

  const categoriesToRender = useMemo(() =>
    dynamicCategories.filter((cat) => sortedProducts.some((p) => matchesCategory(p, cat.id))),
    [sortedProducts, dynamicCategories, matchesCategory]
  );

  const hasAnyFilter = !!searchQuery || !!selectedCategoryId || sortBy !== 'default' || filters.tags.length > 0 || filters.inStockOnly || filters.priceMin > productPriceRange.min || filters.priceMax < productPriceRange.max;

  const handleClearAll = () => {
    setSearchQuery(''); setSelectedCategoryId(''); setSortBy('default');
    setFilters({ ...DEFAULT_FILTERS, priceMin: productPriceRange.min, priceMax: productPriceRange.max });
  };

  const isAllView = selectedCategoryId === '';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <Navbar />

      {/* Header Container */}
      <section className="relative pt-28 pb-2 px-6 md:px-12 lg:px-18">
        {/* Top Right Decorative Image */}
        <div className="absolute right-0 top-12 w-[220px] sm:w-[320px] md:w-[420px] aspect-[4/3] pointer-events-none z-0">
          <Image
            src="/images/products/top-right-image.webp"
            alt="Top Right Header Graphic"
            fill
            sizes="(max-width: 640px) 220vw, (max-width: 768px) 320vw, 420vw"
            className="object-contain object-right-top"
            priority
          />
        </div>

        <div className="mx-auto relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-jakarta font-medium mb-3 select-none">
            <Link href="/" className="hover:text-[#384401] transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-[#000000]">Shop</span>
            <span>&gt;</span>
            <span className="text-[#000000]">All Products</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-poetsen text-[#000000] mb-2">All Products</h1>
          <p className="text-stone-900 font-body text-sm max-w-2xl leading-relaxed">
            Explore our wide range of 100% organic and natural products.
          </p>
        </div>
      </section>

      {/* ── Filter Toolbar ── */}
      <section className="py-3 px-6 md:px-12 lg:px-18 border-b border-[#eeddb9]/40 sticky top-[72px] z-40 bg-[#FDFBF7]/95 backdrop-blur-sm">
        <div className="mx-auto flex flex-wrap items-center gap-2.5">

          {/* All Products button */}
          <button
            id="all-products-btn"
            onClick={handleClearAll}
            className={`flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-jakarta font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
              !hasAnyFilter
                ? 'bg-[#384401] text-white shadow-md shadow-[#384401]/20'
                : 'bg-white border border-[#DBCFB0] text-[#3E2C1C] hover:border-[#384401] hover:bg-[#F6F3EC]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            All
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
              !hasAnyFilter ? 'bg-white/20 text-white' : 'bg-[#F0E8D4] text-[#8B7355]'
            }`}>
              {totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#DBCFB0] shrink-0 hidden sm:block" />

          {/* Category Dropdown */}
          <CategoryDropdown value={selectedCategoryId} onChange={(id) => { setSelectedCategoryId(id); setSearchQuery(''); }} categories={dynamicCategories} />

          {/* Sort By Dropdown */}
          <SortByDropdown value={sortBy} onChange={setSortBy} />

          {/* Advanced Filters Dropdown */}
          <FiltersDropdown filters={filters} onChange={setFilters} productPriceRange={productPriceRange} />

          {/* Divider */}
          <div className="w-px h-6 bg-[#DBCFB0] shrink-0 hidden sm:block" />

          {/* Search input with autocomplete */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            allProducts={searchScopeProducts}
          />

          {/* Result count chip */}
          {hasAnyFilter && (
            <span className="hidden md:flex items-center gap-1.5 text-xs font-jakarta font-semibold text-[#384401] bg-[#EEF2E0] border border-[#C9D98A]/60 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {sortedProducts.length} result{sortedProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </section>

      {/* ── Active Filter Pill Bar ── */}
      <ActiveFilterBar
        searchQuery={searchQuery}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryName={dynamicCategoryMap[selectedCategoryId] || selectedCategoryId}
        sortBy={sortBy}
        filters={filters}
        productPriceRange={productPriceRange}
        onClearSearch={() => setSearchQuery('')}
        onClearCategory={() => setSelectedCategoryId('')}
        onClearSort={() => setSortBy('default')}
        onClearPriceRange={() => setFilters((f) => ({ ...f, priceMin: productPriceRange.min, priceMax: productPriceRange.max }))}
        onClearTag={(tag) => setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
        onClearInStock={() => setFilters((f) => ({ ...f, inStockOnly: false }))}
        onClearAll={handleClearAll}
      />

      {/* Catalog Grouped Grid */}
      <main className="py-8 px-6 md:px-12 lg:px-18 mx-auto min-h-[60vh] pb-20">
        {categoriesToRender.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F0E8D4] flex items-center justify-center mb-6">
              <svg className="w-9 h-9 text-[#A18A6A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </div>
            <h3 className="text-lg font-poetsen text-[#3E2C1C] mb-2">No products found</h3>
            <p className="text-sm text-stone-500 font-jakarta mb-6 max-w-xs">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try a different keyword or adjust your filters.`
                : 'No products match your current filters. Try adjusting or resetting them.'}
            </p>
            <button
              onClick={handleClearAll}
              className="px-6 py-2.5 rounded-xl bg-[#384401] text-white text-sm font-jakarta font-semibold hover:bg-[#2a3400] transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          categoriesToRender.map((cat) => {
            const categoryProducts = sortedProducts.filter((p) => matchesCategory(p, cat.id));
            if (categoryProducts.length === 0) return null;

            return (
              <div key={cat.id} className="mb-14 last:mb-0">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6 select-none">
                  <h2 className="text-xl md:text-2xl font-poetsen text-[#000000]">
                    {cat.name} ({categoryProducts.length})
                  </h2>
                  <div className="flex-1 border-t border-dashed border-[#dcd3b6]/80" />
                </div>

                {/* Grid of Product Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      highlighted={product.badge === 'BEST SELLER'}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      <Footer />

      {/* Background ambient music toggle */}
      <MusicToggleButton />
    </div>
  );
}
