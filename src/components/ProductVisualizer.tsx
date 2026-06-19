import { useState } from 'react';
import { Leaf, Cpu, ShieldAlert, Sparkles, Wrench, Hammer, Droplets, Smartphone, Laptop, Tv, Headphones, Tv2, AlertCircle, ShoppingBag } from 'lucide-react';
import { imageLibrary } from '../config/imageLibrary';

interface ProductVisualizerProps {
  color: string;
  category: string;
  title: string;
  className?: string;
  stock?: number;
  id?: string;
}

/**
 * Resolves a high-quality relevant photograph for products and categories.
 * Features auto-correction, fuzzy matches on titles & tags, and strict fallbacks.
 */
export function getProductImage(id: string | undefined, category: string, title?: string, colorValue?: string): string {
  // 1. If the value itself is an actual URL, use it directly
  if (colorValue && (colorValue.startsWith('http') || colorValue.startsWith('data:'))) {
    return colorValue;
  }

  // 2. Clear known id mappings
  if (id && (imageLibrary.products as any)[id]) {
    return (imageLibrary.products as any)[id];
  }

  // 3. Fuzzy match of title content (highly reliable for dynamic user products & search uploads)
  const t = (title || '').toLowerCase();
  if (t.includes('tomato')) return imageLibrary.products["agro-1"];
  if (t.includes('wheat') || t.includes('grain')) return imageLibrary.products["agro-2"];
  if (t.includes('sprayer') || t.includes('tiller') || t.includes('harvester')) return imageLibrary.products["agro-3"];
  if (t.includes('pump') || t.includes('hose') || t.includes('water')) return imageLibrary.products["agro-4"];
  if (t.includes('rotavator') || t.includes('shoveler') || t.includes('sickle')) return imageLibrary.products["agro-5"];
  if (t.includes('urea') || t.includes('nitrogen') || t.includes('fertilizer') || t.includes('neem')) return imageLibrary.products["agro-6"];

  if (t.includes('oneplus') || t.includes('phone') || t.includes('mobile') || t.includes('smartphone')) return imageLibrary.products["electro-1"];
  if (t.includes('tv') || t.includes('samsung') || t.includes('oled') || t.includes('television')) return imageLibrary.products["electro-2"];
  if (t.includes('dell') || t.includes('inspiron') || t.includes('laptop') || t.includes('creator') || t.includes('notebook')) return imageLibrary.products["electro-3"];
  if (t.includes('earbud') || t.includes('wire') || t.includes('sound') || t.includes('bluetooth') || t.includes('headset') || t.includes('headphones')) return imageLibrary.products["electro-4"];
  if (t.includes('refrigerator') || t.includes('fridge') || t.includes('cooler') || t.includes('appliances')) return imageLibrary.products["electro-5"];
  if (t.includes('battery') || t.includes('inverter') || t.includes('backup') || t.includes('solar')) return imageLibrary.products["electro-6"];

  // 4. Fallback search by category taxonomy
  const cat = category.toLowerCase();
  if (cat.includes('seed')) return imageLibrary.agromart.seeds;
  if (cat.includes('fert')) return imageLibrary.agromart.fertilizers;
  if (cat.includes('equip') || cat.includes('machin')) return imageLibrary.agromart.equipment;
  if (cat.includes('tool') || cat.includes('hamm')) return imageLibrary.agromart.tools;
  if (cat.includes('irrig') || cat.includes('water')) return imageLibrary.agromart.irrigation;

  if (cat.includes('mobil') || cat.includes('phone') || cat.includes('smart')) return imageLibrary.electrohub.mobiles;
  if (cat.includes('laptop') || cat.includes('comput')) return imageLibrary.electrohub.laptops;
  if (cat.includes('tv')) return imageLibrary.electrohub.tvs;
  if (cat.includes('access')) return imageLibrary.electrohub.accessories;
  if (cat.includes('applian') || cat.includes('smart-home') || cat.includes('home')) return imageLibrary.electrohub["smart-home"];

  // 5. Final reliable fallback
  return imageLibrary.placeholders.general;
}

export default function ProductVisualizer({ color, category, title, className = '', stock = 10, id }: ProductVisualizerProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => getProductImage(id, category, title, color));
  const [hasError, setHasError] = useState(false);

  // Fetch icon matching categories as a micro badge on the cover
  const getIcon = () => {
    switch (category.toLowerCase()) {
      case 'seeds':
        return <Leaf className="h-3 w-3 text-emerald-600" />;
      case 'fertilizers':
        return <Sparkles className="h-3 w-3 text-lime-600" />;
      case 'equipment':
        return <Wrench className="h-3 w-3 text-amber-600" />;
      case 'tools':
        return <Hammer className="h-3 w-3 text-red-600" />;
      case 'irrigation':
        return <Droplets className="h-3 w-3 text-blue-600" />;
      case 'mobiles':
        return <Smartphone className="h-3 w-3 text-purple-600" />;
      case 'laptops':
        return <Laptop className="h-3 w-3 text-indigo-600" />;
      case 'tvs':
        return <Tv className="h-3 w-3 text-orange-600" />;
      case 'accessories':
        return <Headphones className="h-3 w-3 text-rose-600" />;
      case 'appliances':
        return <Tv2 className="h-3 w-3 text-teal-600" />;
      default:
        return <Cpu className="h-3 w-3 text-zinc-650" />;
    }
  };

  const isLowStock = stock > 0 && stock <= 10;
  const isOutOfStock = stock === 0;

  // Fallback handler if image fails to load
  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Attempt to load general placeholder
      setImgSrc(imageLibrary.placeholders.general);
    }
  };

  return (
    <div className={`group relative flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 transition-all duration-300 ${className} shadow-sm border border-zinc-200/50`}>
      {/* Product Image Cover */}
      <img
        src={imgSrc}
        alt={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={handleImageError}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />

      {/* Modern High-Contrast Gradient Overlay for readability on text labels */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

      {/* Micro category icon badge in the top-right corner of card */}
      <div className="absolute top-2.5 right-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-lg bg-white/95 backdrop-blur-xs shadow-md border border-zinc-100">
        {getIcon()}
      </div>

      {/* Floating details / tags in bottom overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {/* State Tags */}
        <div className="flex flex-wrap gap-1 items-center">
          <span className="rounded-md bg-zinc-950/80 backdrop-blur-xs px-2 py-0.5 text-[8px] font-black font-mono uppercase tracking-wider text-zinc-200 border border-zinc-800">
            {category}
          </span>

          {isOutOfStock && (
            <span className="flex items-center gap-1 rounded-md bg-red-600/90 text-[8px] font-black text-white px-2 py-0.5 shadow-sm animate-pulse">
              <ShieldAlert className="h-2 w-2" />
              OUT OF STOCK
            </span>
          )}

          {isLowStock && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500/95 text-[8px] font-black text-zinc-950 px-2 py-0.5 shadow-sm">
              <AlertCircle className="h-2 w-2" />
              {stock} LEFT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
