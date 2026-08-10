import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Printer,
  Layers,
  Images,
  Calculator,
  CheckCircle2,
  ExternalLink,
  FileText,
  Lightbulb,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { ProjectMetadata } from '../types';

export type MainTabType = 'canvas' | 'gallery' | 'calculator';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  metadata: ProjectMetadata;
  onPrintExport?: () => void;
  onLoadOfficialFactorySld?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  onPrintExport,
  onLoadOfficialFactorySld,
}) => {
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDocsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#ffffff] border-b border-[#c3c6d6] shadow-sm font-sans" aria-label="IIDA Electronics Myanmar Header">
      {/* Top Banner Row */}
      <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-4 border-b border-[#ebeef2]">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#003d9b] flex items-center justify-center text-white font-bold shadow-xs">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base text-[#181c1f] leading-tight">
                {metadata.title}
              </span>
              <span className="text-xs font-mono bg-[#e0e3e7] text-[#434654] px-2 py-0.5 rounded font-semibold">
                {metadata.drawingNumber}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1" title="Diagram changes automatically save to LocalStorage">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Auto-saved</span>
              </span>

              {/* Documentation Dropdown Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDocsOpen(!isDocsOpen)}
                  className="px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-800 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Factory System Blueprint Documentation"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Factory System Blueprint</span>
                  <ChevronDown className={`w-3 h-3 text-amber-600 transition-transform duration-200 ${isDocsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDocsOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white border border-[#cbd5e1] rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                      System Documentation
                    </div>
                    <a
                      href="https://link.imm-it.com/sld.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDocsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1e293b] hover:bg-[#dae2ff]/40 hover:text-[#003d9b] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">Official SLD Drawing (PDF)</span>
                        <span className="text-[10px] text-[#64748b] font-normal truncate">High-Res Electrical Drawing</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#94a3b8] shrink-0" />
                    </a>
                    <a
                      href="https://link.imm-it.com/explain.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDocsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1e293b] hover:bg-[#dae2ff]/40 hover:text-[#003d9b] transition-colors"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">System Technical Explanation (HTML)</span>
                        <span className="text-[10px] text-[#64748b] font-normal truncate">Engineering Specs &amp; Technical Manual</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#94a3b8] shrink-0" />
                    </a>

                    <div className="my-1 border-t border-[#f1f5f9]" />

                    <button
                      onClick={() => {
                        setIsDocsOpen(false);
                        onLoadOfficialFactorySld?.();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#003d9b] bg-[#dae2ff]/30 hover:bg-[#dae2ff] transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-[#003d9b] shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">⚡ Load Official Factory SLD to Canvas</span>
                        <span className="text-[10px] text-[#003d9b]/80 font-normal truncate">124.8 kWp PV + 286.7 kWh BESS Preset</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-[#434654]">
              <span className="font-bold text-[#003d9b]">{metadata.clientName}</span>
            </div>
          </div>
        </div>

        {/* Global Action Tools - Print / Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrintExport || (() => window.print())}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#0052cc] rounded-md shadow-xs transition-colors"
            title="Print or Export Drawing Sheet"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar - Strictly 3 Main Tabs */}
      <nav className="h-10 px-4 md:px-6 flex items-center bg-[#ffffff] border-b border-[#c3c6d6] text-xs font-bold uppercase tracking-wider" aria-label="Main Application Navigation">
        <div className="flex h-full gap-1" role="tablist">
          {/* Main Tab 1: Line Diagram (SLD) Canvas */}
          <button
            onClick={() => setActiveTab('canvas')}
            role="tab"
            aria-selected={activeTab === 'canvas'}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'canvas'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#003d9b]" />
            <span>Line Diagram (SLD) Canvas</span>
          </button>

          {/* Main Tab 2: Solar Load Calculator (Placed right near Line Diagram SLD Canvas) */}
          <button
            onClick={() => setActiveTab('calculator')}
            role="tab"
            aria-selected={activeTab === 'calculator'}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'calculator'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#003d9b]" />
            <span>Solar Load Calculator</span>
          </button>

          {/* Main Tab 3: Equipment & Image Gallery */}
          <button
            onClick={() => setActiveTab('gallery')}
            role="tab"
            aria-selected={activeTab === 'gallery'}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <Images className="w-4 h-4 text-[#003d9b]" />
            <span>Equipment &amp; Image Gallery</span>
          </button>
        </div>
      </nav>
    </header>
  );
};


