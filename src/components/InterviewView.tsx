import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  UserCheck,
  Building,
  Target,
  Volume2,
  VolumeX,
  Play,
  Square,
  RefreshCw,
} from 'lucide-react';
import {
  CandidateLevel,
  InterviewResult,
  InterviewQuestion,
  AnswerEvaluation,
} from '../types';
import { INTERVIEW_PRESETS, InterviewPreset } from '../data/presets';

interface InterviewViewProps {
  onSaveSession?: (session: any) => void;
}

export const InterviewView: React.FC<InterviewViewProps> = ({ onSaveSession }) => {
  // Form State
  const [interviewerTitle, setInterviewerTitle] = useState('İK Yetenek Kazanımı Uzmanı (Campus & Intern Recruiter)');
  const [targetRole, setTargetRole] = useState('Yazılım Mühendisliği Stajyeri');
  const [candidateLevel, setCandidateLevel] = useState<CandidateLevel>('intern_student');
  const [companyType, setCompanyType] = useState('Kurumsal Teknoloji / Fintek');
  const [focusArea, setFocusArea] = useState('Öğrenme İsteği, Okul Projeleri & Kültür Uyumu');
  const [customContext, setCustomContext] = useState('');

  // Loading & Data State
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewResult | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, AnswerEvaluation>>({});
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [expandedModelAnswer, setExpandedModelAnswer] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voice Input (Speech-to-Text) State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionInstanceRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  // Voice Output (Text-to-Speech) State
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSpeakingAdvice, setIsSpeakingAdvice] = useState(false);

  // Audio Playback Fallback (MediaRecorder)
  const [recordedAudioUrls, setRecordedAudioUrls] = useState<Record<string, string>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      stopSpeaking();
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Start Speech Recognition & Audio Recording
  const startRecording = async () => {
    setSpeechError(null);
    const currentQ = interviewData?.questions[selectedQuestionIndex];
    if (!currentQ) return;

    baseTextRef.current = userAnswers[currentQ.id] || '';

    // Check for SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Also start MediaRecorder for native voice backup
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrls((prev) => ({
          ...prev,
          [currentQ.id]: url,
        }));
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (micErr: any) {
      console.warn('MediaRecorder error or mic permission denied:', micErr);
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        setSpeechError('Mikrofon izni verilmedi. Lütfen tarayıcınızın adres çubuğundaki kilit veya kamera/mikrofon simgesinden izin verin.');
        return;
      }
    }

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combinedTranscript = (
            (baseTextRef.current ? baseTextRef.current + ' ' : '') +
            finalTranscript +
            interimTranscript
          ).trim();

          setUserAnswers((prev) => ({
            ...prev,
            [currentQ.id]: combinedTranscript,
          }));
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Mikrofon erişimi engellendi. Lütfen tarayıcı izinlerinden mikrofonu açın.');
          } else if (event.error === 'no-speech') {
            // Keep recording, user might be thinking
          } else if (event.error === 'network') {
            setSpeechError('Konuşma tanıma servisiyle bağlantı kurulamadı. Lütfen mikrofonunuzla konuşup yazılı tamamlayabilirsiniz.');
          } else {
            setSpeechError(`Ses tanıma uyarısı: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If state still thinks it's recording, let's reset
          setIsRecording(false);
        };

        recognition.start();
        recognitionInstanceRef.current = recognition;
        setIsRecording(true);
      } catch (err: any) {
        console.error('Failed to start SpeechRecognition:', err);
        setSpeechError('Ses tanıma başlatılamadı: ' + (err.message || ''));
        setIsRecording(false);
      }
    } else {
      // SpeechRecognition not supported, but MediaRecorder is recording
      setIsRecording(true);
      setSpeechError('Tarayıcınız canlı metne dönüştürme API\'sini desteklemiyor, ancak ses kaydınız alınıyor. Yanıtınızı lütfen metin olarak da giriniz.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionInstanceRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
  };

  // Text-to-Speech (Mülakatçının Soruyu Sesli Sorması)
  const speakText = (text: string, isQuestion: boolean) => {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız ses sentezleme (Text-to-Speech) özelliğini desteklemiyor.');
      return;
    }

    window.speechSynthesis.cancel();

    if ((isQuestion && isSpeakingQuestion) || (!isQuestion && isSpeakingAdvice)) {
      stopSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find((v) => v.lang.startsWith('tr') || v.lang.includes('TR'));
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    }

    utterance.onstart = () => {
      if (isQuestion) setIsSpeakingQuestion(true);
      else setIsSpeakingAdvice(true);
    };

    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      setIsSpeakingAdvice(false);
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
      setIsSpeakingAdvice(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingQuestion(false);
    setIsSpeakingAdvice(false);
  };

  const handleApplyPreset = (preset: InterviewPreset) => {
    setInterviewerTitle(preset.interviewerTitle);
    setTargetRole(preset.targetRole);
    setCandidateLevel(preset.candidateLevel);
    setCompanyType(preset.companyType);
    setFocusArea(preset.focusArea);
  };

  const handleGenerateQuestions = async () => {
    if (!interviewerTitle.trim() || !targetRole.trim()) {
      setErrorMsg('Lütfen mülakatçı unvanı ve hedef rol alanlarını doldurun.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    stopSpeaking();
    stopRecording();

    try {
      const response = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          candidateLevel,
          companyType,
          focusArea,
          customContext,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Soru üretimi başarısız oldu.');
      }

      const data: InterviewResult = await response.json();
      setInterviewData(data);
      setSelectedQuestionIndex(0);
      setUserAnswers({});
      setEvaluations({});

      if (onSaveSession) {
        onSaveSession({
          id: 'int_' + Date.now(),
          type: 'interview',
          title: `${targetRole} — ${interviewerTitle}`,
          date: new Date().toLocaleDateString('tr-TR'),
          data,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluateAnswer = async (question: InterviewQuestion) => {
    const answer = userAnswers[question.id];
    if (!answer || answer.trim().length < 10) {
      alert('Lütfen değerlendirme için mikrofona konuşun veya en az birkaç cümlelik bir yanıt yazın.');
      return;
    }

    setEvaluatingQuestionId(question.id);

    try {
      const response = await fetch('/api/coach/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          interviewerTitle,
          targetRole,
          candidateLevel,
          userAnswer: answer,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Değerlendirme başarısız oldu.');
      }

      const evalData: AnswerEvaluation = await response.json();
      setEvaluations((prev) => ({
        ...prev,
        [question.id]: evalData,
      }));
    } catch (err: any) {
      alert(err.message || 'Cevap değerlendirilirken hata oluştu.');
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = interviewData?.questions[selectedQuestionIndex];
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : undefined;
  const currentAudioUrl = currentQuestion ? recordedAudioUrls[currentQuestion.id] : undefined;

  return (
    <div className="space-y-8">
      {/* Hero / Header Intro */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <span>MÜLAKATÇI ZİHİN SİMÜLATÖRÜ</span>
              <span aria-hidden="true">·</span>
              <span>SESLİ & YAZILI PROVA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              Mülakatçı Unvanına Özel Soru Simülasyonu & Sesli Prova
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
              Mülakatçının rolünü seçin; soruları sesli dinleyin, mikrofonunuzla doğrudan konuşarak prova yapın ve STAR metoduyla anlık koçluk puanı alın.
            </p>
          </div>

          {/* Quick Presets for Students & New Grads */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 text-xs">Hızlı Şablonlar:</span>
            {INTERVIEW_PRESETS.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Mülakat Parametrelerini Belirleyin</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Mülakatçı Unvanı */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mülakatı Yapacak Kişinin Unvanı *
            </label>
            <input
              type="text"
              value={interviewerTitle}
              onChange={(e) => setInterviewerTitle(e.target.value)}
              placeholder="Örn: Campus Recruiter, Engineering Manager, Lead Dev"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
              <span>Popüler:</span>
              <button
                type="button"
                onClick={() => setInterviewerTitle('İK Yetenek Uzmanı / Campus Recruiter')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                İK / Kampüs
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setInterviewerTitle('Engineering Manager')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                Eng Manager
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setInterviewerTitle('Senior Tech Lead')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                Tech Lead
              </button>
            </div>
          </div>

          {/* Hedef Rol */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Hedef Rol / Başvurulan Pozisyon *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: Yazılım Stajyeri, Junior Frontend Developer"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
              <span>Örnekler:</span>
              <button
                type="button"
                onClick={() => setTargetRole('Yazılım Mühendisliği Stajyeri')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                Yazılım Stajı
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTargetRole('Junior Frontend Developer')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                Junior Frontend
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTargetRole('Junior Backend Developer')}
                className="hover:text-indigo-400 underline decoration-slate-700"
              >
                Junior Backend
              </button>
            </div>
          </div>

          {/* Aday Seviyesi */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Adayın Mevcut Seviyesi
            </label>
            <select
              value={candidateLevel}
              onChange={(e) => setCandidateLevel(e.target.value as CandidateLevel)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="intern_student">🎓 Üniversite Öğrencisi / Stajyer Adayı</option>
              <option value="new_grad">🚀 Yeni Mezun (Junior Giriş)</option>
              <option value="junior">💻 Junior (1-2 Yıl Tecrübeli)</option>
              <option value="mid">⚡ Mid-Level Geliştirici</option>
              <option value="senior">🛡️ Senior / Lead Mühendis</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {candidateLevel === 'intern_student' && 'Sorular ders projelerine, öğrenme merakına ve okul pratiklerine odaklanır.'}
              {candidateLevel === 'new_grad' && 'Sorular staj tecrübelerine, bitirme projelerine ve iş adaptasyonuna odaklanır.'}
              {candidateLevel === 'junior' && 'Sorular pratik kodlama, hata ayıklama ve ekip çalışmasına odaklanır.'}
              {candidateLevel === 'mid' && 'Sorular bağımsız teslim, mimari ve best practice konularına odaklanır.'}
              {candidateLevel === 'senior' && 'Sorular sistem tasarımı, mimari trade-off ve liderliğe odaklanır.'}
            </p>
          </div>

          {/* Şirket Türü */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Şirket Yapısı / Sektör
            </label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Kurumsal Teknoloji / Fintek">Kurumsal Teknoloji / Bankacılık & Fintek</option>
              <option value="Hızlı Büyüyen Teknoloji Girişimi (Startup)">Hızlı Büyüyen Startup (Girişim)</option>
              <option value="Global Ürün Şirketi (FAANG / Big Tech)">Global Teknoloji Şirketi</option>
              <option value="Yazılım Evi / Danışmanlık Ajansı">Yazılım Evi & Danışmanlık Ajansı</option>
              <option value="E-Ticaret / Perakende Devi">E-Ticaret & Marketplace</option>
            </select>
          </div>

          {/* Soru Odağı */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Soru Odak Alanı
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Öğrenme İsteği, Okul Projeleri & Kültür Uyumu">Öğrenme İsteği, Okul Projeleri & Kültür Uyumu</option>
              <option value="Temel Kodlama, Algoritmalar & Bitirme Projesi">Temel Kodlama, Algoritmalar & Bitirme Projesi</option>
              <option value="Davranışsal Sorular & STAR Metodu">Davranışsal Sorular (STAR Metodu)</option>
              <option value="Teknik Problem Çözme & Canlı Kodlama">Teknik Problem Çözme & Senaryolar</option>
              <option value="Karma & Gerçekçi Mülakat Akışı">Karma & Gerçekçi Tam Simülasyon</option>
            </select>
          </div>

          {/* Ekstra Detay / Aday Notu */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Özel Notunuz (Opsiyonel)
            </label>
            <input
              type="text"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Örn: Bilgisayar mühendisliği 3. sınıfım, ilk mülakatım"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {interviewerTitle} perspektifinden 6 derinlemesine soru üretilecek.
            </span>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Mülakatçı Zihni Simüle Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Soruları Üret & Provayı Başlat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results & Interactive Rehearsal Area */}
      {interviewData && (
        <div className="space-y-6">
          {/* Persona Card: Masanın Karşısındaki Kişi */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-900/40 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 md:max-w-xl">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
                  <UserCheck className="w-4 h-4" />
                  <span>MÜLAKATÇININ ZİHNİ: {interviewerTitle.toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Mülakatçı Bu Görüşmeden Ne Bekliyor?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {interviewData.interviewerPersona.perspective}
                </p>
                <div className="text-xs text-indigo-200/90 pt-1">
                  <strong>Puan Kazandıran Duruş:</strong> {interviewData.interviewerPersona.evaluationFocus}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:w-96 shrink-0">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    En Çok Dikkat Edeceği Kriterler
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {interviewData.interviewerPersona.keyPriorities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Kırmızı Çizgiler (Uzak Durun)
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {interviewData.interviewerPersona.redFlags.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Rehearsal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Question Navigation List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">Sorular ({interviewData.questions.length})</span>
                <span>Tıkla & Prova Yap</span>
              </div>

              <div className="space-y-2">
                {interviewData.questions.map((q, idx) => {
                  const hasAnswer = Boolean(userAnswers[q.id]);
                  const hasEval = Boolean(evaluations[q.id]);
                  const evalScore = evaluations[q.id]?.score;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        stopSpeaking();
                        stopRecording();
                        setSelectedQuestionIndex(idx);
                      }}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                        selectedQuestionIndex === idx
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-sm'
                          : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1">
                        <span className="font-medium text-indigo-400">
                          Soru {idx + 1} · {q.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{q.difficultyLevel}</span>
                          {hasEval && (
                            <span className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {evalScore} Puan
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                        {q.question}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        {hasEval ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Değerlendirildi
                          </span>
                        ) : hasAnswer ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" /> Yanıt Yazıldı
                          </span>
                        ) : (
                          <span className="text-slate-500">Cevap Bekliyor</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Question Detail & Rehearsal Simulator */}
            {currentQuestion && (
              <div className="lg:col-span-8 space-y-6">
                {/* Active Question Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-indigo-400 font-semibold">
                      AKTİF SORU #{selectedQuestionIndex + 1} ({currentQuestion.category})
                    </span>

                    {/* Text-to-Speech (Listen to Question) */}
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.question, true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isSpeakingQuestion
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Soruyu sesli dinle"
                    >
                      {isSpeakingQuestion ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Durdur</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Soruyu Sesli Oku</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white leading-snug">
                    "{currentQuestion.question}"
                  </h3>

                  {/* Why Interviewer Asks & Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        Mülakatçı Bu Soruyla Ne Arıyor?
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {currentQuestion.whyInterviewerAsks}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Cevabınızda Mutlaka Geçmesi Gerekenler
                      </span>
                      <ul className="space-y-0.5 text-slate-300">
                        {currentQuestion.whatToHighlight.map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Accordion: Sample Ideal Answer */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedModelAnswer((prev) => ({
                          ...prev,
                          [currentQuestion.id]: !prev[currentQuestion.id],
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-950 text-left text-xs font-medium text-slate-400 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        Örnek İdeal Yanıt Modelini Gör
                      </span>
                      {expandedModelAnswer[currentQuestion.id] ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {expandedModelAnswer[currentQuestion.id] && (
                      <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                        <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-lg text-indigo-200 mb-2">
                          💡 <strong>Koç Tavsiyesi:</strong> Bu örnek cevabı birebir ezberlemek yerine kendi deneyiminiz, okul projeleriniz veya staj tecrübelerinizle zenginleştirin.
                        </div>
                        {currentQuestion.sampleAnswer}
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Input Area: Voice & Text Rehearsal */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>Cevabınızı Verin (Sesli veya Yazılı)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mikrofona konuşarak yanıtlayabilir veya klavyenizle yazabilirsiniz.
                      </p>
                    </div>

                    {/* Speech Recognition Recording Button */}
                    <div className="flex items-center gap-2">
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all shadow-sm animate-pulse"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>Kaydı Tamamla ({formatTimer(recordingSeconds)})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-sm active:scale-98"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Sesle Cevap Ver (Mikrofon)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recording Status Bar */}
                  {isRecording && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-800/80 rounded-lg flex items-center justify-between text-xs text-indigo-200">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-semibold text-white">Sesiniz Dinleniyor...</span>
                        <span className="text-slate-400">Türkçe konuşabilirsiniz, metin aşağıya yazılıyor.</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-300">
                        {formatTimer(recordingSeconds)}
                      </span>
                    </div>
                  )}

                  {/* Speech Error / Help Notice */}
                  {speechError && (
                    <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p>{speechError}</p>
                        <p className="text-slate-400 text-[11px]">
                          İpucu: Tarayıcınızda mikrofon izni penceresi açıldığında "İzin Ver" butonuna tıklayın. Ayrıca cevabınızı doğrudan aşağıdaki kutuya klavye ile de yazabilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audio Player if Audio Recorded */}
                  {currentAudioUrl && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        Kaydedilen Sesiniz:
                      </span>
                      <audio controls src={currentAudioUrl} className="h-8 max-w-xs" />
                    </div>
                  )}

                  {/* Textarea for Response */}
                  <textarea
                    rows={5}
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: e.target.value,
                      }))
                    }
                    placeholder="Mikrofona konuştukça sözleriniz buraya otomatik aktarılacaktır. Veya klavyenizle manuel olarak yazabilirsiniz..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                  />

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>Karakter Sayısı:</span>
                      <span className="font-mono text-slate-400">
                        {(userAnswers[currentQuestion.id] || '').length}
                      </span>
                      <span>·</span>
                      <span>STAR çerçevesinde 150-400 kelime idealdir.</span>
                    </div>

                    <button
                      onClick={() => handleEvaluateAnswer(currentQuestion)}
                      disabled={evaluatingQuestionId === currentQuestion.id || isRecording}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {evaluatingQuestionId === currentQuestion.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>STAR & Koçluk Analizi Yapılıyor...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Cevabımı Değerlendir & Puanla</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Evaluation Feedback Report */}
                {currentEvaluation && (
                  <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                          <Award className="w-4 h-4" />
                          <span>MÜLAKAT KOÇU GERİ BİLDİRİM RAPORU</span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          Cevap Performans Analizi
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currentEvaluation.summary}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
                        <div className="text-2xl font-black font-mono tracking-tight text-indigo-400">
                          {currentEvaluation.score}
                          <span className="text-xs font-normal text-slate-500"> / 100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {currentEvaluation.score >= 80 ? 'Mükemmel' : currentEvaluation.score >= 60 ? 'Yeterli / Geliştirilebilir' : 'Gelişim Gerekli'}
                        </div>
                      </div>
                    </div>

                    {/* STAR Breakdown Grid */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300 block">
                        STAR Çerçevesi Uygunluk Analizi
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                          <span className="font-semibold text-indigo-400 block">S - Durum (Situation)</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {currentEvaluation.starBreakdown.situation}
                          </p>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                          <span className="font-semibold text-indigo-400 block">T - Görev (Task)</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {currentEvaluation.starBreakdown.task}
                          </p>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                          <span className="font-semibold text-indigo-400 block">A - Eylem (Action)</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {currentEvaluation.starBreakdown.action}
                          </p>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                          <span className="font-semibold text-indigo-400 block">R - Sonuç (Result)</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {currentEvaluation.starBreakdown.result}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Improvement Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3.5 space-y-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Güçlü Yönleriniz
                        </span>
                        <ul className="space-y-1.5 text-slate-300">
                          {currentEvaluation.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 mt-0.5">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3.5 space-y-2">
                        <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Geliştirilmesi Gereken Alanlar
                        </span>
                        <ul className="space-y-1.5 text-slate-300">
                          {currentEvaluation.improvementAreas.map((imp, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Coach Gold Tip with TTS */}
                    <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-lg p-4 text-xs text-indigo-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          Koçun Altın Tavsiyesi:
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(currentEvaluation.coachTip, false)}
                          className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1"
                        >
                          {isSpeakingAdvice ? (
                            <>
                              <VolumeX className="w-3 h-3" />
                              <span>Durdur</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Sesli Dinle</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="leading-relaxed text-indigo-100">
                        {currentEvaluation.coachTip}
                      </p>
                    </div>

                    {/* Improved Version */}
                    <div className="space-y-2 border-t border-slate-800 pt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Cevabınızın Profesyonel & Etkileyici Yeniden Yazımı:
                        </span>
                        <span className="text-slate-500">Mülakatçının duymak istediği format</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 leading-relaxed font-sans italic">
                        "{currentEvaluation.improvedVersion}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
