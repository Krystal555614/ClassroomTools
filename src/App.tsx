/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, ActiveTab } from './types';
import { DEFAULT_STUDENTS, PRESET_CLASSES } from './utils/csvParser';
import { Navbar } from './components/Navbar';
import { RandomPicker } from './components/RandomPicker';
import { AutoGrouper } from './components/AutoGrouper';
import { StudentManager } from './components/StudentManager';

const STORAGE_KEY_STUDENTS = 'classroom_roster_data_v1';
const STORAGE_KEY_SOUND = 'classroom_sound_preference_v1';

export default function App() {
  // Load saved students or initial default classroom
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved students', e);
      }
    }
    return DEFAULT_STUDENTS;
  });

  // Sound preference state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SOUND);
        if (saved !== null) {
          return saved === 'true';
        }
      } catch {
        // default true
      }
    }
    return true;
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('picker');

  // Fullscreen tracking
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save students to localStorage', e);
    }
  }, [students]);

  // Sync sound preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {
        // if iframe prohibits or user denies, ignore
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleLoadSimulation = () => {
    const simulationRoster = PRESET_CLASSES[1]; // 模擬測試名單 (26人 · 含重複姓名)
    if (simulationRoster) {
      setStudents(simulationRoster.students);
      setActiveTab('students');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentCount={students.length}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onLoadSimulation={handleLoadSimulation}
      />

      {/* Main Feature Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'picker' && (
          <RandomPicker
            students={students}
            soundEnabled={soundEnabled}
            onGoToRoster={() => setActiveTab('students')}
          />
        )}

        {activeTab === 'grouper' && (
          <AutoGrouper
            students={students}
            soundEnabled={soundEnabled}
            onGoToRoster={() => setActiveTab('students')}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            setStudents={setStudents}
            soundEnabled={soundEnabled}
            onGoToPicker={() => setActiveTab('picker')}
            onGoToGrouper={() => setActiveTab('grouper')}
          />
        )}
      </main>

      {/* Classroom friendly minimalist footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>課堂抽籤與自動分組工具 · 適合智慧大屏與投影教學</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>支援鍵盤快捷鍵：空白鍵 (Space) 抽籤</span>
            <span>·</span>
            <span>本機離線安全儲存</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
