# 4SL4N Studio — site (yayın deposu)

Bu depo, stüdyonun **herkese açık** sitesidir: kök adres vitrin, her uygulama
kendi alt dizininde (`/<slug>/`) durur. Dosyalar **üretilmiştir**; elle
düzenlemeyin — bir sonraki yayında üzerine yazılır.

- Vitrin: `/`
- Uygulama sayfaları: \`/tesbihat/\` \`/last-stand/\` 
- APK'lar: Releases (varlık adları sabit; bağlantı sürümler arasında değişmez)
- `app-ads.txt`: alan adının **kökünde** olmak zorunda olduğu için burada
- `robots.txt`: yalnızca kökte okunur; alt dizinlerdeki kopyalar dikkate alınmaz
- `sitemap.xml`: sitemap **dizini**; kök sayfalar ve her uygulamanın sitemap'i

Yayımlama, kaynak depolardaki `scripts/siteyi_yayinla.sh` ile yapılır ve
vitrin ile tüm uygulama sayfaları **tek commit**'te gider.

Bu depo herkese açık olmak zorundadır: GitHub Pages ücretsiz planda yalnızca
public depolarda yayın yapar. Uygulamaların kaynak kodları ayrı **özel**
depolarda kalır; buraya yalnızca yayına çıkacak statik dosyalar gelir.
