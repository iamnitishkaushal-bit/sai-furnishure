import { useState, FormEvent } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { User, ClipboardList, Calendar, MessageSquare, MapPin, Phone, Mail, CheckCircle, ChevronRight, Edit2, Truck } from 'lucide-react';
import OrderShipmentTracker from './OrderShipmentTracker';

export default function UserDashboard() {
  const {
    activeUser,
    updateActiveProfile,
    orders,
    bookings,
    enquiries,
    businesses
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'enquiries' | 'profile'>('orders');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);

  // Input editing states
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(activeUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(activeUser?.phone || '');
  const [profileEmail, setProfileEmail] = useState(activeUser?.email || '');
  const [profileAddress, setProfileAddress] = useState(activeUser?.address || '');

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    updateActiveProfile({
      name: profileName,
      phone: profilePhone,
      email: profileEmail,
      address: profileAddress
    });
    setIsEditing(false);
  };

  // Status visual steps mapping
  const getOrderStatusStep = (status: string) => {
    const steps = ['Pending', 'Confirmed', 'Processing', 'Ready', 'Shipped', 'Delivered'];
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx + 1;
  };

  const getBookingStatusStep = (status: string) => {
    const steps = ['Requested', 'Approved', 'Scheduled', 'Completed'];
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx + 1;
  };

  return (
    <div id="customer-profile-dashboard" className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-6 animate-in fade-in duration-200">
      
      {/* Upper account greetings banner */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4 text-left w-full sm:w-auto">
          <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-lg">
            {activeUser?.name.split(' ').map(n => n[0]).join('') || 'CU'}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Registered Customer Suite</h1>
            <p className="text-xs text-gray-500 font-mono">CLIENT COORD: {activeUser?.email}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-between sm:justify-start gap-1">
          {[
            { id: 'orders', label: 'My Orders', icon: <ClipboardList className="h-4 w-4" /> },
            { id: 'bookings', label: 'Bookings', icon: <Calendar className="h-4 w-4" /> },
            { id: 'enquiries', label: 'Enquiries', icon: <MessageSquare className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedTrackingOrderId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Account Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Left Profile Mini Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-gray-400 font-mono uppercase pb-2 border-b border-gray-100">
              Account Attributes
            </h2>

            <div className="space-y-3.5 text-xs text-gray-650">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-900">{activeUser?.name}</span>
                  <span className="text-[10px] text-gray-400">Personal Name</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-900 font-mono">{activeUser?.phone}</span>
                  <span className="text-[10px] text-gray-400">Mobile Phone</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-900 font-mono">{activeUser?.email}</span>
                  <span className="text-[10px] text-gray-400">Invoice Mailbox</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-900">{activeUser?.address}</span>
                  <span className="text-[10px] text-gray-400">Default Site Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Content Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tab 1: Orders list & Stepper tracker */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {selectedTrackingOrderId && orders.find(o => o.id === selectedTrackingOrderId) ? (
                (() => {
                  const orderToTrack = orders.find(o => o.id === selectedTrackingOrderId)!;
                  const biz = businesses.find(b => b.id === orderToTrack.businessId) || businesses[0];
                  return (
                    <OrderShipmentTracker 
                      order={orderToTrack} 
                      business={biz} 
                      onBack={() => setSelectedTrackingOrderId(null)} 
                    />
                  );
                })()
              ) : (
                <>
                  <div className="flex justify-between items-center pb-2">
                    <h2 className="text-lg font-bold text-gray-950 tracking-tight">Orders History & Real-Time Trackers</h2>
                    <p className="text-xs text-zinc-500 font-medium">Click "Track Live Shipping" to pull real-time partner waybills.</p>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-3xl space-y-2">
                      <ClipboardList className="h-10 w-10 text-gray-300 mx-auto" />
                      <h3 className="text-sm font-bold text-gray-900">No Orders Placed Yet</h3>
                      <p className="text-xs text-gray-500">Go to catalog grids to checkout. Orders will log immediately here.</p>
                    </div>
                  ) : (
                    orders.map((o) => {
                      const currentBiz = businesses.find(b => b.id === o.businessId);
                      const activeStep = getOrderStatusStep(o.orderStatus);
                      const isCancelled = o.orderStatus === 'Cancelled';

                      return (
                        <div key={o.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
                          {/* Meta header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span 
                                className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider font-mono shadow-xs"
                                style={{ backgroundColor: currentBiz?.accentColor }}
                              >
                                {currentBiz?.name}
                              </span>
                              <span className="font-mono text-xs font-bold text-gray-800 uppercase">
                                SKU #{o.id.substring(6).toUpperCase()}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono font-medium text-gray-400">
                              {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Items details */}
                          <div className="space-y-2">
                            {o.items.map((sub, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs text-gray-650">
                                <span>{sub.productTitle} <span className="text-[10px] font-mono text-gray-400">x{sub.quantity}</span></span>
                                <span className="font-mono font-bold text-gray-900">₹{(sub.quantity * sub.price).toLocaleString('en-IN')}</span>
                              </div>
                            ))}

                            <div className="border-t border-dashed border-gray-100 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="text-gray-500">Method: <span className="font-mono font-bold text-gray-800">{o.paymentMethod}</span> ({o.paymentStatus})</span>
                              
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                <button
                                  onClick={() => setSelectedTrackingOrderId(o.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-250 bg-white font-black text-[10px] text-gray-700 tracking-wider uppercase hover:bg-gray-50 transition-all cursor-pointer shadow-xs active:scale-97"
                                >
                                  <Truck className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                                  <span>Track Live Shipping</span>
                                </button>
                                <span className="text-sm font-extrabold text-amber-600 font-mono">₹{o.total.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Visual Progress Stepper bar for orders */}
                          {isCancelled ? (
                            <div className="rounded-xl bg-red-50 p-3 flex items-center gap-2 border border-red-150 text-red-800 text-xs font-semibold">
                              <span>This order was cancelled by the merchant. Please contact support.</span>
                            </div>
                          ) : (
                            <div className="pt-2">
                              <span className="block text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider mb-2">DYNAMIC PIPELINE PATHWAY</span>
                              
                              <div className="grid grid-cols-6 gap-1 text-center font-mono">
                                {['Pending', 'Confirmed', 'Processing', 'Ready', 'Shipped', 'Delivered'].map((step, idx) => {
                                  const passed = activeStep > idx;
                                  const current = activeStep === idx + 1;
                                  return (
                                    <div key={idx} className="space-y-1.5">
                                      <div className={`h-2 rounded-full transition-all ${
                                        current 
                                          ? 'bg-amber-500 ring-2 ring-amber-500/20' 
                                          : passed 
                                            ? 'bg-emerald-500' 
                                            : 'bg-gray-150'
                                      }`} />
                                      <span className={`hidden sm:block text-[8px] font-bold tracking-tighter ${
                                        current 
                                          ? 'text-amber-800 font-extrabold scale-105' 
                                          : passed 
                                            ? 'text-emerald-700' 
                                            : 'text-gray-300'
                                      }`}>
                                        {step}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab 2: Bookable schedules */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-950 tracking-tight">Active Appointments & Machinery Demos</h2>

              {bookings.length === 0 ? (
                <div className="bg-white border text-center p-12 rounded-3xl space-y-2">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-900">No Services Booked</h3>
                  <p className="text-xs text-gray-500">Equipment like Rotavators, Sprayers, TV Installations support live bookings.</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const isCancelled = b.status === 'Cancelled';
                  const isCompleted = b.status === 'Completed';

                  return (
                    <div key={b.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-left min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isCancelled 
                              ? 'bg-red-100 text-red-800' 
                              : isCompleted 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-widest">APPT #{b.id.substring(5).toUpperCase()}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm truncate">{b.productTitle}</h3>
                        <p className="text-xs text-gray-500 leading-normal">{b.notes || 'No custom instruction logs added.'}</p>
                      </div>

                      <div className="flex items-center gap-3 sm:text-right shrink-0 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right text-xs">
                          <span className="block font-bold text-gray-900">{b.date}</span>
                          <span className="block font-mono text-[10px] font-medium text-gray-400 uppercase">{b.time} Slot</span>
                        </div>
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xl" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 3: Enquiries logs */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-950 tracking-tight">Enterprise Enquiries & Quotation Logs</h2>

              {enquiries.length === 0 ? (
                <div className="bg-white border text-center p-12 rounded-3xl space-y-2">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-900">No Custom Enquiries Made</h3>
                  <p className="text-xs text-gray-500">Ask bulk pricing or technical advice direct to operators on detail sheets.</p>
                </div>
              ) : (
                enquiries.map((e) => {
                  return (
                    <div key={e.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-800 font-mono tracking-widest uppercase">
                            {e.status}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">CASE #{e.id.substring(4).toUpperCase()}</span>
                        </div>
                        <span className="font-mono font-medium text-[10px] text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-650 text-left">
                        {e.productTitle && (
                          <span className="block font-bold text-gray-900">Ref Product: {e.productTitle}</span>
                        )}
                        <p className="rounded-xl bg-gray-50/50 border border-gray-100 p-3 italic">
                          "{e.message}"
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 4: Profile config form */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-400 font-mono uppercase">Profile Settings</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Change Profile Card</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label htmlFor="prof-name" className="text-xs font-semibold text-gray-700">Full Name *</label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="prof-phone" className="text-xs font-semibold text-gray-700">Phone Code *</label>
                      <input
                        id="prof-phone"
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="prof-email" className="text-xs font-semibold text-gray-700">Email Address (Invoicing) *</label>
                      <input
                        id="prof-email"
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="prof-address" className="text-xs font-semibold text-gray-700">Postal Farm Coordinate Address *</label>
                    <input
                      id="prof-address"
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-650 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-all"
                    >
                      Commit Updates
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5 text-xs text-gray-650 leading-relaxed">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block font-bold text-gray-400 font-mono text-[9px] uppercase">Corporate Name</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{activeUser?.name}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-400 font-mono text-[9px] uppercase">Contact Number</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5 font-mono">{activeUser?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <span className="block font-bold text-gray-400 font-mono text-[9px] uppercase">Verified Email (Invoicing logs)</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5 font-mono">{activeUser?.email}</p>
                  </div>

                  <div>
                    <span className="block font-bold text-gray-400 font-mono text-[9px] uppercase">Postal Coordinate Location</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{activeUser?.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
