/**
 * Modular Solar Data & Calculation Configuration for IIDA Electronics Myanmar
 * Includes:
 * - Product catalog presets & technical specifications
 * - Solar load calculation formulas with edge-case validation & fallback guards
 * - Quotation request input sanitization & validation routines
 */

import { EquipmentLibraryItem, EquipmentType, LoadItem, LoadCategory } from '../types';

export type { LoadItem, LoadCategory };

// ============================================================================
// 1. REGIONAL & ENGINEERING CONSTANTS
// ============================================================================

export const REGIONAL_SOLAR_CONSTANTS = {
  DEFAULT_PEAK_SUN_HOURS: 4.8, // Average PSH for Myanmar (Yangon: 4.8 - 5.2 kWh/m²/day)
  MIN_PEAK_SUN_HOURS: 1.0,
  MAX_PEAK_SUN_HOURS: 10.0,
  SYSTEM_LOSS_FACTOR: 0.82, // 18% system losses (cable drop, dust, temperature coefficient)
  DEFAULT_INVERTER_EFFICIENCY: 95, // %
  DEFAULT_BATTERY_DOD: 80, // % depth of discharge for LiFePO4
  DEFAULT_AUTONOMY_DAYS: 1.5, // Days of backup power
  DEFAULT_SAFETY_MARGIN: 20, // % growth buffer
  DEFAULT_SYSTEM_VOLTAGE: 48, // VDC
};

// ============================================================================
// 2. PRODUCT CATALOG DATA PRESETS
// ============================================================================

export interface SolarCatalogItem extends EquipmentLibraryItem {
  id: string;
  sku: string;
  priceMmk: number;
  warrantyYears: number;
  specifications: Record<string, string>;
  isFeatured?: boolean;
}

export const SOLAR_PRODUCT_CATALOG: SolarCatalogItem[] = [
  {
    id: 'solis-110kw-inv',
    type: 'inverter',
    defaultName: 'Solis S6 110kW Industrial Hybrid Inverter',
    category: 'Conversion',
    defaultCapacity: '110.0 kW AC / 165.0 kW DC',
    defaultVoltage: '400V 3-Phase / 1000V DC MPPT',
    defaultManufacturer: 'Solis (Ginlong Technologies)',
    defaultModel: 'Solis-S6-EH3P110K-H',
    imageUrl: '',
    specSheetUrl: 'https://example.com/specs/solis-s6-110k.pdf',
    description: 'Utility & industrial 3-phase hybrid inverter with 10 MPPTs, 165kW max PV input, integrated Solis Cloud EMS monitoring, and 100kW+ factory parallel grid capability.',
    iconName: 'Zap',
    sku: 'SOLIS-INV-110KW-3P',
    priceMmk: 38500000,
    warrantyYears: 10,
    isFeatured: true,
    specifications: {
      'Nominal AC Output': '110,000 W (110 kW)',
      'Max PV Array Capacity': '165,000 W (165 kWp)',
      'MPPT Channels': '10 MPPTs / 20 Inputs',
      'Max Efficiency': '98.8%',
      'Grid Switching': '< 10 ms UPS Automatic',
    },
  },
  {
    id: 'solis-124k-pv',
    type: 'pv_array',
    defaultName: 'Solis 124.8 kWp Factory Solar Array',
    category: 'Generation',
    defaultCapacity: '124.8 kWp (215 Modules @ 580W)',
    defaultVoltage: '720 VDC Operating / 1000 VDC Max',
    defaultManufacturer: 'Solis / IIDA Solar Tech',
    defaultModel: 'Solis-PV-124.8KW-TOPCon',
    imageUrl: '',
    specSheetUrl: 'https://example.com/specs/solis-pv-124k.pdf',
    description: 'Factory rooftop solar plant specs: 124.8 kWp N-type TOPCon bifacial monocrystalline PV array optimized for 08:00-17:00 day shift solar generation.',
    iconName: 'Sun',
    sku: 'SOLIS-PV-124.8KW',
    priceMmk: 63420000,
    warrantyYears: 12,
    isFeatured: true,
    specifications: {
      'Array Total Capacity': '124.8 kWp',
      'Module Quantity': '215 Modules @ 580W',
      'Module Efficiency': '22.8%',
      'Daily Generation (Yangon)': '590 - 620 kWh/day',
      'Temperature Coeff': '-0.30% / °C',
    },
  },
  {
    id: 'bat-bess-200kwh',
    type: 'battery',
    defaultName: 'Solis High-Voltage 200kWh Industrial BESS',
    category: 'Storage',
    defaultCapacity: '204.8 kWh (640V 320Ah LFP)',
    defaultVoltage: '640 VDC High Voltage Bus',
    defaultManufacturer: 'Solis Energy Storage',
    defaultModel: 'Solis-BESS-HV-200K',
    imageUrl: '',
    specSheetUrl: 'https://example.com/specs/solis-bess-200k.pdf',
    description: 'Containerized industrial LiFePO4 battery cabinet with active thermal management, fire suppression, and liquid-cooled BMS.',
    iconName: 'Battery',
    sku: 'SOLIS-BAT-HV-200KWH',
    priceMmk: 85000000,
    warrantyYears: 10,
    isFeatured: true,
    specifications: {
      'Capacity': '204.8 kWh',
      'Nominal Voltage': '640 VDC',
      'Chemistry': 'Tier-1 LiFePO4',
      'Cycle Life': '> 8,000 cycles @ 80% DOD',
      'Cooling': 'Liquid Cooled Active Thermal',
    },
  },
  {
    id: 'comb-10str-1000v',
    type: 'combiner_box',
    defaultName: 'Solis 10-String Industrial DC Combiner',
    category: 'Generation',
    defaultCapacity: '250A DC Continuous',
    defaultVoltage: '1000 VDC Max',
    defaultManufacturer: 'Solis Electric',
    defaultModel: 'Solis-DC-COMB-10P',
    imageUrl: '',
    specSheetUrl: 'https://example.com/specs/solis-dc-combiner.pdf',
    description: 'Industrial IP66 rated DC combiner enclosure with 20x 1000V fuses, motorized DC isolation switch, and Type 1+2 surge arrestors.',
    iconName: 'Box',
    sku: 'SOLIS-DC-COMB-10P',
    priceMmk: 1250000,
    warrantyYears: 5,
    specifications: {
      'Max Strings': '10 Input / 2 Output',
      'Enclosure Rating': 'IP66 NEMA 4X Heavy Duty',
      'Surge Protection': '1000V DC Type 1+2 SPD',
      'Isolator Switch': '250A Motorized DC Break',
    },
  },
];

