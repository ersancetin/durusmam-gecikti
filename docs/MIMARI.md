# Mimari ve hukuki uyum notları

> Bu not teknik tasarım kararlarının hukuki gerekçesini özetler; bağlayıcı bir hukuki görüş
> değildir. Yayın öncesinde inisiyatifin kendi hukukçularınca gözden geçirilmesi önerilir.

## 1. Temel ilke: kişisel veri hiç oluşturmamak

En güvenli kişisel veri, hiç toplanmayan veridir. Sistem baştan **anonim veri** üretecek şekilde
kurgulandı; böylece 6698 sayılı KVKK yükümlülüklerinin çoğu doğmaz ve olası bir veri ihlalinde
ifşa edilebilecek bir kişi bilgisi bulunmaz.

| Veri | Durum | Gerekçe |
|---|---|---|
| Ad, e-posta, telefon, baro sicil no | **Toplanmaz** | Bildirenin kimliği raporlama için gereksiz. |
| IP adresi, User-Agent, çerez | **Saklanmaz** | Fonksiyon bu başlıkları hiç okumaz; Turnstile doğrulamasına da `remoteip` gönderilmez. |
| Dosya / esas no, taraf, hâkim adı | **Alan yok** | Davayı ve dolayısıyla bildireni tanımlanabilir kılar. |
| Serbest metin | **Alan yok** | Yanlışlıkla kişisel veri girilmesini ve 5651 kapsamında “içerik” barındırmayı önler. |
| Tam tarih, dakikalı saat | **İşlenip atılır** | Mahkeme + tarih + saat, UYAP duruşma listeleriyle eşleştirilip davayı bulmaya yarayabilir. Sadece gecikme hesabında kullanılır. |
| Ay, il, adliye, mahkeme, saat dilimi, gecikme (dk) | **Saklanır** | Rapor için gereken asgari veri. |

Zaman damgası (`created_at`) da bilinçli olarak tutulmaz: kayıt anı ile Cloudflare'in kendi
erişim kayıtları eşleştirilerek bildirenin tespit edilmesi bu şekilde engellenir.

## 2. KVKK değerlendirmesi

- **Saklanan veri kümesi**: Kimliği belirli veya belirlenebilir bir gerçek kişiyle
  ilişkilendirilemediği için kişisel veri niteliği taşımaması hedeflenir (KVKK m.3/1-d).
  Ayrıca istatistik amaçlı anonim işleme KVKK m.28/1-(b) kapsamındadır.
- **Mahkeme bazında yayın**: Tek hâkimli bir mahkemenin gecikme istatistiği dolaylı olarak o
  hâkimle ilişkilendirilebilir. Bu nedenle: (i) hâkim adı hiçbir yerde yer almaz, (ii) yayın
  yalnızca toplulaştırılmış ve **en az 3 bildirimli** gruplar için yapılır, (iii) metinlerde sorun
  kişisel kusur olarak değil yargının iş yükü ve planlama sorunu olarak çerçevelenir. Kamu
  hizmetinin işleyişine dair bu tür bir değerlendirme, ifade özgürlüğü kapsamındaki işleme
  istisnasına (KVKK m.28/1-c) da dayanabilir.
- **Altyapı sağlayıcısı (Cloudflare)**: Her web sitesinde olduğu gibi bağlantı ve bot
  koruması için ziyaretçi IP'si Cloudflare tarafından anlık işlenir. Bu, inisiyatif açısından
  yurt dışındaki bir veri işleyene aktarım sorusu doğurabilir (KVKK m.9, 7499 sayılı Kanun
  değişikliği sonrası standart sözleşme rejimi). Öneriler:
  - Cloudflare'in veri işleme ekini (DPA) kabul edin; gerekiyorsa Kurul'un standart sözleşmesini
    imzalayıp süresi içinde Kurul'a bildirin.
  - `hakkinda.html` içindeki aydınlatma notunu veri sorumlusunun (dernek / girişim) tam unvanı
    ve iletişim adresiyle tamamlayın.
  - Cloudflare Web Analytics, Logpush vb. ek kayıt özelliklerini **açmayın**.
