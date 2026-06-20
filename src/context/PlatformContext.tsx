import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Business, Category, Product, CartItem, Order, Enquiry, Booking, Notification, Customer, AllowedAction } from '../types';
import { loadDB, saveDB, LocalDB } from '../data';

interface PlatformContextProps {
  // DB State
  db: LocalDB;
  activeBusiness: Business;
  setActiveBusinessId: (id: string) => void;
  businesses: Business[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  enquiries: Enquiry[];
  bookings: Booking[];
  notifications: Notification[];

  // Admin Config Adding
  addCustomBusiness: (business: Business, initialCats: Category[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  bulkAddProducts: (newProds: Omit<Product, 'id'>[]) => void;
  bulkEditProducts: (ids: string[], updated: Partial<Product>) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  editProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, newQty: number) => void;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  updateEnquiryStatus: (enquiryId: string, status: Enquiry['status']) => void;

  // Shopping flow
  carts: Record<string, CartItem[]>; // businessId -> CartItem[]
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (businessId: string, productId: string) => void;
  updateCartQuantity: (businessId: string, productId: string, qty: number) => void;
  clearCart: (businessId: string) => void;

  // Transactions
  placeOrder: (
    customerInfo: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
    },
    paymentMethod: Order['paymentMethod']
  ) => Order | null;
  submitEnquiry: (customerInfo: { name: string; phone: string; email: string; message: string }, productId?: string) => void;
  createBooking: (customerInfo: { name: string; phone: string; email: string; notes: string }, productId: string, date: string, time: string) => void;

  // Users & Analytics
  activeUser: { name: string; email: string; phone: string; address: string } | null;
  updateActiveProfile: (profile: { name: string; email: string; phone: string; address: string }) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  currentScreen: string; // 'home' | 'catalog' | 'detail' | 'cart' | 'checkout' | 'profile' | 'admin' | 'orders-tracker'
  setCurrentScreen: (screen: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Notification Management
  dismissNotification: (id: string) => void;
  markNotificationsAsRead: (isAdmin: boolean) => void;
  addNotification: (type: Notification['type'], title: string, message: string, isAdmin: boolean, businessId?: string, orderId?: string) => void;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<LocalDB>(() => {
    const rawDB = loadDB();
    // Auto-repair any products that have mapped categoryId belonging to a different businessId
    let repaired = false;
    const repairedProducts = rawDB.products.map(p => {
      const matchedCat = rawDB.categories.find(c => c.id === p.categoryId);
      if (matchedCat && matchedCat.businessId !== p.businessId) {
        repaired = true;
        return {
          ...p,
          businessId: matchedCat.businessId,
          tags: p.tags ? Array.from(new Set([...p.tags, matchedCat.businessId])) : [p.categoryId, matchedCat.businessId]
        };
      }
      return p;
    });
    if (repaired) {
      const cleanDB = { ...rawDB, products: repairedProducts };
      saveDB(cleanDB);
      return cleanDB;
    }
    return rawDB;
  });
  const [activeBusinessId, setActiveBusinessId] = useState<string>('agromart');
  const [carts, setCarts] = useState<Record<string, CartItem[]>>(() => {
    try {
      const rawCart = localStorage.getItem('unified_multimerchant_carts');
      return rawCart ? JSON.parse(rawCart) : {};
    } catch {
      return {};
    }
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeUser, setActiveUser] = useState<{ name: string; email: string; phone: string; address: string } | null>(() => {
    try {
      const rawUser = localStorage.getItem('unified_multimerchant_active_user');
      if (rawUser) return JSON.parse(rawUser);
    } catch {}
    // Default logged-in simulated customer profile
    return {
      name: 'Ramesh Patel',
      email: 'ramesh.patel@gmail.com',
      phone: '+91 98765 43210',
      address: 'Plot No. 42, Green Farms Colony, Sector-5, Near Toll Plaza',
    };
  });

  // Keep carts saved
  useEffect(() => {
    localStorage.setItem('unified_multimerchant_carts', JSON.stringify(carts));
  }, [carts]);

  // Keep user profile saved
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('unified_multimerchant_active_user', JSON.stringify(activeUser));
    }
  }, [activeUser]);

  // Helper to commit DB to state and storage
  const updateDB = (newDb: LocalDB) => {
    setDb(newDb);
    saveDB(newDb);
  };

  const activeBusiness = db.businesses.find(b => b.id === activeBusinessId) || db.businesses[0];

