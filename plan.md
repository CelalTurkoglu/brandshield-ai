# BrandShield AI — Ürünleşme Planı

## Ürün yönü
BrandShield, yerel işletmelerin Google Maps, Şikayetvar ve sosyal kanallardaki müşteri geri bildirimini tek bir operasyon merkezinde toplayan; kritik sinyali tespit eden, yorum dilinde yanıt hazırlayan ve kanıtı kampanyaya dönüştüren müşteri operasyonları ürünüdür.

## Bu fazın teslim kapsamı
- Root route gerçek ürün landing page; `/app` operasyon dashboard’u.
- Dashboard’da TR/EN dil geçişi, çalışan 7/30/90 gün filtresi ve gerçek tarih aralığına göre yeniden hesaplanan radar.
- Apify Google Maps importu: kısa link çözümleme, işletme adını gerçek Maps URL’sinden/Actor verisinden alma, en güncel 100 yorumu indirme ve sıralama.
- Yorum diline göre Türkçe/İngilizce akıllı yanıt.
- Negatif yorumların tamamı için tek tıkla toplu yanıt taslakları, kopyalama ve bağlı kanal kuyruğuna alma; gerçek Google Business Profile gönderimi OAuth bağlantısı eklenene kadar dürüstçe kuyruk durumu olarak gösterilir.
- Managed MySQL ile local kullanıcı, işletme, platform linkleri ve review importlarının kalıcı saklanması; auth e-posta/şifre + scrypt hash + HttpOnly JWT cookie ile çalışır.
- İşletme yönetimi: işletmeyi Maps dışında doğrudan ekleme; Google Maps, Şikayetvar, Instagram ve website linklerini ayrı alanlarda saklama; işletme seçip Maps importunu başlatma.
- Landing page: teknik AI gösterisi yerine güven, operasyon, geri kazanım ve somut çıktı odaklı editoryal SaaS tasarımı.

## Uygulama mimarisi
- `app/page.tsx`: public landing page.
- `app/app/page.tsx`: dashboard giriş noktası.
- `components/brandshield-dashboard.tsx`: review operations workspace; period filtering, bulk replies and BusinessHub integration.
- `components/brandshield-landing.tsx`: public acquisition page.
- `components/business-hub.tsx`: business CRUD and platform links UI.
- `lib/types.ts`: Review, Business, BrandCase and API contracts.
- `lib/reviews.ts`: date parsing, period filtering, language detection and latest-review sorting.
- `lib/db.ts`: lazy MySQL pool, schema helpers and user/business/review persistence.
- `db/schema.sql` + `scripts/migrate.mjs`: additive deterministic schema migration.
- `app/api/businesses/*`: business list/create/update and review import persistence.
- `app/api/replies/bulk`: bulk negative-review reply generation.
- `app/api/reviews/scrape`: Apify import with source URL resolution and 100-review cap.

## Tasarım sistemi
- **Design movement:** editorial operations console; sakin, güven veren B2B SaaS.
- **Core principles:** evidence before automation, readable hierarchy, low-noise controls, reversible actions.
- **Color philosophy:** deep ink/navy for trust, blue as operational focus, amber/rose only for attention states, mint for proof/recovery.
- **Layout paradigm:** landing uses left-aligned editorial narrative with proof strip; dashboard keeps asymmetric operational panels instead of centered AI cards.
- **Signature elements:** source status line, review signal chips, restrained border surfaces.
- **Interaction:** every automation shows its source, language, channel and next action; no button pretends to publish externally without a connected channel.
- **Animation:** short 160ms transitions only; no ambient AI shimmer.
- **Typography:** system sans stack with compact uppercase metadata and readable sentence-case body copy.
- **Brand essence:** review operations for teams who want fewer surprises and more repeat customers; clear, accountable, practical.
- **Brand voice:** “Spot the signal before it becomes a story.” / “Fix the detail. Keep the customer.”
- **Wordmark:** compact shield/check mark paired with BrandShield wordmark; use the mark as a small operational status symbol rather than a decorative AI orb.
- **Signature color:** calm operational blue `#4f8ce8`.

## Veri ve güvenlik kararları
- Managed MySQL development ve production’da ortak olduğu için migration yalnızca `CREATE TABLE IF NOT EXISTS` ve additive index/column kullanır.
- Local auth identity `openId` business ownership anahtarıdır; `local_<uuid>` kullanılır, raw şifre DB’ye yazılmaz ve yalnızca scrypt hash saklanır.
- Apify/FAL/API secrets yalnızca server runtime’da tutulur.
- Google Business Profile gerçek gönderimi, bağlantı/OAuth scope’u olmadan simüle edilmez; UI bulk işi `queued` olarak gösterir.
- Review importları işletme bazında upsert edilir, son 100 yorum ve seçili zaman filtresi dashboard’da kullanılır.
