import { useState, useCallback, useRef } from 'react';
import {
  EquipmentNode,
  Connection,
  ProjectMetadata,
  DiagramState,
  EquipmentType,
  PortId,
  ConnectionCategory,
} from '../types';
import {
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  DEFAULT_METADATA,
  INITIAL_DESIGN_NOTES,
  EQUIPMENT_IMAGES,
  LIBRARY_ITEMS,
} from '../data/presetData';

const MAX_HISTORY = 30;

export function useDiagramState() {
  const [nodes, setNodes] = useState<EquipmentNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [metadata, setMetadata] = useState<ProjectMetadata>(DEFAULT_METADATA);
  const [designNotes, setDesignNotes] = useState<string>(INITIAL_DESIGN_NOTES);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('INV-01');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Undo / Redo History Stacks
  const historyRef = useRef<DiagramState[]>([]);
  const pointerRef = useRef<number>(-1);

  // Push state to history
  const saveStateToHistory = useCallback(
    (newNodes: EquipmentNode[], newConns: Connection[], newMeta: ProjectMetadata, newNotes: string) => {
      const currentState: DiagramState = {
        nodes: newNodes,
        connections: newConns,
        metadata: newMeta,
        designNotes: newNotes,
      };

      // Truncate future history if we are in middle of stack
      const history = historyRef.current.slice(0, pointerRef.current + 1);
      history.push(JSON.parse(JSON.stringify(currentState)));

      if (history.length > MAX_HISTORY) {
        history.shift();
      }

      historyRef.current = history;
      pointerRef.current = history.length - 1;
    },
    []
  );

  // Initialize history on first load
  if (pointerRef.current === -1) {
    saveStateToHistory(INITIAL_NODES, INITIAL_CONNECTIONS, DEFAULT_METADATA, INITIAL_DESIGN_NOTES);
  }

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1;
      const targetState = historyRef.current[pointerRef.current];
      if (targetState) {
        setNodes(JSON.parse(JSON.stringify(targetState.nodes)));
        setConnections(JSON.parse(JSON.stringify(targetState.connections)));
        setMetadata(JSON.parse(JSON.stringify(targetState.metadata)));
        setDesignNotes(targetState.designNotes);
      }
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1;
      const targetState = historyRef.current[pointerRef.current];
      if (targetState) {
        setNodes(JSON.parse(JSON.stringify(targetState.nodes)));
        setConnections(JSON.parse(JSON.stringify(targetState.connections)));
        setMetadata(JSON.parse(JSON.stringify(targetState.metadata)));
        setDesignNotes(targetState.designNotes);
      }
    }
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  // Add Equipment Node
  const addNode = useCallback(
    (type: EquipmentType, customX?: number, customY?: number, nameOverride?: string) => {
      const libraryPreset = LIBRARY_ITEMS.find((item) => item.type === type);
      const prefixMap: Record<EquipmentType, string> = {
        pv_array: 'PV',
        combiner_box: 'COMB',
        inverter: 'INV',
        battery: 'BESS',
        grid: 'GRID',
        generator: 'GEN',
        ac_panel: 'MDP',
        inverter_load_panel: 'CRIT',
        non_inverter_load_panel: 'HEAVY',
      };

      const prefix = prefixMap[type] || 'EQ';
      const existingCount = nodes.filter((n) => n.type === type).length + 1;
      const newId = `${prefix}-0${existingCount}`;

      const newNode: EquipmentNode = {
        id: newId,
        name: nameOverride || libraryPreset?.defaultName || `${type.replace('_', ' ').toUpperCase()} #${existingCount}`,
        type,
        capacity: libraryPreset?.defaultCapacity || '10.0 kW',
        voltage: libraryPreset?.defaultVoltage || '240 VAC',
        location: 'Utility Area',
        notes: libraryPreset?.description || 'Newly added equipment node.',
        imageUrl: libraryPreset?.imageUrl || EQUIPMENT_IMAGES[type],
        specSheetUrl: libraryPreset?.specSheetUrl || '',
        x: customX ?? 300 + (nodes.length % 5) * 40,
        y: customY ?? 200 + (nodes.length % 5) * 40,
        status: 'planned',
        manufacturer: libraryPreset?.defaultManufacturer || 'Generic Solar',
        model: libraryPreset?.defaultModel || 'Model-X',
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setSelectedNodeId(newNode.id);
      setSelectedConnectionId(null);
      saveStateToHistory(updatedNodes, connections, metadata, designNotes);
      return newNode;
    },
    [nodes, connections, metadata, designNotes, saveStateToHistory]
  );

  // Move Node Position
  const moveNode = useCallback(
    (id: string, x: number, y: number) => {
      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((node) => (node.id === id ? { ...node, x, y } : node));
        return nextNodes;
      });
    },
    []
  );

  // Finalize Node Move for history stack
  const finalizeMoveNode = useCallback(() => {
    saveStateToHistory(nodes, connections, metadata, designNotes);
  }, [nodes, connections, metadata, designNotes, saveStateToHistory]);

  // Update Node Fields
  const updateNode = useCallback(
    (id: string, updates: Partial<EquipmentNode>) => {
      const nextNodes = nodes.map((n) => (n.id === id ? { ...n, ...updates } : n));
      setNodes(nextNodes);
      saveStateToHistory(nextNodes, connections, metadata, designNotes);
    },
    [nodes, connections, metadata, designNotes, saveStateToHistory]
  );

  // Delete Node
  const deleteNode = useCallback(
    (id: string) => {
      const nextNodes = nodes.filter((n) => n.id !== id);
      const nextConns = connections.filter((c) => c.fromNodeId !== id && c.toNodeId !== id);
      setNodes(nextNodes);
      setConnections(nextConns);
      if (selectedNodeId === id) setSelectedNodeId(null);
      saveStateToHistory(nextNodes, nextConns, metadata, designNotes);
    },
    [nodes, connections, selectedNodeId, metadata, designNotes, saveStateToHistory]
  );

  // Add Connection
  const addConnection = useCallback(
    (fromNodeId: string, fromPort: PortId, toNodeId: string, toPort: PortId, type: ConnectionCategory = 'dc', label?: string) => {
      if (fromNodeId === toNodeId) return; // Prevent self connection

      // Prevent exact duplicate connections
      const exists = connections.some(
        (c) =>
          (c.fromNodeId === fromNodeId && c.fromPort === fromPort && c.toNodeId === toNodeId && c.toPort === toPort) ||
          (c.fromNodeId === toNodeId && c.fromPort === toPort && c.toNodeId === fromNodeId && c.toPort === fromPort)
      );
      if (exists) return;

      const newConn: Connection = {
        id: `C-${Date.now().toString().slice(-4)}`,
        fromNodeId,
        fromPort,
        toNodeId,
        toPort,
        type,
        label: label || `${type.toUpperCase()} Feeder Line`,
      };

      const nextConns = [...connections, newConn];
      setConnections(nextConns);
      setSelectedConnectionId(newConn.id);
      saveStateToHistory(nodes, nextConns, metadata, designNotes);
    },
    [connections, nodes, metadata, designNotes, saveStateToHistory]
  );

  // Delete Connection
  const deleteConnection = useCallback(
    (connId: string) => {
      const nextConns = connections.filter((c) => c.id !== connId);
      setConnections(nextConns);
      if (selectedConnectionId === connId) setSelectedConnectionId(null);
      saveStateToHistory(nodes, nextConns, metadata, designNotes);
    },
    [connections, selectedConnectionId, nodes, metadata, designNotes, saveStateToHistory]
  );

  // Auto Layout Nodes algorithm
  const autoLayout = useCallback(() => {
    // Arrange nodes into logical schematic columns left-to-right:
    // Col 1 (X=80): PV Arrays, Generators
    // Col 2 (X=360): Combiner Boxes, Generators
    // Col 3 (X=640): Inverters, Battery BESS
    // Col 4 (X=920): Main Panels (MDP), Critical Panels
    // Col 5 (X=1200): Grid, Non-Inverter Panels
    const colMap: Record<EquipmentType, number> = {
      pv_array: 80,
      generator: 80,
      combiner_box: 360,
      inverter: 640,
      battery: 640,
      ac_panel: 920,
      inverter_load_panel: 920,
      grid: 1200,
      non_inverter_load_panel: 1200,
    };

    const colYCounts: Record<number, number> = {
      80: 100,
      360: 100,
      640: 100,
      920: 100,
      1200: 100,
    };

    const nextNodes = nodes.map((node) => {
      const x = colMap[node.type] || 600;
      const currentY = colYCounts[x] || 100;
      colYCounts[x] = currentY + 220; // vertical spacing
      return {
        ...node,
        x,
        y: currentY,
      };
    });

    setNodes(nextNodes);
    saveStateToHistory(nextNodes, connections, metadata, designNotes);
  }, [nodes, connections, metadata, designNotes, saveStateToHistory]);

  // Update Metadata
  const updateMetadata = useCallback(
    (updates: Partial<ProjectMetadata>) => {
      const nextMeta = { ...metadata, ...updates };
      setMetadata(nextMeta);
      saveStateToHistory(nodes, connections, nextMeta, designNotes);
    },
    [metadata, nodes, connections, designNotes, saveStateToHistory]
  );

  // Update Design Notes
  const updateDesignNotes = useCallback(
    (notes: string) => {
      setDesignNotes(notes);
      saveStateToHistory(nodes, connections, metadata, notes);
    },
    [nodes, connections, metadata, saveStateToHistory]
  );

  // Reset to initial preset state
  const resetToDefault = useCallback(() => {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    setMetadata(DEFAULT_METADATA);
    setDesignNotes(INITIAL_DESIGN_NOTES);
    setSelectedNodeId('INV-01');
    setSelectedConnectionId(null);
    saveStateToHistory(INITIAL_NODES, INITIAL_CONNECTIONS, DEFAULT_METADATA, INITIAL_DESIGN_NOTES);
  }, [saveStateToHistory]);

  // Load custom state from JSON file
  const loadState = useCallback(
    (newState: DiagramState) => {
      if (newState.nodes && newState.connections) {
        setNodes(newState.nodes);
        setConnections(newState.connections);
        if (newState.metadata) setMetadata(newState.metadata);
        if (newState.designNotes) setDesignNotes(newState.designNotes);
        setSelectedNodeId(newState.nodes[0]?.id || null);
        setSelectedConnectionId(null);
        saveStateToHistory(newState.nodes, newState.connections, newState.metadata || DEFAULT_METADATA, newState.designNotes || '');
      }
    },
    [saveStateToHistory]
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedConnection = connections.find((c) => c.id === selectedConnectionId) || null;

  return {
    nodes,
    connections,
    metadata,
    designNotes,
    selectedNode,
    selectedNodeId,
    selectedConnection,
    selectedConnectionId,
    setSelectedNodeId,
    setSelectedConnectionId,
    addNode,
    moveNode,
    finalizeMoveNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    autoLayout,
    updateMetadata,
    updateDesignNotes,
    resetToDefault,
    loadState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
