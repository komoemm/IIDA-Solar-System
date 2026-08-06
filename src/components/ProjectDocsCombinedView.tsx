import React from 'react';
import { FileSpreadsheet, Sliders, BookOpen } from 'lucide-react';
import { EquipmentNode, Connection, ProjectMetadata } from '../types';
import { BimSheetView } from './BimSheetView';
import { ProjectSettings } from './ProjectSettings';
import { UserManual } from './UserManual';
import { useLanguage } from '../context/LanguageContext';

export type DocsSubTab = 'bim' | 'settings' | 'manual';

interface ProjectDocsCombinedViewProps {
  nodes: EquipmentNode[];
  connections: Connection[];
  metadata: ProjectMetadata;
  designNotes: string;
  onUpdateMetadata: (updates: Partial<ProjectMetadata>) => void;
  onOpenAddModal: () => void;
  activeSubTab: DocsSubTab;
  setActiveSubTab: (subTab: DocsSubTab) => void;
  onNavigateTab: (tab: string) => void;
}

export const ProjectDocsCombinedView: React.FC<ProjectDocsCombinedViewProps> = ({
  nodes,
  connections,
  metadata,
  designNotes,
  onUpdateMetadata,
  onOpenAddModal,
  activeSubTab,
  setActiveSubTab,
  onNavigateTab,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sub-Header Navigation Tabs */}
      <div className="bg-[#ffffff] border-b border-[#c3c6d6] px-4 md:px-6 py-2 flex items-center justify-between gap-4 shadow-2xs shrink-0 z-10">
        <div className="flex items-center gap-1.5 bg-[#f1f4f8] p-1 rounded-lg border border-[#c3c6d6]">
          <button
            onClick={() => setActiveSubTab('bim')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'bim'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('navBim')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'settings'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('navSettings')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'manual'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'text-[#434654] hover:text-[#181c1f] hover:bg-[#e0e3e7]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('navManual')}</span>
          </button>
        </div>

        {/* Quick Badge / Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#737685]">
          <span className="font-semibold text-[#181c1f]">{metadata.title}</span>
          <span className="font-mono bg-[#e0e3e7] text-[#434654] px-2 py-0.5 rounded text-[11px] font-bold">
            {metadata.drawingNumber}
          </span>
        </div>
      </div>

      {/* Sub-Tab Viewport Content Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {activeSubTab === 'bim' && (
          <BimSheetView
            nodes={nodes}
            connections={connections}
            metadata={metadata}
            designNotes={designNotes}
          />
        )}

        {activeSubTab === 'settings' && (
          <ProjectSettings
            metadata={metadata}
            onUpdateMetadata={onUpdateMetadata}
          />
        )}

        {activeSubTab === 'manual' && (
          <UserManual
            onOpenAddModal={onOpenAddModal}
            onNavigateTab={(targetTab) => {
              if (targetTab === 'bim' || targetTab === 'settings' || targetTab === 'manual') {
                setActiveSubTab(targetTab as DocsSubTab);
              } else {
                onNavigateTab(targetTab);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
