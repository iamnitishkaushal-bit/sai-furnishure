import { useState, FormEvent } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { ArrowLeft, ShoppingCart, MessageSquare, Calendar, ShieldCheck, Truck, Check, Info, Box } from 'lucide-react';
import ProductVisualizer from './ProductVisualizer';

export default function ProductDetailModal() {
  const {
    products,
    categories,
    selectedProductId,
    setSelectedProductId,
    setCurrentScreen,
    addToCart,
    activeBusiness,
    submitEnquiry,
    createBooking,
    activeUser
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'info' | 'specs'>('info');

  // Multi-action modal controllers
  const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  // Form states
  const [enqName, setEnqName] = useState(activeUser?.name || '');
  const [enqPhone, setEnqPhone] = useState(activeUser?.phone || '');
  const [enqEmail, setEnqEmail] = useState(activeUser?.email || '');
  const [enqMessage, setEnqMessage] = useState('');
  const [enqSubmitted, setEnqSubmitted] = useState(false);

  const [bookName, setBookName] = useState(activeUser?.name || '');
  const [bookPhone, setBookPhone] = useState(activeUser?.phone || '');
  const [bookEmail, setBookEmail] = useState(activeUser?.email || '');
  const [bookDate, setBookDate] = useState('2026-06-25');
  const [bookTime, setBookTime] = useState('11:00 AM');
  const [bookNotes, setBookNotes] = useState('');
  const [bookSubmitted, setBookSubmitted] = useState(false);

  const [buySuccess, setBuySuccess] = useState(false);

  const product = products.find(p => p.id === selectedProductId);
  if (!product) {
    return (
      <div className="py-12 text-center text-sm font-medium text-gray-505">
        Product not found or configured incorrectly.
      </div>
    );
  }

  const categoryObj = categories.find(c => c.id === product.categoryId);
  const isOutOfStock = product.stock === 0;

  // Retrieve Related Products in same business unit
  const relatedProducts = products
    .filter(p => p.businessId === product.businessId && p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  const handleBack = () => {
    setSelectedProductId(null);
    setCurrentScreen('catalog');
  };

  const handleAddToCartDirect = () => {
    addToCart(product);
    setBuySuccess(true);
    setTimeout(() => setBuySuccess(false), 2000);
  };

  const handleInstantBuyNew = () => {
    addToCart(product);
    setCurrentScreen('cart');
  };

  const handleEnquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!enqName || !enqPhone || !enqMessage) {
      alert('Please fill the required fields to request quotes.');
      return;
    }
    submitEnquiry({ name: enqName, phone: enqPhone, email: enqEmail, message: enqMessage }, product.id);
    setEnqSubmitted(true);
    setTimeout(() => {
      setEnqSubmitted(false);
      setShowEnquiryDialog(false);
      setEnqMessage('');
    }, 2500);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookPhone || !bookDate || !bookTime) {
      alert('Please enter your contact details, date, and preferred time slots.');
      return;
    }
    createBooking({ name: bookName, phone: bookPhone, email: bookEmail, notes: bookNotes }, product.id, bookDate, bookTime);
    setBookSubmitted(true);
    setTimeout(() => {
      setBookSubmitted(false);
      setShowBookingDialog(false);
      setBookNotes('');
    }, 2550);
  };

  return (
    <div id="product-detail" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. Back button navigation */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-xs"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Catalog</span>
      </button>

      {/* 2. Core Grid: Image visualizer left & interactive controls right */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-xs">
        
        {/* Left Column: visual media layout */}
        <div className="space-y-4">
          <ProductVisualizer
            id={product.id}
            color={product.image}
            category={categoryObj?.name || ''}
            title={product.title}
            className="aspect-square w-full rounded-2xl shadow-sm"
            stock={product.stock}
          />
          
          {/* Quick trust assurances */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-2.5">
              <ShieldCheck className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <span className="block text-[9px] font-bold text-gray-700 font-mono">100% SECURE</span>
            </div>
            <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-2.5">
              <Truck className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <span className="block text-[9px] font-bold text-gray-700 font-mono">SUPER LOGISTICS</span>
            </div>
            <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-2.5">
              <Box className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <span className="block text-[9px] font-bold text-gray-700 font-mono">GST COMPLIANT</span>
            </div>
          </div>
        </div>

        {/* Right Column: details & pricing & smart action triggers */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded bg-gray-100 px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-gray-500 uppercase font-mono">
                  {categoryObj?.name} | {product.SKU}
                </span>
                
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  product.stock === 0 
                    ? 'bg-red-100 text-red-800' 
                    : product.stock <= 10 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? 'Running Low' : 'In Stock'}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {product.title}
              </h1>
            </div>

            {/* Pricing Panel */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <span className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Direct Merchant Price</span>
              <div className="mt-1 flex items-baseline gap-2">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-extrabold text-amber-600 font-mono">₹{product.salePrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-gray-400 line-through font-mono">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="rounded bg-amber-100/70 px-2 py-0.5 text-[10px] font-bold text-amber-900 font-mono">
                      SAVE {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-extrabold text-gray-950 font-mono">₹{product.price.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-gray-500 leading-normal">
                Standard local delivery rates apply. Dynamic taxes estimated on checkout screen.
              </p>
            </div>

            {/* Micro Tab selector */}
            <div className="border-b border-gray-200">
              <div className="flex gap-6 -mb-px">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all ${
                    activeTab === 'info' ? 'border-amber-500 text-gray-950' : 'border-transparent text-gray-400'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all ${
                    activeTab === 'specs' ? 'border-amber-500 text-gray-950' : 'border-transparent text-gray-400'
                  }`}
                >
                  Specifications
                </button>
              </div>
            </div>

            {/* Tab content rendering */}
            <div className="min-h-[100px]">
              {activeTab === 'info' ? (
                <div className="text-xs text-gray-600 leading-relaxed space-y-3">
                  <p>{product.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-500 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-150 text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-transparent'}>
                          <td className="px-4 py-2 border-b border-gray-150 font-bold text-gray-800 uppercase font-mono text-[10px] tracking-wider w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-150 text-gray-600">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Core Action triggers mapping exactly to allowedActions */}
          <div className="space-y-2.5 pt-4 border-t border-gray-100">
            <legend className="text-[10px] font-bold text-gray-400 font-mono uppercase mb-2">Configure Action</legend>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Buy Action */}
              {product.allowedActions.includes('buy') && (
                <>
                  <button
                    onClick={handleAddToCartDirect}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-xs font-bold text-gray-900 transition-all hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {buySuccess ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
                        <span className="text-emerald-700">Added securely!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                        <span>Add To Shopping Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleInstantBuyNew}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white transition-all disabled:bg-gray-300 disabled:text-gray-500"
                    style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : activeBusiness.accentColor }}
                  >
                    Buy Securely Now
                  </button>
                </>
              )}

              {/* Submit Enquiry Action */}
              {product.allowedActions.includes('enquire') && (
                <button
                  onClick={() => setShowEnquiryDialog(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-400/80 bg-sky-50/10 py-3 text-xs font-bold text-sky-850 transition-all hover:bg-sky-50/40"
                >
                  <MessageSquare className="h-4 w-4 text-sky-700" />
                  <span>Submit Custom Enquiry</span>
                </button>
              )}

              {/* Calendar Booking Action */}
              {product.allowedActions.includes('book') && (
                <button
                  onClick={() => setShowBookingDialog(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/10 py-3 text-xs font-bold text-amber-850 transition-all hover:bg-amber-50/40"
                >
                  <Calendar className="h-4 w-4 text-amber-700" />
                  <span>Schedule Demo / Service</span>
                </button>
              )}
            </div>

            {isOutOfStock && product.allowedActions.includes('buy') && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-[11px] font-medium text-red-700 border border-red-100">
                <Info className="h-4 w-4 shrink-0" />
                <span>We are temporarily out of stock for this, but you can post custom inquiries as alternative action.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Related Products Column Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Vetted Alternatives under {activeBusiness.name}</h2>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProductId(p.id);
                  setActiveTab('info');
                }}
                className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-255 cursor-pointer hover:border-amber-300 transition-all"
              >
                <ProductVisualizer id={p.id} color={p.image} category={categoryObj?.name || ''} title={p.title} className="h-14 w-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-gray-900 text-xs truncate">{p.title}</span>
                  <span className="block font-mono font-medium text-[11px] text-amber-600">
                    ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Enquiry Custom Portal Dialog modal */}
      {showEnquiryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-950">Submit Custom Enquiry</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your enquiry will lock against {product.title} under {activeBusiness.name}.</p>

            {enqSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Enquiry Logged!</h4>
                <p className="text-xs text-gray-500">The merchant has been alerted directly. Returning shortly...</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="mt-4 space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="enq-fullname" className="text-xs font-semibold text-gray-700">Full Name *</label>
                  <input
                    id="enq-fullname"
                    type="text"
                    required
                    value={enqName}
                    onChange={(e) => setEnqName(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="enq-phone" className="text-xs font-semibold text-gray-700">Phone Code *</label>
                    <input
                      id="enq-phone"
                      type="tel"
                      required
                      value={enqPhone}
                      onChange={(e) => setEnqPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="enq-email" className="text-xs font-semibold text-gray-700">Email Address</label>
                    <input
                      id="enq-email"
                      type="email"
                      value={enqEmail}
                      onChange={(e) => setEnqEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="enq-message" className="text-xs font-semibold text-gray-700">Enquiry Details / Message *</label>
                  <textarea
                    id="enq-message"
                    required
                    rows={3}
                    placeholder="Enter specs, bulk query notes, custom installation parameters..."
                    value={enqMessage}
                    onChange={(e) => setEnqMessage(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryDialog(false)}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-650 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all"
                    style={{ backgroundColor: activeBusiness.accentColor }}
                  >
                    Forward Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Booking Custom Portal Scheduler modal */}
      {showBookingDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-950">Schedule Demo / Service Visit</h3>
            <p className="text-xs text-gray-500 mt-0.5">Book dedicated assistance and operations setup for {product.title}.</p>

            {bookSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Appointment Registered!</h4>
                <p className="text-xs text-gray-500">Subject to approval. A notification has logged under your profile.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="book-date" className="text-xs font-semibold text-gray-700">Proposed Date *</label>
                    <input
                      id="book-date"
                      type="date"
                      required
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="book-time" className="text-xs font-semibold text-gray-700">Proposed Slot *</label>
                    <select
                      id="book-time"
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                      <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="book-name" className="text-xs font-semibold text-gray-700">Contact Person Name *</label>
                  <input
                    id="book-name"
                    type="text"
                    required
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="book-phone" className="text-xs font-semibold text-gray-700">Contact Phone *</label>
                    <input
                      id="book-phone"
                      type="tel"
                      required
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="book-email" className="text-xs font-semibold text-gray-700">Email Address</label>
                    <input
                      id="book-email"
                      type="email"
                      value={bookEmail}
                      onChange={(e) => setBookEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="book-notes" className="text-xs font-semibold text-gray-700">Special Instructions / Location details</label>
                  <textarea
                    id="book-notes"
                    rows={2}
                    placeholder="Enter site access rules, gate pins, custom system configuration specs..."
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowBookingDialog(false)}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-650 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all"
                    style={{ backgroundColor: activeBusiness.accentColor }}
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
