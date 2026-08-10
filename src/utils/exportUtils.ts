import { toPng } from 'html-to-image';
import { EquipmentNode, Connection, ProjectMetadata, DiagramState } from '../types';

export async function exportElementToPng(elementId: string, filename = 'hybrid-solar-bim-diagram.png') {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const dataUrl = await toPng(node, {
      cacheBust: false,
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#f7fafe',
      skipFonts: true,
      filter: (domNode: HTMLElement) => {
        // Skip script or problematic link/iframe elements
        if (domNode.tagName === 'LINK' || domNode.tagName === 'SCRIPT') return false;
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.warn('First PNG export attempt failed, retrying with fallback settings:', err);
    try {
      const dataUrl = await toPng(node, {
        quality: 0.85,
        pixelRatio: 1.5,
        backgroundColor: '#f7fafe',
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (fallbackErr) {
      console.error('Error generating PNG export:', fallbackErr);
      alert('PNG export encounter a browser style embedding limitation. Please use the "Export SVG" button for high-resolution vector output.');
    }
  }
}

export function exportDiagramToSvg(
  nodes: EquipmentNode[],
  connections: Connection[],
  metadata: ProjectMetadata,
  filename = 'hybrid-solar-bim-diagram.svg'
) {
  // Calculate bounding box of diagram
  let minX = 0;
  let minY = 0;
  let maxX = 1400;
  let maxY = 800;

  nodes.forEach((n) => {
    if (n.x + 240 > maxX) maxX = n.x + 280;
    if (n.y + 180 > maxY) maxY = n.y + 220;
  });

  const width = Math.max(maxX, 1200);
  const height = Math.max(maxY, 750);

  // Connection stroke colors by type
  const connColors: Record<string, string> = {
    dc: '#0052cc',
    ac: '#334155',
    comms: '#ea580c',
    ground: '#16a34a',
  };

  // Build connection path SVGs
  const connectionSvgLines = connections
    .map((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
      const toNode = nodes.find((n) => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return '';

      const x1 = fromNode.x + 190;
      const y1 = fromNode.y + 60;
      const x2 = toNode.x + 10;
      const y2 = toNode.y + 60;

      const midX = (x1 + x2) / 2;
      const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      const color = connColors[conn.type] || '#334155';
      const isDashed = conn.type === 'comms' || conn.type === 'ground';

      return `
      <!-- Connection ${conn.id} -->
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" ${isDashed ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#arrow-${conn.type})" />
      <text x="${midX}" y="${(y1 + y2) / 2 - 8}" fill="#475569" font-family="monospace" font-size="10" text-anchor="middle" background="#ffffff">${conn.label || ''}</text>
    `;
    })
    .join('\n');

  // Build Node SVG blocks
  const nodeSvgBlocks = nodes
    .map((node) => {
      const typeBgColors: Record<string, string> = {
        pv_array: '#e0edff',
        combiner_box: '#f1f5f9',
        inverter: '#dbeafe',
        battery: '#fef3c7',
        grid: '#f1f5f9',
        generator: '#fef2f2',
        ac_panel: '#f1f5f9',
        inverter_load_panel: '#e0e7ff',
        non_inverter_load_panel: '#f8fafc',
      };

      const headerBg = typeBgColors[node.type] || '#f1f5f9';

      return `
      <!-- Node ${node.id} -->
      <g transform="translate(${node.x}, ${node.y})">
        <!-- Node Box Shadow & Frame -->
        <rect width="200" height="130" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <!-- Header -->
        <path d="M 0 6 A 6 6 0 0 1 6 0 L 194 0 A 6 6 0 0 1 200 6 L 200 32 L 0 32 Z" fill="${headerBg}" />
        <line x1="0" y1="32" x2="200" y2="32" stroke="#cbd5e1" stroke-width="1" />
        <text x="10" y="21" font-family="sans-serif" font-weight="bold" font-size="12" fill="#0f172a">${node.id}</text>
        <text x="190" y="21" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="end">${node.type.toUpperCase()}</text>
        
        <!-- Details -->
        <text x="10" y="52" font-family="sans-serif" font-weight="600" font-size="12" fill="#1e293b">${escapeXml(node.name.slice(0, 24))}</text>
        <text x="10" y="70" font-family="monospace" font-size="11" fill="#2563eb">Cap: ${escapeXml(node.capacity)}</text>
        <text x="10" y="86" font-family="monospace" font-size="10" fill="#64748b">Volt: ${escapeXml(node.voltage)}</text>
        <text x="10" y="102" font-family="sans-serif" font-size="10" fill="#64748b">Loc: ${escapeXml(node.location.slice(0, 24))}</text>
        <text x="10" y="118" font-family="sans-serif" font-size="9" fill="#059669">Status: ${node.status.toUpperCase()}</text>

        <!-- Port Dots -->
        <circle cx="0" cy="65" r="5" fill="#0052cc" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="200" cy="65" r="5" fill="#0052cc" stroke="#ffffff" stroke-width="1.5" />
      </g>
    `;
    })
    .join('\n');

  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Grid Pattern -->
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    </pattern>
    <!-- Arrow Markers -->
    <marker id="arrow-dc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0052cc" />
    </marker>
    <marker id="arrow-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
    </marker>
    <marker id="arrow-comms" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
    </marker>
  </defs>

  <!-- Background Paper Grid -->
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Drawing Outer Frame -->
  <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#0f172a" stroke-width="2" />

  <!-- Connections Layer -->
  <g id="connections">
    ${connectionSvgLines}
  </g>

  <!-- Equipment Nodes Layer -->
  <g id="nodes">
    ${nodeSvgBlocks}
  </g>

  <!-- Legend Box (Top Right) -->
  <g transform="translate(${width - 260}, 20)">
    <rect width="230" height="90" fill="#ffffff" opacity="0.95" stroke="#cbd5e1" rx="4" />
    <text x="10" y="20" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">ELECTRICAL CONNECTION LEGEND</text>
    <line x1="10" y1="30" x2="40" y2="30" stroke="#0052cc" stroke-width="3" />
    <text x="50" y="33" font-family="sans-serif" font-size="10" fill="#334155">DC Power Line (PV / Battery)</text>
    
    <line x1="10" y1="48" x2="40" y2="48" stroke="#334155" stroke-width="3" />
    <text x="50" y="51" font-family="sans-serif" font-size="10" fill="#334155">AC Power Line (Grid / Panels)</text>

    <line x1="10" y1="66" x2="40" y2="66" stroke="#ea580c" stroke-width="2" stroke-dasharray="4 3" />
    <text x="50" y="69" font-family="sans-serif" font-size="10" fill="#334155">Comms / BMS Control Line</text>
  </g>

  <!-- CAD Title Block Frame at Bottom -->
  <g transform="translate(10, ${height - 70})">
    <rect width="${width - 20}" height="60" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
    <line x1="${(width - 20) * 0.4}" y1="0" x2="${(width - 20) * 0.4}" y2="60" stroke="#cbd5e1" stroke-width="1" />
    <line x1="${(width - 20) * 0.7}" y1="0" x2="${(width - 20) * 0.7}" y2="60" stroke="#cbd5e1" stroke-width="1" />
    
    <!-- Title Info -->
    <text x="15" y="22" font-family="sans-serif" font-size="10" fill="#64748b">PROJECT TITLE</text>
    <text x="15" y="42" font-family="sans-serif" font-weight="bold" font-size="13" fill="#0f172a">${escapeXml(metadata.title)}</text>
    
    <text x="${(width - 20) * 0.4 + 15}" y="22" font-family="sans-serif" font-size="10" fill="#64748b">RESERVED BY / WEBSITE</text>
    <text x="${(width - 20) * 0.4 + 15}" y="42" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0052cc">${escapeXml(metadata.clientName)} (https://www.iida-imm.com/)</text>
    
    <text x="${(width - 20) * 0.7 + 15}" y="22" font-family="sans-serif" font-size="10" fill="#64748b">DRAWING NO &amp; REVISION</text>
    <text x="${(width - 20) * 0.7 + 15}" y="45" font-family="monospace" font-weight="bold" font-size="16" fill="#0052cc">${escapeXml(metadata.drawingNumber)} (${escapeXml(metadata.revision)})</text>
  </g>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportDiagramToJson(state: DiagramState, filename = 'hybrid-solar-bim-project.json') {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
