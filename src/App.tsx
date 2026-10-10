import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InterviewView } from './components/InterviewView';
import { TrainingView } from './components/TrainingView';
import { HistoryView } from './components/HistoryView';
import { MessageSquareCode, GraduationCap, CheckCircle2, Sparkles } from 'lucide-react';

interface SavedSession {
  id: string;
  type: 'interview' | 'training';
  title: string;
  date: string;
  data: any;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'training' | 'history'>('interview');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Load saved sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('coach_saved_sessions_v1');
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  const handleSaveSession = (newSession: SavedSession) => {
    setSavedSessions((prev) => {
      const updated = [newSession, ...prev.filter((s) => s.id !== newSession.id)].slice(0, 30);
      try {
        localStorage.setItem('coach_saved_sessions_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not write to localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (confirm('Tüm geçmiş analizleri silmek istediğinize emin misiniz?')) {
      setSavedSessions([]);
      localStorage.removeItem('coach_saved_sessions_v1');
    }
  };

  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('coach_saved_sessions_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not write to localStorage', e);
      }
      return updated;
    });
  };

  const handleSelectSession = (session: SavedSession) => {
    setActiveTab(session.type);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickStart={() => setActiveTab('interview')}
        savedCount={savedSessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'interview' && (
          <InterviewView onSaveSession={handleSaveSession} />
        )}

        {activeTab === 'training' && (
          <TrainingView onSaveSession={handleSaveSession} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={savedSessions}
            onSelectSession={handleSelectSession}
            onClearHistory={handleClearHistory}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      {/* Clean Footer (No telemetry, no fake engine buzzwords) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Kariyer & Mülakat Koçu</span>
            <span aria-hidden="true">·</span>
            <span>Üniversite Öğrencileri, Yeni Mezunlar ve Mühendisler İçin AI Destekli Hazırlık</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>STAR Metodu & Yetkinlik Analizi</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
