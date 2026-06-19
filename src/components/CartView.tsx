import { useState, FormEvent } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { ShoppingBag, X, Trash2, ShieldCheck, CreditCard, ChevronRight, CheckCircle, Smartphone, Truck, Info, ArrowLeft } from 'lucide-react';
import ProductVisualizer from './ProductVisualizer';
import { imageLibrary } from '../config/imageLibrary';

export default function CartView() {
  const {
    activeBusiness,
    businesses,
    setActiveBusinessId,
    carts,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    activeUser
  } = usePlatform();

  // Active business cart properties
  const activeCartItems = carts[activeBusiness.id] || [];
  
  // Track other businesses containing items to show nice alert
  const otherBusinessesWithCartItems = businesses.filter(b => b.id !== activeBusiness.id && (carts[b.id] || []).length > 0);

  // Flow State
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'completed'>('cart');
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);

  // Checkout Form states
  const [name, setName] = useState(activeUser?.name || '');
  const [phone, setPhone] = useState(activeUser?.phone || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [address, setAddress] = useState(activeUser?.address || '');
  const [city, setCity] = useState('Ahmedabad');
  const [postalCode, setPostalCode] = useState('380015');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Razorpay' | 'COD' | 'Advance Payment'>('UPI');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Cart financial summaries
  const subtotal = activeCartItems.reduce((acc, item) => {
    const prc = item.product.salePrice || item.product.price;
    return acc + (prc * item.quantity);
  }, 0);

  const tax = Math.round(subtotal * 0.18); // Simulated 18% GST/Tax
  const delivery = subtotal === 0 ? 0 : subtotal > 1500 ? 0 : 150; // free delivery over ₹1500
  const total = subtotal + tax + delivery;

  const handleSwitchBusinessCart = (bId: string) => {
    setActiveBusinessId(bId);
    setCheckoutStep('cart');
  };

  const handleQuantityChange = (prodId: string, currentQty: number, offset: number) => {
    updateCartQuantity(activeBusiness.id, prodId, currentQty + offset);
  };

  const handleProceedToDetails = () => {
    if (activeCartItems.length === 0) return;
    setCheckoutStep('details');
  };

  const handleProceedToPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !postalCode) {
      alert('Please fill out all delivery and coordinate fields.');
      return;
    }
    setCheckoutStep('payment');
  };

  const handleFinalizePayment = () => {
    setPaymentProcessing(true);

    // Simulate short bank/payment gateways latency
    setTimeout(() => {
      const generatedOrder = placeOrder(
        { name, phone, email, address, city, postalCode },
        paymentMethod
      );
      setPaymentProcessing(false);
      if (generatedOrder) {
        setPlacedOrderInfo(generatedOrder);
        setCheckoutStep('completed');
      }
    }, 1800);
  };

  // Rendering screens based on step
  if (checkoutStep === 'completed' && placedOrderInfo) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-350">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Confirmed Successfully!</h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            INVOICE SKU: #{placedOrderInfo.id.substring(6).toUpperCase()}
          </p>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Thank you for ordering, <span className="font-bold text-gray-900">{placedOrderInfo.customerName}</span>. 
            We logged your booking under <span className="font-bold text-gray-900">{activeBusiness.name}</span> database. 
            Your transaction identifier is securely cached.
          </p>
        </div>

        {/* Invoice Grid Details */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 text-left text-xs space-y-3.5 shadow-xs">
          <span className="block font-bold text-gray-400 font-mono uppercase tracking-widest text-[10px]">Invoice Summary</span>
          
          <div className="space-y-2 divide-y divide-gray-100">
            {placedOrderInfo.items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <div>
                  <span className="font-bold text-gray-900 block">{it.productTitle}</span>
                  <span className="text-gray-500 text-[10px] font-mono">Qty: {it.quantity} x ₹{it.price.toLocaleString('en-IN')}</span>
                </div>
                <span className="font-mono font-bold text-gray-950">₹{(it.quantity * it.price).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-155 pt-3 space-y-1.5 text-gray-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">₹{placedOrderInfo.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST / Taxes (18%):</span>
              <span className="font-mono">₹{placedOrderInfo.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-mono">{placedOrderInfo.delivery === 0 ? 'FREE' : `₹${placedOrderInfo.delivery}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2.5">
              <span>Grand Total:</span>
              <span className="font-mono text-amber-600">₹{placedOrderInfo.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCheckoutStep('cart');
            setPlacedOrderInfo(null);
          }}
          className="w-full rounded-2xl bg-gray-900 py-3 text-xs font-bold text-white transition-all hover:bg-gray-800"
        >
          Explore More Products
        </button>
      </div>
    );
  }

  return (
    <div id="cart-workspace" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Title with status step indicator */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {checkoutStep === 'cart' ? `${activeBusiness.name} Cart` : checkoutStep === 'details' ? 'Delivery coordinates' : 'Payment Portal'}
          </h1>
          <p className="text-xs text-secondary/60 mt-0.5">
            {checkoutStep === 'cart' ? 'Manage selected items before final compilation' : checkoutStep === 'details' ? 'Provide contact and postal address details' : 'Pay via simulated gateways'}
          </p>
        </div>

        {/* Dynamic Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold">
          <span className={checkoutStep === 'cart' ? 'text-amber-600' : 'text-gray-400'}>1. CART</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className={checkoutStep === 'details' ? 'text-amber-600' : 'text-gray-400'}>2. DETAILS</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className={checkoutStep === 'payment' ? 'text-amber-600' : 'text-gray-400'}>3. PAYMENT</span>
        </div>
      </div>

      {/* Cross business Cart alert notification block */}
      {otherBusinessesWithCartItems.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/10 p-3.5">
          <div className="flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cross-Business Cart Separator:</span>
              <p className="text-gray-600 mt-0.5">
                You currently have products inside other business carts. Carts are kept separate to prevent mixing Agro and Electro products in a single order!
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {otherBusinessesWithCartItems.map(b => (
              <button
                key={b.id}
                onClick={() => handleSwitchBusinessCart(b.id)}
                className="shrink-0 rounded-xl bg-amber-100/60 hover:bg-amber-100 text-amber-950 px-3 py-1.5 text-[11px] font-bold transition-all shadow-xs border border-amber-200/50"
              >
                Go to {b.name} Cart
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main workspace splits: Left item lists, Right total panel */}
      {activeCartItems.length === 0 && checkoutStep === 'cart' ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center space-y-4">
          <img 
            src={imageLibrary.placeholders.general} 
            alt="Empty Cart" 
            className="h-28 w-28 rounded-2xl object-cover mx-auto shadow-sm opacity-85 border border-gray-100" 
          />
          <h2 className="text-lg font-bold text-gray-900">Your {activeBusiness.name} cart is empty</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse our seeds, machinery, or components catalog inside {activeBusiness.name} to compile orders!
          </p>
          <button
            onClick={() => handleSwitchBusinessCart(activeBusiness.id)}
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all"
            style={{ backgroundColor: activeBusiness.accentColor }}
          >
            Start Shopping Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Side Workflow Area */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: Cart Items Manager */}
            {checkoutStep === 'cart' && (
              <div className="space-y-3 bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-2">
                  <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">Products listed ({activeCartItems.length})</span>
                  <button
                    onClick={() => clearCart(activeBusiness.id)}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y divide-gray-150 space-y-2">
                  {activeCartItems.map((item, idx) => {
                    const exactPrice = item.product.salePrice || item.product.price;
                    return (
                      <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 first:pt-0 border-b last:border-0 border-gray-100">
                        <div className="flex items-center gap-3">
                          <ProductVisualizer id={item.product.id} color={item.product.image} category={item.product.categoryId} title={item.product.title} className="h-14 w-14 shrink-0" />
                          <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 text-sm truncate">{item.product.title}</h2>
                            <span className="block font-mono text-[9px] text-gray-400 mt-0.5">{item.product.SKU}</span>
                            <span className="block font-mono font-medium text-[11px] text-amber-600 mt-0.5">
                              ₹{exactPrice.toLocaleString('en-IN')} each
                            </span>
                          </div>
                        </div>

                        {/* Quantity control updates */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-gray-50/50 pt-2.5 sm:pt-0">
                          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1.5 bg-gray-50/50">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center font-bold text-gray-700 hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity, 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="h-6 w-6 rounded flex items-center justify-center font-bold text-gray-750 hover:bg-gray-200 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="block font-mono text-sm font-bold text-gray-950">
                              ₹{(exactPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => removeFromCart(activeBusiness.id, item.product.id)}
                              className="text-[10px] font-bold text-red-650 hover:underline mt-0.5 block"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Customer Coordinates Form */}
            {checkoutStep === 'details' && (
              <bg-white className="block bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-900 hover:underline font-bold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to items list</span>
                </button>

                <h2 className="text-sm font-bold text-gray-400 font-mono uppercase border-b border-gray-100 pb-2">
                  Delivery Coordinates
                </h2>

                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="chk-name" className="text-xs font-bold text-gray-700">Full Name *</label>
                      <input
                        id="chk-name"
                        type="text"
                        required
                        placeholder="Ramesh Patel"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="chk-phone" className="text-xs font-bold text-gray-700">Primary Phone *</label>
                      <input
                        id="chk-phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="chk-email" className="text-xs font-bold text-gray-700">Email Address (for Invoices)</label>
                    <input
                      id="chk-email"
                      type="email"
                      placeholder="ramesh.patel@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="chk-address" className="text-xs font-bold text-gray-700">Plot No / Farm Coordinates Address *</label>
                    <input
                      id="chk-address"
                      type="text"
                      required
                      placeholder="Plot No. 42, Green Farms Colony, Sector-5"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="chk-city" className="text-xs font-bold text-gray-700">City / District *</label>
                      <input
                        id="chk-city"
                        type="text"
                        required
                        placeholder="Ahmedabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="chk-postal" className="text-xs font-bold text-gray-700">Postal Pin Code *</label>
                      <input
                        id="chk-postal"
                        type="text"
                        required
                        placeholder="380015"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl py-3 text-xs font-bold text-white transition-all shadow-md"
                    style={{ backgroundColor: activeBusiness.accentColor }}
                  >
                    Proceed to Simulated Payment Gateway
                  </button>
                </form>
              </bg-white>
            )}

            {/* Step 3: Payment Gateway Selector */}
            {checkoutStep === 'payment' && (
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-900 hover:underline font-bold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to coordinates</span>
                </button>

                <h2 className="text-sm font-bold text-gray-400 font-mono uppercase border-b border-gray-100 pb-2">
                  Choose payment interface
                </h2>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  {[
                    { id: 'UPI', desc: 'UPI Unified Scanner', icon: <Smartphone className="h-4.5 w-4.5" /> },
                    { id: 'Razorpay', desc: 'Secure Credit/Debit Card', icon: <CreditCard className="h-4.5 w-4.5" /> },
                    { id: 'COD', desc: 'Cash on Delivery (Standard)', icon: <Truck className="h-4.5 w-4.5" /> },
                    { id: 'Advance Payment', desc: 'Advance 50% Partial', icon: <ShieldCheck className="h-4.5 w-4.5" /> },
                  ].map((m) => {
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        type="button"
                        className={`flex flex-col p-3 rounded-2xl border text-left gap-1.5 transition-all outline-none ${
                          active
                            ? 'border-amber-500 bg-amber-50/15 ring-2 ring-amber-500/20'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={active ? 'text-amber-900' : 'text-gray-500'}>{m.icon}</span>
                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center p-1 ${
                            active ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                          }`}>
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <span className="block text-xs font-bold text-gray-900 leading-snug">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Payment Area Visuals */}
                <div className="rounded-2xl border border-gray-150 bg-gray-50/50 p-4 min-h-[140px] flex flex-col justify-center items-center text-center">
                  {paymentProcessing ? (
                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto" />
                      <span className="block text-xs font-bold text-gray-700">Resolving Bank APIs...</span>
                      <p className="text-[10px] text-gray-400">Locking stock allocations from inventory columns</p>
                    </div>
                  ) : (
                    <>
                      {paymentMethod === 'UPI' && (
                        <div className="space-y-3 p-2">
                          <div className="bg-white p-3.5 border border-dashed rounded-xl inline-block mx-auto shadow-sm">
                            {/* Visual QR simulation */}
                            <div className="h-28 w-28 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-[10px] font-mono leading-tight">
                              [ QR SCANNER ]
                              <br />
                              BHIM / GPay
                            </div>
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-gray-900">Scan to complete UPI Transaction</span>
                            <span className="block font-mono text-[10px] text-gray-400 mt-0.5">PAYEE: PAY@AGROMARTELECTROHUB</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'Razorpay' && (
                        <div className="w-full max-w-sm space-y-3.5 p-2">
                          <span className="rounded bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-800 font-mono tracking-wide uppercase">
                            RAZORPAY GATEWAY PREVIEW
                          </span>
                          
                          <div className="space-y-2 text-left">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-gray-400 font-mono uppercase">Cardholder details</span>
                              <div className="rounded-lg border bg-white p-2 text-xs font-mono select-none">
                                **** **** **** 8274 | EXP 11/29
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'COD' && (
                        <div className="space-y-2.5 max-w-sm">
                          <span className="block text-xs font-bold text-gray-900 leading-snug">
                            No immediate advances requested!
                          </span>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Confirm order now. Our logistics manager will phone you to confirm delivery timings. Produce ₹{total.toLocaleString('en-IN')} cash or ask barcode upon payload acceptance.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'Advance Payment' && (
                        <div className="space-y-2 max-w-sm">
                          <span className="block text-xs font-bold text-gray-900">
                            Split Financing Protocol
                          </span>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Pay ₹{(total / 2).toLocaleString('en-IN')} (50% partial advance) now via UPI/Card to kickstart bulk loading, pay the remaining ₹{(total / 2).toLocaleString('en-IN')} upon delivery. Ideal for heavy sprayers and rotavators.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!paymentProcessing && (
                  <button
                    onClick={handleFinalizePayment}
                    className="w-full rounded-2xl py-3 text-xs font-bold text-white transition-all shadow-md"
                    style={{ backgroundColor: activeBusiness.accentColor }}
                  >
                    Authorize Payment (₹{total.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Right Calculation sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4 h-fit">
              <h2 className="text-xs font-bold text-gray-400 font-mono uppercase pb-2 border-b border-gray-100">
                Invoice Breakdown
              </h2>

              <div className="space-y-2.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal ({activeCartItems.length} styles):</span>
                  <span className="font-mono text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST + CGST (18%):</span>
                  <span className="font-mono text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-mono text-gray-900">
                    {delivery === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE over ₹1500</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>

                {delivery > 0 && (
                  <div className="rounded-lg bg-gray-50 p-2.5 text-[10px] text-gray-500 leading-relaxed">
                    Add ₹{(1500 - subtotal).toLocaleString('en-IN')} more values of items inside {activeBusiness.name} cart to bypass ₹150 delivery fees!
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-gray-950 border-t border-gray-100 pt-3">
                  <span>Estimate Total:</span>
                  <span className="font-mono text-amber-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                <button
                  onClick={handleProceedToDetails}
                  className="w-full flex items-center justify-center gap-1 rounded-2xl py-3 text-xs font-bold text-white transition-all"
                  style={{ backgroundColor: activeBusiness.accentColor }}
                >
                  <span>Authorize Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
