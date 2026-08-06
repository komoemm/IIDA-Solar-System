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
import { EquipmentNode, Connection, PortId, CustomLegendType } from '../types';
import { EQUIPMENT_IMAGES, EQUIPMENT_PORTS, DEFAULT_LEGEND_TYPES } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';

interface PropertiesPanelProps {
  node: EquipmentNode | null;
  selectedConnection?: Connection | null;
  connections: Connection[];
  allNodes: EquipmentNode[];
  legendTypes?: CustomLegendType[];
  onUpdateNode: (id: string, updates: Partial<EquipmentNode>) => void;
  onUpdateConnection?: (id: string, updates: Partial<Connection>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (connId: string) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  selectedConnection,
  connections,
  allNodes,
  legendTypes = DEFAULT_LEGEND_TYPES,
  onUpdateNode,
  onUpdateConnection,
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

  // If a connection line is selected on the canvas, display Connection Properties Panel
  if (!node && selectedConnection) {
    const fromNode = allNodes.find((n) => n.id === selectedConnection.fromNodeId);
    const toNode = allNodes.find((n) => n.id === selectedConnection.toNodeId);

    return (
      <aside className="w-80 bg-[#ffffff] border-l border-[#c3c6d6] flex flex-col h-full z-10 shrink-0 shadow-xs relative">
        {/* Connection Header */}
        <div className="px-3.5 py-2.5 border-b border-[#c3c6d6] bg-[#f1f4f8] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cable className="w-4 h-4 text-[#003d9b]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
              Connection Line Properties
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#434654] hover:text-[#181c1f] p-1 rounded hover:bg-[#e0e3e7] transition-colors"
            title="Close Properties"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Connection ID & Status */}
          <div className="bg-[#f8fafc] border border-[#c3c6d6] rounded p-2.5 space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center text-[#737685]">
              <span>Wire ID:</span>
              <span className="font-bold text-[#003d9b]">{selectedConnection.id}</span>
            </div>
            <div className="flex justify-between items-center text-[#737685]">
              <span>Category:</span>
              <span className="font-bold uppercase text-[#181c1f]">{selectedConnection.type}</span>
            </div>
          </div>

          {/* Nodes Connected */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#434654] block">
              Connected Components
            </label>
            <div className="bg-[#f1f4f8] border border-[#c3c6d6] rounded p-2.5 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-[#737685] uppercase block font-semibold">From Source:</span>
                <span className="font-bold text-[#181c1f]">
                  {fromNode ? `${fromNode.name} (${fromNode.id})` : selectedConnection.fromNodeId}
                </span>
                <span className="text-[10px] text-[#003d9b] font-mono block">Port: {selectedConnection.fromPort}</span>
              </div>
              <div className="border-t border-[#c3c6d6] pt-1.5">
                <span className="text-[10px] text-[#737685] uppercase block font-semibold">To Destination:</span>
                <span className="font-bold text-[#181c1f]">
                  {toNode ? `${toNode.name} (${toNode.id})` : selectedConnection.toNodeId}
                </span>
                <span className="text-[10px] text-[#003d9b] font-mono block">Port: {selectedConnection.toPort}</span>
              </div>
            </div>
          </div>

          {/* Connection Type Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#434654] block">
              Connection Line Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {legendTypes.map((leg) => {
                const isCurrent = selectedConnection.type === leg.categoryKey;
                return (
                  <button
                    key={leg.id}
                    onClick={() =>
                      onUpdateConnection &&
                      onUpdateConnection(selectedConnection.id, {
                        type: leg.categoryKey,
                        color: leg.color,
                        style: leg.style,
                      })
                    }
                    className={`p-2 rounded border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      isCurrent
                        ? 'border-[#003d9b] bg-[#dae2ff] text-[#003d9b] shadow-2xs'
                        : 'border-[#c3c6d6] bg-[#f8fafc] text-[#434654] hover:bg-[#ebeef2]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: leg.color }}
                    />
                    <span className="truncate text-[11px]">{leg.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Line Label */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#434654] block">
              Connection Label Name:
            </label>
            <input
              type="text"
              value={selectedConnection.label || ''}
              onChange={(e) =>
                onUpdateConnection &&
                onUpdateConnection(selectedConnection.id, { label: e.target.value })
              }
              placeholder="e.g. DC Feeder Line, PV String #1"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          {/* Wire Specification / Cable Gauge */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#434654] block">
              Wire Specification / Conductor Rating:
            </label>
            <input
              type="text"
              value={selectedConnection.wireSpec || ''}
              onChange={(e) =>
                onUpdateConnection &&
                onUpdateConnection(selectedConnection.id, { wireSpec: e.target.value })
              }
              placeholder="e.g. 10 AWG USE-2, 4/0 Cu THHN, Cat6"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          {/* Delete Connection Button */}
          <div className="pt-4 border-t border-[#ebeef2]">
            <button
              onClick={() => onDeleteConnection(selectedConnection.id)}
              className="w-full py-2.5 bg-[#ba1a1a] hover:bg-[#961212] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Connection Line</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

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
        <div className="bg-[#f8fafc] border border-[#c3c6d6] rounded p-3 relative space-y-2">
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#737685] mb-0.5">
              Equipment Label Name:
            </label>
            <input
              type="text"
              value={node.name}
              onChange={(e) => onUpdateNode(node.id, { name: e.target.value })}
              className="w-full font-bold text-sm text-[#181c1f] bg-white border border-[#c3c6d6] focus:border-[#003d9b] px-2 py-1 focus:outline-none rounded transition-colors shadow-2xs"
              placeholder={t('labelName')}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#737685] mb-0.5">
              Equipment Category:
            </label>
            <input
              type="text"
              value={node.category || ''}
              onChange={(e) => onUpdateNode(node.id, { category: e.target.value })}
              className="w-full font-semibold text-xs text-[#003d9b] bg-white border border-[#c3c6d6] focus:border-[#003d9b] px-2 py-1 focus:outline-none rounded transition-colors"
              placeholder="e.g. Generation, Storage, Protection..."
            />
          </div>

          <div className="text-[11px] text-[#434654] px-0.5">
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
                Reference Photo URL / Upload:
              </label>
              <label className="cursor-pointer text-[10px] text-[#003d9b] font-bold bg-[#dae2ff] hover:bg-[#b9cde5] px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const result = evt.target?.result as string;
                        if (result) handleImageUrlChange(result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/photo.jpg or upload local file"
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-2.5 py-1 text-xs font-mono text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
            {/* Specs & Info Box */}
            <div className="mt-1.5 p-2 bg-[#f1f4f8] border border-[#c3c6d6] rounded text-[10px] text-[#434654] space-y-0.5">
              <span className="font-bold text-[#003d9b] block">Image Guidelines for Web App Performance:</span>
              <ul className="list-disc list-inside text-[9.5px] space-y-0.5 text-[#434654]">
                <li><strong>Formats:</strong> JPG, PNG, WebP, SVG</li>
                <li><strong>Size:</strong> Under 2 MB (fast loading)</li>
                <li><strong>Ratio:</strong> 1:1 Square or 4:3 Aspect Ratio</li>
              </ul>
            </div>
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

