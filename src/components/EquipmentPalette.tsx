import React, { useState } from 'react';
import {
  Sun,
  Box,
  Zap,
  Battery,
  Grid,
  Cpu,
  Layers,
  ShieldAlert,
  Flame,
  Search,
  Plus,
  GripVertical,
  X,
} from 'lucide-react';
import { LIBRARY_ITEMS } from '../data/presetData';
import { EquipmentType, EquipmentLibraryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EquipmentPaletteProps {
  onAddEquipment: (type: EquipmentType) => void;
  onAddEquipmentFromCatalog?: (item: EquipmentLibraryItem) => void;
  onSelectItem?: (item: EquipmentLibraryItem) => void;
  catalogItems?: EquipmentLibraryItem[];
  onClose?: () => void;
}

export const EquipmentPalette: React.FC<EquipmentPaletteProps> = ({
  onAddEquipment,
  onAddEquipmentFromCatalog,
  onSelectItem,
  catalogItems = LIBRARY_ITEMS,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { language, t } = useLanguage();

  const categories = Array.from(
    new Set(['All', 'Generation', 'Conversion', 'Storage', 'Distribution', 'Loads', ...catalogItems.map((item) => item.category)])
  );

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('catAll');
      case 'Generation': return t('catGeneration');
      case 'Conversion': return t('catConversion');
      case 'Storage': return t('catStorage');
      case 'Distribution': return t('catDistribution');
      case 'Loads': return t('catLoads');
      default: return cat;
    }
  };

  const getEquipmentName = (item: EquipmentLibraryItem) => {
    if (language === 'ja') {
      const translated = t(item.type as any);
      if (translated) return translated;
    }
    return item.defaultName;
  };

  const filteredItems = catalogItems.filter((item) => {
    const itemName = getEquipmentName(item);
    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defaultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defaultManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Generation':
        return <Sun className="w-3.5 h-3.5 text-[#003d9b]" />;
      case 'Conversion':
        return <Zap className="w-3.5 h-3.5 text-[#285ab9]" />;
      case 'Storage':
        return <Battery className="w-3.5 h-3.5 text-[#d97706]" />;
      case 'Distribution':
        return <Grid className="w-3.5 h-3.5 text-[#004483]" />;
      case 'Loads':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#ba1a1a]" />;
      default:
        return <Box className="w-3.5 h-3.5 text-[#434654]" />;
    }
  };

  const getItemIcon = (type: EquipmentType) => {
    switch (type) {
      case 'pv_array':
        return <Sun className="w-4 h-4 text-[#003d9b]" />;
      case 'combiner_box':
        return <Box className="w-4 h-4 text-[#285ab9]" />;
      case 'inverter':
        return <Zap className="w-4 h-4 text-[#0052cc]" />;
      case 'battery':
        return <Battery className="w-4 h-4 text-[#d97706]" />;
      case 'grid':
        return <Grid className="w-4 h-4 text-[#004483]" />;
      case 'generator':
        return <Cpu className="w-4 h-4 text-[#ba1a1a]" />;
      case 'ac_panel':
        return <Layers className="w-4 h-4 text-[#181c1f]" />;
      case 'inverter_load_panel':
        return <ShieldAlert className="w-4 h-4 text-[#2563eb]" />;
      case 'non_inverter_load_panel':
        return <Flame className="w-4 h-4 text-[#dc2626]" />;
      default:
        return <Box className="w-4 h-4 text-[#434654]" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, item: EquipmentLibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: item.type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#c3c6d6] flex flex-col h-full z-10 shrink-0 shadow-xs">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#c3c6d6] bg-[#f1f4f8] flex items-center justify-between">
        <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
          {t('libraryTitle')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold text-[#434654] bg-[#e0e3e7] px-1.5 py-0.5 rounded">
            {filteredItems.length} {t('itemsCount')}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#737685] hover:text-[#181c1f] hover:bg-[#e0e3e7] p-1 rounded transition-colors"
              title="Hide Equipment Library"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-[#ebeef2] bg-[#ffffff]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#737685]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded pl-8 pr-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#003d9b] text-white'
                  : 'bg-[#f1f4f8] text-[#434654] hover:bg-[#e0e3e7]'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#737685]">
            {t('noItemsFound')}
          </div>
        ) : (
          filteredItems.map((item) => {
            const displayName = getEquipmentName(item);
            return (
              <div
                key={`${item.type}-${item.defaultName}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => {
                  if (onSelectItem) {
                    onSelectItem(item);
                  } else if (onAddEquipmentFromCatalog) {
                    onAddEquipmentFromCatalog(item);
                  } else {
                    onAddEquipment(item.type);
                  }
                }}
                className="group relative bg-[#ffffff] hover:bg-[#f1f4f8] border border-[#c3c6d6] hover:border-[#003d9b] rounded p-2 transition-all cursor-pointer shadow-2xs flex gap-2.5 items-center"
                title="Click to view specifications or select component on canvas"
              >
                {/* Image / Icon Thumbnail */}
                <div className="relative w-12 h-12 rounded bg-[#ebeef2] overflow-hidden border border-[#c3c6d6] shrink-0 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-0.5 right-0.5 bg-white/90 rounded p-0.5 shadow-2xs">
                    {getItemIcon(item.type)}
                  </div>
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#181c1f] truncate leading-tight">
                      {displayName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddEquipmentFromCatalog) {
                          onAddEquipmentFromCatalog(item);
                        } else {
                          onAddEquipment(item.type);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#003d9b] hover:bg-[#003d9b]/10 rounded transition-all"
                      title="Add to Canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-[#434654] truncate mt-0.5">
                    {item.defaultCapacity}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-[#737685] mt-0.5">
                    {getCategoryIcon(item.category)}
                    <span className="uppercase font-semibold tracking-wider">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                <GripVertical className="w-3.5 h-3.5 text-[#cbd5e1] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Hint */}
      <div className="p-2 border-t border-[#ebeef2] bg-[#f8fafc] text-[10px] text-[#737685] text-center">
        {t('dragHint')}
      </div>
    </aside>
  );
};

