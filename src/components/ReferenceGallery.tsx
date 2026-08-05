import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Plus,
  Maximize2,
  X,
  Tag,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { LIBRARY_ITEMS } from '../data/presetData';
import { EquipmentType, EquipmentLibraryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ReferenceGalleryProps {
  onAddEquipment: (type: EquipmentType) => void;
}

export const ReferenceGallery: React.FC<ReferenceGalleryProps> = ({ onAddEquipment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<EquipmentLibraryItem | null>(null);
  const { language, t } = useLanguage();

  const categories = ['All', 'Generation', 'Conversion', 'Storage', 'Distribution', 'Loads'];

  const filteredItems = LIBRARY_ITEMS.filter((item) => {
    const matchesSearch =
      item.defaultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defaultManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-bold text-[#181c1f]">
            {t('refCatalog')}
          </h1>
          <p className="text-xs text-[#434654] mt-0.5">
            Real-world reference photos, physical specifications, and documentation sheets for hybrid solar BIM design.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#737685]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded pl-9 pr-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#003d9b] text-white'
                    : 'bg-[#f1f4f8] text-[#434654] hover:bg-[#e0e3e7]'
                }`}
              >
                {cat === 'All' ? t('catAll') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.type}
              className="bg-[#ffffff] border border-[#c3c6d6] hover:border-[#003d9b] rounded overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Photo Frame */}
              <div className="relative w-full h-48 bg-[#ebeef2] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.defaultName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Category Badge */}
                <span className="absolute top-3 left-3 bg-white/90 text-[#003d9b] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                  {item.category}
                </span>

                {/* Expand Image Modal Button */}
                <button
                  onClick={() => setSelectedPhotoItem(item)}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-1.5 rounded transition-colors"
                  title="Expand High-Res Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-bold text-sm leading-snug drop-shadow-xs">
                    {item.defaultName}
                  </div>
                  <div className="text-xs text-white/80 font-mono mt-0.5">
                    {item.defaultManufacturer} • {item.defaultModel}
                  </div>
                </div>
              </div>

              {/* Card Body Specs */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-[#434654] leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1.5 text-xs border-t border-[#ebeef2] pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#737685]">{t('capacityRating')}:</span>
                    <span className="font-mono font-bold text-[#003d9b]">{item.defaultCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737685]">{t('voltageClass')}:</span>
                    <span className="font-mono text-[#181c1f]">{item.defaultVoltage}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#ebeef2]">
                  <button
                    onClick={() => onAddEquipment(item.type)}
                    className="flex-1 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addComponent')}</span>
                  </button>

                  {item.specSheetUrl && (
                    <a
                      href={item.specSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] rounded transition-colors"
                      title="Open Spec Sheet PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Res Photo Modal Preview */}
      {selectedPhotoItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoItem(null)}
        >
          <div
            className="bg-[#ffffff] rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-[#181c1f]">
              <img
                src={selectedPhotoItem.imageUrl}
                alt={selectedPhotoItem.defaultName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedPhotoItem(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#003d9b] bg-[#dae2ff] px-2 py-0.5 rounded">
                  {selectedPhotoItem.category}
                </span>
                <h3 className="text-lg font-bold text-[#181c1f] mt-1">
                  {selectedPhotoItem.defaultName}
                </h3>
                <p className="text-xs text-[#737685] font-mono">
                  {selectedPhotoItem.defaultManufacturer} — {selectedPhotoItem.defaultModel}
                </p>
              </div>

              <p className="text-xs text-[#434654] leading-relaxed">
                {selectedPhotoItem.description}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ebeef2]">
                <button
                  onClick={() => {
                    onAddEquipment(selectedPhotoItem.type);
                    setSelectedPhotoItem(null);
                  }}
                  className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs"
                >
                  {t('addComponent')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

