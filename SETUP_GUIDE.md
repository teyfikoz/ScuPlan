# ScuPlan - Setup ve Kullanım Kılavuzu

## 🚀 Localhost Kurulumu

### 1. Gereksinimler
- Python 3.11 veya üzeri
- pip (Python paket yöneticisi)
- PostgreSQL (production veya local persistence gerekiyorsa)

### 2. Kurulum Adımları

```bash
# 1. Proje dizinine gidin
cd /path/to/ScuPlan

# 2. Virtual environment oluşturun (zaten oluşturuldu)
python3 -m venv venv

# 3. Virtual environment'ı aktive edin
source venv/bin/activate

# 4. Bağımlılıkları yükleyin
pip install -r requirements.txt

# 5. Ortam değişkenlerini hazırlayın
cp .env.example .env

# 6. Uygulamayı başlatın
python main.py
```

### 3. Erişim
Tarayıcınızda şu adresi açın:
- **Ana URL:** http://127.0.0.1:5001
- **Alternatif:** http://localhost:5001

## 📱 Sayfa Navigasyonu

Uygulama şu sayfalardan oluşur:

1. **Dive Planner** (`/`) - Ana dalış planlama sayfası
2. **Checklists** (`/checklist`) - Dalış kontrol listeleri
3. **Technical Diving** (`/technical`) - Teknik dalış hesaplamaları
4. **Dive Routes** (`/dive_routes`) - Dünyaca ünlü dalış rotaları
5. **Dive Education** (`/dive_education`) - Dalış eğitimi ve AI asistanı
6. **Saved Plans** - Kaydedilmiş dalış planları
7. **About Me** - Hakkımda bilgileri
8. **White Label Admin** (`/admin/whitelabel`) - Gelir ettirme ayarları

## 💰 Gelir Ettirme Özellikleri

### Google Tag / Consent Mode v2

ScuPlan artik Google tag'i ortak `layout.html` dosyasindan yukler ve Consent Mode v2 banner'ini ayni yerden yonetir.

Temel `.env` ayarlari:

```env
GOOGLE_TAG_ID=G-FZYPK08YL7
GOOGLE_CONSENT_MODE_ENABLED=true
ADSENSE_ENABLED=false
ADSENSE_CLIENT_ID=ca-pub-1281503375146617
```

Notlar:

- `GOOGLE_TAG_ID`, GA4 web data stream icindeki Google tag / Measurement ID degeridir.
- `GOOGLE_CONSENT_MODE_ENABLED=true` iken ziyaretciye kabul/red banner'i gosterilir.
- Consent secimi `localStorage` icinde `scuplan_google_consent_v1` anahtariyla saklanir.
- AdSense script'i ancak reklam izni verildiginde yuklenir.
- Google Tag Assistant ile `ad_storage`, `ad_user_data`, `ad_personalization` ve `analytics_storage` sinyallerini test edin.

### Google AdSense Entegrasyonu

**Durum:** Infrastructure hazır, ca-pub ID bekliyor.

1. **Publisher ID ve Slot ID'leri Alma**
   - Google AdSense hesabına gir: https://www.google.com/adsense
   - Account → Account information → Publisher ID (`ca-pub-1281503375146617`)
   - Ads → By ad unit → Create new ad unit → 3 adet unit oluştur:
     - Main Content (responsive horizontal)
     - Footer (responsive horizontal)
     - Sidebar (responsive vertical)
   - Her birinin Slot ID'sini not al

