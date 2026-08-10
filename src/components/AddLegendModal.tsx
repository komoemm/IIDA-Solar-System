import React, { useState } from 'react';
import { X, Plus, Cable, Check } from 'lucide-react';
import { CustomLegendType } from '../types';

interface AddLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLegend: (legend: CustomLegendType) => void;
}

const PRESET_COLORS = [
  { name: 'Blue (DC)', hex: '#0052cc' },
  { name: 'Slate (AC)', hex: '#334155' },
  { name: 'Orange (Comms)', hex: '#ea580c' },
  { name: 'Green (Ground)', hex: '#16a34a' },
  { name: 'Purple (Control)', hex: '#9333ea' },
  { name: 'Red (High Volt)', hex: '#dc2626' },
  { name: 'Cyan (Signal)', hex: '#0284c7' },
  { name: 'Amber (Auxiliary)', hex: '#d97706' },
];

export const AddLegendModal: React.FC<AddLegendModalProps> = ({
  isOpen,
  onClose,
  onAddLegend,
}) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#9333ea');
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const modalNode = modalRef.current;
      if (modalNode) {
        const focusables = modalNode.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusables = Array.from<HTMLElement>(
            modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.hasAttribute('disabled'));

          if (focusables.length === 0) return;

          const firstElement = focusables[0] as HTMLElement;
          const lastElement = focusables[focusables.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const id = `custom_${Date.now()}`;
    const categoryKey = label.toLowerCase().replace(/[^a-z0-9]/g, '_');

    onAddLegend({
      id,
      label: label.trim(),
      categoryKey,
      color,
      style,
      isCustom: true,
    });

    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-legend-modal-title"
        className="bg-[#ffffff] border border-[#c3c6d6] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-[#181c1f]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#c3c6d6] bg-[#f1f4f8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-[#003d9b]" />
            <h3 id="add-legend-modal-title" className="font-bold text-sm text-[#181c1f]">
              Add Custom Project Line Type
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] focus:outline-none focus:ring-2 focus:ring-[#003d9b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#434654] block mb-1">
              Line Type Name / Description <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Neutral Conductor, Modbus RS485, Aux 12V DC"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded-lg px-3 py-2 text-xs font-medium text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#434654] block mb-1.5">
              Select Stroke Color
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`p-2 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    color === c.hex
                      ? 'border-[#003d9b] bg-[#dae2ff] text-[#003d9b] font-bold ring-1 ring-[#003d9b]'
                      : 'border-[#c3c6d6] bg-[#f8fafc] text-[#434654] hover:bg-[#ebeef2]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  {color === c.hex && <Check className="w-3 h-3 text-[#003d9b]" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#737685]">Custom Color Hex:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#c3c6d6] cursor-pointer"
              />
              <span className="font-mono text-xs text-[#181c1f] uppercase font-bold">{color}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#434654] block mb-1.5">
              Line Style Pattern
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'dashed', 'dotted'] as const).map((pattern) => (
                <button
                  type="button"
                  key={pattern}
                  onClick={() => setStyle(pattern)}
                  className={`py-2 px-3 rounded-md border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1.5 ${
                    style === pattern
                      ? 'border-[#003d9b] bg-[#dae2ff] text-[#003d9b]'
                      : 'border-[#c3c6d6] bg-[#f8fafc] text-[#434654] hover:bg-[#ebeef2]'
                  }`}
                >
                  <div className="w-full h-1 flex items-center justify-center">
                    <div
                      className="w-full"
                      style={{
                        height: '2px',
                        backgroundColor: color,
                        borderStyle: pattern === 'solid' ? 'none' : pattern,
                        borderWidth: pattern !== 'solid' ? '1px 0 0 0' : '0',
                        borderColor: color,
                      }}
                    />
                  </div>
                  <span>{pattern}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="p-3 bg-[#f8fafc] border border-[#c3c6d6] rounded-lg">
            <span className="text-[10px] font-bold uppercase text-[#737685] block mb-1">
              Live Connection Preview
            </span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-8 flex items-center justify-center bg-white border border-[#e0e3e7] rounded px-3">
                <svg className="w-full h-4">
                  <line
                    x1="0"
                    y1="8"
                    x2="100%"
                    y2="8"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={
                      style === 'dashed' ? '6 4' : style === 'dotted' ? '2 3' : 'none'
                    }
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#181c1f] truncate">
                {label || 'Sample Line'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebeef2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#434654] hover:bg-[#f1f4f8] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#002d73] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Connection Legend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
