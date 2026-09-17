import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Student, DrawHistoryItem } from '../types';
import { playTickSound, playWinnerSound, playPopSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCcw,
  History,
  CheckCircle,
  HelpCircle,
  Clock,
  User,
  Zap,
  Volume2,
  VolumeX,
  Shuffle,
  Users
} from 'lucide-react';

interface RandomPickerProps {
  students: Student[];
  soundEnabled: boolean;
  onGoToRoster: () => void;
}

export const RandomPicker: React.FC<RandomPickerProps> = ({
  students,
  soundEnabled,
  onGoToRoster,
}) => {
  // Settings
  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);
  const [rollSpeed, setRollSpeed] = useState<number>(2.5); // seconds

  // State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentDisplayStudent, setCurrentDisplayStudent] = useState<Student | null>(null);
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [history, setHistory] = useState<DrawHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Available students for drawing
  const availableStudents = useMemo(() => {
    if (allowRepeat) {
      return students;
    }
    return students.filter((s) => !drawnIds.includes(s.id));
  }, [students, allowRepeat, drawnIds]);

  // Keep a ref to latest available students & sound to prevent stale closures
  const availableRef = useRef(availableStudents);
  availableRef.current = availableStudents;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      // Multi-angle blast for lively celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // Ignore if canvas-confetti fails in test environment
    }
  }, []);

  // Execute random draw with animation & sound
  const handleStartDraw = () => {
    if (isRolling) return;
    const candidates = availableRef.current;

    if (candidates.length === 0) {
      return;
    }

    setIsRolling(true);
    setWinnerStudent(null);

    // If only 1 candidate remains, short roll
    const duration = candidates.length === 1 ? 1200 : rollSpeed * 1000;
    const startTime = Date.now();
    let currentInterval = 60; // Initial rapid cycling

    // Pick winning index beforehand
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const chosenWinner = candidates[winnerIndex];

    let lastIndex = -1;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Random name display during roll
      let nextIdx = Math.floor(Math.random() * candidates.length);
      if (candidates.length > 1 && nextIdx === lastIndex) {
        nextIdx = (nextIdx + 1) % candidates.length;
      }
      lastIndex = nextIdx;
      setCurrentDisplayStudent(candidates[nextIdx]);

      // Sound tick: pitch increases slightly as it reaches the end
      const pitch = 380 + progress * 260;
      playTickSound(soundRef.current, pitch);

      if (progress < 1) {
        // Easing: gradual slowdown near the end
        // Quadratic ease-out slowdown
        const nextDelay = 50 + Math.pow(progress, 2.5) * 260;
        rollIntervalRef.current = setTimeout(tick, nextDelay);
      } else {
        // Finished! Reveal winner
        setCurrentDisplayStudent(chosenWinner);
        setWinnerStudent(chosenWinner);
        setIsRolling(false);

        // Record to history and drawn list
        setHistory((prev) => [
          {
            id: `draw-${Date.now()}`,
            student: chosenWinner,
            timestamp: Date.now(),
          },
          ...prev,
        ]);

        if (!allowRepeat) {
          setDrawnIds((prev) => [...prev, chosenWinner.id]);
        }

        // Celebratory sound and confetti
        playWinnerSound(soundRef.current);
        triggerConfetti();
      }
    };

    tick();
  };

  // Reset drawn students
  const handleResetDrawn = () => {
    setDrawnIds([]);
    setWinnerStudent(null);
    setCurrentDisplayStudent(null);
    playPopSound(soundEnabled);
  };

  // Restore one student back to candidate pool
  const handleRestoreCandidate = (studentId: string) => {
    setDrawnIds((prev) => prev.filter((id) => id !== studentId));
    playPopSound(soundEnabled);
  };

  // Keyboard shortcut: Spacebar to roll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRolling) {
        // Only trigger if not focusing an input or textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleStartDraw();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRolling, availableStudents]);

  if (students.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">尚未建立學生名單</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          在開始隨機抽籤前，請先匯入或貼上班級學生名單。
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

  const isPoolEmpty = !allowRepeat && availableStudents.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Control Bar: Repeat toggle & candidate stats */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Repeat Mode Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">抽籤模式：</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              id="mode-no-repeat-btn"
              type="button"
              disabled={isRolling}
              onClick={() => {
                setAllowRepeat(false);
                playPopSound(soundEnabled);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !allowRepeat
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              不重複抽取（推薦）
            </button>
            <button
              id="mode-allow-repeat-btn"
              type="button"
              disabled={isRolling}
              onClick={() => {
                setAllowRepeat(true);
                playPopSound(soundEnabled);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                allowRepeat
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              可重複抽取
            </button>
          </div>
        </div>

        {/* Candidate Pool Stat Badge */}
        <div className="flex items-center gap-3">
          {!allowRepeat ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                剩餘候選：
                <strong className="text-indigo-600 font-bold ml-1 text-sm">
                  {availableStudents.length}
                </strong>{' '}
                / {students.length} 人
              </span>
              {drawnIds.length > 0 && (
                <button
                  id="reset-drawn-pool-btn"
                  onClick={handleResetDrawn}
                  disabled={isRolling}
                  title="重設名單，所有人重新進入候選池"
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  重設輪次
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              候選總人數：<strong className="text-slate-700 font-bold">{students.length}</strong> 人
            </span>
          )}

          {/* Roll duration selector */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>動畫時長：</span>
            <select
              value={rollSpeed}
              onChange={(e) => setRollSpeed(Number(e.target.value))}
              disabled={isRolling}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={1.5}>俐落快抽 (1.5秒)</option>
              <option value={2.5}>標準懸疑 (2.5秒)</option>
              <option value={4.0}>緊張刺激 (4.0秒)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Presentation Stage (Projector & Smartboard friendly) */}
      <div className="relative bg-gradient-to-b from-white via-indigo-50/30 to-violet-50/40 rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12 text-center flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

        {/* Central Display Card */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
          {isPoolEmpty ? (
            /* All students have been drawn state */
            <div className="space-y-4 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">
                🎉 全班同學都已抽過一輪囉！
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                目前沒有尚未抽到的同學。您可以點擊下方按鈕重設抽籤名單，開始新一輪點名。
              </p>
              <div className="pt-2">
                <button
                  id="empty-pool-reset-btn"
                  onClick={handleResetDrawn}
                  className="px-6 py-3 rounded-2xl font-bold text-base bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  重新開始下一輪抽籤
                </button>
              </div>
            </div>
          ) : (
            /* Active Draw or Ready State */
            <div className="w-full flex flex-col items-center space-y-6">
              {/* Display Box */}
              <div
                className={`w-full py-10 px-6 sm:py-14 sm:px-10 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center border ${
                  isRolling
                    ? 'bg-white shadow-xl border-indigo-400 scale-[1.02] ring-4 ring-indigo-100'
                    : winnerStudent
                    ? 'bg-white shadow-lg border-emerald-300 ring-4 ring-emerald-50'
                    : 'bg-white/80 border-slate-200 shadow-sm'
                }`}
              >
                {/* Rolling Ticker or Winner Reveal */}
                <AnimatePresence mode="wait">
                  {isRolling ? (
                    <motion.div
                      key={currentDisplayStudent?.id || 'rolling'}
                      initial={{ opacity: 0.7, y: 15, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0.5, y: -15, scale: 0.96 }}
                      transition={{ duration: 0.08 }}
                      className="space-y-3"
                    >
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs animate-pulse">
                        <Zap className="w-3.5 h-3.5" />
                        抽籤進行中...
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        {currentDisplayStudent?.number && (
                          <span className="text-2xl sm:text-4xl font-bold text-indigo-400 font-mono">
                            #{currentDisplayStudent.number}
                          </span>
                        )}
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-800 tracking-wider">
                          {currentDisplayStudent?.name || '...'}
                        </h2>
                      </div>
                    </motion.div>
                  ) : winnerStudent ? (
                    <motion.div
                      key={winnerStudent.id}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="space-y-3"
                    >
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs tracking-wide">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        幸運抽出！
                      </div>
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        {winnerStudent.number && (
                          <span className="text-2xl sm:text-4xl font-bold text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                            #{winnerStudent.number}
                          </span>
                        )}
                        <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-wider">
                          {winnerStudent.name}
                        </h2>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 py-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700">
                        點擊下方按鈕開始抽籤
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400">
                        支援按鍵盤「空白鍵 (Space)」快速抽籤
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Big Draw Action Button */}
              <div className="pt-2">
                <button
                  id="trigger-draw-btn"
                  onClick={handleStartDraw}
                  disabled={isRolling || isPoolEmpty}
                  className={`px-8 sm:px-12 py-4 rounded-2xl font-bold text-lg sm:text-xl text-white shadow-lg transition-all flex items-center gap-3 cursor-pointer ${
                    isRolling
                      ? 'bg-slate-400 cursor-not-allowed opacity-80 scale-95'
                      : isPoolEmpty
                      ? 'bg-slate-300 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <Sparkles className="w-6 h-6" />
                  <span>
                    {isRolling
                      ? '正在隨機抽出...'
                      : winnerStudent
                      ? '抽下一位同學'
                      : '開始隨機抽籤'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remaining Candidate Badges & History Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Remaining vs Drawn Roster Preview */}
        {!allowRepeat && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>剩餘候選同學 ({availableStudents.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                抽過的同學會移至已抽出區
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
              {availableStudents.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center gap-1.5"
                >
                  {s.number && <span className="text-slate-400 font-mono">#{s.number}</span>}
                  <span>{s.name}</span>
                </span>
              ))}
            </div>

            {drawnIds.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">
                    本輪已抽出同學 ({drawnIds.length} 人，點擊可放回候選)：
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                  {drawnIds.map((id) => {
                    const student = students.find((s) => s.id === id);
                    if (!student) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => handleRestoreCandidate(id)}
                        title="點擊放回候選名單"
                        className="px-2.5 py-0.8 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <span>{student.name}</span>
                        <RotateCcw className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Col: Drawing History */}
        <div className={`${allowRepeat ? 'lg:col-span-3' : 'lg:col-span-1'} bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>抽籤紀錄 ({history.length})</span>
            </h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('確定要清除抽籤紀錄嗎？')) {
                    setHistory([]);
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                清除紀錄
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              尚無抽籤紀錄，點擊「開始抽籤」即可產生成員名單
            </p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {history.map((item, idx) => {
                const date = new Date(item.timestamp);
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-[10px]">
                        {history.length - idx}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {item.student.name}
                      </span>
                      {item.student.number && (
                        <span className="text-slate-400 font-mono">
                          (#{item.student.number})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{timeStr}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
