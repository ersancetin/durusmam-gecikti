-- Duruşma gecikme bildirimleri.
-- Veri minimizasyonu: IP, çerez, tarayıcı bilgisi, dosya/esas numarası, isim, tam tarih
-- ve dakikalı saat SAKLANMAZ. Yalnızca raporlama için gereken alanlar tutulur.
CREATE TABLE IF NOT EXISTS bildirimler (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ay            TEXT    NOT NULL,              -- duruşmanın ayı, YYYY-MM
  il            TEXT    NOT NULL,
  adliye        TEXT    NOT NULL,
  mahkeme_turu  TEXT    NOT NULL,
  mahkeme_no    INTEGER NOT NULL DEFAULT 0,    -- 0 = numarasız / tek mahkeme
  saat_dilimi   INTEGER NOT NULL,              -- duruşma saatinin yalnızca saati (9 => 09:00-09:59)
  gecikme_dk    INTEGER NOT NULL CHECK (gecikme_dk BETWEEN 0 AND 600)
);

CREATE INDEX IF NOT EXISTS idx_bildirimler_ay ON bildirimler (ay);
