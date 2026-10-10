import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// --- INTELLIGENT EXPERT ENGINE GENERATORS (Fallback if Gemini API has 403/quota issues) ---

function generateExpertQuestions(
  interviewerTitle: string,
  targetRole: string,
  candidateLevel: string,
  focusArea: string,
  companyType: string,
  customContext: string
) {
  const isStudentOrIntern = candidateLevel === 'intern_student' || candidateLevel === 'new_grad';
  const isHR = interviewerTitle.toLowerCase().includes('ik') || interviewerTitle.toLowerCase().includes('hr') || interviewerTitle.toLowerCase().includes('recruiter') || interviewerTitle.toLowerCase().includes('yetenek');
  const isLeadOrArchitect = interviewerTitle.toLowerCase().includes('lead') || interviewerTitle.toLowerCase().includes('architect') || interviewerTitle.toLowerCase().includes('mimar') || interviewerTitle.toLowerCase().includes('cto');

  let perspective = '';
  let evaluationFocus = '';
  let keyPriorities: string[] = [];
  let redFlags: string[] = [];

  if (isHR) {
    perspective = `${interviewerTitle} olarak önceliğim adayın şirket kültürümüze uyumu, takım çalışması yatkınlığı, iletişim netliği ve öğrenmeye olan içsel tutkusudur.${isStudentOrIntern ? ' Üniversite öğrencisi veya stajyer adaylarında 10 yıllık tecrübe aramam; öğrenme hızı, sorumluluk bilinci ve kulüp/okul projelerindeki rolü belirleyicidir.' : ''}`;
    evaluationFocus = 'Açık iletişim, samimi motivasyon, geri bildirime açıklık ve STAR metoduna uygun net hikayeleştirme.';
    keyPriorities = [
      isStudentOrIntern ? 'Öğrenme azmi ve kişisel gelişim motivasyonu' : 'Kültür uyumu ve takım dinamikleri',
      'Zorluklar veya çatışmalar karşısında yapıcı tutum',
      'Şirketi ve sektörü araştırmış olma düzeyi',
      'Etkili ve net sözlü ifade yeteneği',
    ];
    redFlags = [
      'Ezberlenmiş veya samimiyetsiz genel geçer cevaplar vermek',
      'Grup projelerinde tüm suçu takım arkadaşlarına atmak',
      'Şirket veya rol hakkında hiçbir araştırma yapmamış olmak',
      '"Bilmiyorum" deyip öğrenme isteği belirtmeden konuyu kapatmak',
    ];
  } else if (isLeadOrArchitect) {
    perspective = `${interviewerTitle} olarak adayda temel mühendislik nosyonunu, algoritma & veri yapısı sezgisini, kod temizliğini ve teknik problem çözme metodolojisini ararım.${isStudentOrIntern ? ' Stajyer veya yeni mezun için ezbere kod değil; karmaşık bir problemi parçalara ayırma ve bilmediği teknolojiyi dokümantasyondan okuyup anlama yeteneği esastır.' : ''}`;
    evaluationFocus = 'Temiz mühendislik düşüncesi, hata ayıklama analitiği ve "neden bu çözümü seçtiğini" rasyonel açıklayabilme.';
    keyPriorities = [
      'Temel veri yapıları ve algoritmik düşünme becerisi',
      'Hata ayıklama (debugging) ve araştırma refleksi',
      'Kod okunabilirliği, Clean Code ve Git disiplini',
      'Teknolojilerin altında yatan çalışma mantığını anlama merakı',
    ];
    redFlags = [
      'Kütüphaneleri ne yaptığını anlamadan körü körüne kopyala-yapıştır kullanmak',
      'Temel zaman/bellek karmaşıklığı (Big-O) kavramlarını önemsememek',
      'Teknik bir soruda tahminde bulunup bunu kesin bilgi gibi sunmak',
      'Kod incelemesi ve yapıcı eleştirilere karşı savunmacı olmak',
    ];
  } else {
    // Engineering Manager or General Manager
    perspective = `${interviewerTitle} olarak takımıma güvenilir, proaktif, verilen işi takip eden ve teknik temeli sağlam bir mühendis adayı katmak istiyorum.${isStudentOrIntern ? ' Stajyer/öğrenci adayında bir mentora yük olmadan bağımsız araştırma yapabilme ve takıma katkı sağlama potansiyelini test ederim.' : ''}`;
    evaluationFocus = 'Sorumluluk alma, teslim disiplini, teknik merak ve takımla şeffaf işbirliği.';
    keyPriorities = [
      'Verilen görevde inisiyatif alma ve teslim disiplini',
      'Takım içi şeffaf bilgi paylaşımı ve iletişim',
      'Bitirme tezi veya okul projelerindeki somut kişisel katkı',
      'Geri bildirimleri hızla eyleme dönüştürme kabiliyeti',
    ];
    redFlags = [
      'Takım projelerinde ne yaptığını net anlatamamak',
      'Zaman yönetiminde dağınıklık veya sorumluluktan kaçınma',
      'Sadece verilen komutu bekleyen pasif tutum',
      'Gelişime ve mentorluğa kapalı olmak',
    ];
  }

  // Generate 6 tailored questions
  const questions = [
    {
      id: 'q1',
      category: isHR ? 'Davranışsal (STAR)' : 'Teknik & Mühendislik Temeli',
      question: isHR
        ? (isStudentOrIntern
          ? 'Okulda veya kulüpte bir grup projesi yaparken bir takım arkadaşınız sorumluluğunu yerine getirmediğinde bu durumu nasıl yönettiniz?'
          : 'Geçmiş iş deneyiminizde bir ekip arkadaşınızla teknik veya iş önceliği konusunda ters düştüğünüz bir anı ve bunu nasıl çözdüğünüzü anlatır mısınız?')
        : `Bir yazılım projesinde ${targetRole} olarak daha önce hiç kullanmadığınız bir kütüphane veya araçla karşılaştığınızda sıfırdan nasıl bir öğrenme ve uygulama süreci izlersiniz?`,
      whyInterviewerAsks: isHR
        ? 'Adayın kriz anlarında çatışma çözme, inisiyatif alma ve takım ruhunu koruma becerisini ölçmek.'
        : 'Adayın bağımsız öğrenme metodolojisini, dokümantasyon okuma alışkanlığını ve problem çözme yaklaşımını anlamak.',
      whatToHighlight: [
        'Durumu (Situation) ve görevinizi (Task) kısaca özetleyin.',
        'Başkalarını suçlamak yerine aldığınız yapıcı aksiyonu (Action) vurgulayın.',
        'Süreçten çıkardığınız dersi ve elde edilen nihai başarıyı (Result) belirtin.',
      ],
      sampleAnswer: isStudentOrIntern
        ? 'Üniversite 3. sınıfta Veritabanı dersi projesinde 3 kişilik grubumuzda bir arkadaşımız kişisel sebeplerle kod teslimini aksattı. Durumu kişiselleştirmek yerine acil bir toplantı yaptık; işleri modüllere böldük ve onun zorlandığı backend bağlantısını beraber devraldık. Projeyi son teslim tarihinden 2 gün önce başarıyla teslim ettik ve 95 puan aldık. Bu deneyim bana şeffaf iletişimin ve erken müdahalenin önemini öğretti.'
        : 'Daha önce kullanmadığım bir teknolojiyle karşılaştığımda önce resmi dokümantasyonunu ve "Quick Start" rehberini incelerim. Ardından izole bir test projesinde (sandbox) temel bir PoC hazırlar, edge case durumları denerim. Karşılaştığım hatalarda GitHub Issues ve Stack Overflow tartışmalarını inceleyerek best practice\'leri projeye entegre ederim.',
      difficultyLevel: 'Orta',
    },
    {
      id: 'q2',
      category: 'Proje & Deneyim',
      question: isStudentOrIntern
        ? 'Bugüne kadar geliştirdiğiniz en gurur duyduğunuz okul/bireysel projeniz nedir? Karşılaştığınız en büyük teknik zorluk neydi ve nasıl aştınız?'
        : `${targetRole} rolünde geliştirdiğiniz sistemlerde karşılaştığınız en karmaşık performans veya mimari problemi neydi?`,
      whyInterviewerAsks: 'Adayın projede gerçekten kod yazıp yazmadığını, ezbere mi çalıştığını yoksa derinlemesine mi kavradığını tespit etmek.',
      whatToHighlight: [
        'Projenin amacını 1-2 cümlede net şekilde açıklayın.',
        'Hangi teknolojileri (tech stack) neden seçtiğinizi belirtin.',
        'Karşılaşılan spesifik hata veya darboğazı ve nasıl debug ettiğinizi aktarın.',
      ],
      sampleAnswer: isStudentOrIntern
        ? 'Dönem projemde React ve Node.js kullanarak gerçek zamanlı bir kampüs etkinlik platformu geliştirdim. Karşılaştığım en büyük zorluk, eşzamanlı kayıtlar sırasında veritabanında mükerrer kayıt oluşmasıydı. PostgreSQL transaction yönetimi ve backend tarafında optimistik kilitleme mantığını araştırarak sorunu çözdüm. Bu süreçte veritabanı tutarlılığının pratikteki önemini yaşayarak kavradım.'
        : 'Yüksek trafikli bir endpoint\'te veritabanı sorgularının response time\'ı 800ms\'ye çıkardığını gözlemledik. Query plan (EXPLAIN ANALYZE) incelemesiyle eksik index\'i tespit ettik ve sık sorgulanan veriler için Redis cache katmanı ekleyerek gecikmeyi 45ms\'ye düşürdük.',
      difficultyLevel: isStudentOrIntern ? 'Başlangıç' : 'Orta',
    },
    {
      id: 'q3',
      category: 'Teknik Problem Çözme',
      question: `Bir kod bloğunda beklenmedik bir hata (bug) veya bellek/performans sızıntısı olduğunda adım adım hangi hata ayıklama (debugging) araçlarını ve yöntemlerini kullanırsınız?`,
      whyInterviewerAsks: 'Adayın rastgele deneme-yanılma mı yaptığı yoksa sistematik bir mühendislik analitiği ile mi yaklaştığını görmek.',
      whatToHighlight: [
        'Konsol veya log kayıtlarını (stack trace) okuma refleksi',
        'Breakpoint ve tarayıcı/IDE debugger araçlarını kullanma deneyimi',
        'Hatayı en küçük izole senaryoya indirgeme yaklaşımı',
      ],
      sampleAnswer: 'İlk adımım hatanın tekrarlanabilir bir senaryosunu (reproducible steps) oluşturmaktır. Ardından hata loglarındaki stack trace\'i inceleyerek hatanın fırlatıldığı satırı ve değişken durumlarını debugger breakpoint\'leri ile adım adım incelerim. Hipotezler kurarak test eder ve çözümü doğruladıktan sonra gelecekte tekrarlanmaması için bir birim testi (unit test) yazarım.',
      difficultyLevel: 'Orta',
    },
    {
      id: 'q4',
      category: 'Kültür & Motivasyon',
      question: isStudentOrIntern
        ? `Neden özellikle bu şirkette staj yapmak/çalışmak istiyorsunuz? Sizi diğer başvuran öğrenci arkadaşlarınızdan ayıran en belirgin yönünüz nedir?`
        : `Kariyerinizin bu aşamasında şirketimizin ${targetRole} pozisyonuna başvurma motivasyonunuz nedir ve ilk 90 günde nasıl bir etki yaratmayı hedefliyorsunuz?`,
      whyInterviewerAsks: 'Adayın şirket hakkında araştırma yapıp yapmadığını ve gerçek motivasyonunu ölçmek.',
      whatToHighlight: [
        'Şirketin ürünlerine veya mühendislik kültürüne dair spesifik bir detay',
        'Kişisel öğrenme hedefleriniz ile şirketin vizyonunun nasıl örtüştüğü',
        'Tutku, proaktif çalışma ve sorumluluk alma bilinci',
      ],
      sampleAnswer: isStudentOrIntern
        ? 'Şirketinizin açık kaynak katkılarını ve mühendislik blog yazılarını düzenli olarak takip ediyorum. Özellikle mikroservis mimarisine geçiş sürecinizi anlatan yazınız beni çok etkiledi. Beni öne çıkaran yönüm, sadece okul dersleriyle yetinmeyip her hafta kendi GitHub projelerimde yeni bir teknolojiyi pratik etmem ve mentorlarımdan gelen geri bildirimleri aynı gün aksiyona dönüştürme disiplinimdir.'
        : 'Şirketinizin ölçeklenme hedefleri ve kalite odaklı mühendislik yaklaşımı tam olarak uzmanlaşmak istediğim alana hitap ediyor. İlk 90 günde kod tabanına hızla adapte olup sprint taahhütlerini eksiksiz teslim etmeyi ve takımın test kapsama oranını artırmayı hedefliyorum.',
      difficultyLevel: 'Orta',
    },
    {
      id: 'q5',
      category: 'Davranışsal (STAR)',
      question: 'Yetişmesi gereken çok sıkışık bir teslim tarihi (deadline) varken kod kalitesi ile hızlı teslimat arasında nasıl bir denge kurarsınız?',
      whyInterviewerAsks: 'Adayın gerçek dünya trade-off kararlarını, teknik borç (technical debt) bilincini ve iletişimini ölçmek.',
      whatToHighlight: [
        'Takım lideri ve ürün yöneticisiyle erken ve şeffaf iletişim kurmak',
        'MVP (Minimum Viable Product) yaklaşımıyla kritik çekirdek özellikleri önceliklendirmek',
        'Geçici çözümleri dokümante edip teknik borç kartı açarak kapatma sözü vermek',
      ],
      sampleAnswer: 'Böyle bir durumda asla sessizce kaliteden ödün verip hatalı kod göndermem. Öncelikle takım liderimle konuşarak durumu şeffafça paylaşırım. Kapsamı (scope) gözden geçirip kullanıcının en çok ihtiyaç duyduğu çekirdek akışı sağlam ve test edilmiş şekilde teslim eder, yan geliştirmeleri bir sonraki sprint\'e planlarız. Eğer hızlı bir workaround zorunluysa, bunu kodda açıkça TODO ve issue referansıyla etiketlerim.',
      difficultyLevel: 'Zorlayıcı',
    },
    {
      id: 'q6',
      category: 'Mühendislik Standartları',
      question: isStudentOrIntern
        ? 'Git versiyon kontrol sistemini okul projelerinizde veya bireysel çalışmalarınızda nasıl kullanıyorsunuz? Branch yapısı ve commit mesajı disiplininiz nasıldır?'
        : 'Kod inceleme (Code Review) süreçlerinde bir takım arkadaşınızın kodunda kritik bir mimari eksiklik gördüğünüzde geri bildiriminizi nasıl iletirsiniz?',
      whyInterviewerAsks: 'Adayın endüstri standardı takım geliştirme süreçlerine aşinalığını doğrulamak.',
      whatToHighlight: [
        'Feature branch, Pull Request (PR) ve merge conflict yönetimi',
        'Anlaşılır ve konvansiyonel commit mesajları (Conventional Commits)',
        'Saygılı, yapıcı ve neden-sonuç belirten geri bildirim dili',
      ],
      sampleAnswer: isStudentOrIntern
        ? 'Projelerimde doğrudan main branch\'e commit atmaktan kaçınırım. Her yeni özellik için "feature/ozellik-adi" veya hata için "fix/hata-adi" şeklinde branch açarım. Commit mesajlarımı "feat: kullanıcı giriş formunda validasyon eklendi" gibi açıklayıcı yazarım. Takım projelerinde ise mutlaka Pull Request açıp kod incelemesi sonrası merge ederiz.'
        : 'Geri bildirim verirken kişiyi değil kodu odağa alırım. "Burayı yanlış yapmışsın" demek yerine "Bu yaklaşımda veri boyutu büyüdüğünde N+1 sorgu problemi oluşabilir, alternatif olarak batch query kullanmayı düşünebilir miyiz?" şeklinde somut gerekçe ve alternatif çözüm önerisi sunarım.',
      difficultyLevel: 'Orta',
    },
  ];

  return {
    interviewerPersona: {
      perspective,
      keyPriorities,
      evaluationFocus,
      redFlags,
    },
    questions,
  };
}

