import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Search, ChevronRight, Star, ShoppingCart, Calendar, ArrowRight, Sparkles, MessageSquare, AlertCircle, Check, Plus, Minus } from 'lucide-react';
import ProductVisualizer from './ProductVisualizer';
import { heroImages } from '../config/heroImages';
import { imageLibrary } from '../config/imageLibrary';

export default function HomeView() {
  const {
    activeBusiness,
    categories,
    products,
    setSelectedProductId,
    setCurrentScreen,
    addToCart,
    carts,
    updateCartQuantity,
    removeFromCart,
    searchQuery,
    setSearchQuery
  } = usePlatform();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Filter categories and products belonging ONLY to current business
  const businessCategories = categories.filter(c => c.businessId === activeBusiness.id);
  const businessProducts = products.filter(p => p.businessId === activeBusiness.id);

  // Group and search operations
  const filteredSearchProducts = businessProducts.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = p.title.toLowerCase().includes(query);
    const matchesDesc = p.description.toLowerCase().includes(query);
    const matchesCategory = categories.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(query);
    const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(query));
    return matchesTitle || matchesDesc || matchesCategory || matchesTags;
  });

  // Split results for live search groupings
  const searchResultsProducts = filteredSearchProducts.filter(p => !p.allowedActions.includes('book'));
  const searchResultsServices = filteredSearchProducts.filter(p => p.allowedActions.includes('book'));
  const matchingCategories = businessCategories.filter(c => 
    searchQuery && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Home curated elements
  const featuredProducts = businessProducts.filter(p => p.salePrice !== undefined);
  const defaultFeatured = featuredProducts.length > 0 ? featuredProducts : businessProducts.slice(0, 2);
  const popularProducts = businessProducts.filter(p => p.stock > 0).slice().reverse();
  const recommendedProducts = businessProducts.filter(p => p.tags.includes('Organic-Coated') || p.tags.includes('Flagship') || p.price > 10000 || p.stock < 10);

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentScreen('detail');
  };

  const handleCategoryClick = (catId: string) => {
    // Navigate straight to Catalog view with active category selection
    setActiveCategoryFilter(catId);
    setCurrentScreen('catalog');
  };

  const isAgro = activeBusiness.id === 'agromart' || activeBusiness.id.toLowerCase().includes('agro');
  const bannerSrc = isAgro ? heroImages.agromart : heroImages.electrohub;

  return (
    <div id="home-view" className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-8">
      
      {/* 1. Curated Premium Active Business Hero */}
      <div 
        className="group/hero relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl transition-all duration-300 md:p-0 flex flex-col md:flex-row md:items-stretch border border-zinc-800/40"
        style={{
          borderLeft: `8px solid ${activeBusiness.accentColor}`,
          boxShadow: `0 10px 30px -10px ${activeBusiness.accentColor}30`
        }}
      >
        {/* Ambient background glow */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-10 blur-2xl pointer-events-none" style={{ backgroundColor: activeBusiness.accentColor }} />
        
        {/* Banner image: Mob stacked above (first element), Desk right-sided (order-last) */}
        <div className="w-full md:w-[45%] shrink-0 relative order-first md:order-last overflow-hidden h-48 sm:h-64 md:h-auto min-h-[190px] md:min-h-full">
          {/* Subtle gradient overlay to blend with the dark premium background */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent md:bg-gradient-to-r md:from-zinc-950 md:via-zinc-950/20 md:to-transparent pointer-events-none" />
          <img 
            src={bannerSrc}
            alt={`${activeBusiness.name} Showcase`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/hero:scale-105"
          />
        </div>

        {/* Text content left container */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-4 relative z-10">
          <span 
            className="self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase font-mono shadow-sm"
            style={{ backgroundColor: `${activeBusiness.accentColor}20`, color: activeBusiness.accentColor, border: `1px solid ${activeBusiness.accentColor}40` }}
          >
            <Sparkles className="h-3 w-3 animate-spin" />
            Welcoming you to {activeBusiness.name}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {activeBusiness.tagline}
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-350 max-w-xl">
            {activeBusiness.description}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setCurrentScreen('catalog')}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-gray-900 shadow-xl transition-all hover:bg-gray-150 focus:outline-none"
            >
              <span>Explore Independent Catalog</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                const targetEl = document.getElementById('home-booking-segment');
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none"
            >
              <span>Book Expert Services</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search Box */}
      <div className="relative">
        <label htmlFor="global-search-input" className="sr-only">Search</label>
        <div className="relative shadow-sm rounded-2xl bg-white border border-gray-200 p-2 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
          <Search className="h-5 w-5 text-gray-400 ml-2.5 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            placeholder={`Search seeds, electronics, components, or services within ${activeBusiness.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent py-2.5 text-sm text-gray-950 border-0 outline-none placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-lg p-1 text-xs font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Live Grouped Search Overlay */}
        {searchQuery && (
          <div className="absolute top-15 left-0 z-30 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 p-4 space-y-4 max-h-[450px] overflow-y-auto animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-400 font-mono uppercase">Grouped Search Results</span>
              <span className="text-xs text-gray-500">
                {filteredSearchProducts.length + matchingCategories.length} items found
              </span>
            </div>

            {/* A. Matching Categories */}
            {matchingCategories.length > 0 && (
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2">Matching Categories</span>
                <div className="flex flex-wrap gap-2">
                  {matchingCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-amber-50/50 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-amber-100 transition-all"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B. Products to Buy / Enquire */}
            {searchResultsProducts.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Products</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResultsProducts.map(p => {
                    const businessCart = carts[activeBusiness.id] || [];
                    const cartItem = businessCart.find(item => item.product.id === p.id);
                    const inCartQty = cartItem ? cartItem.quantity : 0;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductClick(p.id)}
                        className={`flex items-center gap-3 rounded-xl border p-2 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-250 ${
                          inCartQty > 0 ? 'border-amber-400 bg-amber-50/10' : 'border-gray-100'
                        }`}
                      >
                        <ProductVisualizer id={p.id} color={p.image} category={categories.find(c => c.id === p.categoryId)?.name || ''} title={p.title} className="h-12 w-12 shrink-0 rounded-lg p-1" stock={p.stock} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="block text-xs font-bold text-gray-900 truncate">{p.title}</span>
                            {inCartQty > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider shrink-0">
                                <Check className="h-2 w-2 stroke-[3]" />
                                {inCartQty}
                              </span>
                            )}
                          </div>
                          <span className="block text-xs font-mono font-medium text-amber-600">
                            ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* C. Interactive Services & Demos */}
            {searchResultsServices.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Bookable Services & Demos</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResultsServices.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/10 p-2 cursor-pointer transition-all hover:bg-amber-50/30"
                    >
                      <ProductVisualizer id={p.id} color={p.image} category={categories.find(c => c.id === p.categoryId)?.name || ''} title={p.title} className="h-12 w-12 shrink-0 rounded-lg p-1" stock={p.stock} />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-gray-900 truncate">{p.title}</span>
                        <span className="inline-flex items-center gap-1 mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                          <Calendar className="h-2.5 w-2.5" />
                          Assistance Option
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSearchProducts.length === 0 && matchingCategories.length === 0 && (
              <div className="py-6 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm font-medium text-gray-500">No match found inside {activeBusiness.name}.</p>
                <p className="text-xs text-gray-400">Try switching business units or clearing query parameters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Horizontal Categories Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Browse Categories</h2>
          <button 
            onClick={() => setCurrentScreen('catalog')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-0.5"
          >
            <span>See entire grid</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`group relative overflow-hidden rounded-2xl border aspect-[4/3] sm:aspect-[16/10] flex items-end p-3.5 transition-all outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'border-amber-500 ring-2 ring-amber-500 shadow-md'
                : 'border-zinc-200/60 hover:border-amber-400 active:scale-98 shadow-xs'
            }`}
          >
            <img 
              src={activeBusiness.id === 'agromart' ? imageLibrary.agromart.hero : imageLibrary.electrohub.hero} 
              alt="All" 
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <span className="relative z-10 text-white font-extrabold text-[11px] sm:text-xs tracking-tight uppercase">
              All Items
            </span>
          </button>
          
          {businessCategories.map((cat) => {
            const isActive = activeCategoryFilter === cat.id;
            const catImg = activeBusiness.id === 'agromart'
              ? (imageLibrary.agromart as any)[cat.id] || imageLibrary.agromart.hero
              : (imageLibrary.electrohub as any)[cat.id] || imageLibrary.electrohub.hero;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`group relative overflow-hidden rounded-2xl border aspect-[4/3] sm:aspect-[16/10] flex items-end p-3.5 transition-all outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500 shadow-md'
                    : 'border-zinc-200/60 hover:border-amber-400 active:scale-98 shadow-xs'
                }`}
              >
                <img 
                  src={catImg} 
                  alt={cat.name} 
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="relative z-10 text-white font-extrabold text-[11px] sm:text-xs tracking-tight uppercase text-left leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Curated Featured Bargains / Spotlight Slider */}
      {defaultFeatured.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Active Spark Promotions</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {defaultFeatured.map((p) => {
              const exactCategory = categories.find(c => c.id === p.categoryId)?.name || '';
              const businessCart = carts[activeBusiness.id] || [];
              const cartItem = businessCart.find(item => item.product.id === p.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col sm:flex-row rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                    inCartQty > 0 ? 'border-amber-400 bg-amber-50/10' : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => handleProductClick(p.id)}
                >
                  <div className="relative shrink-0 h-36 w-full sm:w-36">
                    <ProductVisualizer
                      id={p.id}
                      color={p.image}
                      category={exactCategory}
                      title={p.title}
                      className="h-full w-full rounded-xl"
                      stock={p.stock}
                    />
                    {inCartQty > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm border border-emerald-500 animate-in fade-in zoom-in-95 duration-150">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Added ({inCartQty})</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col justify-between flex-1 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                          PROMO DEAL
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">{p.SKU}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {p.salePrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-amber-600 font-mono">₹{p.salePrice.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-gray-400 line-through font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-900 font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {p.allowedActions.includes('buy') && p.stock > 0 && inCartQty > 0 ? (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-150 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCartQty <= 1) {
                                removeFromCart(activeBusiness.id, p.id);
                              } else {
                                updateCartQuantity(activeBusiness.id, p.id, inCartQty - 1);
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-amber-250 text-amber-900 transition-all hover:bg-amber-100/50 active:scale-95 text-xs font-bold"
                            title="Decrease Quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-bold text-amber-900 font-mono px-1">
                            {inCartQty} in cart
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCartQty < p.stock) {
                                updateCartQuantity(activeBusiness.id, p.id, inCartQty + 1);
                              }
                            }}
                            disabled={inCartQty >= p.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-amber-250 text-amber-900 transition-all hover:bg-amber-100/50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 text-xs font-bold"
                            title="Increase Quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.allowedActions.includes('buy') && p.stock > 0) {
                              addToCart(p);
                            } else {
                              handleProductClick(p.id);
                            }
                          }}
                          className="rounded-lg bg-gray-950 px-3.5 py-1.5 h-9 text-xs font-bold text-white transition-all hover:bg-gray-800 focus:outline-none"
                        >
                          {p.allowedActions.includes('buy') && p.stock > 0 ? 'Quick Buy' : 'Request Advice'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Popular Products Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          {activeCategoryFilter === 'all' ? 'Popular Collections' : `${categories.find(c => c.id === activeCategoryFilter)?.name} Items`}
        </h2>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popularProducts
            .filter(p => activeCategoryFilter === 'all' || p.categoryId === activeCategoryFilter)
            .map((p) => {
              const exactCat = categories.find(c => c.id === p.categoryId)?.name || '';
              const finalPrice = p.salePrice || p.price;
              const businessCart = carts[activeBusiness.id] || [];
              const cartItem = businessCart.find(item => item.product.id === p.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;
              return (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.id)}
                  className={`group flex flex-col rounded-2xl border p-3 cursor-pointer select-none transition-all hover:shadow-lg hover:border-amber-300 animate-in fade-in zoom-in-95 duration-250 ${
                    inCartQty > 0 ? 'border-amber-400 bg-amber-50/10' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="relative">
                    <ProductVisualizer id={p.id} color={p.image} category={exactCat} title={p.title} className="aspect-square w-full" stock={p.stock} />
                    
                    {/* Absolute subtle rating stars */}
                    <div className="absolute top-2 left-2 flex items-center gap-0.5 rounded-lg bg-white/95 backdrop-blur px-1.5 py-0.5 shadow-sm text-[9px] font-bold text-gray-900">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      <span>4.9</span>
                    </div>

                    {inCartQty > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm border border-emerald-500 animate-in fade-in zoom-in-95 duration-150">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>({inCartQty})</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col justify-between flex-1 space-y-2">
                    <div className="space-y-0.5">
                      <span className="block font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider">{exactCat}</span>
                      <h3 className="font-bold text-gray-900 text-xs truncate group-hover:text-amber-800 transition-colors">
                        {p.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 gap-1.5">
                      <span className="font-mono text-xs font-bold text-amber-900 shrink-0">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>

                      {p.allowedActions.includes('buy') && p.stock > 0 ? (
                        inCartQty > 0 ? (
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-0.5 animate-in fade-in zoom-in-95 duration-150 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (inCartQty <= 1) {
                                  removeFromCart(activeBusiness.id, p.id);
                                } else {
                                  updateCartQuantity(activeBusiness.id, p.id, inCartQty - 1);
                                }
                              }}
                              className="flex h-5 w-5 items-center justify-center rounded bg-white border border-amber-200 text-amber-900 transition-all hover:bg-amber-100/50 active:scale-95 text-[10px] font-bold"
                              title="Decrease"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="text-[10px] font-bold text-amber-900 font-mono px-0.5">
                              {inCartQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (inCartQty < p.stock) {
                                  updateCartQuantity(activeBusiness.id, p.id, inCartQty + 1);
                                }
                              }}
                              disabled={inCartQty >= p.stock}
                              className="flex h-5 w-5 items-center justify-center rounded bg-white border border-amber-200 text-amber-950 transition-all hover:bg-amber-100/50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 text-[10px] font-bold"
                              title="Increase"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            className="rounded-lg bg-gray-950 px-2.5 py-1 text-[10px] text-white font-bold transition-all hover:bg-gray-800 focus:outline-none"
                          >
                            Add
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(p.id);
                          }}
                          className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] text-gray-800 font-bold transition-all hover:bg-gray-200 focus:outline-none"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 6. Quick Interactive Booking & Assistance segment */}
      <div 
        id="home-booking-segment"
        className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/20 via-orange-50/5 to-white p-6 shadow-sm space-y-6 md:p-10"
      >
        <div className="max-w-xl space-y-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 font-mono uppercase tracking-wider">
            Enterprise Assistance
          </span>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {activeBusiness.id === 'agromart' 
              ? 'Request Ground Machinery Demo' 
              : 'Schedule Premium Service / Support'}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed md:text-sm">
            {activeBusiness.id === 'agromart'
              ? 'Tractors, sprayers, rotavators can be scheduled representing live demonstrations on your plot coordinates. Get vetted details from master operators.'
              : 'Secure specialized home visit repair, smart TV setting installation, or developer warranty assistance. Handled by factory-certified specialists.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {businessProducts.filter(p => p.allowedActions.includes('book')).map((srv) => (
            <div 
              key={srv.id}
              onClick={() => handleProductClick(srv.id)}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xs cursor-pointer hover:border-amber-300 transition-all"
            >
              <ProductVisualizer 
                id={srv.id}
                color={srv.image} 
                category={categories.find(c => c.id === srv.categoryId)?.name || ''} 
                title={srv.title} 
                className="h-10 w-10 shrink-0" 
              />
              <div className="min-w-0">
                <span className="block font-bold text-gray-900 text-xs truncate leading-normal">{srv.title}</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600">
                  <Calendar className="h-2.5 w-2.5" />
                  Book Now
                </span>
              </div>
            </div>
          ))}

          {/* Live general consultation widget */}
          <div 
            onClick={() => {
              // Open generic enquiry form
              setCurrentScreen('catalog');
            }}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-3 shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-gray-700 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-bold text-gray-900 text-xs">General Consultation</span>
              <span className="text-[10px] text-gray-500">Post query to team</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
