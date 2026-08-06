import React from 'react';
import {
  Sun,
  RotateCcw,
  RotateCw,
  Layout,
  Globe,
  CloudUpload,
  CloudDownload,
  Layers,
  Boxes,
  Images,
  FolderKanban,
} from 'lucide-react';
import { ProjectMetadata } from '../types';
import { useLanguage } from '../context/LanguageContext';

export type MainTabType = 'canvas' | 'inventory' | 'gallery' | 'docs' | 'bim' | 'settings' | 'manual';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  metadata: ProjectMetadata;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onOpenAddModal?: () => void;
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onExportJson?: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSample?: () => void;
  onCloudSave?: () => void;
  onCloudLoad?: () => void;
  isCloudSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onOpenAddModal,
  onExportPng,
  onExportSvg,
  onExportJson,
  onImportJson,
  onResetSample,
  onCloudSave,
  onCloudLoad,
  isCloudSaving = false,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const isInventoryActive = activeTab === 'inventory' || activeTab === 'gallery';

  const isDocsActive =
    activeTab === 'docs' ||
    activeTab === 'bim' ||
    activeTab === 'settings' ||
    activeTab === 'manual';

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#ffffff] border-b border-[#c3c6d6] shadow-sm font-sans">
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

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-[#003d9b] bg-[#dae2ff]/50 hover:bg-[#dae2ff] border border-[#a6c8ff] rounded transition-all shadow-2xs"
            title={language === 'en' ? 'Switch to Japanese (日本語)' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-[#003d9b]" />
            <span className="font-mono text-[11px] uppercase">
              {language === 'en' ? 'EN' : 'JP'}
            </span>
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center border border-[#c3c6d6] rounded bg-[#f1f4f8] overflow-hidden">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 transition-colors ${
                canUndo
                  ? 'text-[#181c1f] hover:bg-[#e0e3e7]'
                  : 'text-[#737685] opacity-40 cursor-not-allowed'
              }`}
              title={t('undo')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-[#c3c6d6]" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 transition-colors ${
                canRedo
                  ? 'text-[#181c1f] hover:bg-[#e0e3e7]'
                  : 'text-[#737685] opacity-40 cursor-not-allowed'
              }`}
              title={t('redo')}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto Layout */}
          <button
            onClick={onAutoLayout}
            className="p-1.5 text-[#434654] hover:text-[#003d9b] bg-[#f1f4f8] hover:bg-[#e0e3e7] border border-[#c3c6d6] rounded transition-colors flex items-center gap-1 text-xs font-semibold"
            title={t('autoLayout')}
          >
            <Layout className="w-3.5 h-3.5 text-[#003d9b]" />
            <span className="hidden md:inline">{t('autoLayout')}</span>
          </button>

          {/* Firebase Cloud Sync Controls */}
          {onCloudSave && (
            <button
              onClick={onCloudSave}
              disabled={isCloudSaving}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#0052cc] rounded shadow-2xs transition-colors disabled:opacity-50"
              title={t('cloudSave')}
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isCloudSaving ? t('savingToCloud') : t('cloudSave')}
              </span>
            </button>
          )}

          {onCloudLoad && (
            <button
              onClick={onCloudLoad}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#003d9b] bg-[#dae2ff]/50 hover:bg-[#dae2ff] border border-[#a6c8ff] rounded transition-colors"
              title={t('cloudLoad')}
            >
              <CloudDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('cloudLoad')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar with Small Icons */}
      <nav className="h-10 px-4 md:px-6 flex items-center bg-[#ffffff] border-b border-[#c3c6d6] text-xs font-bold uppercase tracking-wider">
        <div className="flex h-full gap-1">
          {/* Main Tab 1: Diagram Canvas */}
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'canvas'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#003d9b]" />
            <span>{t('navCanvas')}</span>
          </button>

          {/* Main Tab 2: Combined Equipment Inventory & Reference Gallery */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 flex items-center gap-2 border-b-2 transition-all ${
              isInventoryActive
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <Boxes className="w-4 h-4 text-[#003d9b]" />
            <span>{t('navInventoryCombined')}</span>
          </button>

          {/* Main Tab 3: Combined BIM, Settings & Manual */}
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 flex items-center gap-2 border-b-2 transition-all ${
              isDocsActive
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-[#003d9b]" />
            <span>{t('navDocsCombined')}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