2. **Sunucuda Güncelleme**
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@46.62.164.198
   # .env güncelle:
   nano /var/www/scuplan/.env
   # ADSENSE_CLIENT_ID=ca-pub-1281503375146617  ← gerçek ID ile değiştir

   # whitelabel_settings.json güncelle:
   nano /var/www/scuplan/whitelabel_settings.json
   # adsense_client_id ve adsense_slots içindeki REPLACE_SLOT_ID değerlerini doldur

   systemctl restart scuplan
   ```

3. **Reklam Konumları (aktif)**
   - **Ana İçerik:** Her sayfanın içerik sonunda (`main_content` slot)
   - **Footer:** Footer'dan hemen önce (`footer` slot)
   - **Sidebar:** Blog yazılarının sağ sütununda (`sidebar` slot)
   - **Mid-Article:** Blog yazılarının 3. bölümünden sonra (`main_content` slot)

4. **Consent Mode:** Ziyaretçi izin verene kadar reklamlar gizlenir (GDPR uyumlu)

### White Label Özellikleri

White Label Admin sayfasında (`/admin/whitelabel`) şunları yapabilirsiniz:

1. **Branding**
   - Uygulama adını değiştirin
   - Logo ve favicon'u özelleştirin
   - Slogan ekleyin

2. **Tema Renkleri**
   - Primary, Secondary ve Accent renklerini seçin
   - Markanıza uygun renk paleti oluşturun

3. **Premium Özellikler**
   - "Powered by ScuPlan" markasını kaldırın
   - Kendi domain'inizi kullanın
   - Özel footer metni ekleyin

4. **İletişim Bilgileri**
   - Destek e-posta adresi
   - Sosyal medya linkleri
   - LinkedIn, Twitter, Facebook

## 🔧 Metric/Imperial Birim Dönüşümü

### Kullanım
- Sağ üst köşedeki "Metric" / "Imperial" butonlarını kullanın
- Tüm sayfalarda otomatik olarak senkronize olur
- Seçiminiz tarayıcıda kaydedilir

### Desteklenen Birimler
- **Derinlik:** metre (m) ↔ feet (ft)
- **Basınç:** bar ↔ PSI
- **Sıcaklık:** Celsius (°C) ↔ Fahrenheit (°F)
- **Hacim:** Litre (L) ↔ Cubic Feet (cuft)
- **Ağırlık:** Kilogram (kg) ↔ Pound (lbs)
- **Mesafe:** Metre (m) ↔ Yard (yd)

## 🧪 Test Edilmiş Özellikler

### ✅ Navigasyon
- [x] Ana sayfa geçişleri sorunsuz çalışıyor
- [x] Footer linkleri düzgün çalışıyor
- [x] About Me modal açılıyor
- [x] Saved Plans, Offline Guide, Export Guide linkleri çalışıyor

### ✅ Butonlar
- [x] Calculate Dive Plan butonu
- [x] Add Tank butonu
- [x] Add Buddy butonu
- [x] Technical diving hesaplama butonları
- [x] Unit converter butonları
- [x] Modal kapatma butonları

### ✅ Metric/Imperial Çevirici
- [x] Tüm sayfalarda senkronize çalışıyor
- [x] Input değerleri doğru dönüştürülüyor
- [x] Birim etiketleri güncellenli yor
- [x] Kullanıcı tercihi kaydediliyor

### ✅ Google AdSense
- [x] AdSense script'i yalnizca kullanici izni sonrasi yukleniyor
- [x] Ana içerik reklamı eklendi
- [x] Footer reklamı eklendi
- [x] White Label Admin'den kontrol edilebilir
- [x] Açma/kapama özelliği çalışıyor

### ✅ Google Tag / Consent Mode
- [x] Google tag shared layout'tan merkezi olarak yukleniyor
- [x] Consent Mode v2 kabul/red banner'i mevcut
- [x] Consent secimi tarayicida saklaniyor
- [x] AdSense yuklemesi kullanici iznine baglandi
- [x] White Label Admin'den Google tag ID guncellenebiliyor

### ✅ White Label
- [x] Yapılandırma dosyası sistemi
- [x] Admin panel oluşturuldu
- [x] API endpoints hazır
- [x] Template entegrasyonu tamamlandı

## 📊 API Endpoints

### Dive Planning
- `POST /api/calculate` - Dalış planı hesapla
- `GET /api/plan/<token>` - Kayıtlı planı getir

### Checklists
- `GET /api/checklists` - Kontrol listelerini getir
- `POST /api/checklists` - Yeni liste oluştur

### Technical Diving
- `POST /api/tech/mod` - Maximum Operating Depth
- `POST /api/tech/end` - Equivalent Narcotic Depth
- `POST /api/tech/best-mix` - Optimal gaz karışımı
- `POST /api/tech/cns` - CNS oksijen toksisitesi
- `POST /api/tech/multi-level` - Çoklu seviye profil

### White Label
- `GET /api/whitelabel/config` - Yapılandırmayı getir
- `POST /api/whitelabel/config` - Yapılandırmayı güncelle

## 🎯 Hızlı Test Senaryosu

1. **Navigasyon Testi**
   ```
   - Ana sayfa → Checklists → Technical → Dive Routes → Dive Education
   - Her sayfada butonlara tıklayın
   - Modal'ları açıp kapatın
   ```

2. **Birim Dönüşüm Testi**
   ```
   - Ana sayfada bir dalış planı girin (örn: 18m derinlik)
   - Metric'ten Imperial'e geçin
   - Değerin ~59 ft olarak görünmesini kontrol edin
   - Geri Metric'e geçin
   ```

3. **AdSense Testi**
   ```
   - /admin/whitelabel sayfasına gidin
   - AdSense ayarlarını yapın
   - Sayfayı yenileyin
   - Reklam bloklarının görünmesini kontrol edin
   ```

4. **White Label Testi**
   ```
   - /admin/whitelabel sayfasında:
     - App Name'i değiştirin (örn: "MyDivePlanner")
     - Primary color'u değiştirin
     - Save Configuration'a tıklayın
     - Ana sayfayı yenileyin ve değişiklikleri görün
   ```

## 🔒 Güvenlik Notları

- Admin sayfası (`/admin/whitelabel`) production'da kimlik doğrulama gerektirmeli
- AdSense client ID ve slot ID'leri güvenli tutulmalı
- API endpoints production'da rate limiting eklenmel i

## 📝 Veritabanı

- **Type:** SQLite (Development)
- **File:** `diveplan.db`
- **Tables:** DivePlan, Tank, Buddy, Checklist, ChecklistItem

Production için PostgreSQL kullanılması önerilir.

## 🌐 Production Deployment

1. **Environment Variables**
   ```bash
   export SESSION_SECRET="your-secret-key"
   export DATABASE_URL="postgresql://..."
   ```

2. **Gunicorn ile Çalıştırma**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5001 main:app
   ```

