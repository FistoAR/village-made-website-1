'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/Product/ProductCard';
import { useApp } from '@/lib/context/AppContext';

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
}

const CATEGORIES = [
  { id: 'malt', name: 'Malt', count: 6 },
  { id: 'health-mix', name: 'Natural Health Mix', count: 4 },
  { id: 'millets', name: 'Millets', count: 6 },
  { id: 'flours', name: 'Millet Flours', count: 6 },
  { id: 'tiffin-mix', name: 'Millet Tiffin mix', count: 4 },
  { id: 'noodles', name: 'Millet Noodles', count: 5 },
  { id: 'rice', name: 'Rice', count: 6 },
  { id: 'sugar', name: 'Natural Sugar', count: 5 },
  { id: 'cookies', name: 'Millet Cookies', count: 6 },
  { id: 'snacks', name: 'Snacks', count: 7 },
];

const CATEGORY_MAP: Record<string, string> = {
  malt: 'Malt',
  'health-mix': 'Natural Health Mix',
  millets: 'Millets',
  flours: 'Millet Flours',
  'tiffin-mix': 'Millet Tiffin mix',
  noodles: 'Millet Noodles',
  rice: 'Rice',
  sugar: 'Natural Sugar',
  cookies: 'Millet Cookies',
  snacks: 'Snacks',
};

function matchesCategory(product: Product, catId: string): boolean {
  return product.category === CATEGORY_MAP[catId];
}

/** Highlight matching substring in a string */
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

/** Custom dropdown component */
function CategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = CATEGORIES.find((c) => c.id === value) ?? null;

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
            {CATEGORIES.map((cat) => {
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
  const { products: dbProducts } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback hierarchy: dbProducts (real-time/loaded) -> initialProducts (SSR static/SSR-loaded)
  const productsList = useMemo(() => {
    return dbProducts && dbProducts.length > 0 ? dbProducts : initialProducts;
  }, [dbProducts, initialProducts]);

  const totalCount = productsList.length;

  const searchScopeProducts = selectedCategoryId
    ? productsList.filter((p) => matchesCategory(p, selectedCategoryId))
    : productsList;

  const filteredProducts = useMemo(() => productsList.filter((p) => {
    const matchesCat = selectedCategoryId === '' || matchesCategory(p, selectedCategoryId);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  }), [selectedCategoryId, searchQuery, productsList]);

  const categoriesToRender = useMemo(() =>
    CATEGORIES.filter((cat) => filteredProducts.some((p) => matchesCategory(p, cat.id))),
    [filteredProducts]
  );

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
        <div className="mx-auto flex flex-wrap items-center gap-3">

          {/* All Products button */}
          <button
            id="all-products-btn"
            onClick={() => { setSelectedCategoryId(''); setSearchQuery(''); }}
            className={`flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-jakarta font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
              isAllView && searchQuery === ''
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
            All Products
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
              isAllView && searchQuery === ''
                ? 'bg-white/20 text-white'
                : 'bg-[#F0E8D4] text-[#8B7355]'
            }`}>
              {totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#DBCFB0] shrink-0 hidden sm:block" />

          {/* Category Dropdown */}
          <CategoryDropdown value={selectedCategoryId} onChange={(id) => { setSelectedCategoryId(id); setSearchQuery(''); }} />

          {/* Search input with autocomplete */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            allProducts={searchScopeProducts}
          />

          {/* Result count chip — appears when filtering */}
          {(selectedCategoryId || searchQuery) && (
            <span className="hidden md:flex items-center gap-1.5 text-xs font-jakarta font-semibold text-[#384401] bg-[#EEF2E0] border border-[#C9D98A]/60 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </section>

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
              We couldn&apos;t find any products matching &ldquo;{searchQuery}&rdquo;. Try a different keyword or clear the filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategoryId(''); }}
              className="px-6 py-2.5 rounded-xl bg-[#384401] text-white text-sm font-jakarta font-semibold hover:bg-[#2a3400] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          categoriesToRender.map((cat) => {
            const categoryProducts = filteredProducts.filter((p) => matchesCategory(p, cat.id));
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
    </div>
  );
}
