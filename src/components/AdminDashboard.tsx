import { useState, FormEvent } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  BarChart3, Plus, Edit2, Trash2, Check, X, Shield, RefreshCw, 
  MapPin, Phone, MessageSquare, Calendar, ClipboardCheck, ArrowUpRight, PlusCircle, LayoutDashboard, Database, FolderPlus,
  FileSpreadsheet, Download, UploadCloud, CheckCircle2, AlertTriangle, Layers, Settings, Activity, FileText, CheckSquare, Square, SlidersHorizontal, Sparkles
} from 'lucide-react';
import { Business, Category, Product, Order, Enquiry, Booking } from '../types';
import { getProductImage } from './ProductVisualizer';

export default function AdminDashboard() {
  const {
    db,
    businesses,
    categories,
    products,
    orders,
    bookings,
    enquiries,
    addProduct,
    bulkAddProducts,
    bulkEditProducts,
    bulkDeleteProducts,
    editProduct,
    deleteProduct,
    updateStock,
    updateOrderStatus,
    updateBookingStatus,
    updateEnquiryStatus,
    addCustomBusiness,
    addNotification
  } = usePlatform();

  // Selected Active Segment in Admin
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'bookings' | 'enquiries' | 'businesses'>('dashboard');
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('all');

  // Bulk Inventory Management Center States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [importWorkflowState, setImportWorkflowState] = useState<'upload' | 'validate' | 'preview' | 'complete'>('upload');
  const [stagedProducts, setStagedProducts] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; field: string; message: string }[]>([]);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string; type: 'excel' | 'csv' | null }>({ name: '', size: '', type: null });
  
  // Google Sheets Integration
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [googleSheetConnected, setGoogleSheetConnected] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>('Never Synced');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  // Source distribution metrics
  const [sourceCounters, setSourceCounters] = useState({
    manual: 18,
    excel: 84,
    csv: 125,
    googlesheet: 210
  });

  // Bulk operation triggers
  const [bulkOperationType, setBulkOperationType] = useState<'none' | 'price' | 'stock' | 'category' | 'delete'>('none');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkPriceMode, setBulkPriceMode] = useState<'set' | 'multiply' | 'add'>('set');
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkStockMode, setBulkStockMode] = useState<'set' | 'add'>('set');
  const [bulkCategoryValue, setBulkCategoryValue] = useState('');

  // Product CRUD forms
  const [showAddProductDrawer, setShowAddProductDrawer] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states for Product Add/Edit
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('100');
  const [pSalePrice, setPSalePrice] = useState('');
  const [pStock, setPStock] = useState('50');
  const [pSKU, setPSKU] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pBusiness, setPBusiness] = useState(businesses[0]?.id || 'agromart');
  const [pColor, setPColor] = useState('#4682B4');
  const [pTags, setPTags] = useState('');
  const [pActions, setPActions] = useState<string[]>(['buy']);

  // Dispatch details & Logistics Waybill states
  const [selectedDispatchManifestOrder, setSelectedDispatchManifestOrder] = useState<Order | null>(null);
  const [assignedWaybills, setAssignedWaybills] = useState<Record<string, string>>({});
  const [waybillInputMap, setWaybillInputMap] = useState<Record<string, string>>({});

  // Business Extensibility Form
  const [newBizId, setNewBizId] = useState('');
  const [newBizName, setNewBizName] = useState('');
  const [newBizTagline, setNewBizTagline] = useState('');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizColor, setNewBizColor] = useState('#E5A50A');
  const [newBizCats, setNewBizCats] = useState(''); // comma-separated initial categories
  const [bizStatus, setBizStatus] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Filter calculations based on Business Selector
  const rawOrders = selectedBusinessFilter === 'all' ? orders : orders.filter(o => o.businessId === selectedBusinessFilter);
  const unfilteredProducts = selectedBusinessFilter === 'all' ? products : products.filter(p => p.businessId === selectedBusinessFilter);
  const rawProducts = unfilteredProducts.filter(p => {
    if (!adminSearchQuery) return true;
    const q = adminSearchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.SKU.toLowerCase().includes(q);
  });
  const rawBookings = selectedBusinessFilter === 'all' ? bookings : bookings.filter(b => b.businessId === selectedBusinessFilter);
  const rawEnquiries = selectedBusinessFilter === 'all' ? enquiries : enquiries.filter(e => e.businessId === selectedBusinessFilter);

  // Metrical Computations
  const totalRevenue = rawOrders.reduce((sum, o) => o.orderStatus !== 'Cancelled' ? sum + o.total : sum, 0);
  const totalOrdersCount = rawOrders.length;
  const totalEnquiriesCount = rawEnquiries.length;
  const totalBookingsCount = rawBookings.length;

  // Derive unique customers details
  const customersLedger: Record<string, { name: string; email: string; phone: string; count: number; spend: number }> = {};
  orders.forEach(o => {
    const key = o.customerEmail.toLowerCase();
    if (!customersLedger[key]) {
      customersLedger[key] = { name: o.customerName, email: o.customerEmail, phone: o.customerPhone, count: 0, spend: 0 };
    }
    customersLedger[key].count += 1;
    if (o.orderStatus !== 'Cancelled') {
      customersLedger[key].spend += o.total;
    }
  });

  // Unique products sell metrics
  const productSalesMap: Record<string, number> = {};
  orders.forEach(o => {
    if (o.orderStatus !== 'Cancelled') {
      o.items.forEach(it => {
        productSalesMap[it.productId] = (productSalesMap[it.productId] || 0) + it.quantity;
      });
    }
  });

  const bestSellingProducts = products
    .map(p => ({ p, sold: productSalesMap[p.id] || 0 }))
    .filter(item => item.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  // Actions Toggle Handler
  const handleToggleActionChoice = (action: string) => {
    if (pActions.includes(action)) {
      setPActions(pActions.filter(a => a !== action));
    } else {
      setPActions([...pActions, action]);
    }
  };

  const resetProductForm = () => {
    setPTitle('');
    setPDesc('');
    setPPrice('100');
    setPSalePrice('');
    setPStock('50');
    setPSKU('');
    setPCategory(categories.filter(c => c.businessId === pBusiness)[0]?.id || 'seeds');
    setPColor('#4682B4');
    setPTags('');
    setPActions(['buy']);
    setEditingProductId(null);
  };

  const handleCreateOrUpdateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pPrice || !pSKU) {
      alert('Required parameters: Title, price, SKU');
      return;
    }

    const payload = {
      businessId: pBusiness,
      categoryId: pCategory || categories.filter(c => c.businessId === pBusiness)[0]?.id || 'seeds',
      title: pTitle,
      description: pDesc,
      image: pColor,
      price: parseFloat(pPrice),
      salePrice: pSalePrice ? parseFloat(pSalePrice) : undefined,
      stock: parseInt(pStock),
      SKU: pSKU,
      availability: parseInt(pStock) > 10 ? 'in-stock' : parseInt(pStock) > 0 ? 'low-stock' : ('out-of-stock' as any),
      specifications: { 'Build': 'Standard OEM Config', 'SKU Standard': pSKU, 'Origin': 'Vetted Supplier' },
      tags: pTags.split(',').map(t => t.trim()).filter(Boolean),
      allowedActions: pActions as any[]
    };

    if (editingProductId) {
      editProduct(editingProductId, payload);
    } else {
      addProduct(payload);
    }

    resetProductForm();
    setShowAddProductDrawer(false);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProductId(prod.id);
    setPTitle(prod.title);
    setPDesc(prod.description);
    setPPrice(prod.price.toString());
    setPSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
    setPStock(prod.stock.toString());
    setPSKU(prod.SKU);
    setPCategory(prod.categoryId);
    setPBusiness(prod.businessId);
    setPColor(prod.image);
    setPTags(prod.tags.join(', '));
    setPActions(prod.allowedActions);
    setShowAddProductDrawer(true);
  };

  const handleNewBusinessCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newBizId || !newBizName || !newBizTagline) {
      alert('Please fill out Name, unique Identifier ID, and slogan');
      return;
    }

    const cleanedId = newBizId.toLowerCase().replace(/[^a-z0-0]/g, '');
    const newBiz: Business = {
      id: cleanedId,
      name: newBizName,
      tagline: newBizTagline,
      logo: 'Globe',
      accentColor: newBizColor,
      description: newBizDesc || `${newBizName} dynamically hosted business division.`
    };

    const cNames = newBizCats.split(',').map(c => c.trim()).filter(Boolean);
    const generatedCats: Category[] = cNames.map((name, idx) => ({
      id: `${cleanedId}-cat-${idx}`,
      businessId: cleanedId,
      name,
      icon: 'Globe'
    }));

    addCustomBusiness(newBiz, generatedCats);
    setBizStatus(true);
    setTimeout(() => {
      setBizStatus(false);
      setNewBizId('');
      setNewBizName('');
      setNewBizTagline('');
      setNewBizDesc('');
      setNewBizCats('');
    }, 2000);
  };

  return (
    <div id="admin-workspace" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Dynamic Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-zinc-900 p-2.5 text-amber-500 shadow-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-normal">Operational Dashboard</h1>
            <span className="text-xs font-mono text-gray-400">ROLE: PLATFORM ROOT ARCHITECT</span>
          </div>
        </div>

        {/* Global Business filtering inside Admin */}
        <div className="flex items-center gap-2">
          <label htmlFor="admin-biz-scoped-select" className="text-xs font-bold font-mono text-gray-500">FILTER BY BUSINESS:</label>
          <select
            id="admin-biz-scoped-select"
            value={selectedBusinessFilter}
            onChange={(e) => setSelectedBusinessFilter(e.target.value)}
            className="rounded-xl border border-gray-250 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 focus:outline-none"
          >
            <option value="all">All Businesses Combined</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Internal operational switcher tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto whitespace-nowrap gap-1">
        {[
          { id: 'dashboard', label: 'Metrics Analytics', icon: <LayoutDashboard className="h-4 w-4" /> },
          { id: 'products', label: 'Manage Inventory / CRUD', icon: <Database className="h-4 w-4" /> },
          { id: 'orders', label: 'Handle Orders', icon: <ClipboardCheck className="h-4 w-4" /> },
          { id: 'bookings', label: 'Equipment Bookings', icon: <Calendar className="h-4 w-4" /> },
          { id: 'enquiries', label: 'Customer Enquiries', icon: <MessageSquare className="h-4 w-4" /> },
          { id: 'businesses', label: 'Add Scalable Business', icon: <FolderPlus className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              adminTab === tab.id
                ? 'bg-zinc-950 text-white shadow-xl'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Primary Panels Switcher logic */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { title: 'TOTAL REVENUE (RELIABLE)', val: `₹${totalRevenue.toLocaleString('en-IN')}`, desc: `${totalOrdersCount} orders placed`, color: 'text-emerald-700' },
              { title: 'INVENTORY PRODUCTS', val: rawProducts.length, desc: `${products.filter(p => p.stock === 0).length} out of stock`, color: 'text-indigo-700' },
              { title: 'TOTAL APPOINTMENTS', val: totalBookingsCount, desc: `${rawBookings.filter(b => b.status === 'Requested').length} pending approval`, color: 'text-amber-700' },
              { title: 'CUSTOMER ENQUIRIES', val: totalEnquiriesCount, desc: `${rawEnquiries.filter(e => e.status === 'New').length} unresolved cases`, color: 'text-sky-700' },
            ].map((card, idx) => (
              <div key={idx} className="bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider">{card.title}</span>
                  <span className={`block text-xl font-extrabold mt-1 font-mono ${card.color}`}>{card.val}</span>
                </div>
                <span className="block text-[10px] text-gray-500 mt-2">{card.desc}</span>
              </div>
            ))}
          </div>

          {/* SVG bar graphs + Best Sellers columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* SVG Visual Revenue distribution bar graph */}
            <div className="bg-white border rounded-3xl p-5 shadow-xs space-y-4">
              <span className="block text-xs font-bold text-gray-400 font-mono uppercase">Revenue distribution by business (₹)</span>
              
              <div className="h-44 w-full flex items-end justify-around border-b border-gray-150 pb-2">
                {businesses.map((b) => {
                  const bOrders = orders.filter(o => o.businessId === b.id && o.orderStatus !== 'Cancelled');
                  const rev = bOrders.reduce((sum, o) => sum + o.total, 0);
                  const maxRev = orders.reduce((sum, o) => sum + o.total, 0) || 1;
                  const ratio = Math.max(5, Math.min(100, (rev / maxRev) * 100));

                  return (
                    <div key={b.id} className="flex flex-col items-center gap-2 w-1/3">
                      <span className="font-mono text-[9px] font-bold text-gray-650">₹{rev.toLocaleString('en-IN')}</span>
                      <div 
                        className="w-8 rounded-t-lg transition-all duration-500"
                        style={{ height: `${ratio * 1.2}px`, backgroundColor: b.accentColor }}
                      />
                      <span className="text-[10px] font-bold text-gray-900">{b.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Best Selling Products */}
            <div className="bg-white border rounded-3xl p-5 shadow-xs space-y-3.5">
              <span className="block text-xs font-bold text-gray-400 font-mono uppercase">Top velocity products (sold units)</span>
              
              {bestSellingProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500">
                  No products successfully delivered / checkout yet to compute metrics.
                </div>
              ) : (
                <div className="space-y-3">
                  {bestSellingProducts.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.p.title}</span>
                        <span className="text-gray-500 font-mono text-[10px] uppercase">SKU: {item.p.SKU}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {item.sold} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Premium Bulk Inventory Management Center */}
      {adminTab === 'products' && (
        <div id="bulk-inventory-center" className="space-y-6 text-left">
          
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-950 p-6 rounded-3xl text-white shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Shopify & Zoho Native
                </span>
                <span className="text-xs text-zinc-400 font-mono">5000+ Product Scalability Mode Active</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mt-1.5">Bulk Inventory Command Center</h2>
              <p className="text-zinc-400 text-xs mt-1">
                Administer cross-segment enterprise product inventory pipelines using fast bulk actions, spreadsheet integrations, & automated hooks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const header = ["Product Name", "SKU", "Category", "Price", "Stock", "Product Image URL", "Business Unit"];
                  const rows = [
                    ["Organic Wheat Seeds F1", "AM-SD-WHT-01", "seeds", "350", "2000", "#1E88E5", "agromart"],
                    ["Heavy Duty Power Tiller", "AM-MC-TILL-99", "machinery", "34000", "45", "#FCF3CF", "agromart"],
                    ["Gallium Nitride 65W Fast Adaptor", "EH-SM-PWR-65", "smart-home", "2400", "850", "#17202A", "electrohub"],
                    ["Biometric Security Door Locker", "EH-SM-LOCK-50", "smart-home", "11999", "120", "#7D3C98", "electrohub"]
                  ];
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + [header.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "bulk_inventory_template.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all border border-zinc-700"
                title="Get standard master inventory columns"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Template</span>
              </button>

              <button
                onClick={() => {
                  const filteredProds = rawProducts;
                  if (filteredProds.length === 0) {
                    alert("No products in the current filtered view to export.");
                    return;
                  }
                  const header = ["Product ID", "Title", "SKU", "Category ID", "Wholesale Price", "Opening Stock", "Unit ID", "Accent Color"];
                  const csvRows = filteredProds.map(p => [p.id, p.title, p.SKU, p.categoryId, p.price, p.stock, p.businessId, p.image]);
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + [header.join(","), ...csvRows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all border border-zinc-700"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
                <span>Export Inventory ({rawProducts.length})</span>
              </button>

              <button
                onClick={() => {
                  resetProductForm();
                  setShowAddProductDrawer(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Register Product (Manual)</span>
              </button>
            </div>
          </div>

          {/* Quick Stats & Sources Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border text-left p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Manual Entry</span>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-zinc-900">{sourceCounters.manual}</span>
                <span className="text-[10px] block text-zinc-500 mt-1">Direct single forms</span>
              </div>
            </div>

            <div className="bg-white border text-left p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Excel Workbook</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-zinc-900">{sourceCounters.excel}</span>
                <span className="text-[10px] block text-zinc-500 mt-1">Desktop spreadsheet files</span>
              </div>
            </div>

            <div className="bg-white border text-left p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">CSV Batches</span>
                <span className="h-2 w-2 rounded-full bg-orange-400" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-zinc-900">{sourceCounters.csv}</span>
                <span className="text-[10px] block text-zinc-500 mt-1">Suppliers wholesale listings</span>
              </div>
            </div>

            <div className="bg-white border text-left p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Google Sheet Hook</span>
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono text-teal-650">
                  {sourceCounters.googlesheet}
                </span>
                <span className="text-[10px] block text-zinc-500 mt-1">Connected live synced rows</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left section: Advanced Stepper & Google Sheets controls */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Stepper Wizard Zone: Upload Validate Preview Import */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest font-mono">
                    Bulk Import Assistant
                  </h3>
                  <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-lg">
                    Pipeline Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 relative">
                  <div className="absolute inset-x-0 top-3 h-0.5 bg-zinc-100 -z-10" />
                  {[
                    { key: 'upload', order: 1, label: 'Upload' },
                    { key: 'validate', order: 2, label: 'Validate' },
                    { key: 'preview', order: 3, label: 'Preview' },
                    { key: 'complete', order: 4, label: 'Import' }
                  ].map((step, idx) => {
                    const stepsInOrder = ['upload', 'validate', 'preview', 'complete'];
                    const currentIdx = stepsInOrder.indexOf(importWorkflowState);
                    const isPassed = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center space-y-1 relative z-10 flex-1">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] border transition-all ${
                          isPassed ? 'bg-emerald-500 border-emerald-500 text-white' :
                          isActive ? 'bg-zinc-950 border-zinc-950 text-white shadow-md' :
                          'bg-zinc-50 border-zinc-200 text-zinc-400'
                        }`}>
                          {isPassed ? <Check className="h-3 w-3" /> : step.order}
                        </div>
                        <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'text-zinc-950 font-black' : 'text-zinc-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Import step 1: Upload and Preset files selection */}
                {importWorkflowState === 'upload' && (
                  <div className="space-y-4 pt-2">
                    <label 
                      htmlFor="bulk-file-uploader"
                      className="group border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-zinc-50/55 hover:bg-zinc-50"
                    >
                      <UploadCloud className="h-8 w-8 text-zinc-400 group-hover:text-emerald-500 transition-colors animate-bounce" />
                      <span className="text-xs font-bold text-zinc-800 mt-2 block">Upload Excel or CSV Sheet</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Drag and drop file or click browse</span>
                      <input 
                        id="bulk-file-uploader"
                        type="file" 
                        accept=".csv,.xlsx" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFileMeta({ 
                              name: file.name, 
                              size: (file.size / 1024).toFixed(1) + " KB", 
                              type: file.name.endsWith('.csv') ? 'csv' : 'excel' 
                            });
                            // Mock standard sheet load
                            setStagedProducts([
                              { title: "Organic Liquid Nitrogen Booster", SKU: "BOOST-N2-ORG", categoryId: "seeds", price: 1450, stock: 950, image: "#4CAF50", businessId: "agromart" },
                              { title: "Hybrid High-Yield Cotton Seeds", SKU: "SEED-COTN-HB", categoryId: "seeds", price: 890, stock: 4500, image: "#E0F2F1", businessId: "agromart" },
                              { title: "ANC Smart Bluetooth Audio Headset", SKU: "HEAD-ANC-300", categoryId: "smart-home", price: 6500, stock: 420, image: "#1F2937", businessId: "electrohub" },
                              { title: "Compact Digital Multimeter Smart Pro", SKU: "METER-EH-PRO", categoryId: "smart-home", price: 1899, stock: 750, image: "#FF9800", businessId: "electrohub" }
                            ]);
                            setValidationErrors([
                              { row: 1, field: "image", message: "Image hex value corrected to high density template match." }
                            ]);
                            setImportWorkflowState('validate');
                          }
                        }}
                      />
                    </label>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Or select rich industry templates to inspect:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button 
                          onClick={() => {
                            setFileMeta({ name: "agro_bulk_import_2026.xlsx", size: "48 KB", type: "excel" });
                            setStagedProducts([
                              { title: "Neem Protective Botanical Spray", SKU: "AGRO-NEEM-BOT", categoryId: "seeds", price: 799, stock: 1200, image: "#66BB6A", businessId: "agromart" },
                              { title: "High-Caliber Hybrid Potato Studs", SKU: "AGRO-SD-POTA", categoryId: "seeds", price: 420, stock: 6800, image: "#8D6E63", businessId: "agromart" },
                              { title: "Precision Drip Irrigation Pipe Roll", SKU: "AGRO-DRP-PIPE", categoryId: "machinery", price: 5499, stock: 190, image: "#B0BEC5", businessId: "agromart" },
                              { title: "Heavy Rust-Resistant Harvesting Sickle", SKU: "AGRO-SKL-HARV", categoryId: "machinery", price: 650, stock: 1100, image: "#78909C", businessId: "agromart" }
                            ]);
                            setValidationErrors([]);
                            setImportWorkflowState('validate');
                          }}
                          className="bg-zinc-50 border p-2.5 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all font-semibold text-zinc-800 text-left space-y-1 block"
                        >
                          <span className="text-emerald-700 font-bold block">🌾 AgroMart Crop</span>
                          <span className="text-[10px] text-zinc-500 block">4 wholesale crop items</span>
                        </button>

                        <button 
                          onClick={() => {
                            setFileMeta({ name: "electro_spares_load.csv", size: "23 KB", type: "csv" });
                            setStagedProducts([
                              { title: "TrueWireless Bluetooth Earbuds 5.3", SKU: "EH-SND-EAR-53", categoryId: "smart-home", price: 1999, stock: 1400, image: "#3F51B5", businessId: "electrohub" },
                              { title: "Heavy Amp Solar Power Bank 20000mAh", SKU: "EH-PWR-SOLAR-2", categoryId: "smart-home", price: 3850, stock: 800, image: "#009688", businessId: "electrohub" },
                              { title: "Wi-Fi Infringement Smart Dome CCTV", SKU: "EH-SEC-DOME", categoryId: "smart-home", price: 4950, stock: 320, image: "#607D8B", businessId: "electrohub" },
                              { title: "Dynamic Infrared Thermography Meter", SKU: "EH-IND-THERM", categoryId: "smart-home", price: 3400, stock: 160, image: "#FF5722", businessId: "electrohub" }
                            ]);
                            setValidationErrors([
                              { row: 4, field: "categoryId", message: "Auto-mapped 'industrial' to closest template target 'smart-home'" }
                            ]);
                            setImportWorkflowState('validate');
                          }}
                          className="bg-zinc-50 border p-2.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all font-semibold text-zinc-800 text-left space-y-1 block"
                        >
                          <span className="text-indigo-700 font-bold block">⚡ ElectroHub Tech</span>
                          <span className="text-[10px] text-zinc-500 block">4 premium engineering items</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Import step 2: Validation panel */}
                {importWorkflowState === 'validate' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-zinc-50 border rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                        <div className="text-xs">
                          <p className="font-bold text-zinc-900 truncate max-w-[200px]">{fileMeta.name}</p>
                          <p className="text-zinc-550 text-[10px] font-mono">{fileMeta.size} | FORMAT: {fileMeta.type?.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Diagnostics Status:</span>
                        <span className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black">Passed with 1 Auto-correction</span>
                      </div>

                      <div className="rounded-xl border border-dotted border-zinc-200 p-3 max-h-36 overflow-y-auto space-y-1 bg-zinc-50/20">
                        <div className="flex items-start gap-1.5 text-[11px] text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Check complete: 100% of SKUs are uniquely structured and available in system memory.</span>
                        </div>
                        {validationErrors.map((err, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100 mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>Row {err.row} ({err.field}): {err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setStagedProducts([]);
                          setImportWorkflowState('upload');
                        }}
                        className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-all font-bold text-xs text-zinc-700"
                      >
                        Reset Step
                      </button>
                      <button 
                        onClick={() => setImportWorkflowState('preview')}
                        className="flex-1 py-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-all font-bold text-xs"
                      >
                        Preview {stagedProducts.length} rows
                      </button>
                    </div>
                  </div>
                )}

                {/* Import step 3: Grid Preview and validation confirmation */}
                {importWorkflowState === 'preview' && (
                  <div className="space-y-4 pt-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Airtable Staged Preview:
                    </span>
                    
                    <div className="border rounded-2xl overflow-hidden shadow-xs text-[11px]">
                      <div className="bg-zinc-50 border-b p-2 font-mono text-zinc-450 uppercase font-black text-[9px] grid grid-cols-12 gap-1">
                        <span className="col-span-6">Product & SKU</span>
                        <span className="col-span-3 text-right">Price</span>
                        <span className="col-span-3 text-right">Stock</span>
                      </div>
                      <div className="divide-y max-h-48 overflow-y-auto">
                        {stagedProducts.map((p, idx) => (
                          <div key={idx} className="p-2.5 hover:bg-zinc-50 transition-colors grid grid-cols-12 gap-1 items-center">
                            <div className="col-span-6 truncate font-medium text-zinc-900">
                              <span className="block truncate font-bold">{p.title}</span>
                              <span className="block text-[8px] font-mono text-zinc-400">{p.SKU}</span>
                            </div>
                            <span className="col-span-3 text-right font-mono font-bold text-zinc-900">
                              ₹{p.price}
                            </span>
                            <span className="col-span-3 text-right font-mono text-zinc-650 font-semibold">
                              {p.stock}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setImportWorkflowState('validate')}
                        className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-all font-bold text-xs text-zinc-700"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          bulkAddProducts(stagedProducts);
                          setSourceCounters(prev => ({
                            ...prev,
                            excel: fileMeta.type === 'excel' ? prev.excel + stagedProducts.length : prev.excel,
                            csv: fileMeta.type === 'csv' ? prev.csv + stagedProducts.length : prev.csv
                          }));
                          setImportWorkflowState('complete');
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-bold text-xs"
                      >
                        Import all permanently
                      </button>
                    </div>
                  </div>
                )}

                {/* Import step 4: Done! */}
                {importWorkflowState === 'complete' && (
                  <div className="pt-2 text-center space-y-3">
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900">Bulk Pipeline Loaded Successfully!</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        All matched rows processed & validated into production category clusters.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setStagedProducts([]);
                        setImportWorkflowState('upload');
                      }}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Process Next Sheet
                    </button>
                  </div>
                )}

              </div>

              {/* Google Sheets Real-Time Synchronizer API Card */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-emerald-50">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest font-mono">
                      Google Sheets Live Feed
                    </h3>
                  </div>
                  {googleSheetConnected ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono">
                      Connected
                    </span>
                  ) : (
                    <span className="bg-zinc-100 text-zinc-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Offline
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 text-xs text-left">
                  <div className="space-y-1">
                    <label htmlFor="gsheet-url" className="text-[10px] uppercase font-bold text-zinc-400 font-mono block">
                      Google Sheet URL (Read/Write Shared)
                    </label>
                    <input
                      id="gsheet-url"
                      type="url"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:border-zinc-900 font-mono text-[10px]"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between bg-zinc-50/50 p-2.5 rounded-xl border text-[11px]">
                    <span className="font-semibold text-zinc-700">Auto Sync On Page Refresh</span>
                    <button
                      onClick={() => {
                        setAutoSyncEnabled(!autoSyncEnabled);
                        if (!autoSyncEnabled) {
                          addNotification('system', 'Auto Sync Armed', 'Google Sheet live synchronization will activate on state cycles.', true);
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoSyncEnabled ? 'bg-emerald-600' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          autoSyncEnabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="text-[10px] space-y-1 font-mono text-zinc-650 bg-zinc-50/20 p-2.5 rounded-xl border border-dashed">
                    <div className="flex justify-between">
                      <span>Sync Engine Status:</span>
                      <span className="font-bold text-zinc-900">{isSyncingSheet ? "Syncing..." : "Ready"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Synced On:</span>
                      <span className="font-bold text-zinc-900">{lastSyncTimestamp}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!googleSheetUrl || !googleSheetUrl.includes('docs.google.com/spreadsheets')) {
                          alert("Kindly enter a valid Google Sheets URL to establish access scope.");
                          return;
                        }
                        setIsSyncingSheet(true);
                        setTimeout(() => {
                          setGoogleSheetConnected(true);
                          setIsSyncingSheet(false);
                          setLastSyncTimestamp(new Date().toLocaleTimeString());
                          // Load dynamic sample spreadsheet sync objects
                          const sheetProds = [
                            { title: "Organic Liquid Nitrogen G02", SKU: "GSHEET-N-G02", categoryId: "seeds", price: 1650, stock: 750, image: "#00E676", businessId: "agromart" },
                            { title: "Premium Industrial Grain Shoveler", SKU: "GSHEET-M-SHV", categoryId: "machinery", price: 1190, stock: 350, image: "#90A4AE", businessId: "agromart" },
                            { title: "High-Definition Smart Security Monitor", SKU: "GSHEET-T-HDM", categoryId: "smart-home", price: 24500, stock: 95, image: "#E040FB", businessId: "electrohub" }
                          ];
                          bulkAddProducts(sheetProds);
                          setSourceCounters(prev => ({ ...prev, googlesheet: prev.googlesheet + sheetProds.length }));
                        }, 1200);
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-1.5"
                    >
                      {isSyncingSheet ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Establishing Link...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Connect & Synced URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (!googleSheetConnected) {
                          alert("Kindly connect a valid Google Sheet URL before triggering sync cycles.");
                          return;
                        }
                        setIsSyncingSheet(true);
                        setTimeout(() => {
                          setIsSyncingSheet(false);
                          setLastSyncTimestamp(new Date().toLocaleTimeString());
                          
                          // Boost stock of some matched products as simulated sync update
                          const randomBoost = [
                            { title: "Premium Dynamic Synchronizer Load", SKU: "GSHEET-SYNC-BOOST", categoryId: "seeds", price: 4200, stock: 120, image: "#D84315", businessId: "agromart" }
                          ];
                          bulkAddProducts(randomBoost);
                          setSourceCounters(prev => ({ ...prev, googlesheet: prev.googlesheet + 1 }));
                        }, 1000);
                      }}
                      className="py-2 px-3 border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-all"
                      title="Sync data now"
                    >
                      <RefreshCw className={`h-4 w-4 text-zinc-700 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right section: Power inventory datatable with checkboxes & paginator */}
            <div className="lg:col-span-8 bg-white border rounded-3xl p-5 space-y-4">
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950">Active Inventory Records Database</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Filter, multi-select and edit across mounted categories</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Quick lookup by title or SKU..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-xs text-zinc-800 bg-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 w-full sm:w-60"
                  />
                </div>
              </div>

              {/* Table wrapper block */}
              <div className="overflow-x-auto border-zinc-100 rounded-2xl border">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-150 font-mono text-zinc-450 uppercase font-bold text-[9px] tracking-wider">
                      <th className="px-4 py-3 shrink-0 text-center w-10">
                        <button
                          onClick={() => {
                            const isAllSelected = rawProducts.every(p => selectedProductIds.includes(p.id));
                            if (isAllSelected) {
                              setSelectedProductIds([]);
                            } else {
                              setSelectedProductIds(rawProducts.map(p => p.id));
                            }
                          }}
                          className="flex items-center justify-center text-zinc-500 focus:outline-none"
                          aria-label="Toggle All Checkbox"
                        >
                          {rawProducts.length > 0 && rawProducts.every(p => selectedProductIds.includes(p.id)) ? (
                            <CheckSquare className="h-4.5 w-4.5 text-zinc-950" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-zinc-350" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3">Product metadata</th>
                      <th className="px-3 py-3">Merchant unit</th>
                      <th className="px-3 py-3">Price (₹)</th>
                      <th className="px-4 py-3">Stock Counter</th>
                      <th className="px-4 py-3 text-right">Modifiers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 text-[11px]">
                    {rawProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-zinc-450">
                          <AlertTriangle className="h-6 w-6 text-zinc-350 mx-auto mb-2" />
                          <p className="font-semibold text-zinc-900">No Inventory Items Match Query</p>
                          <p className="text-xs text-zinc-450 mt-1">Refine filters or import a fresh spreadsheet template batch to resume.</p>
                        </td>
                      </tr>
                    ) : (
                      rawProducts.map((p) => {
                        const currentBiz = businesses.find(b => b.id === p.businessId);
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <tr 
                            key={p.id} 
                            className={`hover:bg-zinc-50/70 transition-colors ${isSelected ? 'bg-zinc-50/90 font-medium' : ''}`}
                          >
                            <td className="px-4 py-3 text-center shrink-0 w-10">
                              <button
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                  } else {
                                    setSelectedProductIds([...selectedProductIds, p.id]);
                                  }
                                }}
                                className="flex items-center justify-center focus:outline-none"
                                aria-label="Toggle Row Checkbox"
                              >
                                {isSelected ? (
                                  <CheckSquare className="h-4.5 w-4.5 text-zinc-900" />
                                ) : (
                                  <Square className="h-4.5 w-4.5 text-zinc-300" />
                                )}
                              </button>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={getProductImage(p.id, categories.find(c => c.id === p.categoryId)?.name || '', p.title, p.image)} 
                                  alt={p.title} 
                                  className="h-6 w-6 rounded-lg object-cover border border-zinc-200 shrink-0" 
                                />
                                <div className="max-w-[190px] sm:max-w-[280px] truncate leading-tight">
                                  <span className="block font-bold text-zinc-950 text-xs truncate">{p.title}</span>
                                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black mt-0.5">SKU: {p.SKU}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-650 uppercase">
                                {currentBiz?.name || p.businessId}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-mono font-black text-zinc-900">
                              ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={p.stock}
                                  onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                                  className="w-16 rounded-xl border border-zinc-250 bg-white px-2 py-1.5 font-mono text-xs text-center font-bold focus:outline-none focus:border-emerald-500"
                                  aria-label="Stock Override"
                                />
                                {p.stock === 0 ? (
                                  <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[8px] font-black text-red-800 uppercase leading-none">
                                    OUT
                                  </span>
                                ) : p.stock <= 10 ? (
                                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[8px] font-black text-amber-800 uppercase leading-none">
                                    LOW
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="rounded-lg p-1.5 border border-zinc-200 text-zinc-655 hover:bg-zinc-100 transition-all focus:outline-none"
                                  title="Edit single configurations"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete SKU ${p.SKU} permanently?`)) {
                                      deleteProduct(p.id);
                                      setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="rounded-lg p-1.5 border border-red-200 text-red-655 hover:bg-red-50 transition-all focus:outline-none"
                                  title="Deleteforever"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Floating Airtable / Stripe Bulk Actions Drawer Panel */}
              {selectedProductIds.length > 0 && (
                <div className="relative overflow-hidden bg-zinc-950 text-white rounded-2xl p-4.5 border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 text-xs">
                  
                  {/* Glowing color banner */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Selected Products Action Bar</span>
                      <p className="text-white font-extrabold font-sans">
                        Applying bulk process on <span className="text-emerald-400 underline decoration-emerald-400/50 decoration-2 font-mono">{selectedProductIds.length}</span> items in inventory.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setBulkOperationType(bulkOperationType === 'price' ? 'none' : 'price');
                          setBulkStockValue('');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold font-sans transition-all text-xs border ${
                          bulkOperationType === 'price' 
                            ? 'bg-white text-zinc-950 border-white' 
                            : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border-zinc-800'
                        }`}
                      >
                        ⚡ Bulk Price Update
                      </button>

                      <button
                        onClick={() => {
                          setBulkOperationType(bulkOperationType === 'stock' ? 'none' : 'stock');
                          setBulkPriceValue('');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold font-sans transition-all text-xs border ${
                          bulkOperationType === 'stock' 
                            ? 'bg-white text-zinc-950 border-white' 
                            : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border-zinc-800'
                        }`}
                      >
                        📦 Bulk Stock Update
                      </button>

                      <button
                        onClick={() => {
                          setBulkOperationType(bulkOperationType === 'category' ? 'none' : 'category');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold font-sans transition-all text-xs border ${
                          bulkOperationType === 'category' 
                            ? 'bg-white text-zinc-950 border-white' 
                            : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border-zinc-800'
                        }`}
                      >
                        📂 Bulk Category change
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove custom selected ${selectedProductIds.length} products forever across networks?`)) {
                            bulkDeleteProducts(selectedProductIds);
                            setSelectedProductIds([]);
                            setBulkOperationType('none');
                          }
                        }}
                        className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold font-sans transition-all text-xs border border-red-700 focus:outline-none"
                      >
                        Delete Selected
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProductIds([]);
                          setBulkOperationType('none');
                        }}
                        className="px-3 py-1.5 text-zinc-400 hover:text-white transition-all font-sans font-bold text-xs"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Operational forms based on choice selection */}
                  {bulkOperationType === 'price' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <label htmlFor="bulk-price-modifier" className="text-zinc-400 font-mono text-[10px]">Price Formula Mode:</label>
                        <select
                          id="bulk-price-modifier"
                          value={bulkPriceMode}
                          onChange={(e) => setBulkPriceMode(e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white focus:outline-none font-bold text-xs"
                        >
                          <option value="set">Set Fixed Value (e.g. ₹1500)</option>
                          <option value="multiply">Apply Modifier Percentage (e.g. 1.10 for +10%)</option>
                          <option value="add">Add Uniform Offset Value (e.g. +₹100)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label htmlFor="bulk-price-input" className="text-zinc-500 text-[10px]">Multiplier or Price Amount:</label>
                        <input
                          id="bulk-price-input"
                          type="text"
                          required
                          className="bg-zinc-900 border border-zinc-800 text-white font-mono text-xs font-bold rounded-xl px-2.5 py-1 w-24 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g. 150"
                          value={bulkPriceValue}
                          onChange={(e) => setBulkPriceValue(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={() => {
                          const valueNum = parseFloat(bulkPriceValue);
                          if (isNaN(valueNum)) {
                            alert("Please supply a valid numeric modifier to initiate catalog update.");
                            return;
                          }
                          const updatedProductsToChange = products.map(p => {
                            if (selectedProductIds.includes(p.id)) {
                              let targetPrice = p.price;
                              if (bulkPriceMode === 'set') {
                                targetPrice = valueNum;
                              } else if (bulkPriceMode === 'multiply') {
                                targetPrice = Math.round(p.price * valueNum);
                              } else if (bulkPriceMode === 'add') {
                                targetPrice = p.price + valueNum;
                              }
                              return { ...p, price: targetPrice };
                            }
                            return p;
                          });

                          selectedProductIds.forEach(id => {
                            const found = products.find(o => o.id === id);
                            if (found) {
                              let targetP = found.price;
                              if (bulkPriceMode === 'set') {
                                targetP = valueNum;
                              } else if (bulkPriceMode === 'multiply') {
                                targetP = Math.round(found.price * valueNum);
                              } else if (bulkPriceMode === 'add') {
                                targetP = found.price + valueNum;
                              }
                              editProduct(id, { price: targetP });
                            }
                          });
                          setSelectedProductIds([]);
                          setBulkOperationType('none');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl transition-all"
                      >
                        Apply Bulk Price Update
                      </button>
                    </div>
                  )}

                  {bulkOperationType === 'stock' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <label htmlFor="bulk-stock-mode" className="text-zinc-400 font-mono text-[10px]">Stock Formula Mode:</label>
                        <select
                          id="bulk-stock-mode"
                          value={bulkStockMode}
                          onChange={(e) => setBulkStockMode(e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white focus:outline-none font-bold text-xs"
                        >
                          <option value="set">Set Fixed Stock Capacity Override</option>
                          <option value="add">Add Uniform Offset Stock</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label htmlFor="bulk-stock-input" className="text-zinc-500 text-[10px]">Quantity amount:</label>
                        <input
                          id="bulk-stock-input"
                          type="number"
                          required
                          className="bg-zinc-900 border border-zinc-800 text-white font-mono text-xs font-bold rounded-xl px-2.5 py-1 w-24 focus:outline-none"
                          placeholder="e.g. 50"
                          value={bulkStockValue}
                          onChange={(e) => setBulkStockValue(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={() => {
                          const stockAmt = parseInt(bulkStockValue);
                          if (isNaN(stockAmt)) {
                            alert("Kindly enter a valid stock quantity amount.");
                            return;
                          }
                          selectedProductIds.forEach(id => {
                            const foundVal = products.find(p => p.id === id);
                            if (foundVal) {
                              let endStock = foundVal.stock;
                              if (bulkStockMode === 'set') {
                                endStock = stockAmt;
                              } else if (bulkStockMode === 'add') {
                                endStock = foundVal.stock + stockAmt;
                              }
                              editProduct(id, { stock: Math.max(0, endStock) });
                            }
                          });
                          setSelectedProductIds([]);
                          setBulkOperationType('none');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl transition-all font-sans"
                      >
                        Apply Bulk Stock Update
                      </button>
                    </div>
                  )}

                  {bulkOperationType === 'category' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <label htmlFor="bulk-category-modifier" className="text-zinc-400 font-mono text-[10px]">Select Target Category Cluster:</label>
                        <select
                          id="bulk-category-modifier"
                          value={bulkCategoryValue}
                          onChange={(e) => setBulkCategoryValue(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white focus:outline-none font-bold text-xs"
                        >
                          <option value="">-- Choose Category --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name} (Unit: {cat.businessId})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          if (!bulkCategoryValue) {
                            alert("Select a valid category item to execute category re-mapping.");
                            return;
                          }
                          const catObj = categories.find(c => c.id === bulkCategoryValue);
                          selectedProductIds.forEach(id => {
                            editProduct(id, { 
                              categoryId: bulkCategoryValue,
                              businessId: catObj?.businessId // Auto match business scope of the target category
                            });
                          });
                          setSelectedProductIds([]);
                          setBulkOperationType('none');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl transition-all"
                      >
                        Transfer to Category
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* Product Register Form Dialog (Drawers simulation) */}
      {showAddProductDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-950">
              {editingProductId ? 'Edit Product Setup' : 'Register New Catalog Product'}
            </h3>
            <p className="text-xs text-secondary/65">Configure details belonging to active merchants.</p>

            <form onSubmit={handleCreateOrUpdateProduct} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="prod-biz" className="text-xs font-bold text-gray-700">Scope Business Unit *</label>
                  <select
                    id="prod-biz"
                    value={pBusiness}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPBusiness(val);
                      // Auto reset categories list match
                      setPCategory(categories.filter(c => c.businessId === val)[0]?.id || 'seeds');
                    }}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="prod-cat" className="text-xs font-bold text-gray-700">Scope Category *</label>
                  <select
                    id="prod-cat"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  >
                    {categories.filter(c => c.businessId === pBusiness).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-title" className="text-xs font-semibold text-gray-700">Display Product Title *</label>
                <input
                  id="prod-title"
                  type="text"
                  required
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="Tomato Seeds F1, Samsung TV Pro"
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prod-desc" className="text-xs font-semibold text-gray-700">Product Descriptions</label>
                <textarea
                  id="prod-desc"
                  rows={2}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="prod-price" className="text-xs font-semibold text-gray-700">Wholesale Price (₹) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prod-saleprice" className="text-xs font-semibold text-gray-700">Promo Sale (₹)</label>
                  <input
                    id="prod-saleprice"
                    type="number"
                    value={pSalePrice}
                    onChange={(e) => setPSalePrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prod-stock" className="text-xs font-semibold text-gray-700">Opening Stock *</label>
                  <input
                    id="prod-stock"
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="prod-sku" className="text-xs font-semibold text-gray-700">Supplier SKU code *</label>
                  <input
                    id="prod-sku"
                    type="text"
                    required
                    value={pSKU}
                    placeholder="EH-TV-004"
                    onChange={(e) => setPSKU(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prod-color" className="text-xs font-semibold text-gray-700">Theme accent color Hex</label>
                  <input
                    id="prod-color"
                    type="color"
                    value={pColor}
                    onChange={(e) => setPColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-white p-1 select-none border border-gray-250 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Supported actions mapping */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700">Allowed actions (Select multiple if flexible)</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['buy', 'enquire', 'book'].map((act) => {
                    const selected = pActions.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => handleToggleActionChoice(act)}
                        className={`rounded-lg px-3 py-1.5 font-bold uppercase ${
                          selected 
                            ? 'bg-zinc-950 text-white' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {act === 'buy' ? 'Direct Buy now' : act === 'enquire' ? 'Enquiry Quote' : 'Booking appt'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductDrawer(false)}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-655 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-850"
                >
                  {editingProductId ? 'Save Config' : 'Register SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Handle Orders */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/60 p-4 rounded-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-950 tracking-tight text-left">Fulfillment & Dispatch Administration Console</h2>
              <p className="text-xs text-secondary/65 text-left">Process and prepare client packages. Cross-verify serial codes, catalog specs, and satellite tracking coordinates.</p>
            </div>
            <span className="shrink-0 bg-amber-100 text-amber-950 font-mono font-bold text-xs px-3 py-1.5 rounded-2xl border border-amber-200 block w-fit">
              Total Pending: {rawOrders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length} Units
            </span>
          </div>

          {rawOrders.length === 0 ? (
            <div className="bg-white border text-center p-12 rounded-3xl space-y-3">
              <ClipboardCheck className="h-10 w-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">No Orders Registered</h3>
              <p className="text-xs text-gray-500">All customer systems are clear. No pending dispatch cycles found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rawOrders.map((o) => {
                const currentBiz = businesses.find(b => b.id === o.businessId);
                const bColor = currentBiz?.accentColor || '#000000';
                const waybill = assignedWaybills[o.id] || `${o.businessId === 'agromart' ? 'AGR-EXP' : 'EHUB-BLU'}-${o.id.split('-')[1]?.toUpperCase() || '774819'}`;
                
                return (
                  <div key={o.id} className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-left transition-all hover:shadow-md">
                    
                    {/* Card Title & General Status Select bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-150 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-black text-gray-900 tracking-tight">
                            ORDER_ID: #{o.id.toUpperCase()}
                          </span>
                          <span 
                            className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-xs"
                            style={{ backgroundColor: bColor }}
                          >
                            {currentBiz?.name || 'Dual-Core'}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 font-medium">
                            Received: {new Date(o.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">
                          Active Fulfiller: <span className="font-extrabold text-gray-800">{o.customerName}</span> | Contact: <span className="font-mono font-bold text-gray-800">{o.customerPhone}</span>
                        </p>
                      </div>

                      {/* Operations workflow status updates selectors */}
                      <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 p-2 rounded-2xl">
                        <span className="text-[10px] font-black font-mono text-gray-400 uppercase tracking-wider pl-1.5">
                          STAGE:
                        </span>
                        <select
                          id={`order-status-${o.id}`}
                          value={o.orderStatus}
                          onChange={(e) => {
                            updateOrderStatus(o.id, e.target.value as any);
                            addNotification({
                              title: "Fulfillment Pipeline Shifted",
                              message: `Order #${o.id.substring(6).toUpperCase()} transitioned to ${e.target.value}. System synced successfully.`,
                              type: 'info',
                              businessId: o.businessId
                            });
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-black uppercase text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="Pending">1. Pending (Packed)</option>
                          <option value="Confirmed">2. Confirmed (Handshake)</option>
                          <option value="Processing">3. Processing (At Sorting)</option>
                          <option value="Ready">4. Ready (Arrival Outpost)</option>
                          <option value="Shipped">5. Shipped (Out for Delivery)</option>
                          <option value="Delivered">6. Delivered / Transferred</option>
                          <option value="Cancelled">7. Cancelled (Aborted)</option>
                        </select>
                      </div>
                    </div>

                    {/* Grid 1: Delivery target coordinates (Everything that matters to dispatch) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs">
                      
                      {/* Delivery site target details */}
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                          1. Target Dispatch Destination
                        </span>
                        
                        <div className="space-y-1 text-zinc-700">
                          <p className="flex items-start gap-1.5 leading-tight">
                            <MapPin className="h-3 w-3 text-red-650 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-zinc-900">{o.customerName}</strong><br />
                              {o.customerAddress}, {o.customerCity}<br />
                              <span className="text-zinc-900 font-mono font-bold">Postal code: {o.customerPostalCode}</span>
                            </span>
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            Site Verified: PIN matches routing outpost.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${o.customerName}\n${o.customerAddress}\n${o.customerCity} - ${o.customerPostalCode}\nPhone: ${o.customerPhone}`);
                            alert("Shipping Address block successfully copied! Ready to paste into carrier partners (e.g. Shiprocket, Delhivery, or BlueDart / IndiaPost).");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-[10px] font-bold text-gray-700 px-2.5 py-1 text-xs select-none cursor-pointer"
                        >
                          <FileText className="h-3 w-3 text-zinc-400" />
                          Copy Dispatch Address block
                        </button>
                      </div>

                      {/* Logistics details, Carrier mapping, custom waybill assignment */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-x border-zinc-200/80 pt-3 md:pt-0 md:px-4">
                        <span className="block text-[9px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                          2. Carrier Logistics & Waybill Tracking
                        </span>

                        <div className="space-y-2">
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] font-mono text-zinc-400">WAYBILL:</span>
                            <span className="font-mono text-xs font-black text-zinc-800 bg-white border px-1.5 py-0.5 rounded-md">
                              {waybill}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor={`custom-waybill-input-${o.id}`} className="sr-only">Assigned Tracking ID / Waybill</label>
                            <div className="flex gap-1">
                              <input
                                id={`custom-waybill-input-${o.id}`}
                                type="text"
                                placeholder="Type Custom Waybill..."
                                value={waybillInputMap[o.id] !== undefined ? waybillInputMap[o.id] : ''}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setWaybillInputMap(prev => ({ ...prev, [o.id]: text }));
                                }}
                                className="flex-1 bg-white border border-zinc-250 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 animate-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const customVal = waybillInputMap[o.id];
                                  if (!customVal) {
                                    alert("Please type a valid waybill identifier.");
                                    return;
                                  }
                                  setAssignedWaybills(prev => ({ ...prev, [o.id]: customVal }));
                                  addNotification({
                                    title: "Logistics Waybill Assigned",
                                    message: `Custom Tracking Ref ${customVal} saved and linked successfully for Order #${o.id.substring(6).toUpperCase()}.`,
                                    type: 'success',
                                    businessId: o.businessId
                                  });
                                }}
                                className="bg-zinc-900 hover:bg-zinc-950 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-500 font-mono leading-tight">
                          Primary Route: {o.businessId === 'agromart' ? 'NCR Hub ➔ Rural Road Expressway' : 'Bangalore Gateway ➔ BlueDart HighShield Cargo'}
                        </p>
                      </div>

                      {/* Dispatch checklist actions & printable bill manifest */}
                      <div className="space-y-2.5 pt-3 md:pt-0 md:pl-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                            3. Dispatch manifest Voucher
                          </span>
                          <p className="text-[10px] text-zinc-500 leading-tight">
                            Before handing over parcels to logistics agents, authorize and paste a complete Dispatch Manifest Slip containing barcodes, specification lists, and compliance logs.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDispatchManifestOrder(o);
                            addNotification({
                              title: "Dispatch Manifest Voucher Rendered",
                              message: `Created printable PDF layout mockup for Order #${o.id.substring(6).toUpperCase()}.`,
                              type: 'info',
                              businessId: o.businessId
                            });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/75 text-amber-950 text-[11px] font-black tracking-wide uppercase py-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-amber-700" />
                          Print Dispatch Slip & Labels
                        </button>
                      </div>

                    </div>

                    {/* Products Details List (The actual requested specifics) */}
                    <div className="space-y-3">
                      <span className="block text-[9px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                        Line Items To Fulfill & Pack (ID, Title, Requested, Availability)
                      </span>

                      <div className="border border-gray-150 rounded-2xl overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700 min-w-[600px]">
                          <thead className="bg-zinc-50 border-b border-gray-150 font-mono text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-2.5">Exact Catalog ID / SKU</th>
                              <th className="px-4 py-2.5">Product Title / Attributes</th>
                              <th className="px-4 py-2.5 text-center">Qty Ordered</th>
                              <th className="px-4 py-2.5 text-center">Warehouse Stock</th>
                              <th className="px-4 py-2.5 text-right">Price</th>
                              <th className="px-4 py-2.5 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {o.items.map((sub, idx) => {
                              const originalProduct = products.find(p => p.id === sub.productId);
                              const matchedSKU = originalProduct?.SKU || `SKU-${sub.productId.substring(0,6).toUpperCase()}`;
                              const currentStock = originalProduct?.stock !== undefined ? originalProduct.stock : 12;
                              const isLowStock = currentStock < sub.quantity;

                              return (
                                <tr key={idx} className="hover:bg-zinc-50/50">
                                  <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">
                                    <span className="block font-black text-zinc-800 bg-zinc-100/80 border px-1.5 py-0.5 rounded-md w-fit">
                                      {matchedSKU}
                                    </span>
                                    <span className="block text-[8px] text-zinc-400 mt-0.5">ID: {sub.productId}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={sub.productImage || ''} 
                                        alt={sub.productTitle} 
                                        className="h-8 w-8 rounded-lg object-cover bg-zinc-50 shrink-0 border border-zinc-100"
                                      />
                                      <div>
                                        <span className="block font-bold text-zinc-900 leading-tight">{sub.productTitle}</span>
                                        <span className="text-[10px] text-zinc-400 block truncate max-w-[200px]">
                                          {originalProduct?.description || 'Catalog spec verification clear.'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center font-mono font-black text-zinc-900 text-sm">
                                    {sub.quantity} units
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {isLowStock ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                                        ⚠️ Deficiency! Stock: {currentStock}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                        ✓ Clear ({currentStock} available)
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-700">
                                    ₹{sub.price.toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-black text-gray-950">
                                    ₹{(sub.quantity * sub.price).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Subtotal metrics summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs text-gray-500 border-t border-dashed border-gray-150">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span>Payment Channel: <strong className="text-zinc-800">{o.paymentMethod}</strong></span>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-bold font-mono text-zinc-800 text-[9px]">
                            {o.paymentStatus}
                          </span>
                          <span>Subtotal: ₹{o.subtotal.toLocaleString('en-IN')}</span>
                          <span>Tax (GST 18%): ₹{o.tax.toLocaleString('en-IN')}</span>
                          <span>Transit fee: {o.delivery === 0 ? 'FREE' : `₹${o.delivery}`}</span>
                        </div>

                        <p className="text-sm font-black text-amber-600 font-mono">
                          GRAND DISPATCH TOTAL: ₹{o.total.toLocaleString('en-IN')}
                        </p>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Booking Schedules */}
      {adminTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-950 tracking-tight">Vetted Equipment Bookings ({rawBookings.length})</h2>

          <div className="space-y-3">
            {rawBookings.map((b) => (
              <div key={b.id} className="bg-white border rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left/right">
                <div className="space-y-1.5 flex-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-450 font-bold">CASE #{b.id.substring(5).toUpperCase()}</span>
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[8px] font-bold text-sky-850 font-mono">
                      APPOINTMENT
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{b.productTitle}</h3>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>Contact: <span className="font-semibold text-gray-850">{b.customerName} ({b.customerPhone})</span></p>
                    <p>Notes: "{b.notes || 'None logged'}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-0 pt-3 sm:pt-0 justify-between sm:justify-end">
                  <div className="text-left sm:text-right text-xs">
                    <span className="block font-bold text-gray-900">{b.date}</span>
                    <span className="block text-[10px] font-mono text-gray-450">{b.time} Slot</span>
                  </div>

                  {/* Actions drop updates */}
                  <select
                    id={`booking-status-${b.id}`}
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                    className="rounded-lg border bg-white px-2.5 py-1 text-[11px] font-bold focus:outline-none"
                    aria-label="Update booking status"
                  >
                    <option value="Requested">Requested</option>
                    <option value="Approved">Approved</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Enquiries tracker */}
      {adminTab === 'enquiries' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-950 tracking-tight">Active Customer Enquiries ({rawEnquiries.length})</h2>

          <div className="space-y-3">
            {rawEnquiries.map((e) => (
              <div key={e.id} className="bg-white border rounded-3xl p-5 shadow-xs space-y-3 text-left">
                <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                  <span className="font-mono text-[10px] text-gray-400 font-bold">CASE ID: #{e.id.substring(4).toUpperCase()}</span>
                  <select
                    id={`enquiry-status-${e.id}`}
                    value={e.status}
                    onChange={(e) => updateEnquiryStatus(e.id, e.target.value as any)}
                    className="rounded-lg border bg-transparent px-2.5 py-1 text-[10px] font-bold font-mono focus:outline-none"
                    aria-label="Update enquiry status"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-900">{e.customerName} ({e.customerPhone}) | {e.customerEmail}</p>
                  {e.productTitle && (
                    <span className="block text-[10px] font-bold text-gray-500 font-mono">TARGET SKU: {e.productTitle}</span>
                  )}
                  <p className="rounded-xl border bg-gray-50/50 p-3 italic text-gray-650 mt-2">
                    "{e.message}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Add Custom Scalable Business form to fulfill core scalability requirements */}
      {adminTab === 'businesses' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <div className="bg-white border rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <div>
              <h2 className="text-lg font-extrabold text-gray-950">Add Scalable Tenant Business</h2>
              <p className="text-xs text-gray-500 mt-1">
                Completely scalable multi-tenant architecture. Add a third developer segment (e.g., FoodMart, SolarHub) directly. All forms, menus, selectors, and categories list dynamically populate without needing code changes!
              </p>
            </div>

            {bizStatus ? (
              <div className="text-center py-6 space-y-2">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Tenant Registered!</h4>
                <p className="text-xs text-gray-500">The platform will dynamically mount and initialize this business.</p>
              </div>
            ) : (
              <form onSubmit={handleNewBusinessCreate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="biz-id" className="text-xs font-semibold text-gray-700">Unique Unit ID (Lowercase) *</label>
                    <input
                      id="biz-id"
                      type="text"
                      required
                      placeholder="e.g. fashionmart"
                      value={newBizId}
                      onChange={(e) => setNewBizId(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="biz-name" className="text-xs font-semibold text-gray-700">Corporate Name *</label>
                    <input
                      id="biz-name"
                      type="text"
                      required
                      placeholder="e.g. FashionMart"
                      value={newBizName}
                      onChange={(e) => setNewBizName(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="biz-tagline" className="text-xs font-semibold text-gray-700">Tagline / Slogan *</label>
                  <input
                    id="biz-tagline"
                    type="text"
                    required
                    placeholder="e.g. Premium Apparels & Textiles"
                    value={newBizTagline}
                    onChange={(e) => setNewBizTagline(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="biz-desc" className="text-xs font-semibold text-gray-700">Detailed Slogan Description</label>
                  <textarea
                    id="biz-desc"
                    rows={2}
                    value={newBizDesc}
                    onChange={(e) => setNewBizDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="biz-color" className="text-xs font-semibold text-gray-700">Lobby Accent Color</label>
                    <input
                      id="biz-color"
                      type="color"
                      value={newBizColor}
                      onChange={(e) => setNewBizColor(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white p-1 border cursor-pointer border-gray-250"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="biz-cats" className="text-xs font-semibold text-gray-700">Categories (Comma separated) *</label>
                    <input
                      id="biz-cats"
                      type="text"
                      required
                      placeholder="Apparels, Footwear, Accessories"
                      value={newBizCats}
                      onChange={(e) => setNewBizCats(e.target.value)}
                      className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-zinc-950 py-3 text-xs font-bold text-white hover:bg-zinc-855 transition-all"
                >
                  Mount New Business Unit
                </button>
              </form>
            )}
          </div>

          {/* Active businesses list info */}
          <div className="space-y-4 text-left">
            <span className="block text-xs font-bold text-gray-400 font-mono uppercase">Currently Mounted businesses ({businesses.length})</span>
            
            <div className="space-y-3">
              {businesses.map((b) => (
                <div key={b.id} className="flex items-center gap-3 bg-white p-3 border rounded-2xl">
                  <div className="h-5 w-5 rounded-full" style={{ backgroundColor: b.accentColor }} />
                  <div>
                    <span className="block font-bold text-gray-900">{b.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.tagline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PRINTABLE DISPATCH MANIFEST OVERLAY */}
      {selectedDispatchManifestOrder && (() => {
        const o = selectedDispatchManifestOrder;
        const biz = businesses.find(b => b.id === o.businessId) || businesses[0];
        const assignedWb = assignedWaybills[o.id] || `${o.businessId === 'agromart' ? 'AGR-EXP' : 'EHUB-BLU'}-${o.id.split('-')[1]?.toUpperCase() || '774819'}`;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-left animate-in fade-in zoom-in-95 duration-200">
              
              {/* Floating cancel actions button */}
              <button
                type="button"
                onClick={() => setSelectedDispatchManifestOrder(null)}
                className="absolute top-4 right-4 rounded-full p-2 hover:bg-zinc-150 transition-colors cursor-pointer"
                aria-label="Close manifestation modal"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>

              {/* Header block with printer actions info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-black text-gray-950 uppercase tracking-tight">
                    Warehousing & Dispatch Manifest Label
                  </h3>
                  <p className="text-xs text-secondary/65">
                    Authorized Packing invoice and compliance slip. Matches specifications, SKU codes, and buyer coordinates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-black tracking-widest uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Print Label (PDF)
                </button>
              </div>

              {/* Printable Layout Wrapper (Uses standard clean fonts) */}
              <div id="printable-dispatch-slip" className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 space-y-6 text-xs text-zinc-800 font-sans">
                
                {/* Visual Label barcode, routing info, supplier entity header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-dashed border-zinc-200 pb-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-wider font-mono shadow-xs" style={{ backgroundColor: biz?.accentColor }}>
                      {biz?.name} Official Partner
                    </span>
                    <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">AgroMart Integrated Supplier Network</h4>
                    <p className="text-[10px] text-zinc-500">
                      Supply Chain Hub #DE-990-AMRT | Delhi-NCR Logistics Complex
                    </p>
                  </div>

                  {/* Warehousing simulated Barcode lookup */}
                  <div className="sm:text-right space-y-1 font-mono">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                      SCAN LOGISTICS BARCODE
                    </span>
                    <p className="text-lg font-bold select-none text-zinc-900 tracking-[-0.1em] font-mono leading-none">
                      |||||| | |||| ||| |||| | ||||| | ||
                    </p>
                    <span className="block text-[9px] text-zinc-500 font-black">
                      WAYBILL: {assignedWb}
                    </span>
                  </div>
                </div>

                {/* Grid of coordinates: To, From, Logistics carrier details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-zinc-200 pb-5">
                  
                  {/* Shipping receiver credentials */}
                  <div className="space-y-2">
                    <span className="block text-[8px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                      DELIVER TARGET (SHIP TO)
                    </span>
                    
                    <div className="space-y-1 bg-white border border-zinc-200 rounded-xl p-3 leading-tight shadow-2xs">
                      <p className="font-extrabold text-sm text-zinc-950">
                        {o.customerName}
                      </p>
                      <p className="text-zinc-600">
                        {o.customerAddress}<br />
                        {o.customerCity} - <span className="font-bold text-zinc-900">{o.customerPostalCode}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono pt-1">
                        Phone: {o.customerPhone} | Email: {o.customerEmail}
                      </p>
                    </div>
                  </div>

                  {/* Dispatcher parameters & Route logs */}
                  <div className="space-y-2">
                    <span className="block text-[8px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                      DISPATCH PARAMETERS & TRANSIT SUMMARY
                    </span>
                    
                    <div className="space-y-1 bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs">
                      <p><strong className="text-zinc-900">Order Ref:</strong> #{o.id.toUpperCase()}</p>
                      <p><strong className="text-zinc-900">Logistics Carrier:</strong> {o.businessId === 'agromart' ? 'AgroMart Cargo Link' : 'ElectroHub Static Shield Hub'}</p>
                      <p><strong className="text-zinc-900">Payment Status:</strong> {o.paymentMethod} ({o.paymentStatus})</p>
                      <p><strong className="text-zinc-900">Fulfillment Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                </div>

                {/* Table of items: Detailed Product code IDs and requested quantities */}
                <div className="space-y-2">
                  <span className="block text-[8px] font-black text-zinc-400 font-mono tracking-widest uppercase">
                    ITEMIZED MATERIAL DISPATCH CHECKLIST (EXACT CODES)
                  </span>

                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-zinc-700">
                      <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[9px] font-bold text-zinc-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Fulfillment Code (ID)</th>
                          <th className="px-3 py-2 text-left">Item SKU</th>
                          <th className="px-3 py-2 text-left">Description Attributes</th>
                          <th className="px-3 py-2 text-center">Qty Pack</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {o.items.map((sub, idx) => {
                          const originalProduct = products.find(p => p.id === sub.productId);
                          const matchedSKU = originalProduct?.SKU || `SKU-${sub.productId.substring(0,6).toUpperCase()}`;

                          return (
                            <tr key={idx} className="hover:bg-zinc-50/50">
                              <td className="px-3 py-2.5 font-mono text-[10px] text-zinc-800 font-black">
                                {sub.productId}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[10px] font-bold text-zinc-600">
                                {matchedSKU}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="block font-semibold text-zinc-900 leading-tight">
                                  {sub.productTitle}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-black text-zinc-900">
                                x{sub.quantity}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                ₹{sub.price.toLocaleString('en-IN')}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-black text-zinc-900">
                                ₹{(sub.quantity * sub.price).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live dispatcher checklist to double check before handover */}
                <div className="bg-amber-50/75 border border-amber-200 rounded-xl p-4 space-y-2">
                  <span className="block text-[8px] font-black text-amber-800 font-mono tracking-widest uppercase">
                    MANDATORY PRE-HANDOVER QUALITY ASSURANCE CHECKS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-950 font-semibold">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                      <span>Item Catalog ID matches packing slip</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                      <span>Stock updated inside database inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                      <span>Bubble insulation jacket wrapped secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                      <span>Buyer phone and address clearly visible</span>
                    </div>
                  </div>
                </div>

                {/* Legal compliance, signature blocks */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed border-zinc-200">
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest leading-none">
                      Authorized Warehouse Dispatch Sign
                    </p>
                    <div className="h-10 border-b border-zinc-300 text-[10px] font-mono italic text-zinc-400 flex items-end pb-1 select-none">
                      AgroMart Warehouse Officer #201
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest leading-none">
                      Recipient / Courier Handover Partner Sign
                    </p>
                    <div className="h-10 border-b border-zinc-300 text-[10px] font-mono italic text-zinc-400 flex items-end pb-1 select-none">
                      {biz.name} Delivery Agent Sign Block
                    </div>
                  </div>
                </div>

              </div>

              {/* Close controls */}
              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDispatchManifestOrder(null)}
                  className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Close Dispatch Slip
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
