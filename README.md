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

Local auth için `BRANDSHIELD_JWT_SECRET` gerekir. `DATABASE_URL` managed database runtime’ından gelir; bu iki değişken yayın ortamında birlikte tanımlı olmalıdır.

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

Bu proje Manus Webdev managed web projesi olarak başlatıldı. İlk yayın için önerilen yer Manus Webdev’in kendi **Publish/Deploy** akışıdır; mevcut managed MySQL, runtime env ve preview/public domain aynı proje üzerinden taşınır. Yayın sırasında `APIFY_API_TOKEN`, `APIFY_REVIEW_ACTOR_ID`, `FAL_KEY`, `FAL_MODEL`, `BRANDSHIELD_JWT_SECRET` ve managed `DATABASE_URL` değerlerini production runtime’a bağlayın. Ayrı bir domain istendiğinde yayın sonrası custom domain’i bu public deployment’a bağlayın.

Alternatif olarak Vercel üzerinde de çalışır: repository’yi bağlayın, build komutu `pnpm build`, output ayarı Next.js default, Node runtime server routes için aktif olmalı ve aynı env değişkenlerini ekleyin. Managed MySQL bağlantısını Vercel production’dan erişilebilir tutun; local `.env` secret’larını GitHub’a göndermeyin.

The review period control recalculates the radar, counts and feed from parsed review dates for 7, 30 or 90 days. Apify imports request and sort the latest 100 reviews. Maps short links are resolved before scraping and the source name is taken from the resolved place URL or Actor metadata.

Negative reviews can be handled one at a time or through the bulk reply panel. Each draft is generated in Turkish or English based on the review language. “Approve & queue all” prepares the batch for the connected review channel; real Google Business Profile publishing still requires a separate Business Profile OAuth connection and is not falsely simulated.

The additive schema lives in `db/schema.sql`; run `pnpm db:migrate` after database enablement or when applying a new additive schema revision. Development and published runtime share the managed database, so destructive test migrations are not used.
