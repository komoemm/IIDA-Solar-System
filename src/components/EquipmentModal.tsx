import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, Upload } from 'lucide-react';
import { EquipmentType } from '../types';
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
    imageUrl: string
  ) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [selectedType, setSelectedType] = useState<EquipmentType>('pv_array');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('Utility Area');
  const [imageUrl, setImageUrl] = useState('');
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const handleTypeSelect = (type: EquipmentType) => {
    setSelectedType(type);
    const preset = LIBRARY_ITEMS.find((item) => item.type === type);
    if (preset) {
      setName(preset.defaultName);
      setCapacity(preset.defaultCapacity);
      setVoltage(preset.defaultVoltage);
      setManufacturer(preset.defaultManufacturer);
      setModel(preset.defaultModel);
      setImageUrl(preset.imageUrl || EQUIPMENT_IMAGES[type]);
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
      name || 'New Equipment',
      capacity || '10 kW',
      voltage || '240 VAC',
      manufacturer || 'Generic',
      model || 'Model-1',
      location || 'Utility Area',
      imageUrl || EQUIPMENT_IMAGES[selectedType]
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#ffffff] rounded-lg max-w-xl w-full border border-[#c3c6d6] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#ebeef2] bg-[#f1f4f8] flex items-center justify-between">
          <span className="font-bold text-sm text-[#181c1f] uppercase tracking-wider">
            {t('addEquipmentTitle')}
          </span>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select Equipment Type Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434654] mb-2">
              {t('selectCategory')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LIBRARY_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleTypeSelect(item.type)}
                  className={`p-2 rounded text-left border text-xs font-semibold transition-all ${
                    selectedType === item.type
                      ? 'bg-[#dae2ff] border-[#003d9b] text-[#003d9b]'
                      : 'bg-[#f8fafc] border-[#c3c6d6] hover:bg-[#ebeef2] text-[#181c1f]'
                  }`}
                >
                  <div className="truncate">{item.defaultName}</div>
                  <div className="text-[10px] font-normal text-[#737685] uppercase">
                    {item.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form Fields */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#434654] mb-1">
                {t('labelName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PV Array East Roof"
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                required
              />
            </div>

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
                  accept="image/*"
                  onChange={handleModalFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or paste image URL"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#ebeef2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#434654] font-semibold text-xs rounded"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs"
            >
              {t('addComponent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

