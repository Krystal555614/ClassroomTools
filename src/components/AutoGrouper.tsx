import React, { useState, useMemo } from 'react';
import { Student, Group, GroupTheme } from '../types';
import { playShuffleSound, playPopSound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Shuffle,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRightLeft,
  Settings2,
  Sliders,
  Download
} from 'lucide-react';

interface AutoGrouperProps {
  students: Student[];
  soundEnabled: boolean;
  onGoToRoster: () => void;
}

const THEME_NAMES: Record<GroupTheme, { label: string; names: { name: string; icon: string }[] }> = {
  numbers: {
    label: '數字組別 (第 1 組)',
    names: Array.from({ length: 20 }, (_, i) => ({
      name: `第 ${i + 1} 組`,
      icon: `0${i + 1}`.slice(-2),
    })),
  },
  animals: {
    label: '動物隊伍 (獅子、雄鷹)',
    names: [
      { name: '雄獅隊', icon: '🦁' },
      { name: '猛虎隊', icon: '🐯' },
      { name: '雄鷹隊', icon: '🦅' },
      { name: '海豚隊', icon: '🐬' },
      { name: '野狼隊', icon: '🐺' },
      { name: '貓熊隊', icon: '🐼' },
      { name: '靈狐隊', icon: '🦊' },
      { name: '飛馬隊', icon: '🦄' },
      { name: '無尾熊隊', icon: '🐨' },
      { name: '企鵝隊', icon: '🐧' },
      { name: '白熊隊', icon: '🐻' },
      { name: '獵豹隊', icon: '🐆' },
    ],
  },
  colors: {
    label: '戰隊色彩 (紅隊、藍隊)',
    names: [
      { name: '赤紅組', icon: '🔴' },
      { name: '湛藍組', icon: '🔵' },
      { name: '翠綠組', icon: '🟢' },
      { name: '暖金組', icon: '🟡' },
      { name: '炫紫組', icon: '🟣' },
      { name: '旭日橘', icon: '🟠' },
      { name: '青空青', icon: '🩵' },
      { name: '玫瑰粉', icon: '🩷' },
      { name: '曜石黑', icon: '⚫' },
      { name: '純真白', icon: '⚪' },
    ],
  },
  planets: {
    label: '星際太空 (太陽、火星)',
    names: [
      { name: '太陽組', icon: '☀️' },
      { name: '月光組', icon: '🌙' },
      { name: '火星探索隊', icon: '🚀' },
      { name: '木星光環隊', icon: '🪐' },
      { name: '金星耀芒隊', icon: '✨' },
      { name: '彗星獵人隊', icon: '☄️' },
      { name: '海王星隊', icon: '🌊' },
      { name: '銀河艦隊', icon: '🌌' },
    ],
  },
};

const COLOR_PALETTES = [
  {
    bg: 'bg-indigo-50/50',
    border: 'border-indigo-200',
    headerBg: 'bg-indigo-600',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    headerBg: 'bg-emerald-600',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    headerBg: 'bg-amber-600',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    bg: 'bg-rose-50/50',
    border: 'border-rose-200',
    headerBg: 'bg-rose-600',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800',
  },
  {
    bg: 'bg-violet-50/50',
    border: 'border-violet-200',
    headerBg: 'bg-violet-600',
    text: 'text-violet-900',
    badge: 'bg-violet-100 text-violet-800',
  },
  {
    bg: 'bg-sky-50/50',
    border: 'border-sky-200',
    headerBg: 'bg-sky-600',
    text: 'text-sky-900',
    badge: 'bg-sky-100 text-sky-800',
  },
  {
    bg: 'bg-teal-50/50',
    border: 'border-teal-200',
    headerBg: 'bg-teal-600',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-800',
  },
  {
    bg: 'bg-orange-50/50',
    border: 'border-orange-200',
    headerBg: 'bg-orange-600',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
  },
];

