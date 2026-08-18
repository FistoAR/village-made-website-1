export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-[150] h-[64px] bg-[#fcf9f2]/95 backdrop-blur-md border-b border-[#eeddb9]/50 shadow-md" />

      {/* Header skeleton */}
      <section className="relative pt-28 pb-2 px-6 md:px-12 lg:px-18">
        <div className="mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="h-3 w-10 bg-[#e8dfc8] rounded animate-pulse" />
            <div className="h-3 w-1 bg-[#e8dfc8] rounded animate-pulse" />
            <div className="h-3 w-14 bg-[#e8dfc8] rounded animate-pulse" />
          </div>
          <div className="h-9 w-48 bg-[#e8dfc8] rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-80 bg-[#e8dfc8] rounded animate-pulse" />
        </div>
      </section>

      {/* Filter toolbar skeleton */}
      <section className="py-3 px-6 md:px-12 lg:px-18 border-b border-[#eeddb9]/40 bg-[#FDFBF7]/95">
        <div className="flex items-center gap-3">
          <div className="h-11 w-36 bg-[#e8dfc8] rounded-xl animate-pulse" />
          <div className="w-px h-6 bg-[#DBCFB0] hidden sm:block" />
          <div className="h-11 w-40 bg-[#e8dfc8] rounded-xl animate-pulse" />
          <div className="h-11 flex-1 max-w-sm bg-[#e8dfc8] rounded-xl animate-pulse" />
        </div>
      </section>

      {/* Product grid skeleton */}
      <main className="py-8 px-6 md:px-12 lg:px-18 mx-auto">
        {/* Category header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-7 w-40 bg-[#e8dfc8] rounded-xl animate-pulse" />
          <div className="flex-1 border-t border-dashed border-[#dcd3b6]/80" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-14">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-[#FAF4E6] rounded-[24px] overflow-hidden border border-[#eeddb9] flex flex-col"
            >
              {/* Video area skeleton */}
              <div className="w-full aspect-square bg-[#e8dfc8] animate-pulse" />

              {/* Info area skeleton */}
              <div className="flex flex-col flex-grow p-4 gap-3">
                <div className="h-3 w-16 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-3 w-full bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-[#d8cfb8] rounded animate-pulse" />

                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <div key={s} className="w-3.5 h-3.5 bg-[#d8cfb8] rounded animate-pulse" />
                  ))}
                </div>

                {/* Price */}
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-14 bg-[#d8cfb8] rounded animate-pulse" />
                  <div className="h-4 w-12 bg-[#d8cfb8] rounded animate-pulse" />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-auto">
                  <div className="flex-1 h-8 bg-[#d8cfb8] rounded-lg animate-pulse" />
                  <div className="flex-1 h-8 bg-[#c2bb9f] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second category header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-7 w-52 bg-[#e8dfc8] rounded-xl animate-pulse" />
          <div className="flex-1 border-t border-dashed border-[#dcd3b6]/80" />
        </div>

        {/* Second row cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-[#FAF4E6] rounded-[24px] overflow-hidden border border-[#eeddb9] flex flex-col"
            >
              <div className="w-full aspect-square bg-[#e8dfc8] animate-pulse" />
              <div className="flex flex-col flex-grow p-4 gap-3">
                <div className="h-3 w-16 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[#d8cfb8] rounded animate-pulse" />
                <div className="h-3 w-full bg-[#d8cfb8] rounded animate-pulse" />
                <div className="flex gap-2 mt-auto pt-4">
                  <div className="flex-1 h-8 bg-[#d8cfb8] rounded-lg animate-pulse" />
                  <div className="flex-1 h-8 bg-[#c2bb9f] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
