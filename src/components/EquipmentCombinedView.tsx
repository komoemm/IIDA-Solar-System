import React from 'react';
import { Boxes, Images, Calculator } from 'lucide-react';
import { EquipmentNode, EquipmentType, EquipmentLibraryItem } from '../types';
import { EquipmentList } from './EquipmentList';
import { ReferenceGallery } from './ReferenceGallery';
import { SolarLoadCalculator } from './SolarLoadCalculator';
import { useLanguage } from '../context/LanguageContext';

export type InventorySubTab = 'inventory' | 'gallery' | 'calculator';

interface EquipmentCombinedViewProps {
  nodes: EquipmentNode[];
  onSelectNodeForEdit?: (id: string) => void;
  onUpdateNode?: (id: string, updates: Partial<EquipmentNode>) => void;
  onDeleteNode: (id: string) => void;
  onOpenAddModal: () => void;
  onNavigateToCanvas?: (id: string) => void;
  onAddEquipment: (type: EquipmentType) => void;
  onAddEquipmentFromCatalog?: (item: EquipmentLibraryItem) => void;
  catalogItems?: EquipmentLibraryItem[];
  onSaveCatalogItem?: (item: EquipmentLibraryItem, originalItem?: EquipmentLibraryItem | null) => void;
  activeSubTab: InventorySubTab;
  setActiveSubTab: (subTab: InventorySubTab) => void;
}

export const EquipmentCombinedView: React.FC<EquipmentCombinedViewProps> = ({
  nodes,
  onSelectNodeForEdit,
  onUpdateNode,
  onDeleteNode,
  onOpenAddModal,
  onNavigateToCanvas,
  onAddEquipment,
  onAddEquipmentFromCatalog,
  catalogItems,
  onSaveCatalogItem,
  activeSubTab,
  setActiveSubTab,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sub-Header Navigation Tabs */}
      <nav className="bg-[#ffffff] border-b border-[#c3c6d6] px-4 md:px-6 py-2 flex items-center justify-between gap-4 shadow-2xs shrink-0 z-10" aria-label="Equipment View Sub-Navigation">
        <div className="flex items-center gap-1.5 bg-[#f1f4f8] p-1 rounded-lg border border-[#c3c6d6]">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'inventory'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{t('navInventory')}</span>
            <span className="ml-1 bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
              {nodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'gallery'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>{t('navGallery')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'calculator'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t('navCalculator')}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#737685]">
          <span className="font-semibold text-[#181c1f]">
            {activeSubTab === 'inventory'
              ? 'Project Equipment Bill of Materials'
              : activeSubTab === 'gallery'
              ? 'Verified Catalog Specification Library'
              : 'Debounced Real-Time Solar Load & Battery Sizing Calculator'}
          </span>
        </div>
      </nav>

      {/* Viewport Content Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col justify-between">
        <div className="p-2 md:p-4">
          {activeSubTab === 'inventory' && (
            <EquipmentList
              nodes={nodes}
              onSelectNodeForEdit={onSelectNodeForEdit}
              onUpdateNode={onUpdateNode}
              onDeleteNode={onDeleteNode}
              onOpenAddModal={onOpenAddModal}
              onNavigateToCanvas={onNavigateToCanvas}
            />
          )}

          {activeSubTab === 'gallery' && (
            <ReferenceGallery
              onAddEquipment={onAddEquipment}
              onAddEquipmentFromCatalog={onAddEquipmentFromCatalog}
              catalogItems={catalogItems}
              onSaveCatalogItem={onSaveCatalogItem}
            />
          )}

          {activeSubTab === 'calculator' && <SolarLoadCalculator />}
        </div>

        {/* Localized Footer */}
        <footer className="mt-8 bg-[#f1f4f8] border-t border-[#c3c6d6] px-4 py-3 text-xs text-[#525666] flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-bold text-[#003d9b]">IIDA Electronics Myanmar</span>
            <span className="hidden sm:inline">•</span>
            <span>Solar &amp; Hybrid Energy Solutions (Yangon, Myanmar)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Email: info@iida-electronics.com.mm</span>
            <span>Tel: +95 9 123 456 789</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
