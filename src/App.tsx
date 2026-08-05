import React, { useState } from 'react';
import { useDiagramState } from './hooks/useDiagramState';
import { Header } from './components/Header';
import { EquipmentPalette } from './components/EquipmentPalette';
import { DiagramCanvas } from './components/DiagramCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EquipmentList } from './components/EquipmentList';
import { BimSheetView } from './components/BimSheetView';
import { ReferenceGallery } from './components/ReferenceGallery';
import { ProjectSettings } from './components/ProjectSettings';
import { EquipmentModal } from './components/EquipmentModal';
import {
  exportElementToPng,
  exportDiagramToSvg,
  exportDiagramToJson,
} from './utils/exportUtils';
import { EquipmentType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings'
  >('canvas');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
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
  } = useDiagramState();

  // Export handlers
  const handleExportPng = () => {
    exportElementToPng(
      'diagram-canvas-container',
      `${metadata.drawingNumber}-hybrid-solar-diagram.png`
    );
  };

  const handleExportSvg = () => {
    exportDiagramToSvg(
      nodes,
      connections,
      metadata,
      `${metadata.drawingNumber}-hybrid-solar-diagram.svg`
    );
  };

  const handleExportJson = () => {
    exportDiagramToJson(
      { nodes, connections, metadata, designNotes },
      `${metadata.drawingNumber}-solar-bim-project.json`
    );
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.nodes && json.connections) {
          loadState(json);
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        console.error('JSON parse error:', err);
        alert('Could not parse JSON project file.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddEquipmentFromModal = (
    type: EquipmentType,
    name: string,
    capacity: string,
    voltage: string,
    manufacturer: string,
    model: string,
    location: string,
    imageUrl: string
  ) => {
    const newNode = addNode(type, undefined, undefined, name);
    updateNode(newNode.id, {
      capacity,
      voltage,
      manufacturer,
      model,
      location,
      imageUrl,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f7fafe] font-sans antialiased text-[#181c1f] select-none">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onAutoLayout={autoLayout}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetSample={resetToDefault}
      />

      {/* Viewport Content Area */}
      <main className="flex-1 flex overflow-hidden pt-24 relative">
        {/* TAB 1: Diagram Canvas View */}
        {activeTab === 'canvas' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left Equipment Palette */}
            <EquipmentPalette
              onAddEquipment={(type) => {
                addNode(type);
              }}
            />

            {/* Central Interactive Schematic Board */}
            <DiagramCanvas
              nodes={nodes}
              connections={connections}
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
              onSelectNode={setSelectedNodeId}
              onSelectConnection={setSelectedConnectionId}
              onMoveNode={moveNode}
              onFinalizeMoveNode={finalizeMoveNode}
              onAddConnection={addConnection}
              onDeleteNode={deleteNode}
              onDeleteConnection={deleteConnection}
              onAddEquipmentFromDrop={(type, x, y) => {
                addNode(type, x, y);
              }}
              designNotes={designNotes}
              onChangeDesignNotes={updateDesignNotes}
            />

            {/* Right Properties Side Panel */}
            <PropertiesPanel
              node={selectedNode}
              connections={connections}
              allNodes={nodes}
              onUpdateNode={updateNode}
              onDeleteNode={deleteNode}
              onDeleteConnection={deleteConnection}
              onClose={() => setSelectedNodeId(null)}
            />
          </div>
        )}

        {/* TAB 2: Equipment Inventory & BOM */}
        {activeTab === 'inventory' && (
          <EquipmentList
            nodes={nodes}
            onSelectNodeForEdit={(id) => {
              setSelectedNodeId(id);
              setActiveTab('canvas');
            }}
            onDeleteNode={deleteNode}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {/* TAB 3: BIM Architectural Drawing Sheet */}
        {activeTab === 'bim' && (
          <BimSheetView
            nodes={nodes}
            connections={connections}
            metadata={metadata}
            designNotes={designNotes}
          />
        )}

        {/* TAB 4: Reference Photo Gallery */}
        {activeTab === 'gallery' && (
          <ReferenceGallery
            onAddEquipment={(type) => {
              addNode(type);
              setActiveTab('canvas');
            }}
          />
        )}

        {/* TAB 5: Project & Code Settings */}
        {activeTab === 'settings' && (
          <ProjectSettings
            metadata={metadata}
            onUpdateMetadata={updateMetadata}
          />
        )}
      </main>

      {/* Global Add Equipment Modal */}
      <EquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEquipmentFromModal}
      />
    </div>
  );
}