export const AutoGrouper: React.FC<AutoGrouperProps> = ({
  students,
  soundEnabled,
  onGoToRoster,
}) => {
  // Grouping mode: 'bySize' (幾個人一組) vs 'byCount' (分成幾組)
  const [groupMode, setGroupMode] = useState<'bySize' | 'byCount'>('bySize');
  const [groupSize, setGroupSize] = useState<number>(4);
  const [groupCount, setGroupCount] = useState<number>(4);
  const [distributeRemainder, setDistributeRemainder] = useState<boolean>(true); // 平均分配餘數
  const [theme, setTheme] = useState<GroupTheme>('numbers');

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Moving student between groups
  const [selectedStudentForMove, setSelectedStudentForMove] = useState<{
    student: Student;
    sourceGroupId: string;
  } | null>(null);

  // Quick estimation calculation
  const estimatedGroupCount = useMemo(() => {
    if (students.length === 0) return 0;
    if (groupMode === 'bySize') {
      const size = Math.max(1, groupSize);
      if (distributeRemainder) {
        return Math.floor(students.length / size) || 1;
      } else {
        return Math.ceil(students.length / size);
      }
    } else {
      return Math.min(groupCount, students.length);
    }
  }, [students.length, groupMode, groupSize, groupCount, distributeRemainder]);

  // Execute Auto Grouping
  const handleGenerateGroups = () => {
    if (students.length === 0) return;

    setIsShuffling(true);
    playShuffleSound(soundEnabled);

    // Shuffle students with Fisher-Yates
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let numGroups = 1;
    if (groupMode === 'byCount') {
      numGroups = Math.max(1, Math.min(groupCount, shuffled.length));
    } else {
      const size = Math.max(1, groupSize);
      if (distributeRemainder) {
        numGroups = Math.max(1, Math.floor(shuffled.length / size));
      } else {
        numGroups = Math.max(1, Math.ceil(shuffled.length / size));
      }
    }

    // Allocate containers
    const themePool = THEME_NAMES[theme].names;
    const generated: Group[] = Array.from({ length: numGroups }, (_, i) => {
      const themeItem = themePool[i % themePool.length];
      const palette = COLOR_PALETTES[i % COLOR_PALETTES.length];
      return {
        id: `group-${i + 1}-${Date.now()}`,
        name: theme === 'numbers' ? `第 ${i + 1} 組` : themeItem.name,
        icon: themeItem.icon,
        color: palette,
        members: [],
      };
    });

    // Round-robin distribution for balanced group sizes
    shuffled.forEach((student, index) => {
      const targetGroupIndex = index % numGroups;
      generated[targetGroupIndex].members.push(student);
    });

    setTimeout(() => {
      setGroups(generated);
      setIsShuffling(false);
      setSelectedStudentForMove(null);
    }, 300);
  };

  // Move student to another group
  const handleMoveStudent = (targetGroupId: string) => {
    if (!selectedStudentForMove) return;
    const { student, sourceGroupId } = selectedStudentForMove;
    if (sourceGroupId === targetGroupId) {
      setSelectedStudentForMove(null);
      return;
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === sourceGroupId) {
          return {
            ...g,
            members: g.members.filter((m) => m.id !== student.id),
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            members: [...g.members, student],
          };
        }
        return g;
      })
    );

    setSelectedStudentForMove(null);
    playPopSound(soundEnabled);
  };

  // Copy formatted grouping results
  const handleCopyResults = () => {
    if (groups.length === 0) return;

    let text = `📋 班級分組名單 (共 ${students.length} 人，分成 ${groups.length} 組)\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;

    groups.forEach((g) => {
      const memberNames = g.members
        .map((m) => (m.number ? `[${m.number}] ${m.name}` : m.name))
        .join('、');
      text += `【${g.name}】(${g.members.length}人)\n${memberNames || '（無成員）'}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    playPopSound(soundEnabled);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download grouping results as CSV file with UTF-8 BOM
  const handleDownloadCSV = () => {
    if (groups.length === 0) return;

    // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows/Mac properly displays Chinese characters
    let csvContent = '\uFEFF組別,組別人數,座號,學生姓名\n';

    groups.forEach((g) => {
      g.members.forEach((m) => {
        const seatNo = m.number !== undefined ? m.number : '';
        const safeGroupName = `"${g.name.replace(/"/g, '""')}"`;
        const safeName = `"${m.name.replace(/"/g, '""')}"`;
        csvContent += `${safeGroupName},${g.members.length},${seatNo},${safeName}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `班級分組名單_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playPopSound(soundEnabled);
  };

  // Print friendly view
  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">尚未建立學生名單</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          在開始自動分組前，請先匯入或貼上班級學生名單。
        </p>
        <button
          onClick={onGoToRoster}
          className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all text-sm"
        >
          前往名單管理匯入學生
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Setting Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              自動分組設定
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              可依「每組人數」或「指定組數」自動隨機平均分配，並自訂組別主題名稱
            </p>
          </div>

          {/* Quick stats pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              參與分組總人數：<strong className="text-indigo-600 font-bold">{students.length}</strong> 人
            </span>
          </div>
        </div>

        {/* Grouping Mode Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mode 1: Set by Size vs Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              分組方式
            </label>
            <div className="flex items-center gap-2">
              <button
                id="group-by-size-tab"
                type="button"
                onClick={() => setGroupMode('bySize')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  groupMode === 'bySize'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                依「每組人數」
              </button>
              <button
                id="group-by-count-tab"
                type="button"
                onClick={() => setGroupMode('byCount')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  groupMode === 'byCount'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                依「組別總數」
              </button>
            </div>

            {/* Sub-inputs */}
            <div className="pt-1">
              {groupMode === 'bySize' ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">每組：</span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setGroupSize((s) => Math.max(2, s - 1))}
                        className="w-8 h-8 rounded-l-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={2}
                        max={students.length}
                        value={groupSize}
                        onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
                        className="w-12 h-8 text-center text-sm font-bold border-y border-slate-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setGroupSize((s) => Math.min(students.length, s + 1))}
                        className="w-8 h-8 rounded-r-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">人</span>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">
                    (預計約 {estimatedGroupCount} 組)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">分成：</span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setGroupCount((c) => Math.max(2, c - 1))}
                        className="w-8 h-8 rounded-l-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={2}
                        max={students.length}
                        value={groupCount}
                        onChange={(e) => setGroupCount(Math.max(1, Number(e.target.value)))}
                        className="w-12 h-8 text-center text-sm font-bold border-y border-slate-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setGroupCount((c) => Math.min(students.length, c + 1))}
                        className="w-8 h-8 rounded-r-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">組</span>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">
                    (每組約 {Math.round(students.length / Math.max(1, groupCount))} 人)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mode 2: Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              組別名稱主題
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as GroupTheme)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Object.entries(THEME_NAMES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              分組時將自動套用活潑的隊伍名稱與專屬代表圖示
            </p>
          </div>

          {/* Mode 3: Action Trigger */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              id="generate-groups-btn"
              type="button"
              onClick={handleGenerateGroups}
              disabled={isShuffling}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? '正在打散分配...' : '立即自動隨機分組'}</span>
            </button>
            <span className="text-[11px] text-slate-400 text-center">
              每次點擊皆會徹底打散隨機重分
            </span>
          </div>
        </div>
      </div>

      {/* Group Results Visualization */}
      {groups.length > 0 ? (
        <div className="space-y-4">
          {/* Action header for results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>分組結果預覽</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  已完成 {groups.length} 個組別
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="download-group-csv-btn"
                onClick={handleDownloadCSV}
                title="下載包含組別、座號與學生姓名的 CSV 檔案 (支援 Excel)"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>下載分組 CSV 檔</span>
              </button>

              <button
                id="copy-grouping-btn"
                onClick={handleCopyResults}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">已複製到剪貼簿！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製名單文字</span>
                  </>
                )}
              </button>

              <button
                id="re-shuffle-btn"
                onClick={handleGenerateGroups}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
                <span>重新洗牌</span>
              </button>
            </div>
          </div>

          {/* Interactive Move Banner if a student is chosen */}
          {selectedStudentForMove && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-pulse">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>
                  正在調動：<strong>{selectedStudentForMove.student.name}</strong>，請點擊目標組別完成移動。
                </span>
              </div>
              <button
                onClick={() => setSelectedStudentForMove(null)}
                className="text-xs font-semibold text-amber-700 underline"
              >
                取消調動
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {groups.map((group, groupIdx) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: groupIdx * 0.04 }}
                className={`rounded-2xl border ${group.color.border} bg-white shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  selectedStudentForMove ? 'hover:ring-2 hover:ring-indigo-400 cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (selectedStudentForMove) {
                    handleMoveStudent(group.id);
                  }
                }}
              >
                <div>
                  {/* Group Header */}
                  <div
                    className={`${group.color.headerBg} text-white px-4 py-3 flex items-center justify-between shadow-xs`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{group.icon}</span>
                      <h4 className="font-bold text-sm tracking-wide">{group.name}</h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {group.members.length} 人
                    </span>
                  </div>

                  {/* Members list */}
                  <div className="p-3.5 space-y-2">
                    {group.members.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center italic">
                        暫無組員
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {group.members.map((member, memberIdx) => (
                          <div
                            key={member.id}
                            className="group/member flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold flex items-center justify-center text-[10px] shrink-0">
                                {member.number || memberIdx + 1}
                              </span>
                              <span className="font-medium text-slate-800 truncate">
                                {member.name}
                              </span>
                            </div>

                            {/* Move button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudentForMove({
                                  student: member,
                                  sourceGroupId: group.id,
                                });
                              }}
                              title="調整組別"
                              className="opacity-0 group-hover/member:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer summary */}
                <div className="px-3.5 py-2.5 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>第 {groupIdx + 1} 梯隊</span>
                  {selectedStudentForMove && (
                    <span className="text-indigo-600 font-bold text-[10px]">
                      點擊移至此組
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">尚未進行分組</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            確認上方的人數與組數設定後，點擊「立即自動隨機分組」，系統將立即依設定產生視覺化組別卡片。
          </p>
          <div className="pt-2">
            <button
              onClick={handleGenerateGroups}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Shuffle className="w-3.5 h-3.5" />
              開始第一次分組
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
