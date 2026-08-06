import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Zap,
  Sun,
  Battery,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sliders,
  RotateCcw,
  Gauge,
  Cpu,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useDebounceValue } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { EquipmentNode } from '../types';
import { calculateSolarSizing, LoadItem, REGIONAL_SOLAR_CONSTANTS } from '../data/solarData';

export type { LoadItem };

interface SolarLoadCalculatorProps {
  nodes?: EquipmentNode[];
  onApplySizingToDiagram?: (sizing: {
    recommendedPvKw: number;
    recommendedBatteryKwh: number;
    recommendedInverterKw: number;
  }) => void;
  onClose?: () => void;
}

const DEFAULT_LOAD_ITEMS: LoadItem[] = [
  { id: '1', name: 'Critical Refrigerator & Freezers', category: 'Essential', quantity: 2, watts: 250, hoursPerDay: 12, surgeFactor: 2.5 },
  { id: '2', name: 'LED Lighting Circuits', category: 'Essential', quantity: 20, watts: 15, hoursPerDay: 6, surgeFactor: 1.0 },
  { id: '3', name: 'IT Server & Wi-Fi Routers', category: 'Essential', quantity: 3, watts: 80, hoursPerDay: 24, surgeFactor: 1.0 },
  { id: '4', name: 'HVAC Air Conditioning Unit', category: 'Heavy', quantity: 2, watts: 1800, hoursPerDay: 8, surgeFactor: 2.0 },
  { id: '5', name: 'Water Submersible Pump', category: 'Heavy', quantity: 1, watts: 1100, hoursPerDay: 2, surgeFactor: 3.0 },
  { id: '6', name: 'EV Fast Charger / Workshop', category: 'General', quantity: 1, watts: 3700, hoursPerDay: 3, surgeFactor: 1.1 },
];

