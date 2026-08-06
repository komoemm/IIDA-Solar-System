/**
 * Modular Solar Data & Calculation Configuration for IIDA Electronics Myanmar
 * Includes:
 * - Product catalog presets & technical specifications
 * - Solar load calculation formulas with edge-case validation & fallback guards
 * - Quotation request input sanitization & validation routines
 */

import { EquipmentLibraryItem, EquipmentType } from '../types';

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
    id: 'inv-12kw-3p',
    type: 'inverter',
    defaultName: 'IIDA 12kW High-Voltage Hybrid Inverter',
    category: 'Conversion',
    defaultCapacity: '12.0 kW AC / 18.0 kW DC',
    defaultVoltage: '400V 3-Phase / 800V DC MPPT',
    defaultManufacturer: 'IIDA Electronics',
    defaultModel: 'IIDA-HYB-12K-3P',
    imageUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop',
    specSheetUrl: 'https://example.com/specs/iida-hyb-12k.pdf',
    description: 'Commercial 3-phase hybrid inverter with dual MPPTs, 10ms UPS transfer time, and remote CAN/RS485 monitoring.',
    iconName: 'Zap',
    sku: 'IIDA-INV-12KW-3P',
    priceMmk: 4500000,
    warrantyYears: 5,
    isFeatured: true,
    specifications: {
      'Nominal AC Output': '12,000 W',
      'Max PV Input': '18,000 W',
      'MPPT Voltage Range': '160 - 800 VDC',
      'Efficiency': '97.6%',
      'Transfer Time': '< 10 ms',
    },
  },
  {
    id: 'bat-51v-15kwh',
    type: 'battery',
    defaultName: 'IIDA 15.3kWh LFP Energy Storage Rack',
    category: 'Storage',
    defaultCapacity: '15.36 kWh (51.2V 300Ah)',
    defaultVoltage: '51.2 VDC Nominal',
    defaultManufacturer: 'IIDA Battery Systems',
    defaultModel: 'IIDA-LFP-51V300A',
    imageUrl: 'https://images.unsplash.com/photo-1558441719-670b357029b7?q=80&w=800&auto=format&fit=crop',
    specSheetUrl: 'https://example.com/specs/iida-lfp-15kwh.pdf',
    description: 'High-density Tier-1 LiFePO4 battery cabinet with active BMS balancing, 6000+ cycle life, and thermal safety cutouts.',
    iconName: 'Battery',
    sku: 'IIDA-BAT-51V-15KWH',
    priceMmk: 6800000,
    warrantyYears: 10,
    isFeatured: true,
    specifications: {
      'Capacity': '15.36 kWh (300 Ah)',
      'Chemistry': 'Lithium Iron Phosphate (LiFePO4)',
      'Cycle Life': '> 6,000 cycles @ 80% DOD',
      'Continuous Discharging': '150 A',
      'Communication': 'CAN / RS485 / Wi-Fi',
    },
  },
  {
    id: 'pv-580w-mono',
    type: 'pv_array',
    defaultName: 'IIDA 580W N-Type Bifacial Solar Panel',
    category: 'Generation',
    defaultCapacity: '580W per module (22.8% Eff)',
    defaultVoltage: '42.2 VDC Vmp / 50.8 VDC Voc',
    defaultManufacturer: 'IIDA Solar Tech',
    defaultModel: 'IIDA-PV-580W-N',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop',
    specSheetUrl: 'https://example.com/specs/iida-pv-580w.pdf',
    description: 'Topcon N-type dual-glass bifacial solar panel with 30-year performance linear output guarantee for Myanmar tropical climates.',
    iconName: 'Sun',
    sku: 'IIDA-PV-580W-N',
    priceMmk: 295000,
    warrantyYears: 12,
    isFeatured: true,
    specifications: {
      'Maximum Power (Pmax)': '580 W',
      'Module Efficiency': '22.8%',
      'Power Tolerance': '0~+5 W',
      'Bifaciality Ratio': '80 ± 5%',
      'Temperature Coeff': '-0.30% / °C',
    },
  },
  {
    id: 'comb-4str-1000v',
    type: 'combiner_box',
    defaultName: 'IIDA 4-String Smart DC Combiner Box',
    category: 'Generation',
    defaultCapacity: '100A DC Continuous',
    defaultVoltage: '1000 VDC Max',
    defaultManufacturer: 'IIDA Power Enclosures',
    defaultModel: 'IIDA-DC-COMB-4P',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
    specSheetUrl: 'https://example.com/specs/iida-dc-combiner.pdf',
    description: 'IP65 waterproof DC junction box with 1000V fuses, isolation switch, and Type 2 DC surge protection device.',
    iconName: 'Box',
    sku: 'IIDA-DC-COMB-4P',
    priceMmk: 480000,
    warrantyYears: 3,
    specifications: {
      'Max Strings': '4 Input / 1 Output',
      'Enclosure Rating': 'IP65 NEMA 4X',
      'Surge Protection': '1000V DC Type 2 SPD',
      'Isolator Switch': '125A DC Break Switch',
    },
  },
];

