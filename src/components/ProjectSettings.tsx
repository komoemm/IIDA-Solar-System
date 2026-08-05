import React from 'react';
import { ProjectMetadata } from '../types';
import { Save, CheckCircle2, Shield, FileText, Globe, ShieldCheck, ExternalLink } from 'lucide-react';

interface ProjectSettingsProps {
  metadata: ProjectMetadata;
  onUpdateMetadata: (updates: Partial<ProjectMetadata>) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  metadata,
  onUpdateMetadata,
}) => {
  return (
    <div className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#181c1f]">
            Project &amp; CAD Sheet Configuration
          </h1>
          <p className="text-xs text-[#434654] mt-0.5">
            Configure single-line diagram metadata, company information, drawing scale, and code compliance standards.
          </p>
        </div>

        {/* Company Reservation Banner */}
        <div className="bg-[#dae2ff]/40 border border-[#a6c8ff] rounded p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#003d9b] flex items-center justify-center text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#003d9b] block">
                Company Ownership &amp; Reservation Notice
              </span>
              <h2 className="text-base font-bold text-[#181c1f] mt-0.5">
                IIDA ELECTRONICS(MYANMAR) CO.,LTD.
              </h2>
              <p className="text-xs text-[#434654] mt-1">
                This Web Application and all generated BIM single-line diagrams, engineering CAD assets, and system inventory reports are reserved for official company use.
              </p>
            </div>
          </div>

          <a
            href="https://www.iida-imm.com/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Globe className="w-4 h-4" />
            <span>Visit www.iida-imm.com</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>

        {/* Project Metadata Form */}
        <div className="bg-[#ffffff] border border-[#c3c6d6] rounded p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ebeef2]">
            <FileText className="w-5 h-5 text-[#003d9b]" />
            <span className="font-bold text-sm text-[#181c1f] uppercase tracking-wider">
              Drawing Sheet Header Metadata
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => onUpdateMetadata({ title: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs font-bold text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Drawing Number
              </label>
              <input
                type="text"
                value={metadata.drawingNumber}
                onChange={(e) => onUpdateMetadata({ drawingNumber: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs font-mono font-bold text-[#003d9b] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Client / Company Name
              </label>
              <input
                type="text"
                value={metadata.clientName}
                onChange={(e) => onUpdateMetadata({ clientName: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Site Location Address
              </label>
              <input
                type="text"
                value={metadata.siteAddress}
                onChange={(e) => onUpdateMetadata({ siteAddress: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Lead Designer (P.E.)
              </label>
              <input
                type="text"
                value={metadata.designer}
                onChange={(e) => onUpdateMetadata({ designer: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Quality Checker / SE
              </label>
              <input
                type="text"
                value={metadata.checker}
                onChange={(e) => onUpdateMetadata({ checker: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Drawing Revision Level
              </label>
              <input
                type="text"
                value={metadata.revision}
                onChange={(e) => onUpdateMetadata({ revision: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434654] mb-1">
                Interconnection Ruleset
              </label>
              <select
                value={metadata.interconnectionStandard}
                onChange={(e) => onUpdateMetadata({ interconnectionStandard: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#c3c6d6] rounded px-3 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b]"
              >
                <option value="IEEE 1547-2018 / NEC 2023 Code">IEEE 1547-2018 &amp; NEC 2023</option>
                <option value="NEC 2020 Standard">NEC 2020 Standard</option>
                <option value="California Rule 21 / UL 1741-SB">California Rule 21 / UL 1741-SB</option>
                <option value="IEC 60364 International">IEC 60364 International Electrical Code</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