- **VERBİS**: Saklanan veri anonim olduğundan bu sistem tek başına kayıt yükümlülüğü
  doğurmaz; ancak inisiyatifin tüzel kişiliği (dernek vb.) için genel muafiyet koşulları ayrıca
  kontrol edilmelidir.

## 3. 5651 sayılı Kanun

Site, kullanıcıların serbest içerik yayımladığı bir platform değildir: girdiler kapalı
listelerden seçilen yapısal değerlerdir ve kamuya yalnızca inisiyatifin kendi ürettiği
toplulaştırılmış rapor sunulur. Bu yapıyla inisiyatif “içerik sağlayıcı”, Cloudflare ise
“yer sağlayıcı” konumundadır; trafik kaydı tutma yükümlülüğü yer sağlayıcıya aittir.
Serbest metin, yorum veya dosya yükleme alanı eklenirse bu değerlendirme yeniden yapılmalıdır.

## 4. Yayın dili ve sorumluluk

- Raporlarda “X mahkemesi şu kadar geç başladı (bildirimlere göre)” gibi nötr, ölçülebilir ifadeler
  kullanılmalı; kurumları aşağılayıcı sıfatlardan kaçınılmalıdır.
- Her rapor “beyana dayalı, doğrulanmamış veriler” uyarısını taşır (site alt bilgisinde mevcut).
- Medyan kullanımı ve asgari bildirim eşiği, tek kişinin uydurma bildirimlerle bir mahkemeyi
  listeye taşımasını zorlaştırır.

## 5. Kötüye kullanıma karşı önlemler (kimlik toplamadan)

| Risk | Önlem |
|---|---|
| Bot / toplu sahte bildirim | Cloudflare Turnstile (görünmez doğrulama) |
| Aynı kişiden seri gönderim | Cloudflare WAF hız sınırı kuralı (sayaç Cloudflare kenarında, bizde IP yok) |
| Tek bildirimle mahkeme teşhiri | Gruplar ancak ≥ 3 bildirimle yayımlanır |
| Uç / hatalı değerler | Medyan sıralaması; 0–600 dk sınırı; erken başlama 0 sayılır |
| Geçmişe dönük manipülasyon | Yalnızca son 7 günün duruşması bildirilebilir; ay kapandıktan sonra rapor arşivlenir |
| Kod enjeksiyonu / XSS | Kapalı listeler + regex doğrulama, parametreli SQL, `textContent` ile çizim, katı CSP |

## 6. Neden bu mimari?

- **Cloudflare Pages + Functions + D1**: Alan adı zaten Cloudflare'de olacağı için ek sunucu,
  bakım veya ücret yoktur. Ücretsiz katman (günde 100.000 Functions isteği, 5 GB D1) bu ölçek
  için fazlasıyla yeterlidir.
- **Framework yok**: Düz HTML/CSS/JS; derleme adımı yok, bağımlılık güncellemesi yok, gönüllü bir
  geliştiricinin dakikalar içinde anlayabileceği kadar küçük.
- **Font ve logo kendi sunucumuzda**: Google Fonts gibi üçüncü taraf istekleri ziyaretçi IP'sini
  başka şirketlere sızdırmasın diye Montserrat fontu siteyle birlikte sunulur.
- **Ayrı rapor üretim işi yok**: Rapor her istekte D1'den hesaplanır ve 5 dk (geçmiş aylar için
  1 saat) önbelleklenir. Kalıcı ve denetlenebilir kayıt için GitHub Actions her ayın 8'inde
  önceki ayı `arsiv/` klasörüne JSON + CSV olarak işler.

## 7. Sonraki adımlar için fikirler

- Adliye listesinin (özellikle ilçe adliyeleri) genişletilmesi: `public/assets/js/veri.js`.
- Rapor sayfasına “önceki aya göre değişim” sütunu.
- Ham satırların belirli bir süre sonra silinmesi (ör. 24 ay) — arşiv zaten özet veriyi korur.
