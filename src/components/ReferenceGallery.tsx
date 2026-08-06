import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Plus,
  Maximize2,
  X,
  Edit3,
  Upload,
  FolderPlus,
  Sparkles,
  Check,
  DraftingCompass,
  Image as ImageIcon,
} from 'lucide-react';
import { LIBRARY_ITEMS, EQUIPMENT_IMAGES } from '../data/presetData';
import { EquipmentType, EquipmentLibraryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EquipmentSketchVector } from './EquipmentSketchVector';

interface ReferenceGalleryProps {
  onAddEquipment: (type: EquipmentType) => void;
  onAddEquipmentFromCatalog?: (item: EquipmentLibraryItem) => void;
  catalogItems?: EquipmentLibraryItem[];
  onSaveCatalogItem?: (item: EquipmentLibraryItem, originalItem?: EquipmentLibraryItem | null) => void;
}

const EQUIPMENT_TYPE_OPTIONS: { type: EquipmentType; label: string }[] = [
  { type: 'pv_array', label: 'PV Solar Array' },
  { type: 'combiner_box', label: 'DC Combiner Box' },
  { type: 'inverter', label: 'Hybrid Inverter' },
  { type: 'battery', label: 'BESS Battery Storage' },
  { type: 'grid', label: 'Utility Grid Point' },
  { type: 'generator', label: 'Backup Generator' },
  { type: 'ac_panel', label: 'Main AC Distribution Panel' },
  { type: 'inverter_load_panel', label: 'Inverter Critical Load Panel' },
  { type: 'non_inverter_load_panel', label: 'Non-Inverter Heavy Load Panel' },
];