3. **Nginx Proxy**
   - Nginx ile reverse proxy yapılandırın
   - SSL sertifikası ekleyin (Let's Encrypt)

## 🤖 Haftalık Blog Otomasyon Scripti

`scripts/generate_blog_post.py` — her Pazartesi sabahı HuggingFace API üzerinden
Llama-3.1-8B-Instruct kullanarak SEO-optimized dalış içeriği üretir ve veritabanına kaydeder.

### Manuel Çalıştırma
```bash
ssh -i ~/.ssh/id_ed25519 root@46.62.164.198
cd /var/www/scuplan
source venv/bin/activate
python scripts/generate_blog_post.py
```

### Cron Job (otomatik kurulu)
```
0 8 * * 1  # Her Pazartesi saat 08:00 UTC
```
Log: `/var/log/scuplan-blog.log`

### Kontrol
```bash
crontab -l | grep scuplan        # Cron job aktif mi?
tail -20 /var/log/scuplan-blog.log  # Son log
```

### Konu Havuzu
`scripts/generate_blog_post.py` içinde `TOPICS` listesi — 25 konu mevcut.
Yeni konular eklemek için `TOPICS` listesine `(slug, title)` tuple ekle.

### Blog Post URL Yapısı
- Dinamik: `https://scuplan.com/blog/<slug>` → `BlogPost` tablosundan
- Statik: `https://scuplan.com/blog/tourist-dive-dangers` → HTML template'den

## 🆘 Sorun Giderme

### Port 5000 kullanımda hatası
- main.py'de port 5001 kullanılıyor
- Gerekirse farklı bir port seçin

### ModuleNotFoundError: flask
- Virtual environment aktif mi kontrol edin:
  ```bash
  source venv/bin/activate
  pip install -r requirements.txt
  ```

### Database initialization error
- Veritabanı dosyası yoksa otomatik oluşturulur
- Hata devam ederse `diveplan.db` dosyasını silin ve yeniden başlatın

### AdSense reklamları görünmüyor
- AdSense hesabınız onaylı mı?
- Client ID ve Slot ID'ler doğru mu?
- White Label Admin'de "Enable AdSense" seçili mi?

## 📞 İletişim

**Teyfik ÖZ**
- Email: teyfikoz@yahoo.com
- LinkedIn: https://www.linkedin.com/in/teyfikoz

---

**Notlar:**
- Bu uygulama eğitim amaçlıdır
- Gerçek dalışlardan önce profesyonel eğitim alın
- Her zaman sertifikasyon limitlleriniz dahilinde dalın

## 🤖 Tam Otomatik Gelir Makinesi (AdSense + Affiliate + Blog Ajanı)

### 1. AdSense Auto Ads
1. `.env` içinde `ADSENSE_CLIENT_ID=ca-pub-GERÇEK_ID` ve `ADSENSE_ENABLED=true` ayarlayın.
2. `ADSENSE_AUTO_ADS_ENABLED=true` bırakın ve AdSense panelinde scuplan.com için **Auto ads**'i açın.
3. Consent banner açıkken (`GOOGLE_CONSENT_MODE_ENABLED=true`) reklam scripti yalnızca
   kullanıcı onayından sonra yüklenir (GDPR/Consent Mode v2 uyumlu).

### 2. Affiliate Katmanı
- `.env`: `AMAZON_AFFILIATE_TAG`, `LIVEABOARD_AFFILIATE_ID`, `PADI_AFFILIATE_URL`
- Ürün vitrinleri: `/gear`, `/gear/best-dive-gear-2026`, `/gear/beginner-dive-computers`
  → İçerik `static/data/affiliate_products.json` dosyasından gelir; ASIN ekleyince
  linkler otomatik `amazon.com/dp/ASIN?tag=...` formuna döner (boşken tag'li arama linki).
- Liveaboard arama kutusu + PADI CTA otomatik olarak blog yazılarında (sidebar + makale içi)
  ve gear sayfalarında render edilir.

### 3. Blog Yazarı Ajanı (haftada 2 makale, Groq)
```bash
# .env: GROQ_API_KEY=gsk_...   (ücretsiz: console.groq.com)
python scripts/blog_writer_agent.py --dry-run   # test
python scripts/blog_writer_agent.py             # üret + yayınla + content/posts/*.md arşivle
python scripts/blog_writer_agent.py --push      # + markdown arşivini git'e pushla

# Cron (Pazartesi & Perşembe 09:00):
0 9 * * 1,4 /var/www/scuplan/venv/bin/python /var/www/scuplan/scripts/blog_writer_agent.py --push >> /var/log/scuplan-blog.log 2>&1
```
Makale anında `scuplan.com/blog/<slug>` adresinde yayına girer; kategoriye göre
Liveaboard/PADI/Amazon affiliate blokları otomatik eklenir.

### 4. Sosyal Medya → Web Trafik Köprüsü
- Caption/CTA üretici (n8n "Execute Command" node'una takılır, çıktı temiz JSON):
```bash
python scripts/social_caption_generator.py --topic "Kaş'ta gece dalışı" --platform reels --lang tr
```
  Sıralama: lokal Ollama → Groq → offline şablon (pipeline asla durmaz).
  Her caption'a günlük rotasyonla "ScuPlan.com (Link Bio'da)" CTA'sı eklenir.
- Link-in-Bio sayfası: `scuplan.com/bio` — `bio.scuplan.com` CNAME'i siteye yönlendirin,
  uygulama subdomain'i otomatik `/bio`'ya yönlendirir. Instagram/TikTok/YouTube bio
  linki olarak `bio.scuplan.com` kullanın.

### 5. Sıfır Maliyetli Büyüme Katmanı (ai-dev-toolkit'ten ilhamla)
Hiçbiri yeni servis/abonelik gerektirmez; hepsi mevcut VPS + ücretsiz API'lerle çalışır.

- **Affiliate tıklama takibi (Umami benzeri, self-hosted):** Tüm affiliate linkleri
  `/go/<hedef>` üzerinden geçer → DB'ye loglanır (ad-blocker'a takılmaz) → rapor:
  `GET /api/affiliate/stats` (all-time + son 30 gün, hedef bazında).
- **Dinamik sitemap:** `/sitemap.xml` artık DB'den canlı üretiliyor — AI ajanının
  yayınladığı her makale otomatik indekse girer (robots.txt güncellendi).
- **RSS köprüsü:** `/feed.xml` — n8n'e bir "RSS Feed Trigger" node'u ekleyin;
  her yeni blog makalesi otomatik sosyal medya postuna dönüşür (içerik döngüsü kapanır).
- **IndexNow:** `.env`'e `INDEXNOW_KEY` ekleyin (`python -c "import secrets; print(secrets.token_hex(16))"`),
  blog ajanı her yayında Bing/Yandex'e ücretsiz anında indeksleme pingi atar
  (`/indexnow.txt` route'u anahtarı doğrular).
- **Blog → Shorts senaryosu (MoneyPrinterTurbo yaklaşımı):**
  ```bash
  python scripts/blog_to_shorts.py --lang tr   # son makaleyi 30-45sn video senaryosuna çevirir
  ```
  Çıktı JSON'u n8n + Higgsfield hattına verin: hook, sahne sahne görsel yönergesi,
  seslendirme metni ve CTA'lı caption hazır gelir. Zincir: Ollama → Groq → offline şablon.
