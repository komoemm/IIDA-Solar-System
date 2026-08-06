import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Upload,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Tag,
  FileText,
  Sliders,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { EquipmentNode, EquipmentType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { OptimizedImage } from './OptimizedImage';

interface EditEquipmentModalProps {
  isOpen: boolean;
  node: EquipmentNode | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<EquipmentNode>) => void;
  onNavigateToCanvas?: (id: string) => void;
  existingCategories?: string[];
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

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  isOpen,
  node,
  onClose,
  onSave,
  onNavigateToCanvas,
  existingCategories = [],
}) => {
  const { t } = useLanguage();

  const [tagId, setTagId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<EquipmentNode['status']>('installed');
  const [imageUrl, setImageUrl] = useState('');
  const [specSheetUrl, setSpecSheetUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && node) {
      setTagId(node.id);
      setName(node.name || '');
      setCategory(node.category || 'Generation');
      setCapacity(node.capacity || '');
      setVoltage(node.voltage || '');
      setManufacturer(node.manufacturer || '');
      setModel(node.model || '');
      setLocation(node.location || '');
      setStatus(node.status || 'installed');
      setImageUrl(node.imageUrl || '');
      setSpecSheetUrl(node.specSheetUrl || '');
      setDescription(node.description || '');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, node, onClose]);

  if (!isOpen || !node) return null;

  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories, category].filter(Boolean))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(node.id, {
      id: tagId.trim() || node.id,
      name: name.trim() || node.name,
      category: category.trim() || 'Generation',
      capacity: capacity.trim(),
      voltage: voltage.trim(),
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      location: location.trim(),
      status,
      imageUrl: imageUrl.trim(),
      specSheetUrl: specSheetUrl.trim(),
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-equipment-modal-title"
        className="bg-[#ffffff] rounded-xl max-w-3xl w-full border border-[#c3c6d6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#181c1f]"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#c3c6d6] bg-[#f1f4f8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dae2ff] text-[#003d9b] flex items-center justify-center font-bold font-mono text-xs border border-[#b9cde5]">
              {node.id}
            </div>
            <div>
              <h2 id="edit-equipment-modal-title" className="font-bold text-sm text-[#181c1f] leading-snug">
                Component Specifications &amp; Equipment Properties
              </h2>
              <p className="text-[11px] text-[#525666]">
                Modify inventory parameters, technical ratings, and datasheet documents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCanvas && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToCanvas(node.id);
                }}
                className="px-2.5 py-1 bg-[#dae2ff] hover:bg-[#b9cde5] text-[#003d9b] rounded text-xs font-bold transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
                title="Locate and open this item on the Diagram Canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View on Canvas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Edit Equipment modal"
              className="text-[#434654] hover:text-[#181c1f] p-1.5 rounded hover:bg-[#e0e3e7] focus:outline-none focus:ring-2 focus:ring-[#003d9b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Summary Card Header */}
          <div className="p-3 bg-[#f8fafc] border border-[#c3c6d6] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded bg-[#ebeef2] border border-[#c3c6d6] overflow-hidden shrink-0">
                <OptimizedImage
                  src={imageUrl || node.imageUrl}
                  alt={node.name}
                  width={100}
                  height={100}
                  equipmentType={node.type}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737685] block">
                  {node.type.replace('_', ' ')}
                </span>
                <span className="text-sm font-bold text-[#181c1f] block">{name || node.name}</span>
                <span className="text-xs font-mono text-[#003d9b]">
                  {manufacturer} {model} &bull; {capacity}
                </span>
              </div>
            </div>

            {/* Status Selector Badge */}
            <div className="flex flex-wrap items-center gap-1">
              {(['installed', 'pending', 'planned', 'maintenance'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border transition-all ${
                    status === s
                      ? s === 'installed'
                        ? 'bg-[#ecfdf5] text-[#059669] border-[#059669]'
                        : s === 'pending'
                        ? 'bg-[#fffbeb] text-[#d97706] border-[#d97706]'
                        : 'bg-[#f1f5f9] text-[#475569] border-[#475569]'
                      : 'bg-[#ffffff] text-[#737685] border-[#c3c6d6] hover:bg-[#f1f4f8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Identification & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#434654] mb-1">
                Equipment Tag / Ref ID
              </label>
              <input
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. PV-01, INV-01"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-[#003d9b] focus:outline-none focus:border-[#003d9b]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#434654] mb-1">
                Equipment Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PV Array A (South Roof)"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                required
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#434654] mb-1">
              System Category Classification
            </label>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Custom category"
                className="w-1/2 bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>

          {/* Section 2: Technical & Electrical Specifications */}
          <div className="border-t border-[#ebeef2] pt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003d9b] mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Electrical &amp; Physical Ratings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. SunPower, Sol-Ark"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Model Number
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Maxeon 3 400W"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Capacity Rating
                </label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 22.5 kWp"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#003d9b] focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                  Voltage Class
                </label>
                <input
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="e.g. 580 VDC"
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location & Media */}
          <div className="border-t border-[#ebeef2] pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#434654] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#003d9b]" />
                <span>Physical Installation Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Roof - South Pitch (20° Tilt)"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#434654] mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#003d9b]" />
                <span>Spec Sheet / Datasheet URL (PDF)</span>
              </label>
              <input
                type="text"
                value={specSheetUrl}
                onChange={(e) => setSpecSheetUrl(e.target.value)}
                placeholder="https://... PDF documentation link"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>

          {/* Photo URL & Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#434654]">
                Equipment Photo Image URL or Upload File
              </label>
              <label className="cursor-pointer text-[10px] text-[#003d9b] font-bold bg-[#dae2ff] hover:bg-[#b9cde5] px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          {/* Section 4: Engineering Specification Notes */}
          <div className="border-t border-[#ebeef2] pt-3">
            <label className="block text-xs font-bold text-[#434654] mb-1">
              Component Specification Notes &amp; Installation Instructions
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Specify string details, circuit breaker sizes, conduit specs, warranty terms, or code compliance comments..."
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg p-2.5 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b] leading-relaxed resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebeef2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] font-semibold text-xs rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Component Specifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
