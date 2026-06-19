export interface Business {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  accentColor: string;
  description: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  icon: string;
}

export type AllowedAction = 'buy' | 'enquire' | 'book';

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  title: string;
  description: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
  SKU: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  specifications: Record<string, string>;
  tags: string[];
  allowedActions: AllowedAction[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Ready' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Razorpay' | 'COD' | 'Advance Payment';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPostalCode: string;
  items: {
    productId: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  createdAt: string;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Quoted' | 'Closed';

export interface Enquiry {
  id: string;
  businessId: string;
  productId?: string;
  productTitle?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export type BookingStatus = 'Requested' | 'Approved' | 'Scheduled' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  businessId: string;
  productId: string;
  productTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  businessId?: string;
  type: 'order' | 'enquiry' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  isAdmin: boolean;
}

export interface Customer {
  email: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastActive: string;
}