function evaluateExpertAnswer(
  question: string,
  interviewerTitle: string,
  targetRole: string,
  candidateLevel: string,
  userAnswer: string
) {
  const answerLength = userAnswer.trim().length;
  const wordCount = userAnswer.trim().split(/\s+/).length;

  // STAR detection heuristics
  const hasSituation = /(zaman|dönem|üniversite|proje|okul|şirket|karşılaşt|başlad|grup|ekip)/i.test(userAnswer);
  const hasTask = /(görev|amaç|sorumluluk|hedef|beklenti|gerekiyordu|yapmamız)/i.test(userAnswer);
  const hasAction = /(yaptım|geliştirdim|araştırdım|çözdüm|kodladım|iletişim|hazırladım|inceledim)/i.test(userAnswer);
  const hasResult = /(sonuç|başarı|öğrendim|puan|teslim|tamamladık|arttı|iyileşti|çıktı|kazandım)/i.test(userAnswer);

  let score = 50;
  if (wordCount > 30) score += 15;
  if (wordCount > 70) score += 10;
  if (hasSituation) score += 7;
  if (hasTask) score += 6;
  if (hasAction) score += 7;
  if (hasResult) score += 5;
  if (score > 95) score = 95;

  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (hasAction) {
    strengths.push('Kişisel olarak üstlendiğiniz aksiyonları somut fiillerle ifade ettiniz.');
  } else {
    improvementAreas.push('Kendi aldığınız bireysel aksiyonları daha belirgin ("Ben şu aracı kullanarak çözdüm") şekilde anlatın.');
  }

  if (hasResult) {
    strengths.push('Elde edilen sonucu veya süreçten çıkardığınız profesyonel dersi belirttiniz.');
  } else {
    improvementAreas.push('Cevabınızı somut bir çıktı, metrik veya öğrenilen ders (Result) ile taçlandırın.');
  }

  if (wordCount >= 40) {
    strengths.push('Yeterli derinlikte ve bağlamı anlaşılır bir yanıt yapısı kurdunuz.');
  } else {
    improvementAreas.push('Cevabınız biraz kısa kaldı; durumun arka planını ve teknik detayları 1-2 cümle daha açabilirsiniz.');
  }

  if (strengths.length < 2) {
    strengths.push('Sorunun özüne odaklanıp net bir duruş sergilediniz.');
  }
  if (improvementAreas.length < 2) {
    improvementAreas.push('Mülakatçının unvanı göz önüne alındığında kullanılan sektörel teknik terim sayısını artırabilirsiniz.');
  }

  const improvedVersion = `Bu soruya verebileceğiniz en etkili yaklaşım şöyledir: "${userAnswer.trim().replace(/[.!?]+$/, '')}. Bu süreçte takım içi şeffaf iletişimi ön planda tutarak durumu erken analiz ettim, en uygun teknik yöntemi araştırıp uygulayarak görevi zamanında ve yüksek kalite standartlarında tamamladım. Bu deneyim bana hem teknik yetkinlik hem de kriz yönetiminde proaktif olmanın değerini kazandırdı."`;

  return {
    score,
    summary: score >= 75
      ? 'Cevabınız STAR kriterlerine ve mülakatçının beklentilerine genel olarak iyi uyum sağlıyor.'
      : 'Cevabınız iyi niyetli bir temel içeriyor ancak STAR yapısı ve somut aksiyon vurguları güçlendirilmeli.',
    starBreakdown: {
      situation: hasSituation ? 'Durum ve bağlam net şekilde ortaya konmuş.' : 'Durum arka planı biraz yüzeysel kalmış; nerede ve ne zaman yaşandığını belirtin.',
      task: hasTask ? 'Hedef ve çözülmesi gereken problem belirtilmiş.' : 'Tam olarak neyi çözmeniz gerektiği daha belirgin olmalı.',
      action: hasAction ? 'Kendi aldığınız somut aksiyonlar ve yöntemler vurgulanmış.' : 'Pasif kalıplar yerine "Ben şunu yaptım, şu teknolojiyi kullandım" demelisiniz.',
      result: hasResult ? 'Nihai sonuç ve öğrenilen ders aktarılmış.' : 'Sonuç (Result) kısmı eksik kalmış; proje nasıl bitti veya ne öğrendiniz?',
    },
    strengths,
    improvementAreas,
    coachTip: `${interviewerTitle} karşısında cevap verirken laf kalabalığı yapmadan doğrudan: 1) Problem neydi? 2) Sen ne yaptın? 3) Sonuç ne oldu? formülünü 2 dakikalık akıcı bir hikaye gibi sunun.`,
    improvedVersion,
  };
}

