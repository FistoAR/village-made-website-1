/**
 * loading.tsx for /products/[id]
 *
 * Shown immediately by Next.js while the product detail page JS
 * is loading. Mirrors the real page's layout:
 *   - Navbar bar
 *   - Breadcrumb row
 *   - Left: video/image panel  |  Right: product info panel
 *   - Tabs bar + description block
 *   - Related products row
 */
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-[150] h-[64px] bg-[#fcf9f2]/95 backdrop-blur-md border-b border-[#eeddb9]/50 shadow-md" />

      <main className="pt-28 pb-20 px-4 md:px-12 lg:px-24 mx-auto">

        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-10 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-3 w-1 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-3 w-16 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-3 w-1 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-3 w-36 bg-[#e8dfc8] rounded animate-pulse" />
        </div>

        {/* ── Main Details Panel ── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[5%] mb-12 items-stretch justify-between">

          {/* Left: Video/Image panel skeleton */}
          <div className="w-full lg:w-[47.5%]">
            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:min-h-[420px] bg-[#e8dfc8] rounded-[32px] overflow-hidden animate-pulse" />
          </div>

          {/* Right: Product info skeleton */}
          <div className="w-full lg:w-[47.5%] flex flex-col gap-4">

            {/* Badge row */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <div className="h-7 w-24 bg-[#e8dfc8] rounded-full animate-pulse" />
                <div className="h-7 w-28 bg-[#e8dfc8] rounded-full animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-[#e8dfc8] rounded-full animate-pulse" />
            </div>

            {/* Product title */}
            <div className="space-y-2">
              <div className="h-8 w-4/5 bg-[#e0d7c0] rounded-xl animate-pulse" />
              <div className="h-6 w-2/3 bg-[#e0d7c0] rounded-xl animate-pulse" />
            </div>

            {/* Tagline */}
            <div className="h-4 w-52 bg-[#e8dfc8] rounded animate-pulse" />

            {/* Stars */}
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-[#e8dfc8] rounded animate-pulse" />
              ))}
              <div className="h-4 w-8 bg-[#e8dfc8] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#e8dfc8] rounded animate-pulse" />
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 bg-[#d8cfb8] rounded-xl animate-pulse" />
              <div className="h-5 w-14 bg-[#e8dfc8] rounded animate-pulse" />
              <div className="h-6 w-16 bg-[#e8dfc8] rounded-full animate-pulse" />
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e8dfc8]" />

            {/* Weight selector */}
            <div>
              <div className="h-3 w-20 bg-[#e8dfc8] rounded animate-pulse mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-9 w-16 bg-[#e8dfc8] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 items-center">
              <div className="h-11 w-28 bg-[#e8dfc8] rounded-xl animate-pulse" />
              <div className="h-11 flex-1 bg-[#d0c9b0] rounded-xl animate-pulse" />
              <div className="h-11 flex-1 bg-[#c8c0a5] rounded-xl animate-pulse" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#e8dfc8] rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs bar ── */}
        <div className="flex gap-2 border-b border-[#e8dfc8] mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-t-lg animate-pulse"
              style={{ width: `${[96, 80, 72, 88][i]}px`, background: i === 0 ? '#d0c9b0' : '#e8dfc8' }}
            />
          ))}
        </div>

        {/* ── Tab content (description) ── */}
        <div className="space-y-3 mb-16 max-w-3xl">
          <div className="h-4 w-full bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="mt-6 h-4 w-2/3 bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#e8dfc8] rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-[#e8dfc8] rounded animate-pulse" />
        </div>

        {/* ── You May Also Like heading ── */}
        <div className="h-6 w-48 bg-[#e0d7c0] rounded-xl animate-pulse mb-6" />

        {/* Related product cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#FAF4E6] rounded-[24px] overflow-hidden border border-[#eeddb9] flex flex-col"
            >
              <div className="w-full aspect-square bg-[#e8dfc8] animate-pulse" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 w-14 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-3 w-full bg-[#d8cfb8] rounded animate-pulse" />
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 h-8 bg-[#d8cfb8] rounded-lg animate-pulse" />
                  <div className="flex-1 h-8 bg-[#c8c0a5] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
