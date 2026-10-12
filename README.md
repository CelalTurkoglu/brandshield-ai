# BrandShield AI

BrandShield AI, müşteri yorumlarını operasyonel aksiyona, empatik kurtarma yanıtına ve yayınlanabilir sosyal kanıta dönüştüren Next.js uygulamasıdır.

## Çalıştırma

```bash
pnpm install
pnpm dev -- --hostname 127.0.0.1 --port 5173
```

## Kullanıcı deneyimi

- Dashboard üstünden **EN / TR** dil seçimi yapılabilir; tercih tarayıcıda saklanır.
- Profil düğmesi BrandShield’ın kendi **e-posta/şifre hesabı** akışına bağlanır. Kullanıcı hesabı managed MySQL’de tutulur; session `brandshield_session` HttpOnly cookie ile sunucu tarafında doğrulanır.
- Bildirim paneli, zaman aralığı menüsü ve mobil navigasyon çalışır durumdadır.
- Profil paneli; kullanıcı adı, e-posta, workspace bilgisi ve çıkış aksiyonunu gösterir.

## Demo modu

Dashboard’daki **Trendy Coffee Shop** veya **DTC Skincare Brand** düğmesi, dış servis olmadan güvenilir mock veri yükler. Boş URL, hız limiti veya sağlayıcı hatası da otomatik olarak demo fallback’ine düşer. Kaynak durumu, anahtarlar gerçekten mevcut değilse **Demo mode** olarak gösterilir; yanıltıcı bir “connected” etiketi kullanılmaz.

## Gerçek entegrasyonlar

Yalnızca sunucu ortamında ayarlayın:

| Değişken | Amaç |
| --- | --- |
| `APIFY_API_TOKEN` | Apify API kimlik doğrulaması |
| `APIFY_REVIEW_ACTOR_ID` | Google Maps/e-ticaret review Actor kimliği; Google Maps için `compass/google-maps-reviews-scraper` |
| `FAL_KEY` | fal.ai yaratıcı üretim anahtarı |
| `FAL_MODEL` | Opsiyonel fal.ai model kimliği |

Local auth oturumları `BRANDSHIELD_JWT_SECRET` ile imzalanır; bu değişken yoksa yayın platformunun sağladığı özel `MANUS_JWT_SECRET` imzalama anahtarı olarak kullanılır (Manus ile giriş yapılmaz, yalnızca HMAC anahtarıdır). `DATABASE_URL` managed database runtime’ından gelir. `APIFY_REVIEW_ACTOR_ID` boşsa varsayılan `compass/google-maps-reviews-scraper` kullanılır.

Bir anahtar eksik veya sağlayıcı yanıt vermiyorsa uygulama aynı UX sözleşmesiyle demo fallback’ine döner.

Gerçek anahtarlar proje kökündeki `.env` dosyasına yazıldı ve `.env` git dışındadır; anahtarları chat’e, GitHub’a veya browser bundle’ına koymayın. Managed MySQL `DATABASE_URL` değeri platform runtime’ından gelir.

## API rotaları

- `POST /api/reviews/scrape`
- `POST /api/insights`
- `POST /api/replies`
- `POST /api/creative`
- `GET /api/status`
- `GET/POST /api/businesses`
- `PATCH/DELETE /api/businesses/:id`
- `POST /api/replies/bulk`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Server action eşdeğerleri `app/actions.ts` içinde bulunur.

## Productized workspace

The public acquisition page is available at `/`; the operational workspace is at `/app`. Teams can create a BrandShield account with email and password, add a business directly, save Google Maps, Şikayetvar, Instagram and website links, then run a Maps import from the business card. Business records and imported reviews are stored in managed MySQL after local account login.

## Yayınlama

Canlı adres: https://brandshield-gkiv9g4y.manus.space — Manus Webdev managed hosting (Docker container, health path `/api/status`, managed MySQL).

Production’da Apify ve fal.ai anahtarları iki yoldan okunur (sırasıyla):

1. **Ortam değişkeni** — Manus projesinin Secrets ekranındaki `APIFY_API_TOKEN`, `FAL_KEY`, `FAL_MODEL`.
2. **Sunucu tarafı ayar tablosu** — managed veritabanındaki `brandshield_settings`. Yerel `.env` değerlerini buraya aktarmak için `pnpm db:migrate && pnpm integrations:sync` çalıştırın; betik değerleri yazdırmaz, yalnızca uzunluklarını gösterir.

Anahtarlar hiçbir zaman Git’e, Docker imajına veya tarayıcıya gitmez; `/api/status` yalnızca `true/false` döndürür. Anahtar değiştiğinde `pnpm integrations:sync` komutunu yeniden çalıştırmanız yeterli; sunucu yeni değeri en geç 60 saniye içinde okur, yeniden yayın gerekmez.

Dockerfile çalışma dizini bilinçli olarak `/srv/brandshield`’dır: proje `app/app/page.tsx` (`/app` rotası) içerdiği için `WORKDIR /app` kullanıldığında iç içe `/app/app/app` yolları oluşur ve kök sayfa yanlış modülle derlenebilir.

**Türkiye erişim notu:** Bazı Türk internet sağlayıcıları `*.manus.space` alan adını TLS/SNI seviyesinde filtreleyebiliyor (alan adı daha önce USOM kararıyla engellenmişti). Site başka ağlardan açılsa bile bu ağlarda zaman aşımı görülür. Kalıcı çözüm, deployment’a kendi alan adınızı (ör. `app.brandshield.com.tr`) Manus Custom Domains ile bağlamaktır.