// ============================================================================
// 3. CALCULATION FORMULAS & EMS SIMULATION TYPES
// ============================================================================

export interface SolarSizingInput {
  loadItems: LoadItem[];
  peakSunHours: number;
  inverterEfficiency: number;
  batteryDod: number;
  autonomyDays: number;
  systemVoltage: number;
  safetyMargin: number;
  installedPvKw?: number;
  installedBatteryKwh?: number;
  installedInverterKw?: number;
}

export interface CalculationWarning {
  field: string;
  message: string;
  type: 'warning' | 'info' | 'error';
}

export interface CategoryPowerBreakdown {
  category: LoadCategory;
  activeKw: number;
  apparentKva: number;
  reactiveKvar: number;
  percentageOfTotal: number;
}

export interface EmsHourlyStep {
  hour: number;
  timeLabel: string;
  loadKw: number;
  solarKw: number;
  batteryKw: number; // positive = discharging, negative = charging
  gridKw: number;
  socPercent: number;
  stage: 'Solar' | 'Battery' | 'Grid';
  solarToLoadKw: number;
  solarToBatteryKw: number;
}

export interface EmsSimulationResult {
  hourlyProfile: EmsHourlyStep[];
  totalDailySolarKwh: number;
  totalDailyLoadKwh: number;
  totalDailyGridImportKwh: number;
  totalBatteryDischargedKwh: number;
  totalBatteryChargedKwh: number;
  solarSelfConsumptionRatio: number; // %
  dayShiftSolarGeneratedKwh: number; // 08:00 - 17:00 Total PV generated
  dayShiftFactoryLoadKwh: number; // 08:00 - 17:00 Total Factory Load required
  dayShiftSelfConsumptionRatio: number; // % Day Shift Solar Self-Consumption Ratio
  dayShiftSolarCoverageRatio: number; // % Day Shift Load Coverage by Solar
  gridDependenceRatio: number; // %
  minSocPercent: number;
  maxSocPercent: number;
}

