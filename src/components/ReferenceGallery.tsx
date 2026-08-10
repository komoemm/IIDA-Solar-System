import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Plus,
  Maximize2,
  X,
  Edit3,
  FolderPlus,
  Sparkles,
  Check,
  DraftingCompass,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MapPin,
  Building2,
  Zap,
} from 'lucide-react';
import { LIBRARY_ITEMS, EQUIPMENT_IMAGES } from '../data/presetData';
import { EquipmentType, EquipmentLibraryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EquipmentSketchVector } from './EquipmentSketchVector';
import { validateQuoteRequest, QuoteFormData } from '../data/solarData';

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

  // Quote request state
  const [quoteItem, setQuoteItem] = useState<EquipmentLibraryItem | null>(null);
  const [quoteName, setQuoteName] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quotePower, setQuotePower] = useState<number | string>(12);
  const [quoteLocation, setQuoteLocation] = useState('Yangon, Myanmar');
  const [quoteProjectScale, setQuoteProjectScale] = useState<'residential' | 'commercial' | 'industrial' | 'utility'>('commercial');
  const [quoteQty, setQuoteQty] = useState(1);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});

  const { language, t } = useLanguage();

  // Escape key handler for all modals in ReferenceGallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quoteItem) {
          setQuoteItem(null);
          setQuoteSubmitted(false);
        } else if (selectedPhotoItem) {
          setSelectedPhotoItem(null);
        } else if (editingItem || isAddingNew) {
          setEditingItem(null);
          setIsAddingNew(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quoteItem, selectedPhotoItem, editingItem, isAddingNew]);

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
              Equipment CAD Vector Sketch & Technical Catalog Gallery
            </h1>
            <p className="text-xs text-[#434654] mt-0.5">
              Verified CAD vector schematics, electrical ratings, and technical documentation sheets for Solar & Hybrid Energy systems.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Permanent Vector CAD Schematic Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dae2ff] text-[#003d9b] rounded-lg text-xs font-bold border border-[#b9cde5] shadow-2xs">
              <DraftingCompass className="w-4 h-4 text-[#003d9b]" />
              <span>100% Vector CAD Schematics</span>
            </div>

            <button
              onClick={openNewModal}
              className="px-3.5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded-lg p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
          <div className="relative w-full md:w-80">
            <label htmlFor="catalog-search-input" className="sr-only">
              Search equipment catalog by name, model, or manufacturer
            </label>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#525666]" aria-hidden="true" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchTerm}
              aria-label="Search equipment catalog"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded pl-9 pr-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
            />
          </div>

          <div role="tablist" aria-label="Catalog Categories" className="flex gap-1.5 overflow-x-auto w-full md:w-auto py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                aria-label={`Filter catalog by category ${cat === 'All' ? 'All Equipment' : cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[#003d9b] ${
                  activeCategory === cat
                    ? 'bg-[#003d9b] text-white'
                    : 'bg-[#f1f4f8] text-[#181c1f] hover:bg-[#e0e3e7]'
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
            return (
              <article
                key={`${item.type}-${item.defaultName}-${idx}`}
                className="bg-[#ffffff] border border-[#c3c6d6] hover:border-[#003d9b] rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Equipment CAD Vector Sketch Frame */}
                <div className="relative w-full h-48 bg-[#0f172a] overflow-hidden">
                  <EquipmentSketchVector type={item.type} />
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
                    type="button"
                    onClick={() => handleAddComponentClick(item)}
                    aria-label={`Add ${item.defaultName} to active diagram canvas`}
                    className="flex-1 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addComponent')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuoteItem(item);
                      setQuoteQty(1);
                      setQuoteSubmitted(false);
                    }}
                    aria-label={`Request official price quote for ${item.defaultName}`}
                    title="Request Official Equipment Price Quote"
                    className="py-1.5 px-2 bg-[#dae2ff] hover:bg-[#b9cde5] text-[#003d9b] font-bold text-xs rounded transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Quote</span>
                  </button>

                  {item.specSheetUrl && (
                    <a
                      href={item.specSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open datasheet spec PDF for ${item.defaultName} in new tab`}
                      className="p-1.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#181c1f] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                      title="Open Spec Sheet PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            className="bg-[#ffffff] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-[#0f172a] overflow-hidden">
              <EquipmentSketchVector type={selectedPhotoItem.type} />
              <button
                type="button"
                onClick={() => setSelectedPhotoItem(null)}
                aria-label="Close preview modal"
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full z-10 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#003d9b] bg-[#dae2ff] px-2 py-0.5 rounded">
                  {selectedPhotoItem.category}
                </span>
                <h3 id="preview-modal-title" className="text-lg font-bold text-[#181c1f] mt-1">
                  {selectedPhotoItem.defaultName}
                </h3>
                <p className="text-xs text-[#525666] font-mono">
                  {selectedPhotoItem.defaultManufacturer} — {selectedPhotoItem.defaultModel}
                </p>
              </div>

              <p className="text-xs text-[#181c1f] leading-relaxed">
                {selectedPhotoItem.description}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ebeef2]">
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(selectedPhotoItem);
                    setSelectedPhotoItem(null);
                  }}
                  className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#181c1f] font-semibold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                >
                  Edit Reference Catalog
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteItem(selectedPhotoItem);
                    setQuoteQty(1);
                    setQuoteSubmitted(false);
                    setSelectedPhotoItem(null);
                  }}
                  aria-label={`Request official price quote for ${selectedPhotoItem.defaultName}`}
                  className="px-4 py-2 bg-[#dae2ff] hover:bg-[#b9cde5] text-[#003d9b] font-bold text-xs rounded-lg flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Official Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddComponentClick(selectedPhotoItem);
                    setSelectedPhotoItem(null);
                  }}
                  className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                >
                  {t('addComponent')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Equipment Quote Request Modal */}
      {quoteItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
            className="bg-[#ffffff] rounded-xl max-w-lg w-full border border-[#c3c6d6] shadow-2xl overflow-hidden text-[#181c1f]"
          >
            <div className="px-5 py-4 border-b border-[#ebeef2] bg-[#f1f4f8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#003d9b]" />
                <h2 id="quote-modal-title" className="font-bold text-sm text-[#181c1f]">
                  Request Official Equipment Quote
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuoteItem(null);
                  setQuoteSubmitted(false);
                }}
                aria-label="Close quote modal"
                className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] focus:outline-none focus:ring-2 focus:ring-[#003d9b] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181c1f]">Official Quotation Request Received!</h3>
                  <p className="text-xs text-[#525666] mt-1 leading-relaxed max-w-md mx-auto">
                    Thank you, <strong className="text-[#181c1f]">{quoteName}</strong>! Our engineering sales team in Yangon will email a detailed proposal for{' '}
                    <strong className="text-[#003d9b]">{quoteItem.defaultName}</strong> ({quoteQty} units) to{' '}
                    <strong className="text-[#181c1f]">{quoteEmail}</strong> within 1 business day.
                  </p>
                </div>

                {/* Summarized Quote Ticket */}
                <div className="bg-[#f8fafc] border border-[#c3c6d6] rounded-lg p-3 text-left text-xs space-y-1.5 text-[#181c1f] font-sans">
                  <div className="flex justify-between border-b border-[#ebeef2] pb-1 font-mono text-[11px]">
                    <span className="text-[#525666]">Contact Phone:</span>
                    <span className="font-bold">{quotePhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ebeef2] pb-1 font-mono text-[11px]">
                    <span className="text-[#525666]">Target Power Capacity:</span>
                    <span className="font-bold text-[#003d9b]">{quotePower} kW</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ebeef2] pb-1 font-mono text-[11px]">
                    <span className="text-[#525666]">Site Location / Region:</span>
                    <span className="font-bold">{quoteLocation}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#525666]">Project Scale:</span>
                    <span className="font-bold capitalize">{quoteProjectScale}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuoteItem(null);
                    setQuoteSubmitted(false);
                    setQuoteErrors({});
                  }}
                  className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const valResult = validateQuoteRequest({
                    fullName: quoteName,
                    email: quoteEmail,
                    phone: quotePhone,
                    powerRequirementKw: quotePower,
                    locationRegion: quoteLocation,
                    projectScale: quoteProjectScale,
                    notes: quoteNotes,
                    estimatedQuantity: quoteQty,
                  });

                  if (!valResult.isValid) {
                    setQuoteErrors(valResult.errors);
                    return;
                  }

                  // Sanitized submit success
                  setQuoteErrors({});
                  setQuoteName(valResult.sanitizedData.fullName);
                  setQuoteEmail(valResult.sanitizedData.email);
                  setQuotePhone(valResult.sanitizedData.phone);
                  setQuotePower(valResult.sanitizedData.powerRequirementKw);
                  setQuoteLocation(valResult.sanitizedData.locationRegion);
                  setQuoteNotes(valResult.sanitizedData.notes || '');
                  setQuoteSubmitted(true);
                }}
                className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto"
              >
                <div className="p-3 bg-[#f8fafc] border border-[#c3c6d6] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#003d9b] bg-[#dae2ff] px-2 py-0.5 rounded">
                      {quoteItem.category}
                    </span>
                    <h4 className="font-bold text-xs text-[#181c1f] mt-1">{quoteItem.defaultName}</h4>
                    <p className="text-[11px] text-[#525666] font-mono">
                      {quoteItem.defaultManufacturer} • {quoteItem.defaultModel} ({quoteItem.defaultCapacity})
                    </p>
                  </div>
                </div>

                {/* Validation Banner if Errors Exist */}
                {Object.keys(quoteErrors).length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-[11px] uppercase tracking-wider text-red-800">
                        Please review required quotation fields:
                      </strong>
                      <ul className="list-disc list-inside mt-0.5 text-[11px] space-y-0.5">
                        {Object.values(quoteErrors).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="quote-user-name" className="block text-xs font-bold text-[#181c1f] mb-1">
                      Contact Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="quote-user-name"
                      type="text"
                      value={quoteName}
                      aria-label="Contact Full Name"
                      onChange={(e) => {
                        setQuoteName(e.target.value);
                        if (quoteErrors.fullName) {
                          setQuoteErrors((prev) => ({ ...prev, fullName: '' }));
                        }
                      }}
                      placeholder="e.g. Mg Mg Win"
                      className={`w-full bg-[#f8fafc] border ${
                        quoteErrors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d6]'
                      } rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]`}
                    />
                    {quoteErrors.fullName && (
                      <span className="text-[10px] font-semibold text-red-600 mt-0.5 block">
                        {quoteErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Work Email */}
                  <div>
                    <label htmlFor="quote-user-email" className="block text-xs font-bold text-[#181c1f] mb-1">
                      Work Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="quote-user-email"
                      type="email"
                      value={quoteEmail}
                      aria-label="Work Email Address"
                      onChange={(e) => {
                        setQuoteEmail(e.target.value);
                        if (quoteErrors.email) {
                          setQuoteErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="e.g. mgmg@energy.com.mm"
                      className={`w-full bg-[#f8fafc] border ${
                        quoteErrors.email ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d6]'
                      } rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]`}
                    />
                    {quoteErrors.email && (
                      <span className="text-[10px] font-semibold text-red-600 mt-0.5 block">
                        {quoteErrors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="quote-user-phone" className="block text-xs font-bold text-[#181c1f] mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#003d9b]" />
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="quote-user-phone"
                      type="tel"
                      value={quotePhone}
                      aria-label="Phone Number"
                      onChange={(e) => {
                        setQuotePhone(e.target.value);
                        if (quoteErrors.phone) {
                          setQuoteErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="e.g. 09123456789 or +959..."
                      className={`w-full bg-[#f8fafc] border ${
                        quoteErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d6]'
                      } rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]`}
                    />
                    {quoteErrors.phone && (
                      <span className="text-[10px] font-semibold text-red-600 mt-0.5 block">
                        {quoteErrors.phone}
                      </span>
                    )}
                  </div>

                  {/* Power Requirement (kW) */}
                  <div>
                    <label htmlFor="quote-power-kw" className="block text-xs font-bold text-[#181c1f] mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      Power Requirement (kW) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="quote-power-kw"
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={quotePower}
                      aria-label="Power Requirement in kW"
                      onChange={(e) => {
                        setQuotePower(e.target.value);
                        if (quoteErrors.powerRequirementKw) {
                          setQuoteErrors((prev) => ({ ...prev, powerRequirementKw: '' }));
                        }
                      }}
                      placeholder="e.g. 12 kW"
                      className={`w-full bg-[#f8fafc] border ${
                        quoteErrors.powerRequirementKw ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d6]'
                      } rounded px-3 py-1.5 text-xs font-bold text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]`}
                    />
                    {quoteErrors.powerRequirementKw && (
                      <span className="text-[10px] font-semibold text-red-600 mt-0.5 block">
                        {quoteErrors.powerRequirementKw}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Site Location */}
                  <div>
                    <label htmlFor="quote-location" className="block text-xs font-bold text-[#181c1f] mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#003d9b]" />
                      Site Location / Region <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="quote-location"
                      type="text"
                      value={quoteLocation}
                      aria-label="Site Location or Region"
                      onChange={(e) => {
                        setQuoteLocation(e.target.value);
                        if (quoteErrors.locationRegion) {
                          setQuoteErrors((prev) => ({ ...prev, locationRegion: '' }));
                        }
                      }}
                      placeholder="e.g. Yangon, Mandalay, Taunggyi"
                      className={`w-full bg-[#f8fafc] border ${
                        quoteErrors.locationRegion ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d6]'
                      } rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]`}
                    />
                    {quoteErrors.locationRegion && (
                      <span className="text-[10px] font-semibold text-red-600 mt-0.5 block">
                        {quoteErrors.locationRegion}
                      </span>
                    )}
                  </div>

                  {/* Project Scale */}
                  <div>
                    <label htmlFor="quote-project-type" className="block text-xs font-bold text-[#181c1f] mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#003d9b]" />
                      Project Scale:
                    </label>
                    <select
                      id="quote-project-type"
                      value={quoteProjectScale}
                      aria-label="Project Scale"
                      onChange={(e) => setQuoteProjectScale(e.target.value as any)}
                      className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] font-semibold focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                    >
                      <option value="residential">Residential Microgrid</option>
                      <option value="commercial">Commercial C&amp;I System</option>
                      <option value="industrial">Industrial Factory / Plant</option>
                      <option value="utility">Utility Power Station</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quote-quantity" className="block text-xs font-bold text-[#181c1f] mb-1">
                      Estimated Units Quantity:
                    </label>
                    <input
                      id="quote-quantity"
                      type="number"
                      min="1"
                      max="1000"
                      value={quoteQty}
                      aria-label="Estimated Quantity"
                      onChange={(e) => setQuoteQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs font-bold text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-notes" className="block text-xs font-bold text-[#181c1f] mb-1">
                    Special Specifications / Delivery Notes:
                  </label>
                  <textarea
                    id="quote-notes"
                    value={quoteNotes}
                    aria-label="Special Specifications or Delivery Notes"
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    rows={2}
                    placeholder="Specify target delivery timeline, custom enclosure needs, or grid tie requirements..."
                    className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#ebeef2]">
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteItem(null);
                      setQuoteSubmitted(false);
                      setQuoteErrors({});
                    }}
                    className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#181c1f] font-semibold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Sanitized Quote Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Catalog Item Editor / New Entry Modal */}
      {(editingItem || isAddingNew) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-editor-title"
            className="bg-[#ffffff] rounded-xl max-w-xl w-full border border-[#c3c6d6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#ebeef2] bg-[#f1f4f8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#003d9b]" />
                <h2 id="catalog-editor-title" className="font-bold text-sm text-[#181c1f] uppercase tracking-wider">
                  {isAddingNew ? 'Add New Reference Catalog Item' : `Modify Reference Catalog: ${editingItem?.defaultName}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
                aria-label="Close catalog editor modal"
                className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] focus:outline-none focus:ring-2 focus:ring-[#003d9b] transition-colors"
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

              {/* CAD Vector Schematic Preview */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#434654]">
                  CAD Vector Schematic Preview:
                </label>
                <div className="w-full h-36 bg-[#0f172a] rounded-lg border border-[#c3c6d6] overflow-hidden relative shadow-inner">
                  <EquipmentSketchVector type={formType} />
                </div>
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
