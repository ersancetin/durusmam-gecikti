// Ortak sabit veriler: hem tarayıcı (form) hem sunucu (doğrulama) bu dosyayı kullanır.

export const ILLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
  "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
  "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
  "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis",
  "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
  "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
  "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

// Birden fazla büyük adliyesi olan iller. Listede olmayan illerde varsayılan,
// il adıyla anılan merkez adliyedir; ilçe adliyeleri "Diğer" ile serbest girilir.
export const ADLIYELER = {
  "İstanbul": [
    "İstanbul (Çağlayan)", "İstanbul Anadolu (Kartal)", "Bakırköy", "Küçükçekmece",
    "Büyükçekmece", "Gaziosmanpaşa", "Silivri", "Çatalca", "Şile",
  ],
  "Ankara": ["Ankara (Sıhhiye)", "Ankara Batı (Sincan)"],
};

export function adliyeListesi(il) {
  return ADLIYELER[il] || [`${il} (Merkez)`];
}

export const MAHKEME_TURLERI = [
  "Asliye Hukuk Mahkemesi",
  "Asliye Ticaret Mahkemesi",
  "Sulh Hukuk Mahkemesi",
  "İş Mahkemesi",
  "Aile Mahkemesi",
  "Tüketici Mahkemesi",
  "Kadastro Mahkemesi",
  "Fikri ve Sınai Haklar Hukuk Mahkemesi",
  "İcra Hukuk Mahkemesi",
  "İcra Ceza Mahkemesi",
  "Asliye Ceza Mahkemesi",
  "Ağır Ceza Mahkemesi",
  "Çocuk Mahkemesi",
  "Çocuk Ağır Ceza Mahkemesi",
  "Fikri ve Sınai Haklar Ceza Mahkemesi",
  "Sulh Ceza Hakimliği",
  "İdare Mahkemesi",
  "Vergi Mahkemesi",
];

// Raporlarda bir mahkemenin (veya ilin / türün) görünmesi için gereken asgari bildirim.
// Tek bir kişinin bildirimiyle bir mahkemenin "teşhir" edilmesini önler.
export const ASGARI_BILDIRIM = 3;

// Bildirim yalnızca son N gün içindeki duruşmalar için kabul edilir.
export const KABUL_PENCERESI_GUN = 7;

// Bu sürenin üstündeki gecikmeler hatalı giriş kabul edilip reddedilir.
export const AZAMI_GECIKME_DK = 600;

export const ADLIYE_SERBEST_DESEN = /^[A-Za-zÇĞİÖŞÜçğıöşü .'-]{2,40}$/;

// Türkiye saatine göre bugünün tarihi (YYYY-MM-DD).
export function bugunTR(simdi = new Date()) {
  return new Date(simdi.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export function gunEkle(tarih, gun) {
  const d = new Date(`${tarih}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
}

export function mahkemeAdi(tur, no) {
  return no > 0 ? `${no}. ${tur}` : tur;
}
