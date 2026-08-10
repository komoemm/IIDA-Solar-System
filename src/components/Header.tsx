import React from 'react';
import {
  Sun,
  Printer,
  Layers,
  Images,
  Calculator,
} from 'lucide-react';
import { ProjectMetadata } from '../types';

export type MainTabType = 'canvas' | 'gallery' | 'calculator';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  metadata: ProjectMetadata;
  onPrintExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  onPrintExport,
}) => {
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
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#181c1f] leading-tight">
                {metadata.title}
              </span>
              <span className="text-xs font-mono bg-[#e0e3e7] text-[#434654] px-2 py-0.5 rounded font-semibold">
                {metadata.drawingNumber}
              </span>
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

          {/* Main Tab 2: Equipment & Image Gallery */}
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

          {/* Main Tab 3: Solar Load Calculator */}
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
        </div>
      </nav>
    </header>
  );
};


