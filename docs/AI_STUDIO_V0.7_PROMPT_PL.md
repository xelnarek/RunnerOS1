# Prompt do Google AI Studio — RunnerOS V0.7

Jesteś głównym inżynierem aplikacji RunnerOS. Otrzymujesz istniejący projekt V0.7. NIE twórz nowej aplikacji od zera i NIE usuwaj istniejących funkcji.

Cel: doprowadzić Android GPS do rzeczywistego działania na urządzeniu.

Wymagania:
1. Zachowaj PWA jako główny UI.
2. Na Androidzie używaj pluginu `RunnerOSLocation` oraz `RunnerLocationService`.
3. Nie dodawaj mock GPS ani generatorów pozycji.
4. Przetwarzaj tylko prawdziwe `android.location.Location`.
5. Obsłuż runtime permissions dla FINE/COARSE LOCATION.
6. Start foreground service typu `location` wykonuj z aktywnego UI.
7. Nie zgub aktywnego treningu po wygaszeniu ekranu.
8. Zachowaj natywny bufor punktów i odzyskiwanie po powrocie WebView.
9. Dodaj testy deduplikacji, kolejności timestampów i odzyskiwania bufora.
10. Uruchom `npm run build` i `npm run test`.
11. Jeśli Android SDK nie jest dostępne, nie udawaj builda. Rozdziel „sprawdzone w kodzie” i „wymaga urządzenia”.
12. Nie usuwaj funkcji tylko po to, aby kompilacja przeszła.
13. Raportuj wszystkie zmiany plików.

Kryterium sukcesu:
START BIEGU → FusedLocationProvider → punkty GPS → Activity Engine; wygaszenie ekranu nie zatrzymuje pomiaru; STOP kończy foreground service; aplikacja nie zgłasza działającego GPS bez uruchomionego providera.