export interface SolarSizingResult {
  totalInstalledKw: number;
  totalConnectedKw: number; // Active Power P (kW) with diversity factor
  totalApparentKva: number; // Apparent Power S (kVA)
  totalReactiveKvar: number; // Reactive Power Q (kVAR)
  systemPowerFactor: number; // Weighted system power factor
  dailyKwh: number;
  peakSurgeKw: number;
  peakSurgeKva: number;
  recommendedPvKw: number;
  recommendedBatteryKwh: number;
  recommendedUsableBatteryKwh: number; // Total kWh * DoD (default 80%)
  batteryDodPercent: number; // DoD %
  recommendedInverterKw: number;
  maxDcCurrentAmps: number;
  recommendedFuseAmps: number;
  categoryBreakdown: CategoryPowerBreakdown[];
  emsSimulation: EmsSimulationResult;
  warnings: CalculationWarning[];
}

/**
 * 3-Stage Energy Priority Flow Simulator (Solar -> Battery -> Grid)
 * Stage 1 (Solar Priority): Solar generation supplies load directly; surplus charges battery up to 100% SoC.
 * Stage 2 (Battery Priority): If Solar < Load, Battery discharges to fill deficit down to 20% SoC.
 * Stage 3 (Grid Priority): If Solar + Battery < Load, remaining deficit is imported from Grid.
 */
