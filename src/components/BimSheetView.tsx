import React from 'react';
import {
  Printer,
  Download,
  FileCode,
  ShieldCheck,
  Sun,
  Battery,
  Zap,
} from 'lucide-react';
import { EquipmentNode, Connection, ProjectMetadata } from '../types';
import { exportElementToPng, exportDiagramToSvg } from '../utils/exportUtils';

interface BimSheetViewProps {
  nodes: EquipmentNode[];
  connections: Connection[];
  metadata: ProjectMetadata;
  designNotes: string;
}

export const BimSheetView: React.FC<BimSheetViewProps> = ({
  nodes,
  connections,
  metadata,
  designNotes,
}) => {
  // Calculations
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

  const handleExportPng = () => {
    exportElementToPng('bim-drawing-sheet', `${metadata.drawingNumber}-solar-bim-drawing.png`);
  };

  const handleExportSvg = () => {
    exportDiagramToSvg(nodes, connections, metadata, `${metadata.drawingNumber}-solar-bim.svg`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-[#434654] p-6 overflow-y-auto flex flex-col items-center justify-start font-sans">
      {/* Top Floating Print Controls */}
      <div className="w-full max-w-6xl mb-4 flex items-center justify-between bg-[#181c1f] text-white p-3 rounded shadow-md">
        <div>
          <span className="font-bold text-sm block">BIM Technical Drawing Sheet</span>
          <span className="text-xs text-[#94a3b8]">
            ANSI D-Size Standard Single-Line Diagram Layout Frame
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffffff] text-[#181c1f] hover:bg-[#e0e3e7] font-bold text-xs rounded transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={handleExportPng}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PNG</span>
          </button>

          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#285ab9] hover:bg-[#0052cc] text-white font-bold text-xs rounded transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <span>Export Vector SVG</span>
          </button>
        </div>
      </div>

      {/* CAD Drawing Sheet Paper (ANSI D Aspect) */}
      <div
        id="bim-drawing-sheet"
        className="w-full max-w-6xl bg-white border-4 border-[#0f172a] shadow-2xl p-6 relative flex flex-col min-h-[750px] font-sans text-[#0f172a]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Drawing Outer Border with Grid Coordinate Indicators */}
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

        {/* Sheet Content Body */}
        <div className="flex-1 p-4 space-y-4">
          {/* Top Title Banner inside CAD Frame */}
          <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-2">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#003d9b]">
                SYSTEM SINGLE-LINE DIAGRAM (SLD) &amp; BIM ARCHITECTURE
              </span>
              <h2 className="text-lg font-bold text-[#0f172a]">
                {metadata.title}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 bg-[#dae2ff] px-2 py-1 rounded border border-[#a6c8ff] font-bold text-[#003d9b]">
                <Sun className="w-3.5 h-3.5" /> PV: {totalPvKw.toFixed(1)} kWp
              </span>
              <span className="flex items-center gap-1 bg-[#fef3c7] px-2 py-1 rounded border border-[#fde68a] font-bold text-[#d97706]">
                <Battery className="w-3.5 h-3.5" /> BESS: {totalBessKwh.toFixed(1)} kWh
              </span>
            </div>
          </div>

          {/* Schematic Diagram Preview Graphic */}
          <div className="border border-[#cbd5e1] bg-[#f8fafc] rounded p-4 relative min-h-[360px] flex items-center justify-center">
            {/* Visual Node Grid Layout Map */}
            <div className="w-full grid grid-cols-5 gap-3 text-center">
              {['pv_array', 'combiner_box', 'inverter', 'ac_panel', 'grid'].map(
                (catType) => {
                  const catNodes = nodes.filter((n) => n.type === catType);
                  return (
                    <div
                      key={catType}
                      className="border border-[#cbd5e1] rounded bg-white p-2 flex flex-col gap-2 min-h-[120px]"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d9b] border-b border-[#e2e8f0] pb-1">
                        {catType.replace('_', ' ')}
                      </span>
                      {catNodes.map((n) => (
                        <div
                          key={n.id}
                          className="p-1.5 bg-[#f1f5f9] rounded border border-[#cbd5e1] text-left"
                        >
                          <div className="font-mono font-bold text-[10px] text-[#003d9b]">
                            {n.id}
                          </div>
                          <div className="font-semibold text-[10px] truncate text-[#0f172a]">
                            {n.name}
                          </div>
                          <div className="text-[9px] font-mono text-[#64748b]">
                            {n.capacity}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Notes Section inside CAD Sheet */}
          <div className="border border-[#cbd5e1] bg-white p-3 rounded">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#003d9b] block mb-1">
              GENERAL ENGINEERING NOTES &amp; CODE COMPLIANCE
            </span>
            <p className="text-[11px] font-mono text-[#334155] whitespace-pre-wrap leading-relaxed">
              {designNotes}
            </p>
          </div>
        </div>

        {/* CAD Professional Title Block Frame at Bottom */}
        <div className="border-2 border-[#0f172a] bg-white grid grid-cols-12 text-xs font-mono font-bold">
          {/* Logo & Company */}
          <div className="col-span-3 border-r-2 border-[#0f172a] p-3 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">ENGINEERING FIRM / COMPANY</span>
              <span className="text-xs font-bold text-[#003d9b] block leading-tight">{metadata.clientName}</span>
            </div>
            <div className="text-[9px] font-mono text-[#003d9b] mt-2">
              https://www.iida-imm.com/
            </div>
          </div>

          {/* Project Details */}
          <div className="col-span-5 border-r-2 border-[#0f172a] p-3 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">PROJECT TITLE / LOCATION</span>
              <span className="text-xs text-[#0f172a] block font-sans font-bold">{metadata.title}</span>
              <span className="text-[10px] text-[#475569] block font-sans">{metadata.siteAddress}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#64748b] mt-2 border-t border-[#e2e8f0] pt-1">
              <span>DESIGNER: {metadata.designer}</span>
              <span>CHECKER: {metadata.checker}</span>
            </div>
          </div>

          {/* PE Stamp / Reserved Stamp */}
          <div className="col-span-2 border-r-2 border-[#0f172a] p-2 flex flex-col items-center justify-center text-center bg-[#dae2ff]/30">
            <ShieldCheck className="w-6 h-6 text-[#003d9b] mb-1" />
            <span className="text-[8px] text-[#003d9b] font-bold uppercase block">RESERVED BY</span>
            <span className="text-[8px] text-[#0f172a] font-bold leading-tight">IIDA ELECTRONICS (MYANMAR)</span>
          </div>

          {/* Drawing Number & Revision */}
          <div className="col-span-2 p-3 flex flex-col justify-between bg-[#f1f5f9]">
            <div>
              <span className="text-[9px] text-[#64748b] block uppercase">DRAWING NO.</span>
              <span className="text-base font-bold text-[#003d9b] block">{metadata.drawingNumber}</span>
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
