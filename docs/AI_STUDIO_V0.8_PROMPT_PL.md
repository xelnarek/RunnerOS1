# Prompt Google AI Studio – RunnerOS V0.8

Pracuj na istniejącym projekcie. Nie twórz nowej aplikacji od zera.

## Cel
Doprowadź natywny Android GPS do stanu produkcyjnego i nie psuj PWA.

## Android
- FusedLocationProviderClient + PRIORITY_HIGH_ACCURACY;
- foreground service typu location;
- START tylko z widocznego ekranu treningu;
- obsłuż brak uprawnień i wyłączone usługi lokalizacji;
- buforuj punkty po stronie Androida;
- po odtworzeniu WebView scal bufor bez duplikatów;
- zero syntetycznych punktów GPS.

## UI
- premium dark, czytelne podczas ruchu;
- minimalna liczba ozdobników;
- hierarchia informacji ważniejsza od efektów.

## Weryfikacja
- uruchom `npm run build`;
- uruchom `npm test`;
- jeżeli SDK Android jest dostępne, uruchom build Gradle;
- raportuj błędy zamiast usuwać funkcje;
- podaj kryteria testu fizycznego na Androidzie.
