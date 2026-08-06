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
import { Cloud, CheckCircle2, X, Clock, Sun, Database, GitCommit, Calendar, MessageSquare, Tag, Save, ArrowRight } from 'lucide-react';
import { exportElementToPng, exportDiagramToSvg, exportDiagramToJson } from './utils/exportUtils';
import { EquipmentType, EquipmentLibraryItem } from './types';
import { LIBRARY_ITEMS } from './data/presetData';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings' | 'manual'
  >('canvas');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState<EquipmentLibraryItem[]>(LIBRARY_ITEMS);

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
    legendTypes,
    activeWiringType,
    setActiveWiringType,
    addCustomLegendType,
    deleteCustomLegendType,
    updateConnection,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDiagramState();

  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);
  const [isCloudSaveModalOpen, setIsCloudSaveModalOpen] = useState(false);
  const [saveRemark, setSaveRemark] = useState('');
  const [isCloudLoadModalOpen, setIsCloudLoadModalOpen] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);
  const [isLoadingCloudProjects, setIsLoadingCloudProjects] = useState(false);

  // Canvas Panel Visibility State - Default to Focus Canvas View (all hidden)
  const [showPalette, setShowPalette] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);

  const isFocusCanvasMode = !showPalette && !showProperties && !showBottomPanel;

  const handleToggleFocusCanvasMode = () => {
    if (isFocusCanvasMode) {
      setShowPalette(true);
      setShowProperties(true);
      setShowBottomPanel(true);
    } else {
      setShowPalette(false);
      setShowProperties(false);
      setShowBottomPanel(false);
    }
  };

  // Trigger Save Modal
  const handleOpenCloudSaveModal = () => {
    setSaveRemark('');
    setIsCloudSaveModalOpen(true);
  };

  // Submit Cloud Save with Commit Remark & Formatted Timestamp
  const handleCloudSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCloudSaving(true);
      const now = new Date();
      const formattedDate = now.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const diagramData = {
        title: metadata.projectTitle || 'Solar Hybrid System SLD',
        nodes,
        connections,
        metadata,
        designNotes,
        commitRemark: saveRemark.trim() || 'Updated SLD Diagram configuration',
        formattedTimestamp: formattedDate,
        updatedAt: serverTimestamp(),
        createdAt: now.toISOString(),
      };

      await addDoc(collection(db, 'solarDiagrams'), diagramData);
      setCloudNotice(`Saved Snapshot to Cloud! (${formattedDate})`);
      setIsCloudSaveModalOpen(false);
      setTimeout(() => setCloudNotice(null), 5000);
    } catch (err) {
      console.error('Firebase cloud save error:', err);
      setCloudNotice('Cloud save failed. Please try again.');
      setTimeout(() => setCloudNotice(null), 5000);
    } finally {
      setIsCloudSaving(false);
    }
  };

  const handleCloudLoadModalOpen = async () => {
    setIsCloudLoadModalOpen(true);
    setIsLoadingCloudProjects(true);
    try {
      const q = query(collection(db, 'solarDiagrams'), orderBy('createdAt', 'desc'), limit(25));
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
    imageUrl: string,
    category?: string
  ) => {
    const newNode = addNode(type, undefined, undefined, name, category);
    updateNode(newNode.id, {
      category: category || newNode.category,
      capacity,
      voltage,
      manufacturer,
      model,
      location,
      imageUrl,
    });
  };

  const handleSaveCatalogItem = (newItem: EquipmentLibraryItem) => {
    setCatalogItems((prev) => {
      const index = prev.findIndex(
        (item) => item.type === newItem.type && item.defaultName === newItem.defaultName
      );
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });
  };

  const handleAddEquipmentFromCatalog = (item: EquipmentLibraryItem) => {
    const newNode = addNode(item.type, undefined, undefined, item.defaultName, item.category);
    updateNode(newNode.id, {
      category: item.category,
      capacity: item.defaultCapacity,
      voltage: item.defaultVoltage,
      manufacturer: item.defaultManufacturer,
      model: item.defaultModel,
      imageUrl: item.imageUrl,
    });
    setActiveTab('canvas');
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
        onCloudSave={handleOpenCloudSaveModal}
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
            {showPalette && (
              <EquipmentPalette
                onAddEquipment={(type) => {
                  addNode(type);
                }}
                onAddEquipmentFromCatalog={handleAddEquipmentFromCatalog}
                catalogItems={catalogItems}
                onClose={() => setShowPalette(false)}
              />
            )}

            {/* Central Interactive Schematic Board */}
            <DiagramCanvas
              nodes={nodes}
              connections={connections}
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
              legendTypes={legendTypes}
              activeWiringType={activeWiringType}
              onSelectActiveWiringType={setActiveWiringType}
              onAddCustomLegendType={addCustomLegendType}
              onDeleteCustomLegendType={deleteCustomLegendType}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                if (id) {
                  setSelectedConnectionId(null);
                  setShowProperties(true);
                }
              }}
              onSelectConnection={(id) => {
                setSelectedConnectionId(id);
                if (id) {
                  setSelectedNodeId(null);
                  setShowProperties(true);
                }
              }}
              onMoveNode={moveNode}
              onFinalizeMoveNode={finalizeMoveNode}
              onAddConnection={addConnection}
              onUpdateConnection={updateConnection}
              onDeleteNode={deleteNode}
              onDeleteConnection={deleteConnection}
              onAddEquipmentFromDrop={(type, x, y) => {
                addNode(type, x, y);
              }}
              designNotes={designNotes}
              onChangeDesignNotes={updateDesignNotes}
              showPalette={showPalette}
              onTogglePalette={() => setShowPalette(!showPalette)}
              showProperties={showProperties}
              onToggleProperties={() => setShowProperties(!showProperties)}
              showBottomPanel={showBottomPanel}
              onToggleBottomPanel={() => setShowBottomPanel(!showBottomPanel)}
              isFocusCanvasMode={isFocusCanvasMode}
              onToggleFocusCanvasMode={handleToggleFocusCanvasMode}
            />

            {/* Right Properties Side Panel */}
            {showProperties && (
              <PropertiesPanel
                node={selectedNode}
                selectedConnection={selectedConnection}
                connections={connections}
                allNodes={nodes}
                legendTypes={legendTypes}
                onUpdateNode={updateNode}
                onUpdateConnection={updateConnection}
                onDeleteNode={deleteNode}
                onDeleteConnection={deleteConnection}
                onClose={() => {
                  setSelectedNodeId(null);
                  setSelectedConnectionId(null);
                  setShowProperties(false);
                }}
              />
            )}
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
            onAddEquipmentFromCatalog={handleAddEquipmentFromCatalog}
            catalogItems={catalogItems}
            onSaveCatalogItem={handleSaveCatalogItem}
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
        existingCategories={Array.from(new Set(nodes.map((n) => n.category).filter(Boolean) as string[]))}
        catalogItems={catalogItems}
      />

      {/* Cloud Save Version Modal */}
      {isCloudSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#c3c6d6] w-full max-w-md overflow-hidden animate-fade-in font-sans">
            <div className="bg-[#003d9b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-[#a6c8ff]" />
                <h2 className="font-bold text-sm uppercase tracking-wider">
                  Save Diagram Version to Cloud
                </h2>
              </div>
              <button
                onClick={() => setIsCloudSaveModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloudSaveSubmit} className="p-4 space-y-4">
              <div className="bg-[#f8fafc] p-3 rounded border border-[#c3c6d6] text-xs text-[#434654] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#181c1f]">Project:</span>
                  <span>{metadata.projectTitle || 'Solar Hybrid System'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#181c1f]">Drawing No:</span>
                  <span>{metadata.drawingNumber || 'DWG-001'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#181c1f]">Component Stats:</span>
                  <span>{nodes.length} Nodes | {connections.length} Wires</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181c1f] mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#003d9b]" />
                  <span>Version / Update Remark (Commit Note):</span>
                </label>
                <textarea
                  value={saveRemark}
                  onChange={(e) => setSaveRemark(e.target.value)}
                  placeholder="e.g., Added 100kW hybrid inverter, connected BESS battery bank and adjusted PV string wiring..."
                  rows={3}
                  className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded p-2.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b] shadow-2xs"
                  required
                />
                <p className="text-[11px] text-[#737685] mt-1">
                  This version note and timestamp will be stored permanently in Firebase Cloud Firestore.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebeef2]">
                <button
                  type="button"
                  onClick={() => setIsCloudSaveModalOpen(false)}
                  className="px-4 py-2 bg-[#ffffff] hover:bg-[#e0e3e7] text-[#434654] font-bold text-xs border border-[#c3c6d6] rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCloudSaving}
                  className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCloudSaving ? 'Saving to Cloud...' : 'Commit to Cloud'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Projects Load Modal */}
      {isCloudLoadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#c3c6d6] w-full max-w-xl overflow-hidden animate-fade-in font-sans">
            <div className="bg-[#181c1f] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#a6c8ff]" />
                <div>
                  <h2 className="font-bold text-sm uppercase tracking-wider">
                    Firebase Cloud Database - Saved Versions
                  </h2>
                  <p className="text-[11px] text-[#a6c8ff] font-normal">
                    Select a previous diagram snapshot and restore state with full history log
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCloudLoadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[28rem] overflow-y-auto space-y-3">
              {isLoadingCloudProjects ? (
                <div className="text-center py-10 text-xs text-[#737685] space-y-2">
                  <div className="w-6 h-6 border-2 border-[#003d9b] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Fetching saved version logs from Firebase Cloud Database...</p>
                </div>
              ) : cloudProjects.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737685]">
                  <p>No saved version logs found in Firebase Cloud Database yet.</p>
                  <p className="mt-1 text-[11px] text-[#003d9b]">
                    Click "Cloud Save" in the top bar to commit your first diagram version.
                  </p>
                </div>
              ) : (
                cloudProjects.map((proj) => {
                  const formatDate = () => {
                    if (proj.formattedTimestamp) return proj.formattedTimestamp;
                    if (proj.createdAt) {
                      try {
                        return new Date(proj.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch (e) {}
                    }
                    if (proj.updatedAt?.seconds) {
                      try {
                        return new Date(proj.updatedAt.seconds * 1000).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch (e) {}
                    }
                    return 'Saved Version';
                  };

                  return (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectCloudProject(proj)}
                      className="p-3.5 bg-[#f8fafc] hover:bg-[#dae2ff]/30 border border-[#c3c6d6] hover:border-[#003d9b] rounded-md cursor-pointer transition-all space-y-2 group shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-[#181c1f]">
                              {proj.title || 'Solar Hybrid System'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#dae2ff] text-[#003d9b] rounded font-bold">
                              {proj.metadata?.drawingNumber || 'DWG-001'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#003d9b] font-semibold mt-1">
                            <Clock className="w-3.5 h-3.5 text-[#003d9b] shrink-0" />
                            <span>{formatDate()}</span>
                          </div>
                        </div>

                        <button className="px-3 py-1.5 bg-[#003d9b] group-hover:bg-[#0052cc] text-white text-xs font-bold rounded transition-colors flex items-center gap-1 shrink-0">
                          <span>Restore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remark / Commit Note Box */}
                      {proj.commitRemark && (
                        <div className="p-2 bg-[#ffffff] rounded border border-[#c3c6d6] text-xs text-[#181c1f] flex items-start gap-1.5">
                          <GitCommit className="w-3.5 h-3.5 text-[#003d9b] shrink-0 mt-0.5" />
                          <span className="font-medium">
                            <strong className="text-[#003d9b] mr-1">Note:</strong>
                            {proj.commitRemark}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-[#737685] font-mono pt-1 border-t border-[#ebeef2]">
                        <span>Nodes: {proj.nodes?.length || 0}</span>
                        <span>Wires: {proj.connections?.length || 0}</span>
                        <span>Client: {proj.metadata?.clientName || 'IIDA ELECTRONICS'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-[#f1f4f8] p-3 border-t border-[#ebeef2] flex justify-end">
              <button
                onClick={() => setIsCloudLoadModalOpen(false)}
                className="px-4 py-1.5 bg-[#ffffff] hover:bg-[#e0e3e7] text-[#434654] font-bold text-xs border border-[#c3c6d6] rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
