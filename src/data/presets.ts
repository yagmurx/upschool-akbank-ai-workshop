export interface InterviewPreset {
  id: string;
  label: string;
  interviewerTitle: string;
  targetRole: string;
  candidateLevel: 'intern_student' | 'new_grad' | 'junior' | 'mid' | 'senior';
  companyType: string;
  focusArea: string;
  description: string;
}

export const INTERVIEW_PRESETS: InterviewPreset[] = [
  {
    id: 'student-intern-hr',
    label: 'Stajyer / İK & Yetenek Uzmanı',
    interviewerTitle: 'İK Yetenek Kazanımı Uzmanı (Campus & Intern Recruiter)',
    targetRole: 'Yazılım Mühendisliği Stajyeri',
    candidateLevel: 'intern_student',
    companyType: 'Kurumsal Teknoloji / Fintek',
    focusArea: 'Öğrenme İsteği, Okul Projeleri & Kültür Uyumu',
    description: 'Üniversite öğrencileri için staj alımlarında motivasyon, sorumluluk bilinci ve takım çalışması odaklı mülakat simülasyonu.',
  },
  {
    id: 'student-tech-lead',
    label: 'Stajyer / Teknik Takım Lideri',
    interviewerTitle: 'Senior Tech Lead / Yazılım Takım Lideri',
    targetRole: 'Fullstack Geliştirici Stajyeri',
    candidateLevel: 'intern_student',
    companyType: 'Hızlı Büyüyen Teknoloji Girişimi (Startup)',
    focusArea: 'Temel Kodlama, Algoritmalar & Bitirme Projesi',
    description: 'Öğrencinin teorik derslerdeki başarısını, GitHub projelerini ve bilmediği teknolojiyi öğrenme yetisini test eden teknik seans.',
  },
  {
    id: 'new-grad-junior-em',
    label: 'Yeni Mezun / Engineering Manager',
    interviewerTitle: 'Engineering Manager (Mühendislik Yöneticisi)',
    targetRole: 'Junior Yazılım Mühendisi',
    candidateLevel: 'new_grad',
    companyType: 'Global Ürün Şirketi',
    focusArea: 'Problem Çözme, Clean Code & İş Teslimi',
    description: 'Üniversiteden yeni mezun adayların iş hayatına hazır olup olmadığını, kod disiplinini ve iletişimini sınayan mülakat.',
  },
  {
    id: 'junior-hr-general',
    label: 'Junior / İK Direktörü',
    interviewerTitle: 'İnsan Kaynakları Direktörü',
    targetRole: 'Junior Frontend Developer',
    candidateLevel: 'junior',
    companyType: 'Büyük Ölçekli E-Ticaret',
    focusArea: 'Davranışsal Sorular & STAR Metodu',
    description: '1-2 yıllık tecrübeli veya ilk işine başlayacak adaylar için kriz anları, geri bildirim alma ve ekip uyumu senaryoları.',
  },
  {
    id: 'mid-staff-architect',
    label: 'Mid-Level / Baş Mimar (Architect)',
    interviewerTitle: 'Principal Software Architect',
    targetRole: 'Backend Developer',
    candidateLevel: 'mid',
    companyType: 'Yüksek Trafikli Bulut Platformu',
    focusArea: 'Sistem Tasarımı & Mikroservisler',
    description: 'Veritabanı optimizasyonu, ölçeklenebilirlik ve mimari trade-off kararlarını sorgulayan ileri düzey mülakat.',
  },
];

export interface TrainingTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  topics: string[];
  targetRole: string;
  currentStatus: string;
}

