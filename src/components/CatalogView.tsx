import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Search, SlidersHorizontal, Info, ShoppingCart, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import ProductVisualizer from './ProductVisualizer';
import { imageLibrary } from '../config/imageLibrary';

export default function CatalogView() {
  const {
    activeBusiness,
    categories,
    products,
    setSelectedProductId,
    setCurrentScreen,
    addToCart
  } = usePlatform();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Filter lists by the ACTIVE business
  const businessCategories = categories.filter(c => c.businessId === activeBusiness.id);
  const businessProducts = products.filter(p => p.businessId === activeBusiness.id);

  // Apply filters sequentially
  const filteredProducts = businessProducts.filter(p => {
    // 1. Search Query
    if (localSearch) {
      const q = localSearch.toLowerCase();
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      const matchesSKU = p.SKU.toLowerCase().includes(q);
      const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesSKU && !matchesTags) {
        return false;
      }
    }

    // 2. Category Filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // 3. Availability Filter
    if (availabilityFilter === 'in-stock' && p.stock === 0) {
      return false;
    }
    if (availabilityFilter === 'low-stock' && (p.stock <= 0 || p.stock > 10)) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const finalA = a.salePrice || a.price;
    const finalB = b.salePrice || b.price;

    switch (sortBy) {
      case 'price-low-high':
        return finalA - finalB;
      case 'price-high-low':
        return finalB - finalA;
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'stock-high':
        return b.stock - a.stock;
      default:
        return 0; // standard order
    }
  });

  const handleProductDetails = (id: string) => {
    setSelectedProductId(id);
    setCurrentScreen('detail');
  };

  return (
    <div id="catalog-view" className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-6">
      
      {/* Dynamic Catalog Section Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {activeBusiness.name} Collections
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse and coordinate orders for our curated {businessProducts.length} items.
          </p>
        </div>

        {/* Sorting Controller */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="catalog-sort" className="text-xs font-bold text-gray-600 font-mono">SORT BY:</label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none"
          >
            <option value="featured">Featured / Default</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-asc">Alphabetical: A-Z</option>
            <option value="name-desc">Alphabetical: Z-A</option>
            <option value="stock-high">Availability Levels</option>
          </select>
        </div>
      </div>

      {/* Grid Layout: Main Filters Sidebar + Grid Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Sidebar Controls (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1 space-y-5 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-400 font-mono uppercase">Filter Panel</span>
          </div>

          {/* Local search in active catalog */}
          <div className="space-y-1.5">
            <label htmlFor="catalog-search" className="text-xs font-bold text-gray-700">Search Products</label>
            <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                id="catalog-search"
                type="text"
                placeholder="Search catalog..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-900 border-0 outline-none"
              />
            </div>
          </div>

          {/* Category Scoping */}
          <div className="space-y-1.5">
            <legend className="text-xs font-bold text-gray-700">Category</legend>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-amber-100/50 text-amber-900 font-extrabold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
                <span className="font-mono text-[10px] text-gray-400 font-bold">{businessProducts.length}</span>
              </button>

              {businessCategories.map((cat) => {
                const count = businessProducts.filter(p => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-100/50 text-amber-900 font-extrabold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Availability Indicator */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <legend className="text-xs font-bold text-gray-700">In-Stock Status</legend>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${
                  availabilityFilter === 'all' ? 'bg-gray-100 text-gray-950' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Quantities
              </button>
              <button
                onClick={() => setAvailabilityFilter('in-stock')}
                className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${
                  availabilityFilter === 'in-stock' ? 'bg-gray-100 text-gray-950' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                In Stock Only
              </button>
              <button
                onClick={() => setAvailabilityFilter('low-stock')}
                className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${
                  availabilityFilter === 'low-stock' ? 'bg-gray-100 text-gray-950' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Running Low (≤ 10)
              </button>
            </div>
          </div>
        </div>

        {/* Grid List Elements Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Mobile Only: Simple Search Box */}
          <div className="block lg:hidden relative rounded-2xl border border-gray-250 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
            <div className="flex items-center gap-2 text-gray-500">
              <Search className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={`Search products in ${activeBusiness.name}...`}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-xs py-1 px-1 text-gray-950 border-0 outline-none placeholder-gray-400 font-semibold"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-mono hover:bg-gray-200 transition-all font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile Only: Scrollable Horizontal Category Swipeable Tabs */}
          <div className="block lg:hidden w-full overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
            <div className="flex items-center gap-2 whitespace-nowrap px-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {businessCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all shrink-0 ${
                      isActive
                        ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-mono">
            <span>SHOWING {sortedProducts.length} OF {businessProducts.length} PRODUCTS</span>
            {localSearch || selectedCategory !== 'all' || availabilityFilter !== 'all' ? (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSelectedCategory('all');
                  setAvailabilityFilter('all');
                }}
                className="text-amber-800 font-bold hover:underline"
              >
                Reset Filters
              </button>
            ) : null}
          </div>

          {sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center space-y-4">
              <img 
                src={imageLibrary.placeholders.general} 
                alt="Empty Catalog" 
                className="h-28 w-28 rounded-2xl object-cover mx-auto shadow-sm opacity-80 border border-gray-100" 
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">No products match current settings</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Relax filters, alter spelling, or browse categories list within this active business catalog to find items.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {sortedProducts.map((p) => {
                const exactCat = categories.find(c => c.id === p.categoryId)?.name || '';
                const basePrice = p.price;
                const salePrice = p.salePrice;
                const isOutOfStock = p.stock === 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleProductDetails(p.id)}
                    className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-3 cursor-pointer select-none shadow-xs hover:shadow-lg transition-all hover:border-amber-300"
                  >
                    
                    {/* Visualizer header */}
                    <ProductVisualizer
                      id={p.id}
                      color={p.image}
                      category={exactCat}
                      title={p.title}
                      className="aspect-square w-full"
                      stock={p.stock}
                    />

                    <div className="mt-3.5 flex flex-col justify-between flex-1 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 font-bold tracking-widest uppercase">
                          <span>{exactCat}</span>
                          <span className="hidden sm:inline">{p.SKU}</span>
                        </div>
                        <h2 className="title-clamp font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-800 transition-colors">
                          {p.title}
                        </h2>
                        <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                          {p.description}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                        {/* Cost parameters */}
                        <div className="flex items-baseline gap-1.5">
                          {salePrice ? (
                            <>
                              <span className="text-xs sm:text-sm font-bold font-mono text-amber-600">₹{salePrice.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm font-bold font-mono text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        {/* Allowed Actions Indicators - hidden on mobile */}
                        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1">
                          {p.allowedActions.includes('buy') && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100">
                              <ShoppingCart className="h-2.5 w-2.5" />
                              Buy
                            </span>
                          )}
                          {p.allowedActions.includes('enquire') && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase tracking-wider border border-blue-100">
                              <MessageSquare className="h-2.5 w-2.5" />
                              Quote
                            </span>
                          )}
                          {p.allowedActions.includes('book') && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider border border-amber-100">
                              <Calendar className="h-2.5 w-2.5" />
                              Book
                            </span>
                          )}
                        </div>

                        {/* Interactive dynamic button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.allowedActions.includes('buy') && !isOutOfStock) {
                              addToCart(p);
                            } else {
                              handleProductDetails(p.id);
                            }
                          }}
                          disabled={isOutOfStock && p.allowedActions.includes('buy') && p.allowedActions.length === 1}
                          className="w-full flex items-center justify-center rounded-xl bg-gray-900 py-2 text-center text-xs font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 focus:outline-none"
                        >
                          {isOutOfStock && p.allowedActions.includes('buy') && p.allowedActions.length === 1 ? (
                            <span>Sold Out</span>
                          ) : p.allowedActions.includes('buy') ? (
                            <span>Add to Cart</span>
                          ) : p.allowedActions.includes('book') ? (
                            <span>Book slot</span>
                          ) : (
                            <span>Get Quote</span>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
