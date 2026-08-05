import React from 'react';
import {
  Sun,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Plus,
  Layout,
  Share2,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe,
  BookOpen,
  Cloud,
  CloudUpload,
  CloudDownload,
} from 'lucide-react';
import { ProjectMetadata } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeTab: 'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings' | 'manual';
  setActiveTab: (tab: 'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings' | 'manual') => void;
  metadata: ProjectMetadata;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onOpenAddModal: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSample: () => void;
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

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
            <div className="flex items-center gap-2 text-xs text-[#434654]">
              <span className="font-bold text-[#003d9b]">{metadata.clientName}</span>
              <span>•</span>
              <a
                href="https://www.iida-imm.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[#003d9b] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
              >
                <span>www.iida-imm.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Badge */}
          <div className="flex items-center border border-[#a6c8ff] rounded-full bg-[#dae2ff]/30 p-0.5 mr-1 shadow-2xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-[#003d9b] text-white shadow-xs'
                  : 'text-[#003d9b] hover:bg-[#dae2ff]/60'
              }`}
              title="Switch language to English"
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('ja')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                language === 'ja'
                  ? 'bg-[#003d9b] text-white shadow-xs'
                  : 'text-[#003d9b] hover:bg-[#dae2ff]/60'
              }`}
              title="日本語に言語を切り替えます"
            >
              <span>🇯🇵</span>
              <span>日本語</span>
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border border-[#c3c6d6] rounded bg-[#f1f4f8] overflow-hidden">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 transition-colors ${
                canUndo
                  ? 'text-[#181c1f] hover:bg-[#e0e3e7]'
                  : 'text-[#737685] opacity-40 cursor-not-allowed'
              }`}
              title={t('undo')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-5 bg-[#c3c6d6]" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 transition-colors ${
                canRedo
                  ? 'text-[#181c1f] hover:bg-[#e0e3e7]'
                  : 'text-[#737685] opacity-40 cursor-not-allowed'
              }`}
              title={t('redo')}
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Auto Layout */}
          <button
            onClick={onAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#434654] bg-[#f1f4f8] hover:bg-[#e0e3e7] border border-[#c3c6d6] rounded transition-colors"
            title={t('autoLayout')}
          >
            <Layout className="w-3.5 h-3.5 text-[#003d9b]" />
            <span className="hidden sm:inline">{t('autoLayout')}</span>
          </button>

          {/* Add Equipment */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#0052cc] rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addEquipment')}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExportPng}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#434654] hover:bg-[#f1f4f8] border border-[#c3c6d6] rounded transition-colors"
              title={t('exportPng')}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#003d9b]" />
              <span className="hidden md:inline">PNG</span>
            </button>

            <button
              onClick={onExportSvg}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#434654] hover:bg-[#f1f4f8] border border-[#c3c6d6] rounded transition-colors"
              title={t('exportSvg')}
            >
              <FileCode className="w-3.5 h-3.5 text-[#285ab9]" />
              <span className="hidden md:inline">SVG</span>
            </button>

            <button
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#434654] hover:bg-[#f1f4f8] border border-[#c3c6d6] rounded transition-colors"
              title={t('exportJson')}
            >
              <Download className="w-3.5 h-3.5 text-[#004483]" />
              <span className="hidden lg:inline">JSON</span>
            </button>

            {/* Import JSON hidden input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJson}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#434654] hover:bg-[#f1f4f8] border border-[#c3c6d6] rounded transition-colors"
              title={t('importJson')}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Firebase Cloud Sync Controls */}
            {onCloudSave && (
              <button
                onClick={onCloudSave}
                disabled={isCloudSaving}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#0052cc] rounded shadow-2xs transition-colors disabled:opacity-50"
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
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-[#003d9b] bg-[#dae2ff]/50 hover:bg-[#dae2ff] border border-[#a6c8ff] rounded transition-colors"
                title={t('cloudLoad')}
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('cloudLoad')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="h-10 px-4 md:px-6 flex items-center bg-[#ffffff] border-b border-[#c3c6d6] text-xs font-bold uppercase tracking-wider">
        <div className="flex h-full gap-1">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'canvas'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <span>{t('navCanvas')}</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <span>{t('navInventory')}</span>
          </button>

          <button
            onClick={() => setActiveTab('bim')}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'bim'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <span>{t('navBim')}</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <span>{t('navGallery')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#434654] hover:text-[#181c1f] hover:bg-[#f1f4f8]'
            }`}
          >
            <span>{t('navSettings')}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-[#003d9b] text-[#003d9b] bg-[#003d9b]/5 font-bold'
                : 'border-transparent text-[#003d9b] hover:text-[#0052cc] hover:bg-[#003d9b]/10 bg-[#dae2ff]/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#003d9b]" />
            <span>{t('navManual')}</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="https://www.iida-imm.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 text-[11px] text-[#003d9b] font-mono bg-[#dae2ff]/50 hover:bg-[#dae2ff] px-2.5 py-0.5 rounded border border-[#a6c8ff] font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#003d9b]" />
            <span>{t('reservedBadge')}</span>
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#059669] font-mono bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('necCompliant')}</span>
          </span>
          <button
            onClick={onResetSample}
            className="text-[10px] text-[#737685] hover:text-[#003d9b] underline font-mono"
            title="Reset diagram to initial hybrid solar preset"
          >
            {t('resetDemo')}
          </button>
        </div>
      </nav>
    </header>
  );
};

