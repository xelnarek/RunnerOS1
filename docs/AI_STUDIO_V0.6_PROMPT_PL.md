# AI Studio prompt - RunnerOS V0.6

Pracujesz na istniejącym repozytorium RunnerOS. Nie przepisuj projektu od zera.

Cel V0.6:
1. Podłącz prawdziwy Android GPS przez Capacitor + FusedLocationProviderClient.
2. Zaimplementuj `NativeLocationBridge` tak, aby emitował wyłącznie prawdziwe `Location`.
3. Dodaj runtime permissions FINE/COARSE LOCATION oraz zgodne uruchamianie location foreground service.
4. Dodaj trwałe powiadomienie aktywnego treningu.
5. Zachowaj możliwość działania offline.
6. Nie generuj syntetycznych punktów GPS w produkcyjnym kodzie.
7. Dodaj testy dla: accuracy rejection, stale sample, impossible jump, pause/resume i restart session.
8. Uruchom `npm test` i `npm run build`; jeśli środowisko blokuje instalację, pokaż dokładny błąd zamiast obchodzić go usuwaniem funkcji.
9. Przygotuj instrukcję testu na fizycznym telefonie: ekran wygaszony, aplikacja w kieszeni, 30-60 min biegu, porównanie dystansu i śladu.
10. Nie zmieniaj identyfikacji RunnerOS ani nie dodawaj atrap funkcji tylko po to, aby testy przechodziły.
