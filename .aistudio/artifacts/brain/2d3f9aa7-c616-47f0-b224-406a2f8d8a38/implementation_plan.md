# Kariyer & Mülakat Koçu (Career & Interview Coach Agent)

Kullanıcının gireceği mülakatlardaki katılımcı unvanlarına (örn. Engineering Manager, HR Specialist, Head of Product, Senior Lead) özel potansiyel soru simülasyonu sunan, verilen cevapları değerlendirip puanlayan ve kullanıcının tamamladığı eğitim içeriklerini analiz ederek bir sonraki kariyer adımı için kişiselleştirilmiş eğitim & gelişim yol haritası çıkaran yapay zeka destekli koçluk platformu.

## User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı ile yapılan 1. aşama soru-cevap doğrulamaları doğrultusunda aşağıdaki kararlar kesinleştirilmiştir:

- **Mülakat Modu Kapsamı**: Sadece soru listelemekle sınırlı kalmayacak; kullanıcıların sesli (Web Speech API) ve yazılı olarak cevap verebileceği interaktif mülakat provası (mock interview), STAR metodu odaklı detaylı puanlama ve örnek ideal cevap rehberi sunulacaktır.
- **Eğitim Geçmişi Girişi (1 ve 3 Birleşimi)**: Serbest metin/müfredat yapıştırma imkanının yanı sıra, hızlı teknoloji/konu etiketleri seçimi ve hazır popüler kariyer şablonları (örn. Fullstack Web, Veri Bilimi & AI, Ürün Yönetimi, DevOps) entegre edilecektir.
- **Arayüz ve Soru Dili**: Tamamen Türkçe arayüz ve Türkçe soru/koçluk üretimi benimsenmiştir (istendiğinde uluslararası mülakatlar için soru üretiminde dil seçeneği eklenecektir).

---

## 1. Overview & Core Concept

- **Ne Yapar?**:
  1. **Mülakatçı Unvanına Özel Soru Üretimi**: Mülakatı yapacak kişinin unvanına (örn. VP of Engineering, HR Talent Partner, Staff Architect, Team Lead, Product Director) ve aday rolüne göre psikolojik ve teknik beklentileri yansıtan nokta atışı sorular (davranışsal, teknik, kültürel, vaka analizi) üretir.
  2. **İnteraktif Prova & Koçluk Değerlendirmesi**: Kullanıcı her soruyu sesli konuşarak veya yazarak yanıtlar. Gemini yapay zeka modeli cevabı STAR (Situation, Task, Action, Result) kriterleri, teknik doğruluk, netlik ve etki gücü açısından puanlar (1-100), güçlü yönleri ve gelişim alanlarını gösterir.
  3. **Eğitim Analizi & Bir Sonraki Adım Yol Haritası**: Kullanıcının daha önce aldığı eğitimlerin, bootcamp müfredatlarının ve sertifika konularının boşluk analizini (skill-gap analysis) çıkarır; bir sonraki seviyeye sıçramak için hangi ileri düzey eğitimleri alması gerektiğini, önerilen modülleri ve portfolyo proje fikirlerini listeler.
- **Hedef Kitle**: Mülakatlara hazırlanan yazılımcılar, ürün yöneticileri, tasarımcılar ve kariyerinde bir üst kademeye geçmek isteyen profesyoneller.
- **Temel Değer**: Mülakatçının zihnini önceden okuma avantajı ve kör noktaları kapatan yapılandırılmış eğitim rehberliği.

---

## 2. User Experience & Visual Design

- **Kullanıcı Akışı**:
  1. **Giriş Paneli & Hızlı Başlangıç**: Kullanıcı iki ana moddan birini seçer: *"Mülakat Simülasyonu"* veya *"Kariyer & Eğitim Yol Haritası"*.
  2. **Mülakat Hazırlığı**:
     - Kullanıcı hedef rolü (örn. "Senior Frontend Developer") ve mülakatı yapacak kişinin unvanını (örn. "Engineering Director & Lead Architect") girer. Zorluk derecesi ve odak alanlarını seçer.
     - "Soruları Üret & Simülasyona Başla" butonuna tıklar.
     - Gemini, mülakatçının bakış açısına uygun 5-8 adet derinlemesine soru (neden bu soruyu soruyor, ne arıyor, ipuçları) oluşturur.
  3. **İnteraktif Prova (Mock Interview)**:
     - Soru soru ilerleme: Mikrofon ile konuşarak veya klavye ile yazarak cevap verme.
     - Anlık analiz: Yapay zeka puanlaması, geliştirme önerisi ve ideal yanıt modeli.
  4. **Eğitim & Kariyer Gelişim Analizi**:
     - Kullanıcı tamamladığı eğitimleri girer (hazır şablonlar, etiketler veya detaylı müfredat metni).
     - "Bir Sonraki Adımı Analiz Et" tetiklenir.
     - Sistem: Kazanılmış yetkinlikler özeti, eksik kalan kritik alanlar (Blind Spots), bir sonraki adım için önerilen spesifik eğitimler, haftalık öğrenme planı ve uygulamalı proje önerilerini sunar.
     - Sonuçları dışa aktarma veya panoya kopyalama.
