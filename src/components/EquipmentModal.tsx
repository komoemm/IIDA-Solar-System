import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Tag, FolderPlus, Sparkles, Check, Edit3 } from 'lucide-react';
import { EquipmentType, EquipmentLibraryItem } from '../types';
import { LIBRARY_ITEMS, EQUIPMENT_IMAGES } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    type: EquipmentType,
    name: string,
    capacity: string,
    voltage: string,
    manufacturer: string,
    model: string,
    location: string,
    imageUrl: string,
    category?: string
  ) => void;
  existingCategories?: string[];
  catalogItems?: EquipmentLibraryItem[];
}

const DEFAULT_CATEGORIES = [
  'Generation',
  'Conversion',
  'Storage',
  'Distribution',
  'Loads',
  'Protection',
  'Metering',
  'EV Infrastructure',
];

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingCategories = [],
  catalogItems = LIBRARY_ITEMS,
}) => {
  const [selectedType, setSelectedType] = useState<EquipmentType>('pv_array');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Generation');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('Utility Area');
  const [imageUrl, setImageUrl] = useState('');
  const { language, t } = useLanguage();

  // Combine default, preset, and existing categories into a clean unique list
  const allCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories,
      ...customCategories,
      ...catalogItems.map((item) => item.category),
    ])
  );

  useEffect(() => {
    if (isOpen) {
      // Default to first preset
      const preset = catalogItems.find((item) => item.type === 'pv_array') || catalogItems[0];
      if (preset) {
        setSelectedType(preset.type);
        setName(preset.defaultName);
        setCategory(preset.category);
        setCapacity(preset.defaultCapacity);
        setVoltage(preset.defaultVoltage);
        setManufacturer(preset.defaultManufacturer);
        setModel(preset.defaultModel);
        setImageUrl(preset.imageUrl || EQUIPMENT_IMAGES[preset.type]);
      }
    }
  }, [isOpen, catalogItems]);

  if (!isOpen) return null;

  const handleTypeSelect = (item: EquipmentLibraryItem) => {
    setSelectedType(item.type);
    setName(item.defaultName);
    setCategory(item.category);
    setCapacity(item.defaultCapacity);
    setVoltage(item.defaultVoltage);
    setManufacturer(item.defaultManufacturer);
    setModel(item.defaultModel);
    setImageUrl(item.imageUrl || EQUIPMENT_IMAGES[item.type]);
  };

  const handleCreateNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
      setCategory(trimmed);
      setNewCategoryInput('');
      setIsAddingNewCategory(false);
    } else if (trimmed) {
      setCategory(trimmed);
      setNewCategoryInput('');
      setIsAddingNewCategory(false);
    }
  };

  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          setImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(
      selectedType,
      name.trim() || 'New Equipment',
      capacity.trim() || '10 kW',
      voltage.trim() || '240 VAC',
      manufacturer.trim() || 'Generic',
      model.trim() || 'Model-1',
      location.trim() || 'Utility Area',
      imageUrl || EQUIPMENT_IMAGES[selectedType],
      category || 'Generation'
    );
    onClose();
  };

  // Label Suggestion Chips for quick auto-fill
  const labelSuggestions: Record<EquipmentType, string[]> = {
    pv_array: ['PV Array (Roof South)', 'PV Array (Ground Mount)', 'Roof East String 1', 'Carport Solar Canopy'],
    combiner_box: ['DC Combiner Box 1', 'High-Voltage DC Combiner', 'String Combiner Enclosure'],
    inverter: ['Hybrid Inverter Unit 1', 'Main Solar Inverter', 'Backup Hybrid Inverter 2'],
    battery: ['BESS Battery Storage Rack', 'LFP Energy Storage Cabinet', 'Essential Battery Bank'],
    grid: ['Utility Grid Connection', 'Bi-Directional Net Meter', 'Service Entrance PCC'],
    generator: ['Backup Diesel Generator', 'Standby LP Generator 20kW', 'Auto-Start Emergency Genset'],
    ac_panel: ['Main Distribution Panel (MDP)', 'AC Service Entrance Panel', 'Solar Breaker Subpanel'],
    inverter_load_panel: ['Inverter Critical Load Panel', 'UPS Essential Load Subpanel', 'Emergency Circuits'],
    non_inverter_load_panel: ['Non-Inverter Heavy Load Panel', 'HVAC & EV Charger Panel', 'Non-Essential Sub'],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-[#ffffff] rounded-xl max-w-2xl w-full border border-[#c3c6d6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#ebeef2] bg-[#f1f4f8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#003d9b]" />
            <span className="font-bold text-sm text-[#181c1f] uppercase tracking-wider">
              {t('addEquipmentTitle')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: Preset Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434654] mb-2">
              1. Select Preset Equipment
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {catalogItems.map((item, idx) => (
                <button
                  type="button"
                  key={`${item.type}-${item.defaultName}-${idx}`}
                  onClick={() => handleTypeSelect(item)}
                  className={`p-2 rounded-lg text-left border text-xs font-semibold transition-all relative ${
                    selectedType === item.type
                      ? 'bg-[#dae2ff] border-[#003d9b] text-[#003d9b] ring-1 ring-[#003d9b]'
                      : 'bg-[#f8fafc] border-[#c3c6d6] hover:bg-[#ebeef2] text-[#181c1f]'
                  }`}
                >
                  <div className="truncate pr-4">{item.defaultName}</div>
                  <div className="text-[10px] font-normal text-[#737685] uppercase tracking-wide mt-0.5">
                    {item.category}
                  </div>
                  {selectedType === item.type && (
                    <Check className="w-3.5 h-3.5 absolute top-2 right-2 text-[#003d9b]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Equipment Category Management */}
          <div className="bg-[#f8fafc] border border-[#c3c6d6] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#181c1f] flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-[#003d9b]" />
                2. Equipment Category (Modify or Add New)
              </label>

              {!isAddingNewCategory ? (
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(true)}
                  className="text-[11px] font-bold text-[#003d9b] hover:text-[#0052cc] flex items-center gap-1 bg-[#dae2ff] px-2 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add New Category</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(false)}
                  className="text-[11px] text-[#737685] hover:text-[#181c1f]"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Inline Custom Category Creator */}
            {isAddingNewCategory && (
              <div className="flex gap-2 items-center bg-[#ffffff] p-2 rounded border border-[#003d9b]">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Protection, Metering, HVAC..."
                  className="flex-1 bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-3 py-1 bg-[#003d9b] text-white font-bold text-xs rounded hover:bg-[#0052cc]"
                >
                  Save Category
                </button>
              </div>
            )}

            {/* Category Selection Dropdown & Quick Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#737685] mb-1">
                  Active Category Dropdown:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] font-semibold focus:outline-none focus:border-[#003d9b]"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#737685] mb-1">
                  Custom Category Text Override:
                </label>
                <div className="relative">
                  <Edit3 className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#737685]" />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Type category..."
                    className="w-full bg-[#ffffff] border border-[#c3c6d6] rounded pl-8 pr-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Category Selector Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                    category === cat
                      ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-2xs'
                      : 'bg-[#ffffff] text-[#434654] border-[#c3c6d6] hover:bg-[#ebeef2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Equipment Label Name & Field Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#181c1f] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#003d9b]" />
                  3. Equipment Label Name
                </label>
                <span className="text-[10px] text-[#737685]">Required for BIM Schematic</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PV Array East Roof"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-2 text-sm font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b] focus:bg-white transition-colors"
                required
              />

              {/* Tag Suggestions for Label Name */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[10px] text-[#737685] self-center mr-1">Quick Name:</span>
                {(labelSuggestions[selectedType] || []).map((sugg) => (
                  <button
                    type="button"
                    key={sugg}
                    onClick={() => setName(sugg)}
                    className="text-[10px] bg-[#ebeef2] hover:bg-[#dae2ff] text-[#003d9b] font-medium px-2 py-0.5 rounded transition-colors"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  {t('capacityRating')}
                </label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 15.0 kW AC"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  {t('voltageClass')}
                </label>
                <input
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="e.g. 120/240 VAC"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  {t('location')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Roof / Utility Room"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  {t('manufacturer')}
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Sol-Ark"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  {t('modelNumber')}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 15K-2P-N"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#434654]">
                    {t('refPhotoUrl')}
                  </label>
                  <label className="cursor-pointer text-[10px] text-[#003d9b] font-bold bg-[#dae2ff] hover:bg-[#b9cde5] px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleModalFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or upload local image file"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />

                {/* Sample Info & Specs Box */}
                <div className="mt-2 p-2 bg-[#f1f4f8] border border-[#c3c6d6] rounded text-[10px] text-[#434654] space-y-1">
                  <div className="font-bold text-[#003d9b] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Image Specs for Best Performance & UX:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-0.5 text-[9.5px]">
                    <li><strong>Formats:</strong> JPG, PNG, WebP, SVG</li>
                    <li><strong>File Size:</strong> &lt; 2 MB (Optimized for smooth web canvas rendering)</li>
                    <li><strong>Aspect Ratio:</strong> 1:1 Square (e.g., 400x400) or 4:3 (e.g., 800x600)</li>
                  </ul>
                </div>

                {/* Live Image Thumbnail Preview */}
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 bg-[#ffffff] border border-[#c3c6d6] rounded">
                    <div className="w-12 h-12 rounded bg-[#ebeef2] overflow-hidden shrink-0 border border-[#c3c6d6]">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-[#181c1f] min-w-0">
                      <span className="font-bold block text-[#003d9b]">Reference Photo Preview</span>
                      <span className="text-[#737685] truncate block">Image set for BIM diagram & gallery</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#ebeef2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] font-semibold text-xs rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addComponent')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
