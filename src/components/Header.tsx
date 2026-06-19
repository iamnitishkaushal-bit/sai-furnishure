import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Sprout, Cpu, ShoppingBag, Bell, User, Settings, Check, X, Shield, Globe } from 'lucide-react';

export default function Header() {
  const {
    activeBusiness,
    businesses,
    setActiveBusinessId,
    carts,
    notifications,
    markNotificationsAsRead,
    dismissNotification,
    isAdminMode,
    setIsAdminMode,
    currentScreen,
    setCurrentScreen,
    activeUser
  } = usePlatform();

  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Count items in the active business's cart
  const currentCart = carts[activeBusiness.id] || [];
  const cartItemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter notifications for the appropriate portal context
  const filteredNotifications = notifications.filter(n => n.isAdmin === isAdminMode);
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const handleSwitchBusiness = (id: string) => {
    setActiveBusinessId(id);
    setShowBusinessDropdown(false);
    if (currentScreen !== 'admin' && currentScreen !== 'profile' && currentScreen !== 'orders-tracker') {
      setCurrentScreen('home');
    }
  };

  const handleOpenCart = () => {
    setCurrentScreen('cart');
  };

  const toggleAdminMode = () => {
    const nextMode = !isAdminMode;
    setIsAdminMode(nextMode);
    setCurrentScreen(nextMode ? 'admin' : 'home');
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ==================== MOBILE TOP HEADER ==================== */}
        <div className="flex md:hidden w-full items-center justify-between gap-2">
          
          {/* Side-by-side Segmented Business Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/80 shadow-inner">
            {businesses.map((biz) => {
              const isActive = biz.id === activeBusiness.id;
              return (
                <button
                  key={biz.id}
                  onClick={() => handleSwitchBusiness(biz.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-gray-950 shadow-xs ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="text-xs">
                    {biz.logo === 'Sprout' ? '🌱' : biz.logo === 'Cpu' ? '⚡' : '🌐'}
                  </span>
                  <span>{biz.name}</span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Notification Icon on Mobile */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowNotificationPanel(!showNotificationPanel);
                if (!showNotificationPanel) markNotificationsAsRead(isAdminMode);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all focus:outline-none"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Mobile Notification Popover */}
            {showNotificationPanel && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowNotificationPanel(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-gray-250 bg-white p-3 shadow-2xl divide-y divide-gray-100 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">
                      Notifications
                    </span>
                    <button 
                      onClick={() => setShowNotificationPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-2 pt-2 text-left">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        No new updates.
                      </div>
                    ) : (
                      filteredNotifications.map((n) => (
                        <div key={n.id} className="relative rounded-lg bg-gray-50 p-2 text-xs transition-colors">
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <span className="block font-bold text-gray-900 leading-snug pr-4">{n.title}</span>
                          <p className="mt-0.5 text-gray-500 leading-relaxed pr-4">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ==================== DESKTOP TOP HEADER ==================== */}
        <div className="hidden md:flex w-full items-center justify-between gap-4">
          
          {/* Left Side: Brand Selector */}
          <div className="relative flex items-center gap-3">
            <button
              id="business-dropdown-toggle"
              onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2.5 text-left transition-all hover:bg-gray-50 focus:outline-none"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all shadow-sm"
                style={{ backgroundColor: activeBusiness.accentColor }}
              >
                {activeBusiness.logo === 'Sprout' ? (
                  <Sprout className="h-5 w-5 animate-pulse" />
                ) : activeBusiness.logo === 'Cpu' ? (
                  <Cpu className="h-5 w-5 rotate-12" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
              </div>
              
              <div className="hidden pr-1 text-left sm:block">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono line-clamp-1">
                  Active Terminal
                </span>
                <span className="block font-sans text-sm font-bold text-gray-900 leading-tight">
                  {activeBusiness.name}
                </span>
              </div>
              
              <span
                className="ml-1 text-xs px-2 py-0.5 rounded-full font-mono font-medium text-white shadow-sm"
                style={{ backgroundColor: activeBusiness.accentColor }}
              >
                Switch
              </span>
            </button>

            {/* Business Dropdown Modal */}
            {showBusinessDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowBusinessDropdown(false)}
                />
                <div className="absolute top-14 left-0 z-50 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                    Select Business Unit
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {businesses.map((biz) => {
                      const isActive = biz.id === activeBusiness.id;
                      const bCart = carts[biz.id] || [];
                      const bCartCount = bCart.reduce((acc, item) => acc + item.quantity, 0);

                      return (
                        <button
                          key={biz.id}
                          onClick={() => handleSwitchBusiness(biz.id)}
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                            isActive 
                              ? 'bg-gray-50 border border-gray-100' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                              style={{ backgroundColor: biz.accentColor }}
                            >
                              {biz.logo === 'Sprout' ? (
                                <Sprout className="h-5 w-5" />
                              ) : biz.logo === 'Cpu' ? (
                                <Cpu className="h-5 w-5" />
                              ) : (
                                <Globe className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-gray-900">{biz.name}</span>
                              <span className="block text-xs text-gray-500 truncate max-w-[150px]">{biz.tagline}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {bCartCount > 0 && (
                              <span className="flex h-5 items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                                {bCartCount} in Cart
                              </span>
                            )}
                            {isActive && (
                              <div className="rounded-full bg-emerald-100 p-1 text-emerald-800">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center/Quick links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setCurrentScreen('home'); setIsAdminMode(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentScreen === 'home' && !isAdminMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => { setCurrentScreen('catalog'); setIsAdminMode(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentScreen === 'catalog' && !isAdminMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => { setCurrentScreen('profile'); setIsAdminMode(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentScreen === 'profile' && !isAdminMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Account
            </button>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Active Cart Quick Button */}
            {!isAdminMode && (
              <button
                id="header-cart-btn"
                onClick={handleOpenCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all hover:bg-gray-50 focus:outline-none"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-md animate-bounce"
                    style={{ backgroundColor: activeBusiness.accentColor }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Button */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => {
                  setShowNotificationPanel(!showNotificationPanel);
                  if (!showNotificationPanel) markNotificationsAsRead(isAdminMode);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all hover:bg-gray-50 focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotificationPanel && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowNotificationPanel(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl divide-y divide-gray-100 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-bold text-gray-400 font-mono uppercase">
                        {isAdminMode ? 'Management Log' : 'Customer Activity Feed'}
                      </span>
                      <button 
                        onClick={() => setShowNotificationPanel(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1 space-y-2 pt-2">
                      {filteredNotifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-500">
                          No active notifications.
                        </div>
                      ) : (
                        filteredNotifications.map((n) => (
                          <div key={n.id} className="relative rounded-lg bg-gray-50 p-2.5 text-xs transition-colors hover:bg-gray-100 text-left">
                            <button
                              onClick={() => dismissNotification(n.id)}
                              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="block font-bold text-gray-900 leading-snug pr-4">{n.title}</span>
                            <p className="mt-0.5 text-gray-600 leading-relaxed pr-4">{n.message}</p>
                            <span className="mt-1 block font-mono text-[9px] text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Account / Profile button */}
            <button
              onClick={() => { setIsAdminMode(false); setCurrentScreen('profile'); }}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl border p-2 text-sm font-semibold transition-all focus:outline-none ${
                currentScreen === 'profile' && !isAdminMode
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Update Profile / Track Orders"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline font-mono text-[11px] leading-none text-gray-500 hover:text-gray-900">
                {activeUser?.name.split(' ')[0] || 'Profile'}
              </span>
            </button>

            {/* Admin Switch Drawer */}
            <button
              id="admin-mode-toggle"
              onClick={toggleAdminMode}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all border focus:outline-none ${
                isAdminMode 
                  ? 'bg-zinc-900 text-amber-400 border-zinc-900 shadow-lg' 
                  : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-150'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>{isAdminMode ? 'Owner Panel' : 'Switch Owner'}</span>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
}
