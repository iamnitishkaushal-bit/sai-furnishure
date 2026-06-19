import { Business, Category, Product, Order, Enquiry, Booking, Notification } from './types';

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'agromart',
    name: 'AgroMart',
    tagline: 'Premium Seeds, Fertilizers & Farming Equipment',
    logo: 'Sprout',
    accentColor: '#E5A50A', // Premium Gold
    description: 'Your reliable farm partner offering state-of-the-art agricultural tools, high-yield organic seeds, custom-formulated fertilizers, and modern water management solutions designed for smart farmers.'
  },
  {
    id: 'electrohub',
    name: 'ElectroHub',
    tagline: 'Modern Electronics, Laptops & Appliances',
    logo: 'Cpu',
    accentColor: '#FBC336', // Bright Yellow/Gold accent
    description: 'A premium smart-living store providing direct access to next-gen computing systems, high-definition entertainment systems, energy-efficient appliances, and durable power backups.'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  // AgroMart Categories
  { id: 'seeds', businessId: 'agromart', name: 'Seeds', icon: 'Leaf' },
  { id: 'fertilizers', businessId: 'agromart', name: 'Fertilizers', icon: 'Sparkles' },
  { id: 'equipment', businessId: 'agromart', name: 'Equipment', icon: 'Wrench' },
  { id: 'tools', businessId: 'agromart', name: 'Tools', icon: 'Hammer' },
  { id: 'irrigation', businessId: 'agromart', name: 'Irrigation', icon: 'Droplets' },

  // ElectroHub Categories
  { id: 'mobiles', businessId: 'electrohub', name: 'Mobiles', icon: 'Smartphone' },
  { id: 'laptops', businessId: 'electrohub', name: 'Laptops', icon: 'Laptop' },
  { id: 'tvs', businessId: 'electrohub', name: 'TVs', icon: 'Tv' },
  { id: 'accessories', businessId: 'electrohub', name: 'Accessories', icon: 'Headphones' },
  { id: 'appliances', businessId: 'electrohub', name: 'Appliances', icon: 'Tv2' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // AgroMart Products
  {
    id: 'agro-1',
    businessId: 'agromart',
    categoryId: 'seeds',
    title: 'Hybrid Tomato Seeds (F1)',
    description: 'High-yield hybrid tomato seeds with disease resistance and high uniformity. Perfect for commercial greenhouse or open-field cultivation. Yields vibrant, firm, juicy tomatoes, highly coveted by quality-sensitive food distributors.',
    image: '#FF6347', // Tomato color gradient descriptor
    price: 450,
    salePrice: 399,
    stock: 120,
    SKU: 'AG-TOM-001',
    availability: 'in-stock',
    specifications: {
      'Purity': '99%',
      'Germination Rate': '92%',
      'Maturity Period': '65-70 Days',
      'Package Size': '50 Grams (~15,000 Seeds)'
    },
    tags: ['Hybrid', 'Tomatoes', 'High-Yield', 'Organic-Grade'],
    allowedActions: ['buy', 'enquire']
  },
  {
    id: 'agro-2',
    businessId: 'agromart',
    categoryId: 'seeds',
    title: 'Premium Sharbati Wheat Seeds',
    description: 'Elite Sharbati wheat seeds, globally famous for making premium golden-crusted, soft flatbreads. Flour yields exceptional elasticity. Highly drought-tolerant wheat breed developed for dry and sandy soil setups.',
    image: '#F5DEB3', // Wheat Color
    price: 1800,
    stock: 50,
    SKU: 'AG-WHE-002',
    availability: 'in-stock',
    specifications: {
      'Type': 'Kanak Sharbati Premium',
      'Bag Size': '40 KG Bag',
      'Water Requirement': 'Minimal (Drought Hardy)',
      'Acre Rate': '40 KG / Acre'
    },
    tags: ['Wheat', 'Sharbati', 'Drought-Tolerant', 'High-Gluten'],
    allowedActions: ['buy', 'enquire']
  },
  {
    id: 'agro-3',
    businessId: 'agromart',
    categoryId: 'equipment',
    title: 'High-Pressure Tractor Sprayer',
    description: 'Heavy-duty 16-nozzle spray gun system that links directly to tractor PTO shafts. Includes built-in double filtration system, dynamic anti-clog valves, and 500-liter reinforced anti-UV chemical reservoir.',
    image: '#2E8B57', // Forest Green
    price: 45000,
    salePrice: 42500,
    stock: 15,
    SKU: 'AG-SPR-003',
    availability: 'in-stock',
    specifications: {
      'Tank Volume': '500 Liters',
      'Nozzles': '16 Premium Brass Nozzles',
      'Operating Pressure': '150 - 250 PSI',
      'Frame Build': 'Hot-dip Galvanized Steel'
    },
    tags: ['Heavy-Duty', 'Sprayer', 'Tractor-Mount', 'Automatic'],
    allowedActions: ['enquire', 'book']
  },
  {
    id: 'agro-4',
    businessId: 'agromart',
    categoryId: 'irrigation',
    title: 'High-Volume Agricultural Water Pump',
    description: 'High-performance 5HP diesel centrifugal water pump designed for heavy irrigation. Featuring robust self-priming engineering and a highly efficient engine cycle that maximizes runtimes while managing diesel fuel consumption.',
    image: '#4682B4', // Steel Blue
    price: 14500,
    stock: 8,
    SKU: 'AG-PMP-004',
    availability: 'in-stock',
    specifications: {
      'Engine': '5 HP Single Cylinder Diesel',
      'Suction Size': '3 Inches (75mm)',
      'Max Delivery lift': '28 Meters',
      'Fuel Tank Capacity': '3.5 Liters'
    },
    tags: ['Water', 'Pumps', 'Diesel-Engine', 'Irrigation'],
    allowedActions: ['buy', 'enquire']
  },
  {
    id: 'agro-5',
    businessId: 'agromart',
    categoryId: 'equipment',
    title: 'Premium Multi-Speed Rotavator',
    description: 'Professional-grade multi-speed rotary tiller designed for rapid soil preparation. Employs 42 thick boron-steel curved blades to pulverize hard-packed dirt clumps and restore aeration in a single pass.',
    image: '#8B0000', // Dark Red
    price: 98000,
    stock: 5,
    SKU: 'AG-ROTA-005',
    availability: 'low-stock',
    specifications: {
      'Working Width': '6 Feet (72 inches)',
      'Blade Count': '42 Boron-Steel Blades',
      'Gear Box': 'Multi-speed Dual Configuration',
      'Compatible Tractor': '45 - 60 HP PTO Support'
    },
    tags: ['Rotary', 'Soil-Prep', 'Tractor-Attached', 'Durable'],
    allowedActions: ['enquire', 'book']
  },
  {
    id: 'agro-6',
    businessId: 'agromart',
    categoryId: 'fertilizers',
    title: 'Premium Neem-Coated Granulated Urea',
    description: 'High-purity technical granulated urea covered in cold-pressed organic neem extract oil. Functions as an ideal source of sustained nitrogen that delays dissolution rates, feeding fields evenly for lush vegetative density.',
    image: '#8FBC8F', // Sage green
    price: 450,
    stock: 200,
    SKU: 'AG-URE-006',
    availability: 'in-stock',
    specifications: {
      'Nitrogen Content': '46.0%',
      'Neem Extract': 'Min 350 mg / kg',
      'Bag Weight': '45 KG',
      'Form Factor': 'Semi-hard white granules'
    },
    tags: ['Organic-Coated', 'Nitrogen-Rich', 'Slow-Release', 'Urea'],
    allowedActions: ['buy']
  },

  // ElectroHub Products
  {
    id: 'elec-1',
    businessId: 'electrohub',
    categoryId: 'mobiles',
    title: 'OnePlus flagship Smartphone Pro',
    description: 'Supercharged performance powerhouse featuring the latest Snapdragon octa-core engine, immersive 120Hz LTPO display panel, and custom Sony triple camera array with optical zoom and AI night stability.',
    image: '#008080', // Teal
    price: 64999,
    salePrice: 59999,
    stock: 25,
    SKU: 'EH-PH-001',
    availability: 'in-stock',
    specifications: {
      'Processor': 'Snapdragon 8 Gen 3 (Octa-Core)',
      'RAM & Storage': '16GB LPDDR5X | 512GB UFS 4.0',
      'Battery': '5400 mAh with 100W Fast Vooc Charge',
      'Screen Size': '6.82 inches QHD+ Curved screen'
    },
    tags: ['Flagship', 'Teal-Titanium', 'Super-Vooc', 'Smartphones'],
    allowedActions: ['buy']
  },
  {
    id: 'elec-2',
    businessId: 'electrohub',
    categoryId: 'tvs',
    title: 'Samsung 55" OLED AI Smart TV',
    description: 'Immersive smart visual cinema system rendering over 1 billion stunning self-illuminating natural colors. Includes quantum dots processor that automatically upscales low resolution source signals to majestic 4K formats.',
    image: '#1E1E24', // Ultra Dark Grey
    price: 135000,
    salePrice: 119999,
    stock: 12,
    SKU: 'EH-TV-002',
    availability: 'in-stock',
    specifications: {
      'Display Technologies': 'OLED Crystal Panel',
      'Refresh Rate': '144Hz Gaming Mode',
      'Audio Output': '60W Dolby Atmos Soundbar Built-in',
      'OS Platform': 'Tizen AI Smart Hub'
    },
    tags: ['Self-Illuminating', '4K-OLED', 'Quantum-Upscaler', 'TVs'],
    allowedActions: ['buy', 'book'] // Supports TV installation booking!
  },
  {
    id: 'elec-3',
    businessId: 'electrohub',
    categoryId: 'laptops',
    title: 'Dell Inspiron Creator Pro-Specialist',
    description: 'Crafted for developers and designers alike, utilizing high-performance Multi-thread architectures and dedicated high-speed visual graphic chips. Light enough for nomads, heavy enough for render lists.',
    image: '#708090', // Slate Grey
    price: 89999,
    stock: 18,
    SKU: 'EH-LP-003',
    availability: 'in-stock',
    specifications: {
      'CPU Engine': 'Intel Core i7 13th Gen Pro-H',
      'Graphics': 'NVIDIA RTX 4050 6GB Dedicated VRAM',
      'RAM & SSD': '16GB Dual-Channel DDR5 | 1TB NVMe Gen4',
      'Body Frame': 'Full Aluminum CNC Finished Space-Grey'
    },
    tags: ['RTX-Creator', 'Developers', 'Windows-11', 'Laptops'],
    allowedActions: ['buy', 'enquire']
  },
  {
    id: 'elec-4',
    businessId: 'electrohub',
    categoryId: 'accessories',
    title: 'BoAt Basshead wireless Earbuds 7.1',
    description: 'Premium active noise-cancelling earbuds delivering deep, clear bass signatures with zero distortion. Feature IPX7 water-resistance ratings and dynamic transparency mode to ambient world awareness when jogging.',
    image: '#D63031', // Bold Crimson Red
    price: 3499,
    salePrice: 1999,
    stock: 80,
    SKU: 'EH-EB-004',
    availability: 'in-stock',
    specifications: {
      'Driver Units': '13mm Dual Titanium Drivers',
      'ANC Level': '32dB Hybrid Isolation Mode',
      'Total Playtime': '40 Hours with Type-C Case',
      'Latency Rating': '40ms Low-Latency Gaming Mode'
    },
    tags: ['Pure-Bass', 'ANC-Waterproof', 'BoAt-Brand', 'Earbuds'],
    allowedActions: ['buy']
  },
  {
    id: 'elec-5',
    businessId: 'electrohub',
    categoryId: 'appliances',
    title: 'LG 343L Double-Door Smart Refrigerator',
    description: 'Top-tier frost-free intelligent double door refrigerator featuring an advanced linear inverter compressor that maintains static interior temperature spikes, keeping greens crisper twice as long.',
    image: '#C0C0C0', // Silver
    price: 42999,
    salePrice: 38500,
    stock: 7,
    SKU: 'EH-RF-005',
    availability: 'low-stock',
    specifications: {
      'Capacity': '343 Liters',
      'Energy Rating': '4-Star Smart Saving Bureau',
      'Compressor Type': 'Direct Inverter Smart Compressor (10Y Warranty)',
      'Special Features': 'Convertible Freezer | Door Cooling+'
    },
    tags: ['Frost-Free', 'Inverter-Convertible', 'Smart-Cooling', 'Kitchen'],
    allowedActions: ['buy', 'book'] // Supports booking installation service!
  },
  {
    id: 'elec-6',
    businessId: 'electrohub',
    categoryId: 'accessories',
    title: 'Supreme Inverter Battery Combo (150AH)',
    description: 'High-purity tubular plate electrical backup battery with premium diagnostic indicators. Optimized for fast charging states during short power restoration intermissions and capable of sustained medium loads.',
    image: '#10AC84', // Mint Green / Tech-green
    price: 22000,
    stock: 14,
    SKU: 'EH-BT-006',
    availability: 'in-stock',
    specifications: {
      'Capacity Index': '150 AH with high discharge capability',
      'Tubular Type': 'Premium Tall Tubular',
      'Warranty Index': '36 Months replacement warranty',
      'Dimensions': '505mm x 190mm x 415mm'
    },
    tags: ['Tubular-Grid', 'Intense-Backup', 'Inverter-Safe', 'Batteries'],
    allowedActions: ['buy', 'enquire']
  }
];

// Helper to load application database state from LocalStorage or seed defaults
export interface LocalDB {
  businesses: Business[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  enquiries: Enquiry[];
  bookings: Booking[];
  notifications: Notification[];
}

export const loadDB = (): LocalDB => {
  const defaultDB: LocalDB = {
    businesses: INITIAL_BUSINESSES,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: [],
    enquiries: [],
    bookings: [],
    notifications: []
  };

  try {
    const raw = localStorage.getItem('unified_multimerchant_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Verify basic schema format
      if (parsed.businesses && parsed.products && parsed.categories) {
        return parsed as LocalDB;
      }
    }
  } catch (e) {
    console.error('Failed reading localStorage DB, bootstrapping original seed:', e);
  }

  // First time or corrupted - write and return default seed
  saveDB(defaultDB);
  return defaultDB;
};

export const saveDB = (db: LocalDB) => {
  try {
    localStorage.setItem('unified_multimerchant_db', JSON.stringify(db));
  } catch (e) {
    console.error('Failed saving database to localStorage:', e);
  }
};
