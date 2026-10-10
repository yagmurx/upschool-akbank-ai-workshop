import React from 'react';
import { History, MessageSquareCode, GraduationCap, Trash2, ArrowRight, Calendar } from 'lucide-react';

interface SavedSession {
  id: string;
  type: 'interview' | 'training';
  title: string;
  date: string;
  data: any;
}

interface HistoryViewProps {
  sessions: SavedSession[];
  onSelectSession: (session: SavedSession) => void;
  onClearHistory: () => void;
  onDeleteSession: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onSelectSession,
  onClearHistory,
  onDeleteSession,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Henüz Kaydedilmiş Analiz Yok</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mülakat simülasyonu başlattığınızda veya eğitim analizi yaptığınızda sonuçlar otomatik olarak tarayıcınızda saklanır ve dilediğiniz zaman tekrar incelenebilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">
            Geçmiş Mülakat & Eğitim Analizleri
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toplam {sessions.length} kayıtlı oturum bulunuyor.
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tüm Geçmişi Temizle</span>
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  session.type === 'interview'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                }`}
              >
                {session.type === 'interview' ? (
                  <MessageSquareCode className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {session.date}
                  </span>
                  <span>·</span>
                  <span>
                    {session.type === 'interview' ? 'Mülakat Simülasyonu' : 'Eğitim Yol Haritası'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectSession(session)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteSession(session.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
