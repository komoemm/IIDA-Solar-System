import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  Play,
  Pause,
  Image as ImageIcon,
  Grid,
  Sun,
  Box,
  Zap,
  Battery,
  Layers,
  ShieldAlert,
  Flame,
  Cpu,
  Trash2,
  X,
  PanelLeft,
  PanelRight,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  EquipmentNode,
  Connection,
  PortId,
  ConnectionCategory,
  EquipmentType,
} from '../types';
import { EQUIPMENT_PORTS } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';

interface DiagramCanvasProps {
  nodes: EquipmentNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onFinalizeMoveNode: () => void;
  onAddConnection: (
    fromNodeId: string,
    fromPort: PortId,
    toNodeId: string,
    toPort: PortId,
    type: ConnectionCategory
  ) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onAddEquipmentFromDrop: (type: EquipmentType, x: number, y: number) => void;
  designNotes: string;
  onChangeDesignNotes: (notes: string) => void;

  // Panel Toggles
  showPalette?: boolean;
  onTogglePalette?: () => void;
  showProperties?: boolean;
  onToggleProperties?: () => void;
  showBottomPanel?: boolean;
  onToggleBottomPanel?: () => void;
  isFocusCanvasMode?: boolean;
  onToggleFocusCanvasMode?: () => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  onSelectNode,
  onSelectConnection,
  onMoveNode,
  onFinalizeMoveNode,
  onAddConnection,
  onDeleteNode,
  onDeleteConnection,
  onAddEquipmentFromDrop,
  designNotes,
  onChangeDesignNotes,
  showPalette = true,
  onTogglePalette,
  showProperties = true,
  onToggleProperties,
  showBottomPanel = true,
  onToggleBottomPanel,
  isFocusCanvasMode = false,
  onToggleFocusCanvasMode,
}) => {
  const { language, t } = useLanguage();
  // Canvas Viewport Transforms
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [viewStyle, setViewStyle] = useState<'card' | 'cad'>('card');
  const [showPhotos, setShowPhotos] = useState(true);
  const [animateFlow, setAnimateFlow] = useState(true);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);

  // Pan Canvas State
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  // Wiring Line State (Connecting ports)
  const [wiringFrom, setWiringFrom] = useState<{ nodeId: string; portId: PortId; category: ConnectionCategory } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Keyboard shortcuts (Delete key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          onDeleteConnection(selectedConnectionId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedConnectionId, onDeleteNode, onDeleteConnection]);

  // Mouse Move on Canvas
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvasMouseX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasMouseY = (e.clientY - rect.top - pan.y) / zoom;

      setMousePos({ x: canvasMouseX, y: canvasMouseY });

      // Node Dragging
      if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        const newX = Math.max(20, Math.round((dragStartRef.current.nodeX + dx) / 10) * 10);
        const newY = Math.max(20, Math.round((dragStartRef.current.nodeY + dy) / 10) * 10);
        onMoveNode(draggingNodeId, newX, newY);
      }

      // Canvas Panning
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      }
    },
    [draggingNodeId, isPanning, zoom, pan, onMoveNode]
  );

  // Mouse Up on Canvas
  const handleMouseUp = useCallback(() => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      dragStartRef.current = null;
      onFinalizeMoveNode();
    }
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  }, [draggingNodeId, isPanning, onFinalizeMoveNode]);

  // Start Node Dragging
  const handleNodeMouseDown = (e: React.MouseEvent, node: EquipmentNode) => {
    if (toolMode === 'pan') return;
    e.stopPropagation();
    onSelectNode(node.id);
    onSelectConnection(null);

    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  // Start Canvas Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
      onSelectConnection(null);
      setWiringFrom(null);

      if (toolMode === 'pan' || e.button === 1 || e.spaceKey) {
        setIsPanning(true);
        panStartRef.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    }
  };

  // HTML5 Drop from Palette onto Canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropX = Math.round((e.clientX - rect.left - pan.x) / zoom / 10) * 10;
    const dropY = Math.round((e.clientY - rect.top - pan.y) / zoom / 10) * 10;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const { type } = JSON.parse(dataStr);
        if (type) {
          onAddEquipmentFromDrop(type, dropX, dropY);
        }
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Click on Port Handle to start or complete wiring line
  const handlePortClick = (e: React.MouseEvent, node: EquipmentNode, portId: PortId, category: ConnectionCategory) => {
    e.stopPropagation();
    if (!wiringFrom) {
      // Start connection
      setWiringFrom({ nodeId: node.id, portId, category });
    } else {
      // Complete connection
      if (wiringFrom.nodeId !== node.id) {
        onAddConnection(
          wiringFrom.nodeId,
          wiringFrom.portId,
          node.id,
          portId,
          wiringFrom.category
        );
      }
      setWiringFrom(null);
    }
  };

  // Helper: Get Node Icon
  const getNodeTypeIcon = (type: EquipmentType) => {
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

  // Calculate Node Port Coordinates
  const getPortCoordinates = (node: EquipmentNode, portPosition: 'left' | 'right' | 'top' | 'bottom') => {
    const cardWidth = viewStyle === 'card' ? 220 : 160;
    const cardHeight = viewStyle === 'card' ? 140 : 80;

    switch (portPosition) {
      case 'left':
        return { x: node.x, y: node.y + cardHeight / 2 };
      case 'right':
        return { x: node.x + cardWidth, y: node.y + cardHeight / 2 };
      case 'top':
        return { x: node.x + cardWidth / 2, y: node.y };
      case 'bottom':
        return { x: node.x + cardWidth / 2, y: node.y + cardHeight };
      default:
        return { x: node.x + cardWidth, y: node.y + cardHeight / 2 };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f7fafe] font-sans">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Control Group */}
        <div className="flex items-center gap-1 bg-[#ffffff] border border-[#c3c6d6] rounded-md p-1 shadow-md pointer-events-auto">
          <button
            onClick={() => setToolMode('select')}
            className={`p-1.5 rounded transition-colors ${
              toolMode === 'select'
                ? 'bg-[#003d9b] text-white font-semibold'
                : 'text-[#434654] hover:bg-[#f1f4f8]'
            }`}
            title="Select & Move Tool"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setToolMode('pan')}
            className={`p-1.5 rounded transition-colors ${
              toolMode === 'pan'
                ? 'bg-[#003d9b] text-white font-semibold'
                : 'text-[#434654] hover:bg-[#f1f4f8]'
            }`}
            title="Pan Canvas Tool"
          >
            <Hand className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#c3c6d6] my-auto mx-1" />

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewStyle(viewStyle === 'card' ? 'cad' : 'card')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewStyle === 'card'
                ? 'bg-[#e0e3e7] text-[#003d9b]'
                : 'text-[#434654] hover:bg-[#f1f4f8]'
            }`}
            title="Toggle between BIM Card View and CAD Symbol Block View"
          >
            {viewStyle === 'card' ? 'BIM View' : 'CAD View'}
          </button>

          {/* Photos Toggle */}
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className={`p-1.5 rounded transition-colors ${
              showPhotos ? 'text-[#003d9b] bg-[#dae2ff]' : 'text-[#737685] hover:bg-[#f1f4f8]'
            }`}
            title="Show/Hide Real-World Reference Photo Thumbnails"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Flow Animation Toggle */}
          <button
            onClick={() => setAnimateFlow(!animateFlow)}
            className={`p-1.5 rounded transition-colors ${
              animateFlow ? 'text-[#059669] bg-[#ecfdf5]' : 'text-[#737685] hover:bg-[#f1f4f8]'
            }`}
            title="Toggle Animated Electron Flow Particles"
          >
            {animateFlow ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <div className="w-[1px] h-5 bg-[#c3c6d6] my-auto mx-1" />

          {/* Panel Visibility Controls */}
          {onTogglePalette && (
            <button
              onClick={onTogglePalette}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${
                showPalette
                  ? 'bg-[#003d9b] text-white'
                  : 'text-[#737685] hover:bg-[#f1f4f8]'
              }`}
              title={t('togglePalette')}
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden lg:inline">{t('togglePalette')}</span>
            </button>
          )}

          {onToggleBottomPanel && (
            <button
              onClick={onToggleBottomPanel}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${
                showBottomPanel
                  ? 'bg-[#003d9b] text-white'
                  : 'text-[#737685] hover:bg-[#f1f4f8]'
              }`}
              title={t('toggleBottomPanel')}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden lg:inline">{t('toggleBottomPanel')}</span>
            </button>
          )}

          {onToggleProperties && (
            <button
              onClick={onToggleProperties}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${
                showProperties
                  ? 'bg-[#003d9b] text-white'
                  : 'text-[#737685] hover:bg-[#f1f4f8]'
              }`}
              title={t('toggleProperties')}
            >
              <PanelRight className="w-4 h-4" />
              <span className="hidden lg:inline">{t('toggleProperties')}</span>
            </button>
          )}

          {onToggleFocusCanvasMode && (
            <button
              onClick={onToggleFocusCanvasMode}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold ${
                isFocusCanvasMode
                  ? 'bg-[#181c1f] text-white shadow-xs'
                  : 'bg-[#dae2ff] text-[#003d9b] hover:bg-[#b9cde5]'
              }`}
              title={isFocusCanvasMode ? t('showAllPanels') : t('focusCanvas')}
            >
              {isFocusCanvasMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isFocusCanvasMode ? t('showAllPanels') : t('focusCanvas')}
              </span>
            </button>
          )}
        </div>

        {/* Right Zoom Control Group */}
        <div className="flex items-center gap-1 bg-[#ffffff] border border-[#c3c6d6] rounded-md p-1 shadow-md pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className="p-1.5 text-[#434654] hover:bg-[#f1f4f8] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#181c1f] px-2 min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 text-[#434654] hover:bg-[#f1f4f8] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#c3c6d6] my-auto mx-1" />

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 text-[#434654] hover:bg-[#f1f4f8] rounded transition-colors"
            title="Reset Zoom 100%"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Drafting Canvas Container */}
      <div
        id="diagram-canvas-container"
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`flex-1 relative overflow-hidden select-none ${
          toolMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          backgroundColor: '#f7fafe',
          backgroundImage:
            'radial-gradient(circle, #c3c6d6 1.2px, transparent 1.2px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Canvas World Transform Wrapper */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* SVG Connection Wiring Layer */}
          <svg
            className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Arrow Heads */}
              <marker
                id="marker-dc"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0052cc" />
              </marker>

              <marker
                id="marker-ac"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
              </marker>

              <marker
                id="marker-comms"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
              </marker>
            </defs>

            {/* Connection Lines Rendering */}
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
              const toNode = nodes.find((n) => n.id === conn.toNodeId);
              if (!fromNode || !toNode) return null;

              const fromPorts = EQUIPMENT_PORTS[fromNode.type] || [];
              const toPorts = EQUIPMENT_PORTS[toNode.type] || [];

              const fromPortDef = fromPorts.find((p) => p.id === conn.fromPort) || {
                position: 'right',
              };
              const toPortDef = toPorts.find((p) => p.id === conn.toPort) || {
                position: 'left',
              };

              const p1 = getPortCoordinates(fromNode, fromPortDef.position);
              const p2 = getPortCoordinates(toNode, toPortDef.position);

              const midX = (p1.x + p2.x) / 2;
              const pathD = `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;

              const strokeColor =
                conn.type === 'dc'
                  ? '#0052cc'
                  : conn.type === 'ac'
                  ? '#334155'
                  : conn.type === 'comms'
                  ? '#ea580c'
                  : '#16a34a';

              const isSelected = selectedConnectionId === conn.id;

              return (
                <g key={conn.id} className="cursor-pointer pointer-events-auto">
                  {/* Outer Click Area */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConnection(conn.id);
                      onSelectNode(null);
                    }}
                  />

                  {/* Visible Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? '#003d9b' : strokeColor}
                    strokeWidth={isSelected ? 4 : 2.5}
                    strokeDasharray={
                      conn.type === 'comms' || conn.type === 'ground' ? '6 4' : 'none'
                    }
                    markerEnd={`url(#marker-${conn.type === 'comms' ? 'comms' : conn.type === 'dc' ? 'dc' : 'ac'})`}
                    className="transition-all"
                  />

                  {/* Animated Flow Particles */}
                  {animateFlow && (
                    <circle r="3" fill={strokeColor} className="animate-ping">
                      <animateMotion path={pathD} dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Label Text Pill */}
                  {conn.label && (
                    <g transform={`translate(${midX}, ${(p1.y + p2.y) / 2})`}>
                      <rect
                        x="-50"
                        y="-9"
                        width="100"
                        height="18"
                        rx="3"
                        fill="#ffffff"
                        stroke={strokeColor}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#181c1f"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {conn.label.length > 16
                          ? conn.label.slice(0, 14) + '..'
                          : conn.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Rubberband Wiring Line Preview */}
            {wiringFrom && (
              <path
                d={`M ${
                  getPortCoordinates(
                    nodes.find((n) => n.id === wiringFrom.nodeId)!,
                    'right'
                  ).x
                } ${
                  getPortCoordinates(
                    nodes.find((n) => n.id === wiringFrom.nodeId)!,
                    'right'
                  ).y
                } L ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="#003d9b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {/* Equipment Nodes Layer */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const ports = EQUIPMENT_PORTS[node.type] || [];
            const cardWidth = viewStyle === 'card' ? 220 : 160;
            const cardHeight = viewStyle === 'card' ? 140 : 80;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                }}
                className={`absolute rounded-md bg-[#ffffff] transition-shadow duration-150 border-2 ${
                  isSelected
                    ? 'border-[#003d9b] shadow-lg ring-2 ring-[#003d9b]/20 z-30'
                    : 'border-[#c3c6d6] hover:border-[#003d9b] shadow-xs z-10'
                }`}
              >
                {/* Node View: Detailed BIM Card */}
                {viewStyle === 'card' ? (
                  <div className="h-full flex flex-col p-2.5 overflow-hidden">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#ebeef2]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getNodeTypeIcon(node.type)}
                        <span className="font-mono font-bold text-xs text-[#003d9b] truncate">
                          {node.id}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[#434654] uppercase bg-[#e0e3e7] px-1.5 py-0.5 rounded">
                        {node.capacity}
                      </span>
                    </div>

                    {/* Content Row with Image & Details */}
                    <div className="flex gap-2 items-center mt-2 flex-1">
                      {showPhotos && node.imageUrl && (
                        <div className="w-12 h-12 rounded bg-[#f1f4f8] border border-[#c3c6d6] overflow-hidden shrink-0">
                          <img
                            src={node.imageUrl}
                            alt={node.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-[#181c1f] truncate leading-snug">
                          {node.name}
                        </div>
                        <div className="text-[10px] text-[#434654] truncate mt-0.5">
                          {node.manufacturer} • {node.model}
                        </div>
                        <div className="text-[9px] font-mono text-[#737685] truncate mt-0.5">
                          {node.location}
                        </div>
                      </div>
                    </div>

                    {/* Status bar */}
                    <div className="mt-auto pt-1 flex items-center justify-between text-[9px] text-[#737685] border-t border-[#f1f4f8]">
                      <span>{node.voltage}</span>
                      <span className="uppercase font-semibold text-[#059669]">
                        {node.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Node View: CAD Symbol Block */
                  <div className="h-full flex flex-col items-center justify-center p-2 text-center bg-[#f8fafc]">
                    <div className="flex items-center gap-1">
                      {getNodeTypeIcon(node.type)}
                      <span className="font-mono font-bold text-xs text-[#003d9b]">
                        {node.id}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[#181c1f] truncate w-full mt-1">
                      {node.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#434654]">
                      {node.capacity}
                    </div>
                  </div>
                )}

                {/* Connection Port Dots */}
                {ports.map((port) => {
                  const isLeft = port.position === 'left';
                  const isRight = port.position === 'right';
                  const isTop = port.position === 'top';
                  const isBottom = port.position === 'bottom';

                  return (
                    <button
                      key={port.id}
                      onClick={(e) => handlePortClick(e, node, port.id, port.type)}
                      title={`Port: ${port.label} (${port.type.toUpperCase()}) - Click to wire`}
                      className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-xs hover:scale-125 transition-transform z-40 ${
                        port.type === 'dc'
                          ? 'bg-[#0052cc]'
                          : port.type === 'ac'
                          ? 'bg-[#334155]'
                          : port.type === 'comms'
                          ? 'bg-[#ea580c]'
                          : 'bg-[#16a34a]'
                      }`}
                      style={{
                        left: isLeft ? '-6px' : isRight ? `${cardWidth - 6}px` : `${cardWidth / 2 - 6}px`,
                        top: isTop ? '-6px' : isBottom ? `${cardHeight - 6}px` : `${cardHeight / 2 - 6}px`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Panel: Legend & Design Notes */}
      {showBottomPanel && (
        <div className="h-40 border-t border-[#c3c6d6] bg-[#ffffff] shrink-0 flex divide-x divide-[#ebeef2] text-xs relative">
          {/* Connection Legend */}
          <div className="w-64 p-3 flex flex-col justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f] mb-1">
              {t('legendTitle')}
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-[3px] bg-[#0052cc] rounded-full" />
                <span className="text-xs text-[#434654]">{t('dcPower')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-[3px] bg-[#334155] rounded-full" />
                <span className="text-xs text-[#434654]">{t('acPower')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-[2px] bg-[#ea580c] border-b border-dashed border-[#ea580c]" />
                <span className="text-xs text-[#434654]">{t('commsLine')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-[2px] bg-[#16a34a] border-b border-dashed border-[#16a34a]" />
                <span className="text-xs text-[#434654]">{t('groundLine')}</span>
              </div>
            </div>
          </div>

          {/* Engineering Design Notes */}
          <div className="flex-1 p-3 flex flex-col relative">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
                {t('engineeringNotes')}
              </span>
              <div className="flex items-center gap-3 pr-6">
                <span className="text-[10px] text-[#737685] font-mono">Autosaved</span>
              </div>
            </div>
            <textarea
              value={designNotes}
              onChange={(e) => onChangeDesignNotes(e.target.value)}
              className="flex-1 w-full bg-[#f8fafc] border border-[#c3c6d6] rounded p-2 font-mono text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b] resize-none"
              placeholder="Type notes..."
            />
            {onToggleBottomPanel && (
              <button
                onClick={onToggleBottomPanel}
                className="absolute top-2.5 right-2.5 text-[#737685] hover:text-[#181c1f] hover:bg-[#e0e3e7] p-1 rounded transition-colors"
                title="Hide Legend & Notes Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
