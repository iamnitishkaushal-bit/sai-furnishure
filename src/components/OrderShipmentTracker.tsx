import { useState, useEffect } from 'react';
import { ArrowLeft, Truck, Package, RefreshCw, MapPin, PhoneCall, Shield, Thermometer, Zap, CheckCircle2, Circle, AlertCircle, FileText, ExternalLink, Calendar, HelpCircle } from 'lucide-react';
import { Order, Business } from '../types';
import { usePlatform } from '../context/PlatformContext';

interface OrderShipmentTrackerProps {
  order: Order;
  business: Business;
  onBack: () => void;
}

export default function OrderShipmentTracker({ order, business, onBack }: OrderShipmentTrackerProps) {
  const { addNotification } = usePlatform();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [simulatedOffset, setSimulatedOffset] = useState(0);

  // Generate dynamic tracking reference
  const trackerRef = `${business.id === 'agromart' ? 'AGR-EXP' : 'EHUB-BLU'}-${order.id.split('-')[1]?.toUpperCase() || '774819'}`;
  
  // Calculate ETA (4 days after order creation)
  const orderDate = new Date(order.createdAt);
  const etaDate = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  
  // Custom metrics based on business unit
  const isAgro = business.id === 'agromart';
  const totalWeight = isAgro ? `${Math.round(2.5 + order.items.length * 4.2)} kg` : `${Math.round(0.4 + order.items.length * 1.8)} kg`;
  const estimatedBoxes = Math.max(1, Math.round(order.items.length / 2));
  const shippingMethod = isAgro ? 'AgroMart RuralExpress (Priority Cold-Chain)' : 'BlueDart SecureCargo (Static & ElectroShield)';
  const dispatchFacility = isAgro ? 'Central Agri-Hub Warehouses, NCR-01' : 'Mega Tech-Sorting Complex, South Hub-04';

  // State telemetry values (simulate real sensors in delivery vehicle)
  const [sensors, setSensors] = useState({
    temperature: isAgro ? 18.2 : 23.5,
    humidity: isAgro ? 45 : 32,
    gForce: 0.08,
    antiStaticShield: true,
    gpsLatency: '1.2s',
    batteryLevel: 94,
    speed: 48,
  });

  // Track progress status steps
  const steps = [
    { label: 'Pending Dispatch', desc: 'Order processed & packed by distributor', defaultStatus: 'Pending' },
    { label: 'Shipped', desc: 'Handed over to logistics carrier partner', defaultStatus: 'Confirmed' },
    { label: 'In Transit', desc: 'Parcel departed sorting hub towards destination', defaultStatus: 'Processing' },
    { label: 'Local Outpost', desc: 'Arrived at distribution outpost closest to you', defaultStatus: 'Ready' },
    { label: 'Out for Delivery', desc: 'Delivery crew dispatched with your parcel', defaultStatus: 'Shipped' },
    { label: 'Delivered', desc: 'Transferred to secure mailbox or recipient', defaultStatus: 'Delivered' }
  ];

  // Map orderStatus to current active index
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Processing': return 2;
      case 'Ready': return 3;
      case 'Shipped': return 4;
      case 'Delivered': return 5;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  const activeIndex = getActiveStepIndex(order.orderStatus);

  // Handle Refresh simulation
  const handleLiveQuery = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Slightly fluctuate simulated parameters to prove dynamic live integration
      setSensors(prev => ({
        ...prev,
        temperature: +(prev.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
        humidity: Math.min(65, Math.max(25, Math.round(prev.humidity + (Math.random() * 4 - 2)))),
        gForce: +(Math.random() * 0.12 + 0.02).toFixed(2),
        speed: Math.round(42 + Math.random() * 20),
        batteryLevel: Math.max(10, prev.batteryLevel - 1)
      }));
      setLastRefreshed(new Date());
      setSimulatedOffset(prev => prev + 1);
      setIsRefreshing(false);
      
      // Notify client
      addNotification({
        title: "Logistics Synchronization Clean",
        message: `Queried direct GPS coordinates for parcel ${trackerRef}. Location synced successfully.`,
        type: 'info',
        businessId: business.id
      });
    }, 1100);
  };

  // Build dynamic checkpoints history with real time calculations
  const getCheckpointHistory = () => {
    const history = [];
    const baseTime = orderDate.getTime();

    if (activeIndex >= 0) {
      history.push({
        status: 'Order Placed & Invoiced',
        time: orderDate.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: 'Merchant Facility Portal',
        desc: 'Digital check cleared. Commercial invoice assigned.'
      });
    }
    if (activeIndex >= 1) {
      const stepTime = new Date(baseTime + 1.2 * 3600000);
      history.push({
        status: 'Carrier Handshake Verified',
        time: stepTime.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: dispatchFacility,
        desc: `Shipping label generated and attached. Partner: ${shippingMethod}.`
      });
    }
    if (activeIndex >= 2) {
      const stepTime = new Date(baseTime + 4.5 * 3600000);
      history.push({
        status: 'Payload Received at Sorting Hub',
        time: stepTime.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: exportWarehouse(),
        desc: 'Weight confirmed. Package consolidated into primary express freighter.'
      });
    }
    if (activeIndex >= 3) {
      const stepTime = new Date(baseTime + 13 * 3600000);
      history.push({
        status: 'Inter-City Transit Initiated',
        time: stepTime.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: 'In-Transit Freightway Coach',
        desc: 'Transport container dispatched under optimal environmental safeguards.'
      });
    }
    if (activeIndex >= 4) {
      const stepTime = new Date(baseTime + 28 * 3600000);
      history.push({
        status: 'Outpost Allocation Secured',
        time: stepTime.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: `${order.customerCity} Regional Cargo Outpost`,
        desc: 'Sorting complete. Assigned to regional logistics delivery partner.'
      });
    }
    if (activeIndex >= 5) {
      const stepTime = new Date(baseTime + 33 * 3600000);
      history.push({
        status: 'Package Transferred / Delivered',
        time: stepTime.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: order.customerAddress,
        desc: `Order received successfully. Signed by ${order.customerName}.`
      });
    }

    return history.reverse(); // Newest first
  };

  const exportWarehouse = () => {
    return isAgro ? 'North NCR AgroCold Sorting Depot' : 'West Zone Electronics Dispatch Terminal';
  };

  const currentParcelLocation = () => {
    if (order.orderStatus === 'Delivered') return 'At Customer Farm/Premises (Completed)';
    if (order.orderStatus === 'Shipped') return `Out for Delivery - Last Mile Delivery Team near ${order.customerCity}`;
    if (order.orderStatus === 'Ready') return `Approaching ${order.customerCity} Outpost`;
    if (order.orderStatus === 'Processing') return 'In-Transit to Regional Logistics Terminal';
    if (order.orderStatus === 'Confirmed') return dispatchFacility;
    return 'Packing at Supplier Depot';
  };

  return (
    <div id="live-shipment-order-tracking" className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 text-left animate-in fade-in duration-200">
      
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-gray-55 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
            title="Back to Orders History"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-black text-gray-950">TRACK #{trackerRef}</span>
              <span 
                className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider font-mono text-white"
                style={{ backgroundColor: business.accentColor }}
              >
                {business.name} Logistics
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 font-mono">
              Order ID: <span className="font-bold underline">{order.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLiveQuery}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-750 hover:bg-gray-50 active:scale-97 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3 w.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Querying Satellite...' : 'Sync Live Coordinates'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Professional Delivery Summary Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4 sm:p-5">
        <div className="space-y-1">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">Carrier Service</span>
          <p className="text-xs font-extrabold text-zinc-800 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            {shippingMethod}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">Frictionless Premium Fulfillment</p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-x border-zinc-200/70 pt-3 md:pt-0 md:px-4">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">ESTIMATED ARRIVAL</span>
          <p className="text-sm font-black text-amber-800 flex items-center gap-1.5 font-mono">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {order.orderStatus === 'Delivered' ? 'DELIVERED SUCCESSFULLY' : etaDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-[10px] text-zinc-400">
            {order.orderStatus === 'Delivered' ? 'Signed off securely at site' : 'Estimated delivery window (4 days max)'}
          </p>
        </div>

        <div className="space-y-1 pt-3 md:pt-0 md:pl-2">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">CURRENT STATUS / LATENCY</span>
          <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {order.orderStatus} ({sensors.gpsLatency} GPS Checkpoint)
          </p>
          <p className="text-[10px] text-zinc-400 truncate font-mono">{currentParcelLocation()}</p>
        </div>
      </div>

      {/* 3. Dynamic Progress Pathway Tracker */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-zinc-700/80" />
          SHIPMENT PIPELINE PROGRESS
        </h3>
        
        {order.orderStatus === 'Cancelled' ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold">Logistics Cancelled</p>
              <p className="text-red-650 mt-1 leading-normal">
                This shipment pipeline was aborted by the administrative console. If payment was authorized, refunds usually reflect within 3-5 standard banking cycles.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pt-3 pb-4">
            {/* Background connecting pipe lines */}
            <div className="hidden md:block absolute top-[21px] left-[5%] right-[5%] h-1 bg-zinc-200/70 rounded-full" />
            
            {/* Responsive Stepper cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-1.5 text-left md:text-center">
              {steps.map((st, i) => {
                const passed = i < activeIndex;
                const current = i === activeIndex;
                const future = i > activeIndex;

                return (
                  <div key={i} className="flex md:flex-col items-start md:items-center gap-3 md:gap-2.5 relative group">
                    {/* Circle Indicator */}
                    <div className="relative z-10 shrink-0">
                      {passed ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm border border-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      ) : current ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-150 shadow-md border border-amber-400">
                          <RefreshCw className="h-3 w-3 animate-spin duration-3000" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-300 border-2 border-zinc-200 shadow-xs">
                          <Circle className="h-2.5 w-2.5 fill-current text-zinc-200" />
                        </div>
                      )}
                    </div>

                    {/* Meta descriptive Text */}
                    <div className="min-w-0">
                      <span className={`block text-xs font-black tracking-tight ${
                        current ? 'text-amber-800' : passed ? 'text-emerald-700 font-bold' : 'text-zinc-400'
                      }`}>
                        {st.label}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 hidden md:block px-1">
                        {st.desc}
                      </p>
                      <span className="text-[10px] text-zinc-500 block md:hidden">
                        {st.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Telemetry Real-Time Sensor Metrics (SaaS grade feature!) */}
      <div id="packaging-telemetry" className="space-y-3.5">
        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
          <h3 className="text-xs font-bold text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-zinc-800" />
            LIVE MULTI-ZONE TELEMETRY LOGS (PACKAGING CONSOLE)
          </h3>
          <span className="text-[9px] font-mono text-zinc-400">
            Last Synced: {lastRefreshed.toLocaleTimeString()} ({simulatedOffset > 0 ? `Fresh Query #${simulatedOffset}` : 'Cache Valid'})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs shadow-inner">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-500 block uppercase font-bold">CARGO TEMP</span>
            <div className="flex items-center gap-1 text-sm font-black text-white">
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
              <span>{sensors.temperature}°C</span>
            </div>
            <span className="text-[8px] text-zinc-400 block font-sans">
              {isAgro ? 'Cool-sealed (Optimal)' : 'Nominal ambient'}
            </span>
          </div>

          <div className="space-y-1 border-l border-zinc-800 pl-3">
            <span className="text-[9px] text-zinc-500 block uppercase font-bold">ATM HUMIDITY</span>
            <div className="flex items-center gap-1 text-sm font-black text-white">
              <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span>{sensors.humidity}% RH</span>
            </div>
            <span className="text-[8px] text-zinc-400 block font-sans">
              {isAgro ? 'Anti-spore dry lock' : 'ESD safe environment'}
            </span>
          </div>

          <div className="space-y-1 border-l border-zinc-800 pl-3">
            <span className="text-[9px] text-zinc-500 block uppercase font-bold">IMPACT PEAK G-FORCE</span>
            <div className="flex items-center gap-1 text-sm font-black text-white">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>{sensors.gForce} G</span>
            </div>
            <span className="text-[8px] text-zinc-400 block font-sans">Shockproof barrier intact</span>
          </div>

          <div className="space-y-1 border-l border-zinc-800 pl-3">
            <span className="text-[9px] text-zinc-500 block uppercase font-bold">DRIVE BATTERY / VELOCITY</span>
            <div className="flex items-center gap-1 text-sm font-black text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              <span>{sensors.speed} km/h - {sensors.batteryLevel}%</span>
            </div>
            <span className="text-[8px] text-zinc-400 block font-sans">Fleet vehicle active</span>
          </div>
        </div>
      </div>

      {/* 5. Two Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
        {/* Left Column: Shipment specifications list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-black font-mono tracking-wider uppercase text-gray-500 pb-1.5 border-b border-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              COMMERCIAL WAYBILL SPECIFICATIONS
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs text-gray-650">
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Destination Site</span>
                <span className="font-bold text-gray-800 text-right max-w-[150px] truncate">{order.customerCity}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Postal Code Ref</span>
                <span className="font-bold text-gray-800 font-mono">{order.customerPostalCode}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Parcel Metric Weight</span>
                <span className="font-bold text-gray-800 font-mono">{totalWeight}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Total Case Boxes</span>
                <span className="font-bold text-gray-800 font-mono">{estimatedBoxes} Units</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Supplier Facility</span>
                <span className="font-bold text-gray-800 truncate text-right max-w-[150px]">{dispatchFacility}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-gray-50">
                <span className="text-gray-400 uppercase font-mono text-[9px]">Billing Invoicing</span>
                <span className="font-bold text-gray-800">{order.paymentMethod} - {order.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-zinc-400 leading-normal bg-zinc-50 rounded-lg p-2.5 border border-zinc-150">
                {isAgro 
                  ? "AgroMart Cargo Alert: Seeds, nutrients, or chemicals require regulated ventilation. Do not puncture container. Refrigeration logs are broadcast via telemetry sensors."
                  : "ElectroHub Logistics Notice: Critical solid-state semiconductor components. Anti-static packaging deployed. Secure from strong magnetic induction."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Support / Operator contacts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <h4 className="text-xs font-black font-mono tracking-wider uppercase text-gray-400 pb-1.5 border-b border-gray-100">
              LOGISTICS DISPATCH CREW
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-800 border">
                  🚚
                </div>
                <div>
                  <span className="block font-bold text-gray-900">Crew #40 - Regional AirFleet</span>
                  <span className="text-[10px] text-[10px] text-gray-400 uppercase">On-Ground delivery Courier Team</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Dialing mock dispatch hotline: 91-8833-2211. Carrier: ${business.name} Integrated Logistics Service.`)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 hover:bg-zinc-950 text-white font-bold p-2.5 text-xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  Request Callback
                </button>
                <button
                  type="button"
                  onClick={() => alert('Support helpline ticket initialized. Incident response coordinate logged.')}
                  className="w-full text-center hover:underline text-[10px] font-bold text-gray-400 uppercase block font-mono"
                >
                  Incident support query?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Live Shipment Timeline Scans */}
      <div className="space-y-4 border-t border-gray-100 pt-5">
        <h4 className="text-xs font-black font-mono tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-zinc-400" />
          CHRONOLOGICAL WAYBILL CHECKPOINT TIMELINE
        </h4>

        {order.orderStatus === 'Cancelled' ? (
          <p className="text-xs italic text-gray-400">Timeline unavailable for cancelled orders.</p>
        ) : (
          <div className="relative pl-4 space-y-5 before:absolute before:inset-y-1 before:left-1.5 before:w-0.5 before:bg-zinc-150">
            {getCheckpointHistory().map((ch, idx) => (
              <div key={idx} className="relative pl-4 flex flex-col md:flex-row md:justify-between md:items-start gap-1 pb-1">
                {/* Dot */}
                <div className="absolute -left-[14px] top-1 h-2.5 w-2.5 rounded-full border border-white bg-zinc-900 ring-2 ring-zinc-150" />
                
                <div className="space-y-0.5 max-w-sm sm:max-w-md">
                  <span className="block text-xs font-extrabold text-zinc-900">{ch.status}</span>
                  <span className="block text-[10px] text-zinc-500 leading-tight">{ch.desc}</span>
                  <span className="block text-[9px] text-zinc-400 font-mono italic mt-1">{ch.location}</span>
                </div>

                <div className="shrink-0 text-[10px] font-mono font-bold text-zinc-400 text-left md:text-right mt-1 md:mt-0">
                  {ch.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