export const TRAINING_TEMPLATES: TrainingTemplate[] = [
  {
    id: 'cs-university-core',
    name: 'Üniversite Bilgisayar Mühendisliği Temel Dersleri',
    category: 'Üniversite & Yeni Mezun',
    topics: ['C / C++', 'Java', 'Veri Yapıları', 'Algoritmalar', 'Nesne Yönelimli Programlama', 'SQL & Veritabanı Sistemleri', 'İşletim Sistemleri'],
    targetRole: 'Junior Backend / Yazılım Mühendisi',
    currentStatus: 'Üniversite Öğrencisi (3./4. Sınıf)',
    content: `Üniversite 3. Sınıf boyunca tamamladığım temel ders içerikleri:
1. Veri Yapıları ve Algoritmalar: Bağlı listeler (Linked List), Ağaçlar (Binary Search Tree), Sıralama algoritmaları (QuickSort, MergeSort), Asimptotik karmaşıklık (Big-O analizi).
2. Nesne Yönelimli Programlama (Java): Kalıtım, Polimorfizm, Kapsülleme, Arayüzler (Interfaces), Temel tasarım desenleri.
3. Veritabanı Yönetim Sistemleri: İlişkisel veritabanı tasarımı, ER diyagramları, Normalizasyon kuralları, SQL sorguları (JOIN, GROUP BY, Indexing temelleri).
4. Web Programlama Giriş: Temel HTML, CSS ve JavaScript kullanarak basit bir öğrenci kayıt web sitesi projesi.`,
  },
  {
    id: 'frontend-modern-bootcamp',
    name: 'Frontend Web Geliştirme Temelleri',
    category: 'Web Geliştirme',
    topics: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'Tailwind CSS', 'Git & GitHub', 'REST API'],
    targetRole: 'Junior Frontend Developer',
    currentStatus: 'Staj Arayan Yeni Mezun',
    content: `Tamamladığım 12 haftalık modern Frontend eğitimi içeriği:
- Modern JavaScript: Arrow fonksiyonları, Destructuring, Promises, Async/Await, Array metotları (map, filter, reduce), DOM Manipülasyonu.
- React.js: Fonksiyonel bileşenler, useState, useEffect, Custom Hooks, Props geçişi, Context API ile durum yönetimi.
- Tailwind CSS: Flexbox, CSS Grid, Responsive tasarım, modern kart ve dashboard tasarımları.
- Projeler: Hava durumu uygulaması (OpenWeather API ile fetch), E-ticaret sepeti uygulaması (Local Storage ve filtreleme).`,
  },
  {
    id: 'backend-node-sql',
    name: 'Node.js & İlişkisel Veritabanı Temelleri',
    category: 'Backend & Sunucu',
    topics: ['Node.js', 'Express.js', 'PostgreSQL', 'SQL', 'REST API', 'JWT Kimlik Doğrulama', 'Git'],
    targetRole: 'Backend Developer Stajyeri',
    currentStatus: 'Üniversite Öğrencisi (Staj Arayışı)',
    content: `Katıldığım 8 haftalık Backend atölyesi içeriği:
- Node.js ve Express.js ile RESTful API oluşturma, MVC mimarisi, Middleware yapısı.
- PostgreSQL ve Knex/Prisma ORM ile CRUD işlemleri, ilişkisel tablolar (1-to-N, N-to-N).
- JWT (JSON Web Token) ve bcrypt kullanarak kullanıcı kayıt, giriş ve oturum doğrulama güvenliği.
- Postman ile API uç noktası testleri ve hata yakalama (Error Handling) mekanizmaları.`,
  },
  {
    id: 'python-ai-data-core',
    name: 'Python, Veri Bilimi & Makine Öğrenmesi Temelleri',
    category: 'Yapay Zeka & Veri',
    topics: ['Python', 'Pandas', 'NumPy', 'Matplotlib / Seaborn', 'Scikit-Learn', 'Veri Analizi', 'SQL'],
    targetRole: 'Veri Analisti / AI Mühendisi Stajyeri',
    currentStatus: 'Yeni Mezun / Akademik Geçmiş',
    content: `Tamamladığım Veri Bilimine Giriş eğitimi:
- Python ile Veri Manipülasyonu: Pandas DataFrame işlemleri, eksik verileri temizleme, filtreleme, gruplama.
- Veri Görselleştirme: Matplotlib ve Seaborn ile korelasyon matrisleri, histogramlar ve dağılım grafikleri.
- Temel Makine Öğrenmesi: Denetimli öğrenme algoritmaları (Lineer Regresyon, Lojistik Regresyon, Karar Ağaçları), Train/Test ayrımı, Accuracy ve Confusion Matrix metrikleri.`,
  },
];

export const POPULAR_TOPICS: string[] = [
  'JavaScript (ES6+)',
  'TypeScript',
  'React.js',
  'Next.js',
  'Vue.js',
  'HTML5 / CSS3 / Tailwind',
  'Node.js & Express',
  'Python',
  'Java / Spring Boot',
  'C# / .NET Core',
  'C / C++',
  'SQL & PostgreSQL',
  'MongoDB',
  'Redis',
  'RESTful API',
  'GraphQL',
  'Git & GitHub',
  'Docker & Konteynerlar',
  'CI/CD Temelleri',
  'AWS / Bulut Bilişim',
  'Veri Yapıları & Algoritmalar',
  'OOP & Clean Code',
  'Birim Testleri (Jest / Vitest)',
  'Mikroservis Mimarisi',
  'Pandas & Veri Analizi',
  'Makine Öğrenmesi Temelleri',
  'Agile / Scrum Süreçleri',
];
