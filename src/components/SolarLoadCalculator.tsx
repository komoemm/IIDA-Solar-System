import React, { useState, useMemo, useEffect } from 'react';
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
  Play,
  Pause,
  Activity,
  ArrowDown,
  ArrowUp,
  Server,
  Building2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useDebounceValue } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { EquipmentNode, LoadCategory, LoadItem } from '../types';
import { calculateSolarSizing, REGIONAL_SOLAR_CONSTANTS } from '../data/solarData';

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
  {
    id: '1',
    name: 'Critical Server Room & Automation PLC',
    category: 'Critical',
    quantity: 1,
    watts: 3200,
    hoursPerDay: 24,
    surgeFactor: 1.2,
    powerFactor: 0.95,
    diversityFactor: 1.0,
  },
  {
    id: '2',
    name: 'HVAC Industrial Chiller Unit',
    category: 'Essential',
    quantity: 2,
    watts: 4500,
    hoursPerDay: 10,
    surgeFactor: 2.5,
    powerFactor: 0.82,
    diversityFactor: 0.75,
  },
  {
    id: '3',
    name: 'Factory High-Bay LED Lighting',
    category: 'Non-Essential',
    quantity: 25,
    watts: 120,
    hoursPerDay: 12,
    surgeFactor: 1.1,
    powerFactor: 0.92,
    diversityFactor: 0.90,
  },
  {
    id: '4',
    name: 'Assembly Line Motors & Drives',
    category: 'Essential',
    quantity: 4,
    watts: 2200,
    hoursPerDay: 8,
    surgeFactor: 3.0,
    powerFactor: 0.80,
    diversityFactor: 0.80,
  },
  {
    id: '5',
    name: 'Submersible Water Pump Station',
    category: 'Essential',
    quantity: 1,
    watts: 3000,
    hoursPerDay: 4,
    surgeFactor: 3.5,
    powerFactor: 0.78,
    diversityFactor: 0.70,
  },
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
  const [selectedSimHour, setSelectedSimHour] = useState<number>(12); // Default 12:00
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'me_schedule' | 'ems_simulator' | 'profile_chart'>('me_schedule');

  // EMS Simulation 24h Playback animation loop
  useEffect(() => {
    let interval: any;
    if (isPlayingSim) {
      interval = setInterval(() => {
        setSelectedSimHour((prev) => (prev + 1) % 24);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingSim]);

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
  const debouncedParams = useDebounceValue(rawCalculationParams, 150);

  // Calculating state indicator check
  const isCalculating = rawCalculationParams !== debouncedParams;

  // Debounced Sizing Calculations via solarData M&E engine
  const calculatedResults = useMemo(() => {
    return calculateSolarSizing(debouncedParams);
  }, [debouncedParams]);

  // Selected hour simulation step data
  const currentSimStep = useMemo(() => {
    const profile = calculatedResults.emsSimulation.hourlyProfile;
    return profile.find((p) => p.hour === selectedSimHour) || profile[0];
  }, [calculatedResults, selectedSimHour]);

  // Handler functions
  const handleAddLoad = () => {
    const newItem: LoadItem = {
      id: Date.now().toString(),
      name: 'New M&E Load Circuit',
      category: 'Essential',
      quantity: 1,
      watts: 1000,
      hoursPerDay: 6,
      surgeFactor: 1.5,
      powerFactor: 0.85,
      diversityFactor: 0.80,
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
    setSelectedSimHour(12);
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
    <article className="bg-[#ffffff] border border-[#c3c6d6] rounded-xl shadow-lg p-5 sm:p-6 max-w-6xl mx-auto space-y-6 text-[#181c1f]" aria-label="M&E Industrial Solar Load & EMS Simulator">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#ebeef2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d9b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#181c1f]">
                M&amp;E Solar Electrical Load &amp; EMS Priority Simulator
              </h2>
              <span className="bg-[#e0e7ff] text-[#003d9b] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                M&amp;E Standard &amp; EMS 3-Stage Logic
              </span>
            </div>
            <p className="text-xs text-[#434654] mt-0.5">
              Computes Active ($kW$), Reactive ($kVAR$), Apparent Power ($kVA$), Power Factor, and simulates Solar $\rightarrow$ Battery $\rightarrow$ Grid energy flow over 24 hours.
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

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 border-b border-[#cbd5e1] pb-1 overflow-x-auto" aria-label="Calculator Views">
        <button
          onClick={() => setActiveTab('me_schedule')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'me_schedule'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>M&amp;E Electrical Load Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('ems_simulator')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ems_simulator'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-300" />
          <span>3-Stage EMS Flow Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('profile_chart')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile_chart'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5 text-sky-300" />
          <span>24-Hour Load Profile &amp; SoC Graph</span>
        </button>
      </nav>

      {/* M&E Industrial Summary Cards (Active, Reactive, Apparent Power, System Power Factor) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3.5 rounded-xl border border-[#c3c6d6]" aria-label="M&E Industrial Calculation Metrics">
        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">Coincident Active Power ($kW$)</span>
          <div className="text-lg font-black text-[#003d9b] font-mono mt-0.5">
            {calculatedResults.totalConnectedKw.toFixed(2)} <span className="text-xs font-semibold text-[#525666]">kW</span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Installed Total: {calculatedResults.totalInstalledKw.toFixed(2)} kW
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">Apparent Power ($kVA$)</span>
          <div className="text-lg font-black text-indigo-700 font-mono mt-0.5">
            {calculatedResults.totalApparentKva.toFixed(2)} <span className="text-xs font-semibold text-[#525666]">kVA</span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Transformer &amp; Inverter Demand
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">Reactive Power ($kVAR$)</span>
          <div className="text-lg font-black text-amber-700 font-mono mt-0.5">
            {calculatedResults.totalReactiveKvar.toFixed(2)} <span className="text-xs font-semibold text-[#525666]">kVAR</span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Inductive Load Compensation
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">System Power Factor ($PF$)</span>
          <div className="text-lg font-black text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
            <span>{calculatedResults.systemPowerFactor.toFixed(2)}</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                calculatedResults.systemPowerFactor >= 0.85
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {calculatedResults.systemPowerFactor >= 0.85 ? 'Good' : 'Low PF'}
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Weighted $\cos(\phi)$ Ratio
          </span>
        </div>
      </section>

      {/* Category Distribution Badges */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-[#f1f5f9] p-2.5 rounded-lg border border-[#cbd5e1]">
        <span className="font-bold text-[#1e293b] uppercase text-[10px] tracking-wider mr-1">
          Load Category Breakdown:
        </span>
        {calculatedResults.categoryBreakdown.map((cat) => (
          <div
            key={cat.category}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border ${
              cat.category === 'Critical'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : cat.category === 'Essential'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <span>{cat.category}:</span>
            <span className="font-mono">{cat.activeKw} kW</span>
            <span className="text-[10px] opacity-75">({cat.apparentKva} kVA | {cat.percentageOfTotal}%)</span>
          </div>
        ))}
      </div>

      {/* TAB 1: M&E ELECTRICAL LOAD SCHEDULE */}
      {activeTab === 'me_schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Electrical Load Items Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                M&amp;E Industrial Electrical Load Schedule
              </h3>
              <button
                onClick={handleAddLoad}
                className="px-3 py-1 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add M&amp;E Load</span>
              </button>
            </div>

            <div className="border border-[#c3c6d6] rounded-lg overflow-hidden bg-[#f8fafc]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#e2e8f0] text-[#1e293b] font-bold uppercase text-[10px] tracking-wider border-b border-[#cbd5e1]">
                    <tr>
                      <th className="p-2.5">Appliance / Load</th>
                      <th className="p-2.5 w-28">Category</th>
                      <th className="p-2.5 w-16 text-center">Qty</th>
                      <th className="p-2.5 w-20">Watts</th>
                      <th className="p-2.5 w-20" title="Diversity Factor (0.1 - 1.0)">Div (DF)</th>
                      <th className="p-2.5 w-20" title="Power Factor (0.4 - 1.0)">PF ($\cos\phi$)</th>
                      <th className="p-2.5 w-16">Hrs/Day</th>
                      <th className="p-2.5 w-20">Active kW</th>
                      <th className="p-2.5 w-20">Apparent kVA</th>
                      <th className="p-2.5 w-10 text-center">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {loadItems.map((item) => {
                      const qty = item.quantity || 1;
                      const watts = item.watts || 0;
                      const df = item.diversityFactor || 0.8;
                      const pf = item.powerFactor || 0.85;
                      const activeKw = (qty * watts * df) / 1000;
                      const apparentKva = pf > 0 ? activeKw / pf : activeKw;

                      return (
                        <tr key={item.id} className="hover:bg-[#f1f5f9] transition-colors">
                          <td className="p-2">
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

                          {/* Category Dropdown */}
                          <td className="p-2">
                            <select
                              value={item.category}
                              aria-label={`Load category for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, { category: e.target.value as LoadCategory })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1.5 py-1 text-[11px] font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            >
                              <option value="Critical">Critical</option>
                              <option value="Essential">Essential</option>
                              <option value="Non-Essential">Non-Essential</option>
                            </select>
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={item.quantity}
                              aria-label={`Quantity for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                              }
                              className="w-full text-center bg-white border border-[#cbd5e1] rounded px-1 py-1 text-xs font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              step="10"
                              value={item.watts}
                              aria-label={`Watts rating for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, { watts: Math.max(1, parseFloat(e.target.value) || 0) })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1.5 py-1 text-xs font-mono font-bold text-[#003d9b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          {/* Diversity Factor Input */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={item.diversityFactor}
                              aria-label={`Diversity Factor for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, {
                                  diversityFactor: Math.min(1.0, Math.max(0.1, parseFloat(e.target.value) || 0.8)),
                                })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1 py-1 text-xs font-mono text-[#003d9b] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          {/* Power Factor Input */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.4"
                              max="1.0"
                              step="0.02"
                              value={item.powerFactor}
                              aria-label={`Power Factor for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, {
                                  powerFactor: Math.min(1.0, Math.max(0.4, parseFloat(e.target.value) || 0.85)),
                                })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1 py-1 text-xs font-mono text-[#003d9b] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="0.1"
                              max="24"
                              step="0.5"
                              value={item.hoursPerDay}
                              aria-label={`Operating hours for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, {
                                  hoursPerDay: Math.min(24, Math.max(0.1, parseFloat(e.target.value) || 0.1)),
                                })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1 py-1 text-xs font-mono text-[#1e293b] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          <td className="p-2 font-mono font-bold text-[#003d9b]">
                            {activeKw.toFixed(2)} kW
                          </td>

                          <td className="p-2 font-mono font-bold text-indigo-700">
                            {apparentKva.toFixed(2)} kVA
                          </td>

                          <td className="p-2 text-center">
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
      )}

      {/* TAB 2: 3-STAGE EMS PRIORITY FLOW SIMULATOR */}
      {activeTab === 'ems_simulator' && (
        <div className="space-y-6">
          {/* Priority Sequence Banner */}
          <div className="bg-[#0f172a] text-white p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">
                  Energy Management System (EMS) 3-Stage Priority Flow
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                Self-Consumption: {calculatedResults.emsSimulation.solarSelfConsumptionRatio}%
              </span>
            </div>

            {/* Stage Priority Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Stage 1 */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  currentSimStep.stage === 'Solar'
                    ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50'
                    : 'bg-slate-800/60 border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1 text-amber-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-4 h-4" /> 1. Solar Priority
                  </span>
                  {currentSimStep.stage === 'Solar' && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  P<sub>Solar</sub> &ge; P<sub>Load</sub> &rarr; Solar generation directly powers load. Surplus solar charges battery up to 100% SoC.
                </p>
              </div>

              {/* Stage 2 */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  currentSimStep.stage === 'Battery'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50'
                    : 'bg-slate-800/60 border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1 text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Battery className="w-4 h-4" /> 2. Battery Priority
                  </span>
                  {currentSimStep.stage === 'Battery' && (
                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  P<sub>Solar</sub> &lt; P<sub>Load</sub> &rarr; Battery discharges energy to supply deficit down to 20% Min SoC.
                </p>
              </div>

              {/* Stage 3 */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  currentSimStep.stage === 'Grid'
                    ? 'bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/50'
                    : 'bg-slate-800/60 border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1 text-sky-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> 3. Grid Priority
                  </span>
                  {currentSimStep.stage === 'Grid' && (
                    <span className="bg-sky-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If Solar + Battery capacity is insufficient, import remaining deficit $kW$ from Grid.
                </p>
              </div>
            </div>

            {/* 24h Playback Controls & Slider */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingSim(!isPlayingSim)}
                    className="px-3 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    {isPlayingSim ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingSim ? 'Pause Simulation' : 'Play 24h Loop'}</span>
                  </button>

                  <span className="font-mono text-amber-300 text-sm">
                    Simulated Time: {currentSimStep.timeLabel}
                  </span>
                </div>

                <span className="text-slate-400 text-[11px]">
                  Grid Dependence: <strong className="text-sky-300">{calculatedResults.emsSimulation.gridDependenceRatio}%</strong>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={selectedSimHour}
                aria-label="Simulation hour selector from 0 to 23"
                onChange={(e) => {
                  setIsPlayingSim(false);
                  setSelectedSimHour(parseInt(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Power Balance Breakdown at Selected Hour */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Solar Generation */}
            <div className="bg-[#f8fafc] border border-[#c3c6d6] p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-[#525666] font-bold">
                <span className="flex items-center gap-1 text-amber-700">
                  <Sun className="w-4 h-4" /> Solar PV Output
                </span>
                <span className="font-mono font-bold text-amber-900">{currentSimStep.solarKw} kW</span>
              </div>
              <div className="text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8f0] space-y-0.5">
                <div>To Load: <strong className="font-mono text-[#181c1f]">{currentSimStep.solarToLoadKw} kW</strong></div>
                <div>To Battery: <strong className="font-mono text-[#181c1f]">{currentSimStep.solarToBatteryKw} kW</strong></div>
              </div>
            </div>

            {/* Battery Storage Action */}
            <div className="bg-[#f8fafc] border border-[#c3c6d6] p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-[#525666] font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Battery className="w-4 h-4" /> Battery Action
                </span>
                <span
                  className={`font-mono font-bold ${
                    currentSimStep.batteryKw > 0
                      ? 'text-emerald-700'
                      : currentSimStep.batteryKw < 0
                      ? 'text-amber-700'
                      : 'text-slate-600'
                  }`}
                >
                  {currentSimStep.batteryKw > 0
                    ? `+${currentSimStep.batteryKw} kW (Discharge)`
                    : currentSimStep.batteryKw < 0
                    ? `${currentSimStep.batteryKw} kW (Charge)`
                    : '0.0 kW (Idle)'}
                </span>
              </div>
              <div className="text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">
                State of Charge (SoC):{' '}
                <strong className="font-mono text-emerald-800 font-bold">{currentSimStep.socPercent}%</strong>
              </div>
            </div>

            {/* Grid Import */}
            <div className="bg-[#f8fafc] border border-[#c3c6d6] p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-[#525666] font-bold">
                <span className="flex items-center gap-1 text-sky-700">
                  <Building2 className="w-4 h-4" /> Grid Import
                </span>
                <span className="font-mono font-bold text-sky-800">{currentSimStep.gridKw} kW</span>
              </div>
              <div className="text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">
                Deficit Coverage:{' '}
                <strong className="font-mono text-[#181c1f]">
                  {currentSimStep.gridKw > 0 ? 'Active Grid Feed' : '100% Off-Grid'}
                </strong>
              </div>
            </div>

            {/* Total Load Demand */}
            <div className="bg-[#f8fafc] border border-[#c3c6d6] p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-[#525666] font-bold">
                <span className="flex items-center gap-1 text-[#003d9b]">
                  <Zap className="w-4 h-4" /> Total Demand
                </span>
                <span className="font-mono font-bold text-[#003d9b]">{currentSimStep.loadKw} kW</span>
              </div>
              <div className="text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8f0]">
                Hour Stage:{' '}
                <strong className="font-mono text-[#003d9b] uppercase">STAGE {currentSimStep.stage}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 24-HOUR LOAD PROFILE & BATTERY SOC GRAPH */}
      {activeTab === 'profile_chart' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4" />
              Dynamic 24-Hour Load Profile &amp; Energy Flow Graph
            </h3>
            <span className="text-[11px] text-[#525666] font-mono">
              24h Step Resolution | Dual-Axis (Power kW / Battery SoC %)
            </span>
          </div>

          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#c3c6d6] h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={calculatedResults.emsSimulation.hourlyProfile}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="timeLabel" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#003d9b" fontSize={11} label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#003d9b' } }} />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} domain={[0, 100]} label={{ value: 'SoC (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#059669' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px', borderRadius: '8px' }}
                  formatter={(value: any, name: any) => [
                    `${value} ${name === 'Battery SoC (%)' ? '%' : 'kW'}`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                <Area yAxisId="left" type="monotone" dataKey="solarKw" name="Solar PV Generation (kW)" fill="#f59e0b" stroke="#d97706" fillOpacity={0.25} />
                <Area yAxisId="left" type="monotone" dataKey="loadKw" name="Load Demand (kW)" fill="#6366f1" stroke="#4f46e5" fillOpacity={0.15} />
                <Area yAxisId="left" type="monotone" dataKey="gridKw" name="Grid Import (kW)" fill="#0284c7" stroke="#0369a1" fillOpacity={0.2} />
                <Line yAxisId="right" type="monotone" dataKey="socPercent" name="Battery SoC (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
            IEEE 1547 &amp; M&amp;E Industrial Standard Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Daily Energy Consumption</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              {calculatedResults.dailyKwh.toFixed(1)} <span className="text-xs font-normal text-slate-200">kWh/day</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">Coincident Demand: {calculatedResults.totalConnectedKw.toFixed(1)} kW</span>
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
