import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Target,
  FileText,
  Copy,
  Check,
  Briefcase,
  FolderGit2,
} from 'lucide-react';
import { CurriculumAnalysisResult } from '../types';
import { TRAINING_TEMPLATES, POPULAR_TOPICS, TrainingTemplate } from '../data/presets';

interface TrainingViewProps {
  onSaveSession?: (session: any) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ onSaveSession }) => {
  // Input Form State
  const [completedContent, setCompletedContent] = useState(TRAINING_TEMPLATES[0].content);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(TRAINING_TEMPLATES[0].topics);
  const [customTagInput, setCustomTagInput] = useState('');
  const [targetRole, setTargetRole] = useState('Junior Backend / Yazılım Mühendisi');
  const [currentStatus, setCurrentStatus] = useState('Üniversite Öğrencisi (3./4. Sınıf - Staj Arayışı)');

  // Loading & Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CurriculumAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Toggle topic tag
  const handleToggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const newTag = customTagInput.trim();
      if (!selectedTopics.includes(newTag)) {
        setSelectedTopics((prev) => [...prev, newTag]);
      }
      setCustomTagInput('');
    }
  };

  const handleApplyTemplate = (tmpl: TrainingTemplate) => {
    setCompletedContent(tmpl.content);
    setSelectedTopics(tmpl.topics);
    setTargetRole(tmpl.targetRole);
    setCurrentStatus(tmpl.currentStatus);
  };

  const handleAnalyzeCurriculum = async () => {
    if (!completedContent.trim() && selectedTopics.length === 0) {
      setErrorMsg('Lütfen aldığınız eğitimlerin içeriğini yazın veya en az birkaç konu etiketi seçin.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/coach/analyze-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedContent,
          selectedTopics,
          targetRole,
          currentStatus,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Eğitim analizi yapılamadı.');
      }

      const data: CurriculumAnalysisResult = await response.json();
      setAnalysisResult(data);

      if (onSaveSession) {
        onSaveSession({
          id: 'trn_' + Date.now(),
          type: 'training',
          title: `Eğitim Analizi: ${targetRole}`,
          date: new Date().toLocaleDateString('tr-TR'),
          data,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const textToCopy = `
=== KARİYER & EĞİTİM YOL HARİTASI RAPORU ===
Hedef Rol: ${targetRole}
Mevcut Durum: ${currentStatus}

1. MEVCUT YETKİNLİK DÜZEYİ:
${analysisResult.currentSkillProfile.overallAssessment}

2. KRİTİK EKSİKLER & KÖR NOKTALAR:
${analysisResult.gapAnalysis.missingCriticalSkills.map((s) => '- ' + s).join('\n')}

3. BİR SONRAKİ ADIMDA ALINMASI GEREKEN EĞİTİMLER:
${analysisResult.nextStepTrainings
  .map(
    (t, i) =>
      `${i + 1}. ${t.title} (${t.priority} - ${t.estimatedDuration})\n   Gerekçe: ${t.reasonWhy}\n   Önerilen Proje: ${t.portfolioProjectIdea.projectName}`
  )
  .join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Intro */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <span>MÜFREDAT & BECERİ BOŞLUK ANALİZİ</span>
              <span aria-hidden="true">·</span>
              <span>BİR SONRAKİ ADIM REHBERİ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              Eğitim İçeriklerine Göre Bir Sonraki Adım Eğitim Koçluğu
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
              Üniversitede aldığınız dersleri, tamamladığınız kursları veya sertifika konularını girin. Gemini sektör beklentileriyle karşılaştırarak eksik kalan kritik alanlarınızı ve kariyerinizi bir üst basamağa taşıyacak spesifik eğitim yol haritasını çıkarsın.
            </p>
          </div>

          {/* Quick Curriculum Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 text-xs">Örnek Eğitimler:</span>
            {TRAINING_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleApplyTemplate(tmpl)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Eğitim Geçmişi & Hedef Pozisyon Bilgileri</span>
        </h2>

        {/* Target Role & Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Hedeflediğiniz Pozisyon / Rol *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: Junior Backend Developer, Yazılım Stajyeri, AI Engineer"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mevcut Durumunuz
            </label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Üniversite Öğrencisi (3./4. Sınıf - Staj Arayışı)">🎓 Üniversite Öğrencisi (Staj Arayan)</option>
              <option value="Üniversiteden Yeni Mezun (İlk İş Arayışı)">🚀 Üniversiteden Yeni Mezun (Junior İş Arayışı)</option>
              <option value="Bootcamp Mezunu / Kariyer Değiştiren">🔄 Kariyer Değiştiren / Bootcamp Mezunu</option>
              <option value="1-2 Yıl Deneyimli Junior (Gelişmek İsteyen)">💼 1-2 Yıl Deneyimli Junior (Seviye Atlama)</option>
            </select>
          </div>
        </div>

        {/* Topic Tag Selector (Multi-select) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-300">
              Tamamladığınız veya Aşina Olduğunuz Konu Etiketleri ({selectedTopics.length} seçildi)
            </label>
            <span className="text-[11px] text-slate-500">Etiketlere tıklayarak ekleyin/çıkarın</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-lg min-h-[52px]">
            {POPULAR_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleToggleTopic(topic)}
                  className={`px-2.5 py-1 text-xs rounded transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isSelected ? `✓ ${topic}` : `+ ${topic}`}
                </button>
              );
            })}
          </div>

          {/* Custom tag add */}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Özel konu etiketi yazıp Enter'a basın (örn: WebSockets, GraphQL, Redux)"
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-80"
            />
            {selectedTopics.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTopics([])}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                Seçimleri Temizle
              </button>
            )}
          </div>
        </div>

        {/* Course Syllabus / Curriculum Raw Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Aldığınız Eğitimlerin / Üniversite Derslerinin Ayrıntılı İçeriği
            </label>
            <span className="text-[11px] text-slate-500">Müfredat, ders notları veya konu listesi yapıştırabilirsiniz</span>
          </div>

          <textarea
            rows={6}
            value={completedContent}
            onChange={(e) => setCompletedContent(e.target.value)}
            placeholder="Örn: 
1. Veri Yapıları: Linked list, stack, queue, binary trees, sorting algorithms.
2. OOP Java: Sınıflar, miras alma, polimorfizm.
3. Web Geliştirme: HTML/CSS ve JavaScript ile basit bir öğrenci kayıt sitesi..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-sans leading-relaxed"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Girilen müfredat, sektördeki "{targetRole}" pozisyonu gereksinimleri ile eşleştirilecek.
            </span>
          </div>

          <button
            onClick={handleAnalyzeCurriculum}
            disabled={isAnalyzing}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Müfredat Boşluk Analizi Yapılıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Bir Sonraki Adımı Analiz Et</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-8">
          {/* Top Bar Action (Copy / Export) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
              <Compass className="w-4 h-4" />
              <span>KİŞİSELLEŞTİRİLMİŞ EĞİTİM & GELİŞİM YOL HARİTASI</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Rapor Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Raporu Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Current Profile & Skill Gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kazanılmış Beceriler & Seviye */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Mevcut Yetkinlik Seviyeniz
                </span>
                <h3 className="text-base font-bold text-white">
                  Kazanılmış Temel Beceriler
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {analysisResult.currentSkillProfile.overallAssessment}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-medium text-slate-400 block">Güçlü Olduğunuz Konular:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.currentSkillProfile.masteredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-xs"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-medium text-slate-400 block">Pekiştirilmesi Gereken Temeller:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.currentSkillProfile.emergingSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded text-xs"
                    >
                      • {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kritik Boşluklar & Kör Noktalar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Skill-Gap & Kör Nokta Analizi
                </span>
                <h3 className="text-base font-bold text-white">
                  Hedef Rol İçin Eksik Kalan Kritik Alanlar
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {analysisResult.gapAnalysis.blindSpotsSummary}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-medium text-slate-400 block">Mutlaka Edinilmesi Gereken Kritik Eksikler:</span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {analysisResult.gapAnalysis.missingCriticalSkills.map((sk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{sk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-medium text-slate-400 block">Şirketlerin Bu Rolden Sektörel Beklentileri:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.gapAnalysis.industryExpectations.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Bir Sonraki Adımda Hangi Eğitimi Almalısın? */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Bir Sonraki Adımda Hangi Eğitimleri Almalısınız?</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mevcut eğitimlerinizin üzerine inşa edilecek, mülakatta fark yaratacak nokta atışı eğitim tavsiyeleri
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {analysisResult.nextStepTrainings.map((training, idx) => (
                <div
                  key={training.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wide">
                        Öneri #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900/60 text-indigo-300 font-medium">
                        {training.priority}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {training.title}
                    </h4>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Süre: {training.estimatedDuration}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {training.reasonWhy}
                    </p>

                    {/* Müfredat Alt Başlıkları */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-1.5 text-xs">
                      <span className="font-medium text-slate-300 block text-[11px]">
                        Eğitimin İçermesi Gereken Kilit Modüller:
                      </span>
                      <ul className="space-y-1 text-slate-400">
                        {training.keySyllabusModules.map((mod, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span>
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Kaynak Önerileri */}
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Öğrenme Kaynakları: </strong>
                      {training.recommendedLearningSources.join(' · ')}
                    </div>
                  </div>

                  {/* Portfolyo / Mülakat Proje Fikri */}
                  {training.portfolioProjectIdea && (
                    <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-900/40 rounded-lg p-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>MÜLAKAT PORTFOLYO PROJESİ:</span>
                      </div>
                      <div className="font-medium text-white text-xs">
                        {training.portfolioProjectIdea.projectName}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {training.portfolioProjectIdea.description}
                      </p>
                      <div className="text-[10px] text-indigo-200/90 pt-1">
                        <strong>Mülakat Değeri:</strong> {training.portfolioProjectIdea.interviewShowcaseValue}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {training.portfolioProjectIdea.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Haftalık Eylem Planı (Weekly Roadmap) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Haftalık Uygulama & Öğrenme Yol Haritası</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Teoriden mülakata hazır hale gelmek için adım adım takip edebileceğiniz eylem planı
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisResult.weeklyRoadmap.map((week, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-400">
                        {week.weekRange}
                      </span>
                      <span className="text-[10px] text-slate-500">Adım {idx + 1}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {week.focus}
                    </h4>

                    <div className="p-2 rounded bg-indigo-950/20 border border-indigo-900/30 text-[11px] text-indigo-200">
                      <strong>Hedef:</strong> {week.milestoneGoal}
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                      {week.checklist.map((item, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
