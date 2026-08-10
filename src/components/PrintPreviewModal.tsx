import React, { useMemo } from 'react';
import { Printer, FileCode, X, Sun, Battery, ShieldCheck } from 'lucide-react';
import { EquipmentNode, Connection, ProjectMetadata } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: EquipmentNode[];
  connections: Connection[];
  metadata: ProjectMetadata;
  designNotes: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  nodes,
  connections,
  metadata,
  designNotes,
}) => {
  if (!isOpen) return null;

  // Calculate total capacities
  let totalPvKw = 0;
  let totalBessKwh = 0;

  nodes.forEach((n) => {
    if (n.type === 'pv_array') {
      const match = n.capacity.match(/([\d.]+)\s*kW/i);
      if (match) totalPvKw += parseFloat(match[1]);
    } else if (n.type === 'battery') {
      const match = n.capacity.match(/([\d.]+)\s*kWh/i);
      if (match) totalBessKwh += parseFloat(match[1]);
    }
  });

  const companyName = 'IIDA ELECTRONICS(MYANMAR) CO.,LTD.';
  const projectTitle = metadata.title || 'Solar & Hybrid Energy';
  const currentDate = metadata.date || new Date().toISOString().split('T')[0];

  // Helper XML escape
  const escapeXml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Calculate bounding box for SVG vector rendering
  let minX = 0;
  let minY = 0;
  let maxX = 1200;
  let maxY = 700;

  nodes.forEach((n) => {
    if (n.x + 240 > maxX) maxX = n.x + 280;
    if (n.y + 180 > maxY) maxY = n.y + 220;
  });

  const width = Math.max(maxX, 1200);
  const height = Math.max(maxY, 700);

  // Build connection lines SVG
  const connColors: Record<string, string> = {
    dc: '#0052cc',
    ac: '#1e293b',
    comms: '#ea580c',
    ground: '#16a34a',
  };

  const connectionSvgLines = connections
    .map((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
      const toNode = nodes.find((n) => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return '';

      const x1 = fromNode.x + 190;
      const y1 = fromNode.y + 65;
      const x2 = toNode.x + 10;
      const y2 = toNode.y + 65;

      const midX = (x1 + x2) / 2;
      const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      const color = connColors[conn.type] || '#1e293b';
      const isDashed = conn.type === 'comms' || conn.type === 'ground';

      return `
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" ${isDashed ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#arrow-${conn.type})" />
        <text x="${midX}" y="${(y1 + y2) / 2 - 8}" fill="#475569" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">${escapeXml(conn.label || '')}</text>
      `;
    })
    .join('\n');

  // Build node boxes SVG
  const nodeSvgBlocks = nodes
    .map((node) => {
      const typeBgColors: Record<string, string> = {
        pv_array: '#e0edff',
        combiner_box: '#f1f5f9',
        inverter: '#dbeafe',
        battery: '#fef3c7',
        grid: '#f1f5f9',
        generator: '#fef2f2',
        ac_panel: '#f1f5f9',
        inverter_load_panel: '#e0e7ff',
        non_inverter_load_panel: '#f8fafc',
      };

      const headerBg = typeBgColors[node.type] || '#f1f5f9';

      return `
        <g transform="translate(${node.x}, ${node.y})">
          <rect width="200" height="130" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
          <path d="M 0 6 A 6 6 0 0 1 6 0 L 194 0 A 6 6 0 0 1 200 6 L 200 32 L 0 32 Z" fill="${headerBg}" />
          <line x1="0" y1="32" x2="200" y2="32" stroke="#cbd5e1" stroke-width="1" />
          <text x="10" y="21" font-family="sans-serif" font-weight="bold" font-size="12" fill="#003d9b">${escapeXml(node.id)}</text>
          <text x="190" y="21" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">${escapeXml(node.type.toUpperCase())}</text>
          
          <text x="10" y="52" font-family="sans-serif" font-weight="bold" font-size="12" fill="#0f172a">${escapeXml(node.name.slice(0, 24))}</text>
          <text x="10" y="70" font-family="monospace" font-weight="bold" font-size="11" fill="#0052cc">Cap: ${escapeXml(node.capacity)}</text>
          <text x="10" y="86" font-family="monospace" font-size="10" fill="#475569">Volt: ${escapeXml(node.voltage)}</text>
          <text x="10" y="102" font-family="sans-serif" font-size="10" fill="#64748b">Loc: ${escapeXml(node.location.slice(0, 24))}</text>
          <text x="10" y="118" font-family="sans-serif" font-weight="bold" font-size="9" fill="#059669">Status: ${escapeXml(node.status.toUpperCase())}</text>

          <circle cx="0" cy="65" r="5" fill="#0052cc" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="200" cy="65" r="5" fill="#0052cc" stroke="#ffffff" stroke-width="1.5" />
        </g>
      `;
    })
    .join('\n');

  // Complete Diagram SVG String
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    </pattern>
    <marker id="arrow-dc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0052cc" />
    </marker>
    <marker id="arrow-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b" />
    </marker>
    <marker id="arrow-comms" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect width="100%" height="100%" fill="url(#grid-pattern)" />

  <g id="connections-layer">
    ${connectionSvgLines}
  </g>

  <g id="nodes-layer">
    ${nodeSvgBlocks}
  </g>

  <g transform="translate(${width - 270}, 20)">
    <rect width="250" height="90" fill="#ffffff" opacity="0.95" stroke="#cbd5e1" rx="4" />
    <text x="10" y="20" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">ELECTRICAL WIRING LEGEND</text>
    
    <line x1="10" y1="32" x2="40" y2="32" stroke="#0052cc" stroke-width="3" />
    <text x="50" y="35" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">DC Power (PV / BESS)</text>
    
    <line x1="10" y1="50" x2="40" y2="50" stroke="#1e293b" stroke-width="3" />
    <text x="50" y="53" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">AC Power (Grid / MDB)</text>

    <line x1="10" y1="68" x2="40" y2="68" stroke="#ea580c" stroke-width="2" stroke-dasharray="4 3" />
    <text x="50" y="71" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">Comms / BMS Control</text>
  </g>
</svg>`;

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Download Standalone HTML File
  const handleDownloadHtml = () => {
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(metadata.drawingNumber)} - ${escapeXml(projectTitle)}</title>
  <style>
    @page {
      size: A3 landscape;
      margin: 8mm;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background-color: #334155;
      color: #0f172a;
    }
    .sheet-wrapper {
      max-width: 1250px;
      margin: 0 auto;
      background: #ffffff;
      border: 4px solid #0f172a;
      padding: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      position: relative;
      box-sizing: border-box;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .company-name {
      font-size: 11px;
      font-weight: 800;
      color: #003d9b;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .project-heading {
      font-size: 20px;
      font-weight: 800;
      margin: 2px 0 0 0;
      color: #0f172a;
    }
    .badge-container {
      display: flex;
      gap: 8px;
    }
    .spec-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      font-family: monospace;
    }
    .pv-pill { background: #dae2ff; color: #003d9b; border: 1px solid #a6c8ff; }
    .bess-pill { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }

    .canvas-container {
      width: 100%;
      height: 520px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    
    .notes-section {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 10px 14px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .notes-title {
      font-size: 10px;
      font-weight: 800;
      color: #003d9b;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }
    .notes-content {
      font-size: 11px;
      font-family: monospace;
      color: #334155;
      white-space: pre-wrap;
      margin: 0;
      line-height: 1.5;
    }

    .title-block {
      border: 2px solid #0f172a;
      display: grid;
      grid-template-columns: 3fr 5fr 2fr 2fr;
      font-family: monospace;
      background: #ffffff;
    }
    .tb-box {
      border-right: 2px solid #0f172a;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .tb-box:last-child {
      border-right: none;
    }
    .tb-lbl {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .tb-val-main {
      font-size: 13px;
      font-weight: bold;
      color: #003d9b;
    }
    .tb-val-text {
      font-size: 12px;
      font-weight: bold;
      color: #0f172a;
    }

    .action-bar {
      max-width: 1250px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      padding: 12px 20px;
      border-radius: 8px;
      color: #ffffff;
    }
    .print-btn {
      background: #003d9b;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    .print-btn:hover { background: #0052cc; }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .action-bar {
        display: none !important;
      }
      .sheet-wrapper {
        border-width: 2px;
        box-shadow: none;
        max-width: 100%;
        width: 100%;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div>
      <strong style="font-size: 14px;">M&amp;E Solar Single Line Diagram Drawing Sheet</strong>
      <div style="font-size: 11px; color: #94a3b8;">${escapeXml(companyName)}</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div class="sheet-wrapper">
    <div class="sheet-header">
      <div>
        <div class="company-name">${escapeXml(companyName)}</div>
        <h1 class="project-heading">${escapeXml(projectTitle)}</h1>
      </div>
      <div class="badge-container">
        <span class="spec-pill pv-pill">☀ PV: ${totalPvKw.toFixed(1)} kWp</span>
        <span class="spec-pill bess-pill">⚡ BESS: ${totalBessKwh.toFixed(1)} kWh</span>
      </div>
    </div>

    <div class="canvas-container">
      ${svgContent}
    </div>

    <div class="notes-section">
      <span class="notes-title">GENERAL ENGINEERING NOTES &amp; CODE COMPLIANCE</span>
      <pre class="notes-content">${escapeXml(designNotes || 'Standard M&E Installation and Electrical Safety Guidelines apply.')}</pre>
    </div>

    <div class="title-block">
      <div class="tb-box">
        <div>
          <span class="tb-lbl">ENGINEERING FIRM</span>
          <span class="tb-val-main">${escapeXml(companyName)}</span>
        </div>
        <div style="font-size: 10px; color: #003d9b; margin-top: 6px;">https://www.iida-imm.com/</div>
      </div>
      <div class="tb-box">
        <div>
          <span class="tb-lbl">PROJECT TITLE &amp; CLIENT</span>
          <span class="tb-val-text">${escapeXml(projectTitle)}</span>
          <div style="font-size: 11px; color: #475569;">${escapeXml(metadata.clientName)} - ${escapeXml(metadata.siteAddress)}</div>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px; display: flex; justify-content: space-between;">
          <span>DESIGNER: ${escapeXml(metadata.designer)}</span>
          <span>DATE: ${escapeXml(currentDate)}</span>
        </div>
      </div>
      <div class="tb-box" style="align-items: center; text-align: center; justify-content: center; background-color: rgba(218, 226, 255, 0.2);">
        <span class="tb-lbl">ENGINEERING STAMP</span>
        <span style="font-size: 10px; color: #003d9b; font-weight: bold;">IIDA ELECTRONICS</span>
      </div>
      <div class="tb-box" style="background: #f8fafc;">
        <div>
          <span class="tb-lbl">DRAWING NO.</span>
          <span style="font-size: 16px; font-weight: bold; color: #003d9b;">${escapeXml(metadata.drawingNumber)}</span>
        </div>
        <div style="font-size: 11px; color: #334155;">REV: ${escapeXml(metadata.revision)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.drawingNumber || 'solar-hybrid'}-drawing-sheet.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="print-preview-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 font-sans print:p-0 print:bg-white print:static print:block"
      role="dialog"
      aria-modal="true"
      aria-label="HTML Print Preview Sheet Modal"
    >
      {/* Global CSS block for clean printing */}
      <style>{`
        @media print {
          /* Hide all elements outside the print sheet */
          body > *:not(#print-preview-modal-overlay) {
            display: none !important;
          }
          #print-preview-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print-modal-header-bar {
            display: none !important;
          }
          .print-sheet-paper {
            box-shadow: none !important;
            border-width: 2px !important;
            border-color: #0f172a !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Top Modal Navigation & Action Header */}
      <div className="print-modal-header-bar w-full max-w-6xl mb-4 flex items-center justify-between bg-[#181c1f] text-white px-4 py-3 rounded-xl shadow-xl border border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#003d9b] flex items-center justify-center text-white font-bold">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">
              ANSI D-Size Engineering Print Preview Sheet
            </h2>
            <p className="text-xs text-[#94a3b8]">
              Formatted for High-Resolution PDF Export &amp; Physical Drawing Printing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action 1: Print / Save as PDF */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#0052cc] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Save as PDF or Print directly via browser"
          >
            <Printer className="w-4 h-4" />
            <span>Save as PDF / Print</span>
          </button>

          {/* Action 2: Download Standalone HTML File */}
          <button
            onClick={handleDownloadHtml}
            className="px-3.5 py-1.5 text-xs font-bold text-[#1e293b] bg-white hover:bg-[#f1f5f9] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Download Standalone HTML Drawing File for offline editing or PDF saving"
          >
            <FileCode className="w-4 h-4 text-[#003d9b]" />
            <span>Download HTML File</span>
          </button>

          {/* Action 3: Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors ml-2"
            title="Close Print Preview Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CAD Drawing Sheet Paper Container */}
      <div
        id="print-sheet-paper"
        className="print-sheet-paper w-full max-w-6xl bg-white border-4 border-[#0f172a] shadow-2xl p-6 relative flex flex-col min-h-[750px] font-sans text-[#0f172a] rounded-sm"
        style={{
          backgroundImage:
            'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Drawing Outer Frame Grid Coordinate Indicators */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-[#0f172a] pointer-events-none flex flex-col justify-between p-1">
          <div className="flex justify-between text-[9px] font-mono font-bold text-[#64748b]">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono font-bold text-[#64748b]">
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span>D</span>
          </div>
        </div>

        {/* Inner Sheet Content */}
        <div className="flex-1 p-4 space-y-4 flex flex-col">
          {/* Header Banner inside Title Block Frame */}
          <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#003d9b] block">
                {companyName}
              </span>
              <h1 className="text-xl font-extrabold text-[#0f172a] leading-tight">
                {projectTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 bg-[#dae2ff] px-3 py-1.5 rounded border border-[#a6c8ff] font-bold text-[#003d9b]">
                <Sun className="w-4 h-4 text-[#003d9b]" />
                <span>PV: {totalPvKw.toFixed(1)} kWp</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#fef3c7] px-3 py-1.5 rounded border border-[#fde68a] font-bold text-[#d97706]">
                <Battery className="w-4 h-4 text-[#d97706]" />
                <span>BESS: {totalBessKwh.toFixed(1)} kWh</span>
              </span>
            </div>
          </div>

          {/* SVG Diagram Drawing Viewport */}
          <div className="border border-[#cbd5e1] bg-[#f8fafc] rounded p-2 relative flex-1 min-h-[420px] overflow-hidden flex items-center justify-center">
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>

          {/* General Engineering Notes Section */}
          <div className="border border-[#cbd5e1] bg-white p-3 rounded">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#003d9b] block mb-1">
              GENERAL ENGINEERING NOTES &amp; CODE COMPLIANCE
            </span>
            <p className="text-[11px] font-mono text-[#334155] whitespace-pre-wrap leading-relaxed">
              {designNotes ||
                '1. Installation shall comply with IEC 60364 & National Electrical Code.\n2. All DC wiring shall be UV-resistant and double-insulated.\n3. Proper earthing and surge protection devices (SPD) must be installed.'}
            </p>
          </div>
        </div>

        {/* ANSI D-Size Title Block Frame */}
        <div className="border-2 border-[#0f172a] bg-white grid grid-cols-12 text-xs font-mono font-bold mt-2">
          {/* Column 1: Company Logo & Info */}
          <div className="col-span-3 border-r-2 border-[#0f172a] p-3 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">
                ENGINEERING FIRM / COMPANY
              </span>
              <span className="text-xs font-extrabold text-[#003d9b] block leading-tight">
                {companyName}
              </span>
            </div>
            <div className="text-[9px] font-mono text-[#003d9b] mt-2">
              https://www.iida-imm.com/
            </div>
          </div>

          {/* Column 2: Project Info & Client */}
          <div className="col-span-5 border-r-2 border-[#0f172a] p-3 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">
                PROJECT TITLE &amp; LOCATION
              </span>
              <span className="text-xs text-[#0f172a] block font-sans font-bold">
                {projectTitle}
              </span>
              <span className="text-[10px] text-[#475569] block font-sans font-normal">
                {metadata.clientName} - {metadata.siteAddress}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-[#64748b] mt-2 border-t border-[#e2e8f0] pt-1">
              <span>DESIGNER: {metadata.designer}</span>
              <span>DATE: {currentDate}</span>
            </div>
          </div>

          {/* Column 3: Stamp / Reserved */}
          <div className="col-span-2 border-r-2 border-[#0f172a] p-2 flex flex-col items-center justify-center text-center bg-[#dae2ff]/30">
            <ShieldCheck className="w-5 h-5 text-[#003d9b] mb-1" />
            <span className="text-[8px] text-[#003d9b] font-bold uppercase block">
              RESERVED BY
            </span>
            <span className="text-[8px] text-[#0f172a] font-bold leading-tight">
              IIDA ELECTRONICS
            </span>
          </div>

          {/* Column 4: Drawing Number & Rev */}
          <div className="col-span-2 p-3 flex flex-col justify-between bg-[#f8fafc]">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">
                DRAWING NO.
              </span>
              <span className="text-base font-extrabold text-[#003d9b] block">
                {metadata.drawingNumber}
              </span>
            </div>
            <div className="text-[10px] text-[#334155]">
              REV: <span className="text-[#003d9b]">{metadata.revision}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