  // Helper to generate a notification
  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    isAdmin: boolean,
    businessId?: string,
    orderId?: string
  ) => {
    const freshNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId: businessId || activeBusinessId,
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      isAdmin,
      orderId,
    };
    updateDB({
      ...db,
      notifications: [freshNotif, ...db.notifications],
    });
  };

  // Switch Active Business Scoping
  const handleSetActiveBusiness = (id: string) => {
    setActiveBusinessId(id);
    setSearchQuery(''); // reset search
  };

  const updateActiveProfile = (profile: { name: string; email: string; phone: string; address: string }) => {
    setActiveUser(profile);
  };

  // Add highly scalable Business
  const addCustomBusiness = (business: Business, initialCats: Category[]) => {
    const updatedBusinesses = [...db.businesses, business];
    const updatedCategories = [...db.categories, ...initialCats];
    updateDB({
      ...db,
      businesses: updatedBusinesses,
      categories: updatedCategories,
    });
    addNotification('system', `New Business: ${business.name}`, `Business platform now dynamically hosts ${business.name}!`, true, business.id);
  };

  // Add Product (CRUD)
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const matchedCategory = db.categories.find(c => c.id === newProd.categoryId);
    const targetBusinessId = matchedCategory?.businessId || newProd.businessId;
    const fullProd: Product = {
      ...newProd,
      businessId: targetBusinessId,
      id: newId,
      availability: newProd.stock > 10 ? 'in-stock' : newProd.stock > 0 ? 'low-stock' : 'out-of-stock',
    };
    updateDB({
      ...db,
      products: [...db.products, fullProd],
    });
    addNotification('system', 'Product Registered', `Added a new product "${fullProd.title}" under SKU ${fullProd.SKU}.`, true, fullProd.businessId);
  };

  // Edit Product (CRUD)
  const editProduct = (id: string, updated: Partial<Product>) => {
    const updatedProducts = db.products.map(p => {
      if (p.id === id) {
        const stockVal = updated.stock !== undefined ? updated.stock : p.stock;
        const avail: Product['availability'] = stockVal > 10 ? 'in-stock' : stockVal > 0 ? 'low-stock' : 'out-of-stock';
        return {
          ...p,
          ...updated,
          availability: avail,
          stock: stockVal,
        };
      }
      return p;
    });
    updateDB({
      ...db,
      products: updatedProducts,
    });
    const currentProd = db.products.find(item => item.id === id);
    if (currentProd) {
      addNotification('system', 'Product Config Updated', `Attributes for SKU ${currentProd.SKU} successfully adjusted.`, true, currentProd.businessId);
    }
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    updateDB({
      ...db,
      products: db.products.filter(p => p.id !== id),
    });
  };

  // Bulk Add Products
  const bulkAddProducts = (newProds: Omit<Product, 'id'>[]) => {
    const startId = Date.now();
    const formatted: Product[] = newProds.map((prod, idx) => {
      const matchedCategory = db.categories.find(c => c.id === prod.categoryId);
      const targetBusinessId = matchedCategory?.businessId || prod.businessId;
      return {
        ...prod,
        businessId: targetBusinessId,
        id: `prod-bulk-${startId}-${idx}-${Math.floor(Math.random() * 1000)}`,
        availability: prod.stock > 10 ? 'in-stock' : prod.stock > 0 ? 'low-stock' : 'out-of-stock',
      };
    });
    updateDB({
      ...db,
      products: [...db.products, ...formatted],
    });
    addNotification('system', 'Bulk Products Loaded', `Imported ${formatted.length} products to active inventory catalogs.`, true, formatted[0]?.businessId || 'agromart');
  };

  // Bulk Edit Products
  const bulkEditProducts = (ids: string[], updated: Partial<Product>) => {
    const updatedProducts = db.products.map(p => {
      if (ids.includes(p.id)) {
        let stockVal = p.stock;
        if (updated.stock !== undefined && typeof updated.stock === 'number') {
          stockVal = updated.stock;
        }
        const avail: Product['availability'] = stockVal > 10 ? 'in-stock' : stockVal > 0 ? 'low-stock' : 'out-of-stock';
        return {
          ...p,
          ...updated,
          availability: avail,
          stock: stockVal
        };
      }
      return p;
    });
    updateDB({
      ...db,
      products: updatedProducts,
    });
    addNotification('system', 'Bulk Update Safe', `Modified ${ids.length} selected products in catalog.`, true);
  };

  // Bulk Delete Products
  const bulkDeleteProducts = (ids: string[]) => {
    updateDB({
      ...db,
      products: db.products.filter(p => !ids.includes(p.id)),
    });
    addNotification('system', 'Bulk Delete Completed', `Removed ${ids.length} selected products from catalog.`, true);
  };

  // Quick stock adjuster
  const updateStock = (productId: string, newQty: number) => {
    editProduct(productId, { stock: Math.max(0, newQty) });
  };

  // Update Status Admin
  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    const updatedOrders = db.orders.map(o => {
      if (o.id === orderId) {
        return { ...o, orderStatus: status };
      }
      return o;
    });
    updateDB({ ...db, orders: updatedOrders });

    const orderObj = db.orders.find(ord => ord.id === orderId);
    if (orderObj) {
      // Notify customer
      addNotification(
        'order',
        `Order Update: ${status}`,
        `Your order #${orderId.substring(6).toUpperCase()} is now marked as "${status}".`,
        false,
        orderObj.businessId
      );
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const updatedBookings = db.bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status };
      }
      return b;
    });
    updateDB({ ...db, bookings: updatedBookings });

    const bookingObj = db.bookings.find(b => b.id === bookingId);
    if (bookingObj) {
      // Notify customer
      addNotification(
        'booking',
        `Booking Status: ${status}`,
        `Booking for "${bookingObj.productTitle}" has been "${status}".`,
        false,
        bookingObj.businessId
      );
    }
  };

  const updateEnquiryStatus = (enquiryId: string, status: Enquiry['status']) => {
    const updatedEnquiries = db.enquiries.map(e => {
      if (e.id === enquiryId) {
        return { ...e, status };
      }
      return e;
    });
    updateDB({ ...db, enquiries: updatedEnquiries });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    const bId = product.businessId;
    const currentBusinessCart = carts[bId] || [];
    const existingIndex = currentBusinessCart.findIndex(item => item.product.id === product.id);

    let updatedCart = [...currentBusinessCart];
    if (existingIndex > -1) {
      const nextQty = updatedCart[existingIndex].quantity + quantity;
      if (nextQty <= product.stock) {
        updatedCart[existingIndex].quantity = nextQty;
      }
    } else {
      updatedCart.push({ product, quantity: Math.min(quantity, product.stock) });
    }

    setCarts({
      ...carts,
      [bId]: updatedCart,
    });

    addNotification('system', 'Added to Cart', `Added ${product.title} to your ${db.businesses.find(b => b.id === bId)?.name} cart.`, false, bId);
  };

  const removeFromCart = (businessId: string, productId: string) => {
    const bCart = carts[businessId] || [];
    const updated = bCart.filter(item => item.product.id !== productId);
    setCarts({
      ...carts,
      [businessId]: updated,
    });
  };

  const updateCartQuantity = (businessId: string, productId: string, qty: number) => {
    const bCart = carts[businessId] || [];
    const productItem = db.products.find(p => p.id === productId);
    if (!productItem) return;

    const validatedQty = Math.max(1, Math.min(qty, productItem.stock));
    const updated = bCart.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: validatedQty };
      }
      return item;
    });

    setCarts({
      ...carts,
      [businessId]: updated,
    });
  };

  const clearCart = (businessId: string) => {
    setCarts({
      ...carts,
      [businessId]: [],
    });
  };

  // Complete Checkout Flow
  const placeOrder = (
    customerInfo: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
    },
    paymentMethod: Order['paymentMethod']
  ) => {
    const activeCart = carts[activeBusinessId] || [];
    if (activeCart.length === 0) return null;

    // Check if enough stock exists & lock/reduce stock!
    const updatedProducts = [...db.products];
    const itemsList: Order['items'] = [];
    let subtotal = 0;

    for (const item of activeCart) {
      const prodInDb = updatedProducts.find(p => p.id === item.product.id);
      if (!prodInDb || prodInDb.stock < item.quantity) {
        // Not enough stock
        alert(`Sorry, insufficient stock for ${item.product.title}. Only ${prodInDb?.stock || 0} unit(s) available.`);
        return null;
      }

      // Decrement stock
      prodInDb.stock -= item.quantity;
      if (prodInDb.stock <= 0) {
        prodInDb.availability = 'out-of-stock';
      } else if (prodInDb.stock <= 10) {
        prodInDb.availability = 'low-stock';
      }

      const exactPrice = prodInDb.salePrice || prodInDb.price;
      subtotal += exactPrice * item.quantity;

      itemsList.push({
        productId: prodInDb.id,
        productTitle: prodInDb.title,
        productImage: prodInDb.image,
        quantity: item.quantity,
        price: exactPrice,
      });
    }

    // Calculations
    const tax = Math.round(subtotal * 0.18); // Simulated 18% GST/Tax
    const delivery = subtotal > 1500 ? 0 : 150; // Free delivery over ₹1500
    const total = subtotal + tax + delivery;

    const orderId = `order-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      businessId: activeBusinessId,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      customerAddress: customerInfo.address,
      customerCity: customerInfo.city,
      customerPostalCode: customerInfo.postalCode,
      items: itemsList,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      subtotal,
      tax,
      delivery,
      total,
      createdAt: new Date().toISOString(),
    };

    // Save and wipe cart
    updateDB({
      ...db,
      products: updatedProducts,
      orders: [newOrder, ...db.orders],
    });

    setCarts({
      ...carts,
      [activeBusinessId]: [],
    });

    // Fire notifications
    // Admin alert
    addNotification(
      'order',
      'New Order Received',
      `Order #${orderId.toUpperCase()} placed by ${customerInfo.name} for ₹${total.toLocaleString('en-IN')}`,
      true,
      activeBusinessId,
      orderId
    );
    // Customer alert
    addNotification(
      'order',
      'Order Confirmed',
      `Thank you! Your order #${orderId.toUpperCase()} values ₹${total.toLocaleString('en-IN')} has been logged.`,
      false,
      activeBusinessId,
      orderId
    );

    return newOrder;
  };

  // Submit Enquiry
  const submitEnquiry = (customerInfo: { name: string; phone: string; email: string; message: string }, productId?: string) => {
    let prodTitle = '';
    if (productId) {
      prodTitle = db.products.find(p => p.id === productId)?.title || '';
    }

    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      businessId: activeBusinessId,
      productId,
      productTitle: prodTitle || undefined,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      message: customerInfo.message,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    updateDB({
      ...db,
      enquiries: [newEnquiry, ...db.enquiries],
    });

    // Notify info
    addNotification(
      'enquiry',
      'New Customer Enquiry',
      `Inquiry placed by ${customerInfo.name} ${productId ? `regarding "${prodTitle}"` : ''}`,
      true
    );
    addNotification(
      'enquiry',
      'Enquiry Registered',
      `We received your request! A specialist from ${activeBusiness.name} will reach out coordinates provided shortly.`,
      false
    );
  };

  // Schedule Booking
  const createBooking = (
    customerInfo: { name: string; phone: string; email: string; notes: string },
    productId: string,
    date: string,
    time: string
  ) => {
    const productObj = db.products.find(p => p.id === productId);
    const prodTitle = productObj ? productObj.title : 'Service Demo';

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      businessId: activeBusinessId,
      productId,
      productTitle: prodTitle,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      notes: customerInfo.notes,
      date,
      time,
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };

    updateDB({
      ...db,
      bookings: [newBooking, ...db.bookings],
    });

    // Notify booking states
    addNotification(
      'booking',
      'New Appointment Scheduled',
      `Demo/Installation requested by ${customerInfo.name} for "${prodTitle}" on ${date} at ${time}.`,
      true
    );
    addNotification(
      'booking',
      'Booking Request Saved',
      `Your service request for "${prodTitle}" on ${date} at ${time} is pending validation.`,
      false
    );
  };

  const dismissNotification = (id: string) => {
    updateDB({
      ...db,
      notifications: db.notifications.filter(n => n.id !== id),
    });
  };

  const markNotificationsAsRead = (isAdmin: boolean) => {
    const updated = db.notifications.map(n => {
      if (n.isAdmin === isAdmin) {
        return { ...n, read: true };
      }
      return n;
    });
    updateDB({ ...db, notifications: updated });
  };

  return (
    <PlatformContext.Provider
      value={{
        db,
        activeBusiness,
        setActiveBusinessId: handleSetActiveBusiness,
        businesses: db.businesses,
        categories: db.categories,
        products: db.products,
        orders: db.orders,
        enquiries: db.enquiries,
        bookings: db.bookings,
        notifications: db.notifications,

        addCustomBusiness,
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

        carts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        placeOrder,
        submitEnquiry,
        createBooking,

        activeUser,
        updateActiveProfile,
        isAdminMode,
        setIsAdminMode,
        currentScreen,
        setCurrentScreen,
        selectedProductId,
        setSelectedProductId,

        searchQuery,
        setSearchQuery,
        
        dismissNotification,
        markNotificationsAsRead,
        addNotification,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
