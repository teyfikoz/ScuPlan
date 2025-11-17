# ScuPlan - Setup ve Kullanım Kılavuzu

## 🚀 Localhost Kurulumu

### 1. Gereksinimler
- Python 3.11 veya üzeri
- pip (Python paket yöneticisi)

### 2. Kurulum Adımları

```bash
# 1. Proje dizinine gidin
cd /Users/teyfikoz/Downloads/ScuplanDive-2

# 2. Virtual environment oluşturun (zaten oluşturuldu)
python3 -m venv venv

# 3. Virtual environment'ı aktive edin
source venv/bin/activate

# 4. Bağımlılıkları yükleyin
pip install -r requirements.txt

# 5. Uygulamayı başlatın
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

### Google AdSense Entegrasyonu

1. **AdSense Ayarları**
   - White Label Admin sayfasına gidin: http://127.0.0.1:5001/admin/whitelabel
   - "Monetization" bölümünde AdSense ayarlarını yapın:
     - ✅ "Enable Google AdSense" seçeneğini işaretleyin
     - AdSense Client ID'nizi girin (örn: `ca-pub-1234567890123456`)
     - Her reklam slotu için Slot ID'leri girin

2. **Reklam Konumları**
   - **Ana İçerik:** Her sayfanın içerik sonunda
   - **Footer:** Footer'dan hemen önce
   - **Sidebar:** (Gelecekte eklenecek)

3. **AdSense Hesabı Alma**
   - Google AdSense'e kaydolun: https://www.google.com/adsense
   - Web sitenizi ekleyin ve onay alın
   - Publisher ID ve Ad Slot ID'lerini alın
   - White Label Admin'den bu bilgileri girin

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
- [x] Head'de AdSense script yükleniyor
- [x] Ana içerik reklamı eklendi
- [x] Footer reklamı eklendi
- [x] White Label Admin'den kontrol edilebilir
- [x] Açma/kapama özelliği çalışıyor

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
