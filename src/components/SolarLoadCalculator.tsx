import React, { useState, useMemo, useEffect } from 'react';
import {
  LoadItem,
  LoadCategory,
  LoadPriority,
  OperationalSchedule,
} from '../types';
import {
  calculateSolarSizing,
  REGIONAL_SOLAR_CONSTANTS,
  SolarSizingResult,
} from '../data/solarData';
import {
  Calculator,
  Plus,
  Trash2,
  Sliders,
  Zap,
  Activity,
  PieChart as PieChartIcon,
  Sun,
  Battery,
  Building2,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Gauge,
  Factory,
  ShieldAlert,
  Power,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Info,
  Layers,
  DollarSign,
  TrendingUp,
  Coins,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SolarLoadCalculatorProps {
  canvasPvCapacityKw?: number;
  canvasBatteryCapacityKwh?: number;
  canvasInverterCapacityKw?: number;
  onResetOfficialSld?: () => void;
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
    name: 'Production Lines & Assembly',
    category: 'Essential',
    priorityLevel: 'Priority 2 (Standard Production)',
    quantity: 1,
    watts: 30600,
    hoursPerDay: 9,
    surgeFactor: 2.0,
    powerFactor: 0.85,
    diversityFactor: 1.0,
    operationalSchedule: 'Day Shift (08:00 - 17:00)',
  },
  {
    id: '2',
    name: 'Factory High-Bay Lighting & Air Handling',
    category: 'Non-Essential',
    priorityLevel: 'Priority 3 (Heavy Non-Essential)',
    quantity: 1,
    watts: 51250,
    hoursPerDay: 9,
    surgeFactor: 1.5,
    powerFactor: 0.88,
    diversityFactor: 1.0,
    operationalSchedule: 'Day Shift (08:00 - 17:00)',
  },
  {
    id: '3',
    name: 'Critical IT Server Room & Controls',
    category: 'Critical',
    priorityLevel: 'Priority 1 (Critical)',
    quantity: 1,
    watts: 18220,
    hoursPerDay: 24,
    surgeFactor: 1.2,
    powerFactor: 0.95,
    diversityFactor: 1.0,
    operationalSchedule: '24/7 Continuous',
  },
];

