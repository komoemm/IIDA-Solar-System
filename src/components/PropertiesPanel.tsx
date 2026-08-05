import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ExternalLink,
  Info,
  Cable,
  Image as ImageIcon,
  Check,
  AlertCircle,
  MapPin,
  Tag,
  Zap,
  Upload,
} from 'lucide-react';
import { EquipmentNode, Connection, PortId } from '../types';
import { EQUIPMENT_IMAGES, EQUIPMENT_PORTS } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';

interface PropertiesPanelProps {
  node: EquipmentNode | null;
  connections: Connection[];
  allNodes: EquipmentNode[];
  onUpdateNode: (id: string, updates: Partial<EquipmentNode>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (connId: string) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  connections,
  allNodes,
  onUpdateNode,
  onDeleteNode,
  onDeleteConnection,
  onClose,
}) => {
  const [imageError, setImageError] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const { language, t } = useLanguage();

  useEffect(() => {
    if (node) {
      setImageError(false);
      setCustomImageUrl(node.imageUrl);
    }
  }, [node]);

  if (!node) {
    return (
      <aside className="w-80 bg-[#ffffff] border-l border-[#c3c6d6] flex flex-col h-full z-10 shrink-0 shadow-xs p-6 text-center justify-center items-center text-[#737685]">
        <Info className="w-8 h-8 mb-2 text-[#94a3b8]" />
        <span className="font-semibold text-sm text-[#181c1f]">{t('propTitle')}</span>
        <span className="text-xs text-[#737685] mt-1">
          {t('noSelection')}
        </span>
      </aside>
    );
  }

  // Filter connections involving this node
  const nodeConnections = connections.filter(
    (c) => c.fromNodeId === node.id || c.toNodeId === node.id
  );

  const handleImageUrlChange = (newUrl: string) => {
    setCustomImageUrl(newUrl);
    setImageError(false);
    onUpdateNode(node.id, { imageUrl: newUrl });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          handleImageUrlChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefaultImage = () => {
    const defaultUrl = EQUIPMENT_IMAGES[node.type];
    if (defaultUrl) {
      handleImageUrlChange(defaultUrl);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'installed': return t('statusInstalled');
      case 'pending': return t('statusPending');
      case 'planned': return t('statusPlanned');
      case 'maintenance': return t('statusMaintenance');
      default: return status;
    }
  };

  return (
    <aside className="w-80 bg-[#ffffff] border-l border-[#c3c6d6] flex flex-col h-full z-10 shrink-0 shadow-xs relative">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#c3c6d6] bg-[#f1f4f8] flex items-center justify-between">
        <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
          {t('propTitle')}
        </span>
        <button
          onClick={onClose}
          className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] transition-colors"
          title="Close Properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Component Title & Quick Badge */}
        <div className="bg-[#f8fafc] border border-[#c3c6d6] rounded p-3 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-[#003d9b] bg-[#dae2ff] px-2 py-0.5 rounded">
              ID: {node.id}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                node.status === 'installed'
                  ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                  : node.status === 'pending'
                  ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'
                  : node.status === 'maintenance'
                  ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                  : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]'
              }`}
            >
              {getStatusLabel(node.status)}
            </span>
          </div>

          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdateNode(node.id, { name: e.target.value })}
            className="w-full font-bold text-sm text-[#181c1f] bg-transparent border-b border-transparent hover:border-[#c3c6d6] focus:border-[#003d9b] focus:bg-white px-1 py-0.5 focus:outline-none rounded transition-colors"
            placeholder={t('labelName')}
          />
          <div className="text-xs text-[#434654] mt-1 px-1">
            {node.manufacturer} {node.model}
          </div>
        </div>

        {/* Real-World Reference Image Preview & Link */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#434654] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#003d9b]" />
              {t('refPhotoUrl')}
            </label>
            <button
              onClick={handleUseDefaultImage}
              className="text-[10px] text-[#003d9b] hover:underline font-semibold"
            >
              Preset Photo
            </button>
          </div>

          <div className="relative w-full h-36 bg-[#e0e3e7] rounded border border-[#c3c6d6] overflow-hidden group">
            {!imageError && customImageUrl ? (
              <img
                src={customImageUrl}
                alt={node.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#f1f4f8] text-[#737685]">
                <AlertCircle className="w-6 h-6 text-[#94a3b8] mb-1" />
                <span className="text-xs font-semibold">Image Load Fallback</span>
              </div>
            )}

            {node.specSheetUrl && (
              <a
                href={node.specSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 right-2 bg-black/75 hover:bg-black text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <span>Spec Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#434654]">
                Image URL or Upload File:
              </label>
              <label className="cursor-pointer text-[10px] text-[#003d9b] font-bold bg-[#dae2ff] hover:bg-[#b9cde5] px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/photo.jpg or Google Drive/Photos direct link"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
            <p className="text-[10px] text-[#737685] mt-1 leading-tight">
              Tip: Upload an image file from your device, or paste any image link.
            </p>
          </div>
        </section>

        {/* Technical Specifications Form */}
        <section className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#434654] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#003d9b]" />
            {t('propTitle')}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
                {t('capacityRating')}
              </label>
              <input
                type="text"
                value={node.capacity}
                onChange={(e) => onUpdateNode(node.id, { capacity: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2 py-1 text-xs text-[#181c1f] font-mono focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
                {t('voltageClass')}
              </label>
              <input
                type="text"
                value={node.voltage}
                onChange={(e) => onUpdateNode(node.id, { voltage: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2 py-1 text-xs text-[#181c1f] font-mono focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
                {t('manufacturer')}
              </label>
              <input
                type="text"
                value={node.manufacturer}
                onChange={(e) => onUpdateNode(node.id, { manufacturer: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2 py-1 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
                {t('modelNumber')}
              </label>
              <input
                type="text"
                value={node.model}
                onChange={(e) => onUpdateNode(node.id, { model: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2 py-1 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
              {t('location')}
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-2 top-2 text-[#737685]" />
              <input
                type="text"
                value={node.location}
                onChange={(e) => onUpdateNode(node.id, { location: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded pl-7 pr-2 py-1 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#737685] mb-0.5">
              {t('statusLabel')}
            </label>
            <select
              value={node.status}
              onChange={(e) =>
                onUpdateNode(node.id, { status: e.target.value as any })
              }
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2 py-1 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            >
              <option value="installed">{t('statusInstalled')}</option>
              <option value="pending">{t('statusPending')}</option>
              <option value="planned">{t('statusPlanned')}</option>
              <option value="maintenance">{t('statusMaintenance')}</option>
            </select>
          </div>
        </section>

        {/* Connected Wiring Lines */}
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#434654] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cable className="w-3.5 h-3.5 text-[#003d9b]" />
              {t('electricalConnections')} ({nodeConnections.length})
            </span>
          </label>

          {nodeConnections.length === 0 ? (
            <div className="text-xs text-[#737685] italic bg-[#f8fafc] p-2.5 rounded border border-[#e0e3e7] text-center">
              No electrical connections linked yet.
            </div>
          ) : (
            <div className="border border-[#c3c6d6] rounded bg-[#ffffff] divide-y divide-[#ebeef2] text-xs">
              {nodeConnections.map((conn) => {
                const otherNodeId = conn.fromNodeId === node.id ? conn.toNodeId : conn.fromNodeId;
                const otherNode = allNodes.find((n) => n.id === otherNodeId);

                return (
                  <div key={conn.id} className="p-2 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-[#181c1f]">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            conn.type === 'dc'
                              ? 'bg-[#0052cc]'
                              : conn.type === 'ac'
                              ? 'bg-[#334155]'
                              : conn.type === 'comms'
                              ? 'bg-[#ea580c]'
                              : 'bg-[#16a34a]'
                          }`}
                        />
                        <span className="truncate">
                          {otherNode ? otherNode.name : otherNodeId}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#737685] font-mono mt-0.5">
                        {conn.type.toUpperCase()} • {conn.label}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteConnection(conn.id)}
                      className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded transition-colors"
                      title="Disconnect wiring line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Notes & Calculations */}
        <section className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#434654]">
            {t('engineeringNotes')}
          </label>
          <textarea
            value={node.notes}
            onChange={(e) => onUpdateNode(node.id, { notes: e.target.value })}
            rows={3}
            className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded p-2 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b] resize-none"
            placeholder="Enter notes..."
          />
        </section>

        {/* Delete Component Button */}
        <div className="pt-2 border-t border-[#ebeef2]">
          <button
            onClick={() => onDeleteNode(node.id)}
            className="w-full py-2 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6] rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('deleteComponent')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