function analyzeExpertCurriculum(
  completedContent: string,
  selectedTopics: string[],
  targetRole: string,
  currentStatus: string
) {
  const allText = (completedContent + ' ' + selectedTopics.join(' ')).toLowerCase();

  const knowsReact = allText.includes('react');
  const knowsNode = allText.includes('node') || allText.includes('express');
  const knowsSQL = allText.includes('sql') || allText.includes('postgres') || allText.includes('veritabanı');
  const knowsJava = allText.includes('java') || allText.includes('spring');
  const knowsPython = allText.includes('python');
  const knowsGit = allText.includes('git');
  const knowsDocker = allText.includes('docker');

  const masteredSkills: string[] = [];
  const emergingSkills: string[] = [];
  const missingCriticalSkills: string[] = [];
  const industryExpectations: string[] = [];

  // Categorize
  if (knowsReact) masteredSkills.push('Temel React Bileşenleri & JSX');
  if (knowsSQL) masteredSkills.push('İlişkisel Veritabanı ve Temel SQL');
  if (knowsJava) masteredSkills.push('Nesne Yönelimli Programlama (OOP)');
  if (knowsPython) masteredSkills.push('Python Programlama Dili Temelleri');
  if (knowsNode) masteredSkills.push('Node.js & Express REST API Mantığı');
  if (masteredSkills.length === 0) masteredSkills.push('Algoritmik Düşünme & Temel Programlama Mantığı');

  emergingSkills.push('Modern JavaScript (ES6+ Asenkron Programlama)', 'Git Versiyon Kontrolü ile Takım Çalışması');

  // Gaps based on modern industry expectations for students / new grads
  if (!knowsGit) missingCriticalSkills.push('Git & GitHub İleri Seviye (Branching, Merge Conflicts, Pull Request akışları)');
  if (!knowsDocker) missingCriticalSkills.push('Docker Temelleri & Konteynerleştirme (Projeleri izole çalıştırma)');
  missingCriticalSkills.push('Uçtan Uca State Management & Veri Çekme (React Query / TanStack veya Redux Toolkit)');
  missingCriticalSkills.push('Birim ve Entegrasyon Testleri (Jest / Vitest ile test odaklı geliştirme)');
  missingCriticalSkills.push('CI/CD & Bulut Dağıtım (GitHub Actions ve Vercel/Render ile canlıya alma)');

  industryExpectations.push('Şirketler sadece kod yazmayı değil, yazılan kodun test edilebilir ve sürdürülebilir olmasını bekler.');
  industryExpectations.push('GitHub profilinizde canlıya alınmış (live demo linki olan) en az 2 adet özgün proje görmek isterler.');
  industryExpectations.push('API güvenliği, hata yönetimi (Error Handling) ve temiz mimari (Clean Architecture) standartlarına aşinalık aranır.');

  const nextStepTrainings = [
    {
      id: 'train_1',
      title: 'İleri Seviye Modern Frontend & State Management Kampı',
      priority: 'Kritik & Öncelikli',
      estimatedDuration: '3-4 Hafta (Haftada 8 saat)',
      reasonWhy: `Hedeflediğiniz ${targetRole} pozisyonunda şirketler sadece basit useState kullanımını değil; sunucu durumu yönetimi (server state), optimistik güncellemeler ve performans optimizasyonunu sorgular.`,
      keySyllabusModules: [
        'TypeScript ile Tip Güvenli React Mimarisi',
        'TanStack Query (React Query) ile Akıllı API Veri Önbellekleme',
        'Zustand / Redux Toolkit ile Global State Yönetimi',
        'Tailwind CSS ile Responsive & Erişilebilir (a11y) UI Bileşenleri',
        'Vitest ve React Testing Library ile Temel Test Yazımı',
      ],
      recommendedLearningSources: [
        'Resmi Dokümantasyon (React & TypeScript Docs)',
        'Fullstack Open (Ücretsiz & Kapsamlı Kurs)',
        'YouTube Proje Bazlı Atölyeler (Web Dev Simplified, Traversy Media)',
      ],
      portfolioProjectIdea: {
        projectName: 'Gerçek Zamanlı Görev & İşbirliği Paneli (Kanban Dashboard)',
        description: 'Drag & drop destekli, karanlık modlu, API entegrasyonlu ve TypeScript ile yazılmış tam fonksiyonel iş takip platformu.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'TanStack Query', 'Lucide Icons'],
        interviewShowcaseValue: 'Mülakatçıya tip güvenliği (type safety), component abstraction ve temiz mimari kararlarınızı anlatabileceğiniz ana kozunuz olur.',
      },
    },
    {
      id: 'train_2',
      title: 'Üretime Hazır Backend & RESTful API Mimarisi',
      priority: 'Önemli Gelişim',
      estimatedDuration: '2-3 Hafta (Haftada 6 saat)',
      reasonWhy: 'Öğrenciler genellikle veritabanı CRUD işlemlerinde takılı kalır. Sektör ise JWT güvenliği, input validasyonu, database indexing ve middleware akışlarına bakar.',
      keySyllabusModules: [
        'Zod ile Katı Request Body & Parametre Doğrulaması',
        'JWT & Refresh Token ile Güvenli Kimlik Doğrulama',
        'PostgreSQL İlişkisel Tasarım, İndeksleme & N+1 Probleminden Kaçınma',
        'Merkezi Hata Yakalama (Global Error Handling & Logging)',
        'Postman / Swagger (OpenAPI) Dokümantasyon Standardı',
      ],
      recommendedLearningSources: [
        'Prisma / Drizzle ORM Resmi Dokümantasyonları',
        'FreeCodeCamp Backend Geliştirme Rehberleri',
        'Açık Kaynak GitHub Node.js Best Practice Repoları',
      ],
      portfolioProjectIdea: {
        projectName: 'Rol Tabanlı Güvenli E-Ticaret / Rezervasyon API Servisi',
        description: 'Müşteri ve Yönetici rolleri ayrılmış, rate limiting ve PostgreSQL indekslemesi yapılmış REST API.',
        techStack: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT', 'Zod'],
        interviewShowcaseValue: 'Teknik mülakatta "Veritabanı güvenliğini ve yetkilendirmeyi nasıl kurguladın?" sorusuna verilecek en somut cevaptır.',
      },
    },
    {
      id: 'train_3',
      title: 'DevOps Temelleri: Docker, Git İş Akışları & CI/CD',
      priority: 'İleri Seviye Fark Yaratıcı',
      estimatedDuration: '1-2 Hafta (Haftada 5 saat)',
      reasonWhy: 'Yeni mezun veya stajyer adayları arasında Docker ve GitHub Actions bilenler mülakatlarda ilk %5\'lik dilime girer.',
      keySyllabusModules: [
        'Dockerfile ve Docker Compose ile Çoklu Servis Ayağa Kaldırma',
        'GitHub Flow: Feature Branching, PR Şablonları & Merge Stratejileri',
        'GitHub Actions ile Otomatik Test & Linting Çalıştırma (CI)',
        'Vercel / Render / Cloud Run Üzerine Canlı Dağıtım (CD)',
      ],
      recommendedLearningSources: [
        'Docker Get Started Resmi Rehberi',
        'GitHub Skills İnteraktif Eğitimleri',
      ],
      portfolioProjectIdea: {
        projectName: 'Otomatik CI/CD Pipeline\'ı Olan Monorepo Web Uygulaması',
        description: 'Her git push işleminde testleri koşan ve otomatik deploy alan konteynerize edilmiş modern web uygulaması.',
        techStack: ['Docker', 'Docker Compose', 'GitHub Actions', 'Vercel / Render'],
        interviewShowcaseValue: 'Mülakatçıya "Ben sadece kod yazmıyorum, yazdığım kodu üretim ortamına sorunsuz taşıyabiliyorum" mesajı verir.',
      },
    },
  ];

  const weeklyRoadmap = [
    {
      weekRange: '1. ve 2. Hafta',
      focus: 'Eksik Temelleri Kapatma & TypeScript / Modern Araçlara Geçiş',
      milestoneGoal: 'TypeScript temellerini pekiştirip izole bir küçük projede tip güvenliğini deneyimlemek.',
      checklist: [
        'TypeScript temel tipleri, interfaces ve generics konularını çalışın.',
        'Mevcut bir JavaScript projenizi TypeScript\'e refactor edin.',
        'GitHub repo\'nuza Conventional Commit kurallarıyla commit atın.',
      ],
    },
    {
      weekRange: '3. ve 4. Hafta',
      focus: 'Portfolyo Projesinin Çekirdek Geliştirmesi',
      milestoneGoal: 'Mülakatlarda anlatacağınız ana projenin API ve kullanıcı arayüzünü bitirmek.',
      checklist: [
        'Kanban veya Rezervasyon projenizin veritabanı şemasını çizin.',
        'REST API uç noktalarını yazıp Zod ile validasyon ekleyin.',
        'Frontend tarafında TanStack Query ile verileri bağlayın ve responsive tasarımı tamamlayın.',
      ],
    },
    {
      weekRange: '5. ve 6. Hafta',
      focus: 'Konteynerleştirme, Testler, Canlıya Alma & Mülakat Provası',
      milestoneGoal: 'Projeyi canlı URL\'ye almak ve mülakat simülasyonunda STAR anlatımıyla sunmak.',
      checklist: [
        'Dockerfile oluşturup projeyi yerel konteynerde çalıştırın.',
        'GitHub Actions ile test workflow\'u kurun ve Vercel/Render\'a deploy edin.',
        'README dosyasına canlı link, mimari diyagram ve ekran görüntüleri ekleyin.',
        'Kariyer & Mülakat Koçu simülatöründe projenizi mülakatçıya anlatma provası yapın.',
      ],
    },
  ];

  return {
    currentSkillProfile: {
      masteredSkills,
      emergingSkills,
      overallAssessment: `${currentStatus} profiliniz incelendiğinde; temel programlama nosyonuna ve akademik ders birikimine sahip olduğunuz görülüyor. Sektörel olarak ${targetRole} seviyesine tam hazır hale gelmek için okul teorisinin ötesine geçip modern araçlar (TypeScript, test yazımı, Docker ve canlı deployment) ile desteklenmiş portfolyo projeleri üretmeniz gerekiyor.`,
    },
    gapAnalysis: {
      missingCriticalSkills,
      industryExpectations,
      blindSpotsSummary: 'Akademik eğitimlerde genellikle kodun çalışması yeterli görülürken, iş hayatında kodun sürdürülebilirliği, takım içi Git standartları, hata yakalama (Error Handling) ve production ortamına deploy edilebilme becerisi aranır. Bu boşlukları kapattığınızda staj ve yeni mezun mülakatlarında ciddi bir rekabet avantajı elde edeceksiniz.',
    },
    nextStepTrainings,
    weeklyRoadmap,
  };
}

