import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useDiagramState } from './hooks/useDiagramState';
import { Header } from './components/Header';
import { EquipmentPalette } from './components/EquipmentPalette';
import { DiagramCanvas } from './components/DiagramCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EquipmentList } from './components/EquipmentList';
import { BimSheetView } from './components/BimSheetView';
import { ReferenceGallery } from './components/ReferenceGallery';
import { ProjectSettings } from './components/ProjectSettings';
import { UserManual } from './components/UserManual';
import { EquipmentModal } from './components/EquipmentModal';
import { Cloud, CheckCircle2, X, Clock, Sun, Database } from 'lucide-react';
import {
  exportElementToPng,
  exportDiagramToSvg,
  exportDiagramToJson,
} from './utils/exportUtils';
import { EquipmentType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings' | 'manual'
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

  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);
  const [isCloudLoadModalOpen, setIsCloudLoadModalOpen] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);
  const [isLoadingCloudProjects, setIsLoadingCloudProjects] = useState(false);

  // Firebase Cloud Operations
  const handleCloudSave = async () => {
    try {
      setIsCloudSaving(true);
      const diagramData = {
        title: metadata.projectTitle || 'Solar Hybrid System SLD',
        nodes,
        connections,
        metadata,
        designNotes,
        updatedAt: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'solarDiagrams'), diagramData);
      setCloudNotice('Successfully saved diagram to Firebase Cloud Database!');
      setTimeout(() => setCloudNotice(null), 4000);
    } catch (err) {
      console.error('Firebase cloud save error:', err);
      setCloudNotice('Cloud save failed. Check internet connection.');
      setTimeout(() => setCloudNotice(null), 4000);
    } finally {
      setIsCloudSaving(false);
    }
  };

  const handleCloudLoadModalOpen = async () => {
    setIsCloudLoadModalOpen(true);
    setIsLoadingCloudProjects(true);
    try {
      const q = query(collection(db, 'solarDiagrams'), orderBy('updatedAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCloudProjects(list);
    } catch (err) {
      console.error('Firebase cloud load error:', err);
    } finally {
      setIsLoadingCloudProjects(false);
    }
  };

  const handleSelectCloudProject = (proj: any) => {
    if (proj.nodes && proj.connections && proj.metadata) {
      loadState({
        nodes: proj.nodes,
        connections: proj.connections,
        metadata: proj.metadata,
        designNotes: proj.designNotes || '',
      });
      setCloudNotice(`Loaded cloud project: ${proj.title || 'Solar Diagram'}`);
      setTimeout(() => setCloudNotice(null), 4000);
    }
    setIsCloudLoadModalOpen(false);
  };

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
        onCloudSave={handleCloudSave}
        onCloudLoad={handleCloudLoadModalOpen}
        isCloudSaving={isCloudSaving}
      />

      {/* Cloud Notification Banner */}
      {cloudNotice && (
        <div className="fixed top-28 right-6 z-50 bg-[#003d9b] text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in border border-[#a6c8ff]">
          <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          <span>{cloudNotice}</span>
          <button
            onClick={() => setCloudNotice(null)}
            className="ml-2 hover:bg-white/20 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

        {/* TAB 6: User Manual & Step-by-Step Guide */}
        {activeTab === 'manual' && (
          <UserManual
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Global Add Equipment Modal */}
      <EquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEquipmentFromModal}
      />

      {/* Cloud Projects Load Modal */}
      {isCloudLoadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#c3c6d6] w-full max-w-lg overflow-hidden animate-fade-in font-sans">
            <div className="bg-[#181c1f] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#a6c8ff]" />
                <h2 className="font-bold text-sm uppercase tracking-wider">
                  Firebase Cloud Projects Database
                </h2>
              </div>
              <button
                onClick={() => setIsCloudLoadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {isLoadingCloudProjects ? (
                <div className="text-center py-8 text-xs text-[#737685]">
                  <p>Loading projects from Firebase Firestore...</p>
                </div>
              ) : cloudProjects.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737685]">
                  <p>No saved projects found in Firebase Cloud Database yet.</p>
                  <p className="mt-1 text-[11px] text-[#003d9b]">
                    Click "Cloud Save" in the top bar to save your current SLD diagram.
                  </p>
                </div>
              ) : (
                cloudProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectCloudProject(proj)}
                    className="p-3 bg-[#f8fafc] hover:bg-[#dae2ff]/40 border border-[#c3c6d6] hover:border-[#003d9b] rounded cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-xs text-[#181c1f]">
                        {proj.title || 'Untitled Solar Hybrid Project'}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-[#737685] mt-1 font-mono">
                        <span>DWG: {proj.metadata?.drawingNumber || 'DWG-001'}</span>
                        <span>
                          Nodes: {proj.nodes?.length || 0} | Wires: {proj.connections?.length || 0}
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded transition-colors">
                      Load
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#f1f4f8] p-3 border-t border-[#ebeef2] flex justify-end">
              <button
                onClick={() => setIsCloudLoadModalOpen(false)}
                className="px-4 py-1.5 bg-[#ffffff] hover:bg-[#e0e3e7] text-[#434654] font-bold text-xs border border-[#c3c6d6] rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
