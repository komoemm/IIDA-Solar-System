import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Plus,
  Cable,
  CheckCircle2,
  Edit3,
  FileText,
} from 'lucide-react';
import {
  EquipmentNode,
  Connection,
  PortId,
  ConnectionCategory,
  EquipmentType,
  CustomLegendType,
} from '../types';
import { EQUIPMENT_PORTS, DEFAULT_LEGEND_TYPES } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';
import { AddLegendModal } from './AddLegendModal';
import { OptimizedImage } from './OptimizedImage';

interface DiagramCanvasProps {
  nodes: EquipmentNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  selectedConnectionId: string | null;
  legendTypes?: CustomLegendType[];
  activeWiringType?: string;
  onSelectActiveWiringType?: (type: string) => void;
  onAddCustomLegendType?: (legend: CustomLegendType) => void;
  onDeleteCustomLegendType?: (id: string) => void;
  onSelectNode: (id: string | null) => void;
  onSelectNodes?: (ids: string[]) => void;
  onSelectConnection: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onMoveNodes?: (ids: string[], deltaX: number, deltaY: number) => void;
  onFinalizeMoveNode: () => void;
  onAddConnection: (
    fromNodeId: string,
    fromPort: PortId,
    toNodeId: string,
    toPort: PortId,
    type: ConnectionCategory | string
  ) => void;
  onUpdateConnection?: (id: string, updates: Partial<Connection>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteNodes?: (ids: string[]) => void;
  onBatchUpdateNodes?: (ids: string[], updates: Partial<EquipmentNode>) => void;
  onDeleteConnection: (id: string) => void;
  onAddEquipmentFromDrop: (type: EquipmentType, x: number, y: number) => void;
  designNotes: string;
  onChangeDesignNotes: (notes: string) => void;

  // BIM Print/Export Handler
  onPrintSheet?: () => void;

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
  selectedNodeIds,
  selectedConnectionId,
  legendTypes = DEFAULT_LEGEND_TYPES,
  activeWiringType = 'dc',
  onSelectActiveWiringType,
  onAddCustomLegendType,
  onDeleteCustomLegendType,
  onSelectNode,
  onSelectNodes,
  onSelectConnection,
  onMoveNode,
  onMoveNodes,
  onFinalizeMoveNode,
  onAddConnection,
  onUpdateConnection,
  onDeleteNode,
  onDeleteNodes,
  onBatchUpdateNodes,
  onDeleteConnection,
  onAddEquipmentFromDrop,
  designNotes,
  onChangeDesignNotes,
  onPrintSheet,
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
  const [isAddLegendModalOpen, setIsAddLegendModalOpen] = useState(false);

  // Active Selected Node IDs helper (Memoized to prevent redundant array recreations)
  const activeSelectedIds = useMemo(
    () => (selectedNodeIds && selectedNodeIds.length > 0 ? selectedNodeIds : selectedNodeId ? [selectedNodeId] : []),
    [selectedNodeIds, selectedNodeId]
  );

  // Marquee Selection Box State
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    nodePositions: Array<{ id: string; x: number; y: number }>;
  } | null>(null);

  // Pan Canvas State
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  // Wiring Line State (Connecting ports)
  const [wiringFrom, setWiringFrom] = useState<{ nodeId: string; portId: PortId; category: ConnectionCategory } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Space bar key state for panning shortcut
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Handle Keyboard shortcuts (Delete key, Ctrl+A, Escape, Space key for pan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const allIds = nodes.map((n) => n.id);
        if (onSelectNodes) onSelectNodes(allIds);
        else if (allIds.length > 0) onSelectNode(allIds[0]);
      }
      if (e.key === 'Escape') {
        if (onSelectNodes) onSelectNodes([]);
        onSelectNode(null);
        onSelectConnection(null);
        setWiringFrom(null);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeSelectedIds.length > 0) {
          if (onDeleteNodes) {
            onDeleteNodes(activeSelectedIds);
          } else {
            activeSelectedIds.forEach((id) => onDeleteNode(id));
          }
        } else if (selectedConnectionId) {
          onDeleteConnection(selectedConnectionId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes, activeSelectedIds, selectedConnectionId, onDeleteNode, onDeleteNodes, onDeleteConnection, onSelectNode, onSelectNodes]);