// API: Generate Questions Based on Interviewer Title & Target Role
app.post('/api/coach/generate-questions', async (req, res) => {
  const {
    interviewerTitle,
    targetRole,
    candidateLevel = 'intern_student',
    focusArea = 'Karma & Dengeli',
    companyType = 'Genel Teknoloji Şirketi',
    customContext = '',
  } = req.body;

  if (!interviewerTitle || !targetRole) {
    return res.status(400).json({ error: 'Mülakatçı unvanı ve hedef rol zorunludur.' });
  }

  // Attempt Gemini API call first; if 403 or quota limit, use expert fallback
  try {
    const prompt = `
Sen Türkiye'nin en deneyimli kıdemli Kariyer ve Mülakat Baş Koçusun.
Aşağıdaki adayın gireceği mülakat için detaylı bir soru simülasyonu ve mülakatçı profili analizi hazırla:

- Mülakatı Yapacak Kişinin Unvanı: "${interviewerTitle}"
- Adayın Başvurduğu Rol: "${targetRole}"
- Aday Seviyesi: "${candidateLevel}"
- Odak Alanı: "${focusArea}"
- Şirket Tipi: "${companyType}"
${customContext ? `- Aday Notu: "${customContext}"` : ''}

Lütfen Türkçe dilinde 6 adet özgün soru üret ve mülakatçı profili ile birlikte JSON formatında döndür.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerPersona: {
              type: Type.OBJECT,
              properties: {
                perspective: { type: Type.STRING },
                keyPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
                evaluationFocus: { type: Type.STRING },
                redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['perspective', 'keyPriorities', 'evaluationFocus', 'redFlags'],
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  whyInterviewerAsks: { type: Type.STRING },
                  whatToHighlight: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sampleAnswer: { type: Type.STRING },
                  difficultyLevel: { type: Type.STRING },
                },
                required: ['id', 'category', 'question', 'whyInterviewerAsks', 'whatToHighlight', 'sampleAnswer', 'difficultyLevel'],
              },
            },
          },
          required: ['interviewerPersona', 'questions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    if (parsedData.questions && parsedData.questions.length > 0) {
      return res.json(parsedData);
    }
  } catch (error: any) {
    console.warn('Gemini API call failed, using intelligent expert engine fallback:', error?.message);
  }

  // Graceful fallback to expert generation
  const fallbackData = generateExpertQuestions(
    interviewerTitle,
    targetRole,
    candidateLevel,
    focusArea,
    companyType,
    customContext
  );
  return res.json(fallbackData);
});

// API: Evaluate User Answer with STAR Rubric & Coaching Feedback
app.post('/api/coach/evaluate-answer', async (req, res) => {
  const { question, interviewerTitle, targetRole, candidateLevel = 'intern_student', userAnswer } = req.body;

  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Soru ve kullanıcı cevabı zorunludur.' });
  }

  try {
    const prompt = `
Sen uzman bir Mülakat Koçusun. Adayın soruya cevabını STAR kriterlerine göre değerlendir:
- Soru: "${question}"
- Mülakatçı: "${interviewerTitle}"
- Rol: "${targetRole}"
- Aday: "${candidateLevel}"
- Cevap: "${userAnswer}"

JSON formatında objektif puan (0-100), güçlü yönler, gelişim alanları, koç tavsiyesi ve profesyonel yeniden yazım ile yanıt ver.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
              },
              required: ['situation', 'task', 'action', 'result'],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            coachTip: { type: Type.STRING },
            improvedVersion: { type: Type.STRING },
          },
          required: ['score', 'summary', 'starBreakdown', 'strengths', 'improvementAreas', 'coachTip', 'improvedVersion'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.score !== undefined) {
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('Gemini API evaluation failed, using intelligent expert engine fallback:', error?.message);
  }

  // Graceful fallback to expert answer evaluation
  const fallbackEval = evaluateExpertAnswer(
    question,
    interviewerTitle,
    targetRole,
    candidateLevel,
    userAnswer
  );
  return res.json(fallbackEval);
});