// ============================================================================
// 3. CALCULATION FORMULAS & EDGE-CASE FALLBACK GUARDS
// ============================================================================

export interface LoadItem {
  id: string;
  name: string;
  category: 'Essential' | 'Heavy' | 'General';
  quantity: number;
  watts: number;
  hoursPerDay: number;
  surgeFactor: number;
}

export interface SolarSizingInput {
  loadItems: LoadItem[];
  peakSunHours: number;
  inverterEfficiency: number;
  batteryDod: number;
  autonomyDays: number;
  systemVoltage: number;
  safetyMargin: number;
}

export interface CalculationWarning {
  field: string;
  message: string;
  type: 'warning' | 'info' | 'error';
}

export interface SolarSizingResult {
  totalConnectedKw: number;
  dailyKwh: number;
  peakSurgeKw: number;
  recommendedPvKw: number;
  recommendedBatteryKwh: number;
  recommendedInverterKw: number;
  maxDcCurrentAmps: number;
  recommendedFuseAmps: number;
  warnings: CalculationWarning[];
}

/**
 * Calculates solar PV array, battery storage, inverter sizing, and fuse amperage
 * with edge-case validation, sanitization of negative/zero values, and fallback recommendations.
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

  // Process load items with safety guards
  let totalConnectedWatts = 0;
  let totalDailyWattHours = 0;
  let totalPeakSurgeWatts = 0;
  let activeLoadCount = 0;

  input.loadItems.forEach((item, index) => {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    const watts = Math.max(0, Number(item.watts) || 0);
    const hours = Math.max(0, Math.min(24, Number(item.hoursPerDay) || 0));
    const surge = Math.max(1.0, Math.min(10.0, Number(item.surgeFactor) || 1.0));

    if (qty <= 0 || watts <= 0) return;

    activeLoadCount++;
    const itemWatts = qty * watts;
    const itemDailyWh = itemWatts * hours;
    const itemSurge = itemWatts * surge;

    totalConnectedWatts += itemWatts;
    totalDailyWattHours += itemDailyWh;
    totalPeakSurgeWatts += itemSurge;

    if (watts > 10000) {
      warnings.push({
        field: `load_${index}`,
        message: `High individual load detected: "${item.name}" (${(watts / 1000).toFixed(1)} kW). Ensure dedicated breaker & soft starter.`,
        type: 'info',
      });
    }
  });

  if (activeLoadCount === 0 || totalConnectedWatts === 0) {
    warnings.push({
      field: 'loadItems',
      message: 'No active electrical loads selected. Please add or enable at least one appliance to compute system requirements.',
      type: 'error',
    });
    return {
      totalConnectedKw: 0,
      dailyKwh: 0,
      peakSurgeKw: 0,
      recommendedPvKw: 0,
      recommendedBatteryKwh: 0,
      recommendedInverterKw: 0,
      maxDcCurrentAmps: 0,
      recommendedFuseAmps: 0,
      warnings,
    };
  }

  const efficiencyFactor = sanitizedEfficiency / 100;
  const dodFactor = sanitizedDod / 100;
  const marginFactor = 1 + sanitizedMargin / 100;

  // 1. Required Daily AC Energy (kWh)
  const dailyKwh = (totalDailyWattHours / 1000) * marginFactor;

  // 2. Required Inverter Continuous Power Rating (kW)
  const requiredInverterKw = Math.max(
    (totalConnectedWatts / 1000) * marginFactor,
    (totalPeakSurgeWatts / 1000 / 2) // Assume 2x surge overload rating for hybrid inverters
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

  return {
    totalConnectedKw: totalConnectedWatts / 1000,
    dailyKwh,
    peakSurgeKw: totalPeakSurgeWatts / 1000,
    recommendedPvKw: Math.ceil(requiredPvKw * 10) / 10,
    recommendedBatteryKwh: Math.ceil(requiredBatteryKwh * 10) / 10,
    recommendedInverterKw: Math.ceil(requiredInverterKw * 10) / 10,
    maxDcCurrentAmps: Math.round(maxDcCurrentAmps),
    recommendedFuseAmps,
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
