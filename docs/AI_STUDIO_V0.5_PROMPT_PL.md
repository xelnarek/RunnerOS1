# Prompt dla Google AI Studio - RunnerOS V0.5

Rozwijaj ISTNIEJĄCY projekt RunnerOS. Nie twórz nowej aplikacji od zera. Zachowaj działające funkcje i obecny podział na core/features.

## Cel
1. Utrzymać premium UI z czytelnym hierarchy.
2. Podłączyć Capacitor Android.
3. Zaimplementować rzeczywisty Foreground Location Service.
4. Wstrzyknąć punkty GPS do istniejącego `NativeLocationBridge`.
5. Nie przenosić logiki kalkulacji dystansu do Androida. Activity Engine pozostaje wspólny.

## Krytyczne wymagania
- Build musi przejść bez błędów.
- Uruchom testy.
- Nie usuwaj funkcji w celu naprawy buildu.
- Przy błędzie pokaż plik, linię i przyczynę.
- Zachowaj offline-first.
- Nie dodawaj ciężkich bibliotek bez uzasadnienia.
- Nie kopiuj logotypu, brandingu ani chronionych grafik Stravy.

## UI
Zachowaj: ciemny premium, wysoki kontrast, dużo oddechu, duży główny KPI, jednoznaczny przycisk START, dolna nawigacja, subtelny accent. Nie przeładowuj ekranów.
