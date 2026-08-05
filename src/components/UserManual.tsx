import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Cable,
  Sliders,
  FileSpreadsheet,
  Printer,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle,
  Sun,
  Shield,
  Zap,
  Download,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UserManualProps {
  onOpenAddModal: () => void;
  onNavigateTab: (tab: 'canvas' | 'inventory' | 'bim' | 'gallery' | 'settings') => void;
}

export const UserManual: React.FC<UserManualProps> = ({
  onOpenAddModal,
  onNavigateTab,
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [openStep, setOpenStep] = useState<number | null>(1); // Default step 1 open

  const steps = [
    {
      id: 1,
      titleEn: 'Step 1: Adding Equipment to the BIM Canvas',
      titleJa: 'ステップ 1: BIMキャンバスに機器を追加する',
      icon: Plus,
      categoryEn: 'Canvas Basics',
      categoryJa: 'キャンバス基本',
      summaryEn: 'Learn how to select solar PV panels, hybrid inverters, BESS batteries, and grid connections from preset libraries.',
      summaryJa: '太陽光パネル、ハイブリッドパワコン、蓄電池、電力網等の機器ライブラリからの選択方法を解説します。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            To construct a solar or hybrid energy single-line diagram (SLD), you need to place equipment blocks onto the drawing canvas:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 font-medium text-[#181c1f]">
            <li>
              Click the <strong className="text-[#003d9b]">+ Add Equipment</strong> button in the top navigation bar or the left sidebar palette.
            </li>
            <li>
              Select a category (Generation, Conversion, Storage, Distribution, or Loads) and choose a preset block (e.g., Solar PV Array, Hybrid Inverter, Lithium Battery).
            </li>
            <li>
              Fill in initial properties such as component label, capacity rating (kW/kWh), voltage class, manufacturer, and model number.
            </li>
            <li>
              Click <strong className="text-[#003d9b]">Add Component</strong> to place it on the interactive canvas.
            </li>
          </ol>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">Quick Action: Try adding a component now</span>
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Open Add Modal</span>
            </button>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            太陽光発電・ハイブリッドエネルギーシステムの単線結線図 (SLD) を作成するには、機器ブロックをキャンバス上に配置します：
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 font-medium text-[#181c1f]">
            <li>
              上部ナビゲーションバーまたは左側パレットの <strong className="text-[#003d9b]">+ 機器追加</strong> ボタンをクリックします。
            </li>
            <li>
              カテゴリー（発電・変換・蓄電・配電・負荷）を選択し、目的のコンポーネント（PVアレイ、パワコン、蓄電池等）を選びます。
            </li>
            <li>
              容量 (kW/kWh)、電圧クラス、メーカー、型番等の仕様を入力します。
            </li>
            <li>
              <strong className="text-[#003d9b]">コンポーネントを追加</strong> ボタンを押すとキャンバスに配置されます。
            </li>
          </ol>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">クイックアクション: 機器追加ダイアログを開く</span>
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>機器追加ダイアログ</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      titleEn: 'Step 2: Connecting Electrical Ports & Busses',
      titleJa: 'ステップ 2: 電気ポートとバス（結線）をつなぐ',
      icon: Cable,
      categoryEn: 'Wiring Logic',
      categoryJa: '配線ロジック',
      summaryEn: 'How to draw DC strings, AC power lines, CAN Bus communications, and grounding conductors between ports.',
      summaryJa: 'ポート間をドラッグ＆クリックして、DC直流線、AC交流線、通信線、接地線を正確に配線する方法。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            Each equipment block on the canvas is equipped with visual connection ports representing electrical nodes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-[#fef2f2] border border-[#fca5a5]">
              <span className="font-bold text-[#dc2626] block">🔴 Red Solid Line</span>
              <span>DC Power (Solar PV Strings & Battery Busses)</span>
            </div>
            <div className="p-2 rounded bg-[#f8fafc] border border-[#cbd5e1]">
              <span className="font-bold text-[#334155] block">⚫ Dark Solid Line</span>
              <span>AC Power (Grid, Main Breakers, Load Panels)</span>
            </div>
            <div className="p-2 rounded bg-[#fff7ed] border border-[#ffedd5]">
              <span className="font-bold text-[#ea580c] block">🟧 Orange Dashed Line</span>
              <span>CAN Bus / RS485 Communication Line</span>
            </div>
            <div className="p-2 rounded bg-[#f0fdf4] border border-[#bbf7d0]">
              <span className="font-bold text-[#16a34a] block">🟩 Green Dashed Line</span>
              <span>Grounding & Earth Bonding Conductor</span>
            </div>
          </div>
          <p className="font-medium text-[#181c1f]">
            <strong>To Wire Components:</strong> Click on an output port (circle highlight) on the source block, then click the corresponding input port on the target block. To delete a connection, click the red trash icon on the wire center in canvas view.
          </p>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            キャンバス上の各機器ブロックには、電気的ノードを表すビジュアル接続ポートが配置されています：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-[#fef2f2] border border-[#fca5a5]">
              <span className="font-bold text-[#dc2626] block">🔴 赤色実線</span>
              <span>DC 直流電力（太陽光ストリング・蓄電池バス）</span>
            </div>
            <div className="p-2 rounded bg-[#f8fafc] border border-[#cbd5e1]">
              <span className="font-bold text-[#334155] block">⚫ 黒色実線</span>
              <span>AC 交流電力（電力網・主幹ブレーカー・分電盤）</span>
            </div>
            <div className="p-2 rounded bg-[#fff7ed] border border-[#ffedd5]">
              <span className="font-bold text-[#ea580c] block">🟧 破線オレンジ</span>
              <span>CAN Bus / RS485 通信・制御ライン</span>
            </div>
            <div className="p-2 rounded bg-[#f0fdf4] border border-[#bbf7d0]">
              <span className="font-bold text-[#16a34a] block">🟩 破線グリーン</span>
              <span>接地線・アースライン</span>
            </div>
          </div>
          <p className="font-medium text-[#181c1f]">
            <strong>配線方法:</strong> 出力ポートをクリックし、相手機器の入力ポートをクリックすると線が結線されます。線を削除したい場合は線の中心にあるゴミ箱アイコンをクリックします。
          </p>
        </div>
      ),
    },
    {
      id: 3,
      titleEn: 'Step 3: Editing Technical Specifications & Photo References',
      titleJa: 'ステップ 3: 技術仕様と参考写真の編集',
      icon: Sliders,
      categoryEn: 'Equipment Inspector',
      categoryJa: '属性インスペクター',
      summaryEn: 'Customize equipment capacity ratings, voltage levels, model codes, and high-resolution reference photo URLs.',
      summaryJa: '定格容量、電圧区分、型番、実物写真URLなどをプロパティパネルでリアルタイム編集します。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            When you select any equipment block on the canvas, the right-hand <strong>Equipment Properties Panel</strong> updates automatically:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>Label Name & Status:</strong> Update component tags (e.g., PV Array #1) and installation status (Installed, Pending, Planned, Maintenance).</li>
            <li><strong>Real-World Photo URL:</strong> Paste any direct photo image URL or click "Preset Photo" to load an authentic industrial hardware photo.</li>
            <li><strong>Electrical Specs:</strong> Set capacities (kWp, kWh, kVA), nominal voltages (480V AC, 600V DC), manufacturer, and model numbers.</li>
            <li><strong>Location & Notes:</strong> Record physical room locations (e.g. Inverter Room 102) and NEC compliance engineering notes.</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">Inspect Photo Catalog:</span>
            <button
              onClick={() => onNavigateTab('gallery')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              View Photo Gallery
            </button>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            キャンバス上の機器ブロックを選択すると、画面右側の <strong>機器プロパティパネル</strong> に詳細情報が表示され、編集可能になります：
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>名称・ステータス:</strong> 機器名（例：PV Array #1）や設置状態（設置済、承認待ち、計画中、保守点検）を変更。</li>
            <li><strong>実物写真URL:</strong> 自社の実車・設置現場の画像URLを設定、または「Preset Photo」で標準写真を選択。</li>
            <li><strong>電気的仕様:</strong> 定格容量 (kWp, kWh, kVA)、定格電圧 (480V AC, 600V DC)、メーカー名、モデル番号を入力。</li>
            <li><strong>設置場所・技術メモ:</strong> 設置部屋番号や施工基準 (NEC/IEC) に関するメモを記入。</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">実物写真ギャラリーを見る:</span>
            <button
              onClick={() => onNavigateTab('gallery')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              写真ギャラリーへ移動
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      titleEn: 'Step 4: Bill of Materials (BOM) & Inventory Tracking',
      titleJa: 'ステップ 4: 設備インベントリと部品表 (BOM) の管理',
      icon: FileSpreadsheet,
      categoryEn: 'System Inventory',
      categoryJa: '設備一覧',
      summaryEn: 'Review cumulative solar peak capacity (kWp), battery storage capacity (kWh), and filter all site equipment items.',
      summaryJa: 'サイト全体の太陽光ピーク容量 (kWp)、蓄電容量 (kWh)、機器総数を一覧確認・フィルタリングします。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            Switch to the <strong>Inventory</strong> tab in the navigation bar to manage the full Bill of Materials (BOM):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>Total Capacity Dashboard:</strong> Instantly inspect system-wide totals for Solar PV Peak (kWp), Battery Storage (kWh), and Power Conversion (kW AC).</li>
            <li><strong>Advanced Search & Filter:</strong> Search equipment by component name, model number, location, or equipment category.</li>
            <li><strong>Equipment Table:</strong> Review complete equipment schedules for procurement, maintenance planning, and audit compliance.</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">Open Inventory Tab:</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              Go to Inventory
            </button>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            ナビゲーションの <strong>設備一覧 (Inventory)</strong> タブに切り替えると、全コンポーネントの部品表 (BOM) を管理できます：
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>システム総容量ダッシュボード:</strong> 太陽光ピーク出力 (kWp)、蓄電池総容量 (kWh)、パワコン容量 (kW AC) を即座に集計。</li>
            <li><strong>検索・フィルタリング:</strong> 機器名、モデル番号、設置場所、機器カテゴリーから即座に絞り込み。</li>
            <li><strong>BOMテーブル:</strong> 資材調達・保守計画・監査用の完全なスペックシートを閲覧できます。</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">設備一覧へ移動:</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              設備一覧を開く
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      titleEn: 'Step 5: Exporting CAD Drawings & Technical Sheet Printing',
      titleJa: 'ステップ 5: CAD図面シートの出力と印刷',
      icon: Printer,
      categoryEn: 'CAD Export',
      categoryJa: 'CAD出力',
      summaryEn: 'Generate official ANSI D-Size single-line diagram CAD frames with company header blocks, vector SVG, and high-res PNG formats.',
      summaryJa: '会社表題欄付きのANSI Dサイズ単線結線図CADフレームを生成し、ベクターSVGや高画質PNGでエクスポート・印刷。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            Click the <strong>CAD Sheet</strong> tab to preview the official engineering drawing sheet:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>Standard ANSI D Layout Frame:</strong> Framed with official technical title blocks, scale indicators, legend, and revision table.</li>
            <li><strong>Export High-Res PNG:</strong> Download high-resolution PNG image files suitable for technical reports and presentations.</li>
            <li><strong>Export Vector SVG:</strong> Download resolution-independent SVG vector files for AutoCAD, Visio, or illustrator editing.</li>
            <li><strong>Print Sheet:</strong> Directly trigger browser print dialog formatted for 1:1 blueprint reproduction.</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">Preview CAD Sheet View:</span>
            <button
              onClick={() => onNavigateTab('bim')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              View CAD Sheet
            </button>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            <strong>図面シート (CAD Sheet)</strong> タブを選択すると、公式の技術標準図面シートが表示されます：
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>ANSI Dサイズ標準図面枠:</strong> 会社表題欄、改訂履歴、凡例、縮尺マーク付きの図面フレーム。</li>
            <li><strong>高画質PNG出力:</strong> 技術レポートや提案書にそのまま挿入できる画像ファイルをダウンロード。</li>
            <li><strong>ベクターSVG出力:</strong> AutoCADやイラストレーター等で編集可能なSVGベクターデータをエクスポート。</li>
            <li><strong>印刷:</strong> 1:1の製本・青写真用に最適化された印刷ダイアログを起動。</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">CAD図面シートを表示:</span>
            <button
              onClick={() => onNavigateTab('bim')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              CADシートへ移動
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      titleEn: 'Step 6: Company Metadata & Project Title Block Settings',
      titleJa: 'ステップ 6: 会社メタデータと図面表題欄の設定',
      icon: FileText,
      categoryEn: 'Project Setup',
      categoryJa: 'プロジェクト設定',
      summaryEn: 'Configure drawing revision numbers, client names, site locations, lead designer (P.E.), and IIDA ELECTRONICS ownership notices.',
      summaryJa: '図面番号、クライアント名、設置場所住所、設計責任者名、IIDA ELECTRONICS社所有権のメタデータを設定。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            Open the <strong>Settings</strong> tab to personalize drawing metadata for IIDA ELECTRONICS (MYANMAR) CO.,LTD.:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>Project Title & Drawing Number:</strong> e.g., "100kW Solar Hybrid Energy System" / "DWG-HYBRID-2026-001".</li>
            <li><strong>Site Location & Client:</strong> Enter customer name and physical installation address.</li>
            <li><strong>Engineer Verification:</strong> Assign Lead Designer P.E. name and Quality Checker SE initials.</li>
            <li><strong>Grid Interconnection Ruleset:</strong> Choose IEEE 1547, NEC Article 690/705, or local utility standards.</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">Update Project Settings:</span>
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              Open Settings
            </button>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            <strong>設定 (Settings)</strong> タブを開いて、IIDA ELECTRONICS(MYANMAR) CO.,LTD. 用のメタデータを更新します：
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#181c1f]">
            <li><strong>プロジェクト名・図面番号:</strong> 例：「100kW 太陽光ハイブリッドシステム」 / 「DWG-HYBRID-2026-001」。</li>
            <li><strong>設置場所・クライアント:</strong> 顧客名や設置現場の住所を入力。</li>
            <li><strong>設計責任者・検図者:</strong> 主設計エンジニア名や品質確認責任者イニシャルを設定。</li>
            <li><strong>系統連系標準:</strong> IEEE 1547, NEC 690/705, または現地電波・電力規程を選択。</li>
          </ul>
          <div className="bg-[#f1f4f8] p-3 rounded border border-[#c3c6d6] flex items-center justify-between mt-2">
            <span className="font-semibold text-[#181c1f]">プロジェクト設定を開く:</span>
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-3 py-1 bg-[#003d9b] text-white font-bold rounded hover:bg-[#0052cc] text-xs transition-colors"
            >
              設定へ移動
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      titleEn: 'Step 7: Data Saving & Backend Integration (JSON & Firebase)',
      titleJa: 'ステップ 7: データの保存とバックエンド連携 (JSON & Firebase)',
      icon: Database,
      categoryEn: 'Data & Sync',
      categoryJa: 'データ・同期',
      summaryEn: 'Save single-line diagrams to local JSON files or sync in real-time across company devices using Firebase Cloud Database.',
      summaryJa: '図面データをローカルJSONファイルとして保存・復元、またはFirebaseクラウドデータベースで複数端末間で共有。',
      contentEn: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            Your solar system BIM diagrams can be preserved and managed using two reliable strategies:
          </p>
          <div className="space-y-2 my-2">
            <div className="p-2.5 bg-[#ffffff] border border-[#c3c6d6] rounded shadow-2xs">
              <span className="font-bold text-[#003d9b] text-xs block mb-1">1. Local File Import / Export (JSON)</span>
              <p>
                Click the <strong className="text-[#181c1f]">JSON Download</strong> button in the top header bar to save your complete diagram layout, component specs, and wiring connections as a lightweight <code className="bg-[#f1f4f8] px-1 py-0.5 rounded text-[11px]">.json</code> file. You can load it anytime using the <strong>Upload</strong> button.
              </p>
            </div>
            <div className="p-2.5 bg-[#ffffff] border border-[#003d9b]/30 rounded shadow-2xs">
              <span className="font-bold text-[#003d9b] text-xs block mb-1">2. Cloud Database Persistence (Firebase Firestore)</span>
              <p>
                Firebase Firestore enables real-time cloud backup, project versioning, and team collaboration for engineers at IIDA ELECTRONICS (MYANMAR) CO.,LTD. All changes sync safely to the cloud across mobile and desktop browser sessions.
              </p>
            </div>
          </div>
        </div>
      ),
      contentJa: (
        <div className="space-y-3 text-xs text-[#434654] leading-relaxed">
          <p>
            作成した単線結線図データは、以下の2つの方法で保存およびバックアップできます：
          </p>
          <div className="space-y-2 my-2">
            <div className="p-2.5 bg-[#ffffff] border border-[#c3c6d6] rounded shadow-2xs">
              <span className="font-bold text-[#003d9b] text-xs block mb-1">1. ローカルファイル入出力 (JSON)</span>
              <p>
                ヘッダーの <strong className="text-[#181c1f]">JSON ダウンロード</strong> ボタンをクリックすると、全配置・結線・仕様データを軽量な <code className="bg-[#f1f4f8] px-1 py-0.5 rounded text-[11px]">.json</code> ファイルとして保管できます。アップロードボタンでいつでも復元可能です。
              </p>
            </div>
            <div className="p-2.5 bg-[#ffffff] border border-[#003d9b]/30 rounded shadow-2xs">
              <span className="font-bold text-[#003d9b] text-xs block mb-1">2. クラウドデータベース同期 (Firebase Firestore)</span>
              <p>
                Firebase Firestore を活用することで、IIDA ELECTRONICS 社内のエンジニア間でリアルタイムのクラウド自動バックアップや複数端末同期が可能になります。
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSteps = steps.filter((step) => {
    const term = searchTerm.toLowerCase();
    const title = language === 'ja' ? step.titleJa : step.titleEn;
    const summary = language === 'ja' ? step.summaryJa : step.summaryEn;
    const cat = language === 'ja' ? step.categoryJa : step.categoryEn;
    return (
      title.toLowerCase().includes(term) ||
      summary.toLowerCase().includes(term) ||
      cat.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebeef2] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#003d9b]" />
              <h1 className="text-xl font-bold text-[#181c1f]">
                {language === 'ja'
                  ? 'ユーザーマニュアル & 操作ガイド'
                  : 'User Manual & Step-by-Step Operating Guide'}
              </h1>
            </div>
            <p className="text-xs text-[#434654] mt-1">
              {language === 'ja'
                ? 'IIDA ELECTRONICS 太陽光・ハイブリッドエネルギーシステムWebアプリの完全操作手順書'
                : 'Complete step-by-step documentation for adding equipment, wiring components, and updating company solar hybrid records.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.iida-imm.com/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#dae2ff] text-[#003d9b] font-bold text-xs rounded border border-[#a6c8ff] hover:bg-[#c0d6ff] transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>IIDA ELECTRONICS (MYANMAR)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Company Overview Notice Box */}
        <div className="bg-[#ffffff] border-l-4 border-[#003d9b] border border-[#c3c6d6] rounded p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#003d9b] font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>
              {language === 'ja' ? '社内機器・仕様データの登録ガイド' : 'Registering Actual Company Solar & Hybrid Equipment'}
            </span>
          </div>
          <p className="text-xs text-[#434654]">
            {language === 'ja'
              ? '本アプリケーションでは、自社取扱いのPVモジュール、ハイブリッドパワコン、蓄電池、キュービクル、保護継電器の実機型番や定格仕様をダイアグラムおよび設備インベントリに登録・反映できます。'
              : 'This Web Application is designed specifically to catalog, model, and export actual solar PV panels, hybrid inverters, battery storage arrays, and electrical distribution cubicles used by IIDA ELECTRONICS (MYANMAR) CO.,LTD.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#737685]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'ja'
                ? 'マニュアル内を検索 (例: 機器追加, 結線, CAD, JSON...)'
                : 'Search manual (e.g., adding equipment, wiring, CAD export, JSON...)'
            }
            className="w-full bg-[#ffffff] border border-[#c3c6d6] rounded-md pl-9 pr-4 py-2 text-xs text-[#181c1f] focus:outline-none focus:border-[#003d9b] shadow-2xs"
          />
        </div>

        {/* Manual Accordion Steps */}
        <div className="space-y-3">
          {filteredSteps.map((step) => {
            const isOpen = openStep === step.id;
            const StepIcon = step.icon;
            const title = language === 'ja' ? step.titleJa : step.titleEn;
            const summary = language === 'ja' ? step.summaryJa : step.summaryEn;
            const category = language === 'ja' ? step.categoryJa : step.categoryEn;

            return (
              <div
                key={step.id}
                className="bg-[#ffffff] border border-[#c3c6d6] rounded-md shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setOpenStep(isOpen ? null : step.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#003d9b]/10 text-[#003d9b] flex items-center justify-center shrink-0">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#181c1f]">
                          {title}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f1f4f8] text-[#434654] border border-[#e0e3e7]">
                          {category}
                        </span>
                      </div>
                      <p className="text-xs text-[#737685] mt-0.5">{summary}</p>
                    </div>
                  </div>

                  <div className="text-[#737685]">
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#003d9b]" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#ebeef2] bg-[#ffffff]">
                    {language === 'ja' ? step.contentJa : step.contentEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="bg-[#f1f4f8] border border-[#c3c6d6] rounded p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#181c1f] uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-[#059669]" />
            <span>
              {language === 'ja'
                ? '準備完了 - ダイアグラム作成を開始しましょう'
                : 'Ready to Build - Start Customizing Solar System Diagrams'}
            </span>
          </div>
          <p className="text-xs text-[#434654]">
            {language === 'ja'
              ? '「図面キャンバス」タブに切り替えて、ハイブリッド太陽光システムの単線結線図を作成・編集できます。'
              : 'Switch to the "Diagram Canvas" tab above to start adding solar panels, inverters, batteries, and wiring connections.'}
          </p>
          <button
            onClick={() => onNavigateTab('canvas')}
            className="mt-2 px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-xs rounded shadow-xs transition-colors"
          >
            {language === 'ja' ? '図面キャンバスへ移動' : 'Go to Diagram Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
};