  // Wheel Zoom Listener on Canvas Container (Scroll up = Zoom In, Scroll down = Zoom Out)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(2.5, Math.max(0.3, +(prevZoom * zoomFactor).toFixed(2)));
        return nextZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Helper to initiate Canvas Panning
  const startPanning = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }, [pan.x, pan.y]);

  // Window-level Mouse Move / Mouse Up listeners when panning, marquee selecting, or dragging nodes
  useEffect(() => {
    if (!isPanning && !draggingNodeId && !selectionBox) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      } else if (selectionBox && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left - pan.x) / zoom;
        const currentY = (e.clientY - rect.top - pan.y) / zoom;
        setSelectionBox((prev) => (prev ? { ...prev, currentX, currentY } : null));

        const minX = Math.min(selectionBox.startX, currentX);
        const maxX = Math.max(selectionBox.startX, currentX);
        const minY = Math.min(selectionBox.startY, currentY);
        const maxY = Math.max(selectionBox.startY, currentY);

        const cardWidth = viewStyle === 'card' ? 220 : 160;
        const cardHeight = viewStyle === 'card' ? 140 : 80;

        const intersectedIds = nodes
          .filter((n) => n.x < maxX && n.x + cardWidth > minX && n.y < maxY && n.y + cardHeight > minY)
          .map((n) => n.id);

        if (onSelectNodes) {
          onSelectNodes(intersectedIds);
        } else if (intersectedIds.length > 0) {
          onSelectNode(intersectedIds[0]);
        }
      } else if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        dragStartRef.current.nodePositions.forEach((pos) => {
          const newX = Math.max(20, Math.round((pos.x + dx) / 10) * 10);
          const newY = Math.max(20, Math.round((pos.y + dy) / 10) * 10);
          onMoveNode(pos.id, newX, newY);
        });
      }
    };

    const handleWindowMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
      }
      if (selectionBox) {
        setSelectionBox(null);
      }
      if (draggingNodeId) {
        setDraggingNodeId(null);
        dragStartRef.current = null;
        onFinalizeMoveNode();
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    isPanning,
    draggingNodeId,
    selectionBox,
    zoom,
    pan,
    nodes,
    viewStyle,
    onMoveNode,
    onFinalizeMoveNode,
    onSelectNode,
    onSelectNodes,
  ]);

  // Mouse Move inside Canvas for wiring preview coordinate
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvasMouseX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasMouseY = (e.clientY - rect.top - pan.y) / zoom;
      setMousePos({ x: canvasMouseX, y: canvasMouseY });
    },
    [pan, zoom]
  );

  // Mouse Up on Canvas
  const handleMouseUp = useCallback(() => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      dragStartRef.current = null;
      onFinalizeMoveNode();
    }
    if (selectionBox) {
      setSelectionBox(null);
    }
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  }, [draggingNodeId, selectionBox, isPanning, onFinalizeMoveNode]);

  // Start Node Dragging
  const handleNodeMouseDown = (e: React.MouseEvent, node: EquipmentNode) => {
    if (e.button === 1 || toolMode === 'pan' || isSpacePressed) {
      e.stopPropagation();
      startPanning(e);
      return;
    }

    if (e.button !== 0) return;

    e.stopPropagation();

    let nextSelectedIds: string[];

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (activeSelectedIds.includes(node.id)) {
        nextSelectedIds = activeSelectedIds.filter((id) => id !== node.id);
      } else {
        nextSelectedIds = [...activeSelectedIds, node.id];
      }
    } else {
      if (activeSelectedIds.includes(node.id)) {
        nextSelectedIds = activeSelectedIds;
      } else {
        nextSelectedIds = [node.id];
      }
    }

    if (onSelectNodes) {
      onSelectNodes(nextSelectedIds);
    } else {
      onSelectNode(nextSelectedIds[0] || null);
    }
    onSelectConnection(null);

    const dragTargetIds = nextSelectedIds.includes(node.id) ? nextSelectedIds : [node.id];
    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodePositions: nodes
        .filter((n) => dragTargetIds.includes(n.id))
        .map((n) => ({ id: n.id, x: n.x, y: n.y })),
    };
  };

  // Start Canvas Pan or Selection Box
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || toolMode === 'pan' || isSpacePressed) {
      startPanning(e);
      return;
    }

    const targetEl = e.target as HTMLElement;
    const isCanvasBg = targetEl === containerRef.current || targetEl.tagName === 'svg' || targetEl.classList.contains('canvas-bg');

    if (isCanvasBg && e.button === 0) {
      if (toolMode === 'select' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const startX = (e.clientX - rect.left - pan.x) / zoom;
        const startY = (e.clientY - rect.top - pan.y) / zoom;
        setSelectionBox({ startX, startY, currentX: startX, currentY: startY });

        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          if (onSelectNodes) onSelectNodes([]);
          else onSelectNode(null);
          onSelectConnection(null);
          setWiringFrom(null);
        }
      } else {
        startPanning(e);
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
          activeWiringType || wiringFrom.category
        );
      }
      setWiringFrom(null);
    }
  };

  // Helper: Get Node Icon (Memoized with useCallback)
  const getNodeTypeIcon = useCallback((type: EquipmentType) => {
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
  }, []);

  // Calculate Node Port Coordinates (Memoized with useCallback)
  const getPortCoordinates = useCallback(
    (node: EquipmentNode, portPosition: 'left' | 'right' | 'top' | 'bottom') => {
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
    },
    [viewStyle]
  );

  // Heavy connection path & bezier curve vector calculations (Memoized to avoid redundant calculations)
  const processedConnections = useMemo(() => {
    return connections
      .map((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
        const toNode = nodes.find((n) => n.id === conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const fromPorts = EQUIPMENT_PORTS[fromNode.type] || [];
        const toPorts = EQUIPMENT_PORTS[toNode.type] || [];

        const fromPortDef = fromPorts.find((p) => p.id === conn.fromPort) || {
          position: 'right' as const,
        };
        const toPortDef = toPorts.find((p) => p.id === conn.toPort) || {
          position: 'left' as const,
        };

        const p1 = getPortCoordinates(fromNode, fromPortDef.position);
        const p2 = getPortCoordinates(toNode, toPortDef.position);

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const pathD = `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;

        const legendMatch = legendTypes.find(
          (l) => l.categoryKey === conn.type || l.id === conn.type
        );
        const strokeColor =
          conn.color ||
          legendMatch?.color ||
          (conn.type === 'dc'
            ? '#0052cc'
            : conn.type === 'ac'
            ? '#334155'
            : conn.type === 'comms'
            ? '#ea580c'
            : conn.type === 'ground'
            ? '#16a34a'
            : '#9333ea');

        const lineStyle =
          conn.style || legendMatch?.style || (conn.type === 'comms' || conn.type === 'ground' ? 'dashed' : 'solid');
        const strokeDasharray =
          lineStyle === 'dashed' ? '6 4' : lineStyle === 'dotted' ? '2 3' : 'none';

        return {
          conn,
          pathD,
          midX,
          midY,
          strokeColor,
          strokeDasharray,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [connections, nodes, legendTypes, getPortCoordinates]);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f7fafe] font-sans">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Control Group */}
        <div className="flex items-center gap-1 bg-[#ffffff] border border-[#c3c6d6] rounded-md p-1 shadow-md pointer-events-auto" role="toolbar" aria-label="Diagram Canvas Tools">
          <button
            onClick={() => setToolMode('select')}
            aria-label="Select & Move Tool"
            aria-pressed={toolMode === 'select'}
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
            aria-label="Pan Canvas Tool"
            aria-pressed={toolMode === 'pan'}
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
            aria-label={`Toggle View Style: currently ${viewStyle === 'card' ? 'BIM Card View' : 'CAD View'}`}
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
            aria-label="Toggle Reference Photos"
            aria-pressed={showPhotos}
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
            aria-label="Toggle Animated Electron Flow Particles"
            aria-pressed={animateFlow}
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
              aria-label={t('togglePalette')}
              aria-expanded={showPalette}
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

          {onToggleProperties && (
            <button
              onClick={onToggleProperties}
              aria-label={t('toggleProperties')}
              aria-expanded={showProperties}
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
        </div>

        {/* Right Zoom Control Group */}
        <div className="flex items-center gap-1 bg-[#ffffff] border border-[#c3c6d6] rounded-md p-1 shadow-md pointer-events-auto" role="group" aria-label="Zoom Controls">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            aria-label="Zoom In"
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
            aria-label="Zoom Out"
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
            aria-label="Reset Zoom to 100%"
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

            {/* Connection Lines Rendering (Driven by memoized processedConnections) */}
            {processedConnections.map(({ conn, pathD, midX, midY, strokeColor, strokeDasharray }) => {
              const isSelected = selectedConnectionId === conn.id;

              return (
                <g key={conn.id} className="cursor-pointer pointer-events-auto">
                  {/* Outer Click Hotspot Area */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="18"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConnection(conn.id);
                      onSelectNode(null);
                    }}
                  />

                  {/* Highlight Glow when selected */}
                  {isSelected && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#003d9b"
                      strokeWidth="8"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Visible Wire Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? '#003d9b' : strokeColor}
                    strokeWidth={isSelected ? 4 : 2.5}
                    strokeDasharray={strokeDasharray}
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
                  {(conn.label || conn.wireSpec) && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-55"
                        y="-10"
                        width="110"
                        height="20"
                        rx="4"
                        fill="#ffffff"
                        stroke={isSelected ? '#003d9b' : strokeColor}
                        strokeWidth={isSelected ? 2 : 1}
                        className="shadow-2xs"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#181c1f"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {(conn.label || conn.wireSpec || '').length > 18
                          ? (conn.label || conn.wireSpec || '').slice(0, 16) + '..'
                          : conn.label || conn.wireSpec}
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

          {/* Interactive Canvas Overlay Badge for Selected Connection Line */}
          {selectedConnectionId && (
            (() => {
              const selectedConn = connections.find((c) => c.id === selectedConnectionId);
              if (!selectedConn) return null;
              const fromN = nodes.find((n) => n.id === selectedConn.fromNodeId);
              const toN = nodes.find((n) => n.id === selectedConn.toNodeId);
              if (!fromN || !toN) return null;

              const fromPorts = EQUIPMENT_PORTS[fromN.type] || [];
              const toPorts = EQUIPMENT_PORTS[toN.type] || [];
              const p1 = getPortCoordinates(fromN, (fromPorts.find((p) => p.id === selectedConn.fromPort) || { position: 'right' }).position);
              const p2 = getPortCoordinates(toN, (toPorts.find((p) => p.id === selectedConn.toPort) || { position: 'left' }).position);
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <div
                  style={{
                    transform: `translate(${midX}px, ${midY - 48}px)`,
                  }}
                  className="absolute z-50 pointer-events-auto -translate-x-1/2 -translate-y-full bg-[#ffffff] border-2 border-[#003d9b] rounded-xl shadow-xl p-2.5 w-72 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Badge Header with Title & Delete Icon */}
                  <div className="flex items-center justify-between border-b border-[#ebeef2] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#003d9b]">
                      <Cable className="w-4 h-4" />
                      <span>Connection Control ({selectedConn.id})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDeleteConnection(selectedConn.id)}
                        className="bg-[#ffdad6] hover:bg-[#ba1a1a] text-[#ba1a1a] hover:text-white p-1 rounded-md transition-all font-bold text-[10px] flex items-center gap-1"
                        title="Delete connection line from canvas (or press Delete key)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => onSelectConnection(null)}
                        className="text-[#737685] hover:text-[#181c1f] p-1 rounded"
                        title="Deselect line"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line Type Quick Switcher */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#434654] block mb-1">
                      Change Line Type:
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {legendTypes.map((leg) => {
                        const isMatch = selectedConn.type === leg.categoryKey;
                        return (
                          <button
                            key={leg.id}
                            onClick={() =>
                              onUpdateConnection &&
                              onUpdateConnection(selectedConn.id, {
                                type: leg.categoryKey,
                                color: leg.color,
                                style: leg.style,
                              })
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all ${
                              isMatch
                                ? 'bg-[#003d9b] text-white shadow-xs'
                                : 'bg-[#f1f4f8] text-[#434654] hover:bg-[#e0e3e7]'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full border border-white"
                              style={{ backgroundColor: leg.color }}
                            />
                            <span>{leg.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Label & Wire Spec Edit Inputs */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div>
                      <span className="text-[9px] font-bold text-[#737685] block uppercase">Line Label</span>
                      <input
                        type="text"
                        value={selectedConn.label || ''}
                        onChange={(e) =>
                          onUpdateConnection &&
                          onUpdateConnection(selectedConn.id, { label: e.target.value })
                        }
                        placeholder="Label name"
                        className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-1.5 py-1 text-[11px] font-semibold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#737685] block uppercase">Wire Spec</span>
                      <input
                        type="text"
                        value={selectedConn.wireSpec || ''}
                        onChange={(e) =>
                          onUpdateConnection &&
                          onUpdateConnection(selectedConn.id, { wireSpec: e.target.value })
                        }
                        placeholder="e.g. 10 AWG"
                        className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-1.5 py-1 text-[11px] text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
                      />
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Equipment Nodes Layer */}
          {nodes.map((node) => {
            const isSelected = activeSelectedIds.includes(node.id);
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
                    ? 'border-[#003d9b] shadow-lg ring-2 ring-[#003d9b]/30 z-30'
                    : 'border-[#c3c6d6] hover:border-[#003d9b] shadow-xs z-10'
                }`}
              >
                {/* Multi-selection Checkmark Badge */}
                {isSelected && activeSelectedIds.length > 1 && (
                  <div className="absolute -top-2 -right-2 bg-[#003d9b] text-white p-0.5 rounded-full shadow-md z-40 border border-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
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
                          <OptimizedImage
                            src={node.imageUrl}
                            alt={node.name}
                            width={100}
                            height={100}
                            equipmentType={node.type}
                            className="w-full h-full object-cover"
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

          {/* Marquee Selection Box Overlay */}
          {selectionBox && (
            <div
              style={{
                left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
                top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
                width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
                height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
              }}
              className="absolute border-2 border-[#003d9b] bg-[#003d9b]/15 rounded-xs pointer-events-none z-40 shadow-xs"
            />
          )}
        </div>

        {/* Floating Multi-Selection Floating Action Bar */}
        {activeSelectedIds.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#ffffff] border-2 border-[#003d9b] shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-3 animate-fade-in text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#003d9b] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003d9b] animate-ping shrink-0" />
              <span>{activeSelectedIds.length} Components Selected</span>
            </div>
            <div className="h-4 w-px bg-[#c3c6d6]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#737685] font-bold uppercase">Status:</span>
              <select
                onChange={(e) => {
                  if (e.target.value && onBatchUpdateNodes) {
                    onBatchUpdateNodes(activeSelectedIds, { status: e.target.value as any });
                  }
                }}
                defaultValue=""
                className="bg-[#f1f4f8] border border-[#c3c6d6] rounded px-2 py-1 text-[11px] font-bold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              >
                <option value="" disabled>Set Status...</option>
                <option value="installed">{t('statusInstalled')}</option>
                <option value="pending">{t('statusPending')}</option>
                <option value="planned">{t('statusPlanned')}</option>
                <option value="maintenance">{t('statusMaintenance')}</option>
              </select>
            </div>
            <div className="h-4 w-px bg-[#c3c6d6]" />
            <button
              onClick={() => {
                if (onDeleteNodes) onDeleteNodes(activeSelectedIds);
                else activeSelectedIds.forEach((id) => onDeleteNode(id));
              }}
              aria-label={`Delete ${activeSelectedIds.length} selected components`}
              className="px-2.5 py-1.5 bg-[#ffdad6] hover:bg-[#ba1a1a] text-[#ba1a1a] hover:text-white rounded font-bold flex items-center gap-1 transition-all"
              title="Delete all selected components (Delete key)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({activeSelectedIds.length})</span>
            </button>
            <button
              onClick={() => {
                if (onSelectNodes) onSelectNodes([]);
                else onSelectNode(null);
              }}
              aria-label="Clear selection"
              className="p-1 hover:bg-[#f1f4f8] rounded text-[#737685] hover:text-[#181c1f]"
              title="Clear selection (Escape key)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Panel: Connection Legend & Component Engineering Notes */}
      {showBottomPanel && (
        <div className="h-44 border-t border-[#c3c6d6] bg-[#ffffff] shrink-0 flex divide-x divide-[#ebeef2] text-xs relative">
          {/* Interactive Connection Legend */}
          <div className="w-80 p-3 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Cable className="w-4 h-4 text-[#003d9b]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
                  {t('legendTitle')}
                </span>
              </div>
              <button
                onClick={() => setIsAddLegendModalOpen(true)}
                aria-label="Add custom line type to legend"
                className="px-2 py-0.5 bg-[#dae2ff] text-[#003d9b] hover:bg-[#b9cde5] rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Add custom line type to project legend"
              >
                <Plus className="w-3 h-3" />
                <span>Custom Line</span>
              </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {legendTypes.map((item) => {
                const isActiveDefault = activeWiringType === item.categoryKey;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectActiveWiringType) {
                        onSelectActiveWiringType(item.categoryKey);
                      }
                      if (selectedConnectionId && onUpdateConnection) {
                        onUpdateConnection(selectedConnectionId, {
                          type: item.categoryKey,
                          color: item.color,
                          style: item.style,
                        });
                      }
                    }}
                    className={`p-1.5 rounded border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isActiveDefault
                        ? 'border-[#003d9b] bg-[#dae2ff] text-[#003d9b] font-semibold'
                        : 'border-[#e0e3e7] bg-[#f8fafc] text-[#434654] hover:bg-[#f1f4f8]'
                    }`}
                    title="Click to select as default wiring type (or change type of selected canvas line)"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-2 flex items-center justify-center shrink-0">
                        <div
                          className="w-full"
                          style={{
                            height: '3px',
                            backgroundColor: item.color,
                            borderStyle: item.style === 'solid' ? 'none' : item.style,
                            borderWidth: item.style !== 'solid' ? '1px 0 0 0' : '0',
                            borderColor: item.color,
                          }}
                        />
                      </div>
                      <span className="text-xs truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isActiveDefault && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#003d9b] text-white px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                      {item.isCustom && onDeleteCustomLegendType && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomLegendType(item.id);
                          }}
                          aria-label={`Remove custom legend line ${item.label}`}
                          className="text-[#737685] hover:text-[#ba1a1a] p-0.5 rounded"
                          title="Remove custom legend line"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-[#737685] italic mt-1">
              * Click any line type above to change default wire mode or modify selected line.
            </div>
          </div>

          {/* Component Notes & Engineering Design Calculations */}
          <div className="flex-1 p-3 flex flex-col relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#003d9b]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#181c1f]">
                  {t('engineeringNotes')} & Component Specs
                </span>
              </div>
              <div className="flex items-center gap-2 pr-6">
                {/* Quick calculation snippet insert buttons */}
                <button
                  onClick={() =>
                    onChangeDesignNotes(
                      designNotes +
                        '\n\n[EQUIPMENT SIZING & VOC CALCULATION]:\n1. String Sizing: 14 Modules per String @ Temp Coeff -0.28%/°C. Max Voc = 612.4 VDC @ -10°C ambient.'
                    )
                  }
                  aria-label="Insert PV Sizing Note"
                  className="px-2 py-0.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#003d9b] rounded text-[10px] font-bold transition-colors"
                >
                  + PV Sizing Note
                </button>

                <button
                  onClick={() =>
                    onChangeDesignNotes(
                      designNotes +
                        '\n\n[OVERCURRENT PROTECTION & OCPD]:\n2. DC Overcurrent Protection: 15A gPV fuses in combiner box. AC OCPD: 100A 2-Pole Breaker.'
                    )
                  }
                  aria-label="Insert OCPD Note"
                  className="px-2 py-0.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#003d9b] rounded text-[10px] font-bold transition-colors"
                >
                  + OCPD Note
                </button>

                <button
                  onClick={() =>
                    onChangeDesignNotes(
                      designNotes +
                        '\n\n[SAFETY & RAPID SHUTDOWN]:\n3. Rapid Shutdown compliance verified according to NEC 690.12 with Sol-Ark integrated RSD transmitter.'
                    )
                  }
                  aria-label="Insert RSD Compliance Note"
                  className="px-2 py-0.5 bg-[#f1f4f8] hover:bg-[#e0e3e7] text-[#003d9b] rounded text-[10px] font-bold transition-colors"
                >
                  + RSD Compliance
                </button>

                <span className="text-[10px] text-[#737685] font-mono border-l border-[#c3c6d6] pl-2">Autosaved</span>
              </div>
            </div>
            <textarea
              value={designNotes}
              onChange={(e) => onChangeDesignNotes(e.target.value)}
              className="flex-1 w-full bg-[#f8fafc] border border-[#c3c6d6] rounded p-2.5 font-mono text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b] leading-relaxed resize-none shadow-inner"
              placeholder="Type design notes, electrical calculations, conductor sizing specs, or code compliance comments..."
            />
            {onToggleBottomPanel && (
              <button
                onClick={onToggleBottomPanel}
                aria-label="Hide Legend and Notes Panel"
                aria-expanded={true}
                className="absolute top-2.5 right-2.5 text-[#737685] hover:text-[#181c1f] hover:bg-[#e0e3e7] p-1 rounded transition-colors"
                title="Hide Legend & Notes Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Legend Modal */}
      <AddLegendModal
        isOpen={isAddLegendModalOpen}
        onClose={() => setIsAddLegendModalOpen(false)}
        onAddLegend={(newLegend) => {
          if (onAddCustomLegendType) {
            onAddCustomLegendType(newLegend);
          }
        }}
      />
    </div>
  );
};