// API: Analyze Curriculum & Generate Next-Step Career Training Plan
app.post('/api/coach/analyze-curriculum', async (req, res) => {
  const {
    completedContent = '',
    selectedTopics = [],
    targetRole = 'Junior Yazılım Geliştirici',
    candidateLevel = 'intern_student',
    currentStatus = 'Üniversite Öğrencisi / Staj Arayan',
  } = req.body;

  if (!completedContent && selectedTopics.length === 0) {
    return res.status(400).json({
      error: 'Lütfen aldığınız eğitimlerin içeriğini girin veya en az birkaç konu etiketi seçin.',
    });
  }

  try {
    const prompt = `
Sen Türkiye ve küresel teknoloji sektörünü çok iyi tanıyan Baş Kariyer Danışmanı ve Müfredat Mimarı bir Koçsun.
Müfredat ve eğitim içeriklerine göre boşluk analizi ve bir sonraki adım eğitim önerileri hazırla.
Tamamlanan: "${completedContent}"
Etiketler: ${selectedTopics.join(', ')}
Rol: "${targetRole}"
Durum: "${currentStatus}"
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentSkillProfile: {
              type: Type.OBJECT,
              properties: {
                masteredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                emergingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                overallAssessment: { type: Type.STRING },
              },
              required: ['masteredSkills', 'emergingSkills', 'overallAssessment'],
            },
            gapAnalysis: {
              type: Type.OBJECT,
              properties: {
                missingCriticalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                industryExpectations: { type: Type.ARRAY, items: { type: Type.STRING } },
                blindSpotsSummary: { type: Type.STRING },
              },
              required: ['missingCriticalSkills', 'industryExpectations', 'blindSpotsSummary'],
            },
            nextStepTrainings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  estimatedDuration: { type: Type.STRING },
                  reasonWhy: { type: Type.STRING },
                  keySyllabusModules: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedLearningSources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  portfolioProjectIdea: {
                    type: Type.OBJECT,
                    properties: {
                      projectName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                      interviewShowcaseValue: { type: Type.STRING },
                    },
                    required: ['projectName', 'description', 'techStack', 'interviewShowcaseValue'],
                  },
                },
                required: ['id', 'title', 'priority', 'estimatedDuration', 'reasonWhy', 'keySyllabusModules', 'recommendedLearningSources', 'portfolioProjectIdea'],
              },
            },
            weeklyRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekRange: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  milestoneGoal: { type: Type.STRING },
                  checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['weekRange', 'focus', 'milestoneGoal', 'checklist'],
              },
            },
          },
          required: ['currentSkillProfile', 'gapAnalysis', 'nextStepTrainings', 'weeklyRoadmap'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.nextStepTrainings && parsed.nextStepTrainings.length > 0) {
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('Gemini API curriculum analysis failed, using intelligent expert engine fallback:', error?.message);
  }

  // Graceful fallback to expert curriculum analysis
  const fallbackAnalysis = analyzeExpertCurriculum(
    completedContent,
    selectedTopics,
    targetRole,
    currentStatus
  );
  return res.json(fallbackAnalysis);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