- **Görsel Kimlik & Tema**:
  - *Tasarım Felsefesi*: Modern, yüksek kontrastlı, dikkat dağıtmayan kurumsal stüdyo estetiği (Executive Coaching Studio).
  - *Renk Paleti*: 60% temiz koyu/aydınlık nötr canvas (slate-950/slate-900 zemin), 30% yapısal yüzeyler (slate-900 / white kartlar, hairline border'lar `border-slate-800`), 10% odak rengi (indigo-600 / violet-500 ve zümrüt yeşili başarı vurguları).
  - *Tipografi*: `Plus Jakarta Sans` ve `DM Sans` gövde, `tabular-nums font-mono` sayısal puanlar ve metrikler için.
  - *Anti-Slop Restraint*: Gereksiz hap (pill) yığınları yok, sahte sistem logları yok, kalın sol kenar çizgileri (`border-l-4`) yok; temiz unboxed tipografik hiyerarşi ve gerçek etkileşimli kontroller.

---

## 3. Key Product Decisions & Trade-Offs

- **Model Seçimi (`gemini-3.8-flash`)**:
  - *Seçim*: `@google/genai` ile `gemini-3.8-flash` modeli.
  - *Gerekçe*: Hızlı yanıt süresi, zengin Türkçe anlambilim kabiliyeti ve JSON şema çıktısı desteği. Ücretsiz tier dahilinde yüksek verimlilik.
- **Sunucu Taraflı Güvenli Entegrasyon (Server-Side Proxy)**:
  - *Seçim*: Vite backend middleware / Express API katmanı üzerinden `/api/coach/*` uç noktaları.
  - *Gerekçe*: `process.env.GEMINI_API_KEY` tarayıcıya asla sızdırılmaz, kurallara tam uyumluluk sağlanır.
- **Ses Tanıma (Voice-to-Text)**:
  - *Seçim*: Tarayıcı yerel `webkitSpeechRecognition` / `SpeechRecognition` API'si.
  - *Gerekçe*: Kullanıcı ek izin veya harici servis kurulumu gerektirmeden doğrudan Türkçe konuşarak pratik yapabilir. Desteklenmeyen tarayıcılarda şık metin tabanlı yazım alternatifi kesintisiz çalışır.
- **Yerel Kalıcılık (Local Storage & Export)**:
  - *Seçim*: Kullanıcının oluşturduğu simülasyon sonuçlarını ve eğitim planlarını tarayıcıda saklayabilmesi ve istendiğinde tek tıkla dışa aktarabilmesi.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19)                       │
│                                                                  │
│  ┌─────────────────────────┐        ┌─────────────────────────┐  │
│  │    Mülakat Simülatörü   │        │     Eğitim Yol Haritası  │  │
│  │  - Unvan & Rol Girişi   │        │  - Müfredat / Şablonlar │  │
│  │  - Sesli / Yazılı Yanıt │        │  - Konu Etiketleri      │  │
│  │  - Rubrik & Puanlama    │        │  - Boşluk Analizi       │  │
│  └────────────┬────────────┘        └────────────┬────────────┘  │
│               │                                  │               │
│               └────────────────┬─────────────────┘               │
│                                │ fetch('/api/coach/...')         │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                     SERVER (Vite Dev / Express)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ POST /api/coach/generate-questions                        │  │
│  │ POST /api/coach/evaluate-answer                           │  │
│  │ POST /api/coach/analyze-curriculum                        │  │
│  └─────────────────────────────┬──────────────────────────────┘  │
│                                │ GoogleGenAI SDK                 │
│                                │ model: "gemini-3.8-flash"       │
│                                ▼                                 │
│                  Google Gemini 3.8 Flash API                    │
└──────────────────────────────────────────────────────────────────┘
```

### Veri Modelleri & Durum Yönetimi:
1. `InterviewSession`:
   - `interviewerTitle`: string (örn. "VP of Engineering")
   - `targetRole`: string (örn. "Senior React Developer")
   - `difficulty`: 'entry' | 'mid' | 'senior' | 'lead'
   - `questions`: Array<{ id, question, whyInterviewerAsks, lookForPoints, sampleAnswer, userAnswer, score, feedback }>
2. `CurriculumAnalysis`:
   - `completedTopics`: string[]
   - `rawCurriculum`: string
   - `targetCareerGoal`: string
   - `currentLevelAssessment`: string
   - `strengths`: string[]
   - `blindSpots`: string[]
   - `recommendedCourses`: Array<{ title, providerType, priority, whyNeeded, modules, handsOnProject }>
   - `actionPlanWeeks`: Array<{ week: number, focus: string, tasks: string[] }>

---

## 5. Uygulama Adımları

1. **Sunucu Uç Noktaları**: `/api/coach/generate-questions`, `/api/coach/evaluate-answer`, `/api/coach/analyze-curriculum` API servislerinin `@google/genai` ile güvenli şekilde yapılandırılması.
2. **Kullanıcı Arayüzü & Navigasyon**: İki modlu (Mülakat Simülasyonu & Eğitim Koçu) temiz, modern dashboard tasarımı.
3. **Mülakat Modülü**: Unvan bazlı soru üretimi, sesli/yazılı yanıt alma, detaylı STAR analizi ve koçluk geri bildirim kartları.
4. **Eğitim Analizi Modülü**: Hazır şablonlar (Frontend, Backend, AI/ML, DevOps, Product), etiket seçimi ve serbest metin girişi ile eksik yetkinlik analizi ve adım adım eğitim önerileri.
5. **Derleme & Doğrulama**: Hata denetimi (`lint_applet` & `compile_applet`) ile tam doğrulama.