export function runEmsSimulation(
  pvKw: number,
  batteryKwh: number,
  dailyLoadKwh: number,
  peakSunHours: number,
  minSoc: number = 20,
  loadItems?: LoadItem[]
): EmsSimulationResult {
  const hourlyProfile: EmsHourlyStep[] = [];
  const psh = Math.max(1.0, peakSunHours);
  const sysLoss = REGIONAL_SOLAR_CONSTANTS.SYSTEM_LOSS_FACTOR;

  // Normalized bell-curve daylight factors for solar generation (06:00 to 18:00)
  const solarFactors = [
    0, 0, 0, 0, 0, 0, // 00:00 - 05:00
    0.10, 0.35, 0.65, 0.88, 0.98, 1.0, // 06:00 - 11:00
    0.98, 0.88, 0.65, 0.35, 0.10, 0, // 12:00 - 17:00
    0, 0, 0, 0, 0, 0, // 18:00 - 23:00
  ];
  const sumSolarFactors = solarFactors.reduce((a, b) => a + b, 0);
  const targetDailySolarKwh = pvKw * psh * sysLoss;

  // Build itemized operational schedule load curve if loadItems are provided
  const itemizedHourlyLoadKw = new Array(24).fill(0);
  let hasValidScheduleLoads = false;

  if (loadItems && loadItems.length > 0) {
    loadItems.forEach((item) => {
      const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
      const watts = Math.max(0, Number(item.watts) || 0);
      const df = Math.max(0.1, Math.min(1.0, Number(item.diversityFactor) || 0.80));
      const activeKw = (qty * watts * df) / 1000;
      if (activeKw <= 0) return;

      hasValidScheduleLoads = true;
      const sched = item.operationalSchedule || '24/7 Continuous';

      if (sched === 'Day Shift (08:00 - 17:00)') {
        for (let h = 8; h <= 16; h++) {
          itemizedHourlyLoadKw[h] += activeKw;
        }
      } else if (sched === 'Night Shift (17:00 - 01:00)') {
        for (let h = 17; h <= 23; h++) {
          itemizedHourlyLoadKw[h] += activeKw;
        }
        itemizedHourlyLoadKw[0] += activeKw;
      } else {
        // 24/7 Continuous
        for (let h = 0; h < 24; h++) {
          itemizedHourlyLoadKw[h] += activeKw;
        }
      }
    });
  }

  // Industrial factory 24h fallback curve if no schedule load items
  const loadFactors = [
    0.30, 0.28, 0.25, 0.25, 0.30, 0.45, // 00:00 - 05:00 (Night base load)
    0.65, 0.85, 1.00, 1.00, 0.95, 0.90, // 06:00 - 11:00 (Day shift peak)
    0.85, 0.95, 1.00, 0.90, 0.75, 0.60, // 12:00 - 17:00 (Afternoon peak & shift change)
    0.55, 0.50, 0.45, 0.40, 0.35, 0.30, // 18:00 - 23:00 (Evening operations)
  ];
  const sumLoadFactors = loadFactors.reduce((a, b) => a + b, 0);

  let currentSoc = 50.0; // Start simulation at 50% SoC
  let totalSolarGenKwh = 0;
  let totalLoadKwh = 0;
  let totalGridKwh = 0;
  let totalBatDischarged = 0;
  let totalBatCharged = 0;
  let minSocSeen = 100;
  let maxSocSeen = 0;

  // Day shift metrics (08:00 - 17:00 -> hours 8 through 16)
  let dayShiftSolarGen = 0;
  let dayShiftLoadReq = 0;
  let dayShiftSolarToLoad = 0;
  let dayShiftSolarToBat = 0;

  for (let h = 0; h < 24; h++) {
    const timeLabel = `${String(h).padStart(2, '0')}:00`;
    const hourSolarKw = sumSolarFactors > 0 ? (solarFactors[h] / sumSolarFactors) * targetDailySolarKwh : 0;
    const hourLoadKw = hasValidScheduleLoads
      ? itemizedHourlyLoadKw[h]
      : sumLoadFactors > 0
      ? (loadFactors[h] / sumLoadFactors) * dailyLoadKwh
      : 0;

    totalSolarGenKwh += hourSolarKw;
    totalLoadKwh += hourLoadKw;

    let solarToLoadKw = 0;
    let solarToBatteryKw = 0;
    let batteryKw = 0; // + discharge, - charge
    let gridKw = 0;
    let stage: 'Solar' | 'Battery' | 'Grid' = 'Solar';

    const currentBatKwh = (currentSoc / 100) * batteryKwh;
    const minBatKwh = (minSoc / 100) * batteryKwh;
    const maxBatKwh = batteryKwh;

    if (hourSolarKw >= hourLoadKw) {
      // Stage 1: Solar Priority
      stage = 'Solar';
      solarToLoadKw = hourLoadKw;
      const surplusSolar = hourSolarKw - hourLoadKw;

      const roomInBatKwh = Math.max(0, maxBatKwh - currentBatKwh);
      const chargeKw = Math.min(surplusSolar, roomInBatKwh);

      solarToBatteryKw = chargeKw;
      batteryKw = -chargeKw; // charging
      totalBatCharged += chargeKw;
      gridKw = 0;

      const newBatKwh = currentBatKwh + chargeKw;
      currentSoc = batteryKwh > 0 ? (newBatKwh / batteryKwh) * 100 : 0;
    } else {
      // Solar < Load: Need battery or grid
      solarToLoadKw = hourSolarKw;
      const deficitKw = hourLoadKw - hourSolarKw;

      const availBatDischargeKwh = Math.max(0, currentBatKwh - minBatKwh);
      const dischargeKw = Math.min(deficitKw, availBatDischargeKwh);

      batteryKw = dischargeKw; // discharging
      totalBatDischarged += dischargeKw;

      const remainingDeficitKw = deficitKw - dischargeKw;

      if (dischargeKw > 0 && remainingDeficitKw <= 0.05) {
        stage = 'Battery';
      } else if (remainingDeficitKw > 0) {
        stage = 'Grid';
        gridKw = remainingDeficitKw;
        totalGridKwh += remainingDeficitKw;
      } else {
        stage = 'Battery';
      }

      const newBatKwh = currentBatKwh - dischargeKw;
      currentSoc = batteryKwh > 0 ? (newBatKwh / batteryKwh) * 100 : 0;
    }

    currentSoc = Math.max(minSoc, Math.min(100, currentSoc));
    minSocSeen = Math.min(minSocSeen, currentSoc);
    maxSocSeen = Math.max(maxSocSeen, currentSoc);

    // Track Day Shift specific hours (08:00 - 17:00 -> hours 8 through 16)
    if (h >= 8 && h <= 16) {
      dayShiftSolarGen += hourSolarKw;
      dayShiftLoadReq += hourLoadKw;
      dayShiftSolarToLoad += solarToLoadKw;
      dayShiftSolarToBat += solarToBatteryKw;
    }

    hourlyProfile.push({
      hour: h,
      timeLabel,
      loadKw: Math.round(hourLoadKw * 100) / 100,
      solarKw: Math.round(hourSolarKw * 100) / 100,
      batteryKw: Math.round(batteryKw * 100) / 100,
      gridKw: Math.round(gridKw * 100) / 100,
      socPercent: Math.round(currentSoc * 10) / 10,
      stage,
      solarToLoadKw: Math.round(solarToLoadKw * 100) / 100,
      solarToBatteryKw: Math.round(solarToBatteryKw * 100) / 100,
    });
  }

  const solarSelfConsumption = totalSolarGenKwh > 0
    ? Math.min(100, Math.round(((totalLoadKwh + totalBatCharged - totalGridKwh) / totalSolarGenKwh) * 100))
    : 0;

  const dayShiftSelfConsumptionRatio = dayShiftSolarGen > 0
    ? Math.min(100, Math.round(((dayShiftSolarToLoad + dayShiftSolarToBat) / dayShiftSolarGen) * 100))
    : 0;

  const dayShiftSolarCoverageRatio = dayShiftLoadReq > 0
    ? Math.min(100, Math.round((dayShiftSolarToLoad / dayShiftLoadReq) * 100))
    : 0;

  const gridDependence = totalLoadKwh > 0
    ? Math.round((totalGridKwh / totalLoadKwh) * 100)
    : 0;

  return {
    hourlyProfile,
    totalDailySolarKwh: Math.round(totalSolarGenKwh * 10) / 10,
    totalDailyLoadKwh: Math.round(totalLoadKwh * 10) / 10,
    totalDailyGridImportKwh: Math.round(totalGridKwh * 10) / 10,
    totalBatteryDischargedKwh: Math.round(totalBatDischarged * 10) / 10,
    totalBatteryChargedKwh: Math.round(totalBatCharged * 10) / 10,
    solarSelfConsumptionRatio: Math.max(0, solarSelfConsumption),
    dayShiftSolarGeneratedKwh: Math.round(dayShiftSolarGen * 10) / 10,
    dayShiftFactoryLoadKwh: Math.round(dayShiftLoadReq * 10) / 10,
    dayShiftSelfConsumptionRatio: Math.max(0, dayShiftSelfConsumptionRatio),
    dayShiftSolarCoverageRatio: Math.max(0, dayShiftSolarCoverageRatio),
    gridDependenceRatio: Math.max(0, gridDependence),
    minSocPercent: Math.round(minSocSeen),
    maxSocPercent: Math.round(maxSocSeen),
  };
}

