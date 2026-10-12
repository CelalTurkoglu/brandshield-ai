# BrandShield AI — Productization Checklist

- [x] Root landing page modern editorial SaaS olarak çalışıyor; `/app` operasyon dashboard’una CTA ile geçiyor.
- [x] 7/30/90 tarih filtresi gerçek review tarihlerini parse edip radar/istatistik/feed’i yeniden hesaplıyor.
- [x] Apify Maps importu redirect çözümleme yapıyor, yorumları tarihe göre sıralıyor ve en güncel 100 kayıtla sınırlıyor.
- [x] İşletme adı `maps.app.goo.gl` veya host adı yerine çözülmüş Maps/Actor metadata’sından gösteriliyor; gerçek testte Yellowstone National Park doğrulandı.
- [x] Yanıt üretimi Türkçe yorumda Türkçe, İngilizce yorumda İngilizce çalışıyor; API smoke testi `tr` + `en` döndürüyor.
- [x] Negatif yorumların tümü için bulk reply üretimi, toplu kopyalama ve queue aksiyonu var.
- [x] Business profili Maps olmadan oluşturulabiliyor; Maps, Şikayetvar, Instagram ve website linkleri ayrı saklanıyor.
- [x] Managed MySQL schema, migration, users/businesses/reviews persistence ve API rotaları hazır; migration başarıyla çalıştı.
- [x] Manus OAuth kaldırıldı; BrandShield email/şifre kayıt-giriş, scrypt hash, HttpOnly `brandshield_session` ve logout akışı çalışıyor.
- [x] TR/EN ürün dili korunuyor; landing ve dashboard aynı sakin operasyonel marka tonunda.
- [x] `pnpm typecheck`, `pnpm build`, API smoke testleri ve browser UI testi yeşil; duplicate kaynak kopyaları temizlendi.

## Yayınlama kararı

İlk production yayın için bu proje Manus Webdev managed Publish/Deploy akışında tutulacak. Managed MySQL ve server runtime aynı proje içinde kalır; custom domain daha sonra public deployment’a bağlanır. Vercel, repository bağımsızlaştırılmak istenirse alternatif olarak belgelenmiştir.

## Bilinçli dış kanal sınırı

Bulk “Approve & queue all” BrandShield içindeki taslakları bağlı kanal kuyruğuna alır. Google Business Profile’a gerçekten yayınlamak için ayrıca Google Business Profile OAuth/scope bağlantısı gerekir; bu bağlantı olmadan ürün dış servise gönderim olmuş gibi davranmaz.
