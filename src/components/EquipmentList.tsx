import React, { useState } from 'react';
import {
  Sun,
  Battery,
  Zap,
  Box,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  Filter,
} from 'lucide-react';
import { EquipmentNode, EquipmentType } from '../types';

interface EquipmentListProps {
  nodes: EquipmentNode[];
  onSelectNodeForEdit: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onOpenAddModal: () => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  nodes,
  onSelectNodeForEdit,
  onDeleteNode,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Summary Metrics Calculations
  let totalPvKw = 0;
  let totalBessKwh = 0;
  let totalInverterKw = 0;

  nodes.forEach((n) => {
    if (n.type === 'pv_array') {
      const match = n.capacity.match(/([\d.]+)\s*kW/i);
      if (match) totalPvKw += parseFloat(match[1]);
    } else if (n.type === 'battery') {
      const match = n.capacity.match(/([\d.]+)\s*kWh/i);
      if (match) totalBessKwh += parseFloat(match[1]);
    } else if (n.type === 'inverter') {
      const match = n.capacity.match(/([\d.]+)\s*kW/i);
      if (match) totalInverterKw += parseFloat(match[1]);
    }
  });

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#181c1f]">Equipment Inventory &amp; Bill of Materials (BOM)</h1>
            <p className="text-xs text-[#434654] mt-0.5">
              Comprehensive technical schedule of all solar arrays, power conversion units, batteries, panels, and grid assets.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Equipment</span>
          </button>
        </div>

        {/* Top KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#dae2ff] flex items-center justify-center text-[#003d9b]">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#737685] uppercase tracking-wider block">
                Total Solar PV Peak
              </span>
              <span className="text-lg font-bold text-[#181c1f] font-mono">
                {totalPvKw.toFixed(1)} kWp
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#fef3c7] flex items-center justify-center text-[#d97706]">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#737685] uppercase tracking-wider block">
                Total Battery Storage
              </span>
              <span className="text-lg font-bold text-[#181c1f] font-mono">
                {totalBessKwh.toFixed(1)} kWh
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#dbeafe] flex items-center justify-center text-[#0052cc]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#737685] uppercase tracking-wider block">
                Inverter AC Rating
              </span>
              <span className="text-lg font-bold text-[#181c1f] font-mono">
                {totalInverterKw.toFixed(1)} kW AC
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#ebeef2] flex items-center justify-center text-[#181c1f]">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#737685] uppercase tracking-wider block">
                Equipment Items Count
              </span>
              <span className="text-lg font-bold text-[#181c1f] font-mono">
                {nodes.length} Components
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#737685]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name, ID, location, brand..."
              className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded pl-9 pr-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#737685]" />
            <span className="text-xs font-semibold text-[#434654]">Filter Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-1.5 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
            >
              <option value="all">All Equipment Types</option>
              <option value="pv_array">PV Arrays</option>
              <option value="combiner_box">Combiner Boxes</option>
              <option value="inverter">Inverters</option>
              <option value="battery">Batteries</option>
              <option value="grid">Grid Connections</option>
              <option value="generator">Generators</option>
              <option value="ac_panel">AC Panels</option>
            </select>
          </div>
        </div>

        {/* Equipment Schedule Table */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f1f4f8] border-b border-[#c3c6d6] text-[#181c1f] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ref Photo</th>
                  <th className="py-3 px-4">Tag ID</th>
                  <th className="py-3 px-4">Equipment Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Manufacturer &amp; Model</th>
                  <th className="py-3 px-4">Capacity / Rating</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebeef2]">
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-[#737685]">
                      No equipment items match the current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredNodes.map((node) => (
                    <tr
                      key={node.id}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="w-12 h-10 rounded bg-[#ebeef2] border border-[#c3c6d6] overflow-hidden">
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
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-[#003d9b]">
                        {node.id}
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-[#181c1f]">
                        {node.name}
                      </td>

                      <td className="py-2.5 px-4 text-[#434654] uppercase text-[10px] font-bold">
                        {node.type.replace('_', ' ')}
                      </td>

                      <td className="py-2.5 px-4 text-[#181c1f]">
                        <div>{node.manufacturer}</div>
                        <div className="text-[10px] font-mono text-[#737685]">
                          {node.model}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-[#003d9b]">
                        {node.capacity}
                      </td>

                      <td className="py-2.5 px-4 text-[#434654]">
                        {node.location}
                      </td>

                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            node.status === 'installed'
                              ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                              : node.status === 'pending'
                              ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'
                              : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]'
                          }`}
                        >
                          {node.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectNodeForEdit(node.id)}
                            className="p-1.5 text-[#003d9b] hover:bg-[#dae2ff] rounded transition-colors"
                            title="Edit Properties"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {node.specSheetUrl && (
                            <a
                              href={node.specSheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-[#434654] hover:bg-[#ebeef2] rounded transition-colors"
                              title="View Spec Sheet"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => onDeleteNode(node.id)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