export const ReferenceGallery: React.FC<ReferenceGalleryProps> = ({
  onAddEquipment,
  onAddEquipmentFromCatalog,
  catalogItems = LIBRARY_ITEMS,
  onSaveCatalogItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<EquipmentLibraryItem | null>(null);
  const [editingItem, setEditingItem] = useState<EquipmentLibraryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [displayMode, setDisplayMode] = useState<'sketch' | 'photo'>('sketch');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const { language, t } = useLanguage();

  const handleImageError = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }));
  };

  // Form state for catalog editor modal
  const [formType, setFormType] = useState<EquipmentType>('pv_array');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Generation');
  const [formCapacity, setFormCapacity] = useState('');
  const [formVoltage, setFormVoltage] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSpecSheetUrl, setFormSpecSheetUrl] = useState('');

  // Collect all unique categories
  const categories = Array.from(
    new Set(['All', 'Generation', 'Conversion', 'Storage', 'Distribution', 'Loads', ...catalogItems.map((item) => item.category)])
  );

  const filteredItems = catalogItems.filter((item) => {
    const matchesSearch =
      item.defaultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defaultManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openEditModal = (item: EquipmentLibraryItem) => {
    setEditingItem(item);
    setIsAddingNew(false);
    setFormType(item.type);
    setFormName(item.defaultName);
    setFormCategory(item.category);
    setFormCapacity(item.defaultCapacity);
    setFormVoltage(item.defaultVoltage);
    setFormManufacturer(item.defaultManufacturer);
    setFormModel(item.defaultModel);
    setFormDescription(item.description);
    setFormImageUrl(item.imageUrl);
    setFormSpecSheetUrl(item.specSheetUrl || '');
  };

  const openNewModal = () => {
    setEditingItem(null);
    setIsAddingNew(true);
    setFormType('pv_array');
    setFormName('New Equipment Reference');
    setFormCategory('Generation');
    setFormCapacity('15 kW');
    setFormVoltage('240 VAC');
    setFormManufacturer('Custom Vendor');
    setFormModel('Model-X');
    setFormDescription('High-reliability solar & electrical equipment catalog specification.');
    setFormImageUrl(EQUIPMENT_IMAGES.pv_array);
    setFormSpecSheetUrl('');
  };

  const handleCatalogFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          setFormImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImageUrl = formImageUrl.trim();
    const savedItem: EquipmentLibraryItem = {
      type: formType,
      defaultName: formName.trim() || 'Custom Equipment',
      category: formCategory.trim() || 'Generation',
      defaultCapacity: formCapacity.trim() || '10 kW',
      defaultVoltage: formVoltage.trim() || '240 VAC',
      defaultManufacturer: formManufacturer.trim() || 'Generic',
      defaultModel: formModel.trim() || 'Model-1',
      description: formDescription.trim() || 'Solar equipment reference specification.',
      imageUrl: cleanImageUrl || EQUIPMENT_IMAGES[formType],
      specSheetUrl: formSpecSheetUrl.trim() || undefined,
    };

    if (onSaveCatalogItem) {
      onSaveCatalogItem(savedItem, editingItem);
    }
    if (selectedPhotoItem && editingItem && selectedPhotoItem.defaultName === editingItem.defaultName) {
      setSelectedPhotoItem(savedItem);
    }
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleAddComponentClick = (item: EquipmentLibraryItem) => {
    if (onAddEquipmentFromCatalog) {
      onAddEquipmentFromCatalog(item);
    } else {
      onAddEquipment(item.type);
    }
  };

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#181c1f]">
              {t('refCatalog')}
            </h1>
            <p className="text-xs text-[#434654] mt-0.5">
              Verified CAD vector schematics, electrical ratings, and technical documentation sheets for Solar & Hybrid Energy systems.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Display Mode Toggle */}
            <div className="flex items-center bg-[#f1f4f8] p-1 rounded-lg border border-[#c3c6d6]">
              <button
                onClick={() => setDisplayMode('sketch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  displayMode === 'sketch'
                    ? 'bg-[#003d9b] text-white shadow-xs'
                    : 'text-[#434654] hover:text-[#181c1f]'
                }`}
                title="Display technical CAD SVG vector sketch previews"
              >
                <DraftingCompass className="w-3.5 h-3.5" />
                <span>Vector Sketch</span>
              </button>

              <button
                onClick={() => setDisplayMode('photo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  displayMode === 'photo'
                    ? 'bg-[#003d9b] text-white shadow-xs'
                    : 'text-[#434654] hover:text-[#181c1f]'
                }`}
                title="Display catalog photo previews"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photo View</span>
              </button>
            </div>

            <button
              onClick={openNewModal}
              className="px-3.5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded-lg p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
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

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto py-0.5">
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
          {filteredItems.map((item, idx) => {
            const isImageFailed = failedImages[item.imageUrl];
            const useSketch = displayMode === 'sketch' || isImageFailed;

            return (
              <div
                key={`${item.type}-${item.defaultName}-${idx}`}
                className="bg-[#ffffff] border border-[#c3c6d6] hover:border-[#003d9b] rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Equipment Vector Sketch or Photo Frame */}
                <div className="relative w-full h-48 bg-[#0f172a] overflow-hidden">
                  {useSketch ? (
                    <EquipmentSketchVector type={item.type} />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.defaultName}
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(item.imageUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Category Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 text-[#003d9b] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                    {item.category}
                  </span>

                  {/* Card Top Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-black/60 hover:bg-[#003d9b] text-white p-1.5 rounded transition-colors"
                      title="Modify Catalog Reference"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedPhotoItem(item)}
                      className="bg-black/60 hover:bg-black text-white p-1.5 rounded transition-colors"
                      title="Expand Technical CAD Schematic"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-bold text-sm leading-snug drop-shadow-xs">
                      {item.defaultName}
                    </div>
                    <div className="text-xs text-white/85 font-mono mt-0.5">
                      {item.defaultManufacturer} • {item.defaultModel}
                    </div>
                  </div>
                </div>

                {/* Card Body Specs */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-[#434654] leading-relaxed line-clamp-2">
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
                    onClick={() => handleAddComponentClick(item)}
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
          );
        })}
        </div>
      </div>

      {/* High-Res Photo / Vector Sketch Preview Modal */}
      {selectedPhotoItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhotoItem(null)}
        >
          <div
            className="bg-[#ffffff] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-[#0f172a] overflow-hidden">
              {displayMode === 'sketch' || failedImages[selectedPhotoItem.imageUrl] ? (
                <EquipmentSketchVector type={selectedPhotoItem.type} />
              ) : (
                <img
                  src={selectedPhotoItem.imageUrl}
                  alt={selectedPhotoItem.defaultName}
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(selectedPhotoItem.imageUrl)}
                  className="w-full h-full object-contain"
                />
              )}
              <button
                onClick={() => setSelectedPhotoItem(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full z-10"
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
                    openEditModal(selectedPhotoItem);
                    setSelectedPhotoItem(null);
                  }}
                  className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] font-semibold text-xs rounded-lg"
                >
                  Edit Reference Catalog
                </button>
                <button
                  onClick={() => {
                    handleAddComponentClick(selectedPhotoItem);
                    setSelectedPhotoItem(null);
                  }}
                  className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  {t('addComponent')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Item Editor / New Entry Modal */}
      {(editingItem || isAddingNew) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-[#ffffff] rounded-xl max-w-xl w-full border border-[#c3c6d6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#ebeef2] bg-[#f1f4f8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#003d9b]" />
                <span className="font-bold text-sm text-[#181c1f] uppercase tracking-wider">
                  {isAddingNew ? 'Add New Reference Catalog Item' : `Modify Reference Catalog: ${editingItem?.defaultName}`}
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
                className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#434654] mb-1">
                    Equipment Preset Type:
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EquipmentType)}
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] font-semibold focus:outline-none focus:border-[#003d9b]"
                  >
                    {EQUIPMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434654] mb-1">
                    Equipment Category:
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Generation, Storage, Protection..."
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] font-semibold focus:outline-none focus:border-[#003d9b]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#434654] mb-1">
                  Reference Label Name:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. PV Array (Roof South)"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    Capacity Rating:
                  </label>
                  <input
                    type="text"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="e.g. 22.5 kWp"
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    Voltage Class:
                  </label>
                  <input
                    type="text"
                    value={formVoltage}
                    onChange={(e) => setFormVoltage(e.target.value)}
                    placeholder="e.g. 600 VDC"
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    Manufacturer:
                  </label>
                  <input
                    type="text"
                    value={formManufacturer}
                    onChange={(e) => setFormManufacturer(e.target.value)}
                    placeholder="e.g. SunPower"
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                    Model Number:
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. Maxeon 3"
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Catalog Description & Features:
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe physical features, mounting, or standard configuration..."
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              {/* Reference Photo URL & File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#434654]">
                    Reference Photo URL / Local Upload:
                  </label>
                  <label className="cursor-pointer text-[10px] text-[#003d9b] font-bold bg-[#dae2ff] hover:bg-[#b9cde5] px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleCatalogFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://... or upload local image"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />

                {/* Image Guidelines */}
                <div className="p-2 bg-[#f1f4f8] border border-[#c3c6d6] rounded text-[10px] text-[#434654] space-y-0.5">
                  <span className="font-bold text-[#003d9b] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Image Guidelines for Web Performance & UX:</span>
                  </span>
                  <ul className="list-disc list-inside text-[9.5px] space-y-0.5 pl-0.5">
                    <li><strong>Formats:</strong> JPG, PNG, WebP, SVG</li>
                    <li><strong>Size Limit:</strong> &lt; 2 MB for smooth canvas rendering</li>
                    <li><strong>Aspect Ratio:</strong> 1:1 Square or 4:3 Standard Ratio</li>
                  </ul>
                </div>

                {formImageUrl && (
                  <div className="flex items-center gap-2 p-2 bg-[#ffffff] border border-[#c3c6d6] rounded">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded border border-[#c3c6d6]"
                    />
                    <div className="text-[10px] text-[#181c1f]">
                      <span className="font-bold block text-[#003d9b]">Photo Preview Loaded</span>
                      <span className="text-[#737685]">Ready to be set in catalog & BIM diagram</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Spec Sheet PDF Link (Optional):
                </label>
                <input
                  type="text"
                  value={formSpecSheetUrl}
                  onChange={(e) => setFormSpecSheetUrl(e.target.value)}
                  placeholder="https://example.com/specs/document.pdf"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebeef2]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsAddingNew(false);
                  }}
                  className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Catalog Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
