export type EquipmentType =
  | 'pv_array'
  | 'combiner_box'
  | 'inverter'
  | 'battery'
  | 'grid'
  | 'generator'
  | 'ac_panel'
  | 'inverter_load_panel'
  | 'non_inverter_load_panel';

export type ConnectionCategory = 'dc' | 'ac' | 'comms' | 'ground';

export type EquipmentStatus = 'installed' | 'pending' | 'planned' | 'maintenance';

export interface EquipmentNode {
  id: string;
  name: string;
  type: EquipmentType;
  capacity: string;
  voltage: string;
  location: string;
  notes: string;
  imageUrl: string;
  specSheetUrl?: string;
  x: number;
  y: number;
  status: EquipmentStatus;
  manufacturer: string;
  model: string;
  dimensions?: string;
  weight?: string;
}

export type PortId = 'dc_in' | 'dc_out' | 'ac_in' | 'ac_out' | 'comms' | 'ground' | 'bi_dc' | 'bi_ac';

export interface PortDefinition {
  id: PortId;
  label: string;
  type: ConnectionCategory;
  direction: 'in' | 'out' | 'bi';
  position: 'left' | 'right' | 'top' | 'bottom';
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPort: PortId;
  toNodeId: string;
  toPort: PortId;
  type: ConnectionCategory;
  label?: string;
  voltageRating?: string;
}

export interface ProjectMetadata {
  title: string;
  projectNumber: string;
  clientName: string;
  siteAddress: string;
  designer: string;
  checker: string;
  revision: string;
  date: string;
  drawingNumber: string;
  scale: string;
  interconnectionStandard: string;
  notes: string;
}

export interface DiagramState {
  nodes: EquipmentNode[];
  connections: Connection[];
  metadata: ProjectMetadata;
  designNotes: string;
}

export interface EquipmentLibraryItem {
  type: EquipmentType;
  defaultName: string;
  category: 'Generation' | 'Conversion' | 'Storage' | 'Distribution' | 'Loads';
  defaultCapacity: string;
  defaultVoltage: string;
  defaultManufacturer: string;
  defaultModel: string;
  imageUrl: string;
  specSheetUrl: string;
  description: string;
  iconName: string;
}