/**
 * Calculates industrial M&E electrical sizing (Active Power kW, Reactive Power kVAR, Apparent Power kVA),
 * system overall power factor, and 3-stage EMS simulation profile.
 */
export function calculateSolarSizing(input: SolarSizingInput): SolarSizingResult {
  const warnings: CalculationWarning[] = [];

  // Sanitize & fallback parameters
  const sanitizedPsh = Math.max(
    REGIONAL_SOLAR_CONSTANTS.MIN_PEAK_SUN_HOURS,
    Math.min(REGIONAL_SOLAR_CONSTANTS.MAX_PEAK_SUN_HOURS, Number(input.peakSunHours) || REGIONAL_SOLAR_CONSTANTS.DEFAULT_PEAK_SUN_HOURS)
  );
  if (input.peakSunHours <= 0) {
    warnings.push({
      field: 'peakSunHours',
      message: `Peak Sun Hours cannot be zero or negative. Applied default fallback of ${REGIONAL_SOLAR_CONSTANTS.DEFAULT_PEAK_SUN_HOURS} hours/day.`,
      type: 'warning',
    });
  }

  const sanitizedEfficiency = Math.max(50, Math.min(100, Number(input.inverterEfficiency) || REGIONAL_SOLAR_CONSTANTS.DEFAULT_INVERTER_EFFICIENCY));
  if (input.inverterEfficiency < 50) {
    warnings.push({
      field: 'inverterEfficiency',
      message: 'Inverter efficiency under 50% is unrealistic. Clamped to 50% minimum.',
      type: 'warning',
    });
  }

  const sanitizedDod = Math.max(20, Math.min(95, Number(input.batteryDod) || REGIONAL_SOLAR_CONSTANTS.DEFAULT_BATTERY_DOD));
  const sanitizedAutonomy = Math.max(0.1, Math.min(10, Number(input.autonomyDays) || REGIONAL_SOLAR_CONSTANTS.DEFAULT_AUTONOMY_DAYS));
  const sanitizedMargin = Math.max(0, Math.min(100, Number(input.safetyMargin) || REGIONAL_SOLAR_CONSTANTS.DEFAULT_SAFETY_MARGIN));
  const sanitizedVoltage = [12, 24, 48, 96, 120, 400, 800].includes(Number(input.systemVoltage))
    ? Number(input.systemVoltage)
    : REGIONAL_SOLAR_CONSTANTS.DEFAULT_SYSTEM_VOLTAGE;

  // Process load items with M&E power factor and diversity factor formulas
  let totalInstalledWatts = 0;
  let totalCoincidentActiveWatts = 0;
  let totalReactiveVarSum = 0;
  let totalDailyWattHours = 0;
  let totalPeakSurgeWatts = 0;
  let totalPeakSurgeVa = 0;
  let activeLoadCount = 0;

  const categoryTotals: Record<LoadCategory, { activeKw: number; reactiveKvar: number; apparentKva: number }> = {
    Critical: { activeKw: 0, reactiveKvar: 0, apparentKva: 0 },
    Essential: { activeKw: 0, reactiveKvar: 0, apparentKva: 0 },
    'Non-Essential': { activeKw: 0, reactiveKvar: 0, apparentKva: 0 },
  };

  input.loadItems.forEach((item, index) => {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    const watts = Math.max(0, Number(item.watts) || 0);
    const hours = Math.max(0, Math.min(24, Number(item.hoursPerDay) || 0));
    const surge = Math.max(1.0, Math.min(10.0, Number(item.surgeFactor) || 1.0));
    const pf = Math.max(0.4, Math.min(1.0, Number(item.powerFactor) || 0.85));
    const df = Math.max(0.1, Math.min(1.0, Number(item.diversityFactor) || 0.80));
    const cat: LoadCategory = ['Critical', 'Essential', 'Non-Essential'].includes(item.category as any)
      ? (item.category as LoadCategory)
      : 'Essential';

    if (qty <= 0 || watts <= 0) return;

    activeLoadCount++;
    const installedW = qty * watts;
    const coincidentActiveW = installedW * df;
    const itemApparentVa = coincidentActiveW / pf;
    const itemReactiveVar = Math.sqrt(Math.max(0, Math.pow(itemApparentVa, 2) - Math.pow(coincidentActiveW, 2)));

    const itemDailyWh = coincidentActiveW * hours;
    const itemSurgeWatts = installedW * surge;
    const itemSurgeVa = itemSurgeWatts / pf;

    totalInstalledWatts += installedW;
    totalCoincidentActiveWatts += coincidentActiveW;
    totalReactiveVarSum += itemReactiveVar;
    totalDailyWattHours += itemDailyWh;
    totalPeakSurgeWatts += itemSurgeWatts;
    totalPeakSurgeVa += itemSurgeVa;

    categoryTotals[cat].activeKw += coincidentActiveW / 1000;
    categoryTotals[cat].reactiveKvar += itemReactiveVar / 1000;

    if (watts > 10000) {
      warnings.push({
        field: `load_${index}`,
        message: `High individual load detected: "${item.name}" (${(watts / 1000).toFixed(1)} kW). Ensure dedicated breaker & soft starter.`,
        type: 'info',
      });
    }

    if (pf < 0.80) {
      warnings.push({
        field: `pf_${index}`,
        message: `Low power factor (${pf}) on "${item.name}". Consider adding power factor correction capacitors to avoid utility penalties.`,
        type: 'warning',
      });
    }
  });

  const totalCoincidentActiveKw = totalCoincidentActiveWatts / 1000;
  const totalReactiveKvar = totalReactiveVarSum / 1000;
  const totalApparentKva = Math.sqrt(Math.pow(totalCoincidentActiveKw, 2) + Math.pow(totalReactiveKvar, 2));
  const systemPowerFactor = totalApparentKva > 0 ? Math.min(1.0, totalCoincidentActiveKw / totalApparentKva) : 1.0;

  // Compute category breakdown with percentages
  const categoryBreakdown: CategoryPowerBreakdown[] = (['Critical', 'Essential', 'Non-Essential'] as LoadCategory[]).map((cat) => {
    const actKw = categoryTotals[cat].activeKw;
    const reacKvar = categoryTotals[cat].reactiveKvar;
    const appKva = Math.sqrt(Math.pow(actKw, 2) + Math.pow(reacKvar, 2));
    const pct = totalCoincidentActiveKw > 0 ? Math.round((actKw / totalCoincidentActiveKw) * 100) : 0;
    return {
      category: cat,
      activeKw: Math.round(actKw * 100) / 100,
      apparentKva: Math.round(appKva * 100) / 100,
      reactiveKvar: Math.round(reacKvar * 100) / 100,
      percentageOfTotal: pct,
    };
  });

  if (activeLoadCount === 0 || totalInstalledWatts === 0) {
    warnings.push({
      field: 'loadItems',
      message: 'No active electrical loads selected. Please add or enable at least one appliance to compute system requirements.',
      type: 'error',
    });

    const emptyEms = runEmsSimulation(0, 0, 0, sanitizedPsh, 100 - sanitizedDod);

    return {
      totalInstalledKw: 0,
      totalConnectedKw: 0,
      totalApparentKva: 0,
      totalReactiveKvar: 0,
      systemPowerFactor: 1.0,
      dailyKwh: 0,
      peakSurgeKw: 0,
      peakSurgeKva: 0,
      recommendedPvKw: 0,
      recommendedBatteryKwh: 0,
      recommendedUsableBatteryKwh: 0,
      batteryDodPercent: sanitizedDod,
      recommendedInverterKw: 0,
      maxDcCurrentAmps: 0,
      recommendedFuseAmps: 0,
      categoryBreakdown,
      emsSimulation: emptyEms,
      warnings,
    };
  }

  const efficiencyFactor = sanitizedEfficiency / 100;
  const dodFactor = sanitizedDod / 100;
  const marginFactor = 1 + sanitizedMargin / 100;

  // 1. Required Daily AC Energy (kWh)
  const dailyKwh = (totalDailyWattHours / 1000) * marginFactor;

  // 2. Required Inverter Continuous Power Rating (kW / kVA)
  const requiredInverterKw = Math.max(
    totalCoincidentActiveKw * marginFactor,
    (totalPeakSurgeWatts / 1000 / 2) // Assume 2x surge overload rating
  ) / efficiencyFactor;

  // 3. Required Battery Storage Capacity (kWh)
  const requiredBatteryKwh = (dailyKwh * sanitizedAutonomy) / (dodFactor * efficiencyFactor);

  // 4. Required Solar PV Array Capacity (kWp)
  const requiredPvKw = dailyKwh / (sanitizedPsh * REGIONAL_SOLAR_CONSTANTS.SYSTEM_LOSS_FACTOR);

  // 5. DC Bus Current & Recommended Fuse Amperage
  const maxDcCurrentAmps = (requiredInverterKw * 1000) / sanitizedVoltage;
  const recommendedFuseAmps = Math.ceil(maxDcCurrentAmps * 1.25);

  if (maxDcCurrentAmps > 250 && sanitizedVoltage <= 48) {
    warnings.push({
      field: 'systemVoltage',
      message: `DC Bus Current is high (${Math.round(maxDcCurrentAmps)}A at ${sanitizedVoltage}V). Consider upgrading to High-Voltage DC (120V - 400V) to reduce cable thickness.`,
      type: 'warning',
    });
  }

  if (systemPowerFactor < 0.85) {
    warnings.push({
      field: 'systemPowerFactor',
      message: `System Power Factor is low (${systemPowerFactor.toFixed(2)}). Apparent Power demand is ${Math.round(totalApparentKva)} kVA vs ${Math.round(totalCoincidentActiveKw)} kW active. Inverter rating must be increased.`,
      type: 'warning',
    });
  }

  const recPvKw = Math.ceil(requiredPvKw * 10) / 10;
  const recBatKwh = Math.ceil(requiredBatteryKwh * 10) / 10;
  const minSocLimit = 100 - sanitizedDod;

  const simPvKw = input.installedPvKw && input.installedPvKw > 0 ? input.installedPvKw : recPvKw;
  const simBatKwh = input.installedBatteryKwh && input.installedBatteryKwh > 0 ? input.installedBatteryKwh : recBatKwh;

  // Execute 3-Stage EMS Flow Simulation with operational schedule itemized loads
  const emsSimulation = runEmsSimulation(simPvKw, simBatKwh, dailyKwh, sanitizedPsh, minSocLimit, input.loadItems);

  return {
    totalInstalledKw: Math.round((totalInstalledWatts / 1000) * 100) / 100,
    totalConnectedKw: Math.round(totalCoincidentActiveKw * 100) / 100,
    totalApparentKva: Math.round(totalApparentKva * 100) / 100,
    totalReactiveKvar: Math.round(totalReactiveKvar * 100) / 100,
    systemPowerFactor: Math.round(systemPowerFactor * 100) / 100,
    dailyKwh: Math.round(dailyKwh * 10) / 10,
    peakSurgeKw: Math.round((totalPeakSurgeWatts / 1000) * 10) / 10,
    peakSurgeKva: Math.round((totalPeakSurgeVa / 1000) * 10) / 10,
    recommendedPvKw: recPvKw,
    recommendedBatteryKwh: recBatKwh,
    recommendedUsableBatteryKwh: Math.round(recBatKwh * (sanitizedDod / 100) * 10) / 10,
    batteryDodPercent: sanitizedDod,
    recommendedInverterKw: Math.ceil(requiredInverterKw * 10) / 10,
    maxDcCurrentAmps: Math.round(maxDcCurrentAmps),
    recommendedFuseAmps,
    categoryBreakdown,
    emsSimulation,
    warnings,
  };
}

