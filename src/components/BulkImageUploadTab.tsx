import React, { useState, useRef } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  UploadCloud, Trash2, CheckCircle, RefreshCw, Layers, AlertCircle, 
  HelpCircle, Image as ImageIcon, Sparkles, Building, Settings, ListFilter,
  ArrowRight, RefreshCcw, Check, Plus, HardDrive
} from 'lucide-react';
import { Product, Category, AllowedAction } from '../types';

interface StagedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  objectUrl: string; // Dynamic transient preview
  seededUrl: string; // Long-term persistent seed URL
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  SKU: string;
  allowedActions: AllowedAction[];
  isSuccess: boolean;
  isRegistered: boolean;
  errorMessage?: string;
  selected?: boolean;
}

export default function BulkImageUploadTab() {
  const { 
    businesses, 
    categories, 
    addProduct, 
    bulkAddProducts, 
    products, 
    deleteProduct,
    addNotification 
  } = usePlatform();

  // Core selector states
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('agromart');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  
  // Selection or batch adjustment states
  const [globalChecked, setGlobalChecked] = useState<boolean>(false);
  const [reassignCategoryId, setReassignCategoryId] = useState<string>('');
  
  // Storage advice warning toggle
  const [usePersistedWebUrl, setUsePersistedWebUrl] = useState<boolean>(true);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter categories down based on selected business
  const businessCategories = categories.filter(c => c.businessId === selectedBusinessId);
  const activeBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];

  // Set default category when business switches
  React.useEffect(() => {
    if (businessCategories.length > 0) {
      // Find default if current category is not belongs to this business
      const belongs = businessCategories.some(c => c.id === selectedCategoryId);
      if (!belongs) {
        setSelectedCategoryId(businessCategories[0].id);
      }
    } else {
      setSelectedCategoryId('');
    }
  }, [selectedBusinessId, businessCategories]);

  // Generators for realistic content based on category & business
  const generateRealisticDemoProduct = (
    bizId: string, 
    catId: string, 
    fileName: string,
    index: number
  ): { title: string; description: string; price: number; stock: number; SKU: string; tags: string[]; allowedActions: AllowedAction[] } => {
    
    // Auto-resolve businessId based on the actual category definition mapping to prevent mismatches
    const resolvedCategory = categories.find(c => c.id === catId);
    const resolvedBizId = resolvedCategory?.businessId || bizId;

    // Clean file name
    const rawClean = fileName.split('.')[0]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const SKU = `${resolvedBizId.substring(0,3).toUpperCase()}-${catId.substring(0,3).toUpperCase()}-${randomSuffix}`;
    const stock = Math.floor(Math.random() * 140) + 10; // 10 to 150 items
    
    let title = rawClean;
    let description = "Engineered according to rigorous high-grade industrial benchmarks. Excellent performance, stable attributes, and certified raw materials.";
    let price = 499;
    let tags = [resolvedBizId, catId];
    let allowedActions: AllowedAction[] = ['buy', 'enquire'];

    if (resolvedBizId === 'agromart') {
      switch (catId) {
        case 'seeds': {
          const names = [
            "Premium Hybrid Golden Corn", "Disease-Resistant Hybrid Tomato", 
            "Organic Cluster Bean F1 Boost", "Vibrant Microgreen Salad Blend",
            "Early Harvester Smooth Ridge Gourd", "High-Yield BT Cotton Seeds"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} F1 (Pack of ${randomSuffix > 500 ? 500 : 100}g)`;
          description = "Specialized hybrid seed stock tested for high germination rates under tropical moisture levels. Features broad agricultural pest immunity.";
          price = Math.floor(Math.random() * 600) + 150;
          tags = ['Seeds', 'F1-Hybrid', 'High-Yield', 'Agro-Fresh'];
          break;
        }
        case 'fertilizers': {
          const names = [
            "Triple Action Vermicompost Humus", "Water-Soluble Urea Nitropotash Mix",
            "Pure Neem Cake Organic Pesticide", "Chelated Micronutrient Fertilizer Boost",
            "N-P-K 19:19:19 Growth Stimulator"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} (${randomSuffix > 500 ? '10kg Bulk Bag' : '2kg Pack'})`;
          description = "Scientifically balanced micro-nutrient nourishment. Imparts deep leaf shine, improves soil bio-cellular activity, and activates dense budding.";
          price = Math.floor(Math.random() * 900) + 299;
          tags = ['Fertilizer', 'Nourishment', 'Soil-Bio', 'Organic-Crop'];
          break;
        }
        case 'equipment': {
          const names = [
            "AgroJet Cordless 16L Backpack Sprayer", "Battery Operated High-Pressure Rotary Tiller",
            "Tri-Nozzle Brass Pressure Gun Assembly", "Digital Soil Moisture Probe & Analyzer"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} v${randomSuffix}`;
          description = "Durable structural framing manufactured from impact-proof reinforcement polymers. Built for long shifts in adverse open-farm environmental seasons.";
          price = Math.floor(Math.random() * 6000) + 2500;
          tags = ['Equipment', 'Farm-Machine', 'Battery-Pack', 'Sprayer'];
          break;
        }
        case 'tools': {
          const names = [
            "Hardened Carbon Steel Hand Cultivator", "Telescopic Lopping Shears with Cushion Grips",
            "High-Grade Tempered Steel Hedge Shears", "Comfort Grip Ergonomic Weed Scraper Trowel"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `AgroMax ${chosen}`;
          description = "Surgical-grade forged blades. Handles coated with anti-fatigue textured elastomer sleeves for persistent agricultural leverage.";
          price = Math.floor(Math.random() * 850) + 190;
          tags = ['Tools', 'Forged-Steel', 'Hand-Prunes', 'Durable'];
          break;
        }
        case 'irrigation': {
          const names = [
            "Drip Line Lateral Pipe (UV-Protected 16mm)", "360-Degree Adjustable Micro-Sprinklers Set",
            "Smart Bluetooth Double-Port Water Timer", "Drip Kit Emitter Micro-Tubing Hub"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} (${randomSuffix > 450 ? '100m Roll' : '50-Piece Pack'})`;
          description = "Promotes highly uniform water flow conservation directly centered near agricultural root clusters. Reduces topsoil evaporation run-off.";
          price = Math.floor(Math.random() * 1800) + 350;
          tags = ['Irrigation', 'Water-Saving', 'Dripper', 'Hose-Kit'];
          break;
        }
        default:
          break;
      }
    } else {
      // electrohub
      switch (catId) {
        case 'mobiles': {
          const names = [
            "Titanium Pro X14 Neon 5G", "VoltPrime S20 Long-Battery Node",
            "NeoGlass Quad-Camera Curved Display", "ZetaFold Dual-Screen Folding Elite"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} (${randomSuffix > 500 ? '512GB' : '256GB'} Storage)`;
          description = "Next-generation core computation processor coupled with pristine OLED contrast mapping. Experience blazing fast connectivity speeds and crystal optics.";
          price = Math.floor(Math.random() * 45000) + 14999;
          tags = ['Mobiles', '5G-LTE', 'Super AMOLED', 'Octa-Core'];
          break;
        }
        case 'laptops': {
          const names = [
            "AeroBlade Air-Light 14\" Travel", "HexaBook Pro 16\" Studio Workstation",
            "CarbonBook Elite Multi-Thread Workstation", "Dynabook Convertible 13\" Flex OLED"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `ElectroHub ${chosen}`;
          description = "Impeccably slim, cool and silently powered typing chassis. Drives compute-heavy workloads, scientific calculations, and creative production pipelines with ease.";
          price = Math.floor(Math.random() * 75000) + 29999;
          tags = ['Laptops', 'Ultrabook', 'Studio-PC', 'Extreme-Speed'];
          break;
        }
        case 'tvs': {
          const names = [
            "CineGlow 55\" QuantumDot 4K Screen", "UltraVibe 65\" High-Refresh MiniLED Smart TV",
            "VoltCast 43\" Android Cinema Display", "OnyxCurve 75\" Frameless Cinematic Soundscape TV"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} (Dolby Atmos Audio)`;
          groupDescription: title = `${chosen} (Ultra HDR)`;
          description = "High dynamic range rendering brings rich detail to movies and games. Bundles premium integrated acoustics and seamless Wi-Fi streaming hubs.";
          price = Math.floor(Math.random() * 55000) + 19999;
          tags = ['TVs', 'Smart-TV', 'Cinema-Onyx', 'HDR-MiniLED'];
          break;
        }
        case 'accessories': {
          const names = [
            "SonicBuds ANC Deep-Bass Earhooks", "Ergonomic Silent Bluetooth Pointer Mouse",
            "CoreCharge 100W GaN Triple USB Port Brick", "CyberBackpack Water-Resistant Padded Bag"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `VoltPrime ${chosen}`;
          description = "Compact form factors optimized to streamline high-frequency executive workflows. Highly durable insulation elements and safety surge protection.";
          price = Math.floor(Math.random() * 3200) + 499;
          tags = ['Accessories', 'Wireless-Node', 'GaN-Core', 'Durable'];
          break;
        }
        case 'appliances': {
          const names = [
            "AeroFry 5L Smart Hot-Air Fryer", "VoltChill Direct-Cool Double Door Refrigerator",
            "HEPA Multi-Stage Active Air Purifier", "ThermoJet 15-Bar Professional Espresso System"
          ];
          const chosen = names[(index + randomSuffix) % names.length];
          title = `${chosen} (Home Comfort Series)`;
          description = "Micro-controlled power cycles conserve grid electricity. Simplifies household chores with visual digital status counters.";
          price = Math.floor(Math.random() * 22000) + 2900;
          tags = ['Appliances', 'Kitchen-Tech', 'Inverter-Drive', 'Convenient'];
          break;
        }
        default:
          break;
      }
    }

    return { title, description, price, stock, SKU, tags, allowedActions };
  };

  // Helper: Generates beautiful random Picsum URLs based on category/term
  const getCategorySeedUrl = (catId: string, index: number): string => {
    const termsMap: Record<string, string[]> = {
      seeds: ['seeds', 'fields', 'seedlings', 'farming'],
      fertilizers: ['soil', 'fertilizer', 'gardening', 'roots'],
      equipment: ['tractor', 'sprayer', 'greenhouse', 'irrigation'],
      tools: ['shears', 'shovel', 'pruner', 'gardening-tools'],
      irrigation: ['sprinkler', 'dripper', 'water-hose', 'farm-water'],
      mobiles: ['smartphone', 'iphone', 'android-phone', 'cellphone'],
      laptops: ['laptop', 'macbook', 'workstation', 'notebook-pc'],
      tvs: ['television', 'smart-tv', 'flat-screen', 'led-tv'],
      accessories: ['headphones', 'mouse-computational', 'powerbank', 'adapter'],
      appliances: ['airfryer', 'refrigerator', 'air-purifier', 'coffee-maker']
    };
    const terms = termsMap[catId] || ['product', 'agriculture', 'technology'];
    const selectedTerm = terms[index % terms.length];
    return `https://picsum.photos/seed/${encodeURIComponent(selectedTerm + index * 14)}/500/375`;
  };

  // Drag and Drop core triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Safe file reader processing
  const processFiles = (filesList: FileList) => {
    setUploadStatusText('Analyzing image headers and preparing metadata profiles...');
    setUploadProgress(10);
    
    // We parse up to 120 files in a single batch
    const files = Array.from(filesList).slice(0, 120);
    const resolvedStaged: StagedFile[] = [];

    // Let's loop asynchronously
    let completedCount = 0;
    
    files.forEach((file, index) => {
      // Validate is image
      if (!file.type.startsWith('image/')) {
        completedCount++;
        if (completedCount === files.length) {
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(null), 1500);
        }
        return;
      }

      // Generate localized temporary Object URL
      const objectUrl = URL.createObjectURL(file);
      const catVal = selectedCategoryId || (businessCategories[0]?.id || 'seeds');
      const seededUrl = getCategorySeedUrl(catVal, stagedFiles.length + index);

      // Generate intelligent mock specifications
      const mockProps = generateRealisticDemoProduct(selectedBusinessId, catVal, file.name, stagedFiles.length + index);

      const stagedItem: StagedFile = {
        id: `staged-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        objectUrl,
        seededUrl,
        title: mockProps.title,
        description: mockProps.description,
        price: mockProps.price,
        stock: mockProps.stock,
        categoryId: catVal,
        SKU: mockProps.SKU,
        allowedActions: mockProps.allowedActions,
        isSuccess: true,
        isRegistered: false,
        selected: false
      };

      resolvedStaged.push(stagedItem);
      completedCount++;
    });

    setStagedFiles(prev => [...prev, ...resolvedStaged]);
    setUploadProgress(100);
    setUploadStatusText(`Successfully ingested ${resolvedStaged.length} image files. Demo metrics generated instantly.`);
    
    // Clear the progress bar soon
    setTimeout(() => {
      setUploadProgress(null);
      setUploadStatusText('');
    }, 2500);

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Regenerate individual demo attributes
  const handleRegenerateProduct = (id: string, index: number) => {
    setStagedFiles(prev => prev.map(item => {
      if (item.id === id) {
        const fresh = generateRealisticDemoProduct(selectedBusinessId, item.categoryId, item.name, index + Math.floor(Math.random() * 50));
        return {
          ...item,
          title: fresh.title,
          description: fresh.description,
          price: fresh.price,
          stock: fresh.stock,
          SKU: fresh.SKU,
          allowedActions: fresh.allowedActions
        };
      }
      return item;
    }));
  };

  // Bulk Regenerate selected products parameters
  const handleBulkRegenerate = () => {
    const selectedIds = stagedFiles.filter(f => f.selected).map(f => f.id);
    if (selectedIds.length === 0) {
      alert("Please select at least one staged image from the preview grid below.");
      return;
    }

    setStagedFiles(prev => prev.map((item, idx) => {
      if (selectedIds.includes(item.id)) {
        const fresh = generateRealisticDemoProduct(selectedBusinessId, item.categoryId, item.name, idx + Math.floor(Math.random() * 50));
        return {
          ...item,
          title: fresh.title,
          description: fresh.description,
          price: fresh.price,
          stock: fresh.stock,
          SKU: fresh.SKU,
          allowedActions: fresh.allowedActions
        };
      }
      return item;
    }));

    addNotification(
      'system',
      'Batch Regeneator Active',
      `Regenerated metadata parameters for ${selectedIds.length} chosen products.`,
      true,
      selectedBusinessId
    );
  };

  // Reassign Category in bulk for selected
  const handleBulkReassignCategory = () => {
    if (!reassignCategoryId) {
      alert("Please choose a target category to reassign.");
      return;
    }
    const selectedIds = stagedFiles.filter(f => f.selected).map(f => f.id);
    if (selectedIds.length === 0) {
      alert("No staged items selected. Tag the checkboxes in the image preview grid.");
      return;
    }

    const targetCat = categories.find(c => c.id === reassignCategoryId);
    const targetBusinessIdForReassign = targetCat?.businessId || selectedBusinessId;

    setStagedFiles(prev => prev.map((item, idx) => {
      if (selectedIds.includes(item.id)) {
        // Since category changed, let's also regenerate specifications/titles to fit nicely
        const fresh = generateRealisticDemoProduct(targetBusinessIdForReassign, reassignCategoryId, item.name, idx + 10);
        return {
          ...item,
          categoryId: reassignCategoryId,
          seededUrl: getCategorySeedUrl(reassignCategoryId, idx),
          title: fresh.title,
          description: fresh.description,
          price: fresh.price,
          SKU: fresh.SKU
        };
      }
      return item;
    }));

    addNotification(
      'system',
      'Category Batch Updated',
      `Reassigned category and refreshed mock specifications for ${selectedIds.length} staged pictures.`,
      true,
      targetBusinessIdForReassign
    );
  };

  // Delete specific staged item
  const handleDeleteStagedItem = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Bulk Delete selected staged items
  const handleBulkDeleteStaged = () => {
    const toDeleteCount = stagedFiles.filter(f => f.selected).length;
    if (toDeleteCount === 0) {
      alert("Select items using the checkboxes first.");
      return;
    }
    setStagedFiles(prev => prev.filter(f => !f.selected));
    setGlobalChecked(false);
  };

  // Toggle selection states
  const handleToggleSelectAll = (checked: boolean) => {
    setGlobalChecked(checked);
    setStagedFiles(prev => prev.map(f => ({ ...f, selected: checked })));
  };

  const handleToggleSelectItem = (id: string, checked: boolean) => {
    setStagedFiles(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, selected: checked } : f);
      setGlobalChecked(updated.every(f => f.selected) && updated.length > 0);
      return updated;
    });
  };

  // Add all staged products into actual user-facing PlatformContext database
  const handleDeployAllStaged = () => {
    if (stagedFiles.length === 0) {
      alert("There are no staged items to deploy. Please drop or choose images first.");
      return;
    }

    setUploadProgress(30);
    setUploadStatusText('Converting images and uploading to structural store database...');

    // Prepare products schemas
    const productsToDeploy: Omit<Product, 'id'>[] = stagedFiles.map(f => {
      // Choose transient blob URL (createObjectURL) or stable seeded categories URLs based on standard setting
      const finalImgSrc = usePersistedWebUrl ? f.seededUrl : f.objectUrl;
      
      const matchedCategory = categories.find(c => c.id === f.categoryId);
      const targetBusinessId = matchedCategory?.businessId || selectedBusinessId;
      const matchedBiz = businesses.find(b => b.id === targetBusinessId);
      
      // Seed detailed physical/technical specs for high-fidelity lookup
      const defaultSpecs: Record<string, string> = {
        "Brand": matchedBiz?.name || "Premium Partner",
        "Source Class": "Standard Bulk Registry Unit",
        "Category Code": matchedCategory?.name || "Active Catalog",
        "Authenticity Log": "Clear - Factory Certified Seal"
      };

      if (f.categoryId === 'seeds') {
        defaultSpecs["Germination Standard"] = "92% Minimum Testing";
        defaultSpecs["Physical Purity"] = "99.2% Standard Grade";
      } else if (f.categoryId === 'mobiles' || f.categoryId === 'laptops' || f.categoryId === 'tvs') {
        defaultSpecs["Cell Capacity"] = "Lithium Stable Core Injected";
        defaultSpecs["System Operating Code"] = "Dual Inbuilt Inverter Framework";
      }

      return {
        businessId: targetBusinessId,
        categoryId: f.categoryId,
        title: f.title,
        description: f.description,
        image: finalImgSrc,
        price: f.price,
        stock: f.stock,
        SKU: f.SKU,
        availability: f.stock > 10 ? 'in-stock' : f.stock > 0 ? 'low-stock' : 'out-of-stock',
        specifications: defaultSpecs,
        tags: [f.categoryId, targetBusinessId, 'Bulk-Ingested'],
        allowedActions: f.allowedActions
      };
    });

    // Deploy to dynamic server-side context block
    bulkAddProducts(productsToDeploy);

    setUploadProgress(100);
    setUploadStatusText('Deployment complete! All products are now public-facing and completely operational.');
    
    // Clear staged lists as they are successfully registered!
    setStagedFiles([]);
    setGlobalChecked(false);

    const primaryBizId = productsToDeploy[0]?.businessId || selectedBusinessId;

    addNotification(
      'system',
      'Bulk Catalog Deployed',
      `Successfully registered ${productsToDeploy.length} products to active retail storefronts instantly.`,
      true,
      primaryBizId
    );

    setTimeout(() => {
      setUploadProgress(null);
      setUploadStatusText('');
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Banner / Header Title Block */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <HardDrive className="h-32 w-32 text-white" />
        </div>
        
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Operational Bulk Media Ingestor v3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Bulk Product Generator & Image Register
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
            Deploy a complete range of 100+ simulated demo products instantly. Drop photography snapshots, specify tags, and let the smart engine synthesize titles, descriptions, catalog spec-sheets, and pricing matrices automatically.
          </p>
        </div>
      </div>

      {/* Grid: Configurations Controls Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Parameters controls */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-5 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Building className="h-4 w-4 text-amber-600" />
              1. Target Subsystem
            </h3>
            <p className="text-[11px] text-gray-500">
              Select business entity to receive the injected products.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="bulk-business-select" className="text-[10px] font-black text-gray-400 font-mono uppercase tracking-wider">Business Unit</label>
              <select
                id="bulk-business-select"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bulk-category-select" className="text-[10px] font-black text-gray-400 font-mono uppercase tracking-wider">Default Category</label>
              <select
                id="bulk-category-select"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {businessCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Quick tips about persistence optimization */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
            <h4 className="text-[10.5px] font-black text-amber-950 tracking-wider uppercase font-mono flex items-center gap-1.5 leading-none">
              <HelpCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              Persistence Optimization
            </h4>
            <p className="text-[10.5px] text-amber-900 leading-normal">
              Local Storage limits raw Base64 bytes. For continuous system reboots, we map stable web images linked to visual templates.
            </p>
            
            <div className="flex items-center gap-2 pt-1 transition-all">
              <input
                id="usePersistedWebUrl"
                type="checkbox"
                checked={usePersistedWebUrl}
                onChange={(e) => setUsePersistedWebUrl(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
              />
              <label htmlFor="usePersistedWebUrl" className="text-[10px] font-bold text-amber-950 cursor-pointer select-none">
                Use Persistent Image Feeds (Recommended)
              </label>
            </div>
          </div>

        </div>

        {/* Right Side: Upload Drag-and-Drop Area & Actions */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Drag & Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 min-h-[220px] ${
              isDragging 
                ? 'border-amber-500 bg-amber-50/30 ring-4 ring-amber-500/10' 
                : 'border-zinc-200 bg-white hover:border-amber-400 hover:bg-zinc-50/40'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelectChange}
              multiple 
              accept="image/*"
              className="hidden" 
              aria-label="Bulk Image File Input"
            />
            
            <div className="bg-amber-100/90 text-amber-950 rounded-full p-4 shrink-0 transition-transform hover:scale-105">
              <UploadCloud className="h-8 w-8 text-amber-800" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-gray-900">
                Drag-and-drop imagery or <span className="text-amber-600 hover:underline">browse files</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports PNG, JPEG, SVG, WebP. Import up to 100+ snaps concurrently (Fast pre-rendering)
              </p>
            </div>

            <span className="inline-block border border-gray-200 rounded-xl px-3 py-1 bg-white text-[10px] font-bold text-gray-500 tracking-wider">
              STAGE LIMIT: 120 UNITS/BATCH
            </span>
          </div>

          {/* Progress Indicator component if active */}
          {uploadProgress !== null && (
            <div className="bg-white border rounded-3xl p-4 space-y-3 transition-all animate-fade-in text-xs">
              <div className="flex justify-between items-center text-[11px] font-bold text-zinc-800">
                <span className="flex items-center gap-1.5 font-mono">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                  {uploadStatusText}
                </span>
                <span className="font-mono text-amber-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Batch control operations actions (Only active when items are staged) */}
      {stagedFiles.length > 0 && (
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
          <div className="flex items-center gap-3">
            <span className="bg-zinc-950 text-white font-mono font-black text-xs px-3 py-1.5 rounded-2xl">
              {stagedFiles.length} Staged Image{stagedFiles.length > 1 ? 's' : ''}
            </span>
            <p className="text-xs text-gray-500 font-medium leading-none">
              {stagedFiles.filter(f => f.selected).length} selected for batch operations.
            </p>
          </div>

          {/* Toolbar utilities */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            
            {/* Category Reassign Select and Trigger */}
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <select
                aria-label="Reassign category to selected files"
                value={reassignCategoryId}
                onChange={(e) => setReassignCategoryId(e.target.value)}
                className="rounded-xl border border-gray-250 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="">Move selected to...</option>
                {businesses.map(b => (
                  <optgroup key={b.id} label={b.name}>
                    {categories.filter(c => c.businessId === b.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              
              <button
                type="button"
                onClick={handleBulkReassignCategory}
                className="inline-flex items-center gap-1 bg-white hover:bg-zinc-100 text-gray-800 border border-gray-250 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-zinc-500" />
                Go
              </button>
            </div>

            {/* Regenerate Mock parameters */}
            <button
              type="button"
              onClick={handleBulkRegenerate}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-gray-800 border border-gray-250 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <RefreshCcw className="h-3.5 w-3.5 text-amber-600" />
              Regenerate Data
            </button>

            {/* Clear selected button */}
            <button
              type="button"
              onClick={handleBulkDeleteStaged}
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Selected
            </button>

            {/* Save everything into active system */}
            <button
              type="button"
              onClick={handleDeployAllStaged}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
            >
              <Check className="h-4 w-4" />
              Deploy Products to Store
            </button>

          </div>
        </div>
      )}

      {/* Preview Grid for Staged images & synthesized specifications */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-600" />
              Staged Image Previews & synthesized specifications
            </h3>
            <p className="text-xs text-secondary/65">
              Review automatically generated descriptors, SKU identifiers, target prices, and inventory stock before pushing live.
            </p>
          </div>

          {stagedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="globalSelectCheckbox" className="text-xs font-bold text-gray-500">Select All</label>
              <input
                id="globalSelectCheckbox"
                type="checkbox"
                checked={globalChecked}
                onChange={(e) => handleToggleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
              />
            </div>
          )}
        </div>

        {stagedFiles.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center space-y-3">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">Your Registry Queue is Empty</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Please drop or upload actual product imagery files using the designated drag-and-drop container. Generated items will align with active default categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stagedFiles.map((file, idx) => {
              const matchedCategory = categories.find(c => c.id === file.categoryId);
              return (
                <div 
                  key={file.id}
                  className={`bg-white border rounded-3xl p-4 relative flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                    file.selected 
                      ? 'border-amber-400 ring-2 ring-amber-500/10' 
                      : 'border-gray-200'
                  }`}
                >
                  
                  {/* Checker checkbox in corner */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <input
                      aria-label={`Select staged item ${file.title}`}
                      type="checkbox"
                      checked={file.selected || false}
                      onChange={(e) => handleToggleSelectItem(file.id, e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </div>

                  {/* Corner action close button */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={() => handleDeleteStagedItem(file.id)}
                      className="bg-white/95 hover:bg-red-50 text-gray-400 hover:text-red-700 p-1.5 rounded-full shadow-md border hover:border-red-250 cursor-pointer transition-colors"
                      title="Discard from staging"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail and Title */}
                  <div className="space-y-3">
                    <div className="aspect-video bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 flex items-center justify-center relative">
                      {/* Live browser uploaded file source rendering (Fidelity checkout) */}
                      <img 
                        src={file.objectUrl} 
                        alt="Dropped thumbnail preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Persistent seed badge descriptor */}
                      <span className="absolute bottom-2 right-2 bg-zinc-950/80 text-white font-mono text-[8px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {usePersistedWebUrl ? "Using Seeds Feed" : "Transient Blob"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-block bg-zinc-100 text-zinc-800 font-mono text-[9px] font-black px-2 py-0.5 rounded-md border border-zinc-200/80 uppercase">
                          {file.SKU}
                        </span>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          {matchedCategory?.name || 'Category'}
                        </span>
                      </div>

                      {/* Title editable input directly on card! */}
                      <input
                        aria-label="Edit title"
                        type="text"
                        value={file.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStagedFiles(prev => prev.map(f => f.id === file.id ? { ...f, title: val } : f));
                        }}
                        className="w-full bg-transparent font-extrabold text-sm text-zinc-900 border-b border-transparent hover:border-zinc-200 focus:border-amber-500 focus:outline-none py-1 truncate"
                      />

                      {/* Description editable text */}
                      <textarea
                        aria-label="Edit description"
                        rows={2}
                        value={file.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStagedFiles(prev => prev.map(f => f.id === file.id ? { ...f, description: val } : f));
                        }}
                        className="w-full bg-transparent text-[11px] text-zinc-500 hover:border-zinc-200 focus:border-amber-500 focus:outline-none py-1 resize-none leading-relaxed border-b border-transparent"
                      />
                    </div>
                  </div>

                  {/* Pricing and Stock variables panel */}
                  <div className="pt-3 border-t border-dashed border-gray-100 space-y-3">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">PRICE (₹)</label>
                        <input
                          aria-label="Edit pricing"
                          type="number"
                          value={file.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setStagedFiles(prev => prev.map(f => f.id === file.id ? { ...f, price: val } : f));
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">STOCK (UNITS)</label>
                        <input
                          aria-label="Edit stock"
                          type="number"
                          value={file.stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setStagedFiles(prev => prev.map(f => f.id === file.id ? { ...f, stock: val } : f));
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-1 pt-1 text-[11px]">
                      <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[130px]" title={file.name}>
                        Src: {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRegenerateProduct(file.id, idx)}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-amber-700 font-bold transition-colors cursor-pointer bg-zinc-100 hover:bg-amber-100 px-2 py-1 rounded-md"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        Refresh Specs
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
  );
}
