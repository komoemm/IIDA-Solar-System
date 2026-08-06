import React from 'react';
import { Boxes, Images } from 'lucide-react';
import { EquipmentNode, EquipmentType, EquipmentLibraryItem } from '../types';
import { EquipmentList } from './EquipmentList';
import { ReferenceGallery } from './ReferenceGallery';
import { useLanguage } from '../context/LanguageContext';

export type InventorySubTab = 'inventory' | 'gallery';

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
      <div className="bg-[#ffffff] border-b border-[#c3c6d6] px-4 md:px-6 py-2 flex items-center justify-between gap-4 shadow-2xs shrink-0 z-10">
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
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#737685]">
          <span className="font-semibold text-[#181c1f]">
            {activeSubTab === 'inventory' ? 'Project Equipment Bill of Materials' : 'Verified Catalog Specification Library'}
          </span>
        </div>
      </div>

      {/* Viewport Content Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
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
      </div>
    </div>
  );
};
