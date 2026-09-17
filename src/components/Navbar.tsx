import React from 'react';
import { ActiveTab } from '../types';
import { Sparkles, Users, UserCheck, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studentCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onLoadSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  soundEnabled,
  setSoundEnabled,
  isFullscreen,
  toggleFullscreen,
  onLoadSimulation,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    playPopSound(soundEnabled);
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                課堂抽籤與分組
                <span className="hidden sm:inline-block text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  教師專用
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                動畫音效抽籤 · 彈性名單匯入 · 視覺化班級分組
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              id="tab-random-picker"
              onClick={() => handleTabClick('picker')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'picker'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === 'picker' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>隨機抽籤</span>
            </button>

            <button
              id="tab-auto-grouper"
              onClick={() => handleTabClick('grouper')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'grouper'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'grouper' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>自動分組</span>
            </button>

            <button
              id="tab-student-manager"
              onClick={() => handleTabClick('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${activeTab === 'students' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>名單管理</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'students'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200/80 text-slate-700'
              }`}>
                {studentCount}
              </span>
            </button>
          </nav>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            {onLoadSimulation && (
              <button
                id="quick-simulation-nav-btn"
                onClick={onLoadSimulation}
                title="一鍵載入模擬示範名單（包含故意設計的重複姓名，方便體驗系統所有功能）"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>模擬名單體驗</span>
              </button>
            )}

            <button
              id="toggle-sound-btn"
              onClick={() => {
                setSoundEnabled((prev) => !prev);
              }}
              title={soundEnabled ? '點擊靜音' : '點擊開啟音效'}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="toggle-fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? '退出全螢幕' : '課堂投影全螢幕'}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
