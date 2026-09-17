import React, { useState, useRef, useMemo } from 'react';
import { Student } from '../types';
import {
  parseCSVContent,
  parsePastedNames,
  PRESET_CLASSES,
  findDuplicateNames,
  removeDuplicateStudents,
} from '../utils/csvParser';
import {
  UploadCloud,
  ClipboardPaste,
  Trash2,
  Plus,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface StudentManagerProps {
  students: Student[];
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  soundEnabled: boolean;
  onGoToPicker?: () => void;
  onGoToGrouper?: () => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  setStudents,
  soundEnabled,
  onGoToPicker,
  onGoToGrouper,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Duplicate names detection
  const duplicateNamesSet = useMemo(() => findDuplicateNames(students), [students]);

  const duplicateCounts = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s) => {
      const key = (s.name || '').trim().toLowerCase();
      if (key) map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [students]);

  const duplicateList = useMemo(() => {
    const list: { name: string; count: number }[] = [];
    const seen = new Set<string>();
    students.forEach((s) => {
      const key = (s.name || '').trim().toLowerCase();
      if (key && (duplicateCounts.get(key) || 0) > 1 && !seen.has(key)) {
        seen.add(key);
        list.push({ name: s.name, count: duplicateCounts.get(key) || 0 });
      }
    });
    return list;
  }, [students, duplicateCounts]);

  const hasDuplicates = duplicateList.length > 0;

  // Handle one-click duplicate removal
  const handleRemoveDuplicates = () => {
    const { uniqueStudents, removedCount, duplicateNames } = removeDuplicateStudents(students);
    if (removedCount > 0) {
      setStudents(uniqueStudents);
      playPopSound(soundEnabled);
      showFeedback(
        'success',
        `已成功移除 ${removedCount} 筆重複姓名（${duplicateNames.join('、')}），已保留各自第一筆資料！`
      );
    }
  };

  // Handle CSV / text file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          showFeedback('error', '檔案內容為空');
          return;
        }
        const parsed = parseCSVContent(text);
        if (parsed.length === 0) {
          showFeedback('error', '未能識別名單格式，請確認檔案內容');
          return;
        }

        const dupes = findDuplicateNames(parsed);
        setStudents(parsed);
        playPopSound(soundEnabled);

        if (dupes.size > 0) {
          showFeedback(
            'warning',
            `已匯入 ${parsed.length} 位學生，但偵測到名單中有重複姓名，已為您在下方醒目標記！`
          );
        } else {
          showFeedback('success', `成功匯入 ${parsed.length} 位學生名單！`);
        }
      } catch (err) {
        console.error(err);
        showFeedback('error', '讀取檔案失敗，請檢查檔案格式');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle direct paste import
  const handleApplyPaste = () => {
    if (!pasteText.trim()) {
      showFeedback('error', '請輸入或貼上學生名單');
      return;
    }
    const parsed = parsePastedNames(pasteText);
    if (parsed.length === 0) {
      showFeedback('error', '未能從文字中解析出名單，請依行輸入學生姓名');
      return;
    }

    const dupes = findDuplicateNames(parsed);
    setStudents(parsed);
    setPasteText('');
    playPopSound(soundEnabled);

    if (dupes.size > 0) {
      showFeedback(
        'warning',
        `已貼上匯入 ${parsed.length} 位學生，偵測到重複姓名，已在下方為您標記，可一鍵移除！`
      );
    } else {
      showFeedback('success', `成功貼上匯入 ${parsed.length} 位學生名單！`);
    }
  };

  // Add individual student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nextNumber = newStudentNumber.trim() || (students.length + 1).toString();
    const newStudent: Student = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      number: nextNumber,
      name: newStudentName.trim(),
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName('');
    setNewStudentNumber('');
    playPopSound(soundEnabled);
  };

  // Remove individual student
  const handleRemoveStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    playPopSound(soundEnabled);
  };

  // Clear all
  const handleClearAll = () => {
    if (students.length === 0) return;
    if (window.confirm('確定要清空目前的名單嗎？')) {
      setStudents([]);
      playPopSound(soundEnabled);
      showFeedback('success', '已清空學生名單');
    }
  };

  // Load preset
  const handleLoadPreset = (presetIndex: number) => {
    const preset = PRESET_CLASSES[presetIndex];
    if (preset) {
      setStudents(preset.students);
      playPopSound(soundEnabled);
      const dupes = findDuplicateNames(preset.students);
      if (dupes.size > 0) {
        showFeedback(
          'warning',
          `已載入「${preset.name}」，此模擬名單特別包含重複姓名，供您測試自動標記與一鍵去重！`
        );
      } else {
        showFeedback('success', `已載入範本「${preset.name}」！`);
      }
    }
  };

  // Track rendering occurrences for duplicate visual indicators
  const renderedOccurrences = new Set<string>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Alert message notification */}
      {message && (
        <div
          id="student-manager-feedback"
          className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : message.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : message.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Feature 1 Highlight: Prominent Simulation Roster Guide for Teachers */}
      <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                教師模擬示範名單專區
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                初次使用推薦
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              點擊「模擬測試名單」可立即載入示範名冊（內含故意重複的姓名），讓您直接體驗<strong>重複名單即時標記</strong>、<strong>一鍵去重</strong>、<strong>動畫音效抽籤</strong>與<strong>自動分組</strong>功能！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="load-simulation-test-btn"
              onClick={() => handleLoadPreset(1)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>載入模擬測試名單 (26人 · 含重複)</span>
            </button>

            <button
              id="load-standard-class-btn"
              onClick={() => handleLoadPreset(0)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
            >
              載入標準三年二班 (24人)
            </button>
          </div>
        </div>
      </div>

      {/* Top action header: Presets & Stats */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">名單資料庫</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-xs">
              目前共 {students.length} 位學生
            </span>
            {hasDuplicates && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                發現 {duplicateList.length} 個重複姓名
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            可透過 CSV 上傳、直接貼上或手動新增。資料會自動保存在瀏覽器。
          </p>
        </div>

        {/* Quick presets and Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">其他範本:</span>
          {PRESET_CLASSES.slice(2).map((preset, idx) => (
            <button
              key={preset.name}
              id={`preset-btn-${idx + 2}`}
              onClick={() => handleLoadPreset(idx + 2)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 transition-all"
            >
              {preset.name}
            </button>
          ))}
          {students.length > 0 && (
            <button
              id="clear-roster-btn"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空名單
            </button>
          )}
        </div>
      </div>

      {/* Feature 2: Prominent Duplicate Warning & One-Click Deduplication Banner */}
      {hasDuplicates && (
        <div
          id="duplicate-warning-banner"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-amber-900 flex items-center gap-2">
                名單中發現重複姓名！
                <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                  共 {duplicateList.length} 組重複
                </span>
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                重複學生：
                {duplicateList.map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 font-semibold border border-amber-300 text-amber-900 mx-1 text-xs"
                  >
                    {item.name} ({item.count}次)
                  </span>
                ))}
                已在下方名單以黃色標記。若要保留單一姓名，請點擊右側按鈕。
              </p>
            </div>
          </div>

          <button
            id="one-click-remove-duplicates-btn"
            type="button"
            onClick={handleRemoveDuplicates}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>一鍵移除重複姓名 (保留第一筆)</span>
          </button>
        </div>
      )}

      {/* Import Grid: Upload CSV & Paste Names */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: CSV File Upload */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">方式一：上傳 CSV / Excel 檔案</h3>
                  <p className="text-xs text-slate-500">支援 .csv 或 .txt 名單，包含座號或學生姓名欄位</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="查看格式說明"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {showHelp && (
              <div className="mb-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">📌 支援格式提示：</p>
                <p>1. CSV 表頭若包含「座號」、「姓名」，系統會自動對應。</p>
                <p>2. 單純一列一個名字也能自動識別（例如：王小明、林美惠）。</p>
                <p>3. 若檔案中有重複姓名，匯入後系統會自動標記並提供一鍵去重。</p>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                點擊選擇檔案，或將 CSV 拖曳至此處
              </p>
              <p className="text-xs text-slate-400 mt-1">支援 UTF-8 編碼 CSV / TXT 檔案</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>支援常見台灣國中小教務系統名冊</span>
            <button
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  encodeURIComponent(
                    '\uFEFF座號,姓名\n1,陳冠宇\n2,林子晴\n3,張家豪\n4,黃品妍\n5,陳冠宇\n6,王羽彤'
                  );
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', csvContent);
                downloadAnchor.setAttribute('download', '學生名單範例(含重複姓名示範).csv');
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              下載範例 CSV 檔 (含重複示範)
            </button>
          </div>
        </div>

        {/* Method 2: Paste Raw Text */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <ClipboardPaste className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base">方式二：直接貼上學生名單</h3>
                <p className="text-xs text-slate-500">可從 Excel、Line、記事本直接複製姓名貼上</p>
              </div>
            </div>

            <textarea
              id="paste-roster-textarea"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="在此貼上學生姓名，每行一位，例如：&#10;1. 陳冠宇&#10;2. 林子晴&#10;3. 張家豪&#10;4. 陳冠宇 (若有重複將自動標記)&#10;或用逗號隔開：王小明, 李大華, 張小芳"
              rows={5}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all resize-none bg-slate-50/50"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {pasteText ? `已偵測約 ${parsePastedNames(pasteText).length} 位學生` : '輸入完畢後點擊套用'}
            </span>
            <button
              id="apply-paste-roster-btn"
              onClick={handleApplyPaste}
              disabled={!pasteText.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              套用貼上名單
            </button>
          </div>
        </div>
      </div>

      {/* Manual single student add + Current Roster List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              現有名單預覽
              <span className="text-xs font-normal text-slate-500">
                (共 {students.length} 人)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              可隨時單獨新增或刪除個別學生；重複姓名會特別以黃色加註標籤
            </p>
          </div>

          {/* Quick jump to functions if roster is ready */}
          {students.length > 0 && (
            <div className="flex items-center gap-2">
              {onGoToPicker && (
                <button
                  id="go-to-picker-from-roster"
                  onClick={onGoToPicker}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  前往抽籤
                </button>
              )}
              {onGoToGrouper && (
                <button
                  id="go-to-grouper-from-roster"
                  onClick={onGoToGrouper}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-violet-600" />
                  前往分組
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add single student form */}
        <form onSubmit={handleAddStudent} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="w-20">
            <input
              type="text"
              placeholder="座號"
              value={newStudentNumber}
              onChange={(e) => setNewStudentNumber(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder="學生姓名 (例如：陳大明)"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newStudentName.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            新增學生
          </button>
        </form>

        {/* Roster display table / chips */}
        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">目前名單尚無學生</p>
            <p className="text-xs text-slate-400">
              請從上方上傳 CSV、貼上文字，或點擊頂部「載入模擬測試名單」快速體驗
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 max-h-[420px] overflow-y-auto pr-1">
            {students.map((student, index) => {
              const nameKey = (student.name || '').trim().toLowerCase();
              const isDupe = duplicateNamesSet.has(nameKey);
              const isRepeatedInstance = isDupe && renderedOccurrences.has(nameKey);
              renderedOccurrences.add(nameKey);

              return (
                <div
                  key={student.id}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isDupe
                      ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                        isDupe
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {student.number || index + 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-sm font-medium truncate ${
                            isDupe ? 'text-amber-950 font-bold' : 'text-slate-800'
                          }`}
                          title={student.name}
                        >
                          {student.name}
                        </span>
                        {isDupe && (
                          <span
                            className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-300/80 text-amber-900 shrink-0"
                            title={isRepeatedInstance ? '重複出現的項目' : '此姓名在名單中出現多次'}
                          >
                            {isRepeatedInstance ? '重複' : '重複'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(student.id)}
                    title="移除此學生"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