export const SolarLoadCalculator: React.FC<SolarLoadCalculatorProps> = ({
  canvasPvCapacityKw = 124.8,
  canvasBatteryCapacityKwh = 286.7,
  canvasInverterCapacityKw = 100,
  onResetOfficialSld,
  onApplySizingToDiagram,
  onClose,
}) => {
  const { t } = useLanguage();

  // Raw interactive input states
  const [loadItems, setLoadItems] = useState<LoadItem[]>(DEFAULT_LOAD_ITEMS);
  const [peakSunHours, setPeakSunHours] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_PEAK_SUN_HOURS);
  const [inverterEfficiency, setInverterEfficiency] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_INVERTER_EFFICIENCY);
  const [batteryDod, setBatteryDod] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_BATTERY_DOD); // Default 80%
  const [autonomyDays, setAutonomyDays] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_AUTONOMY_DAYS);
  const [systemVoltage, setSystemVoltage] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SYSTEM_VOLTAGE);
  const [safetyMargin, setSafetyMargin] = useState<number>(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SAFETY_MARGIN);

  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [selectedSimHour, setSelectedSimHour] = useState<number>(12); // Default 12:00
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'me_schedule' | 'load_shedding' | 'ems_simulator' | 'profile_chart'>('me_schedule');

  // Load Shedding Advisor Interactive States
  const [sheddingThresholdSoc, setSheddingThresholdSoc] = useState<number>(30); // Default 30% SoC threshold
  const [testBatterySoc, setTestBatterySoc] = useState<number>(25); // Simulated test SoC (e.g. 25%)
  const [manualSheddedIds, setManualSheddedIds] = useState<string[]>(['2']); // Default shed heavy loads

  // Grid Electricity Tariff & MMK Exchange Rate States
  const [gridTariffUsd, setGridTariffUsd] = useState<number>(0.14); // $0.14 / kWh commercial rate
  const [mmkExchangeRate, setMmkExchangeRate] = useState<number>(3500); // 3,500 MMK / USD

  // Perform full calculation memoized with active canvas specs
  const calculatedResults: SolarSizingResult = useMemo(() => {
    return calculateSolarSizing({
      loadItems,
      peakSunHours,
      inverterEfficiency,
      batteryDod,
      autonomyDays,
      systemVoltage,
      safetyMargin,
      installedPvKw: canvasPvCapacityKw,
      installedBatteryKwh: canvasBatteryCapacityKwh,
      installedInverterKw: canvasInverterCapacityKw,
    });
  }, [
    loadItems,
    peakSunHours,
    inverterEfficiency,
    batteryDod,
    autonomyDays,
    systemVoltage,
    safetyMargin,
    canvasPvCapacityKw,
    canvasBatteryCapacityKwh,
    canvasInverterCapacityKw,
  ]);

  // Usable Battery Capacity calculation: Total kWh * DoD (default 80%)
  const totalBatteryKwh = calculatedResults.recommendedBatteryKwh;
  const usableBatteryKwh = Math.round(totalBatteryKwh * (batteryDod / 100) * 10) / 10;

  // Calculate Grid Energy Financial Savings (USD & MMK)
  const financialSavings = useMemo(() => {
    const dailySolarGenKwh = calculatedResults.emsSimulation.totalDailySolarKwh;
    const dailyGridImportKwh = calculatedResults.emsSimulation.totalDailyGridImportKwh;
    const dailyTotalLoadKwh = calculatedResults.emsSimulation.totalDailyLoadKwh;

    // Grid energy replaced = daily load met by solar + battery discharging solar
    const dailySavedKwh = Math.max(0, dailyTotalLoadKwh - dailyGridImportKwh);

    const dailySavedUsd = dailySavedKwh * gridTariffUsd;
    const monthlySavedUsd = dailySavedUsd * 30;
    const annualSavedUsd = dailySavedUsd * 365;

    const dailySavedMmk = dailySavedUsd * mmkExchangeRate;
    const monthlySavedMmk = monthlySavedUsd * mmkExchangeRate;
    const annualSavedMmk = annualSavedUsd * mmkExchangeRate;

    return {
      dailySavedKwh: Math.round(dailySavedKwh * 10) / 10,
      dailySolarGenKwh,
      selfConsumptionRatio: calculatedResults.emsSimulation.solarSelfConsumptionRatio,
      dayShiftSelfConsumptionRatio: calculatedResults.emsSimulation.dayShiftSelfConsumptionRatio,
      dayShiftSolarCoverageRatio: calculatedResults.emsSimulation.dayShiftSolarCoverageRatio,
      dailySavedUsd: Math.round(dailySavedUsd * 100) / 100,
      monthlySavedUsd: Math.round(monthlySavedUsd * 10) / 10,
      annualSavedUsd: Math.round(annualSavedUsd),
      dailySavedMmk: Math.round(dailySavedMmk),
      monthlySavedMmk: Math.round(monthlySavedMmk),
      annualSavedMmk: Math.round(annualSavedMmk),
    };
  }, [calculatedResults, gridTariffUsd, mmkExchangeRate]);

  // 24-Hour Profile Chart Data with Solar Surplus & Deficit Area calculations
  const chartProfileData = useMemo(() => {
    return calculatedResults.emsSimulation.hourlyProfile.map((pt) => {
      const surplusKw = Math.max(0, pt.solarKw - pt.loadKw);
      const deficitKw = Math.max(0, pt.loadKw - pt.solarKw);
      return {
        ...pt,
        solarSurplusKw: Math.round(surplusKw * 100) / 100,
        deficitKw: Math.round(deficitKw * 100) / 100,
      };
    });
  }, [calculatedResults.emsSimulation.hourlyProfile]);

  // 24h Playback simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingSim) {
      interval = setInterval(() => {
        setSelectedSimHour((prev) => (prev + 1) % 24);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSim]);

  const currentSimStep = calculatedResults.emsSimulation.hourlyProfile[selectedSimHour] || {
    hour: 12,
    timeLabel: '12:00',
    loadKw: 0,
    solarKw: 0,
    batteryKw: 0,
    gridKw: 0,
    socPercent: 50,
    stage: 'Solar',
    solarToLoadKw: 0,
    solarToBatteryKw: 0,
  };

  // Real-time Solar Utilization Efficiency at selected hour
  const realTimeSolarUtilization = currentSimStep.solarKw > 0
    ? Math.min(100, Math.round(((currentSimStep.solarToLoadKw + currentSimStep.solarToBatteryKw) / currentSimStep.solarKw) * 100))
    : 0;

  // Priority Level Active Power Calculations
  const priorityBreakdown = useMemo(() => {
    let p1Kw = 0;
    let p2Kw = 0;
    let p3Kw = 0;

    let p1Kwh = 0;
    let p2Kwh = 0;
    let p3Kwh = 0;

    loadItems.forEach((item) => {
      const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
      const watts = Math.max(0, Number(item.watts) || 0);
      const df = Math.max(0.1, Math.min(1.0, Number(item.diversityFactor) || 0.80));
      const hrs = Math.max(0, Number(item.hoursPerDay) || 0);
      const activeKw = (qty * watts * df) / 1000;
      const dailyKwh = activeKw * hrs;

      const priority = item.priorityLevel || 'Priority 2 (Standard Production)';

      if (priority === 'Priority 1 (Critical)') {
        p1Kw += activeKw;
        p1Kwh += dailyKwh;
      } else if (priority === 'Priority 2 (Standard Production)') {
        p2Kw += activeKw;
        p2Kwh += dailyKwh;
      } else {
        p3Kw += activeKw;
        p3Kwh += dailyKwh;
      }
    });

    const totalKw = p1Kw + p2Kw + p3Kw || 1;

    return {
      p1Kw: Math.round(p1Kw * 100) / 100,
      p2Kw: Math.round(p2Kw * 100) / 100,
      p3Kw: Math.round(p3Kw * 100) / 100,
      p1Kwh: Math.round(p1Kwh * 10) / 10,
      p2Kwh: Math.round(p2Kwh * 10) / 10,
      p3Kwh: Math.round(p3Kwh * 10) / 10,
      p1Pct: Math.round((p1Kw / totalKw) * 100),
      p2Pct: Math.round((p2Kw / totalKw) * 100),
      p3Pct: Math.round((p3Kw / totalKw) * 100),
    };
  }, [loadItems]);

  // Load Shedding Advisor Active Calculations based on manual toggle states
  const sheddedLoadImpact = useMemo(() => {
    let sheddedKw = 0;
    let sheddedKwh = 0;

    loadItems.forEach((item) => {
      if (manualSheddedIds.includes(item.id)) {
        const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
        const watts = Math.max(0, Number(item.watts) || 0);
        const df = Math.max(0.1, Math.min(1.0, Number(item.diversityFactor) || 0.80));
        const hrs = Math.max(0, Number(item.hoursPerDay) || 0);
        const activeKw = (qty * watts * df) / 1000;
        sheddedKw += activeKw;
        sheddedKwh += activeKw * hrs;
      }
    });

    const fullLoadKw = calculatedResults.totalConnectedKw || 1;
    const loadAfterShedKw = Math.max(0, fullLoadKw - sheddedKw);

    // Battery Autonomy hours for Critical P1 loads alone
    const p1OnlyKw = priorityBreakdown.p1Kw || 1;
    const fullAutonomyHours = Math.round((usableBatteryKwh / fullLoadKw) * 10) / 10;
    const criticalOnlyAutonomyHours = Math.round((usableBatteryKwh / p1OnlyKw) * 10) / 10;
    const activeAutonomyHours = Math.round((usableBatteryKwh / (loadAfterShedKw || 1)) * 10) / 10;

    return {
      sheddedKw: Math.round(sheddedKw * 100) / 100,
      sheddedKwh: Math.round(sheddedKwh * 10) / 10,
      loadAfterShedKw: Math.round(loadAfterShedKw * 100) / 100,
      fullAutonomyHours,
      criticalOnlyAutonomyHours,
      activeAutonomyHours,
      hoursGained: Math.max(0, Math.round((activeAutonomyHours - fullAutonomyHours) * 10) / 10),
    };
  }, [loadItems, manualSheddedIds, calculatedResults.totalConnectedKw, usableBatteryKwh, priorityBreakdown.p1Kw]);

  // Handlers
  const handleAddLoad = () => {
    const newItem: LoadItem = {
      id: Date.now().toString(),
      name: 'New Factory Circuit Load',
      category: 'Essential',
      priorityLevel: 'Priority 2 (Standard Production)',
      quantity: 1,
      watts: 5000,
      hoursPerDay: 9,
      surgeFactor: 1.5,
      powerFactor: 0.85,
      diversityFactor: 0.80,
      operationalSchedule: 'Day Shift (08:00 - 17:00)',
    };
    setLoadItems([...loadItems, newItem]);
  };

  const handleUpdateLoad = (id: string, updates: Partial<LoadItem>) => {
    setLoadItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Auto-sync category and priority level defaults if category changes
        if (updates.category) {
          if (updates.category === 'Critical') {
            updated.priorityLevel = 'Priority 1 (Critical)';
          } else if (updates.category === 'Essential') {
            updated.priorityLevel = 'Priority 2 (Standard Production)';
          } else if (updates.category === 'Non-Essential') {
            updated.priorityLevel = 'Priority 3 (Heavy Non-Essential)';
          }
        }

        if (updates.operationalSchedule) {
          if (updates.operationalSchedule === 'Day Shift (08:00 - 17:00)') {
            updated.hoursPerDay = 9;
          } else if (updates.operationalSchedule === 'Night Shift (17:00 - 01:00)') {
            updated.hoursPerDay = 8;
          } else if (updates.operationalSchedule === '24/7 Continuous') {
            updated.hoursPerDay = 24;
          }
        }
        return updated;
      })
    );
  };

  const handleDeleteLoad = (id: string) => {
    setLoadItems(loadItems.filter((item) => item.id !== id));
  };

  const handleResetDefaults = () => {
    setLoadItems(DEFAULT_LOAD_ITEMS);
    setPeakSunHours(REGIONAL_SOLAR_CONSTANTS.DEFAULT_PEAK_SUN_HOURS);
    setInverterEfficiency(REGIONAL_SOLAR_CONSTANTS.DEFAULT_INVERTER_EFFICIENCY);
    setBatteryDod(REGIONAL_SOLAR_CONSTANTS.DEFAULT_BATTERY_DOD);
    setAutonomyDays(REGIONAL_SOLAR_CONSTANTS.DEFAULT_AUTONOMY_DAYS);
    setSystemVoltage(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SYSTEM_VOLTAGE);
    setSafetyMargin(REGIONAL_SOLAR_CONSTANTS.DEFAULT_SAFETY_MARGIN);
    setSheddingThresholdSoc(30);
    setTestBatterySoc(25);
    setManualSheddedIds(['2']);

    if (onResetOfficialSld) {
      onResetOfficialSld();
    }
  };

  const toggleShedItem = (id: string) => {
    if (manualSheddedIds.includes(id)) {
      setManualSheddedIds(manualSheddedIds.filter((item) => item !== id));
    } else {
      setManualSheddedIds([...manualSheddedIds, id]);
    }
  };

  // Helper to render Gauge SVG
  const renderGaugeArc = (valuePercent: number, labelTitle: string) => {
    const pct = Math.max(0, Math.min(100, valuePercent));
    const needleAngle = -90 + (pct / 100) * 180;

    let badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
    let statusText = 'MODERATE SOLAR DEMAND';

    if (pct >= 80) {
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      statusText = 'HIGH OPTIMAL UTILIZATION';
    } else if (pct >= 50) {
      badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      statusText = 'BALANCED SELF-CONSUMPTION';
    }

    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#cbd5e1] shadow-xs">
        <span className="text-[10px] font-bold text-[#525666] uppercase tracking-wider mb-1">
          {labelTitle}
        </span>
        <div className="relative w-44 h-24 flex items-center justify-center overflow-visible">
          <svg className="w-44 h-24 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* 0-50% Segment Sky Blue */}
            <path
              d="M 20 100 A 80 80 0 0 1 100 20"
              fill="none"
              stroke="#0284c7"
              strokeWidth="16"
              strokeOpacity="0.35"
            />
            {/* 50-80% Segment Amber */}
            <path
              d="M 100 20 A 80 80 0 0 1 164.8 48.8"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="16"
              strokeOpacity="0.35"
            />
            {/* 80-100% Segment Emerald */}
            <path
              d="M 164.8 48.8 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeOpacity="0.35"
            />
            {/* Active Progress Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#0284c7'}
              strokeWidth="16"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * pct) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            {/* Center Pin */}
            <circle cx="100" cy="100" r="7" fill="#0f172a" />
            {/* Needle Line */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="32"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <div className="absolute bottom-0 text-center">
            <span className="text-xl font-black font-mono text-[#0f172a]">{pct}%</span>
          </div>
        </div>
        <span className={`mt-2 text-[9px] font-black px-2 py-0.5 rounded border ${badgeColor}`}>
          {statusText}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#c3c6d6] p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#ebeef2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d9b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#181c1f]">
                Factory Solar Plant Specs &amp; M&amp;E Load Calculator
              </h2>
              <div className="flex items-center gap-2 bg-[#e0e7ff] text-[#003d9b] text-xs font-bold px-3 py-1 rounded-full border border-[#a5b4fc] shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>⚡ Live Synced with Active SLD Canvas</span>
              </div>
            </div>
            <p className="text-xs text-[#434654] mt-1 flex items-center gap-3 flex-wrap font-medium">
              <span>Solar Array: <strong className="text-[#003d9b]">{canvasPvCapacityKw} kWp</strong></span>
              <span>•</span>
              <span>BESS Storage: <strong className="text-[#003d9b]">{canvasBatteryCapacityKwh} kWh</strong></span>
              <span>•</span>
              <span>Inverter AC: <strong className="text-[#003d9b]">{canvasInverterCapacityKw} kW</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#003d9b] text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer border border-[#c3c6d6]"
            title="Reset both Diagram Canvas and Load Calculator to Official Factory Specs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Official SLD</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 border-b border-[#cbd5e1] pb-1 overflow-x-auto" aria-label="Calculator Views">
        <button
          onClick={() => setActiveTab('me_schedule')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'me_schedule'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>M&amp;E Load Schedule &amp; Shift Timings</span>
        </button>

        <button
          onClick={() => setActiveTab('load_shedding')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'load_shedding'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
          <span>Load Shedding Advisor &amp; Priority Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('ems_simulator')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'ems_simulator'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-300" />
          <span>3-Stage EMS &amp; Solar Gauge Indicator</span>
        </button>

        <button
          onClick={() => setActiveTab('profile_chart')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile_chart'
              ? 'bg-[#003d9b] text-white shadow-xs'
              : 'text-[#434654] hover:bg-[#f1f4f8]'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5 text-sky-300" />
          <span>24-Hour Load Profile &amp; SoC Graph</span>
        </button>
      </nav>

      {/* Factory Solar Plant Metrics & Battery Usable Capacity Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-3 bg-[#f8fafc] p-3.5 rounded-xl border border-[#c3c6d6]" aria-label="Factory Solar Plant Calculation Metrics">
        {/* Metric 1: Coincident Active Power */}
        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">Coincident Active Power ($kW$)</span>
          <div className="text-lg font-black text-[#003d9b] font-mono mt-0.5">
            {calculatedResults.totalConnectedKw.toFixed(2)} <span className="text-xs font-semibold text-[#525666]">kW</span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Installed Total: {calculatedResults.totalInstalledKw.toFixed(2)} kW
          </span>
        </div>

        {/* Metric 2: Battery Storage Capacity & Usable kWh (Total kWh * DoD 80%) */}
        <div className="bg-white p-3 rounded-lg border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block flex items-center gap-1">
            <Battery className="w-3 h-3 text-emerald-600" />
            Usable Battery Energy ({batteryDod}% DoD)
          </span>
          <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">
            {usableBatteryKwh} <span className="text-xs font-semibold text-emerald-700">kWh</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
            Nameplate Rating: {totalBatteryKwh} kWh
          </span>
        </div>

        {/* Metric 3: Day Shift (08:00 - 17:00) Solar Self-Consumption Ratio */}
        <div className="bg-white p-3 rounded-lg border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 uppercase block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Day Shift (08:00-17:00) Self-Consumption
          </span>
          <div className="text-lg font-black text-amber-900 font-mono mt-0.5">
            {calculatedResults.emsSimulation.dayShiftSelfConsumptionRatio}%
          </div>
          <span className="text-[10px] text-amber-700 block mt-0.5">
            PV: {calculatedResults.emsSimulation.dayShiftSolarGeneratedKwh} kWh | Load: {calculatedResults.emsSimulation.dayShiftFactoryLoadKwh} kWh
          </span>
        </div>

        {/* Metric 4: Daytime Solar Coverage */}
        <div className="bg-white p-3 rounded-lg border border-indigo-200">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block flex items-center gap-1">
            <Sun className="w-3 h-3 text-indigo-600" />
            Daytime Solar Coverage
          </span>
          <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">
            {calculatedResults.emsSimulation.dayShiftSolarCoverageRatio}%
          </div>
          <span className="text-[10px] text-indigo-700 block mt-0.5">
            Factory Grid Independence
          </span>
        </div>

        {/* Metric 5: System Power Factor */}
        <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
          <span className="text-[10px] font-bold text-[#525666] uppercase block">System Power Factor ($PF$)</span>
          <div className="text-lg font-black text-indigo-700 font-mono mt-0.5 flex items-center gap-1">
            <span>{calculatedResults.systemPowerFactor.toFixed(2)}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
              {calculatedResults.totalApparentKva.toFixed(1)} kVA
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] block mt-0.5">
            Apparent Power Demand
          </span>
        </div>
      </section>

      {/* Priority Level Breakdown Badges */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-[#f1f5f9] p-2.5 rounded-lg border border-[#cbd5e1]">
        <span className="font-bold text-[#1e293b] uppercase text-[10px] tracking-wider mr-1">
          M&amp;E Load Priority Levels:
        </span>

        <div className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border bg-rose-50 border-rose-200 text-rose-800">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          <span>Priority 1 (Critical):</span>
          <span className="font-mono">{priorityBreakdown.p1Kw} kW</span>
          <span className="text-[10px] opacity-75">({priorityBreakdown.p1Pct}%)</span>
        </div>

        <div className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border bg-amber-50 border-amber-200 text-amber-800">
          <Zap className="w-3 h-3 text-amber-600" />
          <span>Priority 2 (Standard Production):</span>
          <span className="font-mono">{priorityBreakdown.p2Kw} kW</span>
          <span className="text-[10px] opacity-75">({priorityBreakdown.p2Pct}%)</span>
        </div>

        <div className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border bg-slate-100 border-slate-300 text-slate-800">
          <Power className="w-3 h-3 text-slate-600" />
          <span>Priority 3 (Heavy Non-Essential):</span>
          <span className="font-mono">{priorityBreakdown.p3Kw} kW</span>
          <span className="text-[10px] opacity-75">({priorityBreakdown.p3Pct}%)</span>
        </div>
      </div>

      {/* TAB 1: M&E ELECTRICAL LOAD SCHEDULE */}
      {activeTab === 'me_schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Electrical Load Items Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Factory Equipment, Priority Classification &amp; Schedules
              </h3>
              <button
                type="button"
                onClick={handleAddLoad}
                className="px-2.5 py-1 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Equipment Load</span>
              </button>
            </div>

            <div className="border border-[#c3c6d6] rounded-lg overflow-hidden bg-[#f8fafc]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#e2e8f0] text-[#1e293b] font-bold uppercase text-[10px] tracking-wider border-b border-[#cbd5e1]">
                    <tr>
                      <th className="p-2.5">Equipment Load</th>
                      <th className="p-2.5 w-32">Priority Level</th>
                      <th className="p-2.5 w-36">Operational Schedule</th>
                      <th className="p-2.5 w-14 text-center">Qty</th>
                      <th className="p-2.5 w-18">Watts</th>
                      <th className="p-2.5 w-16" title="Diversity Factor (0.1 - 1.0)">Div (DF)</th>
                      <th className="p-2.5 w-16" title="Power Factor (0.4 - 1.0)">PF ($\cos\phi$)</th>
                      <th className="p-2.5 w-14">Hrs</th>
                      <th className="p-2.5 w-20">Active kW</th>
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
                      const activeKw = (qty * watts * df) / 1000;
                      const priority = item.priorityLevel || 'Priority 2 (Standard Production)';

                      return (
                        <tr key={item.id} className="hover:bg-[#f1f5f9] transition-colors">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              aria-label={`Equipment name for load ${item.id}`}
                              onChange={(e) => handleUpdateLoad(item.id, { name: e.target.value })}
                              className="w-full bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs font-semibold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            />
                          </td>

                          {/* Priority Level Dropdown */}
                          <td className="p-2">
                            <select
                              value={priority}
                              aria-label={`Priority level for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, {
                                  priorityLevel: e.target.value as LoadPriority,
                                })
                              }
                              className={`w-full border rounded px-1.5 py-1 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-[#003d9b] ${
                                priority.includes('Priority 1')
                                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                                  : priority.includes('Priority 2')
                                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                                  : 'bg-slate-100 border-slate-300 text-slate-800'
                              }`}
                            >
                              <option value="Priority 1 (Critical)">Priority 1 (Critical)</option>
                              <option value="Priority 2 (Standard Production)">Priority 2 (Production)</option>
                              <option value="Priority 3 (Heavy Non-Essential)">Priority 3 (Heavy)</option>
                            </select>
                          </td>

                          {/* Operational Schedule Dropdown */}
                          <td className="p-2">
                            <select
                              value={item.operationalSchedule || '24/7 Continuous'}
                              aria-label={`Operational schedule for ${item.name}`}
                              onChange={(e) =>
                                handleUpdateLoad(item.id, {
                                  operationalSchedule: e.target.value as OperationalSchedule,
                                })
                              }
                              className="w-full bg-white border border-[#cbd5e1] rounded px-1.5 py-1 text-[10px] font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                            >
                              <option value="Day Shift (08:00 - 17:00)">Day Shift (08:00 - 17:00)</option>
                              <option value="Night Shift (17:00 - 01:00)">Night Shift (17:00 - 01:00)</option>
                              <option value="24/7 Continuous">24/7 Continuous</option>
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
                              step="100"
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

                          <td className="p-2 font-mono font-bold text-slate-700 text-center">
                            {item.hoursPerDay}h
                          </td>

                          <td className="p-2 font-mono font-bold text-[#003d9b]">
                            {activeKw.toFixed(2)} kW
                          </td>

                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteLoad(item.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors cursor-pointer"
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

          {/* Right Column: Battery DoD & Site Parameters */}
          <div className="space-y-4 bg-[#f8fafc] p-4 rounded-lg border border-[#c3c6d6]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              Battery DoD &amp; Solis System Parameters
            </h3>

            {/* Battery Usable Storage Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-emerald-900 block flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                Battery Usable Capacity Calculation
              </span>
              <div className="text-sm font-black text-emerald-900 font-mono">
                {usableBatteryKwh} kWh Usable Energy
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Calculated as Nameplate Capacity ({totalBatteryKwh} kWh) &times; Depth of Discharge ({batteryDod}% DoD). Reserve set to 20% Min SoC.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Battery Depth of Discharge (DoD) Slider */}
              <div>
                <div className="flex justify-between font-semibold text-[#1e293b]">
                  <label htmlFor="dod-slider" className="cursor-pointer">
                    Battery Depth of Discharge (DoD):
                  </label>
                  <span className="font-mono text-emerald-700 font-bold">{batteryDod}%</span>
                </div>
                <input
                  id="dod-slider"
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={batteryDod}
                  aria-label="Battery Depth of Discharge percentage"
                  onChange={(e) => setBatteryDod(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

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
                    Solis Inverter Efficiency:
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

              {/* System DC Voltage Select */}
              <div>
                <label htmlFor="system-voltage-select" className="block font-semibold text-[#1e293b] mb-1">
                  System DC Bus Voltage Rating:
                </label>
                <select
                  id="system-voltage-select"
                  value={systemVoltage}
                  aria-label="System DC Voltage Rating"
                  onChange={(e) => setSystemVoltage(parseInt(e.target.value))}
                  className="w-full bg-white border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                >
                  <option value={48}>48 VDC (LFP Low Voltage)</option>
                  <option value={51.2}>51.2 VDC (Lithium LFP 16S)</option>
                  <option value={120}>120 VDC High Voltage Bus</option>
                  <option value={400}>400 VDC Commercial / Solis Bus</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOAD SHEDDING ADVISOR & M&E OPERATOR CONTROLS */}
      {activeTab === 'load_shedding' && (
        <div className="space-y-6">
          {/* Top Alert & Advisory Banner */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              testBatterySoc <= 20
                ? 'bg-rose-950 text-white border-rose-700 shadow-md'
                : testBatterySoc <= sheddingThresholdSoc
                ? 'bg-amber-950 text-white border-amber-600 shadow-md'
                : 'bg-emerald-950 text-white border-emerald-600 shadow-md'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    testBatterySoc <= 20
                      ? 'bg-rose-600 text-white animate-bounce'
                      : testBatterySoc <= sheddingThresholdSoc
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {testBatterySoc <= 20
                      ? '🚨 CRITICAL EMERGENCY LOAD SHEDDING ALERT'
                      : testBatterySoc <= sheddingThresholdSoc
                      ? '⚠️ LOAD SHEDDING WARNING IN EFFECT'
                      : '🟢 SYSTEM OPERATING NORMALLY'}
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {testBatterySoc <= 20
                      ? `Battery SoC dropped to ${testBatterySoc}% (At Min SoC Reserve limit). Immediately disconnect Priority 2 & Priority 3 loads!`
                      : testBatterySoc <= sheddingThresholdSoc
                      ? `Battery SoC is ${testBatterySoc}% (Below ${sheddingThresholdSoc}% threshold). Disconnect Priority 3 Heavy Non-Essential loads.`
                      : `Battery SoC is ${testBatterySoc}% (Above ${sheddingThresholdSoc}% threshold). All equipment loads permitted to operate.`}
                  </p>
                </div>
              </div>

              {/* Interactive SoC Simulator Controls */}
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/10 shrink-0">
                <span className="text-[11px] font-bold text-slate-300">Test Battery SoC:</span>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={testBatterySoc}
                  onChange={(e) => setTestBatterySoc(parseInt(e.target.value))}
                  className="w-24 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-sm font-black text-amber-300 w-10 text-right">
                  {testBatterySoc}%
                </span>
              </div>
            </div>

            {/* Configurable Threshold Slider Bar */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Configurable Load Shedding Threshold:</span>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="5"
                  value={sheddingThresholdSoc}
                  onChange={(e) => setSheddingThresholdSoc(parseInt(e.target.value))}
                  className="w-28 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-300">{sheddingThresholdSoc}% SoC</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span>Total Usable Storage: <strong className="text-emerald-300">{usableBatteryKwh} kWh</strong></span>
                <span>Critical Battery Reserve: <strong className="text-rose-300">{Math.round(totalBatteryKwh * 0.2)} kWh</strong></span>
              </div>
            </div>
          </div>

          {/* 3 Priority Level Classification Cards & M&E Shedding Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority 1 Card: Critical */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    P1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase">Priority 1: Critical</h4>
                    <span className="text-[10px] text-rose-700">Must run continuously</span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-rose-800">{priorityBreakdown.p1Kw} kW</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Controls, Server Room, Automation PLCs, and Essential Safety Lighting. Never shed automatically.
              </p>

              <div className="space-y-1.5 text-xs bg-rose-50/50 p-2.5 rounded border border-rose-100">
                {loadItems
                  .filter((item) => item.priorityLevel === 'Priority 1 (Critical)')
                  .map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="font-mono font-bold text-rose-700">
                        {((item.quantity * item.watts * item.diversityFactor) / 1000).toFixed(1)} kW
                      </span>
                    </div>
                  ))}
              </div>

              <div className="text-[10px] text-rose-800 font-semibold bg-rose-100 px-2 py-1 rounded text-center">
                Autonomy on Usable Battery: ~{sheddedLoadImpact.criticalOnlyAutonomyHours} Hours
              </div>
            </div>

            {/* Priority 2 Card: Standard Production */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    P2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase">Priority 2: Production</h4>
                    <span className="text-[10px] text-amber-700">Shed if SoC &lt; {sheddingThresholdSoc}%</span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-amber-800">{priorityBreakdown.p2Kw} kW</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Standard assembly line CNC motors and drives. Powered by Solar + Battery; shed during prolonged outages.
              </p>

              <div className="space-y-1.5 text-xs bg-amber-50/50 p-2.5 rounded border border-amber-100">
                {loadItems
                  .filter((item) => item.priorityLevel === 'Priority 2 (Standard Production)')
                  .map((item) => {
                    const isShed = manualSheddedIds.includes(item.id);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-[11px]">
                        <span className={`font-medium ${isShed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShedItem(item.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            isShed
                              ? 'bg-rose-200 text-rose-800 hover:bg-rose-300'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {isShed ? 'SHEDDED' : 'ONLINE'}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <div className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-1 rounded text-center">
                Protected by Inverter Aux Contact #2
              </div>
            </div>

            {/* Priority 3 Card: Heavy Non-Essential */}
            <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                    P3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Priority 3: Heavy Non-Essential</h4>
                    <span className="text-[10px] text-slate-600">Shed on Battery operation</span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-slate-800">{priorityBreakdown.p3Kw} kW</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Main HVAC Chiller, compressors, and high-power night shifts. Disconnect first when running purely on Battery.
              </p>

              <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                {loadItems
                  .filter((item) => item.priorityLevel === 'Priority 3 (Heavy Non-Essential)')
                  .map((item) => {
                    const isShed = manualSheddedIds.includes(item.id);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-[11px]">
                        <span className={`font-medium ${isShed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShedItem(item.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            isShed
                              ? 'bg-rose-200 text-rose-800 hover:bg-rose-300'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {isShed ? 'SHEDDED' : 'ONLINE'}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <div className="text-[10px] text-slate-800 font-semibold bg-slate-200 px-2 py-1 rounded text-center">
                Automatically Shed via Solis PLC Relay #1
              </div>
            </div>
          </div>

          {/* Real-time Shedding Savings & Battery Autonomy Extension Summary */}
          <div className="bg-[#f8fafc] border border-[#c3c6d6] p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-[#003d9b] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Interactive Load Shedding Impact &amp; Autonomy Extension Calculator
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#cbd5e1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Shedded Power</span>
                <span className="text-lg font-black font-mono text-rose-600">-{sheddedLoadImpact.sheddedKw} kW</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Immediate Demand Relief</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#cbd5e1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Energy Saved</span>
                <span className="text-lg font-black font-mono text-emerald-600">-{sheddedLoadImpact.sheddedKwh} kWh</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Conserved Battery Storage</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#cbd5e1]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Net Operating Demand</span>
                <span className="text-lg font-black font-mono text-[#003d9b]">{sheddedLoadImpact.loadAfterShedKw} kW</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Remaining Active Load</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Extended Critical Autonomy</span>
                <span className="text-lg font-black font-mono text-emerald-900">{sheddedLoadImpact.activeAutonomyHours} Hours</span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                  +{sheddedLoadImpact.hoursGained} Hours Extra Autonomy!
                </span>
              </div>
            </div>

            {/* M&E Operator Action Protocol Checklist */}
            <div className="pt-3 border-t border-[#cbd5e1] space-y-2">
              <span className="text-[11px] font-bold text-[#1e293b] uppercase tracking-wider block">
                Substation M&amp;E Operator Action Protocol:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-[#e2e8f0]">
                  <span className="font-bold text-[#003d9b] bg-[#e0e7ff] px-1.5 py-0.5 rounded text-[10px]">1</span>
                  <span><strong>Dry Contact Relay 1:</strong> Automatic trip output sent to Chiller MCCB when SoC &lt; {sheddingThresholdSoc}%.</span>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-[#e2e8f0]">
                  <span className="font-bold text-[#003d9b] bg-[#e0e7ff] px-1.5 py-0.5 rounded text-[10px]">2</span>
                  <span><strong>Manual Isolation:</strong> Verify Sub-Panel 3 breaker status on Main Distribution Board PrismaSeT.</span>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-[#e2e8f0]">
                  <span className="font-bold text-[#003d9b] bg-[#e0e7ff] px-1.5 py-0.5 rounded text-[10px]">3</span>
                  <span><strong>Restoration:</strong> Re-engage Priority 3 loads automatically once Solar PV generates &gt; 50kW or SoC &gt; 50%.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3-STAGE EMS PRIORITY FLOW SIMULATOR & SOLAR UTILIZATION GAUGE */}
      {activeTab === 'ems_simulator' && (
        <div className="space-y-6">
          {/* Priority Sequence Banner */}
          <div className="bg-[#0f172a] text-white p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">
                  Solis Energy Management System (EMS) 3-Stage Priority Flow
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
                    className="px-3 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
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

          {/* Dual Gauges & Real-time Power Balance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Solar Utilization Efficiency Gauge 1: Day Shift Overall */}
            {renderGaugeArc(
              calculatedResults.emsSimulation.dayShiftSelfConsumptionRatio,
              'Day Shift Solar Self-Consumption'
            )}

            {/* Solar Utilization Efficiency Gauge 2: Selected Hour Real-time */}
            {renderGaugeArc(
              realTimeSolarUtilization,
              `Hour ${currentSimStep.timeLabel} Real-Time Solar Efficiency`
            )}

            {/* Real-time Hour Summary Stats Card */}
            <div className="bg-[#f8fafc] border border-[#c3c6d6] p-4 rounded-xl text-xs space-y-2 flex flex-col justify-center">
              <div className="flex justify-between items-center pb-2 border-b border-[#cbd5e1]">
                <span className="font-bold text-[#003d9b] flex items-center gap-1">
                  <Gauge className="w-4 h-4" /> Selected Hour Breakdown ({currentSimStep.timeLabel})
                </span>
                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                  STAGE {currentSimStep.stage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Solar PV Gen: <strong className="font-mono text-amber-800">{currentSimStep.solarKw} kW</strong></div>
                <div>Factory Load: <strong className="font-mono text-[#003d9b]">{currentSimStep.loadKw} kW</strong></div>
                <div>Solar to Load: <strong className="font-mono text-emerald-800">{currentSimStep.solarToLoadKw} kW</strong></div>
                <div>Solar to Battery: <strong className="font-mono text-indigo-800">{currentSimStep.solarToBatteryKw} kW</strong></div>
                <div>Battery SoC: <strong className="font-mono text-slate-800">{currentSimStep.socPercent}%</strong></div>
                <div>Grid Import: <strong className="font-mono text-sky-800">{currentSimStep.gridKw} kW</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 24-HOUR LOAD PROFILE & BATTERY SOC GRAPH */}
      {activeTab === 'profile_chart' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#cbd5e1]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-[#003d9b]" />
                Interactive 24-Hour Solis Solar PV vs Factory Load Profile
              </h3>
              <p className="text-[11px] text-[#434654] mt-0.5">
                Dual-axis simulation featuring Solis 124.8 kWp Peak Generation Curve vs M&amp;E Operational Equipment Load Schedules.
              </p>
            </div>
            <span className="text-[11px] text-[#525666] font-mono bg-[#f1f5f9] px-2.5 py-1 rounded border border-[#cbd5e1] shrink-0">
              24h Step Resolution | Peak 124.8 kW @ 12:00 PM
            </span>
          </div>

          {/* Stat Cards Grid: 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Stat Card 1: Daily Solar Self-Consumption */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  Daily Solar Generation
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                  {financialSavings.selfConsumptionRatio}% Self-Consumed
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-amber-950 font-mono">
                  {financialSavings.dailySolarGenKwh} <span className="text-xs font-bold text-amber-800">kWh/day</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1 font-medium flex items-center justify-between">
                  <span>Day Shift (08:00-17:00):</span>
                  <strong className="font-mono text-amber-900">{financialSavings.dayShiftSelfConsumptionRatio}% Ratio</strong>
                </div>
              </div>
            </div>

            {/* Stat Card 2: Daily Grid Energy Saved */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Grid Electricity Saved
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                  Offsetting Grid
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-emerald-950 font-mono">
                  {financialSavings.dailySavedKwh} <span className="text-xs font-bold text-emerald-800">kWh/day</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-medium flex items-center justify-between">
                  <span>Grid Dependence:</span>
                  <strong className="font-mono text-emerald-900">{calculatedResults.emsSimulation.gridDependenceRatio}%</strong>
                </div>
              </div>
            </div>

            {/* Stat Card 3: Estimated Financial Savings (USD / MMK) */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-800">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-indigo-600" />
                  Grid Cost Savings
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono">
                  ROI Advisor
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-indigo-950 font-mono">
                  ${financialSavings.monthlySavedUsd.toLocaleString()} <span className="text-xs font-bold text-indigo-800">/ mo</span>
                </div>
                <div className="text-[11px] text-indigo-900 mt-1 font-bold flex items-center justify-between">
                  <span>MMK Savings:</span>
                  <span className="font-mono text-indigo-700">{financialSavings.monthlySavedMmk.toLocaleString()} MMK/mo</span>
                </div>
              </div>
            </div>

            {/* Stat Card 4: Configurable Tariff & MMK Exchange Rate */}
            <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1] shadow-xs space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-[#003d9b] block tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#003d9b]" />
                Tariff &amp; Exchange Controls
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <label htmlFor="tariff-input" className="text-[#434654] font-medium cursor-pointer">Grid Tariff ($/kWh):</label>
                  <input
                    id="tariff-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1.00"
                    value={gridTariffUsd}
                    onChange={(e) => setGridTariffUsd(Math.max(0.01, parseFloat(e.target.value) || 0.14))}
                    className="w-16 bg-white border border-[#cbd5e1] rounded px-1.5 py-0.5 text-right font-mono font-bold text-[#0f172a]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="exchange-input" className="text-[#434654] font-medium cursor-pointer">MMK Rate (MMK/$):</label>
                  <input
                    id="exchange-input"
                    type="number"
                    step="100"
                    min="1000"
                    max="10000"
                    value={mmkExchangeRate}
                    onChange={(e) => setMmkExchangeRate(Math.max(1000, parseInt(e.target.value) || 3500))}
                    className="w-20 bg-white border border-[#cbd5e1] rounded px-1.5 py-0.5 text-right font-mono font-bold text-[#0f172a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#c3c6d6] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#003d9b]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                  24-Hour Solis PV vs Factory Power Load &amp; Battery SoC Curve
                </h4>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-[10px] font-bold flex-wrap">
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Solis PV Gen (Peak 124.8 kW)
                </span>
                <span className="flex items-center gap-1 text-[#003d9b]">
                  <span className="w-2.5 h-0.5 bg-[#003d9b] inline-block" />
                  Factory Power Load (kW)
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-600 inline-block" />
                  Solar Surplus (PV &gt; Load)
                </span>
                <span className="flex items-center gap-1 text-orange-700">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500/40 border border-orange-600 inline-block" />
                  Deficit Area (PV &lt; Load)
                </span>
                <span className="flex items-center gap-1 text-emerald-800">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
                  Battery SoC (%)
                </span>
              </div>
            </div>

            {/* Recharts Composed Chart */}
            <div className="h-96 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartProfileData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="timeLabel"
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                  />
                  <YAxis
                    yAxisId="power"
                    orientation="left"
                    unit=" kW"
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                  />
                  <YAxis
                    yAxisId="soc"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 10, fill: '#059669', fontWeight: 700 }}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0f172a] text-slate-100 border border-[#334155] p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans min-w-52">
                            <div className="font-bold text-amber-400 border-b border-[#334155] pb-1.5 flex justify-between items-center">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Time: {data.timeLabel}
                              </span>
                              <span className="text-[10px] font-black uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {data.stage} Priority
                              </span>
                            </div>
                            <div className="pt-1 space-y-1.5 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="text-amber-300 flex items-center gap-1 font-medium">
                                  <Sun className="w-3 h-3 text-amber-400" /> Solis PV Gen:
                                </span>
                                <strong className="font-mono text-amber-300 font-black">{data.solarKw} kW</strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sky-300 flex items-center gap-1 font-medium">
                                  <Zap className="w-3 h-3 text-sky-400" /> Factory Load:
                                </span>
                                <strong className="font-mono text-sky-300 font-black">{data.loadKw} kW</strong>
                              </div>
                              {data.solarSurplusKw > 0 && (
                                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                                  <span>Solar Surplus (PV &gt; Load):</span>
                                  <strong className="font-mono">+{data.solarSurplusKw} kW</strong>
                                </div>
                              )}
                              {data.deficitKw > 0 && (
                                <div className="flex justify-between items-center text-orange-400 font-bold bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800">
                                  <span>Power Deficit (PV &lt; Load):</span>
                                  <strong className="font-mono">-{data.deficitKw} kW</strong>
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                                <span className="text-emerald-300 flex items-center gap-1 font-medium">
                                  <Battery className="w-3 h-3 text-emerald-400" /> Battery SoC:
                                </span>
                                <strong className="font-mono text-emerald-300 font-black">{data.socPercent}%</strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sky-400 flex items-center gap-1 font-medium">
                                  <Building2 className="w-3 h-3 text-sky-400" /> Grid Import:
                                </span>
                                <strong className="font-mono text-sky-400 font-black">{data.gridKw} kW</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  {/* 1. Base PV Generation Area */}
                  <Area
                    yAxisId="power"
                    type="monotone"
                    dataKey="solarKw"
                    name="Solis PV Generation (kW)"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth={1.5}
                    fillOpacity={0.2}
                  />

                  {/* 2. Solar Surplus Highlight Area (PV > Load) in Green */}
                  <Area
                    yAxisId="power"
                    type="monotone"
                    dataKey="solarSurplusKw"
                    name="Solar Surplus Area (Green)"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth={1.5}
                    fillOpacity={0.4}
                  />

                  {/* 3. Power Deficit Highlight Area (PV < Load) in Orange/Red */}
                  <Area
                    yAxisId="power"
                    type="monotone"
                    dataKey="deficitKw"
                    name="Battery/Grid Deficit Area (Orange)"
                    fill="#f97316"
                    stroke="#ea580c"
                    strokeWidth={1.5}
                    fillOpacity={0.25}
                  />

                  {/* 4. Factory Load Line in Deep Navy */}
                  <Line
                    yAxisId="power"
                    type="monotone"
                    dataKey="loadKw"
                    name="Factory Power Load (kW)"
                    stroke="#003d9b"
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#003d9b' }}
                  />

                  {/* 5. Battery SoC Line on Right Axis */}
                  <Line
                    yAxisId="soc"
                    type="monotone"
                    dataKey="socPercent"
                    name="Battery SoC (%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />

                  {/* 6. Grid Import Area */}
                  <Area
                    yAxisId="power"
                    type="monotone"
                    dataKey="gridKw"
                    name="Grid Utility Import (kW)"
                    fill="#0284c7"
                    stroke="#0369a1"
                    strokeWidth={1}
                    fillOpacity={0.15}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Phase Breakdown Explanatory Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Phase 1: Solar Surplus Phase */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
              <span className="font-bold text-emerald-900 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-emerald-600" />
                1. Solar Surplus Phase (09:00 - 15:00)
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Solis PV generation exceeds factory demand (P<sub>Solar</sub> &gt; P<sub>Load</sub>). High surplus power directly charges battery storage up to 100% SoC while supplying day shift production.
              </p>
            </div>

            {/* Phase 2: Battery Discharge Phase */}
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl space-y-1">
              <span className="font-bold text-orange-900 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-orange-600" />
                2. Deficit / Battery Phase (17:00 - 01:00)
              </span>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                PV generation decreases at dusk. Stored battery energy discharges to meet night shift production loads down to min SoC limit ({100 - batteryDod}%), shielding the factory from peak utility tariffs.
              </p>
            </div>

            {/* Phase 3: Grid Backup Phase */}
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl space-y-1">
              <span className="font-bold text-sky-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                3. Grid Backup Phase (01:00 - 08:00)
              </span>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                When battery reaches minimum reserve SoC, Solis hybrid inverter seamlessly switches to Grid backup power to maintain 24/7 continuous server room &amp; essential safety lighting loads.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