export const SolarLoadCalculator: React.FC<SolarLoadCalculatorProps> = ({
  onApplySizingToDiagram,
  onClose,
}) => {
  const { t } = useLanguage();

  // Raw interactive input states
  const [loadItems, setLoadItems] = useState<LoadItem[]>(DEFAULT_LOAD_ITEMS);
  const [peakSunHours, setPeakSunHours] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_PEAK_SUN_HOURS);
  const [inverterEfficiency, setInverterEfficiency] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_INVERTER_EFFICIENCY);
  const [batteryDod, setBatteryDod] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_BATTERY_DOD);
  const [autonomyDays, setAutonomyDays] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_AUTONOMY_DAYS);
  const [systemVoltage, setSystemVoltage] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SYSTEM_VOLTAGE);
  const [safetyMargin, setSafetyMargin] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SAFETY_MARGIN);

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Combine parameters for debouncing
  const rawCalculationParams = useMemo(
    () => ({
      loadItems,
      peakSunHours,
      inverterEfficiency,
      batteryDod,
      autonomyDays,
      systemVoltage,
      safetyMargin,
    }),
    [loadItems, peakSunHours, inverterEfficiency, batteryDod, autonomyDays, systemVoltage, safetyMargin]
  );

  // DEBOUNCE RECALCULATION ENGINE (150ms delay)
  // Ensures frequent slider drags or rapid keypresses do not block the UI main thread
  const debouncedParams = useDebounceValue(rawCalculationParams, 150);

  // Calculating state indicator check
  const isCalculating = rawCalculationParams !== debouncedParams;

  // Debounced Sizing Calculations via solarData engine
  const calculatedResults = useMemo(() => {
    return calculateSolarSizing(debouncedParams);
  }, [debouncedParams]);

  // Handler functions
  const handleAddLoad = () => {
    const newItem: LoadItem = {
      id: Date.now().toString(),
      name: 'New Custom Electrical Load',
      category: 'General',
      quantity: 1,
      watts: 500,
      hoursPerDay: 4,
      surgeFactor: 1.2,
    };
    setLoadItems([...loadItems, newItem]);
  };

  const handleUpdateLoad = (id: string, updates: Partial<LoadItem>) => {
    setLoadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteLoad = (id: string) => {
    setLoadItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetDefaults = () => {
    setLoadItems(DEFAULT_LOAD_ITEMS);
    setPeakSunHours(4.8);
    setInverterEfficiency(95);
    setBatteryDod(80);
    setAutonomyDays(1.5);
    setSafetyMargin(20);
  };

  const handleApplyToDiagram = () => {
    if (onApplySizingToDiagram) {
      onApplySizingToDiagram({
        recommendedPvKw: calculatedResults.recommendedPvKw,
        recommendedBatteryKwh: calculatedResults.recommendedBatteryKwh,
        recommendedInverterKw: calculatedResults.recommendedInverterKw,
      });
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    }
  };

  return (
    <article className="bg-[#ffffff] border border-[#c3c6d6] rounded-xl shadow-lg p-6 max-w-5xl mx-auto space-y-6 text-[#181c1f]" aria-label="Solar System Load & Sizing Calculator">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ebeef2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d9b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#181c1f]">
                Interactive Solar Load &amp; Sizing Calculator
              </h2>
              <span className="bg-[#e0e7ff] text-[#003d9b] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Debounced 150ms
              </span>
            </div>
            <p className="text-xs text-[#434654] mt-0.5">
              High-performance main-thread unblocked calculations for PV Peak (kWp), Battery Storage (kWh), and Inverter (kW).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </header>

      {/* Grid: Appliance Table + System Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Electrical Loads List (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Connected Appliances &amp; Load Circuits
            </h3>
            <button
              onClick={handleAddLoad}
              className="px-3 py-1 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Circuit</span>
            </button>
          </div>

          <div className="border border-[#c3c6d6] rounded-lg overflow-hidden bg-[#f8fafc]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#e2e8f0] text-[#1e293b] font-bold uppercase text-[10px] tracking-wider border-b border-[#cbd5e1]">
                  <tr>
                    <th className="p-2.5">Appliance / Load</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5 w-24">Power (W)</th>
                    <th className="p-2.5 w-24">Hours/Day</th>
                    <th className="p-2.5 w-24">Daily (kWh)</th>
                    <th className="p-2.5 w-10 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {loadItems.map((item) => {
                    const itemWh = (item.quantity * item.watts * item.hoursPerDay) / 1000;
                    return (
                      <tr key={item.id} className="hover:bg-[#f1f5f9] transition-colors">
                        <td className="p-2.5">
                          <label htmlFor={`load-name-${item.id}`} className="sr-only">
                            Appliance name for load {item.id}
                          </label>
                          <input
                            id={`load-name-${item.id}`}
                            type="text"
                            value={item.name}
                            aria-label={`Appliance or circuit name for load ${item.id}`}
                            onChange={(e) => handleUpdateLoad(item.id, { name: e.target.value })}
                            className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs font-semibold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                          />
                        </td>
                        <td className="p-2.5">
                          <label htmlFor={`load-qty-${item.id}`} className="sr-only">
                            Quantity for {item.name}
                          </label>
                          <input
                            id={`load-qty-${item.id}`}
                            type="number"
                            min="1"
                            max="100"
                            value={item.quantity}
                            aria-label={`Quantity for ${item.name}`}
                            onChange={(e) =>
                              handleUpdateLoad(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                            }
                            className="w-full text-center bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                          />
                        </td>
                        <td className="p-2.5">
                          <label htmlFor={`load-watts-${item.id}`} className="sr-only">
                            Watts for {item.name}
                          </label>
                          <input
                            id={`load-watts-${item.id}`}
                            type="number"
                            min="1"
                            step="10"
                            value={item.watts}
                            aria-label={`Watts rating for ${item.name}`}
                            onChange={(e) =>
                              handleUpdateLoad(item.id, { watts: Math.max(1, parseFloat(e.target.value) || 0) })
                            }
                            className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs font-mono font-bold text-[#003d9b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                          />
                        </td>
                        <td className="p-2.5">
                          <label htmlFor={`load-hours-${item.id}`} className="sr-only">
                            Hours per day for {item.name}
                          </label>
                          <input
                            id={`load-hours-${item.id}`}
                            type="number"
                            min="0.1"
                            max="24"
                            step="0.5"
                            value={item.hoursPerDay}
                            aria-label={`Operating hours per day for ${item.name}`}
                            onChange={(e) =>
                              handleUpdateLoad(item.id, {
                                hoursPerDay: Math.min(24, Math.max(0.1, parseFloat(e.target.value) || 0.1)),
                              })
                            }
                            className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs font-mono font-bold text-[#003d9b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#0f172a]">
                          {itemWh.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteLoad(item.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
                            title={`Remove ${item.name}`}
                            aria-label={`Remove circuit load ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Site & Environment Sliders */}
        <div className="space-y-4 bg-[#f8fafc] p-4 rounded-lg border border-[#c3c6d6]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            Solar &amp; System Environmental Factors
          </h3>

          <div className="space-y-3 text-xs">
            {/* Peak Sun Hours Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#1e293b]">
                <label htmlFor="psh-slider" className="cursor-pointer">
                  Peak Sun Hours (PSH):
                </label>
                <span className="font-mono text-[#003d9b] font-bold">{peakSunHours} hrs/day</span>
              </div>
              <input
                id="psh-slider"
                type="range"
                min="2.0"
                max="7.0"
                step="0.1"
                value={peakSunHours}
                aria-label="Peak Sun Hours in hours per day"
                aria-valuemin={2.0}
                aria-valuemax={7.0}
                aria-valuenow={peakSunHours}
                aria-valuetext={`${peakSunHours} hours per day`}
                onChange={(e) => setPeakSunHours(parseFloat(e.target.value))}
                className="w-full accent-[#003d9b] cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
              />
            </div>

            {/* Battery Autonomy Days Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#1e293b]">
                <label htmlFor="autonomy-slider" className="cursor-pointer">
                  Battery Autonomy Target:
                </label>
                <span className="font-mono text-[#003d9b] font-bold">{autonomyDays} Days</span>
              </div>
              <input
                id="autonomy-slider"
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={autonomyDays}
                aria-label="Battery Autonomy Target in days"
                aria-valuemin={0.5}
                aria-valuemax={3.0}
                aria-valuenow={autonomyDays}
                aria-valuetext={`${autonomyDays} days`}
                onChange={(e) => setAutonomyDays(parseFloat(e.target.value))}
                className="w-full accent-[#003d9b] cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
              />
            </div>

            {/* Inverter Efficiency Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#1e293b]">
                <label htmlFor="efficiency-slider" className="cursor-pointer">
                  Inverter Efficiency:
                </label>
                <span className="font-mono text-[#003d9b] font-bold">{inverterEfficiency}%</span>
              </div>
              <input
                id="efficiency-slider"
                type="range"
                min="85"
                max="98"
                step="1"
                value={inverterEfficiency}
                aria-label="Inverter Efficiency percentage"
                aria-valuemin={85}
                aria-valuemax={98}
                aria-valuenow={inverterEfficiency}
                aria-valuetext={`${inverterEfficiency} percent`}
                onChange={(e) => setInverterEfficiency(parseInt(e.target.value))}
                className="w-full accent-[#003d9b] cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
              />
            </div>

            {/* Safety Design Margin Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#1e293b]">
                <label htmlFor="margin-slider" className="cursor-pointer">
                  Design Growth Margin:
                </label>
                <span className="font-mono text-[#003d9b] font-bold">+{safetyMargin}%</span>
              </div>
              <input
                id="margin-slider"
                type="range"
                min="0"
                max="50"
                step="5"
                value={safetyMargin}
                aria-label="Design Growth Margin percentage"
                aria-valuemin={0}
                aria-valuemax={50}
                aria-valuenow={safetyMargin}
                aria-valuetext={`${safetyMargin} percent`}
                onChange={(e) => setSafetyMargin(parseInt(e.target.value))}
                className="w-full accent-[#003d9b] cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
              />
            </div>

            {/* System DC Voltage Select */}
            <div>
              <label htmlFor="system-voltage-select" className="block font-semibold text-[#1e293b] mb-1">
                System DC Voltage Rating:
              </label>
              <select
                id="system-voltage-select"
                value={systemVoltage}
                aria-label="System DC Voltage Rating"
                onChange={(e) => setSystemVoltage(parseInt(e.target.value))}
                className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
              >
                <option value={48}>48 VDC (LFP Standard Nominal)</option>
                <option value={51.2}>51.2 VDC (Lithium Iron Phosphate 16S)</option>
                <option value={120}>120 VDC High Voltage String</option>
                <option value={400}>400 VDC Commercial Bus</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Calculation Output Dashboard */}
      <div className="bg-[#0f172a] text-white p-5 rounded-xl border border-slate-700 shadow-md relative overflow-hidden">
        {/* Recalculating overlay indicator */}
        {isCalculating && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-[#003d9b] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Debounced Recalculating...</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm uppercase tracking-wider text-slate-200">
              Optimal Sizing Specifications
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            NEC 690 &amp; IEEE 1547 Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Daily Energy Consumption</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              {calculatedResults.dailyKwh.toFixed(1)} <span className="text-xs font-normal text-slate-200">kWh/day</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">Total Connected: {calculatedResults.totalConnectedKw.toFixed(1)} kW</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase block flex items-center gap-1">
              <Sun className="w-3 h-3 text-sky-400" /> Recommended Solar PV
            </span>
            <div className="text-xl font-black text-sky-400 font-mono mt-1">
              {calculatedResults.recommendedPvKw.toFixed(1)} <span className="text-xs font-normal text-slate-200">kWp</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">Array @ {peakSunHours} PSH</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase block flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" /> Recommended Battery
            </span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              {calculatedResults.recommendedBatteryKwh.toFixed(1)} <span className="text-xs font-normal text-slate-200">kWh</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">{autonomyDays} Days Autonomy @ {batteryDod}% DOD</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase block flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Inverter AC Power
            </span>
            <div className="text-xl font-black text-indigo-400 font-mono mt-1">
              {calculatedResults.recommendedInverterKw.toFixed(1)} <span className="text-xs font-normal text-slate-200">kW</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">Max DC Fuse: {calculatedResults.recommendedFuseAmps}A</span>
          </div>
        </div>

        {/* Action Button */}
        {onApplySizingToDiagram && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Apply calculated capacities directly to system diagram nodes</span>
            </div>

            <button
              onClick={handleApplyToDiagram}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#003d9b] hover:bg-[#0052cc] text-white'
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Sizing Applied to Diagram!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Apply Sizing to Diagram &amp; BIM Inventory</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Engineering Warnings & Feedback Messages */}
      {calculatedResults.warnings && calculatedResults.warnings.length > 0 && (
        <div className="space-y-2">
          {calculatedResults.warnings.map((warn, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 shadow-2xs ${
                warn.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : warn.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {warn.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : warn.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[10px] mr-1">
                  [{warn.type}]:
                </span>
                {warn.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
