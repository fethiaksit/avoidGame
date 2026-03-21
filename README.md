# avoid (Expo + React Native)

`avoid`, iOS ve Android için geliştirilmiş frontend-only bir 2D endless survival / dodge oyunu MVP'sidir.

## Özellikler
- Expo + React Native + TypeScript
- `@shopify/react-native-skia` ile 2D çizim
- `react-native-reanimated` ile frame bazlı game loop tetikleme
- `react-native-gesture-handler` ile yatay sürükleme kontrolü
- `AsyncStorage` ile local high score saklama
- Oyun state yapısı: `menu`, `playing`, `gameOver`
- Kademeli zorluk artışı + zaman bazlı skor
- Pause/Resume butonu

## Kurulum
```bash
npm install
```

## Çalıştırma
```bash
npm run start
```

Ardından Expo arayüzünden:
- Android emülatör: `a`
- iOS simülatör (macOS): `i`
- QR ile gerçek cihaz

Opsiyonel native run komutları:
```bash
npm run android
npm run ios
```

## Proje yapısı
- `App.tsx`: Uygulama state yönetimi ve ekranlar arası akış.
- `src/screens/MenuScreen.tsx`: Ana menü ekranı.
- `src/screens/GameScreen.tsx`: Aktif oyun ekranı wrapper'ı.
- `src/screens/GameOverScreen.tsx`: Oyun sonu ekranı.
- `src/game/GameLoop.tsx`: Frame update, spawn, hareket, çarpışma ve skor akışı.
- `src/game/collision.ts`: Çarpışma yardımcıları.
- `src/game/scoreManager.ts`: Skor ve zorluk hesaplama.
- `src/game/obstacleManager.ts`: Engel üretimi ve güncelleme.
- `src/components/Player.tsx`: Skia oyuncu çizimi.
- `src/components/Obstacle.tsx`: Skia engel çizimi.
- `src/storage/highScore.ts`: High score local storage yardımcıları.
- `src/types/game.ts`: Oyun tipleri.

## Notlar
- Oyun tamamen local çalışır, backend / auth / online leaderboard içermez.
- İlk sürümde reklam, market, skin, görev, ses sistemi yoktur.
