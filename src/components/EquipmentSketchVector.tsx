import React from 'react';
import { EquipmentType } from '../types';

interface EquipmentSketchVectorProps {
  type: EquipmentType | string;
  className?: string;
  showDetails?: boolean;
}

export const EquipmentSketchVector: React.FC<EquipmentSketchVectorProps> = ({
  type,
  className = 'w-full h-full',
  showDetails = true,
}) => {
  // SVG Vector Sketch Renderers for each Solar & Hybrid Energy system component
  switch (type) {
    case 'pv_array':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid background */}
          <pattern id="pvGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#pvGrid)" />

          {/* Sun & Solar Rays */}
          <circle cx="60" cy="50" r="22" fill="#fbbf24" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="60" cy="50" r="14" fill="#fbbf24" />
          <path d="M60 20 V10 M60 80 V90 M30 50 H20 M90 50 H100 M38 28 L31 21 M82 72 L89 79 M82 28 L89 21 M38 72 L31 79" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* PV Panels Tilted Frame */}
          <g transform="translate(100, 35)">
            {/* Panel 1 */}
            <polygon points="10,130 90,30 160,30 80,130" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
            {/* Panel 1 Grid Lines */}
            <line x1="50" y1="80" x2="125" y2="80" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="30" y1="105" x2="105" y2="105" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="70" y1="55" x2="145" y2="55" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="50" y1="30" x2="10" y2="130" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="85" y1="30" x2="45" y2="130" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="120" y1="30" x2="80" y2="130" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />

            {/* Panel 2 */}
            <polygon points="90,130 170,30 240,30 160,130" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />
            {/* Panel 2 Grid Lines */}
            <line x1="130" y1="80" x2="205" y2="80" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="110" y1="105" x2="185" y2="105" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="150" y1="55" x2="225" y2="55" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="130" y1="30" x2="90" y2="130" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="165" y1="30" x2="125" y2="130" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="200" y1="30" x2="160" y2="130" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />

            {/* Aluminum Mounting Rails */}
            <line x1="0" y1="135" x2="250" y2="135" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="80" y1="25" x2="250" y2="25" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

            {/* DC Output Cable & Terminal Box */}
            <rect x="220" y="115" width="30" height="20" rx="3" fill="#334155" stroke="#0052cc" strokeWidth="1.5" />
            <circle cx="230" cy="125" r="3" fill="#ef4444" />
            <circle cx="240" cy="125" r="3" fill="#181c1f" stroke="#ffffff" strokeWidth="1" />
            <path d="M250 125 H270 V150" stroke="#0052cc" strokeWidth="3" strokeDasharray="4 2" />
          </g>

          {/* Technical Blueprint Labels */}
          {showDetails && (
            <g transform="translate(15, 195)">
              <rect x="0" y="0" width="370" height="32" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="20" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold">SCHEMATIC: SOLAR PV MONOCRYSTALLINE ARRAY</text>
              <text x="350" y="20" fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">DC OUTPUT 600V</text>
            </g>
          )}
        </svg>
      );

    case 'combiner_box':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="combGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#combGrid)" />

          {/* Enclosure Outer Housing */}
          <rect x="70" y="25" width="260" height="170" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
          <rect x="80" y="35" width="240" height="150" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* NEMA Hinges & Locks */}
          <rect x="62" y="45" width="8" height="25" rx="2" fill="#94a3b8" />
          <rect x="62" y="145" width="8" height="25" rx="2" fill="#94a3b8" />
          <circle cx="330" cy="110" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

          {/* Internal DIN Rail */}
          <line x1="95" y1="90" x2="305" y2="90" stroke="#475569" strokeWidth="6" />
          <line x1="95" y1="145" x2="305" y2="145" stroke="#475569" strokeWidth="6" />

          {/* 4x DC Fuse Holders */}
          {[105, 135, 165, 195].map((x, i) => (
            <g key={i}>
              <rect x={x} y="65" width="22" height="50" rx="2" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x={x + 5} y="75" width="12" height="30" rx="1" fill="#0284c7" />
              <circle cx={x + 11} cy="90" r="3" fill="#fbbf24" />
              <text x={x + 11} y="60" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">S{i + 1}</text>
            </g>
          ))}

          {/* Surge Protector (SPD) */}
          <rect x="235" y="65" width="30" height="50" rx="2" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="242" y="72" width="16" height="12" rx="1" fill="#22c55e" />
          <text x="250" y="102" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SPD</text>

          {/* Rotary DC Isolator Switch */}
          <circle cx="290" cy="90" r="18" fill="#dc2626" stroke="#f87171" strokeWidth="2" />
          <rect x="287" y="75" width="6" height="30" rx="2" fill="#ffffff" transform="rotate(45 290 90)" />

          {/* Busbars & Cable Glands */}
          <path d="M100 170 V185 M130 170 V185 M160 170 V185 M190 170 V185" stroke="#ef4444" strokeWidth="3" />
          <path d="M290 170 V185" stroke="#0052cc" strokeWidth="4" />

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold">NEMA 4X OUTDOOR DC COMBINER BOX</text>
              <text x="350" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">1000V DC SPD SURGE</text>
            </g>
          )}
        </svg>
      );

    case 'inverter':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="invGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#invGrid)" />

          {/* Inverter Main Chassis */}
          <rect x="100" y="20" width="200" height="175" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Top Cooling Heat Sink Fins */}
          <path d="M115 20 V10 M130 20 V10 M145 20 V10 M160 20 V10 M175 20 V10 M190 20 V10 M205 20 V10 M220 20 V10 M235 20 V10 M250 20 V10 M265 20 V10 M280 20 V10" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

          {/* Digital LCD Display Screen */}
          <rect x="125" y="40" width="150" height="65" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />

          {/* LCD Content: Solar DC -> AC Waveform Diagram */}
          <text x="135" y="58" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">HYBRID INVERTER 15kW</text>
          <path d="M135 80 H160 L170 70 L180 90 L190 80 H215" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <path d="M225 80 Q235 65 245 80 T265 80" stroke="#22c55e" strokeWidth="2" fill="none" />
          <text x="135" y="98" fill="#a7f3d0" fontSize="9" fontFamily="monospace">PV: 8.4kW | BATT: 98%</text>

          {/* Status LEDs */}
          <circle cx="135" cy="125" r="5" fill="#22c55e" />
          <text x="145" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">POWER</text>

          <circle cx="195" cy="125" r="5" fill="#3b82f6" />
          <text x="205" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">COMMS</text>

          <circle cx="255" cy="125" r="5" fill="#eab308" />
          <text x="265" y="128" fill="#94a3b8" fontSize="8" fontFamily="monospace">GRID</text>

          {/* Bottom Connection Ports */}
          <rect x="120" y="170" width="25" height="25" rx="3" fill="#334155" stroke="#ef4444" strokeWidth="1.5" />
          <text x="132" y="186" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">DC</text>

          <rect x="160" y="170" width="25" height="25" rx="3" fill="#334155" stroke="#0052cc" strokeWidth="1.5" />
          <text x="172" y="186" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">BESS</text>

          <rect x="200" y="170" width="25" height="25" rx="3" fill="#334155" stroke="#22c55e" strokeWidth="1.5" />
          <text x="212" y="186" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">AC</text>

          <rect x="240" y="170" width="25" height="25" rx="3" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="252" y="186" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">GEN</text>

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold">SOLAR HYBRID INVERTER (DC + AC + BESS)</text>
              <text x="350" y="17" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">SPLIT-PHASE 240V</text>
            </g>
          )}
        </svg>
      );

    case 'battery':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="battGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#battGrid)" />

          {/* Battery Enclosure Rack */}
          <rect x="110" y="20" width="180" height="175" rx="12" fill="#1e293b" stroke="#22c55e" strokeWidth="2.5" />

          {/* Top Battery Terminals */}
          <rect x="140" y="8" width="30" height="12" rx="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
          <text x="155" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">+</text>

          <rect x="230" y="8" width="30" height="12" rx="3" fill="#181c1f" stroke="#ffffff" strokeWidth="1" />
          <text x="245" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">-</text>

          {/* State of Charge Vertical LED Bar Gauge */}
          <rect x="135" y="40" width="130" height="24" rx="4" fill="#0f172a" stroke="#15803d" strokeWidth="1.5" />
          <rect x="140" y="44" width="22" height="16" rx="2" fill="#22c55e" />
          <rect x="166" y="44" width="22" height="16" rx="2" fill="#22c55e" />
          <rect x="192" y="44" width="22" height="16" rx="2" fill="#22c55e" />
          <rect x="218" y="44" width="22" height="16" rx="2" fill="#22c55e" />
          <rect x="244" y="44" width="16" height="16" rx="2" fill="#166534" />

          {/* BESS LFP Battery Matrix Cells */}
          <g transform="translate(130, 78)">
            {[0, 1, 2].map((row) => (
              <g key={row} transform={`translate(0, ${row * 28})`}>
                <rect x="0" y="0" width="140" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <circle cx="15" cy="11" r="5" fill="#3b82f6" />
                <text x="30" y="15" fill="#e2e8f0" fontSize="9" fontFamily="monospace">LFP CELL MODULE 0{row + 1}</text>
                <text x="125" y="15" fill="#22c55e" fontSize="9" fontFamily="monospace" textAnchor="end">OK</text>
              </g>
            ))}
          </g>

          {/* Thermal Vent Grill */}
          <line x1="130" y1="172" x2="270" y2="172" stroke="#475569" strokeWidth="3" strokeDasharray="6 4" />
          <line x1="130" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="3" strokeDasharray="6 4" />

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold">BESS LFP BATTERY STORAGE (28 kWh / 48V)</text>
              <text x="350" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">BMS ACTIVE</text>
            </g>
          )}
        </svg>
      );

    case 'grid':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="gridGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#gridGrid)" />

          {/* Utility Power Pole */}
          <line x1="90" y1="10" x2="90" y2="195" stroke="#64748b" strokeWidth="8" />
          <line x1="50" y1="35" x2="130" y2="35" stroke="#64748b" strokeWidth="6" />
          <line x1="60" y1="60" x2="120" y2="60" stroke="#64748b" strokeWidth="5" />

          {/* High Voltage Ceramic Insulators */}
          <circle cx="55" cy="30" r="6" fill="#94a3b8" />
          <circle cx="90" cy="30" r="6" fill="#94a3b8" />
          <circle cx="125" cy="30" r="6" fill="#94a3b8" />

          {/* Overhead Lines */}
          <path d="M10 28 Q55 35 90 28 T170 28" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M10 53 Q60 60 90 53 T170 53" stroke="#cbd5e1" strokeWidth="2" fill="none" />

          {/* Pole-mounted Transformer */}
          <rect x="100" y="70" width="35" height="50" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="117" y="100" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">240V</text>

          {/* Smart Bi-Directional Net Meter Box */}
          <rect x="190" y="45" width="140" height="135" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="260" cy="95" r="35" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />

          {/* Digital Meter Screen */}
          <rect x="238" y="75" width="44" height="20" rx="2" fill="#0284c7" />
          <text x="260" y="89" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">04218</text>

          {/* Bi-Directional Flow Arrows */}
          <path d="M240 112 H280 M275 108 L280 112 L275 116 M245 118 L240 122 L245 126 M240 122 H280" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

          {/* Lockable AC Disconnect Switch */}
          <rect x="220" y="142" width="80" height="28" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <text x="260" y="160" fill="#e2e8f0" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">AC DISCONNECT</text>

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="bold">UTILITY GRID PCC (BI-DIRECTIONAL METER)</text>
              <text x="350" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">200A SERVICE</text>
            </g>
          )}
        </svg>
      );

    case 'generator':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="genGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#combGrid)" />

          {/* Generator Canopy Enclosure */}
          <rect x="80" y="30" width="240" height="150" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />

          {/* Acoustic Exhaust Stack */}
          <rect x="270" y="10" width="16" height="20" rx="2" fill="#475569" />
          <path d="M278 10 C278 2, 285 2, 285 0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 2" />

          {/* Front Ventilation Louvers */}
          <g transform="translate(100, 50)">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="0" y1={i * 12} x2="45" y2={i * 12} stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            ))}
          </g>

          {/* Engine & Alternator Symbol */}
          <circle cx="210" cy="85" r="30" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
          <text x="210" y="91" fill="#fbbf24" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">GEN</text>

          {/* ATS Auto-Start Controller Panel */}
          <rect x="180" y="130" width="110" height="36" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="195" cy="148" r="4" fill="#22c55e" />
          <text x="205" y="151" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">ATS AUTO READY</text>

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="bold">AUTOMATIC BACKUP DIESEL GENERATOR</text>
              <text x="350" y="17" fill="#fbbf24" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">20kW STANDBY</text>
            </g>
          )}
        </svg>
      );

    case 'ac_panel':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="panelGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#panelGrid)" />

          {/* Main Distribution Panel Frame */}
          <rect x="110" y="15" width="180" height="185" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="120" y="25" width="160" height="165" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* Top 200A Main Breaker */}
          <rect x="150" y="35" width="100" height="30" rx="3" fill="#334155" stroke="#ef4444" strokeWidth="2" />
          <rect x="190" y="40" width="20" height="20" rx="2" fill="#dc2626" />
          <text x="200" y="54" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">200A</text>

          {/* Vertical Busbars */}
          <line x1="170" y1="75" x2="170" y2="175" stroke="#e2e8f0" strokeWidth="4" />
          <line x1="230" y1="75" x2="230" y2="175" stroke="#e2e8f0" strokeWidth="4" />

          {/* Branch Circuit Breakers Array */}
          {[80, 100, 120, 140, 160].map((y, i) => (
            <g key={i}>
              <rect x="130" y={y} width="35" height="14" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
              <rect x="155" y={y + 2} width="8" height="10" rx="1" fill="#22c55e" />

              <rect x="235" y={y} width="35" height="14" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
              <rect x="237" y={y + 2} width="8" height="10" rx="1" fill="#22c55e" />
            </g>
          ))}

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#e2e8f0" fontFamily="monospace" fontSize="11" fontWeight="bold">MAIN AC DISTRIBUTION PANEL (MDP 200A)</text>
              <text x="350" y="17" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">120/240V</text>
            </g>
          )}
        </svg>
      );

    case 'inverter_load_panel':
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="critGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#critGrid)" />

          {/* Panel Enclosure */}
          <rect x="110" y="15" width="180" height="185" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="2.5" />
          <rect x="120" y="25" width="160" height="165" rx="3" fill="#0f172a" stroke="#15803d" strokeWidth="1.5" />

          {/* Header Badge */}
          <rect x="135" y="32" width="130" height="22" rx="3" fill="#166534" />
          <text x="200" y="46" fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CRITICAL ESSENTIAL LOADS</text>

          {/* Circuit Breakers with Labels */}
          {[65, 90, 115, 140].map((y, i) => {
            const labels = ['REFRIGERATION', 'ESSENTIAL LIGHTS', 'WIFI / IT SERVER', 'WATER PUMP'];
            return (
              <g key={i}>
                <rect x="130" y={y} width="140" height="18" rx="3" fill="#334155" stroke="#22c55e" strokeWidth="1" />
                <rect x="134" y={y + 3} width="12" height="12" rx="1" fill="#22c55e" />
                <text x="152" y={y + 12} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">{labels[i]}</text>
                <text x="262" y={y + 12} fill="#a7f3d0" fontSize="8" fontFamily="monospace" textAnchor="end">ON</text>
              </g>
            );
          })}

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold">INVERTER CRITICAL LOAD BACKUP PANEL</text>
              <text x="350" y="17" fill="#22c55e" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">UPS POWERED</text>
            </g>
          )}
        </svg>
      );

    case 'non_inverter_load_panel':
    default:
      return (
        <svg viewBox="0 0 400 240" className={`${className} bg-[#0f172a]`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="heavyGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <rect width="400" height="240" fill="url(#heavyGrid)" />

          {/* Panel Enclosure */}
          <rect x="110" y="15" width="180" height="185" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
          <rect x="120" y="25" width="160" height="165" rx="3" fill="#0f172a" stroke="#b45309" strokeWidth="1.5" />

          {/* Header Badge */}
          <rect x="135" y="32" width="130" height="22" rx="3" fill="#78350f" />
          <text x="200" y="46" fill="#fef3c7" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">HEAVY NON-ESSENTIAL LOADS</text>

          {/* Circuit Breakers with Labels */}
          {[65, 90, 115, 140].map((y, i) => {
            const labels = ['HVAC CENTRAL AIR', 'EV FAST CHARGER', 'WATER HEATER', 'POOL PUMP'];
            return (
              <g key={i}>
                <rect x="130" y={y} width="140" height="18" rx="3" fill="#334155" stroke="#f59e0b" strokeWidth="1" />
                <rect x="134" y={y + 3} width="12" height="12" rx="1" fill="#f59e0b" />
                <text x="152" y={y + 12} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">{labels[i]}</text>
                <text x="262" y={y + 12} fill="#fde68a" fontSize="8" fontFamily="monospace" textAnchor="end">GRID ONLY</text>
              </g>
            );
          })}

          {showDetails && (
            <g transform="translate(15, 202)">
              <rect x="0" y="0" width="370" height="26" rx="4" fill="#1e293b" fillOpacity="0.8" stroke="#334155" />
              <text x="12" y="17" fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="bold">NON-INVERTER HEAVY LOAD PANEL</text>
              <text x="350" y="17" fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="end">SHED ON OUTAGE</text>
            </g>
          )}
        </svg>
      );
  }
};