// ============================================================================
// 4. QUOTATION REQUEST INPUT SANITIZATION & VALIDATION ROUTINES
// ============================================================================

export interface QuoteFormData {
  fullName: string;
  email: string;
  phone: string;
  powerRequirementKw: number | string;
  locationRegion: string;
  projectScale: 'residential' | 'commercial' | 'industrial' | 'utility';
  notes?: string;
  estimatedQuantity?: number;
}

export interface QuoteValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: QuoteFormData;
}

/**
 * Sanitizes input text against XSS, HTML script injections, and invalid control characters.
 */
export function sanitizeInputString(rawStr: string, maxLength: number = 200): string {
  if (!rawStr) return '';
  return rawStr
    .trim()
    .replace(/[<>{}\\]/g, '') // strip potentially hazardous tags
    .slice(0, maxLength);
}

/**
 * Validates phone numbers for Myanmar and international formats
 * E.g. +959123456789, 09123456789, 09-123456789, +1 555-0199
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches Myanmar (09... or +959...) or general 7-15 digit phone format
  const phoneRegex = /^(\+?959\d{7,9}|09\d{7,9}|\+?\d{8,15})$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validates email address format
 */
export function isValidEmailAddress(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Comprehensive frontend validation & sanitization for Quotation Requests
 */
export function validateQuoteRequest(rawForm: Partial<QuoteFormData>): QuoteValidationResult {
  const errors: Record<string, string> = {};

  const nameClean = sanitizeInputString(rawForm.fullName || '', 80);
  const emailClean = sanitizeInputString(rawForm.email || '', 100).toLowerCase();
  const phoneClean = sanitizeInputString(rawForm.phone || '', 30);
  const locationClean = sanitizeInputString(rawForm.locationRegion || '', 100);
  const notesClean = sanitizeInputString(rawForm.notes || '', 500);

  let rawPower = Number(rawForm.powerRequirementKw);
  if (isNaN(rawPower) || rawPower < 0) rawPower = 0;

  let qty = Number(rawForm.estimatedQuantity) || 1;
  if (qty < 1) qty = 1;

  // 1. Name validation
  if (!nameClean) {
    errors.fullName = 'Full Name is required.';
  } else if (nameClean.length < 2) {
    errors.fullName = 'Name must be at least 2 characters long.';
  }

  // 2. Email validation
  if (!emailClean) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmailAddress(emailClean)) {
    errors.email = 'Please enter a valid work or personal email address (e.g. user@domain.com).';
  }

  // 3. Phone validation
  if (!phoneClean) {
    errors.phone = 'Contact phone number is required.';
  } else if (!isValidPhoneNumber(phoneClean)) {
    errors.phone = 'Please enter a valid phone number (e.g. 09-123456789 or +959123456789).';
  }

  // 4. Power requirement validation
  if (rawPower <= 0) {
    errors.powerRequirementKw = 'Power requirement must be a positive number in kW (e.g. 5, 12, or 50 kW).';
  } else if (rawPower > 10000) {
    errors.powerRequirementKw = 'Power requirement exceeds max single-station capacity (10,000 kW). Please contact enterprise sales directly.';
  }

  // 5. Location validation
  if (!locationClean) {
    errors.locationRegion = 'Please select or type your target site location or region (e.g. Yangon, Mandalay).';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedData: {
      fullName: nameClean,
      email: emailClean,
      phone: phoneClean,
      powerRequirementKw: rawPower,
      locationRegion: locationClean,
      projectScale: rawForm.projectScale || 'residential',
      notes: notesClean,
      estimatedQuantity: qty,
    },
  };
}

