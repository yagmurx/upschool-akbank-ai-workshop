# Render (render.com) Canlıya Alma (Deployment) Rehberi ve Planı

Bu plan, **Kariyer & Mülakat Koçu** uygulamasını [Render](https://render.com) platformunda tek bir Full-Stack Node.js Web Service olarak canlıya alabilmeniz için gereken tüm ayarları, Build ve Start komutlarını ve ortam değişkenlerini adım adım açıklar.

## User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı tercihleri doğrultusunda onaylanan dağıtım mimarisi:
- **Servis Tipi**: Tek bir Node.js Web Service (Full-Stack mimari; Express backend hem API rotalarını yönetir hem de `dist/` altındaki Vite frontend'ini statik olarak sunar).
- **Çalıştırma Yöntemi**: `npm run build` ile frontend derlemesi ve `tsx server.ts` ile doğrudan sunucu çalıştırma.

---

## 1. Render Dağıtım Parametreleri (Özet Tablo)

Render kontrol panelinde yeni bir **Web Service** oluştururken girilecek değerler:

| Parametre Alanı | Girilecek Değer | Açıklama |
| :--- | :--- | :--- |
| **Service Type** | `Web Service` | Arka plan ve ön yüzü birlikte çalıştıran Node.js servisi |
| **Environment / Runtime** | `Node` | Node.js çalışma ortamı (Node 18 veya Node 20+) |
| **Branch** | `main` | Dağıtılacak Git dalı |
| **Build Command** | `npm install && npm run build` | Paketleri kurar ve Vite frontend kodunu `dist/` dizinine derler |
| **Start Command** | `npm start` *(veya `npx tsx server.ts`)* | Sunucuyu ve API rotalarını ayağa kaldırır |
| **Auto-Deploy** | `Yes` (Opsiyonel) | GitHub'a her push yapıldığında otomatik güncellenir |

---

## 2. Ortam Değişkenleri (Environment Variables)

Render Web Service ayarlarında **Environment** sekmesinden aşağıdaki değişkenler tanımlanmalıdır:

1. `NODE_ENV`: `production`
   - Express sunucusunun Vite dev middleware yerine `dist/` klasöründeki optimize edilmiş statik dosyaları sunmasını sağlar.
2. `PORT`: `10000` *(Render varsayılanı `10000`'dir; `server.ts` kodumuz `process.env.PORT` değerini otomatik algılar).*
3. `GEMINI_API_KEY`: `AIzaSy...`
   - Google AI Studio'dan aldığınız Gemini API anahtarı.

---

## 3. Kod Tabanı & Mimari Uyumluluk Kontrolü

1. **`package.json` Komutları**:
   - `"build": "vite build"` -> `dist/` klasörünü oluşturur.
   - `"start": "tsx server.ts"` -> Express sunucusunu TypeScript desteğiyle doğrudan başlatır.
2. **`server.ts` Üretim Modu Davranışı**:
   - `process.env.NODE_ENV === 'production'` olduğunda `express.static('dist')` devreye girer.
   - Tüm `/api/coach/*` uç noktaları sunucu tarafında çalışmaya devam eder.
   - `0.0.0.0` hostu ve `process.env.PORT` portu dinlenir.

---

## 4. Adım Adım Dağıtım Süreci

1. **GitHub'a Gönderme**:
   - Kodları GitHub reponuza push edin (`git push origin main`).
2. **Render'da Proje Oluşturma**:
   - [dashboard.render.com](https://dashboard.render.com) adresine gidin.
   - **"New +"** butonuna tıklayıp **"Web Service"** seçin.
   - GitHub reponuzu bağlayın.
3. **Konfigürasyon Girişi**:
   - **Name**: `kariyer-mulakat-kocu`
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables Ekleme**:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `[Sizin API Anahtarınız]`
5. **Deploy**:
   - **"Create Web Service"** butonuna basın. Render 1-2 dakika içinde derlemeyi tamamlayıp size `https://kariyer-mulakat-kocu.onrender.com` gibi canlı bir URL verecektir.
