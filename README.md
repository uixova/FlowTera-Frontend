# 🌊 FlowTera Frontend

> **Kurumsal Harcama & Seyahat Yönetim Platformu** — React 19 + Vite ile geliştirilmiş modern SPA arayüzü

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![i18next](https://img.shields.io/badge/i18next-25.x-26A69A?logo=i18next)](https://i18next.com)
[![Recharts](https://img.shields.io/badge/Recharts-3.x-22B5BF)](https://recharts.org)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 İçindekiler

- [Uygulama Amacı](#-uygulama-amacı)
- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Yapısı](#-proje-yapısı)
- [Sayfalar & Modüller](#-sayfalar--modüller)
- [Kurulum](#-kurulum)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Çoklu Dil Desteği](#-çoklu-dil-desteği)
- [Tema Sistemi](#-tema-sistemi)
- [Backend Bağlantısı](#-backend-bağlantısı)

---

## 🎯 Uygulama Amacı

FlowTera Frontend, şirket içi harcama ve seyahat taleplerini yöneten kurumsal bir SPA'dır. React 19 + Vite üzerine kurulu bu arayüz; gerçek zamanlı bildirimler, çoklu dil desteği, özelleştirilebilir tema motoru ve rol tabanlı erişim kontrolü ile kurumsal kullanıma hazır bir deneyim sunar.

**Öne çıkan özellikler:**

| Özellik | Detay |
|---|---|
| Demo modu | Backend gerektirmeden tüm modüller çalışır |
| Çift dil | TR / EN anlık geçiş, namespace tabanlı i18n |
| Tema motoru | 8 renk paleti, 4 border-radius, dark/light mod |
| OCR entegrasyonu | Fatura görseli yükleme → ML servisi otomatik çıkarım |
| RBAC | Deny-list izin sistemi → sayfa ve bileşen düzeyinde kontrol |
| Responsive | 380px – 1920px tam destek, mobil drawer navigasyon |

---

## ✨ Özellikler

- **Harcama Yönetimi** — kategori, işletme, ödeme yöntemi, çoklu para birimi, onay akışı
- **Seyahat Yönetimi** — varış noktası, araç tipi, tarih aralığı, bütçe, onay akışı
- **İstek Paneli** — admin onay/red, toplu işlem, anlık durum güncelleme
- **Analiz Paneli** — Recharts grafikleri, dönem filtresi, dışa aktarma
- **Arşiv** — onaylanmış harcama/seyahat galerisi, görsel görüntüleyici
- **Takım Yönetimi** — takım oluşturma, üye davet, rol atama, izin yönetimi
- **Abonelik** — plan karşılaştırma, Stripe ödeme entegrasyonu
- **Tema Özelleştirme** — canlı önizleme, renk + köşe + mod seçimi
- **WebSocket** — Socket.io ile gerçek zamanlı bildirimler
- **Yardım Merkezi** — kategorize SSS, adım adım rehberler, bildirim kutuları

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|---|---|---|
| UI Framework | React | 19 |
| Build Tool | Vite | 7.x |
| Dil | JSX + TypeScript (utils/hooks) | 5.x |
| Routing | React Router DOM | 7.x |
| Animasyon | Framer Motion | 12.x |
| Grafik | Recharts | 3.x |
| i18n | i18next + react-i18next | 25.x / 16.x |
| Bayrak İkonları | country-flag-icons | 1.x |
| İkon Seti | Tabler Icons (CDN) | - |
| Stil | Plain CSS + CSS Custom Properties | - |

---

## 📁 Proje Yapısı

```
FlowTera-Frontend/
│
├── public/                         # Statik dosyalar
│
├── src/
│   ├── api/                        # API istek fonksiyonları (axios/fetch)
│   │
│   ├── assets/
│   │   ├── icons/                  # SVG ikonlar
│   │   └── images/                 # Görseller, placeholder'lar
│   │
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── ActionSidebar       # Sağdan kayan detay/aksiyon paneli
│   │   │   ├── SubNavbar           # Sayfa içi başlık + arama + butonlar
│   │   │   └── navbar/             # Üst navigasyon çubuğu + mobil drawer
│   │   ├── overlays/
│   │   │   ├── imageBox/           # Lightbox görsel görüntüleyici
│   │   │   └── themeModal/         # Tema özelleştirme paneli
│   │   └── ui/                     # Genel amaçlı UI bileşenleri
│   │
│   ├── config/                     # API base URL, ortam konfigürasyonu
│   │
│   ├── context/
│   │   ├── AuthContext             # Kullanıcı oturumu, JWT yönetimi
│   │   ├── TeamContext             # Aktif takım seçimi
│   │   └── ThemeContext            # Tema durumu, CSS değişken enjeksiyonu
│   │
│   ├── data/                       # Demo JSON verileri + yardımcı sabit veriler
│   │   ├── demo-trips.json
│   │   ├── demo-expenses.json
│   │   ├── demo-requests.json
│   │   ├── demo-dashboard.json
│   │   ├── helpData.ts             # Yardım merkezi içeriği (bilingual)
│   │   └── plan.json               # Abonelik planları
│   │
│   ├── features/
│   │   ├── analysis/               # Analiz dashboard, grafikler
│   │   ├── archive/                # Arşiv galerisi
│   │   ├── auth/                   # Giriş, kayıt, onboarding, abonelik sayfası
│   │   ├── dashboard/              # Ana sayfa, özet kartlar, aktiviteler
│   │   ├── expenses/               # Harcama listesi, oluşturma, detay paneli
│   │   ├── help/                   # Yardım merkezi, kategori + içerik
│   │   ├── history/                # İşlem geçmişi
│   │   ├── payment/                # Ödeme akışı
│   │   ├── requests/               # Admin onay/red paneli
│   │   ├── settings/               # Kullanıcı ayarları, profil, plan
│   │   ├── subscription/           # Plan karşılaştırma, yükseltme
│   │   ├── teams/                  # Takım listesi, üye yönetimi
│   │   └── trips/                  # Seyahat listesi, oluşturma, detay paneli
│   │
│   ├── hooks/                      # Custom React hook'ları
│   │   ├── useLightbox             # ImageBox açma/kapama yönetimi
│   │   └── ...
│   │
│   ├── layouts/                    # Sayfa düzeni wrapper'ları
│   │
│   ├── locales/                    # i18n namespace JSON dosyaları
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   ├── expenses.json
│   │   ├── trips.json
│   │   ├── teams.json
│   │   ├── settings.json
│   │   ├── analysis.json
│   │   ├── archive.json
│   │   ├── help.json
│   │   ├── enums.json
│   │   └── auth.json
│   │
│   ├── services/                   # API servis katmanı (auth, expenses, trips...)
│   │
│   ├── styles/                     # Global CSS, CSS custom property tanımları
│   │
│   ├── types/                      # TypeScript tip tanımları
│   │
│   └── utils/
│       ├── i18nHelpers.ts          # tCategory, tTripCategory, tStatus... çözümleyiciler
│       └── ...
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── package.json
```

---

## 📄 Sayfalar & Modüller

| Sayfa | Yol | RBAC |
|---|---|---|
| Giriş / Kayıt | `/login`, `/register` | Herkese açık |
| Onboarding | `/onboarding` | Yeni kullanıcı |
| Ana Sayfa | `/dashboard` | Giriş yapmış |
| Harcamalar | `/expenses` | Giriş yapmış |
| Geziler | `/trips` | Giriş yapmış |
| İstekler | `/requests` | Admin rolü |
| Analiz | `/analysis` | `view_analytics` izni |
| Arşiv | `/archive` | Enterprise plan |
| Geçmiş | `/history` | Giriş yapmış |
| Takımlar | `/teams` | Giriş yapmış |
| Ayarlar | `/settings` | Giriş yapmış |
| Abonelik | `/subscription` | Giriş yapmış |
| Yardım | `/help` | Giriş yapmış |

---

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js 20+
- npm 10+

### 1. Bağımlılıkları Yükle

```bash
cd FlowTera-Frontend
npm install
```

### 2. Ortam Değişkenlerini Yapılandır

```bash
cp .env.example .env
# .env dosyasını düzenle
```

### 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
# → http://localhost:3000
```

### 4. Üretim Build

```bash
npm run build
# dist/ klasörüne derlenir

npm run preview
# Build önizlemesi
```

---

## ⚙️ Ortam Değişkenleri

```env
# API Gateway adresi
VITE_API_URL=http://localhost:3002

# Demo mod (backend olmadan çalış)
VITE_DEMO_MODE=true
```

> **Not:** `VITE_DEMO_MODE=true` ayarlandığında tüm API çağrıları yerel JSON demo verisine yönlendirilir. Backend kurulumu gerekmez.

---

## 🌐 Çoklu Dil Desteği

i18next + react-i18next üzerine kurulu namespace tabanlı sistem.

**Dil dosyaları:** `src/locales/*.json`

**Format:**
```json
{
  "key": { "tr": "Türkçe metin", "en": "English text" }
}
```

**Namespace örneği:**
```js
const { t } = useTranslation('expenses.detail');
t('rejection_reason') // → "Red Sebebi" veya "Rejection Reason"
```

**Anlık dil geçişi:** Navbar'daki küre ikonuyla TR / EN değiştirilebilir. Seçim `localStorage`'a kaydedilir.

**`useI18n()` hook'u** (`src/utils/i18nHelpers.ts`) — enum anahtarlarını yerelleştirir:

| Fonksiyon | Örnek girdi | Çıktı (TR) |
|---|---|---|
| `tCategory(key)` | `'Shopping'` | `'Alışveriş'` |
| `tTripCategory(key)` | `'Business'` | `'İş Gezisi'` |
| `tStatus(key)` | `'pending'` | `'Beklemede'` |
| `tVehicle(key)` | `'plane'` | `'Uçak'` |
| `tPayment(key)` | `'credit_card'` | `'Kredi Kartı'` |

---

## 🎨 Tema Sistemi

Navbar'daki fırça ikonu → `ThemeModal` paneli açılır.

**Özelleştirme seçenekleri:**

| Seçenek | Seçenekler |
|---|---|
| Mod | Dark / Light |
| Renk paleti | 8 preset (Yeşil, Mavi, Mor, Kırmızı, Turuncu, Teal, Gül, Sarı) |
| Border radius | Sharp / Soft / Round / Ultra |

Tema değerleri CSS custom property olarak `<html>` elementine enjekte edilir ve `localStorage`'da saklanır.

> **Not:** Renk paleti ve border radius özelleştirmesi Professional ve üzeri planlarda aktiftir.

---

## 🔌 Backend Bağlantısı

Frontend, FlowTera Backend'in API Gateway'ine (`port 3002`) bağlanır.

```
FlowTera-Frontend (port 3000)
        │
        │  HTTP/REST + WebSocket
        ▼
FlowTera-Backend API Gateway (port 3002)
        │
        ├── Node Core Service (port 3001)
        └── Python ML Service (port 8000)
```

**Kimlik doğrulama:** `Authorization: Bearer <JWT_TOKEN>` başlığı — `AuthContext` tüm isteklere otomatik ekler.

**Demo mod:** `VITE_DEMO_MODE=true` ile backend bağlantısı devre dışı bırakılır, tüm veriler `src/data/demo-*.json` dosyalarından servis edilir.

---

## 🔒 Güvenlik Notları

- JWT token `localStorage`'da saklanır; üretimde `httpOnly` cookie'ye geçiş önerilir
- `.env` dosyaları **asla** git'e commit edilmez
- RBAC kontrolleri hem frontend (sayfa yönlendirme) hem backend (API) katmanında uygulanır

---

## 📄 Lisans

Bu yazılım özel mülkiyet lisansı altında korunmaktadır.
Tüm hakları saklıdır. Bkz. [LICENSE](LICENSE)

---

*FlowTera Frontend — © 2025-2026 uixova. Tüm hakları saklıdır.*
